'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    setError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tables`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tables: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[v0] Fetched tables:', data);
      setTables(Array.isArray(data) ? data : []);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch tables. Ensure backend server is running on port 3001.';
      setError(errorMsg);
      console.error('[v0] Failed to fetch tables:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateTableStatus = async (tableId: number, status: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tables/${tableId}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update table status: ${response.statusText}`);
      }

      console.log('[v0] Table status updated successfully');
      fetchTables();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update table status';
      setError(errorMsg);
      console.error('[v0] Failed to update table status:', errorMsg);
    }
  };

  const stats = {
    available: tables.filter((t: any) => t.status === 'available').length,
    occupied: tables.filter((t: any) => t.status === 'occupied').length,
    reserved: tables.filter((t: any) => t.status === 'reserved').length,
    outOfOrder: tables.filter((t: any) => t.status === 'out_of_order').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tables</h1>
        <p className="text-gray-500">Manage restaurant tables</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">Make sure the backend server is running: <code className="bg-red-100 px-1 py-0.5 rounded">npm run dev</code></p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Available', value: stats.available, color: 'bg-green-100' },
          { label: 'Occupied', value: stats.occupied, color: 'bg-red-100' },
          { label: 'Reserved', value: stats.reserved, color: 'bg-yellow-100' },
          { label: 'Out of Order', value: stats.outOfOrder, color: 'bg-gray-100' },
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
          <CardTitle>Restaurant Tables</CardTitle>
          <CardDescription>Total: {tables.length} tables</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-center text-gray-500">Loading tables...</p>}
          {!loading && tables.length === 0 && (
            <p className="text-center text-gray-500">No tables found. Please check the database.</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((table: any) => {
              const statusColors = {
                available: 'bg-green-100 border-green-300',
                occupied: 'bg-red-100 border-red-300',
                reserved: 'bg-yellow-100 border-yellow-300',
                out_of_order: 'bg-gray-100 border-gray-300',
              };

              return (
                <div
                  key={table.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer ${statusColors[table.status as keyof typeof statusColors]}`}
                  onClick={() => {
                    const statuses = ['available', 'occupied', 'reserved', 'out_of_order'];
                    const currentIndex = statuses.indexOf(table.status);
                    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                    updateTableStatus(table.id, nextStatus);
                  }}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">Table {table.table_number}</div>
                    <div className="text-xs text-gray-600 mb-2">{table.seats} Seats</div>
                    <div className="text-xs font-semibold capitalize">{table.status.replace('_', ' ')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
