import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Swal from 'sweetalert2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from 'react-router';
import useAuthStore from '../store/useAuthStore';

const SignIn = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const setAuth = useAuthStore((s) => s.setAuth);
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isLoggedIn) navigate('/');
    }, [isLoggedIn, navigate]);

    const mutation = useMutation({
        mutationFn: async (data) => {
            // Accept all statuses so we can handle 4xx without axios throwing
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, data, { validateStatus: () => true });
            return res;
        },
        onSuccess: (res) => {
            if (res?.status >= 200 && res?.status < 300) {
                const token = res.data?.token;
                const user = res.data?.user;
                const role = user?.role;
                if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setAuth({ token, role, user });
                Swal.fire({ icon: 'success', title: 'Login successful', text: res.data?.message || 'Welcome' });
                const params = new URLSearchParams(location.search);
                const next = params.get('next') || '/';
                navigate(next);
            } else {
                Swal.fire({ icon: 'error', title: 'Login failed', text: res?.data?.message || 'Invalid credentials' });
            }
        },
        onError: (err) => {
            Swal.fire({ icon: 'error', title: 'Login failed', text: err?.message || 'Network error' });
        },
    });

    const onSubmit = (data) => mutation.mutate(data);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 dark:text-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Sign In</h2>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-1">Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 dark:text-gray-300" />
                        </div>
                        <input
                            type="email"
                            {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } })}
                            className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring focus:ring-blue-300"
                        />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faLock} className="text-gray-400 dark:text-gray-300" />
                        </div>
                        <input
                            type="password"
                            {...register("password", { required: "Password is required" })}
                            className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring focus:ring-blue-300"
                        />
                    </div>
                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>

                <button type="submit" disabled={mutation.isLoading} className="w-full bg-blue-500 dark:bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition">
                    {mutation.isLoading ? 'Signing in...' : 'Sign In'}
                </button>
                

                <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">Don't have an account? <a className="text-blue-600 dark:text-blue-400" href="/sign-up">Sign up</a></p>
            </form>
        </div>
    );
};

export default SignIn;
