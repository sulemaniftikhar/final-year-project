import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import DashboardSidebar from '../../components/layout/Customer/DashboardSidebar';
import Card from '../../components/ui/Card';
import { useCart } from '../../features/customer/CartContext';
import { orderService } from '../../services/order.service';
import { useAuth } from '../../features/auth/AuthContext';


const Profile = () => {

    const navigate = useNavigate();
    const { cartItems, addToCart, updateQuantity, clearCart } = useCart();
    const { profile } = useAuth();

    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await orderService.getOrders({ role: 'CUSTOMER' });
                // Filter to get only recent completed or in-progress orders, limited to 5
                const orders = res.data?.orders || res.data || [];
                setRecentOrders(orders.slice(0, 5));
            } catch (error) {
                console.error('Failed to fetch orders', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);



    const handleReorder = (order) => {
        if (cartItems.length > 0) {
            const ok = window.confirm('Replace your current cart with this reorder?');
            if (!ok) return;
            clearCart();
        }

        order.items?.forEach((item) => {
            const menuItemId = item.menuItem?.id || item.menuItemId;
            const price = typeof item.price === 'number' ? `PKR ${item.price}` : item.price;
            addToCart(
                { id: menuItemId, name: item.menuItem?.name || 'Item', price },
                order.restaurant || { id: order.restaurantId, name: order.restaurant?.name || 'Restaurant' }
            );
            if (item.quantity > 1) {
                updateQuantity(menuItemId, item.quantity - 1);
            }
        });

        navigate('/customer/checkout');
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
                        {/* Orders Section */}
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-neutral-900 mb-4">Recent Orders</h2>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-center py-4 text-neutral-500">Loading orders...</div>
                                ) : recentOrders.length === 0 ? (
                                    <div className="text-center py-4 text-neutral-500">No recent orders found.</div>
                                ) : (
                                    recentOrders.map((order) => {
                                        const dateStr = new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                        const itemsSummary = order.items?.map(i => `${i.quantity}x ${i.menuItem?.name || 'Item'}`).join(', ') || 'Various Items';

                                        return (
                                            <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-primary-100 transition shadow-sm">
                                                <div className="mb-2 sm:mb-0">
                                                    <div className="flex justify-between sm:justify-start sm:items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-neutral-900">{order.restaurant?.name || 'Restaurant'}</h3>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${['PENDING', 'ACCEPTED', 'PREPARING', 'READY'].includes(order.status) ? 'bg-yellow-100 text-yellow-800' : order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-neutral-500">{itemsSummary}</p>
                                                    <p className="text-xs text-neutral-400 mt-1">{dateStr}</p>
                                                </div>
                                                <div className="flex items-center justify-between sm:gap-6">
                                                    <span className="font-bold text-neutral-900">PKR {order.totalAmount || order.total}</span>
                                                    <button
                                                        className="text-primary-600 text-sm font-medium hover:underline"
                                                        onClick={() => handleReorder(order)}
                                                    >
                                                        Reorder
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

