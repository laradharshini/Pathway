import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AcademicCapIcon, BookOpenIcon, PlayCircleIcon } from '@heroicons/react/24/outline';

export default function Learning() {
    const { token, user } = useAuth();
    const [skillsToLearn, setSkillsToLearn] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLearningPaths = async () => {
            try {
                // Reuse intelligence from jobs to know what to learn
                const res = await fetch('/api/jobs/recommendations', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Failed to load learning data");

                const data = await res.json();
                const jobs = data.jobs || data.recommendations || [];

                const skillCounts = {};
                jobs.forEach(job => {
                    (job.missing_skills || []).forEach(skill => {
                        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                    });
                });

                const topSkills = Object.entries(skillCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 6)
                    .map(([name]) => name);

                setSkillsToLearn(topSkills);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchLearningPaths();
    }, [token]);

    const resources = [
        { name: 'Coursera', url: 'https://www.coursera.org/search?query=', icon: AcademicCapIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'Udemy', url: 'https://www.udemy.com/courses/search/?q=', icon: PlayCircleIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
        { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=learn+', icon: PlayCircleIcon, color: 'text-red-600', bg: 'bg-red-50' },
    ];

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 mb-32">

            <div className="mb-8">
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                    Personalized Learning
                </h2>
                <p className="text-xl text-gray-500 font-medium max-w-2xl">
                    Curated resources to bridge your skill gaps for <strong>{user?.role || 'your target role'}</strong>.
                </p>
            </div>

            {loading ? (
                <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-[2rem]"></div>)}
                </div>
            ) : skillsToLearn.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 border-dashed">
                    <div className="w-20 h-20 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AcademicCapIcon className="h-10 w-10 text-lime-800" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">You are up to date!</h3>
                    <p className="mt-2 text-gray-500">No critical skill gaps found for current job listings.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {skillsToLearn.map((skill) => (
                        <div key={skill} className="bg-white rounded-[2rem] p-6 shadow-soft border border-gray-100 flex flex-col h-[320px] group hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 bg-lavender-50 rounded-2xl flex items-center justify-center text-lavender-600 font-bold border border-lavender-100">
                                    <BookOpenIcon className="h-7 w-7" />
                                </div>
                                <span className="px-3 py-1 bg-lime-100 text-lime-700 text-xs font-bold rounded-full">
                                    Recommended
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 capitalize mb-2">{skill}</h3>
                            <p className="text-sm text-gray-500 font-medium mb-auto">
                                Critical skill found missing in your profile matching target roles.
                            </p>

                            <div className="flex gap-2 mt-6">
                                {resources.map((r) => (
                                    <a
                                        key={r.name}
                                        href={`${r.url}${skill}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 flex flex-col items-center justify-center py-3 rounded-xl bg-gray-50 hover:bg-[#8b5cf6] hover:text-white transition-all group/btn"
                                        title={r.name}
                                    >
                                        <r.icon className={`h-6 w-6 mb-1 ${r.color} group-hover/btn:text-white`} aria-hidden="true" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{r.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
