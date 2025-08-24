import React, { useEffect, useState, useCallback } from 'react';
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

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get(`/orders/admin?page=${page}&limit=${limit}`);
      setOrders(res.data.orders || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) { setError(e?.response?.data?.message || 'Failed to load orders'); }
    finally { setLoading(false); }
  }, [page, limit]);

  useEffect(()=>{ load(); }, [load]);

  const changeStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      await load();
    } catch (e) { setError(e?.response?.data?.message || 'Failed to update'); }
  };

  const del = async (id) => {
    try {
      await api.delete(`/orders/${id}`);
      await load();
    } catch (e) { setError(e?.response?.data?.message || 'Failed to delete'); }
  };

  return (
    <div className="flex min-h-screen bg-yellow-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <DashboardSidebar links={adminLinks} color="yellow" />
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">All Orders</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="overflow-x-auto">
          {loading ? <div>Loading...</div> : (
            <table className="min-w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Buyer</th>
                  <th className="p-2 border">Vendor(s)</th>
                  <th className="p-2 border">Delivery Address</th>
                  <th className="p-2 border">Items</th>
                  <th className="p-2 border">Total</th>
                  <th className="p-2 border">Payment</th>
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
                    <td className="p-2 border">
                      {(() => {
                        const vendors = Array.from(new Set((o.items || []).map(i => (i.vendor && (i.vendor.name || i.vendor.email)) || 'Company')));
                        return vendors.join(', ');
                      })()}
                    </td>
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
                    <td className="p-2 border">{o.items?.map(i => `${i.name || ''} x${i.qty || 1}`).join(', ')}</td>
                    <td className="p-2 border">{'BDT '}{Number(o.total || 0).toFixed(2)}</td>
                    <td className="p-2 border text-sm">
                      {o.payment ? (
                        <div>
                          <div><strong>{o.payment.method || o.payment.provider}</strong></div>
                          <div className="text-xs">Gateway ID: {o.payment.gatewayTransactionId || '-'}</div>
                          <div className="text-xs">Merchant ID: {o.payment.merchantTranId || '-'}</div>
                          <div className="text-xs">Session: {o.payment.sessionKey || '-'}</div>
                          <div className="text-xs">{o.payment.status || ''} {o.payment.amount ? `· BDT ${Number(o.payment.amount).toFixed(2)}` : ''}</div>
                          <button onClick={() => setExpanded(prev => ({ ...prev, [o._id]: !prev[o._id] }))} className="mt-1 text-xs text-blue-600">
                            {expanded[o._id] ? 'Hide raw' : 'View raw'}
                          </button>
                          {expanded[o._id] && <pre className="mt-2 p-2 bg-gray-100 text-xs rounded max-h-64 overflow-auto">{JSON.stringify(o.payment.raw || o.payment, null, 2)}</pre>}
                        </div>
                      ) : (<div>Method: {o.paymentMethod || 'cod'}</div>)}
                    </td>
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
                        <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={()=>del(o._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination controls */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <label className="text-sm mr-2">Per page:</label>
            <select value={limit} onChange={(e)=>setLimit(Number(e.target.value))} className="border p-1 text-sm">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
            {Array.from({length: totalPages}).slice(0, 10).map((_, idx) => {
              const p = idx + 1;
              return (
                <button key={p} onClick={()=>setPage(p)} className={`px-2 py-1 border rounded ${p===page ? 'bg-gray-200' : ''}`}>{p}</button>
              );
            })}
            <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </main>
    </div>
  );
}
