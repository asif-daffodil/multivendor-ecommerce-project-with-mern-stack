import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import api from '../utils/apiClient';
import DashboardSidebar from '../Components/DashboardSidebar';
import RichText from '../Components/RichText';
import TagInput from '../Components/TagInput';
import FileUpload from '../Components/FileUpload';

const adminLinks = [
  { to: '/admin/categories', label: 'Manage Categories', icon: <span className="text-xl">📦</span> },
  { to: '/admin/brands', label: 'Manage Brands', icon: <span className="text-xl">🏷️</span> },
  { to: '/admin/products', label: 'Manage Products', icon: <span className="text-xl">🛒</span> },
  { to: '/admin/users', label: 'Manage Users', icon: <span className="text-xl">👥</span> },
  { to: '/admin/stats', label: 'System Stats', icon: <span className="text-xl">📊</span> },
];

export default function AdminProductForm() {
  const params = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(params.id);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subs, setSubs] = useState([]);
  const [form, setForm] = useState({
    name: '', shortDescription: '', description: '',
    regularPrice: '', salePrice: '', category: '', subcategory: '', brand: '',
    colors: '', sizes: '', inventoryCount: 0, isCompanyProduct: false,
  });
  const [featuredImage, setFeaturedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/category'),
          api.get('/brand'),
        ]);
        setCategories(catRes.data||[]);
        setBrands(brandRes.data||[]);
  } catch { /* ignore */ }
    })();
  }, []);

  // Load product when editing
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const r = await api.get(`/products/${params.id}`);
        const p = r.data;
        setForm({
          name: p.name || '',
          shortDescription: p.shortDescription || '',
          description: p.description || '',
          regularPrice: p.regularPrice ?? '',
          salePrice: p.salePrice ?? '',
          category: p.category?._id || p.category || '',
          subcategory: p.subcategory?._id || p.subcategory || '',
          brand: p.brand?._id || p.brand || '',
          colors: Array.isArray(p.colors) ? p.colors.join(', ') : (p.colors || ''),
          sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : (p.sizes || ''),
          inventoryCount: p.inventoryCount ?? 0,
          isCompanyProduct: Boolean(p.isCompanyProduct),
        });
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load product');
      }
    })();
  }, [isEdit, params.id]);

  useEffect(() => {
    const catId = form.category;
    if (!catId) { setSubs([]); return; }
    (async () => {
      try {
        const r = await api.get(`/subcategory?parent=${catId}`);
        setSubs(r.data||[]);
  } catch { setSubs([]); }
    })();
  }, [form.category]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type==='checkbox' ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      if (featuredImage) fd.append('featuredImage', featuredImage);
      for (const img of images) fd.append('images', img);
      // colors & sizes allow comma-separated values
      if (form.colors) fd.set('colors', JSON.stringify(form.colors.split(',').map(s=>s.trim()).filter(Boolean)));
      if (form.sizes) fd.set('sizes', JSON.stringify(form.sizes.split(',').map(s=>s.trim()).filter(Boolean)));

      if (isEdit) {
        await api.put(`/products/${params.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSuccess('Product updated');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSuccess('Product created');
        setForm({ name:'', shortDescription:'', description:'', regularPrice:'', salePrice:'', category:'', subcategory:'', brand:'', colors:'', sizes:'', inventoryCount:0, isCompanyProduct:false });
        setFeaturedImage(null); setImages([]);
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create product');
    } finally { setSaving(false); }
  };

  return (
    <div className="flex min-h-screen bg-yellow-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <DashboardSidebar links={adminLinks} color="yellow" />
      <main className="flex-1 p-6">
  <h2 className="text-2xl font-bold mb-4">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
        {error && <div className="mb-4 text-red-600 dark:text-red-400">{error}</div>}
        {success && <div className="mb-4 text-green-600 dark:text-green-400">{success}</div>}
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" placeholder="Title" name="name" value={form.name} onChange={onChange} required />
          <input className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" placeholder="Regular Price" name="regularPrice" value={form.regularPrice} onChange={onChange} required type="number" min="0" step="0.01" />
          <input className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" placeholder="Sale Price" name="salePrice" value={form.salePrice} onChange={onChange} type="number" min="0" step="0.01" />
          <select className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" name="category" value={form.category} onChange={onChange} required>
            <option value="">Select Category</option>
            {categories.map(c=> <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" name="subcategory" value={form.subcategory} onChange={onChange}>
            <option value="">Select Subcategory (optional)</option>
            {subs.map(s=> <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" name="brand" value={form.brand} onChange={onChange}>
            <option value="">Select Brand (optional)</option>
            {brands.map(b=> <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
          <div>
            <label className="block text-sm font-medium mb-1">Colors</label>
            <TagInput value={form.colors} onChange={(val)=>setForm(f=>({...f, colors: val}))} placeholder="Type a color and press Enter" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sizes</label>
            <TagInput value={form.sizes} onChange={(val)=>setForm(f=>({...f, sizes: val}))} placeholder="Type a size and press Enter" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Inventory (In stock)</label>
            <input className="p-2 border rounded w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" placeholder="e.g. 12" name="inventoryCount" value={form.inventoryCount} onChange={onChange} type="number" min="0" aria-label="Inventory (In stock)" />
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" name="isCompanyProduct" checked={form.isCompanyProduct} onChange={onChange} /> Company Product (admin)</label>
          <textarea className="p-2 border rounded md:col-span-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" placeholder="Short Description" name="shortDescription" value={form.shortDescription} onChange={onChange} />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Detailed Description</label>
            <RichText value={form.description} onChange={(val)=>setForm(f=>({...f, description: val}))} />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Featured Image</label>
              <FileUpload label="Choose Featured Image" accept="image/*" multiple={false} onChange={(fileList)=> setFeaturedImage(Array.isArray(fileList) ? fileList[0] : fileList)} helperText="Recommended: 800x800px" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Product Images</label>
              <FileUpload label="Add Images" accept="image/*" multiple={true} onChange={(list)=> setImages(Array.isArray(list)? list : (list ? [list] : []))} helperText="You can select multiple images" />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 mt-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-yellow-600 text-white rounded disabled:opacity-60">{saving? (isEdit ? 'Updating...' : 'Saving...') : (isEdit ? 'Update' : 'Save')}</button>
            {isEdit && (
              <button type="button" className="px-4 py-2 border rounded border-gray-300 dark:border-gray-700" onClick={()=>navigate('/admin/products')}>Cancel</button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
