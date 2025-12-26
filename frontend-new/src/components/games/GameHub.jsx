import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Tab } from '@headlessui/react';
import {
    CheckCircleIcon, XCircleIcon, PuzzlePieceIcon,
    BugAntIcon, PlayIcon, BeakerIcon,
    ArrowPathIcon, CommandLineIcon,
    LightBulbIcon, TrophyIcon
} from '@heroicons/react/24/outline';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function GameHub() {
    const { token, user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [bugs, setBugs] = useState([]);
    const [scenario, setScenario] = useState(null);
    const [currentScenarioNode, setCurrentScenarioNode] = useState('start');

    // AI Lab State
    const [aiChallenge, setAiChallenge] = useState(null);
    const [userCode, setUserCode] = useState('');
    const [aiResult, setAiResult] = useState(null);
    const [loadingAi, setLoadingAi] = useState(false);
    const [evaluating, setEvaluating] = useState(false);

    // Global States
    const [triviaScore, setTriviaScore] = useState(0);
    const [bugScore, setBugScore] = useState(0);
    const [simLog, setSimLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        console.log('Fetching Game Data...');

        const fetchSafe = async (url) => {
            try {
                const r = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!r.ok) throw new Error(`Status ${r.status}`);
                return await r.json();
            } catch (e) {
                console.error(`Fetch error for ${url}:`, e);
                return null;
            }
        };

        try {
            const [qData, bData, sData] = await Promise.all([
                fetchSafe('/api/games/trivia'),
                fetchSafe('/api/games/bugs'),
                fetchSafe('/api/games/scenario')
            ]);

            setQuestions(qData || []);
            setBugs(bData || []);
            setScenario(sData || null);

            // Auto-load first AI challenge based on top user skill
            if (user?.skills?.length > 0) {
                const topSkill = typeof user.skills[0] === 'string' ? user.skills[0] : user.skills[0].name;
                loadAiChallenge(topSkill);
            } else {
                loadAiChallenge('python');
            }

        } catch (err) {
            setError("Some games failed to load. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const loadAiChallenge = async (skill) => {
        setLoadingAi(true);
        setAiResult(null);
        try {
            const res = await fetch(`/api/games/ai-lab/challenge?skill=${skill}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setAiChallenge(data);
            setUserCode(data.starter_code || '');
        } catch (e) {
            console.error("AI Lab Load Error", e);
        } finally {
            setLoadingAi(false);
        }
    };

    const runAiEvaluation = async () => {
        setEvaluating(true);
        try {
            const res = await fetch('/api/games/ai-lab/evaluate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title: aiChallenge.title, code: userCode })
            });
            const data = await res.json();
            setAiResult(data);
        } catch (e) {
            console.error("AI Eval Error", e);
        } finally {
            setEvaluating(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <ArrowPathIcon className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-gray-500 animate-pulse font-medium">Powering up the arcade...</p>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 mb-32">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Skill Arcade</h1>
                    <p className="mt-2 text-xl text-gray-500 font-medium">Level up your technical skills through interactive play.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                >
                    <ArrowPathIcon className="w-4 h-4" /> Refresh Games
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 font-bold">
                    <XCircleIcon className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <Tab.Group>
                <Tab.List className="flex p-1 space-x-2 bg-gray-100 rounded-[2rem] mb-12 max-w-4xl">
                    {[
                        { name: 'AI Skills Lab', icon: BeakerIcon, color: 'text-lavender-600' },
                        { name: 'Skill Quest', icon: PuzzlePieceIcon, color: 'text-lime-600' },
                        { name: 'Bug Hunter', icon: BugAntIcon, color: 'text-red-500' },
                        { name: 'Career Sim', icon: PlayIcon, color: 'text-black' },
                    ].map((tab) => (
                        <Tab
                            key={tab.name}
                            className={({ selected }) => classNames(
                                'w-full py-4 text-sm font-bold leading-5 rounded-[1.8rem] transition-all duration-300 flex items-center justify-center gap-2',
                                'focus:outline-none',
                                selected
                                    ? 'bg-white shadow-md text-black scale-[1.02] ring-1 ring-black/5'
                                    : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'
                            )}
                        >
                            <tab.icon className={classNames("w-5 h-5", tab.color)} />
                            {tab.name}
                        </Tab>
                    ))}
                </Tab.List>

                <Tab.Panels>
                    {/* 1. AI SKILLS LAB */}
                    <Tab.Panel className="focus:outline-none">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white p-8 rounded-[2rem] shadow-soft border border-gray-100">
                                    <div className="flex justify-between items-start mb-6">
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <LightBulbIcon className="w-6 h-6 text-lime-500" />
                                            Challenge Info
                                        </h2>
                                        {aiChallenge && (
                                            <span className="px-3 py-1 bg-lavender-100 text-lavender-700 rounded-lg text-xs font-black uppercase tracking-tighter shadow-sm border border-lavender-200">
                                                Active: {aiChallenge?.title?.split(' ')[0]}
                                            </span>
                                        )}
                                    </div>
                                    {loadingAi ? (
                                        <div className="animate-pulse space-y-4">
                                            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                            <div className="h-24 bg-gray-100 rounded-[1.5rem]"></div>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="font-bold text-gray-900 text-2xl mb-2">{aiChallenge?.title}</h3>
                                            <p className="text-gray-500 leading-relaxed mb-8 font-medium">{aiChallenge?.description}</p>

                                            <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-4">Key Concepts</h4>
                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {aiChallenge?.concepts?.map(c => (
                                                    <span key={c} className="px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-xs font-bold border border-gray-200">{c}</span>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => {
                                                    const availableSkills = ['python', 'react', 'sql', 'aws', 'ai', 'python_adv'];
                                                    const currentIdx = availableSkills.indexOf(aiChallenge?.title?.toLowerCase().includes('python') ? 'python' :
                                                        aiChallenge?.title?.toLowerCase().includes('react') ? 'react' :
                                                            aiChallenge?.title?.toLowerCase().includes('sql') ? 'sql' :
                                                                aiChallenge?.title?.toLowerCase().includes('aws') ? 'aws' :
                                                                    aiChallenge?.title?.toLowerCase().includes('ai') ? 'ai' : 'python');
                                                    const nextSkill = availableSkills[(currentIdx + 1) % availableSkills.length];
                                                    loadAiChallenge(nextSkill);
                                                }}
                                                className="w-full py-4 bg-[#8b5cf6] text-white hover:bg-[#7c3aed] text-sm font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <ArrowPathIcon className="w-4 h-4" /> Next Challenge
                                            </button>
                                        </>
                                    )}
                                </div>

                                {aiResult && (
                                    <div className={classNames(
                                        "p-8 rounded-[2rem] shadow-soft border animate-in slide-in-from-bottom duration-500",
                                        aiResult.passed ? "bg-lime-50 border-lime-200" : "bg-red-50 border-red-200"
                                    )}>
                                        <div className="flex items-center gap-4 mb-4">
                                            {aiResult.passed ? <TrophyIcon className="w-10 h-10 text-lime-600" /> : <BeakerIcon className="w-10 h-10 text-red-500" />}
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Result</p>
                                                <h3 className="text-3xl font-black text-gray-900">{aiResult.score}% Mastery</h3>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 text-sm font-medium italic mb-4 leading-relaxed">"{aiResult.feedback}"</p>
                                        {aiResult.passed && <p className="text-lime-700 font-bold text-sm flex items-center gap-2"><CheckCircleIcon className="w-5 h-5" /> +150 XP Awarded</p>}
                                    </div>
                                )}
                            </div>

                            <div className="lg:col-span-2">
                                <div className="bg-[#1e1e1e] rounded-[2rem] shadow-2xl overflow-hidden border border-gray-800">
                                    <div className="flex items-center justify-between px-8 py-5 bg-[#2d2d2d] border-b border-black/20">
                                        <div className="flex items-center gap-3">
                                            <CommandLineIcon className="w-5 h-5 text-lime-500" />
                                            <span className="text-gray-300 font-mono text-sm font-bold">solution.js</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        </div>
                                    </div>
                                    <textarea
                                        value={userCode}
                                        onChange={(e) => setUserCode(e.target.value)}
                                        className="w-full h-[500px] bg-[#1e1e1e] text-lime-100 p-8 font-mono text-sm focus:outline-none resize-none leading-relaxed"
                                        spellCheck="false"
                                        placeholder="// Your code here..."
                                    />
                                    <div className="px-8 py-5 bg-[#2d2d2d] border-t border-black/20 flex justify-end">
                                        <button
                                            onClick={runAiEvaluation}
                                            disabled={evaluating || loadingAi}
                                            className={classNames(
                                                "px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2",
                                                evaluating ? "bg-gray-700 text-gray-400" : "bg-lime-400 text-black hover:bg-lime-500 shadow-lg shadow-lime-500/20"
                                            )}
                                        >
                                            {evaluating ? (
                                                <><ArrowPathIcon className="w-5 h-5 animate-spin" /> Analyzing...</>
                                            ) : (
                                                <><CheckCircleIcon className="w-5 h-5" /> Submit Solution</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Tab.Panel>

                    {/* 2. SKILL QUEST (TRIVIA) */}
                    <Tab.Panel>
                        <div className="max-w-4xl mx-auto">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black text-gray-900">Current Score: <span className="text-lime-600">{triviaScore} XP</span></h2>
                            </div>
                            <div className="grid grid-cols-1 gap-8">
                                {questions.length > 0 ? questions.map((q, idx) => (
                                    <div key={idx} className="bg-white p-10 rounded-[2.5rem] shadow-soft border border-gray-100 hover:shadow-lg transition-shadow">
                                        <p className="text-2xl font-bold text-gray-900 mb-8 leading-tight">{idx + 1}. {q.q}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((opt) => (
                                                <button
                                                    key={opt}
                                                    disabled={q.answered}
                                                    onClick={() => {
                                                        const isCorrect = opt === q.correct;
                                                        const newQuestions = [...questions];
                                                        newQuestions[idx].answered = true;
                                                        newQuestions[idx].userAnswer = opt;
                                                        setQuestions(newQuestions);
                                                        if (isCorrect) setTriviaScore(s => s + 10);
                                                    }}
                                                    className={classNames(
                                                        "px-8 py-5 rounded-2xl text-left font-bold transition-all border-2 text-lg",
                                                        q.answered && opt === q.correct ? 'bg-lime-50 border-lime-500 text-lime-800' :
                                                            q.answered && q.userAnswer === opt ? 'bg-red-50 border-red-500 text-red-800' :
                                                                !q.answered ? 'bg-white border-gray-100 hover:border-black hover:bg-gray-50 text-gray-600' : 'opacity-50 border-gray-50'
                                                    )}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 border-dashed">
                                        <PuzzlePieceIcon className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                                        <p className="text-gray-500 font-bold text-lg">No trivia matches your skills yet. Add more skills to your profile!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Tab.Panel>

                    {/* 3. BUG HUNTER */}
                    <Tab.Panel>
                        <div className="max-w-6xl mx-auto space-y-12">
                            {bugs.map((bug, idx) => (
                                <div key={idx} className="bg-white rounded-[2.5rem] overflow-hidden shadow-soft border border-gray-100">
                                    <div className="p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-500">
                                                <BugAntIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl text-gray-900">{bug.title}</h3>
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{bug.language} Challenge</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-gray-400 bg-white px-4 py-2 rounded-lg border border-gray-100">#{idx + 1}</span>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2">
                                        <div className="bg-[#1e1e1e] p-10 font-mono text-sm leading-relaxed overflow-x-auto">
                                            <pre className="text-lime-300"><code>{bug.code}</code></pre>
                                        </div>
                                        <div className="p-10 bg-white border-l border-gray-100">
                                            <p className="font-bold text-gray-900 mb-8 text-xl">Identify the bug:</p>
                                            <div className="space-y-4">
                                                {bug.options.map(opt => (
                                                    <button
                                                        key={opt}
                                                        disabled={bug.answered}
                                                        onClick={() => {
                                                            const isCorrect = opt === bug.correct;
                                                            const newBugs = [...bugs];
                                                            newBugs[idx].answered = true;
                                                            newBugs[idx].userAnswer = opt;
                                                            setBugs(newBugs);
                                                            if (isCorrect) setBugScore(s => s + 20);
                                                        }}
                                                        className={classNames(
                                                            "w-full text-left px-6 py-5 rounded-2xl border-2 font-bold transition-all text-base",
                                                            bug.answered && opt === bug.correct ? 'bg-lime-50 border-lime-500 text-lime-800' :
                                                                bug.answered && bug.userAnswer === opt ? 'bg-red-50 border-red-500 text-red-800' :
                                                                    !bug.answered ? 'hover:border-black hover:bg-gray-50 border-gray-100 text-gray-600' : 'opacity-40 border-gray-50'
                                                        )}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                            {bug.answered && (
                                                <div className="mt-8 p-6 bg-lavender-50 text-lavender-900 rounded-2xl text-sm leading-relaxed border border-lavender-100 italic">
                                                    <strong className="block text-lavender-600 mb-2 font-black uppercase text-xs tracking-widest not-italic">Master Note</strong>
                                                    {bug.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Tab.Panel>

                    {/* 4. CAREER SIM */}
                    <Tab.Panel>
                        <div className="max-w-4xl mx-auto">
                            {simLog.length > 0 && (
                                <div className="mb-12 space-y-4 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-200">
                                    {simLog.map((entry, i) => (
                                        <div key={i} className="flex gap-4 animate-in slide-in-from-left duration-300">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">{i + 1}</div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">Scenario</p>
                                                <p className="text-gray-900 leading-relaxed text-sm font-medium">{entry.text}</p>
                                                <p className="text-lime-700 font-bold text-xs bg-lime-100 px-3 py-1 rounded-lg inline-block border border-lime-200">Decision: {entry.choice}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {scenario && scenario[currentScenarioNode] ? (
                                <div className="bg-black text-white p-14 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <PlayIcon className="w-64 h-64 text-white" />
                                    </div>

                                    <div className="relative z-10">
                                        <span className="px-4 py-2 bg-lime-500 text-black text-xs font-black uppercase tracking-widest rounded-lg mb-8 inline-block shadow-lg shadow-lime-500/50">Active Incident</span>
                                        <p className="text-3xl font-bold mb-12 leading-snug">
                                            {scenario[currentScenarioNode].text}
                                        </p>

                                        {scenario[currentScenarioNode].choices.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                {scenario[currentScenarioNode].choices.map((choice) => (
                                                    <button
                                                        key={choice.next}
                                                        onClick={() => {
                                                            setSimLog([...simLog, { text: scenario[currentScenarioNode].text, choice: choice.text }]);
                                                            setCurrentScenarioNode(choice.next);
                                                        }}
                                                        className="w-full text-left p-6 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 hover:border-lime-400 flex items-center justify-between group/btn backdrop-blur-sm"
                                                    >
                                                        <span className="font-bold text-lg">{choice.text}</span>
                                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover/btn:bg-lime-500 group-hover/btn:text-black transition-colors">
                                                            <PlayIcon className="w-5 h-5" />
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <button
                                                    onClick={() => { setSimLog([]); setCurrentScenarioNode('start') }}
                                                    className="px-12 py-5 bg-lime-500 text-black rounded-2xl hover:bg-lime-400 font-black text-lg transition-all shadow-xl shadow-lime-500/40 hover:scale-105 active:scale-95"
                                                >
                                                    RETRAIN & PLAY AGAIN
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-24">
                                    <ArrowPathIcon className="w-12 h-12 text-gray-300 animate-spin mx-auto" />
                                    <p className="mt-4 text-gray-500 font-bold">Syncing scenario engine...</p>
                                </div>
                            )}
                        </div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>

            <div className="mt-16 flex justify-center">
                <div className="bg-white px-16 py-10 rounded-[3rem] border border-gray-100 flex items-center gap-16 shadow-soft">
                    <div className="text-center">
                        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">Skill Quest XP</p>
                        <p className="text-4xl font-black text-gray-900">{triviaScore}</p>
                    </div>
                    <div className="w-px h-12 bg-black"></div>
                    <div className="text-center">
                        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bug Hunter XP</p>
                        <p className="text-4xl font-black text-gray-900">{bugScore}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
