import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import JobCard from './JobCard';
import JobDetailModal from './JobDetailModal';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Jobs() {
    const { token } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await fetch('/api/jobs/search', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) throw new Error('Failed to load jobs');

                const data = await res.json();
                setJobs(data.jobs || []);
                setFilteredJobs(data.jobs || []);
            } catch (err) {
                console.error(err);
                setError('Could not load jobs directory.');
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchJobs();
    }, [token]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredJobs(jobs);
            return;
        }
        const lower = searchTerm.toLowerCase();
        const filtered = jobs.filter(job =>
            job.title.toLowerCase().includes(lower) ||
            job.company.toLowerCase().includes(lower) ||
            job.skills?.some(s => s.toLowerCase().includes(lower))
        );
        setFilteredJobs(filtered);
    }, [searchTerm, jobs]);

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 mb-32">
            <div className="md:flex md:items-center md:justify-between mb-12">
                <div className="min-w-0 flex-1">
                    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                        Find Opportunities
                    </h2>
                    <p className="text-xl text-gray-500 font-medium">Explore positions tailored to your unique skill profile.</p>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <div className="relative rounded-2xl shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-2xl border-0 py-4 pl-12 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 bg-gray-50/50"
                            placeholder="Search jobs, skills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl relative mb-8 font-bold">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="animate-pulse bg-white p-8 h-96 rounded-[2rem] border border-gray-100"></div>)}
                </div>
            ) : filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredJobs.map(job => (
                        <JobCard key={job.job_id || job._id} job={{ ...job, readiness_score: job.readiness_score || 0 }} onSelect={setSelectedJob} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 border-dashed">
                    <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-lg font-bold text-gray-900">No jobs found</h3>
                    <p className="mt-1 text-gray-500 font-medium">Try adjusting your search terms.</p>
                </div>
            )}

            <JobDetailModal
                job={selectedJob}
                open={!!selectedJob}
                onClose={() => setSelectedJob(null)}
            />
        </div>
    );
}
