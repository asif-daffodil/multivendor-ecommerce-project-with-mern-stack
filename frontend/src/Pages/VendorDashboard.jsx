import React from 'react'
import { Link } from 'react-router'

const VendorDashboard = () => {
    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="bg-gradient-to-br from-green-100 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-10 rounded-2xl shadow-2xl">
                <h1 className="text-3xl font-extrabold mb-4 text-green-700 dark:text-green-300 flex items-center gap-2">
                    <svg className="w-8 h-8 text-green-500 dark:text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3"></path><circle cx="12" cy="12" r="10"></circle></svg>
                    Vendor Dashboard
                </h1>
                <p className="text-base text-gray-700 dark:text-gray-200 mb-8">Welcome! Manage your orders, products, and view stats at a glance.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow hover:scale-105 transition-transform cursor-pointer flex flex-col items-center">
                        <svg className="w-8 h-8 mb-2 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18"></path></svg>
                        <span className="font-semibold text-lg">Orders</span>
                        <span className="text-xs text-gray-500 mt-1">View and manage orders</span>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow hover:scale-105 transition-transform cursor-pointer flex flex-col items-center">
                        <svg className="w-8 h-8 mb-2 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14"></path><rect x="8" y="11" width="8" height="10" rx="2"></rect></svg>
                        <span className="font-semibold text-lg">Products</span>
                        <span className="text-xs text-gray-500 mt-1">Manage your products</span>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow hover:scale-105 transition-transform cursor-pointer flex flex-col items-center">
                        <svg className="w-8 h-8 mb-2 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 17h16M4 13h16M4 9h16"></path></svg>
                        <span className="font-semibold text-lg">Stats</span>
                        <span className="text-xs text-gray-500 mt-1">See your performance</span>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Link to="/profile" className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors font-semibold">
                        Back to profile
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default VendorDashboard
