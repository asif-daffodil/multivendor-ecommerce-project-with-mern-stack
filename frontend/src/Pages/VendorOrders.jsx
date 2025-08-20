import React, { useEffect, useState } from 'react';
import api from '../utils/apiClient';
import DashboardSidebar from '../Components/DashboardSidebar';

const vendorLinks = [
  { to: '/dashboard/vendor/orders', label: 'Orders', icon: <span className="text-xl">📦</span> },
  { to: '/dashboard/vendor/products', label: 'Products', icon: <span className="text-xl">🛒</span> },
  { to: '/dashboard/vendor/stats', label: 'Stats', icon: <span className="text-xl">📊</span> },
];

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/orders/vendor');
      setOrders(res.data.orders || []);
    } catch (e) { setError(e?.response?.data?.message || 'Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  const changeStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      await load();
    } catch (e) { setError(e?.response?.data?.message || 'Failed to update'); }
  };

  return (
    <div className="flex min-h-screen bg-green-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <DashboardSidebar links={vendorLinks} color="green" />
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Orders for my products</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="overflow-x-auto">
          {loading ? <div>Loading...</div> : (
            <table className="min-w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Buyer</th>
                  <th className="p-2 border">Delivery Address</th>
                  <th className="p-2 border">Items (vendor items only)</th>
                  <th className="p-2 border">Total</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Created</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id} className="odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                    <td className="p-2 border">{o._id}</td>
                    <td className="p-2 border">{o.user?.name || o.user?.email || '-'}</td>
                    <td className="p-2 border align-top">
                      {o.deliveryAddress ? (
                        <div className="text-sm">
                          <div className="font-medium">{o.deliveryAddress.fullName}</div>
                          <div>{o.deliveryAddress.addressLine}</div>
                          <div>{o.deliveryAddress.city} {o.deliveryAddress.postalCode}</div>
                          <div className="text-xs text-gray-600">{o.deliveryAddress.phone}</div>
                        </div>
                      ) : ('-')}
                    </td>
                    <td className="p-2 border">{o.items?.filter(i=>i.vendor).map(i => `${i.name || ''} x${i.qty || 1}`).join(', ')}</td>
                    <td className="p-2 border">{'BDT '}{Number(o.total || 0).toFixed(2)}</td>
                    <td className="p-2 border">{o.status}</td>
                    <td className="p-2 border">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</td>
                    <td className="p-2 border">
                      <div className="flex gap-2">
                        <select onChange={(e)=>changeStatus(o._id, e.target.value)} defaultValue={o.status} className="p-1 border rounded">
                          <option value="pending">pending</option>
                          <option value="accepted">accepted</option>
                          <option value="shipped">shipped</option>
                          <option value="delivered">delivered</option>
                          <option value="cancelled">cancelled</option>
                        </select>
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
