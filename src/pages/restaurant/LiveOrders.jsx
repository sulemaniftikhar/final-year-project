import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Filter, Clock, Package, Truck, Utensils,
  CheckCircle, XCircle, AlertCircle, Printer,
  MessageSquare, User, MapPin, ChevronRight,
  MoreVertical, RefreshCw, Download, Upload, ShoppingBag
} from 'lucide-react';
import io from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useRestaurant } from '../../features/restaurant/RestaurantContext';
import { orderService } from '../../services/order.service';

const LiveOrders = () => {
  const { restaurant } = useRestaurant();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [countdowns, setCountdowns] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const socketRef = useRef(null);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'pickup', label: 'Pickup' },
    { id: 'dinein', label: 'Dine-in' },
  ];

  const fetchOrders = async () => {
    if (!restaurant?.id) return;
    try {
      setLoading(true);
      const res = await orderService.getOrders();
      const rawOrders = res.data || [];
      // filter out completed/cancelled if needed, or keep for history? Let's just keep today's or pending/active ones.
      const activeStats = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'];
      const activeOrders = rawOrders.filter(o => activeStats.includes(o.status));

      const mappedOrders = activeOrders.map(mapBackendOrderToUI);
      setOrders(mappedOrders);
      if (mappedOrders.length > 0 && !selectedOrder) {
        setSelectedOrder(mappedOrders[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const mapBackendOrderToUI = (o) => {
    const isDineIn = o.type === 'DINEIN';
    const isDelivery = o.type === 'DELIVERY';

    let orderType = 'pickup';
    if (isDineIn) orderType = 'dinein';
    if (isDelivery) orderType = 'delivery';

    return {
      id: o.id,
      orderNumber: o.orderNumber,
      type: orderType,
      table: o.table || null,
      address: o.deliveryAddress ? JSON.parse(o.deliveryAddress)?.address : null,
      items: o.items?.length || 0,
      total: o.total,
      time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      elapsed: o.createdAt, // will format later
      status: o.status.toLowerCase(),
      customerName: o.customer?.fullName || 'Guest',
      customerNotes: o.customerNotes || '',
      itemsList: o.items?.map(i => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        modifiers: i.modifiers
      })) || [],
      prepTime: o.prepTime || 15,
      pickupName: !isDelivery && !isDineIn ? (o.customer?.fullName || 'Customer') : null
    };
  };

  useEffect(() => {
    fetchOrders();

    if (restaurant?.id) {
      // Connect to websocket
      const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      socketRef.current = io(socketUrl);

      socketRef.current.on('connect', () => {
        socketRef.current.emit('join_restaurant', restaurant.id);
      });

      socketRef.current.on('newOrder', (newOrder) => {
        toast.success(`New order received: ${newOrder.orderNumber}`);
        setOrders(prev => {
          const mapped = mapBackendOrderToUI(newOrder);
          return [mapped, ...prev];
        });
      });

      socketRef.current.on('orderStatusUpdate', (updatedOrder) => {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? mapBackendOrderToUI(updatedOrder) : o));
      });

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [restaurant]);

  const updateStatus = async (id, status, prepTime = null) => {
    try {
      setProcessing(true);
      await orderService.updateOrderStatus(id, status);
      toast.success(`Order marked as ${status}`);
      fetchOrders(); // refresh view
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    } finally {
      setProcessing(false);
    }
  };

  const statusChips = [
    { id: 'new', label: 'New', count: orders.filter(o => o.status === 'pending').length, color: 'bg-primary-500' },
    { id: 'accepted', label: 'Accepted', count: orders.filter(o => o.status === 'accepted').length, color: 'bg-secondary-500' },
    { id: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'preparing').length, color: 'bg-warning' },
    { id: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length, color: 'bg-success' },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'all' || order.type === activeTab;
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const search = searchQuery.trim().toLowerCase();
    const matchesSearch = !search ||
      order.orderNumber.toLowerCase().includes(search) ||
      order.customerName.toLowerCase().includes(search) ||
      (order.table && order.table.toLowerCase().includes(search)) ||
      (order.address && order.address.toLowerCase().includes(search));
    return matchesTab && matchesStatus && matchesSearch;
  });

  const selectedOrderData = filteredOrders.find(order => order.id === selectedOrder) || filteredOrders[0] || orders[0];

  // Countdown timer for ready orders
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns(prev => {
        const newCountdowns = { ...prev };
        orders.forEach(order => {
          if (order.status === 'ready') {
            // Simulate countdown from 5:00
            const elapsedSeconds = Math.floor((Date.now() / 1000) % 300);
            const remaining = 300 - elapsedSeconds;
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            newCountdowns[order.id] = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          }
        });
        return newCountdowns;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'new':
        return { color: 'bg-primary-500', text: 'New' };
      case 'accepted':
        return { color: 'bg-secondary-500', text: 'Accepted' };
      case 'preparing':
        return { color: 'bg-warning', text: 'Preparing' };
      case 'ready':
        return { color: 'bg-success', text: 'Ready' };
      default:
        return { color: 'bg-neutral-400', text: 'Unknown' };
    }
  };

  const getOrderTypeIcon = (type) => {
    switch (type) {
      case 'delivery':
        return <Truck className="w-4 h-4" />;
      case 'pickup':
        return <Package className="w-4 h-4" />;
      case 'dinein':
        return <Utensils className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Controls Strip (56px height) */}
      <div className="h-14 mb-6 flex items-center justify-between">
        {/* Left: Tabs */}
        <div className="flex items-center space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-8 px-4 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Middle: Status Chips */}
        <div className="flex items-center space-x-2">
          {statusChips.map((status) => (
            <button
              key={status.id}
              onClick={() => setStatusFilter(status.id === statusFilter ? 'all' : status.id)}
              className={`h-8 px-3 rounded-full text-sm font-medium flex items-center space-x-2 ${statusFilter === status.id
                ? `${status.color} text-white`
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
            >
              <span>{status.label}</span>
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${statusFilter === status.id ? 'bg-white/30' : 'bg-neutral-300'
                }`}>
                {status.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Search & Filters */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-56 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50"
              aria-expanded={showFilters}
              aria-label="Toggle filters"
            >
              <Filter className="w-5 h-5 text-neutral-600" />
            </button>
            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg p-2 z-20">
                <div className="text-xs font-semibold text-neutral-500 px-2 py-1">Status</div>
                {['all', 'new', 'accepted', 'preparing', 'ready'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${statusFilter === status ? 'bg-primary-50 text-primary-700' : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
                <div className="border-t border-neutral-100 my-1"></div>
                <button
                  onClick={() => {
                    setActiveTab('all');
                    setStatusFilter('all');
                    setSearchQuery('');
                    setShowFilters(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-sm rounded-md text-neutral-700 hover:bg-neutral-50"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3-Panel Grid */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Panel 1: Queue (Left - 360px) */}
        <div className="col-span-12 lg:col-span-3 bg-white rounded-lg border border-neutral-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-900">Queue</h2>
              <span className="text-sm text-neutral-500">{filteredOrders.length} orders</span>
            </div>
          </div>

          <div className="divide-y divide-neutral-100 overflow-y-auto flex-1">
            {filteredOrders.length === 0 ? (
              <div className="p-6 text-sm text-neutral-500">No orders match the current filters.</div>
            ) : filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const isSelected = selectedOrder === order.id;

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order.id)}
                  className={`
                    p-3 cursor-pointer transition-colors relative
                    ${isSelected
                      ? 'bg-primary-50 border-l-3 border-primary-500'
                      : 'hover:bg-neutral-50'
                    }
                  `}
                >
                  {/* Title Row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getOrderTypeIcon(order.type)}
                      <span className="text-sm font-semibold text-neutral-900">
                        {order.type === 'dinein' ? `${order.table}` : `#${order.orderNumber}`}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-neutral-700">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Meta Row */}
                  <div className="text-xs text-neutral-500 mb-2">
                    {order.items} item{order.items !== 1 ? 's' : ''}
                  </div>

                  {/* Time/Status Row */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-neutral-500">
                      {order.time} • {order.status === 'ready' ? 'Auto-archives in' : order.elapsed}
                      {order.status === 'ready' && countdowns[order.id] && (
                        <span className="font-medium ml-1">{countdowns[order.id]}</span>
                      )}
                    </div>
                    <div className={`h-6 px-2 rounded-full text-xs font-semibold flex items-center ${statusConfig.color} text-white`}>
                      {statusConfig.text}
                    </div>
                  </div>

                  {/* New Order Highlight */}
                  {order.status === 'new' && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 2 & 3 */}
        {selectedOrderData ? (
          <>
            {/* Panel 2: Detail (Center) */}
            <div className="col-span-12 lg:col-span-6 bg-white rounded-lg border border-neutral-200 flex flex-col overflow-hidden">
              {/* Detail Header (72px) */}
              <div className="p-4 border-b border-neutral-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h2 className="text-base font-semibold text-neutral-900">
                        {selectedOrderData.type === 'dinein'
                          ? `${selectedOrderData.table} • Order ${selectedOrderData.orderNumber}`
                          : `Order ${selectedOrderData.orderNumber}`
                        }
                      </h2>
                      <div className={`h-6 px-2 rounded-full text-xs font-semibold flex items-center ${getStatusConfig(selectedOrderData.status).color} text-white`}>
                        {getStatusConfig(selectedOrderData.status).text}
                      </div>
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">
                      Received {selectedOrderData.time}
                      {selectedOrderData.status === 'ready' && countdowns[selectedOrderData.id] && (
                        <span className="ml-4 font-medium">
                          Auto-archives in {countdowns[selectedOrderData.id]}
                        </span>
                      )}
                    </p>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View in History
                  </button>
                </div>
              </div>

              {/* Context Block */}
              <div className="p-4 border-b border-neutral-200 flex-shrink-0">
                {selectedOrderData.type === 'dinein' ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-semibold text-neutral-900">{selectedOrderData.table}</div>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                          Dine-in
                        </div>
                        <div className="text-sm text-neutral-600">
                          Customer: {selectedOrderData.customerName}
                        </div>
                      </div>
                    </div>
                    <button className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                      <MoreVertical className="w-5 h-5 text-neutral-600" />
                    </button>
                  </div>
                ) : selectedOrderData.type === 'delivery' ? (
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Truck className="w-5 h-5 text-primary-600" />
                      <span className="font-medium">Delivery</span>
                    </div>
                    <div className="text-sm text-neutral-900 mb-1">{selectedOrderData.address}</div>
                    <div className="text-sm text-neutral-600">Customer: {selectedOrderData.customerName}</div>
                    <button className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      View Instructions
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Package className="w-5 h-5 text-secondary-600" />
                      <span className="font-medium">Pickup</span>
                    </div>
                    <div className="text-sm text-neutral-900 mb-1">Name: {selectedOrderData.pickupName}</div>
                    <div className="text-sm text-neutral-600">Ready for pickup</div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="p-4 overflow-y-auto flex-1">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Items</h3>
                <div className="space-y-4">
                  {selectedOrderData.itemsList.map((item, index) => (
                    <div key={index} className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                            {item.modifiers && (
                              <p className="text-xs text-neutral-500 mt-1">{item.modifiers}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-neutral-900">
                        ${item.price ? (item.price * item.quantity).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Customer Notes */}
                {selectedOrderData.customerNotes && (
                  <div className="mt-6 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900 mb-1">Customer Notes</p>
                        <p className="text-sm text-neutral-700">{selectedOrderData.customerNotes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Prep Time Chips */}
              <div className="p-4 border-t border-neutral-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 mb-3">Prep time</p>
                    <div className="flex items-center space-x-2">
                      {[15, 20, 25, 30].map((minutes) => (
                        <button
                          key={minutes}
                          className={`h-8 px-3 rounded-lg text-sm font-medium ${selectedOrderData.prepTime === minutes
                            ? 'bg-primary-600 text-white'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                            }`}
                        >
                          {minutes} min
                        </button>
                      ))}
                      <button className="h-8 px-3 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200">
                        Custom
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar (72px) */}
              <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-500">
                    Est. prep: {selectedOrderData.prepTime} minutes
                  </div>
                  <div className="flex items-center space-x-3">
                    {selectedOrderData.status === 'pending' && (
                      <>
                        <button
                          disabled={processing}
                          onClick={() => updateStatus(selectedOrderData.id, 'CANCELLED')}
                          className="h-10 px-4 bg-error/10 text-error rounded-lg font-medium hover:bg-error/20 disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          disabled={processing}
                          onClick={() => updateStatus(selectedOrderData.id, 'ACCEPTED', selectedOrderData.prepTime)}
                          className="h-10 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                        >
                          Accept Order
                        </button>
                      </>
                    )}
                    {selectedOrderData.status === 'accepted' && (
                      <button
                        disabled={processing}
                        onClick={() => updateStatus(selectedOrderData.id, 'PREPARING')}
                        className="h-10 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                      >
                        Mark Preparing
                      </button>
                    )}
                    {selectedOrderData.status === 'preparing' && (
                      <button
                        disabled={processing}
                        onClick={() => updateStatus(selectedOrderData.id, 'READY')}
                        className="h-10 px-4 bg-success text-white rounded-lg font-medium hover:bg-success/90 disabled:opacity-50"
                      >
                        Mark Ready
                      </button>
                    )}
                    {selectedOrderData.status === 'ready' && (
                      <button
                        disabled={processing}
                        onClick={() => updateStatus(selectedOrderData.id, 'COMPLETED')}
                        className="h-10 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                      >
                        {selectedOrderData.type === 'delivery' ? 'Mark Delivered' : 'Mark Completed'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Panel 3: Operational Notes (Right - 320px) */}
            <div className="col-span-12 lg:col-span-3 space-y-4">
              {/* Customer Notes Card */}
              <div className="bg-white rounded-lg border border-neutral-200 p-4">
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Customer Notes</h3>
                {selectedOrderData.customerNotes ? (
                  <p className="text-sm text-neutral-700">{selectedOrderData.customerNotes}</p>
                ) : (
                  <p className="text-sm text-neutral-400">No notes from customer</p>
                )}
              </div>

              {/* Allergens/Dietary */}
              <div className="bg-white rounded-lg border border-neutral-200 p-4">
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Allergens & Dietary</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Gluten-free</span>
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Vegetarian</span>
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Nut Allergy</span>
                    <XCircle className="w-4 h-4 text-neutral-300" />
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="bg-white rounded-lg border border-neutral-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-neutral-900">Internal Notes</h3>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Edit
                  </button>
                </div>
                <textarea
                  placeholder="Add internal notes here..."
                  className="w-full h-24 p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
                  defaultValue="Table 12 requested extra napkins"
                />
              </div>

              {/* Print Placeholder */}
              <div className="bg-white rounded-lg border border-neutral-200 p-4">
                <div className="flex items-center space-x-3">
                  <Printer className="w-5 h-5 text-neutral-600" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Print Receipt</p>
                    <p className="text-xs text-neutral-500">Print kitchen ticket or customer receipt</p>
                  </div>
                </div>
                <button className="w-full mt-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200">
                  Print Now
                </button>
              </div>

              {/* Support Link */}
              <div className="bg-white rounded-lg border border-neutral-200 p-4">
                <button className="w-full flex items-center justify-center space-x-2 text-primary-600 hover:text-primary-700">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">Contact Support</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-12 lg:col-span-9 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center p-12 text-center h-[600px]">
            <CheckCircle className="w-16 h-16 text-neutral-300 mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No active orders</h3>
            <p className="text-neutral-500 max-w-sm">
              You're all caught up! New orders will appear here automatically when they are placed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveOrders;
