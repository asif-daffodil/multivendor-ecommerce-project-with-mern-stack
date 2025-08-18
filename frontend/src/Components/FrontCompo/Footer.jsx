import React from 'react'

const Footer = () => {
    return (
        <footer className="mt-12 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300">© {new Date().getFullYear()} MyApp. All rights reserved.</div>
                    <div className="flex items-center gap-4">
                        <a href="/" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">Home</a>
                        <a href="/products" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">Products</a>
                        <a href="/profile" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">Profile</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer