import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router'
import useAuthStore from '../store/useAuthStore'

const BASE = 'http://localhost:4000/user'

const ChangePassword = () => {
    const navigate = useNavigate();
    const token = useAuthStore((s) => s.token);
    const user = useAuthStore((s) => s.user);
    const setAuth = useAuthStore((s) => s.setAuth);

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm()
    const newPassword = watch('newPassword')

    const mutation = useMutation({
        mutationFn: async (payload) => {
            const id = user?._id
            if (!id) throw new Error('No user id')
            const url = `${BASE}/change-password/${id}`
            const headers = token ? { Authorization: `Bearer ${token}` } : undefined
            return axios.post(url, payload, { headers, validateStatus: () => true })
        },
        onSuccess: (res) => {
            if (res?.status >= 200 && res?.status < 300) {
                // server may return only a message (no user object) for password change.
                // only update the stored user when the response contains a user object.
                const updatedUser = res.data?.user ?? null
                // if new token is returned in headers, update auth store
                const authHeader = res.headers?.authorization
                let newToken = null
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    newToken = authHeader.split(' ')[1]
                }
                const role = updatedUser?.role || user?.role
                setAuth({ token: (newToken ?? token) || null, role, user: updatedUser ?? user })
                Swal.fire({ icon: 'success', title: 'Password changed', text: res.data?.message || 'Password updated successfully' })
                reset()
                navigate('/profile')
            } else {
                Swal.fire({ icon: 'error', title: 'Change failed', text: res?.data?.message || 'Unable to change password' })
            }
        },
        onError: (err) => {
            Swal.fire({ icon: 'error', title: 'Change failed', text: err?.message || 'Network error' })
        }
    })

    const onSubmit = (vals) => mutation.mutate(vals)

    return (
        <div className="max-w-lg mx-auto p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-xl shadow-2xl mt-10">
            <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-400 mb-6 text-center tracking-tight">Change Password</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Current password</label>
                    <input
                        type="password"
                        {...register('currentPassword', { required: 'Current password required' })}
                        className="w-full px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        placeholder="Enter current password"
                    />
                    {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">New password</label>
                    <input
                        type="password"
                        {...register('newPassword', { required: 'New password required', minLength: { value: 6, message: 'Min 6 characters' } })}
                        className="w-full px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        placeholder="Enter new password"
                    />
                    {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Confirm new password</label>
                    <input
                        type="password"
                        {...register('confirmPassword', { required: 'Please confirm new password', validate: value => value === newPassword || 'Passwords do not match' })}
                        className="w-full px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        placeholder="Confirm new password"
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                <div className="flex gap-4 justify-center mt-6">
                    <button
                        type="submit"
                        disabled={mutation.isLoading || isSubmitting}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-lg shadow hover:from-blue-700 hover:to-blue-500 transition disabled:opacity-60"
                    >
                        {mutation.isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>
                                Changing...
                            </span>
                        ) : 'Change password'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="px-6 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white font-semibold rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ChangePassword
