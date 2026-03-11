import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Loader, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../../features/admin/AdminAuthContext';
import toast from 'react-hot-toast';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { isAdminAuthenticated, adminLogin } = useAdminAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // If already authenticated, redirect to dashboard
    useEffect(() => {
        if (isAdminAuthenticated) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [isAdminAuthenticated, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await adminLogin(formData.email, formData.password);
            if (result.success) {
                // AuthContext will update isAdminAuthenticated; navigate on next render via useEffect
                toast.success('Welcome back, Admin!');
            } else {
                setError(result.message || 'Invalid credentials');
                toast.error(result.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
            toast.error('Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-neutral-900">
            {/* Subtle Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl -top-40 -right-40"></div>
                <div className="absolute w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl bottom-0 -left-20"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]"></div>
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }}></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-2xl shadow-2xl shadow-black/50 mb-6 border border-neutral-600/50">
                        <ShieldCheck className="w-10 h-10 text-primary-500" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                        Admin Access
                    </h1>
                    <p className="text-neutral-400 text-sm">
                        OrderIQ Control Panel — Authorized personnel only
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-neutral-800/80 backdrop-blur-xl rounded-2xl p-8 border border-neutral-700/50 shadow-2xl shadow-black/30">
                    {/* Error Banner */}
                    {error && (
                        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-neutral-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-neutral-900/80 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    placeholder="admin@orderiq.com"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-neutral-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                <input
                                    required
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-12 py-3.5 bg-neutral-900/80 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2"
                        >
                            {isLoading ? (
                                <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-neutral-600 text-xs">
                        This area is restricted to authorized administrators.
                    </p>
                    <p className="text-neutral-600 text-xs mt-1">
                        &copy; {new Date().getFullYear()} OrderIQ. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
