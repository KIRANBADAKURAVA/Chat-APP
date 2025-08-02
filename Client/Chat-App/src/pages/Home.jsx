import React from "react";
import Logo from "../components/Logo.jsx";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function Home() {
  const authStatus = useSelector((state) => state.auth.status);
  const user = useSelector((state) => state.auth.data?.user?.loggedUser);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-center py-12 bg-gradient-to-br from-blue-50 to-white">
      <div className="flex flex-col items-center mb-8">
        <Logo width="120px" height="120px" className="mb-6" />
        {authStatus && user && (
          <h2 className="text-2xl font-semibold text-blue-800 mb-2">Hi {user.username}</h2>
        )}
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4 tracking-tight drop-shadow">Welcome to Chat App</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-xl mb-6">
          Connect, chat, and collaborate in real time. Start a conversation or join a group chat to experience seamless communication with a modern, fresh interface.
        </p>
        {authStatus && user && (
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-2 shadow">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-400"
                />
              ) : (
                <span className="text-blue-700 font-bold text-3xl">
                  {user.username ? user.username[0].toUpperCase() : "?"}
                </span>
              )}
            </div>
            <span className="text-blue-800 font-semibold text-lg">{user.username}</span>
            <Link to="/profile" className="text-blue-500 hover:underline text-sm mt-1">View Profile</Link>
          </div>
        )}
        <Link
          to={authStatus ? "/all-chats" : "/login"}
          className="inline-block mt-4 px-8 py-3 bg-blue-600 text-white rounded-full shadow-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          {authStatus ? "Start Chatting" : "Login to Start Chatting"}
        </Link>
      </div>
      {/* Features Section */}
      <div className="w-full max-w-2xl mt-8 bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center border border-blue-100">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Why Choose Chat App?</h2>
        <ul className="text-left text-gray-700 space-y-3 w-full">
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span><span className="font-semibold text-blue-800">End-to-End Encryption:</span> Your messages are secured and private, only visible to you and your chat partners.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span><span className="font-semibold text-blue-800">Real-Time Messaging:</span> Enjoy instant, seamless conversations with friends and groups.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span><span className="font-semibold text-blue-800">Group Chats:</span> Create or join group chats for collaborative discussions and fun interactions.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span><span className="font-semibold text-blue-800">User Privacy:</span> Your profile and data are protected with strong security measures.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Home;