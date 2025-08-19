import React, { useEffect, useMemo, useState } from 'react';
import api from '../utils/apiClient';
import DashboardSidebar from '../Components/DashboardSidebar';
import RichText from '../Components/RichText';
import Modal from '../Components/Modal';

const adminLinks = [
  { to: '/admin/categories', label: 'Manage Categories', icon: <span className="text-xl">📦</span> },
  { to: '/admin/brands', label: 'Manage Brands', icon: <span className="text-xl">🏷️</span> },
  { to: '/admin/products', label: 'Manage Products', icon: <span className="text-xl">🛒</span> },
  { to: '/admin/users', label: 'Manage Users', icon: <span className="text-xl">👥</span> },
  { to: '/admin/stats', label: 'System Stats', icon: <span className="text-xl">📊</span> },
];

export default function AdminBrands() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const [openAdd, setOpenAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/brand');
      setItems(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i => (i.name||'').toLowerCase().includes(q) || (i.description||'').toLowerCase().includes(q));
  }, [items, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortKey === 'name') {
      arr.sort((a,b) => {
        const va = (a.name||'').toLowerCase();
        const vb = (b.name||'').toLowerCase();
        if (va<vb) return sortDir==='asc'? -1:1;
        if (va>vb) return sortDir==='asc'? 1:-1;
        return 0;
      });
    } else {
      arr.sort((a,b) => {
        const va = a.createdAt? new Date(a.createdAt).getTime():0;
        const vb = b.createdAt? new Date(b.createdAt).getTime():0;
        return sortDir==='asc'? va-vb: vb-va;
      });
    }
    return arr;
  }, [filtered, sortKey, sortDir]);

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total/pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = sorted.slice((currentPage-1)*pageSize, (currentPage-1)*pageSize+pageSize);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d==='asc'?'desc':'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.post('/brand', form);
      setSuccess('Brand created');
      setForm({ name:'', description:'' });
      setOpenAdd(false);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create brand');
    } finally { setSaving(false); }
  };

  const openEdit = (item) => { setEditItem(item); setEditForm({ name: item.name||'', description: item.description||'' }); };
  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editItem?._id) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.put(`/brand/${editItem._id}`, editForm);
      setSuccess('Brand updated');
      setEditItem(null);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update brand');
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    try {
      await api.delete(`/brand/${deleteTarget._id}`);
      setSuccess('Brand deleted');
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to delete brand');
    }
  };

  return (
    <div className="flex min-h-screen bg-yellow-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <DashboardSidebar links={adminLinks} color="yellow" />
      <main className="flex-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Manage Brands</h2>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded" onClick={() => setOpenAdd(true)}>Add Brand</button>
        </div>

  {error && <div className="mb-4 text-red-600 dark:text-red-400">{error}</div>}
  {success && <div className="mb-4 text-green-600 dark:text-green-400">{success}</div>}

        <div className="mb-3 flex flex-wrap items-center gap-3">
          <input value={search} onChange={(e)=>{setSearch(e.target.value); setPage(1);}} placeholder="Search name or description" className="p-2 border rounded w-64 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500" />
          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm">Rows:</label>
            <select value={pageSize} onChange={(e)=>{setPageSize(Number(e.target.value)); setPage(1);}} className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div>Loading...</div>
          ) : total === 0 ? (
            <div>No brands found.</div>
          ) : (
            <table className="min-w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-2 border border-gray-200 dark:border-gray-700 text-left cursor-pointer" onClick={()=>toggleSort('name')}>Name {sortKey==='name' && (sortDir==='asc'?'▲':'▼')}</th>
                  <th className="p-2 border border-gray-200 dark:border-gray-700 text-left">Description</th>
                  <th className="p-2 border border-gray-200 dark:border-gray-700 text-left cursor-pointer" onClick={()=>toggleSort('createdAt')}>Created {sortKey==='createdAt' && (sortDir==='asc'?'▲':'▼')}</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map(b => (
                  <tr key={b._id} className="align-top odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                    <td className="p-2 border border-gray-200 dark:border-gray-700">{b.name}</td>
                    <td className="p-2 border border-gray-200 dark:border-gray-700">{b.description ? <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{__html: b.description}} /> : '-'}</td>
                    <td className="p-2 border border-gray-200 dark:border-gray-700">
                      <div className="text-sm mb-2">{b.createdAt ? new Date(b.createdAt).toLocaleString() : '-'}</div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 border rounded border-gray-300 dark:border-gray-700" onClick={()=>openEdit(b)}>Edit</button>
                        <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" onClick={()=>setDeleteTarget(b)}>Delete</button>
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
            <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={currentPage===1}>Prev</button>
            <span className="text-sm">Page {currentPage} of {pageCount}</span>
            <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={()=>setPage(p=>Math.min(pageCount,p+1))} disabled={currentPage===pageCount}>Next</button>
          </div>
        )}
      </main>

      {/* Add Brand Modal */}
      <Modal open={openAdd} onClose={()=>setOpenAdd(false)} title="Add Brand" footer={null}>
        <form onSubmit={submitAdd} className="grid grid-cols-1 gap-3">
          <input value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" placeholder="Brand name" required />
          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <RichText value={form.description} onChange={val=>setForm(f=>({...f, description: val}))} />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" className="px-4 py-2 border rounded border-gray-300 dark:border-gray-700" onClick={()=>setOpenAdd(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-yellow-600 text-white rounded disabled:opacity-60">{saving? 'Saving...':'Save'}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Brand Modal */}
  <Modal open={!!editItem} onClose={()=>setEditItem(null)} title="Edit Brand" footer={null}>
        {editItem && (
          <form onSubmit={submitEdit} className="grid grid-cols-1 gap-3">
    <input value={editForm.name} onChange={(e)=>setEditForm(f=>({...f,name:e.target.value}))} className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" placeholder="Brand name" required />
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <RichText value={editForm.description} onChange={val=>setEditForm(f=>({...f, description: val}))} />
            </div>
            <div className="flex justify-end gap-2 mt-2">
      <button type="button" className="px-4 py-2 border rounded border-gray-300 dark:border-gray-700" onClick={()=>setEditItem(null)}>Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">{saving? 'Saving...':'Save'}</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirm */}
  <Modal open={!!deleteTarget} onClose={()=>setDeleteTarget(null)} title="Delete Brand" footer={null}>
        {deleteTarget && (
          <div>
            <p className="mb-4">Are you sure you want to delete brand "{deleteTarget.name}"?</p>
            <div className="flex justify-end gap-2">
      <button className="px-4 py-2 border rounded border-gray-300 dark:border-gray-700" onClick={()=>setDeleteTarget(null)}>Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
