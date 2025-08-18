import React from 'react'
import { Link } from 'react-router'

const UserDashboard = () => {
return (
    <div className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 my-10">
        <div className="bg-white dark:bg-gray-900 p-10 rounded-2xl shadow-2xl dark:border dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full opacity-30 blur-2xl -z-10"></div>
            <h1 className="text-3xl font-extrabold mb-4 text-blue-900 dark:text-blue-200 tracking-tight">Welcome to Your Dashboard</h1>
            <p className="text-base text-gray-700 dark:text-gray-300 mb-8">Manage your account, track your progress, and explore new features. Your personalized widgets are below.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-tr from-blue-50 to-blue-200 dark:from-gray-800 dark:to-blue-900 rounded-xl shadow-md flex flex-col items-center hover:scale-105 transition-transform duration-200">
                    <span className="text-4xl mb-2">📊</span>
                    <h2 className="font-semibold text-lg mb-1 text-blue-800 dark:text-blue-200">Statistics</h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center">View your recent activity and performance.</p>
                </div>
                <div className="p-6 bg-gradient-to-tr from-blue-50 to-blue-200 dark:from-gray-800 dark:to-blue-900 rounded-xl shadow-md flex flex-col items-center hover:scale-105 transition-transform duration-200">
                    <span className="text-4xl mb-2">📝</span>
                    <h2 className="font-semibold text-lg mb-1 text-blue-800 dark:text-blue-200">Tasks</h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center">Check your pending tasks and reminders.</p>
                </div>
                <div className="p-6 bg-gradient-to-tr from-blue-50 to-blue-200 dark:from-gray-800 dark:to-blue-900 rounded-xl shadow-md flex flex-col items-center hover:scale-105 transition-transform duration-200">
                    <span className="text-4xl mb-2">⚙️</span>
                    <h2 className="font-semibold text-lg mb-1 text-blue-800 dark:text-blue-200">Settings</h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center">Update your preferences and account info.</p>
                </div>
            </div>
            <div className="mt-8 flex justify-end">
                <Link
                    to="/profile"
                    className="inline-block px-6 py-2 rounded-full bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-100 font-semibold shadow hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                    Back to Profile
                </Link>
            </div>
        </div>
    </div>
)
}

export default UserDashboard
