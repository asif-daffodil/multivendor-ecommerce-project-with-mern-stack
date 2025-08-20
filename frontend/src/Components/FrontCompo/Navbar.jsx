import React, { useState, useRef, useEffect } from 'react';
import useAuthStore from "../../store/useAuthStore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBoxOpen, faUser, faUserCircle, faSun, faMoon, faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Link, useNavigate } from 'react-router';
import { toggleTheme } from '../../utils/theme'
import useCartStore from '../../store/useCartStore';
const Navbar = () => {
    const [open, setOpen] = useState(false); // mobile menu
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const user = useAuthStore((s) => s.user);
    const clearAuth = useAuthStore((s) => s.clearAuth);
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

    const userMenuRef = useRef(null);
    const cartMenuRef = useRef(null);
    const cartCount = useCartStore((s) => s.totalCount());
    const cartItems = useCartStore((s) => s.items);
    const removeItem = useCartStore((s) => s.removeItem);
    const getTotalPrice = useCartStore((s) => s.totalPrice);

    useEffect(() => {
        const onClick = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
            if (cartMenuRef.current && !cartMenuRef.current.contains(e.target)) {
                setCartOpen(false);
            }
        };
        document.addEventListener('click', onClick);
        return () => document.removeEventListener('click', onClick);
    }, []);

    const handleLogout = () => {
        clearAuth();
        navigate('/');
    };

    const API_BASE = 'http://localhost:4000'
    const resolveImage = (path) => {
        if (!path) return null
        if (path.startsWith('http://') || path.startsWith('https://')) return path
        if (path.startsWith('/')) return `${API_BASE}${path}`
        return `${API_BASE}/${path}`
    }
    const avatarSrc = resolveImage(user?.profilePicture)

    return (
        <nav className="bg-white border-b relative z-50 dark:bg-black dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">MyApp</Link>
                        <div className="hidden md:flex ml-6 space-x-4">
                            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900"><FontAwesomeIcon icon={faHome} className="mr-2"/>Home</Link>
                            <Link to="/products" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900"><FontAwesomeIcon icon={faBoxOpen} className="mr-2"/>Products</Link>
                        </div>
                        <div className="hidden md:flex items-center ml-4 space-x-3">
                            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800"><FontAwesomeIcon icon={faFacebook} /></a>
                            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-sky-500 hover:text-sky-700"><FontAwesomeIcon icon={faTwitter} /></a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-pink-500 hover:text-pink-700"><FontAwesomeIcon icon={faInstagram} /></a>
                            <a href="https://wa.me" target="_blank" rel="noreferrer" className="text-green-600 hover:text-green-800"><FontAwesomeIcon icon={faWhatsapp} /></a>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="hidden md:flex items-center">
                            <button onClick={() => { toggleTheme(); setIsDark(document.documentElement.classList.contains('dark')); }} aria-label="Toggle theme" className="mr-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                <FontAwesomeIcon icon={isDark ? faSun : faMoon} className="text-gray-700 dark:text-gray-200" />
                            </button>
                            {/* Cart */}
                            <div className="relative mr-3" ref={cartMenuRef}>
                                <button onClick={() => setCartOpen((s)=>!s)} className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Cart">
                                    <FontAwesomeIcon icon={faCartShopping} className="text-gray-700 dark:text-gray-200" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-blue-600 text-white">{cartCount}</span>
                                    )}
                                </button>
                                {cartOpen && (
                                    <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-800 z-50">
                                        <div className="p-3 max-h-80 overflow-auto">
                                            {cartItems.length === 0 ? (
                                                <div className="text-sm text-gray-600 dark:text-gray-300">Your cart is empty.</div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {cartItems.slice(0, 6).map((i) => (
                                                        <div key={i.id + (i.variant ? JSON.stringify(i.variant) : '')} className="flex items-center gap-3">
                                                            <div className="h-12 w-12 rounded border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                                                                <img src={i.image || '/hero-ecommerce.svg'} alt={i.name} className="w-full h-full object-cover" onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/hero-ecommerce.svg'; }} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium truncate">{i.name}</div>
                                                                {i.variant && (
                                                                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{i.variant.color ? `Color: ${i.variant.color}` : ''}{i.variant.color && i.variant.size ? ' • ' : ''}{i.variant.size ? `Size: ${i.variant.size}` : ''}</div>
                                                                )}
                                                                <div className="text-xs text-gray-600 dark:text-gray-400">Qty: {i.qty || 1} • {'BDT '}{(Number(i.price) * (i.qty || 1)).toFixed(2)}</div>
                                                            </div>
                                                            <button onClick={()=>removeItem(i.id)} className="text-xs text-red-600 hover:underline">Remove</button>
                                                        </div>
                                                    ))}
                                                    {cartItems.length > 6 && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">and {cartItems.length - 6} more…</div>
                                                    )}
                                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                                                        <div className="text-sm font-semibold">Total</div>
                                                        <div className="text-sm font-bold">{'BDT '}{getTotalPrice().toFixed(2)}</div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Link to="/cart" className="flex-1 px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 text-center hover:bg-gray-100 dark:hover:bg-gray-800">View cart</Link>
                                                        <Link to="/checkout" className="flex-1 px-3 py-1.5 text-sm rounded bg-blue-600 text-white text-center hover:bg-blue-700">Checkout</Link>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {!isLoggedIn && (
                                <>
                                    <Link to="/sign-in" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900">Sign In</Link>
                                    <Link to="/sign-up" className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 dark:bg-blue-700 dark:text-white">Sign Up</Link>
                                </>
                            )}
                            {isLoggedIn && (
                                <div className="relative ml-4" ref={userMenuRef}>
                                    <button onClick={() => setUserMenuOpen((s) => !s)} className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        {user?.profilePicture ? (
                                            <img src={avatarSrc} alt="avatar" className="h-8 w-8 rounded-full" onError={(e)=>{ e.currentTarget.onerror = null; e.currentTarget.src = '/vite.svg' }} />
                                        ) : (
                                            <FontAwesomeIcon icon={faUserCircle} className="h-8 w-8 text-gray-500 dark:text-gray-300" />
                                        )}
                                        <span className="ml-2 text-gray-700 dark:text-white">{user?.name}</span>
                                    </button>
                                    {userMenuOpen && (
                                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5">
                                            <div className="py-1">
                                                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"><FontAwesomeIcon icon={faUser} className="mr-2"/>Profile</Link>
                                                <Link to="/change-password" className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">Change Password</Link>
                                                <Link to="/profile-picture" className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">Profile Picture</Link>
                                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800">Logout</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="-mr-2 flex md:hidden">
                            <button onClick={() => setOpen((s) => !s)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none">
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {open ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {open && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900">Home</Link>
                        <Link to="/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900">Products</Link>
                        <Link to="/cart" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900">Cart {cartCount > 0 ? `(${cartCount})` : ''}</Link>
                        {!isLoggedIn && (
                            <>
                                <Link to="/sign-in" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900">Sign In</Link>
                                <Link to="/sign-up" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:text-white">Sign Up</Link>
                            </>
                        )}
                        {isLoggedIn && (
                            <div className="border-t pt-2">
                                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">Profile</Link>
                                <Link to="/change-password" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">Change Password</Link>
                                <Link to="/profile-picture" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">Profile Picture</Link>
                                <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800">Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;