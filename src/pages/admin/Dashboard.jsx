import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Store, DollarSign, ShoppingBag, XCircle, RefreshCw } from 'lucide-react';
import Card from '../../components/ui/Card';
import { adminService } from '../../services/admin.service';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await adminService.getDashboardStats();
            if (res.data) setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch dashboard stats', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentOrders = async () => {
        try {
            setOrdersLoading(true);
            const res = await adminService.getAllOrders();
            const raw = (res.data || []).slice(0, 8);
            setRecentOrders(raw.map(o => ({
                id: o.orderNumber || `#${o.id?.slice(-6)}`,
                restaurant: o.restaurant?.name || '—',
                customer: o.customer?.fullName || o.customer?.email?.split('@')[0] || '—',
                total: `PKR ${parseFloat(o.total || 0).toFixed(0)}`,
                status: o.status === 'COMPLETED' ? 'Delivered'
                    : o.status === 'PENDING' ? 'New'
                        : o.status === 'PREPARING' ? 'Preparing'
                            : o.status === 'CANCELLED' ? 'Cancelled'
                                : o.status === 'ACCEPTED' ? 'Accepted'
                                    : o.status === 'READY' ? 'Ready' : o.status,
                time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
            })));
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchRecentOrders();
    }, []);

    const kpis = stats ? [
        {
            label: 'Total Revenue',
            value: `PKR ${(stats.totalRevenue || 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'text-primary-600',
            bg: 'bg-primary-50',
            sub: 'From completed orders',
        },
        {
            label: 'Total Orders',
            value: (stats.totalOrders || 0).toLocaleString(),
            icon: ShoppingBag,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            sub: `${stats.cancelledOrders || 0} cancelled`,
        },
        {
            label: 'Customers',
            value: (stats.totalUsers || 0).toLocaleString(),
            icon: Users,
            color: 'text-green-600',
            bg: 'bg-green-50',
            sub: 'Registered customers',
        },
        {
            label: 'Restaurants',
            value: (stats.totalRestaurants || 0).toLocaleString(),
            icon: Store,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            sub: `${stats.totalRestaurantOwners || 0} owners`,
        },
        {
            label: 'Cancelled Orders',
            value: (stats.cancelledOrders || 0).toLocaleString(),
            icon: XCircle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            sub: 'All time',
        },
        {
            label: 'Restaurant Owners',
            value: (stats.totalRestaurantOwners || 0).toLocaleString(),
            icon: TrendingUp,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            sub: 'Registered owners',
        },
    ] : [];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-700';
            case 'New': return 'bg-blue-100 text-blue-700';
            case 'Preparing': return 'bg-orange-100 text-orange-700';
            case 'Accepted': return 'bg-indigo-100 text-indigo-700';
            case 'Ready': return 'bg-cyan-100 text-cyan-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <button
                    onClick={() => { fetchStats(); fetchRecentOrders(); }}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <Card key={i} className="p-4 animate-pulse">
                            <div className="h-8 bg-gray-100 rounded mb-2" />
                            <div className="h-4 bg-gray-100 rounded w-2/3" />
                        </Card>
                    ))
                ) : (
                    kpis.map((kpi, idx) => (
                        <Card key={idx} className="p-4 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start mb-2">
                                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{kpi.value}</h3>
                                <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Recent Orders Table */}
            <Card className="overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-900">Recent Orders</h3>
                    <span className="text-xs text-gray-500">Latest {recentOrders.length} orders</span>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Order</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Restaurant</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Total</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {ordersLoading ? (
                            <tr><td colSpan={6} className="p-8 text-center"><RefreshCw className="w-5 h-5 animate-spin text-primary-500 mx-auto" /></td></tr>
                        ) : recentOrders.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-sm text-gray-500">No orders yet</td></tr>
                        ) : (
                            recentOrders.map((order, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold text-gray-900 text-sm">{order.id}</td>
                                    <td className="p-4 text-sm text-gray-700">{order.restaurant}</td>
                                    <td className="p-4 text-sm text-gray-600">{order.customer}</td>
                                    <td className="p-4 text-sm font-medium text-gray-900">{order.total}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">{order.time}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default Dashboard;
