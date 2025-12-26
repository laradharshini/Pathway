
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import JobCard from '../jobs/JobCard';
import JobDetailModal from '../jobs/JobDetailModal';
import {
    MagnifyingGlassIcon,
    SparklesIcon,
    LightBulbIcon
} from '@heroicons/react/24/outline';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

const JobCardSkeleton = () => (
    <div className="animate-pulse bg-white rounded-[2rem] p-6 h-48 border border-gray-100 flex flex-col justify-between">
        <div className="flex gap-4">
            <div className="h-10 w-10 bg-gray-100 rounded-2xl"></div>
            <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
        </div>
        <div className="h-3 bg-gray-100 rounded w-full mt-4"></div>
    </div>
)

export default function Dashboard() {
    const { user, token, logout } = useAuth();
    const { openChat } = useChat();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [chatInput, setChatInput] = useState('');

    const handleAnalyze = () => {
        if (!chatInput.trim()) return;
        openChat(chatInput);
        setChatInput('');
    };

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // Use the correct endpoint for recommendations (simulated or real)
                // Note: The previous code used /api/jobs/search or similar. 
                // Ensuring we hit an endpoint that exists or falling back to search
                let res = await fetch('/api/jobs/search?limit=6', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.status === 401) {
                    console.warn("Session expired or invalid token. Logging out...");
                    logout();
                    return;
                }

                if (!res.ok) throw new Error('Failed to load intelligence feed');

                const data = await res.json();
                setJobs(data.jobs || []); // Updated to match likely API response structure { jobs: [...] }
            } catch (err) {
                console.error(err);
                setError('Could not load your intelligence feed. Please refresh.');
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchJobs();
    }, [token, logout]);

    return (
        <div className="flex flex-col min-h-[85vh] relative">
            {/* Header Section */}
            <div className="max-w-6xl mx-auto w-full mb-12 pt-8 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                    Your Career Outlook
                </h1>
                <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
                    Insights designed to guide your next career move.
                </p>
            </div>

            {error && (
                <div className="max-w-4xl mx-auto w-full bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3">
                    <span className="font-bold">System Alert:</span> {error}
                </div>
            )}

            <div className="max-w-[1600px] mx-auto w-full px-4 mb-32">
                <div className="flex items-center gap-2 mb-6 ml-2">
                    <SparklesIcon className="h-5 w-5 text-lime-500" />
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Top Matches for You</h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                        {[1, 2, 3, 4, 5, 6].map(i => <JobCardSkeleton key={i} />)}
                    </div>
                ) : jobs.length > 0 ? (
                    /* Refactored to use JobCard for perfect alignment and consistency */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                        {jobs.map((job) => (
                            <JobCard
                                key={job.job_id || job.id}
                                job={job}
                                onSelect={setSelectedJob}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 border-dashed">
                        <MagnifyingGlassIcon className="mx-auto h-16 w-16 text-gray-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">No signals detected</h3>
                        <p className="text-gray-400">Refining search parameters...</p>
                    </div>
                )}
            </div>

            {/* "AnyChat" Style Chat Input - Floating Bottom */}
            <div className="fixed bottom-6 left-0 lg:left-80 right-0 px-6 pointer-events-none z-30">
                <div className="max-w-4xl mx-auto w-full pointer-events-auto">
                    <div className="bg-white p-2 pl-5 rounded-full shadow-2xl shadow-lavender-900/10 border border-gray-100 flex items-center gap-3 relative group focus-within:ring-2 focus-within:ring-lime-400 transition-all">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                            placeholder="Ask Pathway Assistant to analyze skills or find jobs..."
                            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-800 placeholder-gray-400 font-medium h-12"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleAnalyze}
                                disabled={!chatInput.trim()}
                                className="p-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-full transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-sm font-bold hidden sm:inline">Analyze</span>
                                <PaperAirplaneIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <JobDetailModal
                job={selectedJob}
                open={!!selectedJob}
                onClose={() => setSelectedJob(null)}
            />
        </div>
    );
}
