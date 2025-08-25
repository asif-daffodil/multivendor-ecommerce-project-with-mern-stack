import React, { useEffect, useState } from 'react';
import api from '../utils/apiClient';
import DashboardSidebar from '../Components/DashboardSidebar';
import RichText from '../Components/RichText';
import Modal from '../Components/Modal';
import adminLinks from './adminLinks.jsx';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', serviceCharge: 10 });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(null); // category being edited
  const [editForm, setEditForm] = useState({ name: '', description: '', serviceCharge: 10 });
  // subcategories state
  const [subForm, setSubForm] = useState({ name: '', description: '', parent: '' });
  // modal controls
  const [openAddCat, setOpenAddCat] = useState(false);
  const [openEditCat, setOpenEditCat] = useState(false);
  const [openAddSub, setOpenAddSub] = useState(null); // store parent id or null
  const [openEditSub, setOpenEditSub] = useState(null); // store sub id or null
  const [subLoadingId, setSubLoadingId] = useState(null); // track add on a category
  const [subEdit, setSubEdit] = useState({}); // { [subId]: { name, description } }
  // data-table states
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('createdAt'); // 'name' | 'createdAt'
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  // delete confirm targets
  const [deleteCatTarget, setDeleteCatTarget] = useState(null);
  const [deleteSubTarget, setDeleteSubTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/category');
      const cats = res.data || [];
      // fetch subs for all categories in parallel
  const withSubs = await Promise.all(
        cats.map(async (c) => {
          try {
            const sres = await api.get(`/subcategory?parent=${c._id}`);
    return { ...c, subcategories: sres.data || [] };
          } catch {
            return { ...c, subcategories: [] };
          }
        })
      );
      setCategories(withSubs);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/category', form);
      setSuccess('Category created');
  setForm({ name: '', description: '' });
  setOpenAddCat(false);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat) => {
    setEditing(cat);
  setEditForm({ name: cat.name || '', description: cat.description || '', serviceCharge: typeof cat.serviceCharge !== 'undefined' ? cat.serviceCharge : 10 });
  setOpenEditCat(true);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditForm({ name: '', description: '' });
  setOpenEditCat(false);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editing?._id) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put(`/category/${editing._id}`, editForm);
  setSuccess('Category updated');
      cancelEdit();
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (cat) => {
    try {
      await api.delete(`/category/${cat._id}`);
      setSuccess('Category deleted');
      setDeleteCatTarget(null);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete category');
    }
  };

  const addSubCategory = async (parentId) => {
    if (!subForm.name) return;
    setSubLoadingId(parentId);
    setError('');
    setSuccess('');
    try {
      await api.post('/subcategory', { ...subForm, parent: parentId });
      setSuccess('Subcategory created');
  setSubForm({ name: '', description: '', parent: '' });
  setOpenAddSub(null);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create subcategory');
    } finally {
      setSubLoadingId(null);
    }
  };

  const startSubEdit = (sub) => {
    setSubEdit((m) => ({ ...m, [sub._id]: { name: sub.name || '', description: sub.description || '' } }));
    setOpenEditSub(sub._id);
  };

  const cancelSubEdit = (subId) => {
    setSubEdit((m) => {
      const copy = { ...m };
      delete copy[subId];
      return copy;
    });
    setOpenEditSub(null);
  };

  const submitSubEdit = async (sub) => {
    const data = subEdit[sub._id];
    if (!data) return;
    try {
      await api.put(`/subcategory/${sub._id}`, data);
  setSuccess('Subcategory updated');
      cancelSubEdit(sub._id);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update subcategory');
    }
  };

  const deleteSub = async (sub) => {
    try {
      await api.delete(`/subcategory/${sub._id}`);
      setSuccess('Subcategory deleted');
      setDeleteSubTarget(null);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete subcategory');
    }
  };

  // derived table data
  const filtered = categories.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let va = a[sortKey];
    let vb = b[sortKey];
    if (sortKey === 'name') {
      va = (va || '').toString().toLowerCase();
      vb = (vb || '').toString().toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    }
    // createdAt or others treated as date
    const da = va ? new Date(va).getTime() : 0;
    const db = vb ? new Date(vb).getTime() : 0;
    return sortDir === 'asc' ? da - db : db - da;
  });

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIdx = (currentPage - 1) * pageSize;
  const pageItems = sorted.slice(startIdx, startIdx + pageSize);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="flex min-h-screen bg-yellow-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <DashboardSidebar links={adminLinks} color="yellow" />
      <main className="flex-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Manage Categories</h2>
          <button onClick={() => setOpenAddCat(true)} className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Add Category</button>
        </div>

  {error && <div className="mb-4 text-red-600 dark:text-red-400">{error}</div>}
  {success && <div className="mb-4 text-green-600 dark:text-green-400">{success}</div>}

        <div className="mb-3 flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name or description"
            className="p-2 border rounded w-64 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm">Rows:</label>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            >
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
            <div>No categories found.</div>
          ) : (
            <table className="min-w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-2 border border-gray-200 dark:border-gray-700 text-left cursor-pointer select-none" onClick={() => toggleSort('name')}>
                    Name {sortKey === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                            <th className="p-2 border border-gray-200 dark:border-gray-700 text-left">Description</th>
                            <th className="p-2 border border-gray-200 dark:border-gray-700 text-left">Service Charge</th>
                  <th className="p-2 border border-gray-200 dark:border-gray-700 text-left cursor-pointer select-none" onClick={() => toggleSort('createdAt')}>
                    Created {sortKey === 'createdAt' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((c) => (
                  <tr key={c._id} className="align-top odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                    <td className="p-2 border border-gray-200 dark:border-gray-700">
                      {c.name}
                    </td>
          <td className="p-2 border border-gray-200 dark:border-gray-700">
                      {c.description ? (
            <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: c.description }} />
                      ) : '-' }
                    </td>
                              <td className="p-2 border border-gray-200 dark:border-gray-700">{typeof c.serviceCharge !== 'undefined' ? `${c.serviceCharge}%` : '10%'}</td>
                    <td className="p-2 border border-gray-200 dark:border-gray-700">
                      <div className="text-sm mb-2">{c.createdAt ? new Date(c.createdAt).toLocaleString() : '-'}</div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 border rounded" onClick={() => startEdit(c)}>Edit</button>
                        <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => setDeleteCatTarget(c)}>Delete</button>
                      </div>
                      {/* Subcategories section */}
                      <div className="mt-4">
                        <div className="font-semibold mb-2">Subcategories</div>
                        <div className="space-y-2">
                          {(c.subcategories || []).map((s) => {
                            return (
                <div key={s._id} className="border rounded p-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                                <div>
                                  <div className="font-medium">{s.name}</div>
                  <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: s.description || '' }} />
                                  <div className="flex gap-2 mt-2">
                                    <button className="px-3 py-1 border rounded border-gray-300 dark:border-gray-700" onClick={() => startSubEdit(s)}>Edit</button>
                                    <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => setDeleteSubTarget(s)}>Delete</button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-3">
                          <button className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700" onClick={() => { setSubForm({ name: '', description: '', parent: '' }); setOpenAddSub(c._id); }}>Add subcategory</button>
                        </div>
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
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span className="text-sm">Page {currentPage} of {pageCount}</span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage === pageCount}
            >
              Next
            </button>
          </div>
        )}
      </main>
      {/* Add Category Modal */}
      <Modal open={openAddCat} onClose={() => setOpenAddCat(false)} title="Add Category" footer={null}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Category name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Category name" className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Service charge (%)</label>
            <input name="serviceCharge" value={form.serviceCharge} onChange={(e)=>setForm(f=>({...f,serviceCharge:Number(e.target.value)}))} type="number" min="0" max="100" className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" placeholder="Service charge (%)" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <RichText value={form.description} onChange={(val) => setForm((f) => ({ ...f, description: val }))} />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" className="px-4 py-2 border rounded border-gray-300 dark:border-gray-700" onClick={() => setOpenAddCat(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-yellow-600 text-white rounded disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal open={openEditCat} onClose={cancelEdit} title="Edit Category" footer={null}>
        <form onSubmit={submitEdit} className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Category name</label>
            <input className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Service charge (%)</label>
            <input name="serviceCharge" value={editForm.serviceCharge} onChange={(e)=>setEditForm(f=>({...f,serviceCharge:Number(e.target.value)}))} type="number" min="0" max="100" className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" placeholder="Service charge (%)" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <RichText value={editForm.description} onChange={(val) => setEditForm((f) => ({ ...f, description: val }))} />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" className="px-4 py-2 border rounded border-gray-300 dark:border-gray-700" onClick={cancelEdit}>Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      {/* Add Subcategory Modal */}
      <Modal open={!!openAddSub} onClose={() => setOpenAddSub(null)} title="Add Subcategory" footer={null}>
        <div className="grid grid-cols-1 gap-3">
          <input className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" value={subForm.name} onChange={(e) => setSubForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name" />
          <RichText value={subForm.description} onChange={(val) => setSubForm((f) => ({ ...f, description: val }))} />
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" className="px-4 py-2 border rounded border-gray-300 dark:border-gray-700" onClick={() => setOpenAddSub(null)}>Cancel</button>
            <button type="button" className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50 hover:bg-emerald-700" onClick={() => addSubCategory(openAddSub)} disabled={subLoadingId === openAddSub}>{subLoadingId === openAddSub ? 'Adding...' : 'Add'}</button>
          </div>
        </div>
      </Modal>

      {/* Edit Subcategory Modal */}
  <Modal open={!!openEditSub} onClose={() => cancelSubEdit(openEditSub)} title="Edit Subcategory" footer={null}>
        {openEditSub && (
          <div className="grid grid-cols-1 gap-3">
    <input className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" value={subEdit[openEditSub]?.name || ''} onChange={(e) => setSubEdit((m) => ({ ...m, [openEditSub]: { ...m[openEditSub], name: e.target.value } }))} placeholder="Name" />
            <RichText value={subEdit[openEditSub]?.description || ''} onChange={(val) => setSubEdit((m) => ({ ...m, [openEditSub]: { ...m[openEditSub], description: val } }))} />
            <div className="flex justify-end gap-2 mt-2">
      <button type="button" className="px-4 py-2 border rounded border-gray-300 dark:border-gray-700" onClick={() => cancelSubEdit(openEditSub)}>Cancel</button>
              <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => submitSubEdit({ _id: openEditSub })}>Save</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Category Confirm Modal */}
  <Modal open={!!deleteCatTarget} onClose={() => setDeleteCatTarget(null)} title="Delete Category" footer={null}>
        {deleteCatTarget && (
          <div>
            <p className="mb-4">Are you sure you want to delete category "{deleteCatTarget.name}"?</p>
            <div className="flex justify-end gap-2">
      <button className="px-4 py-2 border rounded border-gray-300 dark:border-gray-700" onClick={() => setDeleteCatTarget(null)}>Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={() => deleteCategory(deleteCatTarget)}>Delete</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Subcategory Confirm Modal */}
  <Modal open={!!deleteSubTarget} onClose={() => setDeleteSubTarget(null)} title="Delete Subcategory" footer={null}>
        {deleteSubTarget && (
          <div>
            <p className="mb-4">Are you sure you want to delete subcategory "{deleteSubTarget.name}"?</p>
            <div className="flex justify-end gap-2">
      <button className="px-4 py-2 border rounded border-gray-300 dark:border-gray-700" onClick={() => setDeleteSubTarget(null)}>Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={() => deleteSub(deleteSubTarget)}>Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCategories;
