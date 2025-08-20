
import React from 'react';
import { Link } from 'react-router';
import DashboardSidebar from '../Components/DashboardSidebar';

const adminLinks = [
    { to: '/admin/categories', label: 'Manage Categories', icon: <span className="text-xl">📦</span> },
    { to: '/admin/brands', label: 'Manage Brands', icon: <span className="text-xl">🏷️</span> },
    { to: '/admin/products', label: 'Manage Products', icon: <span className="text-xl">🛒</span> },
    { to: '/admin/users', label: 'Manage Users', icon: <span className="text-xl">👥</span> },
    { to: '/admin/stats', label: 'System Stats', icon: <span className="text-xl">📊</span> },
    { to: '/admin/orders', label: 'Orders', icon: <span className="text-xl">📦</span> },
];

const AdminDashboard = () => {
    return (
        <div className="flex min-h-screen bg-yellow-50 dark:bg-gray-900">
            <DashboardSidebar links={adminLinks} color="yellow" />
            <main className="flex-1 p-10">
                <h1 className="text-3xl font-extrabold mb-4 text-yellow-900 dark:text-yellow-200 tracking-tight">Admin Dashboard</h1>
                <p className="text-base text-gray-700 dark:text-gray-300 mb-8">Manage categories, users, and view system statistics. Admin-only actions are below.</p>
                {/* Dashboard widgets or content can go here */}
                <div className="mt-8 flex justify-end">
                    <Link
                        to="/profile"
                        className="inline-block px-6 py-2 rounded-full bg-yellow-600 text-white dark:bg-yellow-500 dark:text-gray-100 font-semibold shadow hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors duration-200"
                    >
                        Back to Profile
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
