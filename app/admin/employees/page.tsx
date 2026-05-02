'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, Plus, Search } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { employeeApi } from '@/lib/api';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ 
    username: '',
    email: '',
    password: '',
    first_name: '', 
    last_name: '', 
    role: 'cashier', 
    phone: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await employeeApi.getAll();
      setEmployees(data || []);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch employees. Ensure backend server is running on port 3001.';
      setError(errorMsg);
      console.error('[v0] Failed to fetch employees:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim() || !formData.first_name.trim() || !formData.last_name.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const employeeData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        role: formData.role || 'cashier',
        phone: formData.phone?.trim() || null,
        hire_date: new Date().toISOString().split('T')[0], // Set to today's date
      };
      
      await employeeApi.create(employeeData);
      setFormData({ username: '', email: '', password: '', first_name: '', last_name: '', role: 'cashier', phone: '' });
      setShowAddModal(false);
      fetchEmployees();
      alert('Employee added successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to add employee';
      alert(`Error: ${errorMsg}`);
      console.error('[v0] Failed to add employee:', errorMsg);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      await employeeApi.delete(id);
      fetchEmployees();
      alert('Employee deleted successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete employee';
      alert(`Error: ${errorMsg}`);
      console.error('[v0] Failed to delete employee:', errorMsg);
    }
  };

  const filteredEmployees = employees.filter((e: any) =>
    `${e.first_name} ${e.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Employees</h1>
          <p className="text-sm md:text-base text-gray-500">Manage your staff members</p>
        </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded w-full md:w-auto">
          <p className="font-semibold text-sm">Error</p>
          <p className="text-xs">{error}</p>
        </div>
      )}
        <Button onClick={() => setShowAddModal(true)} className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Search Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or role..."
              className="pl-10 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Employee List</CardTitle>
          <CardDescription className="text-sm">{filteredEmployees.length} employees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Employee</th>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Role</th>
                  <th className="hidden md:table-cell text-left py-3 px-2 md:px-4 font-semibold">Phone</th>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">No employees found</td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee: any) => (
                    <tr key={employee.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 md:px-4 font-medium">{employee.first_name} {employee.last_name}</td>
                      <td className="py-3 px-2 md:px-4 text-gray-600">{employee.role}</td>
                      <td className="hidden md:table-cell py-3 px-2 md:px-4">{employee.phone || '-'}</td>
                      <td className="py-3 px-2 md:px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {employee.status || 'active'}
                        </span>
                      </td>
                      <td className="py-3 px-2 md:px-4 flex gap-1 md:gap-2">
                        <Button variant="outline" size="sm">
                          <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeleteEmployee(employee.id)}>
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

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Employee">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <Input
              placeholder="Enter username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <Input
                placeholder="First name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <Input
                placeholder="Last name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              className="w-full px-3 py-2 border rounded-lg text-sm"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="cashier">Cashier</option>
              <option value="kitchen">Kitchen Staff</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <Input
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleAddEmployee} className="flex-1 bg-purple-600 hover:bg-purple-700">
              Add Employee
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
