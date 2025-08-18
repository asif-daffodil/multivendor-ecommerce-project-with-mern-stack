import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router'
import useAuthStore from '../store/useAuthStore'

const BASE = 'http://localhost:4000/user'

const ProfilePicture = () => {
    const navigate = useNavigate()
    const token = useAuthStore((s) => s.token)
    const user = useAuthStore((s) => s.user)
    const setAuth = useAuthStore((s) => s.setAuth)

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm()

    const mutation = useMutation({
        mutationFn: async (payload) => {
            const id = user?._id
            if (!id) throw new Error('No user id')
            const url = `${BASE}/profile-picture/${id}`
            const form = new FormData()
            form.append('profilePicture', payload.profilePicture[0])
            const headers = token ? { Authorization: `Bearer ${token}` } : undefined
            return axios.patch(url, form, { headers, validateStatus: () => true })
        },
        onSuccess: (res) => {
            if (res?.status >= 200 && res?.status < 300) {
                // server may return updated user and/or a refreshed token in headers
                const updatedUser = res.data?.user ?? null
                const authHeader = res.headers?.authorization
                let newToken = null
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    newToken = authHeader.split(' ')[1]
                }
                const role = updatedUser?.role || user?.role
                setAuth({ token: (newToken ?? token) || null, role, user: updatedUser ?? user })
                Swal.fire({ icon: 'success', title: 'Profile picture updated', text: res.data?.message || 'Updated successfully' })
                reset()
                navigate('/profile')
            } else {
                Swal.fire({ icon: 'error', title: 'Upload failed', text: res?.data?.message || 'Unable to upload' })
            }
        },
        onError: (err) => {
            Swal.fire({ icon: 'error', title: 'Upload failed', text: err?.message || 'Network error' })
        }
    })

    const onSubmit = (vals) => mutation.mutate(vals)

    return (
        <div className="max-w-lg mx-auto p-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-lg my-10">
            <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-700 dark:text-blue-300">Update Profile Picture</h1>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow flex flex-col items-center text-center"
            >
                <div className="mb-6 w-full flex flex-col items-center">
                    <label className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
                        <div className="relative group">
                            <img
                                src={`http://localhost:4000/${user.profilePicture}`}
                                alt="Avatar"
                                className="h-32 w-32 rounded-full object-cover mx-auto border-4 border-blue-400 dark:border-blue-600 shadow-lg transition-transform group-hover:scale-105"
                            />
                            <span className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
                                Change
                            </span>
                        </div>
                        <span className="block mt-2">Profile picture</span>
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        {...register('profilePicture', { required: 'Please select an image' })}
                        className="w-full max-w-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                    />
                    {errors.profilePicture && (
                        <p className="text-red-500 text-sm mt-2">{errors.profilePicture.message}</p>
                    )}
                </div>

                <div className="flex gap-4 justify-center mt-4">
                    <button
                        type="submit"
                        disabled={mutation.isLoading || isSubmitting}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-semibold shadow hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-60"
                    >
                        {mutation.isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Uploading...
                            </span>
                        ) : (
                            'Upload'
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="px-6 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-full font-semibold shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ProfilePicture
