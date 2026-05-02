'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 128,
    totalSales: 24560,
    customers: 96,
    pendingOrders: 18,
    recentOrders: [],
    salesTrend: [],
    topItems: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    color,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    color: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>{Icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here&apos;s your restaurant performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingCart className="w-4 h-4 text-white" />}
          trend="Today"
          color="bg-blue-100"
        />
        <StatCard
          title="Total Sales"
          value={`₹${(stats.totalSales).toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4 text-white" />}
          trend="Today"
          color="bg-green-100"
        />
        <StatCard
          title="Customers"
          value={stats.customers}
          icon={<Users className="w-4 h-4 text-white" />}
          trend="Total"
          color="bg-purple-100"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={<TrendingUp className="w-4 h-4 text-white" />}
          trend="Active"
          color="bg-orange-100"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>This Week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.salesTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
            <CardDescription>Today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topItems.slice(0, 5).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded object-cover" />
                    )}
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-purple-600 font-semibold">{item.total_qty || 0}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-4">Order ID</th>
                  <th className="text-left py-2 px-4">Table</th>
                  <th className="text-left py-2 px-4">Customer</th>
                  <th className="text-left py-2 px-4">Amount</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.slice(0, 5).map((order: any) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-purple-600">{order.order_number}</td>
                    <td className="py-3 px-4">{order.table_number || 'Takeaway'}</td>
                    <td className="py-3 px-4">{order.customer_name || 'Walk-in'}</td>
                    <td className="py-3 px-4 font-semibold">₹{order.total}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'preparing'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
