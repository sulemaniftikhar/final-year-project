import { TrendingUp, Users, Clock, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useRestaurant } from '../../features/restaurant/RestaurantContext';
import { orderService } from '../../services/order.service';
import { teamService } from '../../services/team.service';

const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const { restaurant } = useRestaurant();

  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({
    orders: 0,
    activeStaff: '0/0',
    avgPrepTime: 0,
    revenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!restaurant?.id) return;
      try {
        setLoading(true);
        const [ordersRes, teamRes] = await Promise.all([
          orderService.getOrders(),
          teamService.getTeamMembers(restaurant.id)
        ]);

        const allOrders = ordersRes.data || [];
        const allTeam = teamRes.data || [];

        // Compute Today's Stats
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        let tempOrders = 0;
        let tempRevenue = 0;
        let prepTimeSum = 0;
        let prepOrdersCount = 0;

        const sortedOrders = allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        sortedOrders.forEach(o => {
          const oDate = new Date(o.createdAt);
          if (oDate >= startOfToday) {
            tempOrders++;
            tempRevenue += o.total;
            if (o.prepTime) {
              prepTimeSum += o.prepTime;
              prepOrdersCount++;
            }
          }
        });

        const activeStaffCount = allTeam.filter(m => m.status === 'ACTIVE').length;
        const avgPrep = prepOrdersCount > 0 ? Math.round(prepTimeSum / prepOrdersCount) : 0;

        setTodayStats({
          orders: tempOrders,
          activeStaff: `${activeStaffCount}/${allTeam.length}`,
          avgPrepTime: avgPrep,
          revenue: tempRevenue
        });

        // Set Recent 5
        setRecentOrders(sortedOrders.slice(0, 5).map(o => ({
          id: o.orderNumber || o.id.slice(0, 8),
          table: o.table || (o.type === 'DELIVERY' ? 'Delivery' : 'Pickup'),
          items: o.items?.length || 0,
          amount: `$${o.total.toFixed(2)}`,
          status: o.status
        })));

      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [restaurant]);

  const stats = [
    { label: 'Today\'s Orders', value: todayStats.orders.toString(), change: null, icon: <TrendingUp size={24} />, color: 'primary' },
    { label: 'Active Staff', value: todayStats.activeStaff, icon: <Users size={24} />, color: 'secondary' },
    { label: 'Avg Prep Time', value: todayStats.avgPrepTime > 0 ? `${todayStats.avgPrepTime} min` : '-', change: null, icon: <Clock size={24} />, color: 'warning' },
    { label: 'Today\'s Revenue', value: `$${todayStats.revenue.toFixed(2)}`, icon: <DollarSign size={24} />, color: 'success' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-800">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
                <div className={`text-${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              {stat.change && (
                <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-success' : 'text-error'}`}>
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-neutral-800">{stat.value}</p>
            <p className="text-sm text-neutral-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="col-span-2 bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate("/restaurant/menu?add=1", { state: { openEditor: true, currentItem: null } })} className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <div className="text-primary">+</div>
                </div>
                <div>
                  <p className="font-medium">Add Menu Item</p>
                  <p className="text-sm text-neutral-600">Create new item</p>
                </div>
              </div>
            </button>
            <button className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <div className="text-secondary">🕐</div>
                </div>
                <div>
                  <p className="font-medium">Update Hours</p>
                  <p className="text-sm text-neutral-600">Change operating hours</p>
                </div>
              </div>
            </button>
            <button onClick={() => navigate("/restaurant/team ")} className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <div className="text-success">👥</div>
                </div>
                <div>
                  <p className="font-medium">Invite Staff</p>
                  <p className="text-sm text-neutral-600">Add team member</p>
                </div>
              </div>
            </button>
            <button className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <div className="text-warning">📊</div>
                </div>
                <div>
                  <p className="font-medium">View Reports</p>
                  <p className="text-sm text-neutral-600">Analytics dashboard</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-800">Recent Orders</h2>
            <button onClick={() => navigate("/restaurant/order-history")} className="text-primary hover:text-primary/80 text-sm">
              View all →
            </button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-neutral-600">
                    {order.table || 'Pickup'} • {order.items} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{order.amount}</p>
                  <span className={`text-sm px-2 py-1 rounded-full ${order.status === 'Ready' ? 'bg-success/10 text-success' :
                    order.status === 'Preparing' ? 'bg-warning/10 text-warning' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;