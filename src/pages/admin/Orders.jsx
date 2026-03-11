import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Bike, Clock, CheckCircle, Package, ArrowRight, AlertTriangle, Printer, RefreshCw } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Drawer from '../../components/ui/Drawer';
import { isDateInRange, useAdminFilters } from '../../features/admin/AdminFiltersContext';
import { adminService } from '../../services/admin.service';
import toast from 'react-hot-toast';

const OrdersPage = () => {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [showFilters, setShowFilters] = useState(false);
    const [modeFilter, setModeFilter] = useState('All');
    const { searchQuery, setSearchQuery, dateRange } = useAdminFilters();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllOrders();
            const raw = data.data || [];
            setOrders(raw.map(o => ({
                id: `#${o.orderNumber || o.id?.toString().slice(-6) || Math.random().toString().slice(2, 8)}`,
                orderId: o.id,
                restaurant: o.restaurant?.name || '—',
                customer: o.customer?.fullName || o.customer?.email?.split('@')[0] || '—',
                items: o.items?.length || 0,
                orderItems: o.items || [],
                total: `PKR ${parseFloat(o.total || 0).toFixed(0)}`,
                status: o.status === 'COMPLETED' ? 'Delivered' : o.status === 'PENDING' ? 'New' : o.status === 'PREPARING' ? 'Preparing' : o.status === 'CANCELLED' ? 'Cancelled' : o.status === 'ACCEPTED' ? 'Accepted' : o.status === 'READY' ? 'Ready' : o.status,
                mode: o.type === 'DELIVERY' ? 'Delivery' : o.type === 'PICKUP' ? 'Pickup' : 'Dine-in',
                time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
                createdAt: o.createdAt || new Date().toISOString(),
                timeline: [],
            })));
        } catch (err) {
            console.error('Failed to fetch admin orders', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-700';
            case 'New': return 'bg-blue-100 text-blue-700';
            case 'Preparing': return 'bg-orange-100 text-orange-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredOrders = useMemo(() => {
        const search = searchQuery.trim().toLowerCase();
        return orders.filter(order => {
            const matchesSearch = !search
                || order.id.toLowerCase().includes(search)
                || order.restaurant.toLowerCase().includes(search)
                || order.customer.toLowerCase().includes(search)
                || order.status.toLowerCase().includes(search)
                || order.mode.toLowerCase().includes(search);

            const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
            const matchesDate = isDateInRange(order.createdAt, dateRange);
            const matchesMode = modeFilter === 'All' || order.mode === modeFilter;

            return matchesSearch && matchesStatus && matchesDate && matchesMode;
        });
    }, [orders, searchQuery, filterStatus, dateRange, modeFilter]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                <div className="flex items-center gap-3">
                    <button onClick={fetchOrders} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Order ID..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 w-64"
                        />
                    </div>
                    <div className="relative">
                        <Button variant="outline" icon={Filter} onClick={() => setShowFilters(prev => !prev)}>
                            Filter
                        </Button>
                        {showFilters && (
                            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Status</div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {['All', 'New', 'Preparing', 'Delivered', 'Cancelled'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setFilterStatus(status)}
                                            className={`px-2.5 py-1 rounded text-xs ${filterStatus === status ? 'bg-neutral-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Mode</div>
                                <div className="flex flex-wrap gap-2">
                                    {['All', 'Delivery', 'Pickup', 'Start Delivery'].map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setModeFilter(mode)}
                                            className={`px-2.5 py-1 rounded text-xs ${modeFilter === mode ? 'bg-neutral-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden shadow-sm border border-gray-200">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Restaurant</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Mode</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Total</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Time</th>
                            <th className="p-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={7} className="p-8 text-center"><RefreshCw className="w-6 h-6 animate-spin text-primary-500 mx-auto" /></td></tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-sm text-gray-500">
                                    No orders to display
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map(order => (
                                <tr
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors group"
                                >
                                    <td className="p-4 font-bold text-gray-900">{order.id}</td>
                                    <td className="p-4 text-sm text-gray-700">{order.restaurant}</td>
                                    <td className="p-4">
                                        <span className="bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">
                                            {order.mode}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">{order.total}</td>
                                    <td className="p-4 text-sm text-gray-500">{order.time}</td>
                                    <td className="p-4 text-right">
                                        <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Card>

            <Drawer
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                title={selectedOrder ? `Order Details ${selectedOrder.id}` : 'Order Details'}
                size="xl"
                footer={
                    <div className="flex gap-3">
                        <Button className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">Cancel Order</Button>
                        <Button className="flex-1" icon={Printer} variant="outline">Print Receipt</Button>
                    </div>
                }
            >
                {selectedOrder && (
                    <div className="space-y-8">
                        {/* Timeline */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">Order Status</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                                {['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'].map((step) => {
                                    const reached = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'].indexOf(selectedOrder.status.toUpperCase()) >= ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'].indexOf(step);
                                    return (
                                        <span key={step} className={`px-3 py-1 rounded-full text-xs font-semibold border ${reached ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'
                                            }`}>{step}</span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Items */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-gray-900">Items ({selectedOrder.items})</h3>
                                <span className="text-sm font-bold text-gray-900">{selectedOrder.total}</span>
                            </div>
                            <div className="space-y-3">
                                {(selectedOrder.orderItems || []).length > 0 ? (
                                    selectedOrder.orderItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{item.quantity}x {item.name}</span>
                                            <span className="text-gray-900 font-medium">PKR {(item.price * item.quantity).toFixed(0)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No item details available</p>
                                )}
                            </div>
                        </div>

                        {/* Customer & Restaurant */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border border-gray-200 rounded-xl">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Customer</p>
                                <p className="font-medium text-gray-900">{selectedOrder.customer}</p>
                                <p className="text-xs text-gray-500">View Profile</p>
                            </div>
                            <div className="p-4 border border-gray-200 rounded-xl">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Restaurant</p>
                                <p className="font-medium text-gray-900">{selectedOrder.restaurant}</p>
                                <p className="text-xs text-gray-500">Contact</p>
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default OrdersPage;
