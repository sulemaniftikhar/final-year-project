import { useState, useEffect } from 'react';
import { Search, Calendar, Filter, Eye, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { orderService } from '../../services/order.service';

const OrderHistory = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders({ completed: true });
      const fetched = (data.data || []).map(o => ({
        id: o.orderNumber || o.id,
        table: o.tableNumber || null,
        mode: o.type === 'DELIVERY' ? 'Delivery' : o.type === 'PICKUP' ? 'Pickup' : 'Dine-in',
        date: new Date(o.createdAt).toLocaleString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        dateRaw: o.createdAt,
        items: o.items?.length || 0,
        total: `PKR ${parseFloat(o.total || 0).toFixed(0)}`,
        status: (o.status || 'COMPLETED').toLowerCase(),
        timeline: o.statusHistory || [{ status: 'Received', time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
        orderItems: o.items || [],
        subtotal: o.subtotal,
        deliveryFee: o.deliveryFee,
        taxes: o.taxes,
      }));
      setOrders(fetched);
    } catch (err) {
      console.error('Failed to fetch order history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready': return <CheckCircle className="text-success" size={16} />;
      case 'completed': return <CheckCircle className="text-success" size={16} />;
      case 'preparing': return <Clock className="text-warning" size={16} />;
      case 'cancelled': return <XCircle className="text-error" size={16} />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'bg-success/10 text-success';
      case 'completed': return 'bg-success/10 text-success';
      case 'preparing': return 'bg-warning/10 text-warning';
      case 'cancelled': return 'bg-error/10 text-error';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const filteredOrders = orders.filter((order) => {
    const search = searchQuery.trim().toLowerCase();
    const matchesSearch = !search ||
      String(order.id).toLowerCase().includes(search) ||
      (order.table && order.table.toLowerCase().includes(search));

    const orderDate = order.dateRaw ? order.dateRaw.split('T')[0] : order.date.split(' ')[0];
    const matchesDate = !dateFilter || orderDate === dateFilter;

    const matchesMode = modeFilter === 'all' || order.mode.toLowerCase() === modeFilter;
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesDate && matchesMode && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-800">Order History</h1>
        <div className="flex gap-2">
          <button onClick={fetchOrders} disabled={loading} className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50">Export</button>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-neutral-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Order #, Table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Modes</option>
            <option value="delivery">Delivery</option>
            <option value="pickup">Pickup</option>
            <option value="dine-in">Dine-in</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200 sticky top-0">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-neutral-600">Order ID</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-600">Table</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-600">Mode</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-600">Date/Time</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-600">Items</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-600">Total</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-600">Status</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center"><RefreshCw className="w-6 h-6 animate-spin text-primary-500 mx-auto" /></td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-neutral-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="p-4 font-medium text-neutral-800">{order.id}</td>
                    <td className="p-4">
                      {order.table ? (
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {order.table}
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${order.mode === 'Delivery' ? 'bg-secondary/10 text-secondary' :
                        order.mode === 'Pickup' ? 'bg-accent/10 text-accent' :
                          'bg-primary/10 text-primary'
                        }`}>
                        {order.mode}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-600">{order.date}</td>
                    <td className="p-4 text-neutral-600">{order.items} items</td>
                    <td className="p-4 font-medium text-neutral-800">{order.total}</td>
                    <td className="p-4">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-neutral-100 rounded-lg"
                      >
                        <Eye size={20} className="text-neutral-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
          <div className="bg-white h-full w-[480px] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-800">
                    {selectedOrder.table ? `${selectedOrder.table} • ` : ''}Order #{selectedOrder.id}
                  </h2>
                  <p className="text-neutral-600">{selectedOrder.date}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-6 border-b border-neutral-200">
              <h3 className="font-medium text-neutral-800 mb-4">Order Timeline</h3>
              <div className="space-y-4">
                {selectedOrder.timeline.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="font-medium">{step.status}</p>
                      <p className="text-sm text-neutral-600">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="p-6 border-b border-neutral-200">
              <h3 className="font-medium text-neutral-800 mb-4">Items</h3>
              <div className="space-y-4">
                {(selectedOrder.orderItems || []).length > 0 ? (
                  selectedOrder.orderItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-neutral-600">x{item.quantity}</p>
                      </div>
                      <p className="font-medium">PKR {(item.price * (item.quantity || 1)).toFixed(0)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-neutral-500">No item detail available</p>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span>PKR {parseFloat(selectedOrder.subtotal || 0).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tax</span>
                  <span>PKR {parseFloat(selectedOrder.taxes || 0).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Delivery Fee</span>
                  <span>PKR {parseFloat(selectedOrder.deliveryFee || 0).toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-neutral-200 pt-2">
                  <span>Total</span>
                  <span>{selectedOrder.total}</span>
                </div>
              </div>

              {selectedOrder.status === 'ready' && (
                <div className="mt-6 p-3 bg-success/10 border border-success/20 rounded-lg">
                  <p className="text-sm text-success">Auto‑archived after 05:00 in Ready</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;

