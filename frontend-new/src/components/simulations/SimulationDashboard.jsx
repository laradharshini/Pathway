import { ChartBarIcon, BeakerIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function SimulationDashboard({ data, onViewSim }) {
    if (!data || !data.recommended_simulation) {
        return (
            <div className="flex justify-center items-center py-20 text-gray-500 font-medium">
                <p>Loading simulation guidance...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 mb-32">
            <header className="mb-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Role Simulations</h1>
                    <p className="text-xl text-gray-500 font-medium max-w-2xl">
                        Bridge the gap between your skills and real job requirements through decision-driven scenarios.
                        Every choice you make updates your role readiness.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Your Path Guidance */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-[2rem] p-8 shadow-soft border border-gray-100">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Simulation Flow</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { title: 'Pick a Scenario', desc: 'Choose a real-world task linked to your target role.' },
                                { title: 'Make Decisions', desc: 'Analyze the data and commit to a career-linked action.' },
                                { title: 'Impact Readiness', desc: 'See your readiness score update based on your logic.' }
                            ].map((step, i) => (
                                <div key={i} className="relative pl-6 border-l-2 border-lavender-100">
                                    <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                                    <p className="text-sm text-gray-500 font-medium">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">Recommended Mission</h2>
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-soft p-10 flex flex-col md:flex-row gap-10 items-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <SparklesIcon className="w-64 h-64 text-lavender-500 transform rotate-12 translate-x-12 -translate-y-12" />
                            </div>

                            <div className="flex-1 space-y-6 relative z-10">
                                <div>
                                    <span className="bg-lime-100 text-lime-700 text-xs font-bold px-3 py-1 rounded-full uppercase mb-4 inline-block tracking-wide">Primary Focus</span>
                                    <h3 className="text-3xl font-black text-gray-900 mb-2">{data.recommended_simulation.name}</h3>
                                    <p className="text-gray-500 font-medium leading-relaxed">{data.recommended_simulation.impact_explanation}</p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <span className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold">
                                        <ChartBarIcon className="h-4 w-4" />
                                        {data.recommended_simulation.skill_addressed}
                                    </span>
                                    <span className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold">
                                        <BeakerIcon className="h-4 w-4" />
                                        {data.recommended_simulation.est_time}
                                    </span>
                                </div>
                            </div>
                            <div className="w-full md:w-auto relative z-10">
                                <button
                                    onClick={() => onViewSim(data.recommended_simulation.id)}
                                    className="w-full md:w-auto px-10 py-5 bg-[#8b5cf6] text-white font-bold rounded-2xl hover:bg-[#7c3aed] transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Start Simulation
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right: Sidebar Stats & Catalog */}
                <div className="space-y-6">
                    <div className="bg-[#8b5cf6] rounded-[2rem] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                        <h2 className="text-xs font-bold text-white-400 uppercase tracking-widest mb-6 relative z-10">Current Readiness</h2>
                        <div className="flex items-baseline gap-2 mb-2 relative z-10">
                            <span className="text-6xl font-black text-white">{data.readiness_score.toFixed(0)}%</span>
                            <span className="text-xs font-bold text-white-400">for {data.target_role}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2 mb-8 relative z-10">
                            <div className="bg-lime-400 h-2 rounded-full shadow-[0_0_10px_rgba(163,230,53,0.5)]" style={{ width: `${data.readiness_score}%` }}></div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <h3 className="text-xs font-bold text-white-400 uppercase tracking-widest">Skill Health</h3>
                            <div className="space-y-3">
                                {data.skill_breakdown.map((skill, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-white-300 font-medium">{skill.name}</span>
                                        <span className={`font-bold ${skill.score >= 80 ? 'text-lime-400' : 'text-lavender-400'}`}>{skill.score}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-soft p-6">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-2">Other Domains</h2>
                        <div className="space-y-3">
                            {data.all_available.filter(s => s.id !== data.recommended_simulation.id).map(sim => (
                                <button
                                    key={sim.id}
                                    onClick={() => onViewSim(sim.id)}
                                    className="w-full text-left p-4 rounded-2xl bg-gray-50 hover:bg-lavender-50 transition-all group border border-transparent hover:border-lavender-100"
                                >
                                    <p className="text-sm font-bold text-gray-900 group-hover:text-lavender-700 mb-1">{sim.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider group-hover:text-lavender-400">{sim.skill}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
