import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CiLogin } from "react-icons/ci";
import { FaRegRegistered } from "react-icons/fa";
import { BsChatSquare } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { logout } from "../store/authSilce";
import { useDispatch } from "react-redux";

const navIconSize = 22;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authStatus = useSelector((state) => state.auth.status);
  const dispatch = useDispatch();

  const navItems = [
    {
      name: "Login",
      status: !authStatus,
      icon: <CiLogin size={navIconSize} />,
      path: "/login",
    },
    {
      name: "Register",
      status: !authStatus,
      icon: <FaRegRegistered size={navIconSize} />,
      path: "/register",
    },
    {
      name: "All-chats",
      status: authStatus,
      icon: <BsChatSquare size={navIconSize} />,
      path: "/all-chats",
    },
    {
      name: "Users",
      status: true,
      icon: <FaUsers size={navIconSize} />,
      path: "/users",
    },
  ];

  const handleNavigate = (item) => {
    navigate(item.path);
  };

  const logoutfn = (e) => {
    e.preventDefault();
    localStorage.clear();
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="flex flex-col h-full w-full items-center justify-between bg-white shadow-none border-none">
      {/* Logo at the top */}
      <div className="mt-8 mb-8">
        <Link to="/">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg shadow-md hover:scale-105 transition-transform">
            <span className="text-white font-extrabold text-xl tracking-wider">C</span>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <ul className="flex-1 flex flex-col items-center justify-center space-y-4 w-full">
        {navItems.map(
          (item) =>
            item.status && (
              <li key={item.name} className="w-full flex justify-center">
                <button
                  onClick={() => handleNavigate(item)}
                  className={`flex flex-col md:flex-row items-center md:justify-start w-10 md:w-32 py-2 md:px-2 rounded-md transition group
                    ${location.pathname === item.path ? "bg-blue-100 text-blue-700 shadow" : "hover:bg-blue-50 text-gray-700"}`}
                  title={item.name}
                >
                  <span className="text-lg mb-1 md:mb-0 group-hover:text-blue-600">{item.icon}</span>
                  <span className="hidden md:inline ml-2 text-base font-medium group-hover:text-blue-600">{item.name}</span>
                </button>
              </li>
            )
        )}
      </ul>

      {/* Logout at the bottom */}
      {authStatus && (
        <button
          onClick={logoutfn}
          className="mb-8 w-10 md:w-32 py-2 md:px-2 flex flex-col md:flex-row items-center justify-center md:justify-start rounded-md bg-red-500 hover:bg-red-600 transition text-white shadow text-base font-semibold"
        >
          <span className="text-base md:mr-2">Logout</span>
        </button>
      )}
    </nav>
  );
};

export default Header;
