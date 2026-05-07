'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
  X,
  Briefcase,
  Table2,
  BarChart3,
  Settings,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/menu', icon: UtensilsCrossed, label: 'Menu Management' },
  { href: '/admin/categories', icon: Tags, label: 'Categories' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/customers', icon: Users, label: 'Customers' },
  { href: '/admin/employees', icon: Briefcase, label: 'Employees' },
  { href: '/admin/activities', icon: Activity, label: 'Employee Activities' },
  { href: '/admin/tables', icon: Table2, label: 'Tables' },
  { href: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check auth only once on initial mount
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      router.push('/');
    } else {
      setIsAuthorized(true);
    }
    
    setMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!mounted || !isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0 md:w-64'
        } fixed md:static bg-slate-900 text-white transition-all duration-300 overflow-hidden flex flex-col h-screen z-40`}
      >
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🍽️</div>
            <div>
              <h1 className="font-bold text-lg">FoodieHub</h1>
              <p className="text-xs text-gray-400">Restaurant Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start mb-2 ${
                    isActive ? 'bg-purple-600 hover:bg-purple-700' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="hidden md:block flex-1" />
            <div className="flex items-center gap-2 md:gap-4">
              <span className="hidden sm:inline text-xs md:text-sm font-medium text-gray-700">Admin</span>
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                👤
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
