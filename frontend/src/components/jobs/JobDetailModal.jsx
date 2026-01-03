import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, LightBulbIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

export default function JobDetailModal({ job, open, onClose }) {
    const { user, token } = useAuth();
    const [applying, setApplying] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const [simulationResult, setSimulationResult] = useState(null);
    const [selectedSkill, setSelectedSkill] = useState(job?.missing_skills?.[0] || '');
    const [step, setStep] = useState('initial'); // initial, upload, review, success
    const [resumeData, setResumeData] = useState(null);
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: '',
        experience_summary: '',
        detected_skills: []
    });

    // Reset state when job changes or modal is closed
    useEffect(() => {
        if (open && job) {
            setStep('initial');
            setResumeData(null);
            setSimulationResult(null);
            setSelectedSkill(job?.missing_skills?.[0] || '');
            setFormData({
                full_name: user?.full_name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                experience_summary: '',
                detected_skills: []
            });
        }
    }, [job?.job_id, job?._id, open, user]);

    // Reset states when job changes
    if (!job) return null;

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setApplying(true);
        const body = new FormData();
        body.append('resume', file);
        body.append('job_title', job.title);
        body.append('job_description', job.description || '');

        try {
            const res = await fetch(`/api/jobs/${job.job_id || job._id}/resume_match`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setResumeData(data);
            setFormData({
                ...formData,
                ...data.candidate_details
            });
            setStep('review');
        } catch (err) {
            alert("Error analyzing resume: " + err.message);
        } finally {
            setApplying(false);
        }
    };

    const handleApply = async () => {
        setApplying(true);
        try {
            const res = await fetch(`/api/jobs/${job.job_id || job._id}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    readiness_at_apply: job.readiness_score,
                    candidate_details: formData
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setStep('success');
        } catch (err) {
            alert(err.message);
        } finally {
            setApplying(false);
        }
    };

    const runSimulation = async () => {
        if (!selectedSkill) {
            console.log("Simulation aborted: No skill selected");
            return;
        }
        console.log("Starting simulation for skill:", selectedSkill);
        setSimulating(true);
        setSimulationResult(null);

        try {
            const payload = {
                profile: user,
                add_skill: { name: selectedSkill, proficiency: 'intermediate' },
                target_job_id: job.job_id || job._id,
                job: job // Send full job to support live/non-persisted jobs
            };
            console.log("Simulating with payload:", payload);

            const res = await fetch('/api/simulate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            console.log("Simulation response status:", res.status);
            const data = await res.json();
            console.log("Simulation response data:", data);

            if (data.error) {
                console.error("Simulation API Error:", data.error);
                alert(`Simulation failed: ${data.error}`);
                return;
            }

            setSimulationResult(data);
        } catch (err) {
            console.error("Simulation Network Error:", err);
            alert(`Simulation failed: ${err.message}`);
        } finally {
            console.log("Simulation finished");
            setSimulating(false);
        }
    };

    const badgeColor = job.category?.color || 'blue';
    const colorMap = {
        success: 'text-green-600 bg-green-50 ring-green-600/20',
        warning: 'text-yellow-600 bg-yellow-50 ring-yellow-600/20',
        danger: 'text-red-600 bg-red-50 ring-red-600/20',
        blue: 'text-blue-600 bg-blue-50 ring-blue-600/20'
    };
    const themeColor = colorMap[badgeColor] || colorMap.blue;

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-10 border border-gray-100">
                                <div className="absolute right-0 top-0 hidden pr-6 pt-6 sm:block">
                                    <button
                                        type="button"
                                        className="rounded-full bg-gray-50 text-gray-400 hover:text-gray-500 focus:outline-none p-2 hover:bg-gray-100 transition-colors"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Close</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Header */}
                                <div className="mb-8 border-b border-gray-100 pb-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 bg-lavender-50 rounded-2xl flex items-center justify-center text-lavender-600 font-bold text-2xl shadow-sm border border-lavender-100/50">
                                            {job.company?.[0]?.toUpperCase() || 'C'}
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-3xl font-bold leading-tight text-gray-900">
                                                {job.title}
                                            </Dialog.Title>
                                            <p className="text-sm font-medium text-gray-400 mt-1">
                                                {job.company} • {job.location}
                                            </p>
                                        </div>
                                    </div>
                                    {job.job_url && (
                                        <a
                                            href={job.job_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-black border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors inline-block"
                                        >
                                            Visit Job Page →
                                        </a>
                                    )}
                                </div>

                                {step === 'initial' && (
                                    <>
                                        {/* Readiness Score */}
                                        <div className={`rounded-2xl p-8 text-center mb-8 ${job.category?.color === 'success' ? 'bg-lime-50' : job.category?.color === 'danger' ? 'bg-red-50' : 'bg-yellow-50'} border ${job.category?.color === 'success' ? 'border-lime-100' : job.category?.color === 'danger' ? 'border-red-100' : 'border-yellow-100'}`}>
                                            <h4 className={`text-xs font-bold uppercase tracking-widest mb-2 ${job.category?.color === 'success' ? 'text-lime-700' : job.category?.color === 'danger' ? 'text-red-700' : 'text-yellow-700'}`}>
                                                {job.category?.message || 'Readiness Analysis'}
                                            </h4>
                                            <div className={`text-6xl font-black mb-2 ${job.category?.color === 'success' ? 'text-lime-600' : job.category?.color === 'danger' ? 'text-red-600' : 'text-yellow-600'}`}>
                                                {Math.round(job.readiness_score)}%
                                            </div>
                                            <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Match Score</div>

                                            {/* Breakdown Helper */}
                                            <div className="flex justify-center gap-10 mt-6 pt-6 border-t border-black/5">
                                                {job.readiness_breakdown?.breakdown.map((b, i) => (
                                                    <div key={i} className="text-center">
                                                        <div className="font-bold text-gray-900 text-lg">{b.value}%</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{b.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Skill Gaps */}
                                        <div className="mb-8">
                                            <h4 className="text-sm font-bold text-gray-900 mb-4">Skill Gap Analysis</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {job.required_skills?.map(skill => {
                                                    const isMissing = job.missing_skills?.includes(skill);
                                                    return isMissing ? (
                                                        <span key={skill} className="inline-flex items-center rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-red-600 ring-1 ring-inset ring-red-100 shadow-sm">
                                                            <XCircleIcon className="w-4 h-4 mr-1.5" /> {skill}
                                                        </span>
                                                    ) : (
                                                        <span key={skill} className="inline-flex items-center rounded-xl bg-lime-50 px-3 py-1.5 text-xs font-bold text-lime-700 ring-1 ring-inset ring-lime-200/50 shadow-sm">
                                                            <CheckCircleIcon className="w-4 h-4 mr-1.5" /> {skill}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* What-If Simulator */}
                                        {job.missing_skills?.length > 0 && (
                                            <div className="mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                                <div className="flex items-center mb-3">
                                                    <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
                                                    <h4 className="text-sm font-bold text-gray-900">What-If Simulator</h4>
                                                </div>
                                                <div className="flex gap-3 items-center">
                                                    <span className="text-sm font-medium text-gray-500">If I learn:</span>
                                                    <select
                                                        className="block w-full rounded-xl border-gray-200 py-2 pl-3 pr-10 text-gray-900 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6 font-medium"
                                                        value={selectedSkill}
                                                        onChange={(e) => setSelectedSkill(e.target.value)}
                                                    >
                                                        {job.missing_skills.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                    <button
                                                        onClick={runSimulation}
                                                        disabled={simulating}
                                                        className="rounded-xl bg-black px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-gray-800 whitespace-nowrap transition-all"
                                                    >
                                                        {simulating ? '...' : 'Simulate'}
                                                    </button>
                                                </div>

                                                {simulationResult && (
                                                    <div className="mt-4 flex items-center gap-4 bg-lime-50 p-4 rounded-xl border border-lime-100 text-lime-800">
                                                        <ChartBarIcon className="h-8 w-8 text-lime-600" />
                                                        <div>
                                                            <div className="text-xl font-black">+{simulationResult.improvement?.toFixed(1) || (simulationResult.projected_readiness - job.readiness_score).toFixed(1)}% Boost</div>
                                                            <div className="text-xs font-bold opacity-80">Projected Score: {simulationResult.projected_readiness}%</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row-reverse">
                                            <button
                                                type="button"
                                                className="flex-1 inline-flex justify-center rounded-2xl bg-[#8b5cf6] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#7c3aed] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all"
                                                onClick={() => setStep('upload')}
                                            >
                                                Apply Now
                                            </button>
                                            <button
                                                type="button"
                                                className="flex-1 inline-flex justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-900 shadow-none ring-1 ring-inset ring-gray-200 hover:bg-gray-50 transition-all"
                                                onClick={onClose}
                                            >
                                                Not Ready Yet
                                            </button>
                                        </div>
                                    </>
                                )}

                                {step === 'upload' && (
                                    <div className="py-12 text-center">
                                        <div className="mb-6">
                                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-lavender-100 mb-4">
                                                <XCircleIcon className="h-10 w-10 text-lavender-600 transform rotate-45" />
                                            </div>
                                            <h3 className="mt-2 text-xl font-bold text-gray-900">Upload Your Resume</h3>
                                            <p className="mt-2 text-sm text-gray-500 text-balance px-12">We'll analyze your resume against this job and help you autofill the application.</p>
                                        </div>
                                        <div className="mt-8">
                                            <label className="cursor-pointer inline-block">
                                                <span className="rounded-2xl bg-[#8b5cf6] px-8 py-4 text-sm font-bold text-white shadow-lg hover:bg-[#7c3aed] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all transform hover:scale-105">
                                                    {applying ? 'Analyzing...' : 'Choose File (PDF/DOCX)'}
                                                </span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.docx"
                                                    onChange={handleFileUpload}
                                                    disabled={applying}
                                                />
                                            </label>
                                        </div>
                                        <button
                                            className="mt-8 text-sm text-gray-400 hover:text-gray-900 font-bold transition-colors"
                                            onClick={() => setStep('initial')}
                                        >
                                            ← Go Back
                                        </button>
                                    </div>
                                )}

                                {step === 'review' && resumeData && (
                                    <div className="space-y-6">
                                        {resumeData.is_demo && (
                                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r-xl">
                                                <div className="flex">
                                                    <div className="flex-shrink-0">
                                                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm text-yellow-700">
                                                            <strong>Demo Mode:</strong> AI Resume Analysis is not active. Showing sample data.
                                                            <span className="hidden sm:inline"> To enable real analysis, provide a <strong>Google Gemini</strong> or <strong>Anthropic API key</strong> in your .env file and restart the server.</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="bg-[#F5F3FF] border border-lavender-100 rounded-2xl p-6 flex items-center justify-between">
                                            <div>
                                                <h4 className="text-lavender-900 font-bold text-lg">AI Match Analysis</h4>
                                                <p className="text-lavender-600 text-sm font-medium">Resume ATS score for this role</p>
                                            </div>
                                            <div className="text-4xl font-black text-lavender-600">{resumeData.ats_score}%</div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-5">
                                            <div>
                                                <label className="block text-sm font-bold leading-6 text-gray-900">Full Name</label>
                                                <input
                                                    type="text"
                                                    className="block w-full rounded-2xl border-0 py-3 px-4 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 font-medium"
                                                    value={formData.full_name}
                                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold leading-6 text-gray-900">Email Address</label>
                                                <input
                                                    type="email"
                                                    className="block w-full rounded-2xl border-0 py-3 px-4 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 font-medium"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold leading-6 text-gray-900">Phone Number</label>
                                                <input
                                                    type="text"
                                                    className="block w-full rounded-2xl border-0 py-3 px-4 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 font-medium"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold leading-6 text-gray-900">Experience Summary</label>
                                                <textarea
                                                    rows={3}
                                                    className="block w-full rounded-2xl border-0 py-3 px-4 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 font-medium"
                                                    value={formData.experience_summary}
                                                    onChange={(e) => setFormData({ ...formData, experience_summary: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold leading-6 text-gray-900">Detected Skills</label>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {formData.detected_skills.map(skill => (
                                                        <span key={skill} className="inline-flex items-center rounded-lg bg-[#F5F3FF] px-3 py-1.5 text-xs font-bold text-gray-600 ring-1 ring-inset ring-gray-200">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row-reverse">
                                            <button
                                                type="button"
                                                className="flex-1 inline-flex justify-center rounded-2xl bg-[#8b5cf6] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#7c3aed] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all"
                                                onClick={handleApply}
                                                disabled={applying}
                                            >
                                                {applying ? 'Sending...' : 'Confirm & Apply'}
                                            </button>
                                            <button
                                                type="button"
                                                className="flex-1 inline-flex justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-900 shadow-none ring-1 ring-inset ring-gray-200 hover:bg-gray-50 transition-all"
                                                onClick={() => setStep('upload')}
                                            >
                                                Pick another file
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 'success' && (
                                    <div className="py-16 text-center">
                                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-lime-100 mb-6">
                                            <CheckCircleIcon className="h-14 w-14 text-lime-600" aria-hidden="true" />
                                        </div>
                                        <div className="mt-5">
                                            <h3 className="text-3xl font-black text-gray-900">Application Sent!</h3>
                                            <p className="mt-4 text-base text-gray-500 text-balance px-10">
                                                Your tailored application was sent to <strong>{job.company}</strong>.
                                                We've matched your profile and highlighted your strengths.
                                            </p>
                                            <p className="mt-2 text-lime-600 font-bold text-sm">
                                                We will get back to you once the review is complete!
                                            </p>
                                        </div>
                                        <div className="mt-10">
                                            <button
                                                type="button"
                                                className="rounded-2xl bg-[#8b5cf6] px-12 py-4 text-sm font-bold text-white shadow-lg hover:bg-[#7c3aed] transition-all transform hover:scale-105"
                                                onClick={onClose}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
