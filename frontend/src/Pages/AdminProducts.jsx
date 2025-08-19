import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import Swal from 'sweetalert2';
import api from '../utils/apiClient';
import DashboardSidebar from '../Components/DashboardSidebar';

const adminLinks = [
  { to: '/admin/categories', label: 'Manage Categories', icon: <span className="text-xl">📦</span> },
  { to: '/admin/brands', label: 'Manage Brands', icon: <span className="text-xl">🏷️</span> },
  { to: '/admin/products', label: 'Manage Products', icon: <span className="text-xl">🛒</span> },
  { to: '/admin/users', label: 'Manage Users', icon: <span className="text-xl">👥</span> },
  { to: '/admin/stats', label: 'System Stats', icon: <span className="text-xl">📊</span> },
];

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('createdAt'); // 'name' | 'price' | 'createdAt'
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/products');
      setItems(res.data || []);
    } catch (e) { setError(e?.response?.data?.message || 'Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.brand?.name || '').toLowerCase().includes(q) ||
      (p.owner?.name || '').toLowerCase().includes(q)
    );
  }, [items, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortKey === 'name') {
      arr.sort((a,b) => {
        const va = (a.name||'').toLowerCase();
        const vb = (b.name||'').toLowerCase();
        if (va<vb) return sortDir==='asc' ? -1 : 1;
        if (va>vb) return sortDir==='asc' ? 1 : -1;
        return 0;
      });
    } else if (sortKey === 'price') {
      arr.sort((a,b) => {
        const va = Number(a.salePrice ?? a.regularPrice ?? 0);
        const vb = Number(b.salePrice ?? b.regularPrice ?? 0);
        return sortDir==='asc' ? va - vb : vb - va;
      });
    } else {
      // createdAt
      arr.sort((a,b) => {
        const va = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const vb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortDir==='asc' ? va - vb : vb - va;
      });
    }
    return arr;
  }, [filtered, sortKey, sortDir]);

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = sorted.slice((currentPage-1)*pageSize, (currentPage-1)*pageSize + pageSize);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d==='asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const del = async (p) => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const { isConfirmed } = await Swal.fire({
      title: 'Delete product?',
      text: `"${p.name}" will be permanently removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      background: isDark ? '#111827' : '#ffffff',
      color: isDark ? '#F9FAFB' : '#111827',
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/products/${p._id}`);
      setSuccess('Product deleted');
      await Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'The product has been removed.',
        timer: 1400,
        showConfirmButton: false,
        background: isDark ? '#111827' : '#ffffff',
        color: isDark ? '#F9FAFB' : '#111827',
      });
      load();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to delete';
      setError(msg);
      await Swal.fire({
        icon: 'error',
        title: 'Delete failed',
        text: msg,
        background: isDark ? '#111827' : '#ffffff',
        color: isDark ? '#F9FAFB' : '#111827',
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-yellow-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <DashboardSidebar links={adminLinks} color="yellow" />
    <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Manage Products</h2>
          <Link to="/admin/products/add" className="px-4 py-2 bg-yellow-600 text-white rounded">Add Product</Link>
        </div>
  {error && <div className="mb-2 text-red-600 dark:text-red-400">{error}</div>}
  {success && <div className="mb-2 text-green-600 dark:text-green-400">{success}</div>}
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e)=>{ setSearch(e.target.value); setPage(1); }}
            placeholder="Search title, brand or owner"
            className="p-2 border rounded w-72 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm">Rows:</label>
            <select
              value={pageSize}
              onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }}
              className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? <div>Loading...</div> : (
    <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
      <th className="p-2 border border-gray-200 dark:border-gray-700 text-left cursor-pointer select-none" onClick={()=>toggleSort('name')}>
                    Title {sortKey==='name' && (sortDir==='asc' ? '▲' : '▼')}
                  </th>
      <th className="p-2 border border-gray-200 dark:border-gray-700 text-left">Owner</th>
      <th className="p-2 border border-gray-200 dark:border-gray-700 text-left">Brand</th>
      <th className="p-2 border border-gray-200 dark:border-gray-700 text-left cursor-pointer select-none" onClick={()=>toggleSort('price')}>
                    Price {sortKey==='price' && (sortDir==='asc' ? '▲' : '▼')}
                  </th>
      <th className="p-2 border border-gray-200 dark:border-gray-700 text-left">Stock</th>
      <th className="p-2 border border-gray-200 dark:border-gray-700 text-left cursor-pointer select-none" onClick={()=>toggleSort('createdAt')}>
                    Created {sortKey==='createdAt' && (sortDir==='asc' ? '▲' : '▼')}
                  </th>
  <th className="p-2 border border-gray-200 dark:border-gray-700 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map(p => (
                  <tr key={p._id} className="odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                    <td className="p-2 border border-gray-200 dark:border-gray-700">{p.name}</td>
                    <td className="p-2 border border-gray-200 dark:border-gray-700">{p.isCompanyProduct ? 'Company' : (p.owner?.name || '-')}{p.owner?.role ? ` (${p.owner.role})` : ''}</td>
                    <td className="p-2 border border-gray-200 dark:border-gray-700">{p.brand?.name || '-'}</td>
                    <td className="p-2 border border-gray-200 dark:border-gray-700">{p.salePrice ?? p.regularPrice}</td>
                    <td className="p-2 border border-gray-200 dark:border-gray-700">{p.outOfStock ? 'Out of stock' : p.inventoryCount}</td>
                    <td className="p-2 border border-gray-200 dark:border-gray-700">{p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'}</td>
                    <td className="p-2 border border-gray-200 dark:border-gray-700">
                      <div className="flex gap-2">
                        <Link className="px-3 py-1 border rounded border-gray-300 dark:border-gray-700" to={`/admin/products/${p._id}/edit`}>Edit</Link>
                        <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" onClick={()=>del(p)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && total > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50 border-gray-300 dark:border-gray-700"
              onClick={() => setPage(p => Math.max(1, p-1))}
              disabled={currentPage===1}
            >Prev</button>
            <span className="text-sm">Page {currentPage} of {pageCount}</span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50 border-gray-300 dark:border-gray-700"
              onClick={() => setPage(p => Math.min(pageCount, p+1))}
              disabled={currentPage===pageCount}
            >Next</button>
          </div>
        )}
      </main>
    </div>
  );
}
