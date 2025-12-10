import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useData } from "@/context/DataContext"
import { Icon } from "@iconify/react"

export default function RestaurantProfile() {
    const { user } = useAuth()
    const { getRestaurantById, getRestaurantStats } = useData()

    // Mock restaurant profile data
    const [profile, setProfile] = useState({
        restaurantName: "Karachi Biryani House",
        ownerName: user?.name || "Ali Khan",
        email: user?.email || "restaurant@demo.com",
        phone: user?.phone || "03001234567",
        address: "123 Food Street, Lahore, Punjab",
        cuisine: "Pakistani",
        description: "Authentic Karachi biryani with traditional recipes passed down for generations",
        operatingHours: {
            monday: { open: "10:00", close: "22:00", closed: false },
            tuesday: { open: "10:00", close: "22:00", closed: false },
            wednesday: { open: "10:00", close: "22:00", closed: false },
            thursday: { open: "10:00", close: "22:00", closed: false },
            friday: { open: "10:00", close: "23:00", closed: false },
            saturday: { open: "10:00", close: "23:00", closed: false },
            sunday: { open: "11:00", close: "22:00", closed: false },
        },
        settings: {
            deliveryRadius: "10",
            minimumOrder: "300",
            deliveryFee: "100",
        },
        bankDetails: {
            accountTitle: "Karachi Biryani House",
            accountNumber: "****1234",
            bankName: "HBL",
        },
    })

    const [isEditing, setIsEditing] = useState(false)
    const [editedProfile, setEditedProfile] = useState(profile)

    // Get restaurant stats
    const stats = getRestaurantStats(user?.restaurantId || "rest1")

    const handleSave = () => {
        setProfile(editedProfile)
        setIsEditing(false)
        // In real app, this would call an API to update the profile
    }

    const handleCancel = () => {
        setEditedProfile(profile)
        setIsEditing(false)
    }

    const handleOperatingHoursChange = (day, field, value) => {
        setEditedProfile({
            ...editedProfile,
            operatingHours: {
                ...editedProfile.operatingHours,
                [day]: {
                    ...editedProfile.operatingHours[day],
                    [field]: value,
                },
            },
        })
    }

    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Restaurant Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your restaurant information</p>
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

            {/* Restaurant Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon icon="mdi:shopping" className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Orders</p>
                            <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Icon icon="mdi:cash" className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                            <p className="text-2xl font-bold text-foreground">Rs. {stats.totalRevenue}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Icon icon="mdi:clock-outline" className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Pending Orders</p>
                            <p className="text-2xl font-bold text-foreground">{stats.pendingOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-accent/10 rounded-lg">
                            <Icon icon="mdi:check-circle" className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Completed</p>
                            <p className="text-2xl font-bold text-foreground">{stats.completedOrders}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Business Information */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Business Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Restaurant Name
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedProfile.restaurantName}
                                onChange={(e) =>
                                    setEditedProfile({ ...editedProfile, restaurantName: e.target.value })
                                }
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            />
                        ) : (
                            <p className="text-foreground font-medium">{profile.restaurantName}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Cuisine Type
                        </label>
                        {isEditing ? (
                            <select
                                value={editedProfile.cuisine}
                                onChange={(e) => setEditedProfile({ ...editedProfile, cuisine: e.target.value })}
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            >
                                <option value="Pakistani">Pakistani</option>
                                <option value="Indian">Indian</option>
                                <option value="Chinese">Chinese</option>
                                <option value="Italian">Italian</option>
                                <option value="Thai">Thai</option>
                                <option value="Fast Food">Fast Food</option>
                            </select>
                        ) : (
                            <p className="text-foreground font-medium">{profile.cuisine}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Description
                        </label>
                        {isEditing ? (
                            <textarea
                                value={editedProfile.description}
                                onChange={(e) =>
                                    setEditedProfile({ ...editedProfile, description: e.target.value })
                                }
                                rows={3}
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            />
                        ) : (
                            <p className="text-foreground">{profile.description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Contact Details */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Contact Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Owner/Manager Name
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedProfile.ownerName}
                                onChange={(e) => setEditedProfile({ ...editedProfile, ownerName: e.target.value })}
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            />
                        ) : (
                            <p className="text-foreground font-medium">{profile.ownerName}</p>
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

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Restaurant Address
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedProfile.address}
                                onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            />
                        ) : (
                            <p className="text-foreground font-medium">{profile.address}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Operating Hours</h2>
                <div className="space-y-3">
                    {days.map((day) => (
                        <div key={day} className="flex items-center gap-4">
                            <div className="w-28">
                                <p className="text-foreground font-medium capitalize">{day}</p>
                            </div>
                            {isEditing ? (
                                <>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={!editedProfile.operatingHours[day].closed}
                                            onChange={(e) =>
                                                handleOperatingHoursChange(day, "closed", !e.target.checked)
                                            }
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm text-muted-foreground">Open</span>
                                    </label>
                                    {!editedProfile.operatingHours[day].closed && (
                                        <>
                                            <input
                                                type="time"
                                                value={editedProfile.operatingHours[day].open}
                                                onChange={(e) => handleOperatingHoursChange(day, "open", e.target.value)}
                                                className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                            />
                                            <span className="text-muted-foreground">to</span>
                                            <input
                                                type="time"
                                                value={editedProfile.operatingHours[day].close}
                                                onChange={(e) => handleOperatingHoursChange(day, "close", e.target.value)}
                                                className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                            />
                                        </>
                                    )}
                                    {editedProfile.operatingHours[day].closed && (
                                        <span className="text-muted-foreground">Closed</span>
                                    )}
                                </>
                            ) : (
                                <p className="text-muted-foreground">
                                    {profile.operatingHours[day].closed
                                        ? "Closed"
                                        : `${profile.operatingHours[day].open} - ${profile.operatingHours[day].close}`}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Restaurant Settings */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Restaurant Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Delivery Radius (km)
                        </label>
                        {isEditing ? (
                            <input
                                type="number"
                                value={editedProfile.settings.deliveryRadius}
                                onChange={(e) =>
                                    setEditedProfile({
                                        ...editedProfile,
                                        settings: { ...editedProfile.settings, deliveryRadius: e.target.value },
                                    })
                                }
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            />
                        ) : (
                            <p className="text-foreground font-medium">{profile.settings.deliveryRadius} km</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Minimum Order (Rs.)
                        </label>
                        {isEditing ? (
                            <input
                                type="number"
                                value={editedProfile.settings.minimumOrder}
                                onChange={(e) =>
                                    setEditedProfile({
                                        ...editedProfile,
                                        settings: { ...editedProfile.settings, minimumOrder: e.target.value },
                                    })
                                }
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            />
                        ) : (
                            <p className="text-foreground font-medium">Rs. {profile.settings.minimumOrder}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Delivery Fee (Rs.)
                        </label>
                        {isEditing ? (
                            <input
                                type="number"
                                value={editedProfile.settings.deliveryFee}
                                onChange={(e) =>
                                    setEditedProfile({
                                        ...editedProfile,
                                        settings: { ...editedProfile.settings, deliveryFee: e.target.value },
                                    })
                                }
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            />
                        ) : (
                            <p className="text-foreground font-medium">Rs. {profile.settings.deliveryFee}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bank Details */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Payment Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Account Title
                        </label>
                        <p className="text-foreground font-medium">{profile.bankDetails.accountTitle}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Account Number
                        </label>
                        <p className="text-foreground font-medium">{profile.bankDetails.accountNumber}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Bank Name
                        </label>
                        <p className="text-foreground font-medium">{profile.bankDetails.bankName}</p>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                    <Icon icon="mdi:information" className="inline w-4 h-4 mr-1" />
                    Contact support to update payment details
                </p>
            </div>

            {/* Save/Cancel Buttons */}
            {isEditing && (
                <div className="flex gap-3">
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
    )
}
