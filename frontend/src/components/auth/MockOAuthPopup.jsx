
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const MockOAuthPopup = () => {
    const { provider } = useParams();
    const [step, setStep] = useState('select'); // 'select' | 'verify'

    const handleAccountSelect = (account) => {
        setStep('verify');

        // Simulate Verification Delay after selection
        setTimeout(() => {
            if (window.opener) {
                window.opener.postMessage({
                    type: 'OAUTH_SUCCESS',
                    provider: provider,
                    user: account
                }, window.location.origin);
                window.close();
            }
        }, 1500);
    };

    const mockAccounts = [
        { name: 'Lara Dharshini', email: 'lara@example.com', img: 'https://ui-avatars.com/api/?name=Lara+Dharshini&background=random' },
        { name: 'Demo User', email: 'demo@example.com', img: 'https://ui-avatars.com/api/?name=Demo+User&background=random' }
    ];

    if (step === 'select') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        {provider === 'Google' ? (
                            <svg className="h-8 w-8 mx-auto mb-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        ) : (
                            <svg className="h-8 w-8 mx-auto mb-2 fill-[#0077b5]" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                        )}
                        <h2 className="text-xl font-medium text-gray-800">Choose an account</h2>
                        <p className="text-sm text-gray-600">to continue to Pathway</p>
                    </div>

                    <div className="space-y-2 border border-gray-200 rounded-lg overflow-hidden">
                        {mockAccounts.map((account) => (
                            <button
                                key={account.email}
                                onClick={() => handleAccountSelect(account)}
                                className="w-full flex items-center p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors text-left"
                            >
                                <img src={account.img} alt={account.name} className="h-10 w-10 rounded-full mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{account.name}</p>
                                    <p className="text-xs text-gray-500">{account.email}</p>
                                </div>
                            </button>
                        ))}
                        <button className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors text-left">
                            <div className="h-10 w-10 rounded-full bg-gray-100 mr-3 flex items-center justify-center">
                                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-700">Use another account</p>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Verify Step (Existing Loading UI)
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <div className="p-8 text-center max-w-sm w-full">
                {/* Mock Google Header */}
                {provider === 'Google' && (
                    <div className="flex flex-col items-center">
                        <svg className="h-10 w-10 mb-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <h2 className="text-xl font-medium text-gray-800 mb-1">Verifying...</h2>
                        <p className="text-sm text-gray-600 mb-6">Communicating with {provider}</p>
                    </div>
                )}

                {/* Mock LinkedIn Header */}
                {provider === 'LinkedIn' && (
                    <div className="flex flex-col items-center">
                        <svg className="h-10 w-10 mb-4 fill-[#0077b5]" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                        <h2 className="text-xl font-medium text-gray-800 mb-1">Verifying...</h2>
                        <p className="text-sm text-gray-600 mb-6">Communicating with {provider}</p>
                    </div>
                )}

                <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                    <div className="h-full bg-blue-500 animate-[loading_2s_ease-in-out_infinite] w-full origin-left"></div>
                </div>
                <p className="text-xs text-gray-400 mt-4">This is a simulated secure window.</p>
            </div>

            <style>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

export default MockOAuthPopup;
