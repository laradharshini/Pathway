
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import { BriefcaseIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/solid';

export default function ProfileSetup() {
    const { token, user } = useAuth(); // We need token
    const navigate = useNavigate();

    const [targetRole, setTargetRole] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('Entry level');
    const [skillInput, setSkillInput] = useState('');
    const [skills, setSkills] = useState([]);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleAddSkill = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
            e.preventDefault();
            const newSkill = skillInput.trim().replace(',', '');
            if (newSkill && !skills.includes(newSkill)) {
                setSkills([...skills, newSkill]);
            }
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSaving(true);

        if (skills.length === 0) {
            setError('Please add at least one skill.');
            setIsSaving(false);
            return;
        }

        try {
            const res = await fetch('/api/candidate/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    target_role: targetRole,
                    experience_level: experienceLevel,
                    skills: skills
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save profile');
            }

            // Success! Go to dashboard
            navigate('/');
        } catch (err) {
            setError(err.message);
            setIsSaving(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full flex flex-col items-center">
                {/* Header Icon */}
                <div className="mb-6 relative">
                    <div className="bg-[#8b5cf6] p-4 rounded-2xl shadow-lg rotate-[-3deg]">
                        <BriefcaseIcon className="h-8 w-8 text-white" />
                    </div>
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                        Build Your Profile
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Tell us about your goals so we can find the perfect job match.
                    </p>
                </div>

                <form className="w-full space-y-5 text-left" onSubmit={handleSubmit}>

                    {/* Target Role */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 ml-1">
                            Target Role
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Software Engineer"
                            className="block w-full rounded-2xl border border-gray-100 bg-gray-50 py-3 px-4 text-gray-900 shadow-sm focus:border-lavender-400 focus:ring-2 focus:ring-lavender-400 sm:text-sm transition-all focus:outline-none"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                        />
                    </div>

                    {/* Experience Level */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 ml-1">
                            Experience Level
                        </label>
                        <select
                            className="block w-full rounded-2xl border border-gray-100 bg-gray-50 py-3 px-4 text-gray-900 shadow-sm focus:border-lavender-400 focus:ring-2 focus:ring-lavender-400 sm:text-sm transition-all focus:outline-none"
                            value={experienceLevel}
                            onChange={(e) => setExperienceLevel(e.target.value)}
                        >
                            <option>Internship</option>
                            <option>Entry level</option>
                            <option>Associate</option>
                            <option>Mid-Senior level</option>
                            <option>Director</option>
                            <option>Executive</option>
                        </select>
                    </div>

                    {/* Skills Input (Chips) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 ml-1">
                            Skills <span className="font-normal text-gray-400 normal-case">(Press Enter to add)</span>
                        </label>
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-2 px-4 focus-within:ring-2 focus-within:ring-lavender-400 focus-within:border-lavender-400 transition-all">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {skills.map(skill => (
                                    <span key={skill} className="bg-lavender-100 text-lavender-700 px-2.5 py-1 rounded-lg text-sm font-medium flex items-center gap-1 animate-fadeIn">
                                        {skill}
                                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-lavender-900">
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder={skills.length === 0 ? "Type a skill (e.g. React, Python) and hit Enter" : "Add another skill..."}
                                className="block w-full border-none p-0 focus:ring-0 focus:outline-none text-sm bg-transparent placeholder:text-gray-400 py-2"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={handleAddSkill}
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded-lg">{error}</p>}

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex w-full justify-center items-center gap-2 rounded-2xl bg-[#1f2937] px-3 py-3.5 text-sm font-bold leading-6 text-white shadow-xl shadow-gray-200 hover:bg-black hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 mt-4"
                    >
                        {isSaving ? 'Saving Profile...' : 'Complete Setup'}
                        {!isSaving && <BriefcaseIcon className="h-4 w-4 text-gray-300" />}
                    </button>
                </form>
            </div>
        </AuthLayout>
    );
}
