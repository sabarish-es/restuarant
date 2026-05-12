'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Volume2, CheckCircle, AlertCircle } from 'lucide-react';

export default function KitchenPage() {
  const router = useRouter();
  const [orders, setOrders] = useState({ new: [], preparing: [], ready: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  // Helper function to construct proper image URLs
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // If it's a base64 image, return as is
    if (imageUrl.startsWith('data:image')) {
      return imageUrl;
    }
    // If it's a relative path, prepend the API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${apiUrl}${imageUrl}`;
  };

  useEffect(() => {
    fetchOrders();
    const orderInterval = setInterval(fetchOrders, 5000); // Refresh orders every 5 seconds
    
    // Update clock every second
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    
    return () => {
      clearInterval(orderInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kitchen-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const grouped = {
          new: data.filter((o: any) => o.status === 'pending'),
          preparing: data.filter((o: any) => o.status === 'preparing'),
          ready: data.filter((o: any) => o.status === 'ready'),
          completed: data.filter((o: any) => o.status === 'completed'),
        };
        setOrders(grouped);
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      
      // Play sound and show alert if order is marked as ready
      if (status === 'ready') {
        playSound();
        showAlertMessage('Order is ready! Notify cashier.');
      }
      
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order', error);
    }
  };

  const playSound = () => {
    if (!soundEnabled) return;
    
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  };

  const showAlertMessage = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const OrderCard = ({ order }: { order: any }) => (
    <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-4 text-white hover:border-gray-600 transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-lg font-bold text-purple-400">Order #{order.id}</div>
          <div className="text-sm text-gray-400">
            {order.table_number ? `Table ${order.table_number}` : 'Takeaway'}
          </div>
        </div>
        <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleTimeString()}</div>
      </div>

      <div className="mb-4 space-y-3 border-t border-gray-700 pt-3">
        {order.items?.map((item: any, idx: number) => (
          <div key={idx} className="flex gap-3 items-start text-sm border-b border-gray-700 pb-2">
            <span className="text-gray-400 font-bold min-w-[30px]">{item.quantity}x</span>
            <div className="flex-1">
              <div className="text-gray-200">{item.menu_item_name}</div>
              {item.image_url && (
                <img 
                  src={getImageUrl(item.image_url)} 
                  alt={item.menu_item_name}
                  className="w-16 h-16 rounded mt-2 object-cover border border-gray-600"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="bg-orange-900 border border-orange-700 rounded p-2 mb-3">
          <p className="text-xs text-orange-100">Note: {order.notes}</p>
        </div>
      )}

      <div className="text-xs text-gray-400 mb-3">By: {order.cashier_name || 'System'}</div>

      <div className="space-y-2">
        {order.status === 'pending' && (
          <Button
            onClick={() => updateOrderStatus(order.id, 'preparing')}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            Start Preparing
          </Button>
        )}
        {order.status === 'preparing' && (
          <Button
            onClick={() => updateOrderStatus(order.id, 'ready')}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Mark Ready
          </Button>
        )}
        {order.status === 'ready' && (
          <Button
            onClick={() => updateOrderStatus(order.id, 'completed')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Complete
          </Button>
        )}
      </div>
    </div>
  );

  const Column = ({
    title,
    orders: columnOrders,
    count,
    color,
  }: {
    title: string;
    orders: any[];
    count: number;
    color: string;
  }) => (
    <div className="flex-1 flex flex-col bg-gray-800 rounded-lg overflow-hidden">
      <div className={`${color} p-4 text-white font-bold flex items-center justify-between`}>
        <span>{title}</span>
        <span className="bg-white text-gray-900 font-bold px-3 py-1 rounded-full text-lg min-w-[40px] text-center">{count}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {columnOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders</p>
        ) : (
          columnOrders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      {/* Alert Message */}
      {showAlert && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-yellow-400 text-yellow-900 px-8 py-6 rounded-lg shadow-2xl border-4 border-yellow-600 flex items-center gap-4 animate-pulse">
            <AlertCircle className="w-8 h-8 flex-shrink-0" />
            <div>
              <p className="font-bold text-lg">{alertMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">👨‍🍳</div>
          <h1 className="text-2xl font-bold">Kitchen Display System</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant={soundEnabled ? "default" : "outline"}
            size="sm" 
            className={soundEnabled ? "bg-green-600 hover:bg-green-700 text-white" : "text-gray-300"}
          >
            <Volume2 className="w-4 h-4 mr-2" />
            {soundEnabled ? "Sound On" : "Sound Off"}
          </Button>
          <span className="text-sm text-gray-400">{currentTime.toLocaleTimeString()}</span>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="text-red-400"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-120px)]">
        <Column
          title="NEW ORDERS"
          orders={orders.new}
          count={orders.new.length}
          color="bg-red-600"
        />
        <Column
          title="PREPARING"
          orders={orders.preparing}
          count={orders.preparing.length}
          color="bg-orange-500"
        />
        <Column
          title="READY"
          orders={orders.ready}
          count={orders.ready.length}
          color="bg-green-600"
        />
        <Column
          title="COMPLETED"
          orders={orders.completed}
          count={orders.completed.length}
          color="bg-blue-600"
        />
      </div>
    </div>
  );
}
