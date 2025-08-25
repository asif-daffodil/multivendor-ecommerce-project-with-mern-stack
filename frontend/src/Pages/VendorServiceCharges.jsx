import React, { useEffect, useState } from 'react';
import api from '../utils/apiClient';
import DashboardSidebar from '../Components/DashboardSidebar';

const vendorLinks = [
  { to: '/dashboard/vendor/orders', label: 'Orders' },
  { to: '/dashboard/vendor/products', label: 'Products' },
  { to: '/dashboard/vendor/payments', label: 'Payments' },
  { to: '/dashboard/vendor/service-charges', label: 'Service Charges' }
];

export default function VendorServiceCharges() {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: String(pageSize), q: q || '' });
        const res = await api.get(`/category?${params.toString()}`);
        if (!mounted) return;
        setCategories(res.data.results || []);
        setTotalPages(res.data.totalPages || 1);
      } catch {
        // ignore for now
      } finally { if (mounted) setLoading(false); }
    };
    fetch();
    return () => { mounted = false; };
  }, [page, pageSize, q]);

  return (
    <div className="flex min-h-screen bg-green-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <DashboardSidebar links={vendorLinks} color="green" />
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Service Charges (Category-wise)</h2>
        <div className="mb-4 flex items-center justify-between">
          <div className="w-64">
            <input value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }} placeholder="Search categories" className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-sm" />
          </div>
          <div>
            <label className="text-sm mr-2">Per page:</label>
            <select value={pageSize} onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }} className="p-1 border rounded">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        {loading ? <div>Loading...</div> : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 p-4 rounded">
            <table className="min-w-full">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Category</th>
                  <th className="p-2">Service Charge (%)</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat._id} className="border-t">
                    <td className="p-2">{cat.name}</td>
                    <td className="p-2">{cat.serviceCharge}%</td>
                  </tr>
                ))}
                {categories.length === 0 && <tr><td colSpan={2} className="p-4 text-center">No categories found</td></tr>}
              </tbody>
            </table>

            <div className="flex items-center justify-between mt-3">
              <div />
              <div className="flex items-center gap-2">
                <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                <span className="text-sm">Page {page} of {totalPages}</span>
                <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
