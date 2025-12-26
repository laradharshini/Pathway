import {
    ShieldCheckIcon,
    ChevronLeftIcon,
    ExclamationTriangleIcon,
    PresentationChartLineIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function SimulationSetup({ sim, onStart, onBack }) {
    return (
        <div className="max-w-5xl mx-auto py-12 px-6">
            <button
                onClick={onBack}
                className="flex items-center text-sm font-bold text-gray-400 hover:text-gray-900 transition mb-8 group"
            >
                <ChevronLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </button>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden text-left">
                <div className="bg-[#8b5cf6] p-4 flex items-center gap-4 text-white">
                    <div className="w-8 h-8 rounded-full bg-lime-400 flex items-center justify-center font-black text-xs text-black shadow-glow">2</div>
                    <div>
                        <p className="font-black text-xs uppercase tracking-widest text-lavender-200">Step 2: Mission Briefing</p>
                        <p className="text-[10px] text-lavender-400 font-bold uppercase tracking-tight">Understand the context and expected performance gains before entering the workspace.</p>
                    </div>
                </div>

                <div className="bg-[#8b5cf6] p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-lavender-500 rounded-full blur-3xl -mr-32 -mt-32 opacity-20"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-lavender-500/50 px-3 py-1.5 rounded-full mb-6 inline-block relative z-10">
                        Simulation Briefing
                    </span>
                    <h1 className="text-5xl font-black mb-4 leading-tight relative z-10 tracking-tighter">{sim.title}</h1>
                    <p className="text-lavender-100 text-lg font-medium max-w-2xl leading-relaxed relative z-10">
                        Expected impact on readiness: <span className="text-white font-black px-2 py-0.5 bg-lavender-700/50 rounded-md">+{sim.max_impact}%</span>
                    </p>
                </div>

                <div className="p-12 grid grid-cols-1 lg:grid-cols-5 gap-16">
                    <div className="lg:col-span-3 space-y-10">
                        <section>
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <ShieldCheckIcon className="h-4 w-4" />
                                Your Mission Context
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed font-medium">
                                {sim.scenario.context}
                            </p>
                        </section>

                        <section className="bg-[#F5F3FF] rounded-2xl p-8 border border-gray-100">
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 text-left">
                                <ExclamationTriangleIcon className="h-4 w-4" />
                                The Core Problem
                            </h2>
                            <p className="text-gray-900 font-bold leading-relaxed">
                                {sim.scenario.problem_brief}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">You will need to use</h2>
                            <div className="flex flex-wrap gap-2">
                                {sim.scenario.key_areas.map((area, i) => (
                                    <span key={i} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 shadow-sm">
                                        {area}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-[#F5F3FF] rounded-2xl p-8 border border-primary-100">
                            <h3 className="text-sm font-black text-primary-900 uppercase mb-6 flex items-center gap-2">
                                <PresentationChartLineIcon className="h-5 w-5" />
                                Expected Gains
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3 text-sm">
                                    <div className="h-5 w-5 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-black">✓</div>
                                    <span className="text-primary-700 font-medium leading-tight">Closing critical gap in <b>{sim.target_skill}</b></span>
                                </li>
                                <li className="flex gap-3 text-sm">
                                    <div className="h-5 w-5 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-black">✓</div>
                                    <span className="text-primary-700 font-medium leading-tight">Validating <b>decision logic</b> for real-world tasks</span>
                                </li>
                                <li className="flex gap-3 text-sm">
                                    <div className="h-5 w-5 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-black">✓</div>
                                    <span className="text-primary-700 font-medium leading-tight">Improving <b>overall career readiness</b></span>
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={onStart}
                            className="w-full py-5 bg-[#8b5cf6] text-white font-black text-lg rounded-2xl hover:bg-[#7c3aed] transition shadow-2xl shadow-lavender-200 active:scale-[0.98] transform group flex items-center justify-center gap-3"
                        >
                            Enter Workspace
                            <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
