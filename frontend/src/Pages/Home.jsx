import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/apiClient';
import useCartStore from '../store/useCartStore';

const Home = () => {
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const addItem = useCartStore((s) => s.addItem);
    const navigate = useNavigate();
    const [latest, setLatest] = useState([]);
    const [latestLoading, setLatestLoading] = useState(true);
    const [latestError, setLatestError] = useState('');

    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    const resolveImage = (path) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        if (path.startsWith('/')) return `${API_BASE}${path}`;
        return `${API_BASE}/${path}`;
    };

    useEffect(() => {
        (async () => {
            setLatestLoading(true); setLatestError('');
            try {
                const res = await api.get('/products');
                const items = Array.isArray(res.data) ? res.data : [];
                items.sort((a,b) => {
                    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return tb - ta;
                });
                setLatest(items.slice(0, 8));
            } catch (e) {
                setLatestError(e?.response?.data?.message || 'Failed to load latest products');
            } finally {
                setLatestLoading(false);
            }
        })();
    }, []);
    return (
        <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    {/* subtle gradient background */}
                    <div className="h-full w-full bg-gradient-to-b from-blue-50/80 to-white dark:from-gray-900 dark:to-gray-950" />
                    {/* radial glow */}
                    <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-30 bg-blue-300 dark:bg-blue-900" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <div className="grid lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">Welcome</span>
                            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight">
                                Discover products you’ll love
                            </h1>
                            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-prose">
                                Shop great deals, manage your store, and grow your business—all in one place. Light and dark mode supported.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    to="/products"
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-950"
                                >
                                    Shop Now
                                </Link>
                                {!isLoggedIn && (
                                    <Link
                                        to="/sign-up"
                                        className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-900"
                                    >
                                        Become a Vendor
                                    </Link>
                                )}
                            </div>
                        </div>
                                    <div className="relative">
                                        <div className="aspect-[4/3] rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-center overflow-hidden">
                                            <img src="/hero-ecommerce.svg" alt="Shop smarter with our ecommerce platform" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                    </div>
                </div>
            </section>

            {/* Quick features */}
            <section className="py-10 border-t border-gray-100 dark:border-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                            <div className="text-xl">🚚</div>
                            <div className="mt-2 font-semibold">Fast delivery</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Get your orders quickly and reliably.</div>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                            <div className="text-xl">🔒</div>
                            <div className="mt-2 font-semibold">Secure checkout</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Your data stays safe with us.</div>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                            <div className="text-xl">💬</div>
                            <div className="mt-2 font-semibold">24/7 support</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">We’re here when you need us.</div>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                            <div className="text-xl">🌗</div>
                            <div className="mt-2 font-semibold">Dark mode</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Easy on the eyes, day or night.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Latest products */}
            <section className="py-12 border-t border-gray-100 dark:border-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-6">
                        <h2 className="text-2xl font-bold">Latest Products</h2>
                        <Link to="/products" className="text-sm text-blue-600 hover:underline dark:text-blue-400">View all</Link>
                    </div>
                    {latestError && (
                        <div className="mb-4 text-red-600 dark:text-red-400">{latestError}</div>
                    )}
                    {latestLoading ? (
                        <div className="text-gray-600 dark:text-gray-300">Loading latest products…</div>
                    ) : latest.length === 0 ? (
                        <div className="text-gray-600 dark:text-gray-300">No products yet.</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            {latest.map(p => {
                                const img = resolveImage(p.featuredImage);
                                const hasSale = typeof p.salePrice !== 'undefined' && p.salePrice !== null && p.salePrice !== '';
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
                                                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">{'BDT '}{Number(regular).toFixed(2)}</span>
                                                        <span className="text-blue-600 dark:text-blue-400 font-semibold">{'BDT '}{Number(price).toFixed(2)}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-blue-600 dark:text-blue-400 font-semibold">{'BDT '}{Number(price).toFixed(2)}</span>
                                                )}
                                            </div>
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    onClick={() => addItem({ id: p._id, name: p.name, price, image: img, product: p })}
                                                >
                                                    Add to cart
                                                </button>
                                                <button
                                                    className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                                                    onClick={() => { addItem({ id: p._id, name: p.name, price, image: img, product: p }); navigate('/cart'); }}
                                                >
                                                    Buy now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;