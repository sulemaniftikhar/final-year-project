import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPasswordModal = ({ isOpen, onClose, onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSent(true);
            toast.success('Reset link sent!');
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full relative">
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-8 sm:p-10">
                        {!isSent ? (
                            <>
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 font-bold text-2xl mx-auto mb-4">
                                        <Mail className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-2xl font-extrabold text-gray-900">Forgot Password?</h2>
                                    <p className="text-sm text-gray-500 mt-2 px-4">
                                        Enter your email address and we'll send you a link to reset your password.
                                    </p>
                                </div>

                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                required
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-4 rounded-xl shadow-lg text-sm font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-500/40"
                                    >
                                        {isLoading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : 'Send Reset Link'}
                                    </button>
                                </form>

                                <div className="text-center mt-6">
                                    <button
                                        onClick={onSwitchToLogin}
                                        className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Login
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Check your email</h2>
                                <p className="text-gray-500 mb-8 px-2">
                                    We've sent a password reset link to <br />
                                    <span className="font-bold text-gray-900">{email}</span>
                                </p>

                                <button
                                    onClick={onClose}
                                    className="w-full py-3.5 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-colors mb-4"
                                >
                                    Close
                                </button>

                                <button
                                    onClick={() => setIsSent(false)}
                                    className="text-sm font-bold text-purple-600 hover:underline"
                                >
                                    Click to resend
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
