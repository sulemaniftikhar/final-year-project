import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginUser, logoutUser, getCurrentUserProfile } from '../../services/auth.service';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup, onForgotPassword }) => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Step 1: Firebase login
            await loginUser(formData.email, formData.password);

            // Step 2: Fetch DB profile to determine role
            const profileRes = await getCurrentUserProfile();
            // Handle both response shapes: { data: { role } } or { role }
            const dbRole = profileRes?.data?.role || profileRes?.role;
            console.log('[LoginModal] Profile response:', profileRes);
            console.log('[LoginModal] Detected role:', dbRole);

            // Step 3: Route based on role (no tab selection needed)
            toast.success('Welcome back!');
            onClose();

            if (dbRole === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (dbRole === 'RESTAURANT_OWNER') {
                navigate('/restaurant/dashboard');
            } else if (dbRole === 'CUSTOMER') {
                navigate('/customer/home');
            } else {
                // Unknown role - log and redirect to home
                console.warn('[LoginModal] Unknown role:', dbRole, '— redirecting to home');
                navigate('/');
            }
        } catch (error) {
            const code = error.code;
            if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
                toast.error('No account found. Please sign up first.');
            } else if (code === 'auth/wrong-password') {
                toast.error('Incorrect password. Please try again.');
            } else if (code === 'auth/too-many-requests') {
                toast.error('Too many failed attempts. Try again later.');
            } else {
                toast.error(error.message || 'Login failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full relative">
                    <button onClick={onClose} className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10">
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-8 sm:p-10">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-purple-500/30">
                                OQ
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
                            <p className="text-sm text-gray-500 mt-2">Sign in to continue to your dashboard</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-gray-700">Password</label>
                                    <button type="button" onClick={onForgotPassword} className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline">
                                        Forgot?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        required
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-500/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : 'Sign In'}
                            </button>

                            <div className="text-center text-sm text-gray-600 mt-6">
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => { onClose(); navigate('/register'); }}
                                    className="font-bold text-purple-600 hover:text-purple-700 hover:underline"
                                >
                                    Sign up
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
