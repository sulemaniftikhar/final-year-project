import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Store, ArrowRight, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../../components/auth/LoginModal';
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal';
const RoleSelection = () => {
    const navigate = useNavigate();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isForgotOpen, setIsForgotOpen] = useState(false);

    const handleOpenLogin = () => {
        setIsForgotOpen(false);
        setIsLoginOpen(true);
    };

    const handleOpenForgot = () => {
        setIsLoginOpen(false);
        setIsForgotOpen(true);
    };

    return (
        <>
            <LoginModal
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onForgotPassword={handleOpenForgot} />
            <ForgotPasswordModal
                isOpen={isForgotOpen}
                onClose={() => setIsForgotOpen(false)}
                onSwitchToLogin={handleOpenLogin} />

            <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">

                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
                    <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl top-1/2 right-0 animate-pulse delay-700"></div>
                    <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 left-1/3 animate-pulse delay-1000"></div>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMCAwdjItMnptLTIgMmgyLTJ6bTAgMGgyLTJ6bS0yLTJoMi0yem0wIDBoMi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
                </div>

                <div className="max-w-5xl w-full relative z-10">
                    {/* Header */}
                    <div className="text-center mb-16 animate-fade-in-up">
                        <Link to="/" className="inline-flex items-center gap-3 mb-8">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 shadow-xl">
                                OQ
                            </div>
                            <span className="text-2xl font-bold text-white">OrderIQ</span>
                        </Link>

                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-medium border border-white/20 mb-6">
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                            <span>Join 10,000+ happy users</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
                            Choose Your Journey
                        </h1>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            Create your account and start experiencing the future of food ordering
                        </p>
                    </div>

                    {/* Role Cards */}
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        {/* Customer Card */}
                        <Link to="/register/customer" className="group relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                            <div className="relative h-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-2">
                                <div className="flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform">
                                            <User className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-full border border-green-500/30">
                                            <Zap className="w-3 h-3" />
                                            <span>Quick Setup</span>
                                        </div>
                                    </div>

                                    <h2 className="text-3xl font-bold text-white mb-3">I'm a Customer</h2>
                                    <p className="text-blue-100 mb-6 flex-grow leading-relaxed">
                                        Order delicious food, track deliveries in real-time, earn rewards, and enjoy exclusive deals from your favorite restaurants.
                                    </p>

                                    <div className="space-y-3 mb-6">
                                        {['Fast delivery tracking', 'Earn loyalty points', 'Exclusive restaurant deals'].map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-white/80 text-sm">
                                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2 group-hover:scale-105">
                                        Get Started
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </Link>

                        {/* Restaurant Card */}
                        <Link to="/register/restaurant" className="group relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                            <div className="relative h-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-2">
                                <div className="flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform">
                                            <Store className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full border border-blue-500/30">
                                            <TrendingUp className="w-3 h-3" />
                                            <span>Grow Business</span>
                                        </div>
                                    </div>

                                    <h2 className="text-3xl font-bold text-white mb-3">I'm a Restaurant</h2>
                                    <p className="text-blue-100 mb-6 flex-grow leading-relaxed">
                                        Partner with us to reach more customers, streamline operations, boost revenue, and grow your culinary business.
                                    </p>

                                    <div className="space-y-3 mb-6">
                                        {['Advanced analytics dashboard', 'Real-time order management', 'Marketing tools included'].map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-white/80 text-sm">
                                                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 group-hover:scale-105">
                                        Become a Partner
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Footer */}
                    <div className="text-center">
                        <p className="text-white/70 text-sm">
                            Already have an account?{' '}
                            <button onClick={handleOpenLogin} className="text-white font-bold hover:text-purple-300 transition-colors underline">
                                Sign in here
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RoleSelection;
