import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
    HomeIcon,
    BriefcaseIcon,
    ChartBarIcon,
    AcademicCapIcon,
    Bars3Icon,
    XMarkIcon,
    ChatBubbleLeftRightIcon,
    PuzzlePieceIcon,
    BeakerIcon,
    SparklesIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { Outlet, NavLink } from 'react-router-dom'
import { ChatProvider, useChat } from '../../context/ChatContext'
import { useAuth } from '../../context/AuthContext'
import ProfileEditor from '../profile/ProfileEditor'
import ChatAssistant from '../chat/ChatAssistant'
import SidebarProfile from './SidebarProfile'

const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Find Jobs', href: '/jobs', icon: BriefcaseIcon },
    { name: 'Skill Gaps', href: '/gaps', icon: ChartBarIcon },
    { name: 'Simulations', href: '/simulations', icon: BeakerIcon },
    { name: 'Learning', href: '/learning', icon: AcademicCapIcon },
    { name: 'Arcade', href: '/games', icon: PuzzlePieceIcon },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}



// Inner component access context
function LayoutContent() {
    const { user, logout } = useAuth()
    const { isOpen, openChat, closeChat } = useChat()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    return (
        <>
            <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">

                {/* 1. TOP NAVIGATION BAR */}
                <div className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20 shadow-sm">

                    {/* Logo Area - Visible on Desktop now too */}
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                        </button>

                        {/* Pathway Brand Logo (Login Style) */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="bg-[#8b5cf6] p-2 rounded-xl rounded-bl-none shadow-md shadow-purple-200 rotate-3">
                                    <BriefcaseIcon className="h-6 w-6 text-white" />
                                </div>
                                {/* The 'Smile' decorative stroke (scaled down) */}
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-[2px] border-b-[2px] border-[#84cc16] rounded-full"></div>
                            </div>
                            <span className="font-black text-2xl text-gray-900 tracking-tighter">Pathway</span>
                        </div>
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="hidden lg:flex items-center gap-2 flex-1 justify-center max-w-4xl mx-auto">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) =>
                                    classNames(
                                        isActive
                                            ? 'text-lime-800 bg-lime-100 ring-1 ring-lime-200 shadow-sm'
                                            : 'text-gray-500 hover:text-lime-700 hover:bg-lime-50/50',
                                        'px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-200'
                                    )
                                }
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </NavLink>
                        ))}
                    </div>

                    {/* Mobile Action / Placeholder */}
                    <div className="flex items-center gap-3">
                        {/* Ask Assistant Icon (Top Right) */}
                        <button
                            onClick={() => openChat()}
                            className="p-2 rounded-xl text-lime-600 hover:bg-lime-50 transition-colors"
                            title="Ask Assistant"
                        >
                            <SparklesIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>


                {/* MAIN CONTENT WRAPPER */}
                <div className="flex flex-1 overflow-hidden">

                    {/* 2. SIDEBAR (AnyChat Style - Fixed Layout) */}
                    <div className="hidden lg:flex lg:w-[320px] lg:flex-col lg:shrink-0 h-full border-r border-gray-100">
                        <div className="flex h-full flex-col bg-[#F5F3FF] p-6 relative overflow-hidden">

                            {/* Profile Section (Pinned Bottom & Transparent) */}
                            {/* mt-auto pushes this to the bottom of the flex container */}
                            <div className="mt-auto pb-2 overflow-y-auto custom-scrollbar">
                                <div className="transform transition-transform hover:-translate-y-1">
                                    <SidebarProfile
                                        user={user}
                                        onEdit={() => setIsEditing(true)}
                                        onLogout={logout}
                                        compact={true}
                                        transparent={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* 3. MOBILE SIDEBAR OVERLAY */}
                    <Transition.Root show={sidebarOpen} as={Fragment}>
                        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
                            <Transition.Child
                                as={Fragment}
                                enter="transition-opacity ease-linear duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="transition-opacity ease-linear duration-300"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="fixed inset-0 bg-gray-900/80" />
                            </Transition.Child>

                            <div className="fixed inset-0 flex">
                                <Transition.Child
                                    as={Fragment}
                                    enter="transition ease-in-out duration-300 transform"
                                    enterFrom="-translate-x-full"
                                    enterTo="translate-x-0"
                                    leave="transition ease-in-out duration-300 transform"
                                    leaveFrom="translate-x-0"
                                    leaveTo="-translate-x-full"
                                >
                                    <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[#F5F3FF] px-6 pb-4">
                                            <div className="flex h-16 shrink-0 items-center gap-2">
                                                <div className="relative">
                                                    <div className="bg-[#8b5cf6] p-2 rounded-xl rounded-bl-none shadow-md shadow-purple-200 rotate-3">
                                                        <BriefcaseIcon className="h-6 w-6 text-white" />
                                                    </div>
                                                    {/* The 'Smile' decorative stroke (scaled down) */}
                                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-[2px] border-b-[2px] border-[#84cc16] rounded-full"></div>
                                                </div>
                                                <h1 className="text-xl font-bold text-gray-900">Pathway</h1>
                                            </div>

                                            <nav className="flex flex-1 flex-col">
                                                <ul role="list" className="flex flex-1 flex-col gap-y-4">
                                                    {navigation.map((item) => (
                                                        <li key={item.name}>
                                                            <NavLink
                                                                to={item.href}
                                                                onClick={() => setSidebarOpen(false)}
                                                                className={({ isActive }) =>
                                                                    classNames(
                                                                        isActive
                                                                            ? 'bg-lavender-200 text-lavender-900 font-bold'
                                                                            : 'text-gray-600 hover:text-gray-900 hover:bg-lavender-100',
                                                                        'group flex gap-x-3 rounded-xl px-4 py-3 text-sm leading-6 font-medium transition-all'
                                                                    )
                                                                }
                                                            >
                                                                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                                                {item.name}
                                                            </NavLink>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </nav>

                                            <div className="mt-auto">
                                                <SidebarProfile
                                                    user={user}
                                                    onEdit={() => {
                                                        setSidebarOpen(false);
                                                        setIsEditing(true);
                                                    }}
                                                    onLogout={logout}
                                                />
                                            </div>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </Dialog>
                    </Transition.Root>


                    {/* 4. CONTENT AREA */}
                    <main className="flex-1 overflow-y-auto bg-gray-50">
                        <div className="py-8">
                            <Outlet />
                        </div>
                    </main>

                </div>
            </div>

            {/* Global Chat Overlay */}
            <ChatAssistant open={isOpen} onClose={closeChat} />

            <ProfileEditor
                open={isEditing}
                onClose={() => setIsEditing(false)}
                onSave={(updatedProfile) => {
                    console.log("Profile updated", updatedProfile);
                }}
            />
        </>
    )
}

export default function Layout() {
    return (
        <ChatProvider>
            <LayoutContent />
        </ChatProvider>
    )
}
