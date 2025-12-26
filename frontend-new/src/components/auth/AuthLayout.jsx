
import React from 'react';
import {
    CheckCircleIcon,
    SparklesIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center font-sans">

            {/* --- BACKGROUND BLOBS (Clone of Original) --- */}

            {/* 1. Large Light Lime Semicircle (Right Edge) */}
            <div className="absolute top-[10%] right-0 translate-x-[20%] w-[600px] h-[700px] bg-[#d9f99d] rounded-l-full mix-blend-multiply opacity-80 hidden xl:block -z-10 transform rotate-12"></div>

            {/* 2. Smaller Green Blob (Intersecting) */}
            <div className="absolute bottom-[20%] right-0 translate-x-[30%] w-[400px] h-[400px] bg-[#bef264] rounded-full mix-blend-multiply opacity-90 hidden xl:block -z-10"></div>


            {/* --- LEFT FLOATING ELEMENTS --- */}

            {/* 3. Top Left: Code Icon < /> (Lime Green text, simple) */}
            <div className="absolute top-[22%] left-[15%] hidden xl:block animate-bounce delay-1000">
                <div className="text-[#84cc16] font-mono text-4xl font-bold rotate-[-12deg] select-none">
                    &lt;/&gt;
                </div>
            </div>

            {/* 4. Mid Left: Bubbles (Exact AnyChat Colors) */}
            <div className="absolute top-[35%] left-[6%] hidden xl:flex flex-col gap-8 max-w-[280px]">

                {/* Top Bubble: "Hi !!" (Yellowish Lime) */}
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" alt="User" />
                    </div>
                    <div className="bg-[#f0fdf4] text-gray-800 p-4 rounded-xl rounded-tl-none shadow-sm relative w-full border border-green-50">
                        <p className="text-sm font-bold text-gray-900 mb-1">Hi !!</p>
                        <p className="text-xs text-gray-600">Gap in Python detected.</p>
                    </div>
                </div>

                {/* Bottom Bubble: "How do..." (Greenish Lime) */}
                <div className="flex items-start gap-4 ml-12">
                    <div className="w-10 h-10 rounded-full bg-lime-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Coach" />
                    </div>
                    <div className="bg-[#ecfccb] text-gray-800 p-4 rounded-xl rounded-tl-none shadow-sm w-full border border-lime-100">
                        <p className="text-xs text-gray-700">Recommended: "Data Structures 101"</p>
                    </div>
                </div>

                {/* Arrow pointing to card (Green Arc) */}
                <svg className="absolute top-[90%] left-[80%] w-32 h-20 text-[#84cc16] -z-10 opacity-80 rotate-12" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M10 40 Q 50 40, 90 10" markerEnd="url(#arrowhead)" />
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#84cc16" />
                        </marker>
                    </defs>
                </svg>

                {/* 5. Bottom Left: Thumbs Up (Light Purple Box) */}
                <div className="absolute top-[120%] left-0 p-3 bg-[#e0e7ff] rounded-2xl shadow-sm text-[#6366f1] -rotate-12">
                    <CheckCircleIcon className="h-6 w-6" />
                </div>
            </div>


            {/* --- RIGHT FLOATING ELEMENTS --- */}

            {/* 6. Top Right: Lightbulb (Purple Box) */}
            <div className="absolute top-[20%] right-[22%] hidden xl:block z-20">
                <div className="bg-[#e0e7ff] p-4 rounded-2xl rounded-bl-none shadow-sm w-16 h-16 flex items-center justify-center relative rotate-6 border border-indigo-50">
                    <SparklesIcon className="h-8 w-8 text-[#6366f1]" />
                </div>
            </div>

            {/* 7. Mid Right: The "Cat Card" Clone (Lime Background Frame) */}
            <div className="absolute top-[32%] right-[8%] hidden xl:block max-w-[300px] transition-transform hover:scale-105 duration-500 z-10">
                {/* The Lime Green Container Frame (Exact Match) */}
                <div className="bg-[#ecfccb] p-4 pb-8 rounded-[2rem] shadow-xl rotate-[-3deg] relative border border-lime-100/50">

                    {/* Header Text inside Lime */}
                    <p className="text-xs font-semibold text-gray-700 ml-2 mb-3">Pathway Job Match</p>

                    {/* The Inner Image Card */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-inner border border-white/60 relative h-36 w-56 flex items-center justify-center group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90 group-hover:scale-110 transition-transform duration-700"></div>
                        {/* Mock Graph Over Image */}
                        <div className="relative z-10 flex items-end gap-1.5 h-16 w-32 pb-1">
                            <div className="w-1/5 bg-white/20 h-[40%] rounded-t-sm backdrop-blur-sm"></div>
                            <div className="w-1/5 bg-white/30 h-[60%] rounded-t-sm backdrop-blur-sm"></div>
                            <div className="w-1/5 bg-white/40 h-[30%] rounded-t-sm backdrop-blur-sm"></div>
                            <div className="w-1/5 bg-white/90 h-[90%] rounded-t-sm shadow-lg"></div>
                            <div className="w-1/5 bg-white/50 h-[50%] rounded-t-sm backdrop-blur-sm"></div>
                        </div>
                    </div>

                    {/* Heart Icon (Lime Green Circle on Edge) */}
                    <div className="absolute top-1/2 -left-5 -translate-y-1/2 p-2.5 bg-[#84cc16] rounded-full shadow-lg border-[3px] border-white text-white">
                        <CheckCircleIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* 8. Bottom Right: Pencil (Purple Box) */}
            <div className="absolute bottom-[20%] right-[15%] hidden xl:flex flex-col items-center gap-4 z-20">
                <div className="bg-[#8b5cf6] p-4 rounded-xl text-white shadow-lg rotate-[15deg]">
                    <ChartBarIcon className="h-6 w-6" />
                </div>
                {/* Green Triangle (Solid) */}
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-b-[20px] border-b-[#84cc16] border-r-[10px] border-r-transparent rotate-12 mt-2 opacity-80"></div>
            </div>

            {/* Squiggle */}
            <svg className="absolute bottom-[25%] right-[25%] text-[#c4b5fd] w-24 h-6 hidden xl:block" viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="4">
                <path d="M0 10 Q 10 0, 20 10 T 40 10 T 60 10 T 80 10" />
            </svg>


            {/* --- CENTRAL CARD CONTAINER (Purple Border match) --- */}
            <div className="relative z-30 w-full max-w-md px-6">
                {/* Added correct border color and thickness from reference */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl border-[3px] border-[#8b5cf6] overflow-hidden p-10 text-center relative">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
