import { useState, useEffect } from 'react';
import {
    BriefcaseIcon,
    Bars3CenterLeftIcon,
    CheckCircleIcon,
    LightBulbIcon,
    ChevronLeftIcon
} from '@heroicons/react/24/outline';

export default function SimulationTask({ attempt, onSubmit, onBack }) {
    const sim = attempt.simulation;
    const [selectedActions, setSelectedActions] = useState([]);
    const [justification, setJustification] = useState('');
    const [timeLeft, setTimeLeft] = useState(1500); // 25:00
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const toggleAction = (actionId) => {
        if (selectedActions.includes(actionId)) {
            setSelectedActions(selectedActions.filter(id => id !== actionId));
        } else {
            setSelectedActions([...selectedActions, actionId]);
        }
    };

    const handleCommit = async () => {
        if (selectedActions.length === 0) {
            alert("Please select at least one action before committing.");
            return;
        }
        if (justification.length < 20) {
            alert("Please provide a more detailed justification for your decision (min 20 chars).");
            return;
        }
        setSubmitting(true);
        await onSubmit(attempt.attempt_id, selectedActions, justification);
        setSubmitting(false);
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-6">
            <button
                onClick={onBack}
                className="flex items-center text-sm font-bold text-gray-400 hover:text-gray-900 transition mb-8 group"
            >
                <ChevronLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </button>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden text-left mb-12">
                <div className="bg-[#8b5cf6] p-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-lime-400 flex items-center justify-center font-black text-xs text-black shadow-glow">3</div>
                        <div>
                            <p className="font-black text-xs uppercase tracking-widest text-lavender-200">Step 3: Workspace Implementation</p>
                            <p className="text-[10px] text-lavender-400 font-bold uppercase tracking-tight">Analyze artifacts and commit your technical strategy.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 pr-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-lavender-300 uppercase tracking-widest">Time</span>
                            <span className="font-mono font-black text-xl text-white">{formatTime(timeLeft)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-lavender-300 uppercase tracking-widest">Decisions</span>
                            <span className="font-black text-xl text-lime-400">{selectedActions.length}/{sim.actions.length}</span>
                        </div>
                    </div>
                </div>

                <div className="p-12 space-y-12">
                    {/* Header with Brand */}
                    <div className="pb-8 border-b border-gray-50 space-y-8">
                        <div className="flex items-center text-gray-900 font-black text-3xl tracking-tighter">
                            <div className="relative mr-4">
                                <div className="bg-[#8b5cf6] p-2.5 rounded-xl rounded-bl-none shadow-lg shadow-purple-100 rotate-3">
                                    <BriefcaseIcon className="h-7 w-7 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-r-[2px] border-b-[2px] border-[#84cc16] rounded-full"></div>
                            </div>
                            Pathway <span className="ml-3 text-lavender-600">Workspace</span>
                        </div>

                        <div>
                            <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">{sim.title}</h2>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.2em] bg-lavender-50/50 px-4 py-2 rounded-xl border border-lavender-100/50">
                                    Target Skill: {sim.target_skill}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Briefing Card */}
                    <section className="bg-[#F5F3FF] rounded-2xl p-8 border border-lavender-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                            <LightBulbIcon className="w-32 h-32 text-lavender-600 transform rotate-12" />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                <LightBulbIcon className="h-5 w-5 text-lavender-600" />
                            </div>
                            <h3 className="text-xs font-black text-lavender-600 uppercase tracking-widest">Mission Context</h3>
                        </div>
                        <p className="text-gray-900 font-bold mb-3 text-lg leading-snug">{sim.scenario.context}</p>
                        <p className="text-gray-500 font-medium italic border-l-4 border-lime-400 pl-4">{sim.scenario.problem_brief}</p>
                    </section>

                    {/* Artifacts Grid */}
                    <section>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Bars3CenterLeftIcon className="h-4 w-4" />
                            Working Artifacts
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            {sim.id === 'sql-perf-audit' && (
                                <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                                    <div className="bg-lavender-50/50 px-6 py-3 flex justify-between items-center border-b border-gray-100">
                                        <span className="text-[10px] font-black text-lavender-600 uppercase tracking-widest">query.sql</span>
                                        <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-black rounded-full border border-red-100">CRITICAL PATH</span>
                                    </div>
                                    <div className="p-8 font-mono text-sm text-gray-600 bg-white whitespace-pre overflow-x-auto">
                                        {`SELECT c.customer_id, c.customer_name, COUNT(o.order_id)
FROM customers c JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_date >= '2023-01-01'
GROUP BY c.customer_id, c.customer_name;`}
                                    </div>
                                </div>
                            )}

                            {sim.id === 'react-perf-fix' && (
                                <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                                    <div className="bg-lavender-50/50 px-6 py-3 flex justify-between items-center border-b border-gray-100">
                                        <span className="text-[10px] font-black text-lavender-600 uppercase tracking-widest">Search.jsx</span>
                                        <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 text-[9px] font-black rounded-full border border-yellow-100">UI LAG</span>
                                    </div>
                                    <div className="p-8 font-mono text-sm text-gray-600 bg-white whitespace-pre overflow-x-auto">
                                        {`const results = items.filter(i => i.name.includes(query));`}
                                    </div>
                                </div>
                            )}

                            {sim.id === 'python-data-cleanup' && (
                                <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                                    <div className="bg-lavender-50/50 px-6 py-3 flex justify-between items-center border-b border-gray-100">
                                        <span className="text-[10px] font-black text-lavender-600 uppercase tracking-widest">etl_processor.py</span>
                                        <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-black rounded-full border border-red-100">CRASHING</span>
                                    </div>
                                    <div className="p-8 font-mono text-sm text-gray-600 bg-white whitespace-pre overflow-x-auto">
                                        {`user_id = data['user_info']['id'] # CRASH: Fails if 'user_info' missing`}
                                    </div>
                                </div>
                            )}

                            {sim.id === 'aws-security-audit' && (
                                <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                                    <div className="bg-lavender-50/50 px-6 py-3 flex justify-between items-center border-b border-gray-100">
                                        <span className="text-[10px] font-black text-lavender-600 uppercase tracking-widest">iam_policy.json</span>
                                        <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-black rounded-full border border-red-100">EXPOSED</span>
                                    </div>
                                    <div className="p-8 font-mono text-sm text-red-500 bg-white whitespace-pre font-bold overflow-x-auto">
                                        {`"Action": "*", "Resource": "*"`}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Actions and Commitment Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <section>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <CheckCircleIcon className="h-4 w-4" />
                                Proposed Actions
                            </h3>
                            <div className="space-y-4">
                                {sim.actions.map(action => (
                                    <button
                                        key={action.id}
                                        onClick={() => toggleAction(action.id)}
                                        className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 group ${selectedActions.includes(action.id)
                                            ? 'border-[#8b5cf6] bg-[#8b5cf6] text-white shadow-xl shadow-purple-100'
                                            : 'border-gray-100 bg-white hover:border-lavender-200'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className={`font-bold text-sm ${selectedActions.includes(action.id) ? 'text-white' : 'text-gray-900'}`}>{action.label}</h4>
                                            {selectedActions.includes(action.id) && <CheckCircleIcon className="h-5 w-5 text-lime-400" />}
                                        </div>
                                        <p className={`text-xs font-medium leading-relaxed mb-4 ${selectedActions.includes(action.id) ? 'text-lavender-200' : 'text-gray-500'}`}>{action.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${selectedActions.includes(action.id) ? 'text-lavender-300' : 'text-gray-300'}`}>Risk: {action.risk}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-6 flex flex-col">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-0 flex items-center gap-2">
                                Technical Justification
                            </h3>
                            <div className="flex-1 bg-[#F9FAFB] rounded-2xl p-8 border border-gray-100 flex flex-col space-y-6">
                                <p className="text-sm font-medium text-gray-500">Provide the technical logic behind your chosen strategy. How does this resolve the problem brief?</p>
                                <textarea
                                    rows={8}
                                    placeholder="Start typing your justification..."
                                    className="w-full flex-1 p-5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-lavender-600 bg-white shadow-inner outline-none resize-none transition-all"
                                    value={justification}
                                    onChange={(e) => setJustification(e.target.value)}
                                />
                                <button
                                    onClick={handleCommit}
                                    disabled={submitting}
                                    className="w-full py-5 bg-[#8b5cf6] text-white font-black text-lg rounded-xl hover:bg-[#7c3aed] shadow-lg shadow-purple-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    {submitting ? 'Authenticating Strategy...' : 'Commit Strategy'}
                                    {!submitting && <CheckCircleIcon className="h-6 w-6 text-lime-400" />}
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
