import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import useAuthStore from "../../store/useAuthStore";

const Navbar = () => {
    const [open, setOpen] = useState(false); // mobile menu
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const user = useAuthStore((s) => s.user);
    const clearAuth = useAuthStore((s) => s.clearAuth);
    const navigate = useNavigate();

    const userMenuRef = useRef(null);

    useEffect(() => {
        const onClick = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('click', onClick);
        return () => document.removeEventListener('click', onClick);
    }, []);

    const handleLogout = () => {
        clearAuth();
        navigate('/');
    };

    return (
        <nav className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-xl font-bold">MyApp</Link>
                        <div className="hidden md:flex ml-6 space-x-4">
                            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Home</Link>
                            <Link to="/products" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Products</Link>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="hidden md:flex items-center">
                            {!isLoggedIn && (
                                <>
                                    <Link to="/sign-in" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Sign In</Link>
                                    <Link to="/sign-up" className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Sign Up</Link>
                                </>
                            )}

                            {isLoggedIn && (
                                <div className="relative ml-4" ref={userMenuRef}>
                                    <button onClick={() => setUserMenuOpen((s) => !s)} className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        <img src={user?.profilePicture ? `/${user.profilePicture}` : '/profile_pictures/default.jpg'} alt="avatar" className="h-8 w-8 rounded-full" />
                                        <span className="ml-2 text-gray-700">{user?.name}</span>
                                    </button>

                                    {userMenuOpen && (
                                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                            <div className="py-1">
                                                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                                                <Link to="/change-password" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Change Password</Link>
                                                <Link to="/profile-picture" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile Picture</Link>
                                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
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
                        <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Home</Link>
                        <Link to="/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Products</Link>
                        {!isLoggedIn && (
                            <>
                                <Link to="/sign-in" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Sign In</Link>
                                <Link to="/sign-up" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700">Sign Up</Link>
                            </>
                        )}
                        {isLoggedIn && (
                            <div className="border-t pt-2">
                                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Profile</Link>
                                <Link to="/change-password" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Change Password</Link>
                                <Link to="/profile-picture" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Profile Picture</Link>
                                <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600">Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;