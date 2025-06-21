import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { FiUserPlus } from 'react-icons/fi';

function Register() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const [profilePic, setProfilePic] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleProfilePicChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setProfilePic(file);
        } else {
            setError("Please upload a valid image file.");
        }
    };

    const registerUser = async (data) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', data.username);
            formData.append('password', data.password);
            if (profilePic) {
                formData.append('profilePicture', profilePic);
            }
            const response = await fetch('/api/v1/user/register', {
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
                setLoading(false);
            }
        } catch (err) {
            setError(err.message || "An error occurred during registration.");
            setLoading(false);
        }
    };

    return (
        <div className='flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-50 to-white'>
            <div className='mx-auto w-full max-w-md bg-white rounded-2xl p-8 md:p-10 shadow-lg flex flex-col items-center'>
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <FiUserPlus className="text-blue-600" size={32} />
                </div>
                <h2 className="text-center text-3xl font-extrabold text-blue-700 mb-2">Create your account</h2>
                <p className="mb-6 text-center text-base text-gray-500">
                    Join us and start chatting instantly.<br />
                    <span className="text-sm text-gray-400">Already have an account?&nbsp;
                        <Link to="/login" className="font-medium text-blue-600 hover:underline">Sign In</Link>
                    </span>
                </p>
                {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit(registerUser)} className='w-full space-y-5'>
                    <div>
                        <label className='block mb-1 pl-1 font-medium text-gray-700' htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            {...register("username", { required: "Username is required" })}
                            className="px-4 py-2 rounded-lg bg-gray-50 text-black outline-none focus:ring-2 focus:ring-blue-200 border border-gray-200 w-full transition"
                        />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                    </div>
                    <div>
                        <label className='block mb-1 pl-1 font-medium text-gray-700' htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            {...register("password", { required: "Password is required" })}
                            className="px-4 py-2 rounded-lg bg-gray-50 text-black outline-none focus:ring-2 focus:ring-blue-200 border border-gray-200 w-full transition"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                    </div>
                    <div>
                        <label className='block mb-1 pl-1 font-medium text-gray-700' htmlFor="profilePicture">Profile Picture</label>
                        <input
                            type="file"
                            id="profilePicture"
                            accept="image/*"
                            onChange={handleProfilePicChange}
                            className="px-4 py-2 rounded-lg bg-gray-50 text-black outline-none focus:ring-2 focus:ring-blue-200 border border-gray-200 w-full transition"
                        />
                        {profilePic && (
                            <div className="flex items-center mt-2">
                                <img
                                    src={URL.createObjectURL(profilePic)}
                                    alt="Profile Preview"
                                    className="w-10 h-10 rounded-full object-cover border border-gray-300 mr-2"
                                />
                                <span className="text-green-600 text-sm">{profilePic.name}</span>
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold text-lg shadow transition duration-200"
                        disabled={loading}
                    >
                        {loading ? "Signing Up..." : "Sign Up"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;
