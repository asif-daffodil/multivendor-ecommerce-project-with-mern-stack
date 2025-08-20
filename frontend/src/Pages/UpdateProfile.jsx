import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router'
import useAuthStore from '../store/useAuthStore'

const BASE = 'http://localhost:4000/user'

const UpdateProfile = () => {
    const navigate = useNavigate()
    const token = useAuthStore((s) => s.token)
    const user = useAuthStore((s) => s.user)
    const setAuth = useAuthStore((s) => s.setAuth)

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            billing_fullName: user?.billingAddress?.fullName || '',
            billing_addressLine: user?.billingAddress?.addressLine || '',
            billing_city: user?.billingAddress?.city || '',
            billing_postalCode: user?.billingAddress?.postalCode || '',
            billing_phone: user?.billingAddress?.phone || '',
        }
    })

    React.useEffect(() => {
        reset({
            name: user?.name || '',
            email: user?.email || '',
            billing_fullName: user?.billingAddress?.fullName || '',
            billing_addressLine: user?.billingAddress?.addressLine || '',
            billing_city: user?.billingAddress?.city || '',
            billing_postalCode: user?.billingAddress?.postalCode || '',
            billing_phone: user?.billingAddress?.phone || '',
        })
    }, [user, reset])

    const mutation = useMutation({
        mutationFn: async (payload) => {
            const id = user?._id
            if (!id) throw new Error('No user id')
            const url = `${BASE}/update/${id}`
            const headers = token ? { Authorization: `Bearer ${token}` } : undefined
            return axios.put(url, payload, { headers, validateStatus: () => true })
        },
        onSuccess: (res) => {
            if (res?.status >= 200 && res?.status < 300) {
                // prefer explicit user object from server; avoid overwriting with message-only responses
                const updatedUser = res.data?.user ?? null
                const authHeader = res.headers?.authorization
                let newToken = null
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    newToken = authHeader.split(' ')[1]
                }
                const role = updatedUser?.role || user?.role
                setAuth({ token: (newToken ?? token) || null, role, user: updatedUser ?? user })
                Swal.fire({ icon: 'success', title: 'Profile updated', text: res.data?.message || 'Your profile was updated' })
                navigate('/profile')
            } else {
                Swal.fire({ icon: 'error', title: 'Update failed', text: res?.data?.message || 'Unable to update profile' })
            }
        },
        onError: (err) => {
            Swal.fire({ icon: 'error', title: 'Update failed', text: err?.message || 'Network error' })
        }
    })

    const onSubmit = (vals) => {
        const billing = {
            fullName: vals.billing_fullName || '',
            addressLine: vals.billing_addressLine || '',
            city: vals.billing_city || '',
            postalCode: vals.billing_postalCode || '',
            phone: vals.billing_phone || '',
        }

        const payload = {
            name: vals.name,
            email: vals.email,
            billingAddress: billing,
        }

        mutation.mutate(payload)
    }

    return (
        <div className="max-w-lg mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded shadow">
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-200 mb-1">Name</label>
                    <input {...register('name', { required: 'Name required' })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-200 mb-1">Email</label>
                    <input {...register('email', { required: 'Email required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <h3 className="text-lg font-semibold mb-2">Billing Address</h3>
                <div className="mb-3">
                    <input {...register('billing_fullName')} placeholder="Full name" className="w-full px-3 py-2 border rounded mb-2" />
                    <input {...register('billing_addressLine')} placeholder="Street address" className="w-full px-3 py-2 border rounded mb-2" />
                    <div className="grid grid-cols-2 gap-2">
                        <input {...register('billing_city')} placeholder="City" className="px-3 py-2 border rounded" />
                        <input {...register('billing_postalCode')} placeholder="Postal code" className="px-3 py-2 border rounded" />
                    </div>
                    <input {...register('billing_phone')} placeholder="Phone" className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={mutation.isLoading || isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{mutation.isLoading ? 'Saving...' : 'Save'}</button>
                    <button type="button" onClick={() => navigate('/profile')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded">Cancel</button>
                </div>
            </form>
        </div>
    )
}

export default UpdateProfile
