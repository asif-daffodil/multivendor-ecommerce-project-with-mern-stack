import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Swal from 'sweetalert2'
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router';

const SignUp = () => {
    // React Hook Form setup
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

    useEffect(() => {
        if (isLoggedIn) navigate('/');
    }, [isLoggedIn, navigate]);

    // TanStack Query mutation for registration
        const setAuth = useAuthStore((s) => s.setAuth);

    const mutation = useMutation({
        mutationFn: async (data) => {
            const res = await axios.post("http://localhost:4000/auth/register", data);
            return res.data;
        },
        onSuccess: (data) => {
                // Save token and user to zustand store and cookies
                const token = data?.token;
                const user = data?.user;
                const role = user?.role;
                if (token) {
                    // set axios default header for future requests
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }
                setAuth({ token, role, user });
            Swal.fire({
                icon: 'success',
                title: 'Registration successful',
                text: 'You have been registered successfully!',
            }).then(() => {
                navigate('/');
            });
        },
        onError: (error) => {
            Swal.fire({
                icon: 'error',
                title: 'Registration failed',
                text: error.response?.data?.message || 'An error occurred',
                // timer: 2000,
                // showConfirmButton: false,
            });
        },
    });

    // Password match check
    const password = watch("password");

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white dark:bg-gray-800 dark:text-white p-8 rounded-lg shadow-lg w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
                    Register
                </h2>

                {/* Name */}
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-200 mb-1">Name</label>
                    <input
                        type="text"
                        {...register("name", { required: "Name is required" })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring focus:ring-blue-300"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm">{errors.name.message}</p>
                    )}
                </div>

                {/* Email */}
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-200 mb-1">Email</label>
                    <input
                        type="email"
                        {...register("email", {
                            required: "Email is required",
                            pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" },
                        })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring focus:ring-blue-300"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email.message}</p>
                    )}
                </div>

                {/* role user or vendor */}
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-200 mb-1">Role</label>
                    <select
                        {...register("role", { required: "Role is required" })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring focus:ring-blue-300"
                    >
                        <option value="">Select a role</option>
                        <option value="user">User</option>
                        <option value="vendor">Vendor</option>
                    </select>
                    {errors.role && (
                        <p className="text-red-500 text-sm">{errors.role.message}</p>
                    )}
                </div>

                {/* Password */}
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-200 mb-1">Password</label>
                    <input
                        type="password"
                        {...register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 6,
                                message: "Password must be at least 6 characters",
                            },
                        })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring focus:ring-blue-300"
                    />
                    {errors.password && (
                        <p className="text-red-500 text-sm">{errors.password.message}</p>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="mb-6">
                    <label className="block text-gray-700 dark:text-gray-200 mb-1">Confirm Password</label>
                    <input
                        type="password"
                        {...register("confirmPassword", {
                            required: "Please confirm your password",
                            validate: (value) =>
                                value === password || "Passwords do not match",
                        })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring focus:ring-blue-300"
                    />
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-sm">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={mutation.isLoading}
                    className="w-full bg-blue-500 dark:bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition"
                >
                    {mutation.isLoading ? "Registering..." : "Register"}
                </button>
            </form>
        </div>
    );
};

export default SignUp;
