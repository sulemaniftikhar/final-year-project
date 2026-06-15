import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Store, MapPin, Clock, Check, Loader, ChevronLeft, ArrowRight, Upload, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerUser } from '../../services/auth.service';
import { restaurantService } from '../../services/restaurant.service';
import { uploadService } from '../../services/upload.service';
import { useAuth } from '../../features/auth/AuthContext';
import { validatePassword, getPasswordStrength } from '../../utils/passwordUtils';

const RestaurantSignup = () => {
    const navigate = useNavigate();
    const { checkAuth } = useAuth();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [logoLoading, setLogoLoading] = useState(false);
    const [coverLoading, setCoverLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        ownerName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        restaurantName: '',
        businessType: 'Restaurant',
        cuisineTypes: '',
        address: '',
        city: '',
        area: '',
        openingTime: '09:00',
        closingTime: '22:00',
        dineIn: true,
        takeaway: true,
        delivery: true,
        logo: '',
        coverImage: ''
    });

    const handleImageUpload = async (e, type) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size must be less than 2MB');
            return;
        }

        const setLoading = type === 'logo' ? setLogoLoading : setCoverLoading;
        const field = type === 'logo' ? 'logo' : 'coverImage';

        try {
            setLoading(true);
            const { url } = await uploadService.uploadImage(file);
            updateField(field, url);
            toast.success(`${type === 'logo' ? 'Logo' : 'Cover image'} uploaded!`);
        } catch (err) {
            toast.error('Failed to upload image');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (field === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setErrors(prev => ({
                ...prev,
                email: value && !emailRegex.test(value) ? 'Invalid email address' : ''
            }));
        }
        if (field === 'phone') {
            const phoneRegex = /^\+?[\d\s-]{10,15}$/;
            setErrors(prev => ({
                ...prev,
                phone: value && !phoneRegex.test(value) ? 'Invalid phone format (10-15 digits)' : ''
            }));
        }
        if (field === 'confirmPassword') {
            setErrors(prev => ({
                ...prev,
                confirmPassword: value && value !== formData.password ? 'Passwords do not match' : ''
            }));
        }
    };



    const nextStep = () => {
        if (step === 1) {
            if (formData.password !== formData.confirmPassword) {
                toast.error('Passwords do not match');
                return;
            }
            const passwordValidation = validatePassword(formData.password);
            if (!passwordValidation.isValid) {
                toast.error(passwordValidation.errors[0]);
                return;
            }
        }
        setStep(prev => prev + 1);
    };
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Phone validation (numeric, 10-15 digits, optional +)
        const phoneRegex = /^\+?[\d\s-]{10,15}$/;
        if (!phoneRegex.test(formData.phone)) {
            toast.error('Please enter a valid phone number (10-15 digits)');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create Firebase user + backend user with RESTAURANT_OWNER role
            const { user: firebaseUser, dbUser } = await registerUser(
                formData.email,
                formData.password,
                {
                    name: formData.ownerName,
                    phone: formData.phone,
                    role: 'RESTAURANT_OWNER',
                }
            );

            // 2. Create the restaurant record linked to the new owner
            await restaurantService.createRestaurant({
                name: formData.restaurantName,
                businessType: formData.businessType,
                cuisineTypes: formData.cuisineTypes,
                address: formData.address,
                city: formData.city,
                area: formData.area,
                openingTime: formData.openingTime,
                closingTime: formData.closingTime,
                dineIn: formData.dineIn,
                takeaway: formData.takeaway,
                delivery: formData.delivery,
                logo: formData.logo,
                coverImage: formData.coverImage,
                status: 'OPEN',
            });

            // 3. Force profile sync to update role in frontend
            await checkAuth();

            toast.success('Restaurant registered successfully! Welcome aboard 🎉');
            navigate('/restaurant/dashboard');
        } catch (error) {
            const code = error?.code;
            if (code === 'auth/email-already-in-use') {
                toast.error('This email is already registered. Please log in.');
            } else if (code === 'auth/weak-password') {
                toast.error('Password must be at least 6 characters.');
            } else {
                toast.error(error?.response?.data?.message || error?.message || 'Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const steps = [
        { num: 1, title: 'Account Owner', icon: User },
        { num: 2, title: 'Restaurant Info', icon: Store },
        { num: 3, title: 'Operations', icon: Clock }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <Link to="/register" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 group">
                    <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to selection
                </Link>

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-blue-500/30">
                        <Store className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Partner with OrderIQ</h2>
                    <p className="text-gray-500 mt-2">Complete the setup to start growing your business</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-10">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
                        <div className="absolute left-0 top-1/2 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                        {steps.map((s) => (
                            <div key={s.num} className="relative z-10 flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${step >= s.num ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                                    {step > s.num ? <Check className="w-6 h-6" /> : <s.icon className="w-6 h-6" />}
                                </div>
                                <span className={`text-xs font-bold mt-2 ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}>{s.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100">
                    <form onSubmit={(e) => { e.preventDefault(); if (step === 3) handleSubmit(e); else nextStep(); }}>

                        {/* Step 1: Account Owner */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Account Owner Details</h3>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input required type="text" value={formData.ownerName} onChange={(e) => updateField('ownerName', e.target.value)} className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white" placeholder="John Doe" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input required type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500 bg-gray-50 focus:bg-white'}`} placeholder="you@restaurant.com" />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input required type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all ${errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500 bg-gray-50 focus:bg-white'}`} placeholder="+1 234 567 8900" />
                                        </div>
                                        {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input required type="password" value={formData.password} onChange={(e) => updateField('password', e.target.value)} className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white" placeholder="Create password" />
                                        </div>
                                        {formData.password && (
                                            <div className="mt-2">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-gray-500">Password strength</span>
                                                    <span className={`font-bold ${getPasswordStrength(formData.password).strength === 100 ? 'text-green-600' : getPasswordStrength(formData.password).strength === 66 ? 'text-yellow-600' : 'text-red-600'}`}>{getPasswordStrength(formData.password).label}</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className={`h-full ${getPasswordStrength(formData.password).color} transition-all duration-300`} style={{ width: `${getPasswordStrength(formData.password).strength}%` }}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input required type="password" value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all ${errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500 bg-gray-50 focus:bg-white'}`} placeholder="Confirm password" />
                                        </div>
                                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Restaurant Info */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Restaurant Information</h3>
                                
                                {/* Branding Section */}
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b border-gray-100">
                                     {/* Logo Upload */}
                                     <div>
                                         <label className="block text-sm font-bold text-gray-700 mb-2">
                                             Restaurant Logo <span className="text-[10px] font-normal text-gray-400 ml-1">(Optional)</span>
                                         </label>
                                         <div className="relative group">
                                             <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400">
                                                 {logoLoading ? (
                                                     <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                                                 ) : formData.logo ? (
                                                     <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                                                 ) : (
                                                     <div className="text-center">
                                                         <Upload className="w-6 h-6 text-gray-300 mx-auto" />
                                                         <span className="text-[10px] text-gray-400 mt-1 block">Add logo</span>
                                                     </div>
                                                 )}
                                             </div>
                                             <input 
                                                 type="file" 
                                                 accept="image/*" 
                                                 className="absolute inset-0 opacity-0 cursor-pointer"
                                                 onChange={(e) => handleImageUpload(e, 'logo')}
                                             />
                                         </div>
                                         <p className="text-[10px] text-gray-400 mt-1">400x400px recommended</p>
                                     </div>
 
                                     {/* Cover Upload */}
                                     <div>
                                         <label className="block text-sm font-bold text-gray-700 mb-2">
                                             Cover Image <span className="text-[10px] font-normal text-gray-400 ml-1">(Optional)</span>
                                         </label>
                                         <div className="relative group">
                                             <div className="w-full h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400">
                                                 {coverLoading ? (
                                                     <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                                                 ) : formData.coverImage ? (
                                                     <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                                 ) : (
                                                     <div className="text-center">
                                                         <Upload className="w-6 h-6 text-gray-300 mx-auto" />
                                                         <span className="text-[10px] text-gray-400 mt-1 block">Add cover</span>
                                                     </div>
                                                 )}
                                             </div>
                                             <input 
                                                 type="file" 
                                                 accept="image/*" 
                                                 className="absolute inset-0 opacity-0 cursor-pointer"
                                                 onChange={(e) => handleImageUpload(e, 'cover')}
                                             />
                                         </div>
                                         <p className="text-[10px] text-gray-400 mt-1">1200x400px recommended</p>
                                     </div>
                                 </div>
                                 <p className="text-[11px] text-blue-600 bg-blue-50 p-2 rounded-lg mb-4">
                                     💡 You can skip branding for now and set it later from your dashboard settings.
                                 </p>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Restaurant Name</label>
                                    <input required type="text" value={formData.restaurantName} onChange={(e) => updateField('restaurantName', e.target.value)} className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white" placeholder="Your Restaurant Name" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Business Type</label>
                                        <select value={formData.businessType} onChange={(e) => updateField('businessType', e.target.value)} className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white">
                                            {['Restaurant', 'Café', 'Cloud Kitchen', 'Bakery', 'Food Truck'].map(type => <option key={type} value={type}>{type}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Cuisine Types</label>
                                        <input type="text" value={formData.cuisineTypes} onChange={(e) => updateField('cuisineTypes', e.target.value)} className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white" placeholder="Italian, Chinese..." />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                                    <textarea required value={formData.address} onChange={(e) => updateField('address', e.target.value)} rows="2" className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white resize-none" placeholder="Street address"></textarea>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input required placeholder="City" value={formData.city} onChange={(e) => updateField('city', e.target.value)} className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white" />
                                    <input required placeholder="Area / Zone" value={formData.area} onChange={(e) => updateField('area', e.target.value)} className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white" />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Operations */}
                        {step === 3 && (
                            <div className="space-y-5">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Operational Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Opening Time</label>
                                        <input type="time" value={formData.openingTime} onChange={(e) => updateField('openingTime', e.target.value)} className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Closing Time</label>
                                        <input type="time" value={formData.closingTime} onChange={(e) => updateField('closingTime', e.target.value)} className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Service Types</label>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'dineIn', label: 'Dine-in' },
                                            { id: 'takeaway', label: 'Takeaway' },
                                            { id: 'delivery', label: 'Delivery' }
                                        ].map(service => (
                                            <label key={service.id} className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                                <input type="checkbox" checked={formData[service.id]} onChange={(e) => updateField(service.id, e.target.checked)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                                                <span className="ml-3 font-medium text-gray-900">{service.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <p className="text-sm text-blue-800"><span className="font-bold">Note:</span> You can upload menu, logo, and cover image after completing signup from your dashboard.</p>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                            {step > 1 ? (
                                <button type="button" onClick={prevStep} className="flex items-center text-gray-600 hover:text-gray-900 font-bold">
                                    <ChevronLeft className="w-5 h-5 mr-1" /> Back
                                </button>
                            ) : <div></div>}
                            <button type="submit" disabled={isLoading} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                                {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        {step === 3 ? 'Finish' : 'Next Step'}
                                        {step !== 3 && <ArrowRight className="w-5 h-5" />}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RestaurantSignup;
