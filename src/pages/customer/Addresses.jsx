import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardSidebar from '../../components/layout/Customer/DashboardSidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { userService } from '../../services/user.service';
import { useAuth } from '../../features/auth/AuthContext';
import toast from 'react-hot-toast';

const Addresses = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAddressId, setCurrentAddressId] = useState(null);
    const [formData, setFormData] = useState({
        label: '',
        address: '',
        city: '',
        area: '',
        isDefault: false,
    });

    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { profile } = useAuth();

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const res = await userService.getAddresses();
            setAddresses(res.data?.data || res.data || []);
        } catch (error) {
            console.error('Failed to load addresses:', error);
            toast.error('Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleSetDefault = async (id) => {
        try {
            await userService.updateAddress(id, { isDefault: true });
            toast.success("Default address updated");
            fetchAddresses();
        } catch (err) {
            toast.error("Failed to update default address");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            await userService.deleteAddress(id);
            setAddresses(addresses.filter(addr => addr.id !== id && addr._id !== id));
            toast.success("Address deleted");
        } catch (err) {
            toast.error("Failed to delete address");
        }
    };

    const handleEdit = (address) => {
        setIsEditing(true);
        setCurrentAddressId(address.id);
        setFormData({
            label: address.label || '',
            address: address.address || address.fullAddress || '',
            city: address.city || '',
            area: address.area || '',
            isDefault: !!address.isDefault,
        });
        setShowAddModal(true);
    };

    const handleOpenAddModal = () => {
        setIsEditing(false);
        setCurrentAddressId(null);
        setFormData({
            label: '',
            address: '',
            city: '',
            area: '',
            isDefault: false,
        });
        setShowAddModal(true);
    };

    const handleSave = async () => {
        if (!formData.address || !formData.city) {
            toast.error("Address and city are required");
            return;
        }

        try {
            if (isEditing) {
                await userService.updateAddress(currentAddressId, {
                    label: formData.label || 'Home',
                    address: formData.address,
                    city: formData.city,
                    area: formData.area || '',
                    isDefault: formData.isDefault,
                });
                toast.success("Address updated");
            } else {
                await userService.addAddress({
                    label: formData.label || 'Home',
                    address: formData.address,
                    city: formData.city,
                    area: formData.area || '',
                    isDefault: addresses.length === 0 || formData.isDefault,
                });
                toast.success("Address added");
            }
            fetchAddresses();
            setShowAddModal(false);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to save address");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-20 pb-12">
            <div className="max-w-content mx-auto px-4">
                <Link to="/customer/home" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-600 mb-3 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Home
                </Link>
                <h1 className="text-2xl font-bold text-neutral-900 mb-6">My Account</h1>

                <div className="grid md:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <DashboardSidebar />

                    {/* Content Area */}
                    <div className="md:col-span-3 space-y-6">
                        {/* Addresses Section */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-neutral-900">Saved Addresses</h2>
                                <Button
                                    onClick={handleOpenAddModal}
                                    className="flex items-center gap-2"
                                    variant="primary"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add New Address
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-center py-8 text-neutral-500">Loading addresses...</div>
                                ) : addresses.map((address) => {
                                    const IconNode = address.label?.toLowerCase().includes('work') ? Briefcase : Home;
                                    return (
                                        <div
                                            key={address.id || address._id}
                                            className="border border-gray-100 rounded-xl p-5 hover:border-primary-100 transition"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex gap-4 flex-1">
                                                    <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
                                                        <IconNode className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-bold text-neutral-900">{address.label}</h3>
                                                            {address.isDefault && (
                                                                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-neutral-600 border-b border-gray-50 pb-1 mb-1">{address.address}</p>
                                                        <p className="text-sm text-neutral-600">
                                                            {address.city}{address.area ? `, ${address.area}` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(address)}
                                                        className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(address.id)}
                                                        className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            {!address.isDefault && (
                                                <button
                                                    onClick={() => handleSetDefault(address.id || address._id)}
                                                    className="mt-3 text-sm text-primary-600 font-medium hover:underline"
                                                >
                                                    Set as default
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {addresses.length === 0 && (
                                <div className="text-center py-12">
                                    <MapPin className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-neutral-900 mb-2">No addresses saved</h3>
                                    <p className="text-neutral-500 mb-4">Add your first delivery address</p>
                                    <Button onClick={handleOpenAddModal}>
                                        Add Address
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            {/* Add/Edit Address Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-neutral-900 mb-4">
                            {isEditing ? 'Edit Address' : 'Add New Address'}
                        </h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="label"
                                value={formData.label}
                                onChange={handleInputChange}
                                placeholder="Label (e.g., Home, Work)"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Full Address"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="City"
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                                <input
                                    type="text"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleInputChange}
                                    placeholder="Area"
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    checked={formData.isDefault}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                                />
                                Set as default
                            </label>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-200 text-neutral-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                            >
                                {isEditing ? 'Update Address' : 'Save Address'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Addresses;
