import React, { useEffect, useState } from 'react';
import api from '../utils/apiClient';
import DashboardSidebar from '../Components/DashboardSidebar';
import adminLinks from './adminLinks.jsx';

export default function AdminPayments(){
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState('grossSales');
  const [sortDir, setSortDir] = useState('desc');
  const [form, setForm] = useState({ vendorId: '', netPayable: '', amountPaid: '', paid: false });

  useEffect(() => {
    let mounted = true;
    const fetchPage = async () => {
      setLoading(true); setError('');
      try {
        const params = new URLSearchParams({ page: String(page), limit: String(pageSize), q: q || '', sortKey, sortDir });
        const res = await api.get(`/payments/admin/vendors?${params.toString()}`);
        if (mounted) {
          setResults(res.data.results || []);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || 'Failed to load report');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPage();
    return () => { mounted = false; };
  }, [page, pageSize, q, sortKey, sortDir]);

  const submitPayout = async (e) => {
    e.preventDefault();
    try {
      const payload = { vendorId: form.vendorId, netPayable: Number(form.netPayable) };
      if (form.amountPaid !== '') payload.amountPaid = Number(form.amountPaid);
      if (form.paid) payload.paid = true;
      await api.post('/payments/admin/payouts', payload);
      // reset all form fields including amountPaid and paid checkbox
      setForm({ vendorId: '', netPayable: '', amountPaid: '', paid: false });
  // refresh current page
  const params = new URLSearchParams({ page: String(page), limit: String(pageSize), q: q || '', sortKey, sortDir });
  const res = await api.get(`/payments/admin/vendors?${params.toString()}`);
  setResults(res.data.results || []);
  setTotalPages(res.data.totalPages || 1);
    } catch (e) { setError(e?.response?.data?.message || 'Failed to create payout'); }
  };

  const toggleSort = (key) => {
    if (key === sortKey) {
      setSortDir(s => s === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      // default directions: vendor -> asc, grossSales -> desc
      setSortDir(key === 'vendor' ? 'asc' : 'desc');
    }
  };

  return (
    <div className="flex min-h-screen bg-yellow-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <DashboardSidebar links={adminLinks} color="yellow" />
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Admin Payments / Vendor Report</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {loading ? <div>Loading...</div> : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="w-64">
                <input value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }} placeholder="Search vendor name or email" className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-sm" />
              </div>
              <div className="text-sm text-gray-600">Sort: <strong>{sortKey} {sortDir}</strong></div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border bg-white dark:bg-gray-800">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900">
                    <th className="p-2 cursor-pointer" onClick={() => toggleSort('vendor')}>Vendor {sortKey === 'vendor' ? (sortDir === 'asc' ? '▲' : '▼') : null}</th>
                    <th className="p-2 cursor-pointer" onClick={() => toggleSort('grossSales')}>Gross {sortKey === 'grossSales' ? (sortDir === 'asc' ? '▲' : '▼') : null}</th>
                    <th className="p-2">Charges</th>
                    <th className="p-2">Net</th>
                    <th className="p-2">Paid</th>
                    <th className="p-2 cursor-pointer" onClick={() => toggleSort('due')}>Due {sortKey === 'due' ? (sortDir === 'asc' ? '▲' : '▼') : null}</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.vendor._id} className="odd:bg-white even:bg-gray-50 odd:dark:bg-gray-800 even:dark:bg-gray-700">
                      <td className="p-2">{r.vendor.name || r.vendor.email || r.vendor._id}</td>
                      <td className="p-2">BDT {Number(r.grossSales||0).toFixed(2)}</td>
                      <td className="p-2">BDT {Number(r.serviceCharges||0).toFixed(2)}</td>
                      <td className="p-2">BDT {Number(r.netPayable||0).toFixed(2)}</td>
                      <td className="p-2">BDT {Number(r.paidAmount||0).toFixed(2)}</td>
                      <td className="p-2 text-red-600">BDT {Number(r.due||0).toFixed(2)}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          {Number(r.due || 0) > 0 && (
                            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => setForm({ vendorId: r.vendor._id, netPayable: (r.due||0).toFixed(2), amountPaid: '', paid: false })}>Open Payout</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* pagination */}
            <div className="flex items-center justify-between mt-3">
              <div>
                <label className="text-sm mr-2">Per page:</label>
                <select value={pageSize} onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }} className="p-1 border rounded">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                <span className="text-sm">Page {page} of {totalPages}</span>
                <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
              </div>
            </div>

            <div className="max-w-md bg-white dark:bg-gray-800 p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Create Payout</h3>
              <form onSubmit={submitPayout} className="space-y-2">
                <input className="w-full p-2 border rounded" placeholder="Vendor ID" value={form.vendorId} onChange={(e)=>setForm(f=>({...f,vendorId:e.target.value}))} />
                <input className="w-full p-2 border rounded" placeholder="Net Payable" value={form.netPayable} onChange={(e)=>setForm(f=>({...f,netPayable:e.target.value}))} />
                <input className="w-full p-2 border rounded" placeholder="Amount Paid (partial)" value={form.amountPaid} onChange={(e)=>setForm(f=>({...f,amountPaid:e.target.value}))} />
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.paid} onChange={(e)=>setForm(f=>({...f,paid:e.target.checked}))} /> Mark as paid</label>
                <div className="flex justify-end"><button className="px-4 py-2 bg-yellow-600 text-white rounded">Pay</button></div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
