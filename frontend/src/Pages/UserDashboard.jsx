import React, { useEffect, useState, useCallback } from 'react';
import api from '../utils/apiClient';
import DashboardSidebar from '../Components/DashboardSidebar';

const userLinks = [
    { to: '/dashboard/user', label: 'My Orders', icon: <span className="text-xl">📦</span> },
    { to: '/profile', label: 'Profile', icon: <span className="text-xl">👤</span> },
];

const UserDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await api.get(`/orders?page=${page}&limit=${limit}`);
            setOrders(res.data.orders || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (e) { setError(e?.response?.data?.message || 'Failed to load orders'); }
        finally { setLoading(false); }
    }, [page, limit]);

    useEffect(()=>{ load(); }, [load]);

    return (
        <div className="flex min-h-screen bg-blue-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <DashboardSidebar links={userLinks} color="blue" />
            <main className="flex-1 p-6">
                <h2 className="text-2xl font-bold mb-4">My Orders</h2>
                {error && <div className="mb-4 text-red-600">{error}</div>}

                <div className="overflow-x-auto bg-white dark:bg-gray-900 p-4 rounded shadow">
                    {loading ? <div>Loading...</div> : (
                        <table className="min-w-full border border-gray-200 dark:border-gray-700">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-800">
                                    <th className="p-2 border text-left">Order</th>
                                    <th className="p-2 border text-left">Status</th>
                                    <th className="p-2 border text-left">Total</th>
                                    <th className="p-2 border text-left">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                            <tr key={o._id} className="odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:gray-800">
                                                <td className="p-2 border text-sm">
                                                    <div className="space-y-2">
                                                        {o.items.map(it => (
                                                            <div key={it._id} className="flex items-center gap-3">
                                                                <img src={it.productImage ? `http://localhost:4000/${it.productImage}` : '/hero-ecommerce.svg'} alt={it.productName} className="w-12 h-12 object-cover rounded" />
                                                                <div className="text-sm">
                                                                    <div className="font-medium">{it.productName}</div>
                                                                    <div className="text-xs text-gray-500">qty: {it.qty} • {'BDT '}{Number(it.price || 0).toFixed(2)}</div>
                                                                </div>
                                                                {o.status === 'delivered' && !it.hasReview && (
                                                                    <div className="ml-auto">
                                                                        <a className="text-sm text-blue-600 hover:underline" href={`/products/${it.product}`}>Write review</a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-2 border font-medium">{o.status}</td>
                                                <td className="p-2 border">{'BDT '}{Number(o.total || 0).toFixed(2)}</td>
                                                <td className="p-2 border text-xs text-gray-600 dark:text-gray-400">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</td>
                                            </tr>
                                        ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                    <div>
                        <label className="text-sm mr-2">Per page:</label>
                        <select value={limit} onChange={(e)=>setLimit(Number(e.target.value))} className="border p-1 text-sm">
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
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
};

export default UserDashboard;
