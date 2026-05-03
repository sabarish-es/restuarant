'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, Clock, LogOut, Trash2, ShoppingCart } from 'lucide-react';

export default function CashierPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentOrder, setCurrentOrder] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchItems(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategory(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchItems = async (categoryId: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/menu-items?categoryId=${categoryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        setItems(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch items', error);
    }
  };

  const addToOrder = (item: any) => {
    const existingItem = currentOrder.find((o) => o.menuItemId === item.id);
    if (existingItem) {
      setCurrentOrder(
        currentOrder.map((o) =>
          o.menuItemId === item.id ? { ...o, quantity: o.quantity + 1 } : o
        )
      );
    } else {
      setCurrentOrder([
        ...currentOrder,
        { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 },
      ]);
    }
  };

  const removeFromOrder = (index: number) => {
    setCurrentOrder(currentOrder.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(index);
    } else {
      const updated = [...currentOrder];
      updated[index].quantity = quantity;
      setCurrentOrder(updated);
    }
  };

  const subtotal = currentOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + tax;

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckout = async () => {
    if (currentOrder.length === 0) {
      alert('Please add items to the order');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: currentOrder,
          orderType: 'dine-in',
        }),
      });

      if (response.ok) {
        alert('Order created successfully!');
        setCurrentOrder([]);
      }
    } catch (error) {
      console.error('Failed to create order', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Sidebar - Menu Categories */}
      <div className={`${sidebarOpen ? 'w-40' : 'w-0'} bg-emerald-600 text-white transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-4 border-b border-emerald-700">
          <h2 className="font-bold text-lg">Cashier</h2>
          <p className="text-xs text-emerald-100">POS System</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <Button
            onClick={() => setSelectedCategory(null)}
            variant={selectedCategory === null ? 'default' : 'ghost'}
            className="w-full justify-start mb-2 bg-emerald-500 hover:bg-emerald-500"
          >
            All
          </Button>
          {categories.length > 0 ? (
            categories.map((cat) => (
              <Button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                variant={selectedCategory === cat.id ? 'default' : 'ghost'}
                className={`w-full justify-start mb-2 ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                {cat.name}
              </Button>
            ))
          ) : (
            <p className="text-emerald-100 text-xs p-2">Loading categories...</p>
          )}
        </div>

        <div className="p-3 border-t border-emerald-700">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-200 hover:text-red-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-slate-900">Menu Selection</h1>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{new Date().toLocaleTimeString()}</span>
          </div>
        </header>

        <div className="flex-1 flex gap-4 p-6 overflow-hidden">
          {/* Menu Items Section */}
          <div className="flex-1 flex flex-col">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search menu items..."
                className="w-full px-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => addToOrder(item)}
                  className="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition overflow-hidden"
                >
                  <div className="aspect-square bg-gray-200 flex items-center justify-center text-4xl">
                    🍽️
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                    <p className="text-emerald-600 font-bold">₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Order Section */}
          <div className="w-80 bg-white rounded-lg shadow flex flex-col">
            <div className="p-4 border-b bg-emerald-50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-lg">Current Order</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {currentOrder.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No items added</p>
              ) : (
                <div className="space-y-3">
                  {currentOrder.map((item, index) => (
                    <div key={index} className="flex gap-2 p-2 bg-gray-50 rounded border-l-4 border-emerald-600">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="h-7 w-7 p-0"
                        >
                          -
                        </Button>
                        <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="h-7 w-7 p-0"
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromOrder(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t p-4 space-y-3 bg-gray-50">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (5%):</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span className="text-emerald-600">₹{total.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => setCurrentOrder([])}
                  variant="outline"
                  className="w-full"
                >
                  Hold Order
                </Button>
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Checkout →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
