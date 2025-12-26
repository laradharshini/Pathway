
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowUpIcon,
    ArrowDownTrayIcon,
    SparklesIcon,
    ChevronRightIcon,
    ChevronLeftIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function SimulationReflection({ result, sim, onDone, user, onBack }) {
    const navigate = useNavigate();
    const reportRef = useRef(null);

    // Process breakdown from result
    const technicalImpact = result?.breakdown?.filter(d => d.type === 'technical').reduce((sum, d) => sum + d.impact, 0) || 0;
    const commImpact = result?.breakdown?.find(d => d.type === 'communication')?.impact || 0;

    const skillDetails = [
        {
            skill: sim?.target_skill || 'Core Skill',
            impact: technicalImpact,
            detail: result?.summary || 'Demonstrated proficiency in resolving complex technical bottlenecks.'
        },
        {
            skill: 'Decision Justification',
            impact: commImpact,
            detail: 'Communicated technical rationale clearly, bridging the gap between implementation details and business value.'
        }
    ];

    const downloadPDF = async () => {
        const element = reportRef.current;
        if (!element) return;

        try {
            // Hide action buttons during capture
            const actions = element.querySelectorAll('.action-buttons-pdf');
            actions.forEach(a => a.style.display = 'none');

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            actions.forEach(a => a.style.display = 'flex');

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Pathway_Report_${user?.full_name?.replace(' ', '_') || 'Profile'}.pdf`);
        } catch (err) {
            console.error('PDF generation failed:', err);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    return (
        <div ref={reportRef} className="max-w-5xl mx-auto py-12 px-6">
            <button
                onClick={onBack}
                className="flex items-center text-sm font-bold text-gray-400 hover:text-gray-900 transition mb-8 group"
            >
                <ChevronLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </button>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden text-left">
                {/* Step Indicator - Matching Step 3 Style */}
                <div className="bg-[#8b5cf6] p-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-lime-400 flex items-center justify-center font-black text-xs text-black shadow-glow">4</div>
                        <div>
                            <p className="font-black text-xs uppercase tracking-widest text-lavender-200">Step 4: Reflection & Career Impact</p>
                            <p className="text-[10px] text-lavender-400 font-bold uppercase tracking-tight">Analyze your readiness score improvement and review the next steps.</p>
                        </div>
                    </div>
                    <div className="action-buttons-pdf pr-4">
                        <button
                            onClick={downloadPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold text-xs text-white transition-all backdrop-blur-sm"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            DOWNLOAD PDF
                        </button>
                    </div>
                </div>

                <div className="p-12 space-y-12">
                    {/* Header Section - Clean/Minimalized */}
                    <div className="pb-8 border-b border-gray-50 flex items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Simulation Accomplished</h1>
                            <p className="text-gray-500 font-medium tracking-tight">Validation of your {sim?.target_skill} reasoning is complete.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Result Spotlight */}
                        <div className="lg:col-span-12 xl:col-span-5">
                            <section className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-center border border-gray-800">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b5cf6] rounded-full blur-[100px] -mr-32 -mt-32 opacity-20"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#84cc16] rounded-full blur-[80px] -ml-24 -mb-24 opacity-10"></div>

                                <div className="relative z-10 space-y-8 text-center sm:text-left">
                                    <div>
                                        <h3 className="text-[10px] font-black text-[#A78BFA] uppercase tracking-[0.2em] mb-2">Role Readiness Impact</h3>
                                        <p className="text-gray-400 text-xs font-medium">Projected match for {sim?.role}</p>
                                    </div>

                                    <div className="flex items-center justify-center sm:justify-start gap-6">
                                        <div className="text-7xl font-black text-white tracking-tighter">
                                            {Math.min(100, Math.max(0, result?.after_score || 0)).toFixed(0)}<span className="text-3xl text-gray-500">%</span>
                                        </div>
                                        <div className="flex flex-col items-start bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                                            <span className="text-[#84cc16] font-black text-xl flex items-center">
                                                <ArrowUpIcon className="h-4 w-4 mr-1" strokeWidth={3} />
                                                {(result?.impact || 0).toFixed(1)}%
                                            </span>
                                            <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Growth</span>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/10">
                                        <p className="text-gray-400 text-xs font-semibold flex items-center gap-2 justify-center sm:justify-start">
                                            Previous Score:
                                            <span className="text-white">{(result?.before_score || 85).toFixed(0)}%</span>
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Feedback Section */}
                        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                            <section>
                                <div className="flex items-center justify-between mb-6 text-left">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <SparklesIcon className="h-4 w-4 text-[#8b5cf6]" />
                                        Decision-Driven Feedback
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {skillDetails.map((item, idx) => (
                                        <div key={idx} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start gap-6 hover:border-[#8b5cf6]/20 transition-all group">
                                            <div className="w-14 h-14 rounded-2xl bg-[#F5F3FF] text-[#8b5cf6] flex items-center justify-center font-black flex-shrink-0 border border-[#DDD6FE]/30 group-hover:bg-[#8b5cf6] group-hover:text-white transition-all shadow-sm">
                                                +{item.impact > 0 ? item.impact.toFixed(0) : 0}%
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h4 className="font-black text-gray-900 mb-2.5 flex items-center gap-2">
                                                    {item.skill}
                                                    <ChevronRightIcon className="h-3 w-3 text-gray-300 group-hover:translate-x-1 transition-transform" />
                                                </h4>
                                                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                                    {item.detail}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Footer Actions */}
                            <div className="action-buttons-pdf pt-8 flex flex-col sm:flex-row justify-end gap-4 overflow-hidden">
                                <button
                                    onClick={onDone}
                                    className="px-8 py-4 text-[13px] font-black text-gray-500 bg-white rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all hover:shadow-md"
                                >
                                    RETURN TO HUB
                                </button>
                                <button
                                    onClick={() => navigate('/jobs')}
                                    className="px-10 py-4 bg-[#8b5cf6] text-white font-black text-[13px] rounded-2xl hover:bg-[#7c3aed] shadow-lg shadow-[#8b5cf6]/20 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    APPLY FOR MATCHING JOBS
                                    <ChevronRightIcon className="h-4 w-4" strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
