import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Filter, Star, MapPin, X, Check, Eye, AlertTriangle, RefreshCw } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Drawer from '../../components/ui/Drawer';
import { isDateInRange, useAdminFilters } from '../../features/admin/AdminFiltersContext';
import { adminService } from '../../services/admin.service';
import toast from 'react-hot-toast';

const Restaurants = () => {
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [filterMode, setFilterMode] = useState('All');
    const [showFilters, setShowFilters] = useState(false);
    const [modeFilter, setModeFilter] = useState('All');
    const [ratingFilter, setRatingFilter] = useState('All');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newRestaurant, setNewRestaurant] = useState({
        name: '',
        location: '',
        status: 'Active',
        activeModes: ['Delivery'],
        rating: 0,
    });
    const { searchQuery, setSearchQuery, dateRange } = useAdminFilters();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllRestaurants();
            const raw = data.data || [];
            setRestaurants(raw.map(r => ({
                id: r.id,
                name: r.name,
                location: `${r.area || ''} ${r.city || r.address || ''}`.trim() || '—',
                address: r.address || '—',
                owner: r.owner?.fullName || '—',
                ownerEmail: r.owner?.email || '—',
                // Schema status: OPEN, PAUSED, CLOSED
                status: r.status === 'OPEN' ? 'Active' : r.status === 'PAUSED' ? 'Paused' : r.status === 'CLOSED' ? 'Closed' : r.status,
                activeModes: [
                    r.delivery && 'Delivery',
                    r.takeaway && 'Pickup',
                    r.dineIn && 'Dine-in',
                ].filter(Boolean),
                rating: r.rating || 0,
                orders: r._count?.orders || 0,
                cancels: '0%',
                lastActive: r.updatedAt ? new Date(r.updatedAt).toLocaleTimeString() : '—',
                lastActiveAt: r.updatedAt || r.createdAt || new Date().toISOString(),
                cuisineTypes: r.cuisineTypes || [],
            })));
        } catch (err) {
            console.error('Failed to fetch restaurants', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRestaurants(); }, []);

    const handleStatusChange = async (restaurantId, newStatus) => {
        try {
            await adminService.updateRestaurantStatus(restaurantId, newStatus.toUpperCase());
            toast.success(`Restaurant ${newStatus.toLowerCase()}d`);
            setRestaurants(prev => prev.map(r =>
                r.id === restaurantId ? { ...r, status: newStatus } : r
            ));
            setSelectedRestaurant(prev => prev ? { ...prev, status: newStatus } : prev);
        } catch (err) {
            toast.error('Could not update restaurant status');
        }
    };

    const handleAddRestaurant = (event) => {
        event.preventDefault();
        if (!newRestaurant.name.trim() || !newRestaurant.location.trim()) return;

        const nextId = restaurants.length ? Math.max(...restaurants.map(r => r.id)) + 1 : 1;
        const createdAt = new Date().toISOString();

        const created = {
            id: nextId,
            name: newRestaurant.name.trim(),
            location: newRestaurant.location.trim(),
            status: newRestaurant.status,
            activeModes: newRestaurant.activeModes.length ? newRestaurant.activeModes : ['Delivery'],
            rating: Number(newRestaurant.rating) || 0,
            orders: 0,
            cancels: '0%',
            lastActive: 'Just now',
            lastActiveAt: createdAt,
        };

        setRestaurants(prev => [created, ...prev]);
        setShowAddForm(false);
        setNewRestaurant({ name: '', location: '', status: 'Active', activeModes: ['Delivery'], rating: 0 });
    };

    const toggleMode = (mode) => {
        setNewRestaurant(prev => {
            const exists = prev.activeModes.includes(mode);
            const activeModes = exists
                ? prev.activeModes.filter(m => m !== mode)
                : [...prev.activeModes, mode];
            return { ...prev, activeModes };
        });
    };

    const filteredRestaurants = useMemo(() => {
        const search = searchQuery.trim().toLowerCase();
        return restaurants.filter(r => {
            const matchesMode = filterMode === 'All'
                || (filterMode === 'Pending approvals' && r.status === 'Pending')
                || (filterMode === 'Suspended' && r.status === 'Suspended');

            const matchesSearch = !search
                || r.name.toLowerCase().includes(search)
                || r.location.toLowerCase().includes(search)
                || String(r.id).includes(search);

            const matchesDate = isDateInRange(r.lastActiveAt, dateRange);

            const matchesActiveMode = modeFilter === 'All' || r.activeModes.includes(modeFilter);
            const minRating = ratingFilter === '4+' ? 4 : ratingFilter === '3+' ? 3 : 0;
            const matchesRating = minRating === 0 || r.rating >= minRating;

            return matchesMode && matchesSearch && matchesDate && matchesActiveMode && matchesRating;
        });
    }, [restaurants, filterMode, searchQuery, dateRange, modeFilter, ratingFilter]);

    // Status Badge Logic
    const getStatusBadge = (status) => {
        const styles = {
            Active: 'bg-green-100 text-green-700',
            Pending: 'bg-blue-100 text-blue-700',
            Suspended: 'bg-red-100 text-red-700',
            Offline: 'bg-gray-100 text-gray-700'
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || styles.Offline}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Top Controls */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-1 gap-4 w-full">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                        {['All', 'Pending approvals', 'Suspended'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setFilterMode(mode)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterMode === mode ? 'bg-neutral-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchRestaurants} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="relative">
                        <Button variant="outline" icon={Filter} onClick={() => setShowFilters(prev => !prev)}>
                            More Filters
                        </Button>
                        {showFilters && (
                            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Active Mode</div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {['All', 'Delivery', 'Pickup', 'Dine-in'].map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setModeFilter(mode)}
                                            className={`px-2.5 py-1 rounded text-xs ${modeFilter === mode ? 'bg-neutral-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Rating</div>
                                <div className="flex flex-wrap gap-2">
                                    {['All', '4+', '3+'].map(rating => (
                                        <button
                                            key={rating}
                                            onClick={() => setRatingFilter(rating)}
                                            className={`px-2.5 py-1 rounded text-xs ${ratingFilter === rating ? 'bg-neutral-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            {rating}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <Button icon={Plus} onClick={() => setShowAddForm(true)}>Add Restaurant</Button>
                </div>
            </div>

            {showAddForm && (
                <Card className="p-4 border border-gray-200">
                    <form onSubmit={handleAddRestaurant} className="grid md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Restaurant name"
                            value={newRestaurant.name}
                            onChange={(event) => setNewRestaurant(prev => ({ ...prev, name: event.target.value }))}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Location"
                            value={newRestaurant.location}
                            onChange={(event) => setNewRestaurant(prev => ({ ...prev, location: event.target.value }))}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            required
                        />
                        <select
                            value={newRestaurant.status}
                            onChange={(event) => setNewRestaurant(prev => ({ ...prev, status: event.target.value }))}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        >
                            <option>Active</option>
                            <option>Pending</option>
                            <option>Suspended</option>
                        </select>
                        <input
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            placeholder="Rating"
                            value={newRestaurant.rating}
                            onChange={(event) => setNewRestaurant(prev => ({ ...prev, rating: event.target.value }))}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                        <div className="md:col-span-3 flex flex-wrap gap-2 items-center">
                            {['Delivery', 'Pickup', 'Dine-in'].map(mode => (
                                <label key={mode} className="flex items-center gap-2 text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={newRestaurant.activeModes.includes(mode)}
                                        onChange={() => toggleMode(mode)}
                                    />
                                    {mode}
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                            <Button type="submit">Create</Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Table */}
            <Card className="overflow-hidden shadow-sm border border-gray-200">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-xs text-uppercase text-gray-500">Restaurant</th>
                            <th className="p-4 font-semibold text-xs text-uppercase text-gray-500">Status</th>
                            <th className="p-4 font-semibold text-xs text-uppercase text-gray-500">Modes</th>
                            <th className="p-4 font-semibold text-xs text-uppercase text-gray-500">Orders (7d)</th>
                            <th className="p-4 font-semibold text-xs text-uppercase text-gray-500">Cancel Rate</th>
                            <th className="p-4 font-semibold text-xs text-uppercase text-gray-500">Last Active</th>
                            <th className="p-4 font-semibold text-xs text-uppercase text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={7} className="p-8 text-center"><RefreshCw className="w-6 h-6 animate-spin text-primary-500 mx-auto" /></td></tr>
                        ) : filteredRestaurants.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-sm text-gray-500">
                                    No restaurants match the current filters.
                                </td>
                            </tr>
                        ) : (
                            filteredRestaurants.map(r => (
                                <tr
                                    key={r.id}
                                    onClick={() => setSelectedRestaurant(r)}
                                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                {r.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900">{r.name}</p>
                                                <p className="text-xs text-gray-500">{r.location}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">{getStatusBadge(r.status)}</td>
                                    <td className="p-4">
                                        <div className="flex gap-1">
                                            {r.activeModes.map(m => (
                                                <span key={m} className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded border border-gray-200">{m}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-gray-900">{r.orders}</td>
                                    <td className="p-4">
                                        <span className={`text-sm font-medium ${parseFloat(r.cancels) > 5 ? 'text-red-600' : 'text-gray-600'}`}>
                                            {r.cancels}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">{r.lastActive}</td>
                                    <td className="p-4 text-right">
                                        <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-white rounded shadow-sm opacity-0 group-hover:opacity-100 transition-all border border-gray-200">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Card>

            {/* Detail Drawer */}
            <Drawer
                isOpen={!!selectedRestaurant}
                onClose={() => setSelectedRestaurant(null)}
                title={selectedRestaurant?.name || 'Details'}
                footer={
                    <div className="flex gap-3">
                        {selectedRestaurant?.status === 'Pending' ? (
                            <>
                                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(selectedRestaurant.id, 'Active')}>Approve Application</Button>
                                <Button className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" onClick={() => handleStatusChange(selectedRestaurant.id, 'Suspended')}>Reject</Button>
                            </>
                        ) : selectedRestaurant?.status === 'Active' ? (
                            <Button className="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" onClick={() => handleStatusChange(selectedRestaurant.id, 'Suspended')}>Suspend Restaurant</Button>
                        ) : (
                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(selectedRestaurant.id, 'Active')}>Reactivate Restaurant</Button>
                        )}
                    </div>
                }
            >
                {selectedRestaurant && (
                    <div className="space-y-6">
                        {/* Header Widgets */}
                        <div className="flex gap-3">
                            <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500">Orders (7d)</p>
                                <p className="text-lg font-bold text-gray-900">{selectedRestaurant.orders}</p>
                            </div>
                            <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500">Cancel Rate</p>
                                <p className={`text-lg font-bold ${parseFloat(selectedRestaurant.cancels) > 5 ? 'text-red-600' : 'text-gray-900'}`}>{selectedRestaurant.cancels}</p>
                            </div>
                            <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500">Rating</p>
                                <div className="flex items-center gap-1">
                                    <text className="text-lg font-bold text-gray-900">{selectedRestaurant.rating}</text>
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                </div>
                            </div>
                        </div>

                        {/* Pending Alert */}
                        {selectedRestaurant.status === 'Pending' && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-sm text-blue-900">Application Pending</h4>
                                    <p className="text-xs text-blue-700 mt-1">This restaurant submitted their application 2 days ago. Please review their documentation.</p>
                                </div>
                            </div>
                        )}

                        {/* Sections */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Profile Details</h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Address</p>
                                        <p className="text-sm text-gray-600">123 Example Street, {selectedRestaurant.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-4 h-4 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Operational Modes</p>
                                        <div className="flex gap-2 mt-1">
                                            {selectedRestaurant.activeModes.map(m => (
                                                <span key={m} className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{m}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Notes */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Internal Notes</h3>
                            <textarea
                                className="w-full h-24 p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="Add notes about this restaurant..."
                            />
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default Restaurants;
