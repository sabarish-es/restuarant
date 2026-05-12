'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Eye } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    fetchOrders();
  }, [statusFilter, router]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Authentication required. Please login again.');
      setLoading(false);
      return;
    }

    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/orders`;
      if (statusFilter) url += `?status=${statusFilter}`;

      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        router.push('/');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || `Server error (${response.status})`;
        setError(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch orders. Ensure backend server is running.';
      setError(errorMsg);
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

  const handleViewOrder = (orderId: number) => {
    router.push(`/admin/orders/${orderId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
        <p className="text-gray-500">Manage customer orders</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Error Loading Orders</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">Loading orders...</p>
          </CardContent>
        </Card>
      ) : (
        <>
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
                    <td className="py-3 px-4 font-medium text-purple-600">#{order.id}</td>
                    <td className="py-3 px-4">{order.table_number ? `Table ${order.table_number}` : 'Takeaway'}</td>
                    <td className="py-3 px-4">{order.customer_name || 'Walk-in'}</td>
                    <td className="py-3 px-4 font-semibold">₹{(order.total || 0).toLocaleString()}</td>
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewOrder(order.id)}
                      >
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
        </>
      )}
    </div>
  );
}
