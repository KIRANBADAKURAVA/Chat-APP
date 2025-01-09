import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { login as authLogin } from "../store/authSilce";
import Logo from "../components/Logo";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState("");

  const login = async (data) => {
    try {
      const response =  await fetch("https://chat-app-backend-ezj4.onrender.com/api/v1/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
        
        
      });
     // console.log(response);

      if (!response.ok) {
        throw new Error("Login failed. Please check your credentials.");
      }

      const logindata = await response.json();

      if (logindata.success) {
        // Store access token in localStorage
        localStorage.setItem("accesstoken", logindata.data.user.accesstoken);
        localStorage.setItem("refreshtoken", logindata.data.user.refreshtoken);

        // Store refresh token securely
        // Note: Secure cookies must be set by the server.
        dispatch(authLogin(logindata.data.user));
        setError(""); // Clear any existing errors
        navigate("/all-chats"); // Adjust route path to match your routing configuration
      } else {
        setError(logindata.message || "Login failed.");
      }
    } catch (err) {
      setError(err.message || "An error occurred during login.");
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10">
        <div className="mb-2 flex justify-center">
          <span className="inline-block w-full max-w-[100px]">
            <Logo width="100%" />
          </span>
        </div>
        <h2 className="text-center text-2xl font-bold leading-tight">Sign in to your account</h2>
        <p className="mt-2 text-center text-base text-black/60">
          Don&apos;t have an account?&nbsp;
          <Link
            to="/register"
            className="font-medium text-primary transition-all duration-200 hover:underline"
          >
            Sign Up
          </Link>
        </p>
        {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
        <form onSubmit={handleSubmit(login)} className="mt-8">
          <div className="space-y-5">
            <div className="w-full">
              <label className="inline-block mb-1 pl-1" htmlFor="username">
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
            <div className="w-full">
              <label className="inline-block mb-1 pl-1" htmlFor="password">
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

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
