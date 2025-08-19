
import React from 'react';
import { Link } from 'react-router';
import DashboardSidebar from '../Components/DashboardSidebar';

const vendorLinks = [
    { to: '/dashboard/vendor/orders', label: 'Orders', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18"></path></svg> },
    { to: '/dashboard/vendor/products', label: 'Products', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14"></path><rect x="8" y="11" width="8" height="10" rx="2"></rect></svg> },
    { to: '/dashboard/vendor/stats', label: 'Stats', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 17h16M4 13h16M4 9h16"></path></svg> },
];

const VendorDashboard = () => {
    return (
        <div className="flex min-h-screen bg-green-50 dark:bg-gray-900">
            <DashboardSidebar links={vendorLinks} color="green" />
            <main className="flex-1 p-10">
                <h1 className="text-3xl font-extrabold mb-4 text-green-700 dark:text-green-300 flex items-center gap-2">
                    <svg className="w-8 h-8 text-green-500 dark:text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3"></path><circle cx="12" cy="12" r="10"></circle></svg>
                    Vendor Dashboard
                </h1>
                <p className="text-base text-gray-700 dark:text-gray-200 mb-8">Welcome! Manage your orders, products, and view stats at a glance.</p>
                {/* Dashboard widgets or content can go here */}
                <div className="mt-8 flex justify-end">
                    <Link to="/profile" className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors font-semibold">
                        Back to profile
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default VendorDashboard;
