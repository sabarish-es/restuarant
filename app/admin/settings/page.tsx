'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    restaurant_name: 'FoodieHub Restaurant',
    email: 'admin@foodiehub.com',
    phone: '+91-98765-43210',
    address: '123, Food Street',
    city: 'Delhi',
    state: 'Delhi',
    zip_code: '110001',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    tax_percentage: 5,
  });

  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...settings, ...data });
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-gray-500">Manage restaurant settings and preferences</p>
      </div>

      {saved && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Settings saved successfully!
        </div>
      )}

      <div className="flex gap-4 border-b">
        {['general', 'payment', 'notification'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Restaurant information and configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Restaurant Name</label>
                <Input
                  name="restaurant_name"
                  value={settings.restaurant_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={settings.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input
                  name="phone"
                  value={settings.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <Input
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <Input
                  name="city"
                  value={settings.city}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <Input
                  name="state"
                  value={settings.state}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Zip Code</label>
                <Input
                  name="zip_code"
                  value={settings.zip_code}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <Input
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <Input
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tax Percentage (%)</label>
                <Input
                  name="tax_percentage"
                  type="number"
                  value={settings.tax_percentage}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'payment' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>Payment methods and configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Coming soon...</p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'notification' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Email and SMS notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Coming soon...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
