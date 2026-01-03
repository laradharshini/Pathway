import { Fragment, useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

export default function ProfileEditor({ open, onClose, onSave }) {
    const { user, token, logout, updateUser } = useAuth();
    const [profile, setProfile] = useState({
        target_role: user?.target_role || '',
        skills: user?.skills || [],
        full_name: user?.full_name || '',
        experience_level: user?.experience_level || 'Entry Level',
        location: user?.location || '',
        avatar_url: user?.avatar_url || null,
        bio: user?.bio || '',
        linkedin_url: user?.linkedin_url || '',
        github_url: user?.github_url || ''
    });
    const [newSkill, setNewSkill] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Fetch current profile when modal opens
    useEffect(() => {
        if (open && user) {
            // Use user data from AuthContext which should be decent, 
            // but for editing we might want to fetch fresh to be safe
            const fetchProfile = async () => {
                try {
                    const res = await fetch('/api/candidate/profile', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setProfile({
                            target_role: data.target_role || '',
                            skills: Array.isArray(data.skills)
                                ? data.skills.map(s => typeof s === 'string' ? { name: s, proficiency: 'intermediate' } : s)
                                : [],
                            full_name: data.full_name || user.full_name || '',
                            experience_level: data.experience_level || 'Entry Level',
                            location: data.location || '',
                            avatar_url: data.avatar_url || null,
                            bio: data.bio || '',
                            linkedin_url: data.linkedin_url || '',
                            github_url: data.github_url || ''
                        });
                    }
                } catch (e) {
                    console.error("Profile fetch error", e);
                }
            }
            fetchProfile();
        }
    }, [open, token, user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create a preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, avatar_url: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddSkill = () => {
        const val = newSkill.trim();
        if (val && !profile.skills.some(s => s.name.toLowerCase() === val.toLowerCase())) {
            setProfile(prev => ({
                ...prev,
                skills: [...prev.skills, { name: val, proficiency: 'intermediate', verified: false }]
            }));
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillName) => {
        setProfile(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s.name !== skillName)
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        console.log("DEBUG: Saving profile...", profile);
        try {
            const res = await fetch('/api/candidate/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profile)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to save profile");
            }

            const data = await res.json();
            console.log("DEBUG: Profile saved successfully, server returned:", data);

            // Use the authoritative profile from server if available
            const updatedProfile = data.profile || profile;

            console.log("DEBUG: Updating AuthContext with:", updatedProfile);
            updateUser(updatedProfile);

            if (onSave) onSave(updatedProfile);
            onClose();
        } catch (err) {
            console.error("DEBUG: Profile save failed:", err);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-10 border border-gray-100">

                                {/* Header */}
                                <div className="text-center sm:text-left mb-6">
                                    <Dialog.Title as="h3" className="text-3xl font-bold leading-6 text-gray-900">
                                        Edit profile
                                    </Dialog.Title>
                                </div>

                                {/* Photo Section */}
                                <div className="mb-8">
                                    <h4 className="text-sm font-bold text-gray-900 mb-3">Profile photo</h4>
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-2xl bg-lavender-200 flex items-center justify-center text-3xl font-bold text-lavender-700 shadow-inner overflow-hidden relative">
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <h5 className="font-bold text-gray-900 text-sm">Upload your photo</h5>
                                            <p className="text-xs text-gray-500">Your photo should be in PNG or JPG format</p>
                                            <div className="flex gap-3 mt-1">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    accept="image/png, image/jpeg"
                                                    onChange={handleFileChange}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="px-4 py-2 bg-white border border-gray-300 rounded-full text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                                                >
                                                    {profile.avatar_url ? 'Change photo' : 'Choose image'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setProfile(prev => ({ ...prev, avatar_url: null }));
                                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                                    }}
                                                    disabled={!profile.avatar_url}
                                                    className={`text-xs font-bold transition-colors ${!profile.avatar_url ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-500'}`}
                                                >
                                                    Reset to default
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-5">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-sm font-bold leading-6 text-gray-900">Full name</label>
                                        <input
                                            type="text"
                                            className="block w-full rounded-2xl border-0 py-3 px-4 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 font-medium"
                                            value={profile.full_name}
                                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                            placeholder="e.g. Emily"
                                        />
                                    </div>

                                    {/* Target Role */}
                                    <div>
                                        <label className="block text-sm font-bold leading-6 text-gray-900">Target Role</label>
                                        <input
                                            type="text"
                                            className="block w-full rounded-2xl border-0 py-3 px-4 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 font-medium"
                                            value={profile.target_role}
                                            onChange={(e) => setProfile({ ...profile, target_role: e.target.value })}
                                            placeholder="e.g. Data Scientist"
                                        />
                                    </div>

                                    {/* Experience Level */}
                                    <div>
                                        <label className="block text-sm font-bold leading-6 text-gray-900">Experience Level</label>
                                        <select
                                            className="block w-full rounded-2xl border-0 py-3 px-4 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 font-medium"
                                            value={profile.experience_level}
                                            onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
                                        >
                                            <option value="Entry Level">Entry Level (1-2 Years)</option>
                                            <option value="Mid Level">Mid Level (3-5 Years)</option>
                                            <option value="Senior Level">Senior Level (5+ Years)</option>
                                            <option value="Executive">Executive</option>
                                        </select>
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-bold leading-6 text-gray-900">Location</label>
                                        <input
                                            type="text"
                                            className="block w-full rounded-2xl border-0 py-3 px-4 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 font-medium"
                                            value={profile.location}
                                            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                            placeholder="-Select your country-"
                                        />
                                    </div>

                                    {/* Bio */}
                                    <div>
                                        <label className="block text-sm font-bold leading-6 text-gray-900">Bio</label>
                                        <textarea
                                            rows={3}
                                            className="block w-full rounded-2xl border-0 py-3 px-4 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 font-medium"
                                            value={profile.bio}
                                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                            placeholder="Tell us a bit about yourself..."
                                        />
                                    </div>

                                    {/* Social Links */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold leading-6 text-gray-900">LinkedIn URL</label>
                                            <input
                                                type="url"
                                                className="block w-full rounded-2xl border-0 py-3 px-4 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 font-medium"
                                                value={profile.linkedin_url}
                                                onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                                                placeholder="https://linkedin.com/in/..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold leading-6 text-gray-900">GitHub URL</label>
                                            <input
                                                type="url"
                                                className="block w-full rounded-2xl border-0 py-3 px-4 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 font-medium"
                                                value={profile.github_url}
                                                onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                                                placeholder="https://github.com/..."
                                            />
                                        </div>
                                    </div>

                                    {/* Skills Tagging */}
                                    <div>
                                        <label className="block text-sm font-bold leading-6 text-gray-900">Skills</label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {profile.skills.map((skill, idx) => (
                                                <span key={idx} className="inline-flex items-center rounded-xl bg-lavender-100 px-3 py-1 text-sm font-bold text-lavender-700 ring-1 ring-inset ring-lavender-200">
                                                    {skill.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSkill(skill.name)}
                                                        className="ml-2 inline-flex items-center rounded-full text-lavender-400 hover:text-lavender-900"
                                                    >
                                                        <XCircleIcon className="h-4 w-4" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="block w-full rounded-2xl border-0 py-3 px-4 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 font-medium"
                                                placeholder="Add a skill"
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddSkill}
                                                className="rounded-2xl bg-[#8b5cf6] px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#7c3aed] transition-all"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 sm:flex sm:flex-row-reverse gap-3">
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-2xl bg-[#8b5cf6] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#7c3aed] transition-all sm:w-auto"
                                        onClick={handleSave}
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Save profile'}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-900 shadow-none hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
