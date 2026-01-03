
import { Fragment, useState, useRef, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { PaperAirplaneIcon, XMarkIcon, SparklesIcon, BriefcaseIcon } from '@heroicons/react/24/solid'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'

import { useChat } from '../../context/ChatContext';

export default function ChatAssistant({ open, onClose }) {
    const { token } = useAuth()
    const { initialMessage, setInitialMessage } = useChat(); // Consumption

    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hi! I\'m your Pathway Assistant. How can I help you accelerate your career today?' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)

    // Auto-send initial message if present
    useEffect(() => {
        if (open && initialMessage) {
            handleAutoSend(initialMessage);
            setInitialMessage(''); // Clear it so it doesn't resend
        }
    }, [open, initialMessage]);

    // Independent handler for auto-sending (bypassing event)
    const handleAutoSend = async (text) => {
        const userMsg = { role: 'user', text: text }
        // ... (Logic duplicated or refactored below)
        // For cleaner code, I will refactor logic in next step or use simple approach:
        // Just copy logic here for safety
        setMessages(prev => [...prev, userMsg])
        setLoading(true)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: text })
            })

            const data = await res.json()
            if (data.error) throw new Error(data.error)

            setMessages(prev => [...prev, { role: 'assistant', text: data.response }])
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting to the network." }])
        } finally {
            setLoading(false)
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMsg = { role: 'user', text: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: input })
            })

            const data = await res.json()
            if (data.error) throw new Error(data.error)

            setMessages(prev => [...prev, { role: 'assistant', text: data.response }])
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting to the network." }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-20 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-[#FDFDFD] shadow-2xl">
                                        {/* Header */}
                                        <div className="bg-white px-6 py-4 sm:px-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="bg-[#8b5cf6] p-2 rounded-xl rounded-bl-none shadow-md shadow-purple-200 rotate-3">
                                                        <BriefcaseIcon className="h-6 w-6 text-white" />
                                                    </div>
                                                    {/* The 'Smile' decorative stroke (scaled down) */}
                                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-[2px] border-b-[2px] border-[#84cc16] rounded-full"></div>
                                                </div>
                                                <div>
                                                    <Dialog.Title className="text-base font-bold text-gray-900 leading-tight">
                                                        Pathway Assistant
                                                    </Dialog.Title>

                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="rounded-md text-gray-400 hover:text-gray-500 transition-colors"
                                                onClick={onClose}
                                            >
                                                <XMarkIcon className="h-5 w-5" />
                                            </button>
                                        </div>

                                        {/* Chat Area */}
                                        <div className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto bg-gray-50">
                                            <div className="space-y-6">
                                                {messages.map((msg, idx) => (
                                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                        {msg.role === 'assistant' && (
                                                            <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-2 flex-shrink-0 shadow-sm">
                                                                <SparklesIcon className="h-4 w-4 text-[#8b5cf6]" />
                                                            </div>
                                                        )}
                                                        <div
                                                            className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm
                                                                ${msg.role === 'user'
                                                                    ? 'bg-lime-100 text-lime-900 rounded-tr-sm'
                                                                    : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm'
                                                                }`}
                                                        >
                                                            {msg.text}
                                                        </div>
                                                    </div>
                                                ))}
                                                {loading && (
                                                    <div className="flex justify-start">
                                                        <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center mr-2">
                                                            <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                                                        </div>
                                                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm">
                                                            <div className="flex space-x-1">
                                                                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                                                                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></div>
                                                                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                <div ref={messagesEndRef} />
                                            </div>
                                        </div>

                                        {/* Input Area */}
                                        <div className="px-4 py-4 bg-white border-t border-gray-100 sm:px-6">
                                            <form onSubmit={handleSend} className="flex items-center gap-2 bg-gray-50 p-2 rounded-full border border-gray-100 focus-within:ring-2 focus-within:ring-[#8b5cf6] transition-all">
                                                <input
                                                    type="text"
                                                    value={input}
                                                    onChange={(e) => setInput(e.target.value)}
                                                    placeholder="Ask anything..."
                                                    className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 placeholder:text-gray-400 px-4 text-sm"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!input.trim() || loading}
                                                    className="inline-flex items-center justify-center rounded-full bg-[#8b5cf6] p-2 text-white shadow-sm hover:bg-[#8b5cf6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
                                                >
                                                    <PaperAirplaneIcon className="h-5 w-5 -ml-0.5 mt-0.5" aria-hidden="true" />
                                                </button>
                                            </form>
                                            <div className="mt-2 text-center">
                                                <p className="text-[10px] text-gray-400">Pathway AI may display inaccurate info.</p>
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
