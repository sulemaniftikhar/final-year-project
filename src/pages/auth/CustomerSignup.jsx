import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, ArrowRight, Loader, ChevronLeft } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CustomerSignup = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        address: '',
        referralCode: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getPasswordStrength = () => {
        const { password } = formData;
        if (!password) return { strength: 0, label: '', color: '' };
        if (password.length < 6) return { strength: 33, label: 'Weak', color: 'bg-red-500' };
        if (password.length < 10) return { strength: 66, label: 'Good', color: 'bg-yellow-500' };
        return { strength: 100, label: 'Strong', color: 'bg-green-500' };
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, formData.email, formData.password);
            toast.success('Logged in successfully!');
            navigate('/customer');
        } catch (error) {
            console.error('Login error:', error);
            if (error.code === 'auth/user-not-found') {
                toast.error('No account found with this email. Please sign up.');
            } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                toast.error('Incorrect password. Please try again.');
            } else {
                toast.error(error.message || 'Login failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords don't match!");
            return;
        }
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        try {
            // Step 1: Create Firebase user
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const firebaseUser = userCredential.user;

            // Step 2: Register in backend database
            const token = await firebaseUser.getIdToken();
            await api.post('/auth/register', {
                firebaseUid: firebaseUser.uid,
                email: formData.email,
                fullName: formData.fullName,
                phone: formData.phone,
                role: 'CUSTOMER',
                referralCode: formData.referralCode || undefined,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Account created successfully!');
            // AuthContext will automatically pick up the new user via onAuthStateChanged
            navigate('/customer');

        } catch (error) {
            console.error('Registration error:', error);

            if (error.code === 'auth/email-already-in-use') {
                toast.error('An account with this email already exists. Try logging in.');
            } else if (error.code === 'auth/weak-password') {
                toast.error('Password is too weak. Use at least 6 characters.');
            } else if (error.code === 'auth/invalid-email') {
                toast.error('Invalid email address.');
            } else {
                toast.error(error.response?.data?.message || error.message || 'Registration failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const strength = getPasswordStrength();

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-lg w-full">
                <Link to="/register" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 group">
                    <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to selection
                </Link>

                <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-purple-500/30">
                            <User className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            {isLoginMode ? 'Welcome Back' : 'Create Customer Account'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">
                            {isLoginMode ? 'Log in to your account' : 'Join thousands of food lovers'}
                        </p>
                    </div>

                    <form onSubmit={isLoginMode ? handleLogin : handleSignup} className="space-y-5">
                        {/* Full Name — only for signup */}
                        {!isLoginMode && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input required name="fullName" type="text" value={formData.fullName} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" placeholder="John Doe" />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input required name="email" type="email" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" placeholder="you@example.com" />
                            </div>
                        </div>

                        {/* Phone — only for signup */}
                        {!isLoginMode && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input required name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" placeholder="+1 234 567 8900" />
                                </div>
                            </div>
                        )}

                        {/* Address — only for signup */}
                        {!isLoginMode && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                                    <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white resize-none" placeholder="123 Main St, City, State"></textarea>
                                </div>
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input required name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" placeholder={isLoginMode ? "Enter your password" : "Create a strong password"} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {!isLoginMode && formData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-gray-500">Password strength</span>
                                        <span className={`font-bold ${strength.strength === 100 ? 'text-green-600' : strength.strength === 66 ? 'text-yellow-600' : 'text-red-600'}`}>{strength.label}</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.strength}%` }}></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password — only for signup */}
                        {!isLoginMode && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input required name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" placeholder="Confirm your password" />
                                </div>
                            </div>
                        )}

                        {/* Referral Code — only for signup */}
                        {!isLoginMode && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Referral Code <span className="text-gray-400 font-normal">(optional)</span></label>
                                <input name="referralCode" type="text" value={formData.referralCode} onChange={handleChange} className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" placeholder="Enter referral code" />
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : (
                                <>
                                    {isLoginMode ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <div className="text-center text-sm text-gray-600 pt-4">
                            {isLoginMode ? (
                                <>
                                    Don't have an account?{' '}
                                    <button type="button" onClick={() => setIsLoginMode(false)} className="font-bold text-purple-600 hover:text-purple-700 hover:underline">
                                        Sign up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <button type="button" onClick={() => setIsLoginMode(true)} className="font-bold text-purple-600 hover:text-purple-700 hover:underline">
                                        Sign in
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CustomerSignup;
