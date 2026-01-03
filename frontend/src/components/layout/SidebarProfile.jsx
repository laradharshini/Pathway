
import React from 'react';
import { BriefcaseIcon, CalendarIcon, MapPinIcon, PencilIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const SidebarProfile = ({ user, onEdit, onLogout, transparent = false, compact = false }) => {
    if (!user) return null;

    // Use default/fallback values if data is missing
    const role = user.target_role || 'Not Set';
    const exp = user.experience_level || 'Not Set';
    const loc = user.location || 'Remote';
    const skills = Array.isArray(user.skills) ? user.skills : []; // Show all skills

    return (
        <div className={`w-full ${transparent ? '' : 'bg-white rounded-3xl p-6 shadow-sm border border-gray-100'}`}>

            {/* Avatar & Basic Info - Unified Left Alignment */}
            <div className={`flex items-center gap-4 pt-1 ${compact ? 'mb-4' : 'mb-6'}`}>
                <div className="relative shrink-0">
                    <div className={`${compact ? 'w-16 h-16 text-xl' : 'w-20 h-20 text-2xl'} rounded-full bg-white flex items-center justify-center font-black text-lavender-600 shadow-md border border-lavender-100 overflow-hidden`}>
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                        ) : (
                            user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'
                        )}
                    </div>
                    {/* Status Dot - Refined Position */}
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#84cc16] rounded-full border-[3px] border-white shadow-sm"></div>
                </div>
                <div className="text-left">
                    <h2 className={`${compact ? 'text-lg' : 'text-xl'} font-black text-gray-900 tracking-tight leading-tight`}>{user.full_name || 'User'}</h2>
                    <p className="text-[10px] text-lavender-500 font-bold uppercase tracking-widest mt-1">Aspiring {role}</p>
                </div>
            </div>

            {/* Details List */}
            <div className={`space-y-4 ${compact ? 'mb-6' : 'mb-8'}`}>
                <div className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-white border border-lavender-50 flex items-center justify-center text-lavender-600 shrink-0 shadow-sm group-hover:border-lavender-200 transition-colors">
                        <BriefcaseIcon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Target Role</p>
                        <p className="text-sm font-black text-gray-900">{role}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-white border border-lavender-50 flex items-center justify-center text-lavender-600 shrink-0 shadow-sm group-hover:border-lavender-200 transition-colors">
                        <CalendarIcon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Experience</p>
                        <p className="text-sm font-black text-gray-900">{exp}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-white border border-lavender-50 flex items-center justify-center text-lavender-600 shrink-0 shadow-sm group-hover:border-lavender-200 transition-colors">
                        <MapPinIcon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Location</p>
                        <p className="text-sm font-black text-gray-900">{loc}</p>
                    </div>
                </div>

                {user.bio && (
                    <div className="pt-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">About</p>
                        <p className="text-xs text-gray-600 leading-relaxed font-medium line-clamp-3">{user.bio}</p>
                    </div>
                )}
            </div>

            {/* Skills */}
            <div className={compact ? 'mb-6' : 'mb-8'}>
                <p className="text-[12px] text-gray-400 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1 h-1 bg-lavender-400 rounded-full"></span>
                    Top Skills
                </p>
                <div className="flex flex-wrap gap-2 justify-start">
                    {skills.length > 0 ? (
                        skills.map((skill, idx) => {
                            const name = typeof skill === 'string' ? skill : skill.name;
                            return (
                                <span key={idx} className="px-3 py-1.5 bg-lime-100 text-lime-800 text-[12px] font-black rounded-lg border border-lime-100/50 shadow-sm hover:bg-lime-50 transition-colors cursor-default">
                                    {name}
                                </span>
                            );
                        })
                    ) : (
                        <span className="text-xs text-gray-400 italic font-medium">No skills added</span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 mt-6">
                <button
                    onClick={onEdit}
                    className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#8b5cf6] text-white shadow-lg shadow-purple-100 rounded-2xl font-black hover:bg-[#7c3aed] transition-all text-xs tracking-widest group"
                >
                    <PencilIcon className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                    EDIT PROFILE
                </button>

                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-3 py-3 bg-white text-gray-400 hover:text-red-500 rounded-2xl font-black transition-all text-[10px] tracking-widest group"
                >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    LOG OUT
                </button>
            </div>
        </div>
    );
};

export default SidebarProfile;
