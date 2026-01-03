
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import { BriefcaseIcon } from '@heroicons/react/24/solid';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsVerifying(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to sign in');
        } finally {
            setIsVerifying(false);
        }
    };

    // Simulated Social Login Handler with Popup
    const handleSocialLogin = (provider) => {
        setIsVerifying(true);
        setError('');

        // Calculate center position for popup
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        // Open the Mock Provider Popup
        // Using window.open to simulate the "verification window" experience
        const popup = window.open(
            `/mock-oauth/${provider}`,
            `Sign In with ${provider}`,
            `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
            setError('Popup blocked! Please allow popups for this site.');
            setIsVerifying(false);
            return;
        }

        // Listen for success message from popup
        const receiveMessage = async (event) => {
            // Ensure security by checking origin
            if (event.origin !== window.location.origin) return;

            if (event.data.type === 'OAUTH_SUCCESS' && event.data.provider === provider) {
                // Cleanup listener
                window.removeEventListener('message', receiveMessage);

                try {
                    console.log(`Verified ${provider} account via popup.`);

                    // Exchange mock data for REAL session from Backend
                    const mockUser = event.data.user || {};
                    const payload = {
                        email: mockUser.email || `user@${provider.toLowerCase()}.com`,
                        full_name: mockUser.name || `Verified ${provider} User`,
                        role: 'candidate',
                        provider: provider
                    };

                    const response = await fetch('http://localhost:5000/api/auth/social-mock', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        throw new Error('Social login failed');
                    }

                    const data = await response.json();

                    // Login with REAL token
                    await login(data.access_token, data.user);

                    navigate('/');
                } catch (err) {
                    console.error("Social login error:", err);
                    setError(`${provider} login failed.`);
                    setIsVerifying(false);
                }
            }
        };

        window.addEventListener('message', receiveMessage);

        // Optional: Check if popup closed manually without success
        const timer = setInterval(() => {
            if (popup.closed) {
                clearInterval(timer);
                setTimeout(() => {
                    // Check if we are still on login page to see if login failed/closed
                    if (window.location.pathname.includes('login')) {
                        setIsVerifying(false);
                    }
                }, 500);
            }
        }, 1000);
    };

    return (
        <AuthLayout>
            <div className="w-full flex flex-col items-center">
                {/* Pathway Logo Style: Purple Box with Lime Sparkle (Now Briefcase for Job) */}
                <div className="mb-6 relative">
                    <div className="bg-[#8b5cf6] p-5 rounded-3xl rounded-bl-none shadow-lg shadow-purple-200 rotate-3">
                        <BriefcaseIcon className="h-10 w-10 text-white" />
                    </div>
                    {/* The 'Smile' decorative stroke */}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-[4px] border-b-[4px] border-[#84cc16] rounded-full"></div>
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                        Pathway
                    </h1>
                    <p className="text-gray-500 text-sm">To continue, kindly log in with your account</p>
                </div>

                <form className="w-full space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="Email address"
                            className="block w-full rounded-2xl border-gray-300 bg-gray-50 py-3.5 px-4 text-gray-900 shadow-sm focus:border-[#8b5cf6] focus:ring-[#8b5cf6] sm:text-sm transition-shadow text-center placeholder:text-gray-400"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="Password"
                            className="block w-full rounded-2xl border-gray-300 bg-gray-50 py-3.5 px-4 text-gray-900 shadow-sm focus:border-[#8b5cf6] focus:ring-[#8b5cf6] sm:text-sm transition-shadow text-center placeholder:text-gray-400"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={isVerifying}
                        className="flex w-full justify-center rounded-2xl bg-[#1f2937] px-3 py-3.5 text-sm font-bold leading-6 text-white shadow-xl shadow-gray-200 hover:bg-black hover:scale-[1.02] transition-all duration-200 disabled:opacity-70"
                    >
                        Sign in
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            New to Pathway?{' '}
                            <Link to="/signup" className="font-bold text-[#8b5cf6] hover:text-[#7c3aed] hover:underline">
                                Signup here
                            </Link>
                        </p>
                    </div>
                </form>

                <div className="mt-8 w-full">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-400 text-xs">OR CONTINUE WITH</span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center gap-4">
                        {/* Google Button - Popup */}
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('Google')}
                            disabled={isVerifying}
                            className="h-12 w-12 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all shadow-sm"
                            title="Sign in with Google"
                        >
                            {isVerifying ? (
                                <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-[#4285F4] rounded-full"></div>
                            ) : (
                                <svg className="h-6 w-6" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            )}
                        </button>

                        {/* LinkedIn Button - Popup */}
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('LinkedIn')}
                            disabled={isVerifying}
                            className="h-12 w-12 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all shadow-sm"
                            title="Sign in with LinkedIn"
                        >
                            {isVerifying ? (
                                <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-[#0077b5] rounded-full"></div>
                            ) : (
                                <svg className="h-6 w-6 fill-[#0077b5]" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                            )}
                        </button>
                    </div>

                    {isVerifying && (
                        <p className="text-center text-xs text-gray-500 mt-4 animate-pulse">
                            Secure Verification in progress...
                        </p>
                    )}
                </div>
            </div>
        </AuthLayout>
    );
}
