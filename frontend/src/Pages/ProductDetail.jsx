import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import api from '../utils/apiClient';
import useCartStore from '../store/useCartStore';

const API_BASE = 'http://localhost:4000';
const resolveImage = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);

  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImg, setActiveImg] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError('');
      try {
        const r = await api.get(`/products/${id}`);
        const data = r.data;
        setP(data);
        const imgs = [data.featuredImage, ...(Array.isArray(data.images) ? data.images : [])]
          .map(resolveImage)
          .filter(Boolean);
        setActiveImg(imgs[0] || null);
  // Preselect single options for convenience
  const colors = Array.isArray(data.colors) ? data.colors : [];
  const sizes = Array.isArray(data.sizes) ? data.sizes : [];
  setSelectedColor(colors.length === 1 ? colors[0] : null);
  setSelectedSize(sizes.length === 1 ? sizes[0] : null);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const hasSale = useMemo(() => p && p.salePrice !== undefined && p.salePrice !== null && p.salePrice !== '', [p]);
  const regular = p?.regularPrice;
  const price = hasSale ? p?.salePrice : regular;

  const images = useMemo(() => {
    if (!p) return [];
    const arr = [p.featuredImage, ...(Array.isArray(p.images) ? p.images : [])]
      .map(resolveImage)
      .filter(Boolean);
    return arr;
  }, [p]);

  const requireColor = Array.isArray(p?.colors) && p.colors.length > 1;
  const requireSize = Array.isArray(p?.sizes) && p.sizes.length > 1;
  const selectionMissing = (requireColor && !selectedColor) || (requireSize && !selectedSize);
  const canBuy = !p?.outOfStock && !selectionMissing;

  if (loading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-gray-700 dark:text-gray-300">Loading…</div>;
  if (error) return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-red-600 dark:text-red-400">{error}</div>;
  if (!p) return null;

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 text-sm">
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600 dark:text-gray-300">{p.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden">
              {activeImg ? (
                <img src={activeImg} alt={p.name} className="w-full h-full object-contain" onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/hero-ecommerce.svg'; }} />
              ) : (
                <img src="/hero-ecommerce.svg" alt="Product" className="w-1/2 opacity-80" />
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {images.map((src, idx) => (
                  <button key={idx} onClick={()=>setActiveImg(src)} className={`aspect-square rounded border ${activeImg===src ? 'border-blue-500' : 'border-gray-200 dark:border-gray-800'} overflow-hidden bg-white dark:bg-gray-900`}>
                    <img src={src} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{p.name}</h1>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{p.brand?.name || '—'}</div>

            <div className="mt-3 flex items-baseline gap-3">
              {hasSale && regular ? (
                <>
                  <span className="text-gray-500 dark:text-gray-400 line-through">{regular}</span>
                  <span className="text-2xl text-blue-600 dark:text-blue-400 font-extrabold">{price}</span>
                </>
              ) : (
                <span className="text-2xl text-blue-600 dark:text-blue-400 font-extrabold">{price}</span>
              )}
            </div>

            <div className="mt-2 text-sm">
              {p.outOfStock ? (
                <span className="text-red-600 dark:text-red-400">Out of stock</span>
              ) : (
                <span className="text-green-600 dark:text-green-400">In stock: {p.inventoryCount}</span>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                disabled={!canBuy}
                onClick={() => addItem({ id: p._id, name: p.name, price, image: resolveImage(p.featuredImage), product: p, variant: { color: selectedColor, size: selectedSize } })}
              >
                Add to cart
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={!canBuy}
                onClick={() => { addItem({ id: p._id, name: p.name, price, image: resolveImage(p.featuredImage), product: p, variant: { color: selectedColor, size: selectedSize } }); navigate('/cart'); }}
              >
                Buy now
              </button>
            </div>

            {selectionMissing && (
              <div className="mt-3 text-sm text-amber-600 dark:text-amber-400">
                Please select {requireColor && !selectedColor ? 'a color' : ''}{requireColor && requireSize && (!selectedColor || !selectedSize) ? ' and ' : ''}{requireSize && !selectedSize ? 'a size' : ''}.
              </div>
            )}

            {p.shortDescription && (
              <p className="mt-6 text-gray-700 dark:text-gray-300">{p.shortDescription}</p>
            )}

            {p.description && (
              <div className="mt-6 prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: p.description }} />
            )}

            {/* Variant selection */}
            <div className="mt-6 flex flex-col gap-4 text-sm">
              {Array.isArray(p.colors) && p.colors.length > 0 && (
                <div>
                  <div className="font-semibold">Color</div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {p.colors.map((c, i) => {
                      const selected = selectedColor === c;
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setSelectedColor(c)}
                          className={`px-3 py-1.5 rounded border ${selected ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800`}
                          aria-pressed={selected}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {Array.isArray(p.sizes) && p.sizes.length > 0 && (
                <div>
                  <div className="font-semibold">Size</div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {p.sizes.map((s, i) => {
                      const selected = selectedSize === s;
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setSelectedSize(s)}
                          className={`px-3 py-1.5 rounded border ${selected ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800`}
                          aria-pressed={selected}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
