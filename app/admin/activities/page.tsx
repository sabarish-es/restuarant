'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Eye, Search, TrendingUp, AlertCircle } from 'lucide-react';
import { employeeApi } from '@/lib/api';
import { Modal } from '@/components/Modal';

interface Employee {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  hire_date: string;
  total_orders: number;
  total_sales: number;
  today_orders: number;
  today_sales: number;
  last_order_at: string;
}

interface Order {
  id: number;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  completed_at: string;
  customer_name: string;
}

interface EmployeeDetails {
  employee: {
    id: number;
    username: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    phone: string;
    hire_date: string;
  };
  orders: Order[];
}

export default function EmployeeActivitiesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchEmployeeActivities();
  }, []);

  const fetchEmployeeActivities = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('[v0] Fetching employee activities...');
      const data = await employeeApi.getActivities();
      console.log('[v0] Employee activities fetched:', data);
      setEmployees(data || []);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch employee activities';
      setError(errorMsg);
      console.error('[v0] Failed to fetch activities:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (employeeId: number) => {
    setDetailsLoading(true);
    try {
      const data = await employeeApi.getDetails(employeeId);
      setSelectedEmployee(data);
      setShowDetailsModal(true);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch employee details';
      alert(`Error: ${errorMsg}`);
      console.error('[v0] Failed to fetch details:', errorMsg);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredEmployees = employees.filter((e) =>
    `${e.first_name} ${e.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEmployees = employees.length;
  const totalOrders = employees.reduce((sum, e) => sum + e.total_orders, 0);
  const totalSales = employees.reduce((sum, e) => sum + (e.total_sales || 0), 0);
  const todayOrders = employees.reduce((sum, e) => sum + e.today_orders, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Employee Activities</h1>
          <p className="text-sm md:text-base text-gray-500">Monitor employee performance and order history</p>
        </div>
        <Button onClick={fetchEmployeeActivities} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
          Refresh Data
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Error</p>
            <p className="text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">{totalEmployees}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">{totalOrders}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Today&apos;s Orders</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-600">{todayOrders}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600">₹{totalSales.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Search Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, username, or email..."
              className="pl-10 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Employee Performance</CardTitle>
          <CardDescription className="text-sm">{filteredEmployees.length} employees found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Employee</th>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Role</th>
                  <th className="text-center py-3 px-2 md:px-4 font-semibold">Total Orders</th>
                  <th className="hidden md:table-cell text-center py-3 px-2 md:px-4 font-semibold">Today Orders</th>
                  <th className="hidden md:table-cell text-right py-3 px-2 md:px-4 font-semibold">Total Sales</th>
                  <th className="hidden md:table-cell text-left py-3 px-2 md:px-4 font-semibold">Last Order</th>
                  <th className="text-center py-3 px-2 md:px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">No employees found</td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 md:px-4">
                        <div>
                          <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                          <p className="text-xs text-gray-500">{employee.username}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 md:px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          {employee.role}
                        </span>
                      </td>
                      <td className="py-3 px-2 md:px-4 text-center font-bold">{employee.total_orders}</td>
                      <td className="hidden md:table-cell py-3 px-2 md:px-4 text-center">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-semibold">
                          {employee.today_orders}
                        </span>
                      </td>
                      <td className="hidden md:table-cell py-3 px-2 md:px-4 text-right font-semibold text-emerald-600">
                        ₹{(employee.total_sales || 0).toFixed(2)}
                      </td>
                      <td className="hidden md:table-cell py-3 px-2 md:px-4 text-xs text-gray-600">
                        {employee.last_order_at 
                          ? new Date(employee.last_order_at).toLocaleString() 
                          : 'No orders'}
                      </td>
                      <td className="py-3 px-2 md:px-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(employee.id)}
                          className="text-blue-600"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Employee Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={selectedEmployee ? `${selectedEmployee.employee.first_name} ${selectedEmployee.employee.last_name} - Order History` : 'Employee Details'}
      >
        {detailsLoading ? (
          <div className="py-8 text-center text-gray-500">Loading employee details...</div>
        ) : selectedEmployee ? (
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {/* Employee Info */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Username</p>
                  <p className="font-semibold text-sm">{selectedEmployee.employee.username}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="font-semibold text-sm">{selectedEmployee.employee.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Role</p>
                  <p className="font-semibold text-sm">{selectedEmployee.employee.role}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Phone</p>
                  <p className="font-semibold text-sm">{selectedEmployee.employee.phone || '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600">Hire Date</p>
                <p className="font-semibold text-sm">{new Date(selectedEmployee.employee.hire_date).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Orders */}
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Recent Orders ({selectedEmployee.orders.length})
              </h3>
              <div className="space-y-2">
                {selectedEmployee.orders.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4">No orders yet</p>
                ) : (
                  selectedEmployee.orders.map((order) => (
                    <div key={order.id} className="border rounded p-3 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-xs">{order.order_number}</p>
                          <p className="text-xs text-gray-600">{order.customer_name || 'Walk-in Customer'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-600">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                        <p className="font-semibold text-emerald-600">₹{order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
