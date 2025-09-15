import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { login as authLogin } from "../store/authSilce";
import { FiLock } from "react-icons/fi";
import logoImage from "../assets/Chat-App-logo-nobg.png";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState("");

  const login = async (data) => {
    try {
      const response =  await fetch("/api/v1/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      });
      if (!response.ok) {
        throw new Error("Login failed. Please check your credentials.");
      }
      const logindata = await response.json();
      if (logindata.success) {
        localStorage.setItem("accesstoken", logindata.data.user.accesstoken);
        localStorage.setItem("refreshtoken", logindata.data.user.refreshtoken);
        dispatch(authLogin(logindata.data.user));
        setError("");
        navigate("/all-chats");
      } else {
        setError(logindata.message || "Login failed.");
      }
    } catch (err) {
      setError(err.message || "An error occurred during login.");
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-50 to-white dark:from-dark-primary dark:to-dark-secondary transition-colors duration-300">
      <div className="mx-auto w-full max-w-md bg-white dark:bg-dark-secondary rounded-2xl p-8 md:p-10 shadow-lg flex flex-col items-center transition-colors duration-300">
        <div className="flex items-center justify-center w-20 h-20 mb-4">
          <img 
            src={logoImage} 
            alt="Chat App Logo" 
            className="w-full h-full object-contain"
            style={{
              transform: 'perspective(1000px) rotateY(5deg) rotateX(5deg)',
            }}
          />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-blue-700 dark:text-blue-400 mb-2">Sign in</h2>
        <p className="mb-6 text-center text-base text-gray-500 dark:text-dark-textSecondary">
          Welcome back! Please enter your details.<br />
          <span className="text-sm text-gray-400 dark:text-gray-500">Don&apos;t have an account?&nbsp;
            <Link to="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">Sign Up</Link>
          </span>
        </p>
        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit(login)} className="w-full space-y-5">
          <div>
            <label className="block mb-1 pl-1 font-medium text-gray-700 dark:text-dark-text" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              {...register("username", { required: "Username is required" })}
              className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-dark-tertiary text-black dark:text-dark-text outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500 border border-gray-200 dark:border-dark-border w-full transition"
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <label className="block mb-1 pl-1 font-medium text-gray-700 dark:text-dark-text" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              {...register("password", { required: "Password is required" })}
              className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-dark-tertiary text-black dark:text-dark-text outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500 border border-gray-200 dark:border-dark-border w-full transition"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-semibold text-lg shadow transition duration-200"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
