import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useData } from "@/context/DataContext"
import { Icon } from "@iconify/react"

export default function CustomerProfile() {
    const { user } = useAuth()
    const { getCustomerOrders, getCustomerLoyaltyPoints } = useData()

    // Mock customer profile data
    const [profile, setProfile] = useState({
        name: user?.name || "John Doe",
        email: user?.email || "customer@demo.com",
        phone: user?.phone || "03001234567",
        addresses: [
            {
                id: "addr1",
                label: "Home",
                street: "123 Main Street",
                city: "Lahore",
                province: "Punjab",
                postalCode: "54000",
                isDefault: true,
            },
            {
                id: "addr2",
                label: "Work",
                street: "456 Business Avenue",
                city: "Lahore",
                province: "Punjab",
                postalCode: "54100",
                isDefault: false,
            },
        ],
    })

    const [isEditing, setIsEditing] = useState(false)
    const [editedProfile, setEditedProfile] = useState(profile)
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [editingAddress, setEditingAddress] = useState(null)
    const [newAddress, setNewAddress] = useState({
        label: "",
        street: "",
        city: "",
        province: "",
        postalCode: "",
        isDefault: false,
    })

    // Get customer stats
    const orders = getCustomerOrders(user?.id || "cust1")
    const loyaltyPoints = getCustomerLoyaltyPoints(user?.id || "cust1")
    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0)

    const handleSave = () => {
        setProfile(editedProfile)
        setIsEditing(false)
        // In real app, this would call an API to update the profile
    }

    const handleCancel = () => {
        setEditedProfile(profile)
        setIsEditing(false)
    }

    const handleAddAddress = () => {
        const newAddr = {
            ...newAddress,
            id: `addr${Date.now()}`,
        }
        setEditedProfile({
            ...editedProfile,
            addresses: [...editedProfile.addresses, newAddr],
        })
        setNewAddress({
            label: "",
            street: "",
            city: "",
            province: "",
            postalCode: "",
            isDefault: false,
        })
        setShowAddressForm(false)
    }

    const handleEditAddress = (address) => {
        setEditingAddress(address)
        setNewAddress(address)
        setShowAddressForm(true)
    }

    const handleUpdateAddress = () => {
        setEditedProfile({
            ...editedProfile,
            addresses: editedProfile.addresses.map((addr) =>
                addr.id === editingAddress.id ? newAddress : addr
            ),
        })
        setEditingAddress(null)
        setNewAddress({
            label: "",
            street: "",
            city: "",
            province: "",
            postalCode: "",
            isDefault: false,
        })
        setShowAddressForm(false)
    }

    const handleDeleteAddress = (addressId) => {
        setEditedProfile({
            ...editedProfile,
            addresses: editedProfile.addresses.filter((addr) => addr.id !== addressId),
        })
    }

    const handleSetDefaultAddress = (addressId) => {
        setEditedProfile({
            ...editedProfile,
            addresses: editedProfile.addresses.map((addr) => ({
                ...addr,
                isDefault: addr.id === addressId,
            })),
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your account information</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <Icon icon="mdi:pencil" className="w-5 h-5" />
                        Edit Profile
                    </button>
                )}
            </div>

            {/* Account Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon icon="mdi:shopping" className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Orders</p>
                            <p className="text-2xl font-bold text-foreground">{orders.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-accent/10 rounded-lg">
                            <Icon icon="mdi:star" className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Loyalty Points</p>
                            <p className="text-2xl font-bold text-foreground">{loyaltyPoints}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Icon icon="mdi:cash" className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Spent</p>
                            <p className="text-2xl font-bold text-foreground">Rs. {totalSpent}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Personal Information */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Full Name
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedProfile.name}
                                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            />
                        ) : (
                            <p className="text-foreground font-medium">{profile.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Email Address
                        </label>
                        {isEditing ? (
                            <input
                                type="email"
                                value={editedProfile.email}
                                onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            />
                        ) : (
                            <p className="text-foreground font-medium">{profile.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Phone Number
                        </label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={editedProfile.phone}
                                onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            />
                        ) : (
                            <p className="text-foreground font-medium">{profile.phone}</p>
                        )}
                    </div>
                </div>

                {isEditing && (
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-6 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {/* Delivery Addresses */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">Delivery Addresses</h2>
                    <button
                        onClick={() => setShowAddressForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <Icon icon="mdi:plus" className="w-5 h-5" />
                        Add Address
                    </button>
                </div>

                {/* Address Form */}
                {showAddressForm && (
                    <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4">
                        <h3 className="font-semibold text-foreground mb-3">
                            {editingAddress ? "Edit Address" : "New Address"}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="Label (e.g., Home, Work)"
                                value={newAddress.label}
                                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                                className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            />
                            <input
                                type="text"
                                placeholder="Street Address"
                                value={newAddress.street}
                                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            />
                            <input
                                type="text"
                                placeholder="City"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            />
                            <input
                                type="text"
                                placeholder="Province"
                                value={newAddress.province}
                                onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                                className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            />
                            <input
                                type="text"
                                placeholder="Postal Code"
                                value={newAddress.postalCode}
                                onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                                className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            />
                        </div>
                        <div className="flex gap-3 mt-3">
                            <button
                                onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                            >
                                {editingAddress ? "Update" : "Add"} Address
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddressForm(false)
                                    setEditingAddress(null)
                                    setNewAddress({
                                        label: "",
                                        street: "",
                                        city: "",
                                        province: "",
                                        postalCode: "",
                                        isDefault: false,
                                    })
                                }}
                                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Address List */}
                <div className="space-y-3">
                    {editedProfile.addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`border rounded-lg p-4 ${address.isDefault ? "border-primary bg-primary/5" : "border-border"
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-foreground">{address.label}</h3>
                                        {address.isDefault && (
                                            <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {address.street}, {address.city}, {address.province} {address.postalCode}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {!address.isDefault && (
                                        <button
                                            onClick={() => handleSetDefaultAddress(address.id)}
                                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                            title="Set as default"
                                        >
                                            <Icon icon="mdi:star-outline" className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEditAddress(address)}
                                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                        title="Edit"
                                    >
                                        <Icon icon="mdi:pencil" className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAddress(address.id)}
                                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                        title="Delete"
                                    >
                                        <Icon icon="mdi:delete" className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
