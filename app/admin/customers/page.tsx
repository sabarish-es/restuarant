'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, Plus, Search } from 'lucide-react';
import { Modal } from '@/components/Modal';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setCustomers(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch customers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!formData.name.trim()) {
      alert('Please fill in customer name');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication required. Please login again.');
      return;
    }

    try {
      console.log('[v0] Adding customer with data:', formData);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log('[v0] Customer creation response status:', response.status);
      const errorData = await response.json();
      console.log('[v0] Customer creation response:', errorData);

      if (response.ok) {
        setFormData({ 
          name: '', 
          email: '', 
          phone: '',
          address: '',
          city: '',
          state: '',
          zip_code: ''
        });
        setShowAddModal(false);
        fetchCustomers();
        alert('Customer added successfully');
      } else {
        alert(`Failed to add customer: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[v0] Failed to add customer:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to add customer'}`);
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchCustomers();
        alert('Customer deleted successfully');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete customer: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete customer', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to delete customer'}`);
    }
  };

  const filteredCustomers = customers.filter((c: any) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm md:text-base text-gray-500">Manage your customers</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Search Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              className="pl-10 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Customer List</CardTitle>
          <CardDescription className="text-sm">{filteredCustomers.length} customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Customer</th>
                  <th className="hidden md:table-cell text-left py-3 px-2 md:px-4 font-semibold">Phone</th>
                  <th className="hidden lg:table-cell text-left py-3 px-2 md:px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Orders</th>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Spent</th>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">No customers found</td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer: any) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 md:px-4 font-medium">{customer.name}</td>
                      <td className="hidden md:table-cell py-3 px-2 md:px-4">{customer.phone || '-'}</td>
                      <td className="hidden lg:table-cell py-3 px-2 md:px-4 truncate">{customer.email || '-'}</td>
                      <td className="py-3 px-2 md:px-4">{customer.total_orders || 0}</td>
                      <td className="py-3 px-2 md:px-4 font-semibold">₹{customer.total_spent || 0}</td>
                      <td className="py-3 px-2 md:px-4 flex gap-1 md:gap-2">
                        <Button variant="outline" size="sm">
                          <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeleteCustomer(customer.id)}>
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Customer">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-2">Customer Name *</label>
            <Input
              placeholder="Enter customer name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <Input
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <Input
              placeholder="Enter address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <Input
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">State</label>
              <Input
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Zip Code</label>
            <Input
              placeholder="Zip code"
              value={formData.zip_code}
              onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleAddCustomer} className="flex-1 bg-purple-600 hover:bg-purple-700">
              Add Customer
            </Button>
            <Button onClick={() => setShowAddModal(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
