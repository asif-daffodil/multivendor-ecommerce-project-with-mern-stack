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

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/user/all');
      setUsers(res.data.users || []);
    } catch (e) { setError(e?.response?.data?.message || 'Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  const ban = async (id) => {
    const reason = prompt('Optional: enter a reason for banning this account');
    try {
      await api.patch(`/user/ban/${id}`, { reason });
      await load();
    } catch (e) { setError(e?.response?.data?.message || 'Failed to ban'); }
  };

  const unban = async (id) => {
    try {
      await api.patch(`/user/unban/${id}`);
      await load();
    } catch (e) { setError(e?.response?.data?.message || 'Failed to unban'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this user? This is irreversible.')) return;
    try {
      await api.delete(`/user/delete/${id}`);
      await load();
    } catch (e) { setError(e?.response?.data?.message || 'Failed to delete'); }
  };

  return (
    <div className="flex min-h-screen bg-yellow-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <DashboardSidebar links={adminLinks} color="yellow" />
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Manage Users & Vendors</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="overflow-x-auto">
          {loading ? <div>Loading...</div> : (
            <table className="min-w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Role</th>
                  <th className="p-2 border">Banned</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                    <td className="p-2 border">{u._id}</td>
                    <td className="p-2 border">{u.name}</td>
                    <td className="p-2 border">{u.email}</td>
                    <td className="p-2 border">{u.role}</td>
                    <td className="p-2 border">{u.banned ? 'Yes' : 'No'}</td>
                    <td className="p-2 border">
                      <div className="flex gap-2">
                        {u.banned ? (
                          <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={()=>unban(u._id)}>Unban</button>
                        ) : (
                          <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={()=>ban(u._id)}>Ban</button>
                        )}
                        <button className="px-2 py-1 bg-red-700 text-white rounded" onClick={()=>del(u._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
