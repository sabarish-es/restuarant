'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Printer } from 'lucide-react';
import { orderApi } from '@/lib/api';

interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  quantity: number;
  unit_price: number;
  menu_item_name: string;
}

interface Order {
  id: number;
  table_id: number | null;
  customer_id: number | null;
  cashier_id: number | null;
  order_type: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  table_number: number | null;
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    fetchOrderDetails();
  }, [orderId, router]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await orderApi.getDetails(parseInt(orderId));
      console.log('[v0] Order details fetched:', data);
      setOrder(data.order);
      setItems(data.items);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch order details';
      setError(errorMsg);
      console.error('[v0] Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    
    setUpdatingStatus(true);
    try {
      await orderApi.updateStatus(order.id, newStatus);
      console.log('[v0] Order status updated to:', newStatus);
      setOrder({ ...order, status: newStatus });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update order status';
      setError(errorMsg);
      console.error('[v0] Error updating order status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrintBill = async () => {
    if (!order) return;
    
    try {
      const data = await orderApi.printBill(order.id);
      console.log('[v0] Bill retrieved for order:', order.id);
      
      // Open bill in new window for printing
      const billWindow = window.open('', '_blank');
      if (billWindow) {
        billWindow.document.write(data.billHTML);
        billWindow.document.close();
        billWindow.print();
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to generate bill';
      setError(errorMsg);
      console.error('[v0] Error printing bill:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">Loading order details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500 font-semibold">Order not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Order #{order.id}</h1>
        </div>
        <Button onClick={handlePrintBill} className="gap-2">
          <Printer className="w-4 h-4" />
          Print Bill
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold capitalize">{order.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order Type</p>
              <p className="font-semibold capitalize">{order.order_type || 'Dine In'}</p>
            </div>
            {order.table_number && (
              <div>
                <p className="text-sm text-gray-600">Table Number</p>
                <p className="font-semibold">Table {order.table_number}</p>
              </div>
            )}
            {order.customer_name && (
              <div>
                <p className="text-sm text-gray-600">Customer Name</p>
                <p className="font-semibold">{order.customer_name}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="font-semibold">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            {order.notes && (
              <div>
                <p className="text-sm text-gray-600">Special Notes</p>
                <p className="font-semibold">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2">
              {['pending', 'preparing', 'ready', 'completed'].map((status) => (
                <Button
                  key={status}
                  variant={order.status === status ? 'default' : 'outline'}
                  onClick={() => handleStatusChange(status)}
                  disabled={updatingStatus}
                  className={order.status === status ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>{items.length} items in this order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Item Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold">Unit Price</th>
                  <th className="text-left py-3 px-4 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{item.menu_item_name}</td>
                    <td className="py-3 px-4">{item.quantity}</td>
                    <td className="py-3 px-4">₹{(item.unit_price || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 font-semibold">₹{((item.unit_price || 0) * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bill Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">₹{(order.subtotal || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (5%):</span>
              <span className="font-semibold">₹{(order.tax || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg border-t pt-3">
              <span className="font-bold">Total Amount:</span>
              <span className="font-bold text-purple-600">₹{(order.total || 0).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
