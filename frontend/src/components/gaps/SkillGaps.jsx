import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowPathIcon, BookOpenIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

export default function SkillGaps() {
    const { token, user } = useAuth();
    const [stats, setStats] = useState({ topMissing: [], totalAnalyzed: 0, avgReadiness: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const analyzeGaps = async () => {
            try {
                const res = await fetch('/api/jobs/recommendations', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Failed to fetch jobs");
                const data = await res.json();
                const jobs = data.jobs || data.recommendations || [];

                const skillCounts = {};
                let totalScore = 0;

                jobs.forEach(job => {
                    const missing = job.missing_skills || [];
                    missing.forEach(skill => {
                        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                    });
                    totalScore += (job.readiness_score || 0);
                });

                const sortedSkills = Object.entries(skillCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([name, count]) => ({
                        name,
                        count,
                        frequency: Math.round((count / (jobs.length || 1)) * 100),
                        impact: 'High'
                    }));

                setStats({
                    topMissing: sortedSkills,
                    totalAnalyzed: jobs.length,
                    avgReadiness: Math.round(totalScore / (jobs.length || 1))
                });

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (token) analyzeGaps();
    }, [token]);

    const getProbability = (readiness) => {
        if (readiness >= 75) return { label: 'High', color: 'text-lime-500' };
        if (readiness >= 40) return { label: 'Medium', color: 'text-amber-500' };
        return { label: 'Low', color: 'text-red-400' };
    };

    const prob = getProbability(stats.avgReadiness);

    if (loading) return (
        <div className="flex justify-center py-20">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-[#8b5cf6]" />
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 mb-32">
            <div className="mb-8">
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                    Skill Gap Analysis
                </h2>
                <p className="text-xl text-gray-500 font-medium max-w-2xl">
                    Strategic insights based on your target role <strong>{user?.target_role || 'Engineer'}</strong>.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-10">
                <div className="bg-white p-8 rounded-[2rem] shadow-soft border border-gray-100 flex flex-col items-center text-center">
                    <dt className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Market Readiness</dt>
                    <dd className="text-6xl font-black text-black mb-2">{stats.avgReadiness}%</dd>
                    <div className="px-3 py-1 bg-lime-100 text-lime-700 text-xs font-bold rounded-full">High Potential</div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] shadow-soft border border-gray-100 flex flex-col items-center text-center">
                    <dt className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Jobs Analyzed</dt>
                    <dd className="text-6xl font-black text-lavender-600 mb-2">{stats.totalAnalyzed}</dd>
                    <div className="text-xs font-bold text-gray-400">Real-time Data</div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] shadow-soft border border-gray-100 flex flex-col items-center text-center">
                    <dt className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Success Probability</dt>
                    <dd className={`text-6xl font-black ${prob.color} mb-2`}>{prob.label}</dd>
                    <div className="text-xs font-bold text-gray-400">Based on gaps</div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-gray-100">
                <div className="mb-8 border-b border-gray-100 pb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Highest Impact Skills</h3>
                    <p className="mt-2 text-gray-500 font-medium">Acquiring these skills will maximize your market value.</p>
                </div>
                <ul role="list" className="space-y-4">
                    {stats.topMissing.length === 0 ? (
                        <li className="py-20 text-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckBadgeIcon className="h-10 w-10 text-green-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">All Systems Go</h3>
                            <p className="text-gray-500">You are perfectly matched for your target roles.</p>
                        </li>
                    ) : (
                        stats.topMissing.map((skill) => (
                            <li key={skill.name} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-6">
                                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
                                        <div className="text-center">
                                            <div className="text-lg font-black text-red-500">{skill.frequency}%</div>
                                            <div className="text-[9px] font-bold text-red-400 uppercase">Frequency</div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-gray-900">{skill.name}</p>
                                        <p className="text-sm font-medium text-gray-400">Identified as a gap in {skill.count} active job listings</p>
                                    </div>
                                </div>
                                <div>
                                    <button
                                        onClick={() => window.open(`https://www.coursera.org/search?query=${skill.name}`, '_blank')}
                                        className="inline-flex items-center rounded-xl bg-[#8b5cf6] px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#7c3aed] transition-all transform hover:scale-105"
                                    >
                                        <BookOpenIcon className="-ml-0.5 mr-2 h-5 w-5" aria-hidden="true" />
                                        Launch Course
                                    </button>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
