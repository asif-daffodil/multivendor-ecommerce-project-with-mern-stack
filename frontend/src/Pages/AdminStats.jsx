import React, { useEffect, useState } from 'react';
import api from '../utils/apiClient';
import DashboardSidebar from '../Components/DashboardSidebar';

const adminLinks = [
  { to: '/admin/categories', label: 'Manage Categories', icon: <span className="text-xl">📦</span> },
  { to: '/admin/brands', label: 'Manage Brands', icon: <span className="text-xl">🏷️</span> },
  { to: '/admin/products', label: 'Manage Products', icon: <span className="text-xl">🛒</span> },
  { to: '/admin/users', label: 'Manage Users', icon: <span className="text-xl">👥</span> },
  { to: '/admin/stats', label: 'System Stats', icon: <span className="text-xl">📊</span> },
  { to: '/admin/orders', label: 'Orders', icon: <span className="text-xl">📦</span> },
];

export default function AdminStats(){
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(()=>{
    let mounted = true;
    const load = async ()=>{
      setLoading(true); setError('');
      try{
        const res = await api.get('/admin/stats');
        if(mounted) setStats(res.data);
      }catch(e){ setError(e?.response?.data?.message || 'Failed to load stats'); }
      finally{ setLoading(false); }
    };
    load();
    return ()=>{ mounted = false; };
  }, []);

  if(loading) return (
    <div className="flex min-h-screen bg-yellow-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <DashboardSidebar links={adminLinks} color="yellow" />
      <main className="flex-1 p-6">Loading stats...</main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-yellow-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <DashboardSidebar links={adminLinks} color="yellow" />
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">System Stats</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white dark:bg-gray-900 rounded shadow">
            <div className="text-sm text-gray-500">Users</div>
            <div className="text-2xl font-bold">{stats.counts.users}</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-900 rounded shadow">
            <div className="text-sm text-gray-500">Vendors</div>
            <div className="text-2xl font-bold">{stats.counts.vendors}</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-900 rounded shadow">
            <div className="text-sm text-gray-500">Products</div>
            <div className="text-2xl font-bold">{stats.counts.products}</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-900 rounded shadow">
            <div className="text-sm text-gray-500">Orders</div>
            <div className="text-2xl font-bold">{stats.counts.orders}</div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-white dark:bg-gray-900 rounded shadow">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold">BDT {Number(stats.totalRevenue || 0).toFixed(2)}</div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 rounded shadow">
          <h3 className="font-semibold mb-2">Recent Orders</h3>
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="p-2 border text-left">Order</th>
                <th className="p-2 border text-left">User</th>
                <th className="p-2 border text-left">Total</th>
                <th className="p-2 border text-left">Status</th>
                <th className="p-2 border text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map(o => (
                <tr key={o._id} className="odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                  <td className="p-2 border text-xs">{o._id}</td>
                  <td className="p-2 border text-sm">{o.user?.name || o.user?.email || '-'}</td>
                  <td className="p-2 border">BDT {Number(o.total || 0).toFixed(2)}</td>
                  <td className="p-2 border">{o.status}</td>
                  <td className="p-2 border text-xs">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          <div>Server Uptime: {Math.floor(stats.server.uptime)}s</div>
          <div>Memory (rss): {Math.round((stats.server.memory.rss || 0) / 1024 / 1024)} MB</div>
        </div>
      </main>
    </div>
  );
}
