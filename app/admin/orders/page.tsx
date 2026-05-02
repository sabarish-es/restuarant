'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Eye } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/orders`;
      if (statusFilter) url += `?status=${statusFilter}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setOrders(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    'all': orders.length,
    'pending': orders.filter((o: any) => o.status === 'pending').length,
    'preparing': orders.filter((o: any) => o.status === 'preparing').length,
    'completed': orders.filter((o: any) => o.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
        <p className="text-gray-500">Manage customer orders</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'All Orders', value: stats['all'], color: 'bg-blue-100' },
          { label: 'Pending', value: stats['pending'], color: 'bg-yellow-100' },
          { label: 'Preparing', value: stats['preparing'], color: 'bg-orange-100' },
          { label: 'Completed', value: stats['completed'], color: 'bg-green-100' },
        ].map((stat) => (
          <Card key={stat.label} className={stat.color}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status Filter</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          {['all', 'pending', 'preparing', 'ready', 'completed'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status === 'all' ? '' : status)}
              className={statusFilter === status ? 'bg-purple-600' : ''}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
          <CardDescription>{orders.length} orders found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold">Table / Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Time</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-purple-600">{order.order_number}</td>
                    <td className="py-3 px-4">{order.table_number ? `Table ${order.table_number}` : 'Takeaway'}</td>
                    <td className="py-3 px-4">{order.customer_name || 'Walk-in'}</td>
                    <td className="py-3 px-4 font-semibold">₹{order.total}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'preparing'
                              ? 'bg-orange-100 text-orange-800'
                              : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
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
