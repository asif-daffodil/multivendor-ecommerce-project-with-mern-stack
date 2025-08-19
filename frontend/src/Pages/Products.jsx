import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import api from '../utils/apiClient';
import useCartStore from '../store/useCartStore';

const API_BASE = 'http://localhost:4000';
const resolveImage = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
};

export default function Products() {
  const addItem = useCartStore((s) => s.addItem);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subs, setSubs] = useState([]);

  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('newest'); // newest | priceAsc | priceDesc | name
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [pRes, cRes, bRes] = await Promise.all([
        api.get('/products'),
        api.get('/category'),
        api.get('/brand'),
      ]);
      const products = Array.isArray(pRes.data) ? pRes.data : [];
      setItems(products);
      setCategories(cRes.data || []);
      setBrands(bRes.data || []);
      // initialize price range to data bounds
      const prices = products.map(p => Number(p.salePrice ?? p.regularPrice ?? 0)).filter(n => !isNaN(n));
      if (prices.length) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        setPriceMin(String(min));
        setPriceMax(String(max));
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load products');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (!category) { setSubs([]); setSubcategory(''); return; }
    (async () => {
      try {
        const r = await api.get(`/subcategory?parent=${category}`);
        setSubs(r.data || []);
        setSubcategory('');
      } catch {
        setSubs([]); setSubcategory('');
      }
    })();
  }, [category]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = priceMin !== '' ? Number(priceMin) : null;
    const max = priceMax !== '' ? Number(priceMax) : null;
    return items.filter(p => {
      if (category && (p.category?._id || p.category) !== category) return false;
      if (subcategory && (p.subcategory?._id || p.subcategory) !== subcategory) return false;
      if (brand && (p.brand?._id || p.brand) !== brand) return false;
      const name = (p.name || '').toLowerCase();
      if (q && !name.includes(q)) return false;
      const price = Number(p.salePrice ?? p.regularPrice ?? 0);
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;
      return true;
    });
  }, [items, category, subcategory, brand, search, priceMin, priceMax]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortKey === 'newest') {
      arr.sort((a,b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
    } else if (sortKey === 'priceAsc') {
      arr.sort((a,b) => {
        const va = Number(a.salePrice ?? a.regularPrice ?? 0);
        const vb = Number(b.salePrice ?? b.regularPrice ?? 0);
        return va - vb;
      });
    } else if (sortKey === 'priceDesc') {
      arr.sort((a,b) => {
        const va = Number(a.salePrice ?? a.regularPrice ?? 0);
        const vb = Number(b.salePrice ?? b.regularPrice ?? 0);
        return vb - va;
      });
    } else if (sortKey === 'name') {
      arr.sort((a,b) => (a.name||'').localeCompare(b.name||''));
    }
    return arr;
  }, [filtered, sortKey]);

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = sorted.slice((currentPage-1)*pageSize, (currentPage-1)*pageSize + pageSize);

  const resetFilters = () => {
    setCategory(''); setSubcategory(''); setBrand(''); setSearch(''); setSortKey('newest');
    // keep price range at global defaults
  };

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Products</h1>
        {error && <div className="mb-4 text-red-600 dark:text-red-400">{error}</div>}

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Filters */}
          <aside className="lg:col-span-3 p-4 rounded border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Filters</div>
              <button onClick={resetFilters} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Reset</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Category</label>
                <select value={category} onChange={(e)=>{ setCategory(e.target.value); setPage(1); }} className="w-full p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                  <option value="">All</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Subcategory</label>
                <select value={subcategory} onChange={(e)=>{ setSubcategory(e.target.value); setPage(1); }} disabled={!subs.length} className="w-full p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 disabled:opacity-60">
                  <option value="">All</option>
                  {subs.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Brand</label>
                <select value={brand} onChange={(e)=>{ setBrand(e.target.value); setPage(1); }} className="w-full p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                  <option value="">All</option>
                  {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Price range</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" value={priceMin} onChange={(e)=>{ setPriceMin(e.target.value); setPage(1); }} className="w-1/2 p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
                  <span className="text-gray-500">-</span>
                  <input type="number" placeholder="Max" value={priceMax} onChange={(e)=>{ setPriceMax(e.target.value); setPage(1); }} className="w-1/2 p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <section className="lg:col-span-9">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <input value={search} onChange={(e)=>{ setSearch(e.target.value); setPage(1); }} placeholder="Search products" className="p-2 border rounded w-64 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500" />
              <div className="ml-auto flex items-center gap-2">
                <label className="text-sm">Sort:</label>
                <select value={sortKey} onChange={(e)=>{ setSortKey(e.target.value); setPage(1); }} className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                  <option value="newest">Newest</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
                <label className="text-sm ml-3">Rows:</label>
                <select value={pageSize} onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }} className="p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div>Loading…</div>
            ) : (
              <>
                {sorted.length === 0 ? (
                  <div className="text-gray-600 dark:text-gray-300">No products found.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {pageItems.map(p => {
                      const img = resolveImage(p.featuredImage);
                      const hasSale = p.salePrice !== undefined && p.salePrice !== null && p.salePrice !== '';
                      const regular = p.regularPrice;
                      const price = hasSale ? p.salePrice : regular;
                      return (
                        <div key={p._id} className="group rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-shadow">
                          <Link to={`/products/${p._id}`} className="aspect-square bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                            {img ? (
                              <img src={img} alt={p.name} className="w-full h-full object-cover" onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/hero-ecommerce.svg'; }} />
                            ) : (
                              <img src="/hero-ecommerce.svg" alt="Product" className="w-1/2 opacity-80" />
                            )}
                          </Link>
                          <div className="p-3">
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{p.brand?.name || '—'}</div>
                            <Link to={`/products/${p._id}`} className="font-medium truncate hover:underline" title={p.name}>{p.name}</Link>
                            <div className="mt-1 flex items-baseline gap-2">
                              {hasSale && regular ? (
                                <>
                                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">{regular}</span>
                                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{price}</span>
                                </>
                              ) : (
                                <span className="text-blue-600 dark:text-blue-400 font-semibold">{price}</span>
                              )}
                            </div>
                            <div className="mt-3 flex gap-2">
                              <button className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => addItem({ id: p._id, name: p.name, price, image: img, product: p })}>Add to cart</button>
                              <Link to="/cart" className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => addItem({ id: p._id, name: p.name, price, image: img, product: p })}>Buy now</Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {sorted.length > 0 && (
                  <div className="mt-6 flex items-center gap-3">
                    <button className="px-3 py-1 border rounded disabled:opacity-50 border-gray-300 dark:border-gray-700" onClick={() => setPage(p => Math.max(1, p-1))} disabled={currentPage===1}>Prev</button>
                    <span className="text-sm">Page {currentPage} of {pageCount}</span>
                    <button className="px-3 py-1 border rounded disabled:opacity-50 border-gray-300 dark:border-gray-700" onClick={() => setPage(p => Math.min(pageCount, p+1))} disabled={currentPage===pageCount}>Next</button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
