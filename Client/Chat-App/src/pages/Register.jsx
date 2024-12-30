import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import Logo from '../components/Logo'; // Ensure this component is imported correctly

function Register() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const [profilePic, setProfilePic] = useState(null);
    const [loading, setLoading] = useState(false); // Loading state

    const handleProfilePicChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setProfilePic(file);
        } else {
            setError("Please upload a valid image file.");
        }
    };

    const registerUser = async (data) => {
        setLoading(true); // Start loading
        try {
            const formData = new FormData();
            formData.append('username', data.username);
            formData.append('password', data.password);
            if (profilePic) {
                formData.append('profilePicture', profilePic);
            }

            const response = await fetch('http://localhost:9000/api/v1/user/register', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Registration failed. Please try again.');
            }

            const regData = await response.json();

            if (regData.success) {
                setError('');
                setLoading(false); 
                navigate('/login');
            } else {
                setError(regData.message || "Registration failed.");
                setLoading(false); // Stop loading
            }
        } catch (err) {
            setError(err.message || "An error occurred during registration.");
            setLoading(false); // Stop loading
        }
    };

    return (
        <div className='flex items-center justify-center w-full'>
            <div className='mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10'>
                <div className="mb-2 flex justify-center">
                    <span className="inline-block w-full max-w-[100px]">
                        <Logo width="100%" />
                    </span>
                </div>
                <h2 className="text-center text-2xl font-bold leading-tight">Create an account</h2>
                <p className="mt-2 text-center text-base text-black/60">
                    Already have an account?&nbsp;
                    <Link
                        to="/login"
                        className="font-medium text-primary transition-all duration-200 hover:underline"
                    >
                        Sign In
                    </Link>
                </p>
                {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
                <form onSubmit={handleSubmit(registerUser)} className='mt-8'>
                    <div className='space-y-5'>
                        <div className='w-full'>
                            <label className='inline-block mb-1 pl-1' htmlFor="username">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                {...register("username", { required: "Username is required" })}
                                className="px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full"
                            />
                            {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                        </div>

                        <div className='w-full'>
                            <label className='inline-block mb-1 pl-1' htmlFor="password">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                {...register("password", { required: "Password is required" })}
                                className="px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full"
                            />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                        </div>

                        <div className='w-full'>
                            <label className='inline-block mb-1 pl-1' htmlFor="profilePicture">
                                Profile Picture
                            </label>
                            <input
                                type="file"
                                id="profilePicture"
                                accept="image/*"
                                onChange={handleProfilePicChange}
                                className="px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full"
                            />
                            {profilePic && <p className="text-green-500 text-sm">File selected: {profilePic.name}</p>}
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                            disabled={loading} // Disable button while loading
                        >
                            {loading ? "Signing Up..." : "Sign Up"} {/* Show loading text */}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
