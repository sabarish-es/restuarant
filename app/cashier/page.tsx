'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, Clock, LogOut, Trash2, ShoppingCart, Printer, Save, X } from 'lucide-react';

export default function CashierPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentOrder, setCurrentOrder] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [heldOrders, setHeldOrders] = useState<any[]>([]);
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [showTableModal, setShowTableModal] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check auth first
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      console.log('[v0] No auth token found, redirecting to login');
      router.push('/');
      return;
    }

    setIsAuthorized(true);
    setMounted(true);

    // Then load data
    fetchCategories();
    fetchTables();
    
    // Update time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [router]);

  const fetchTables = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setTables(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch tables', error);
    }
  };

  useEffect(() => {
    if (selectedCategory === null) {
      // Fetch all items when "All" is selected
      fetchAllItems();
    } else if (selectedCategory) {
      fetchItems(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchAllItems = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/menu-items`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        console.log('[v0] Fetched menu items:', data);
        setItems(data);
      }
    } catch (error) {
      console.error('[v0] Failed to fetch all items', error);
    }
  };

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
        const data = await response.json();
        console.log('[v0] Fetched items for category', categoryId, ':', data);
        setItems(data);
      } else {
        console.error('[v0] Failed to fetch items, status:', response.status);
      }
    } catch (error) {
      console.error('[v0] Failed to fetch items', error);
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
    console.log('[v0] Checkout started', { currentOrder, selectedTable, paymentMethod });
    
    if (currentOrder.length === 0) {
      alert('Please add items to the order');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication required. Please login again.');
      return;
    }

    try {
      const orderPayload = {
        items: currentOrder.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price
        })),
        tableId: selectedTable?.id || null,
        orderType: selectedTable ? 'dine-in' : 'takeaway',
      };

      console.log('[v0] Sending order payload:', orderPayload);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      console.log('[v0] Response status:', response.status);
      console.log('[v0] Response content-type:', response.headers.get('content-type'));
      
      let responseData = {};
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          const text = await response.text();
          console.error('[v0] Non-JSON response:', text);
          responseData = { message: 'Invalid response format from server' };
        }
      } catch (parseError) {
        console.error('[v0] Failed to parse response:', parseError);
        responseData = { message: 'Failed to parse server response' };
      }
      
      console.log('[v0] Response data:', JSON.stringify(responseData));

      if (response.ok) {
        const orderId = responseData.order?.id;
        const orderNumber = responseData.order?.orderNumber || 'N/A';
        
        console.log('[v0] Order created successfully:', { orderId, orderNumber });
        alert(`Order #${orderNumber} created successfully!`);
        
        // Print the bill after successful order creation
        if (orderId) {
          await handlePrintBill(orderId, orderNumber);
        }
        
        setCurrentOrder([]);
        setSelectedTable(null);
        setShowTableModal(true);
        setCheckoutMode(false);
        setPaymentMethod('cash');
      } else {
        const errorMsg = responseData?.message || responseData?.error || `Server error (${response.status})`;
        console.error('[v0] Order creation failed:', { 
          status: response.status, 
          message: errorMsg, 
          data: responseData 
        });
        alert(`Failed to create order: ${errorMsg}`);
      }
    } catch (error) {
      console.error('[v0] Failed to create order:', error);
      alert(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePrintBill = async (orderId: number, orderNumber: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication required. Please login again.');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/print`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const billHTML = data.billHTML;

        // Open print window
        const printWindow = window.open('', 'PRINT', 'height=600,width=400');
        if (printWindow) {
          printWindow.document.write(billHTML);
          printWindow.document.close();
          printWindow.focus();
          
          // Trigger print dialog after content loads
          setTimeout(() => {
            printWindow.print();
          }, 250);
        }
        
        alert(`Order #${orderNumber} created successfully!`);
      } else {
        console.error('[v0] Failed to fetch bill:', response.status);
        alert(`Order #${orderNumber} created, but bill print failed. Please retry from admin panel.`);
      }
    } catch (error) {
      console.error('[v0] Failed to print bill:', error);
      alert(`Order created but print failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  // Check if not authorized or not mounted
  if (!mounted || !isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Table Selection Modal
  if (showTableModal && !selectedTable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Select Table or Order Type</h2>
          <p className="text-gray-600 mb-8">Choose a table for dine-in or proceed with takeaway</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => {
                  setSelectedTable(table);
                  setShowTableModal(false);
                }}
                className={`p-6 rounded-lg border-2 transition font-semibold ${
                  table.status === 'available'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 cursor-pointer'
                    : 'border-red-600 bg-red-50 text-red-900 cursor-not-allowed opacity-50'
                }`}
                disabled={table.status !== 'available'}
              >
                <div className="text-2xl mb-2">🪑</div>
                <div className="text-sm">Table {table.table_number}</div>
                <div className="text-xs text-gray-600 capitalize">{table.status}</div>
              </button>
            ))}
          </div>

          <div className="border-t pt-6">
            <button
              onClick={() => {
                setSelectedTable({ id: null, table_number: 'Takeaway' });
                setShowTableModal(false);
              }}
              className="w-full p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition"
            >
              Takeaway Order
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <span className="text-sm">{currentTime.toLocaleTimeString()}</span>
          </div>
        </header>

        <div className="flex-1 flex gap-4 p-6 overflow-hidden">
          {/* Menu Items Section */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search menu items..."
                className="w-full px-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto pb-4 auto-rows-max">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => addToOrder(item)}
                  className="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition overflow-hidden w-full h-40"
                >
                  <div className="w-full h-24 bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center text-4xl overflow-hidden">
                    {item.image_url ? (
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_URL}${item.image_url}`} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          console.log('[v0] Image load error for:', item.image_url);
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.parentElement) {
                            const span = document.createElement('span');
                            span.textContent = '🍽️';
                            e.currentTarget.parentElement.style.display = 'flex';
                          }
                        }}
                      />
                    ) : (
                      <span>🍽️</span>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="font-semibold text-xs truncate">{item.name}</h3>
                    <p className="text-emerald-600 font-bold text-sm">₹{item.price}</p>
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
              {selectedTable && (
                <div className="mt-3 p-2 bg-white rounded border border-emerald-200">
                  <p className="text-xs text-gray-600">Table</p>
                  <p className="font-semibold text-emerald-700">{selectedTable.table_number}</p>
                  <button
                    onClick={() => {
                      setSelectedTable(null);
                      setCurrentOrder([]);
                      setShowTableModal(true);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-2 underline"
                  >
                    Change Table
                  </button>
                </div>
              )}
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

              {checkoutMode ? (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                    <p className="text-xs font-semibold text-blue-900">Ready to Checkout?</p>
                    <p className="text-xs text-blue-800 mt-1">Total: ₹{total.toFixed(2)}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-2 block">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['cash', 'card', 'upi'].map((method) => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method as any)}
                          className={`p-2 rounded text-xs font-semibold transition ${
                            paymentMethod === method
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          }`}
                        >
                          {method === 'cash' ? '💵 Cash' : method === 'card' ? '💳 Card' : '📱 UPI'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Confirm & Print Bill
                  </Button>
                  <Button
                    onClick={() => setCheckoutMode(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      if (currentOrder.length > 0) {
                        setHeldOrders([...heldOrders, { id: Date.now(), items: currentOrder, total, tax, subtotal }]);
                        setCurrentOrder([]);
                        alert('Order held successfully!');
                      }
                    }}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Hold Order
                  </Button>
                  {heldOrders.length > 0 && (
                    <Button
                      onClick={() => setShowHeldOrders(!showHeldOrders)}
                      variant="outline"
                      className="w-full text-blue-600"
                    >
                      Held Orders ({heldOrders.length})
                    </Button>
                  )}
                  <Button
                    onClick={() => setCheckoutMode(true)}
                    disabled={currentOrder.length === 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </div>

            {showHeldOrders && (
              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm">Held Orders</h3>
                  <Button size="sm" variant="ghost" onClick={() => setShowHeldOrders(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {heldOrders.map((order) => (
                  <div key={order.id} className="bg-gray-100 p-2 rounded border text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="font-semibold">Order #{order.id}</span>
                      <span className="text-emerald-600">₹{order.total.toFixed(2)}</span>
                    </div>
                    <p className="text-gray-600">{order.items.length} items</p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setCurrentOrder(order.items);
                        setHeldOrders(heldOrders.filter((o) => o.id !== order.id));
                        setShowHeldOrders(false);
                      }}
                      className="w-full text-xs bg-blue-600 hover:bg-blue-700"
                    >
                      Resume Order
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
