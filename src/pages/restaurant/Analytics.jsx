import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Clock, PieChart, RefreshCw } from 'lucide-react';
import { useRestaurant } from '../../features/restaurant/RestaurantContext';
import { orderService } from '../../services/order.service';

const Analytics = () => {
  const { restaurant } = useRestaurant();
  const [range, setRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ orders: 0, revenue: 0, avgPrep: 0, modeShare: '' });
  const [topItems, setTopItems] = useState([]);
  const [ordersByMode, setOrdersByMode] = useState({ delivery: 0, pickup: 0, dinein: 0 });

  useEffect(() => {
    if (!restaurant?.id) return;
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await orderService.getOrders();
        const allOrders = res.data || [];

        // Filter by range
        const now = new Date();
        const cutoff = new Date();
        if (range === 'Today') cutoff.setHours(0, 0, 0, 0);
        else if (range === '7d') cutoff.setDate(now.getDate() - 7);
        else if (range === '30d') cutoff.setDate(now.getDate() - 30);

        const filtered = range === 'Custom'
          ? allOrders
          : allOrders.filter(o => new Date(o.createdAt) >= cutoff);

        // Compute KPIs
        let totalRevenue = 0;
        let prepSum = 0;
        let prepCount = 0;
        const modeCounts = { delivery: 0, pickup: 0, dinein: 0 };
        const itemCountMap = {};

        filtered.forEach(o => {
          totalRevenue += o.total || 0;
          if (o.prepTime) { prepSum += o.prepTime; prepCount++; }
          const t = (o.type || '').toLowerCase();
          if (t === 'delivery') modeCounts.delivery++;
          else if (t === 'pickup') modeCounts.pickup++;
          else if (t === 'dinein') modeCounts.dinein++;

          (o.items || []).forEach(item => {
            if (!itemCountMap[item.name]) itemCountMap[item.name] = { qty: 0, revenue: 0 };
            itemCountMap[item.name].qty += item.quantity || 1;
            itemCountMap[item.name].revenue += (item.price || 0) * (item.quantity || 1);
          });
        });

        const totalMode = modeCounts.delivery + modeCounts.pickup + modeCounts.dinein || 1;
        const topMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0];
        const modePct = Math.round((topMode[1] / totalMode) * 100);

        setStats({
          orders: filtered.length,
          revenue: totalRevenue,
          avgPrep: prepCount > 0 ? Math.round(prepSum / prepCount) : 0,
          modeShare: `${modePct}% ${topMode[0].charAt(0).toUpperCase() + topMode[0].slice(1)}`,
        });
        setOrdersByMode(modeCounts);

        const sorted = Object.entries(itemCountMap)
          .sort((a, b) => b[1].qty - a[1].qty)
          .slice(0, 5)
          .map(([name, data]) => ({
            name,
            qty: data.qty,
            revenue: `PKR ${data.revenue.toFixed(0)}`,
          }));
        setTopItems(sorted);
      } catch (err) {
        console.error('Analytics fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [restaurant, range]);

  const kpis = [
    { label: 'Orders', value: loading ? '...' : stats.orders.toString(), icon: <TrendingUp size={24} />, color: 'primary' },
    { label: 'Revenue', value: loading ? '...' : `PKR ${stats.revenue.toFixed(0)}`, icon: <DollarSign size={24} />, color: 'success' },
    { label: 'Avg Prep Time', value: loading ? '...' : (stats.avgPrep > 0 ? `${stats.avgPrep} min` : '—'), icon: <Clock size={24} />, color: 'warning' },
    { label: 'Top Mode', value: loading ? '...' : stats.modeShare, icon: <PieChart size={24} />, color: 'secondary' },
  ];

  const totalMode = ordersByMode.delivery + ordersByMode.pickup + ordersByMode.dinein || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-800">Analytics</h1>
        {loading && <RefreshCw className="w-5 h-5 animate-spin text-primary-500" />}
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-neutral-200">
        <div className="flex gap-2">
          {['Today', '7d', '30d'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-lg transition-colors ${range === r
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className={`p-2 rounded-lg bg-${kpi.color}/10 inline-block mb-4`}>
              <div className={`text-${kpi.color}`}>{kpi.icon}</div>
            </div>
            <p className="text-2xl font-bold text-neutral-800">{kpi.value}</p>
            <p className="text-sm text-neutral-600">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Items Table */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-800 mb-4">Top Selling Items</h3>
          {topItems.length === 0 ? (
            <p className="text-sm text-neutral-400 py-4 text-center">No item data for this period</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left p-3 text-sm font-medium text-neutral-600">Item</th>
                  <th className="text-left p-3 text-sm font-medium text-neutral-600">Qty Sold</th>
                  <th className="text-left p-3 text-sm font-medium text-neutral-600">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item, index) => (
                  <tr key={index} className="border-b border-neutral-100">
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3">{item.qty}</td>
                    <td className="p-3 font-medium">{item.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Order Mode Breakdown */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-800 mb-4">Orders by Mode</h3>
          <div className="space-y-4">
            {[
              { label: 'Delivery', key: 'delivery', color: 'bg-primary-500' },
              { label: 'Pickup', key: 'pickup', color: 'bg-secondary-500' },
              { label: 'Dine-in', key: 'dinein', color: 'bg-success' },
            ].map(({ label, key, color }) => {
              const count = ordersByMode[key];
              const pct = Math.round((count / totalMode) * 100);
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-700">{label}</span>
                    <span className="text-neutral-500">{count} orders ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full">
                    <div className={`h-2 ${color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
