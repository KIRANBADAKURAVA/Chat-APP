import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {Logo} from "../index"
import { CiLogin } from "react-icons/ci";
import { FaRegRegistered } from "react-icons/fa";
import { BsChatSquare } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";

const Header = () => {
  const authStatus = useSelector((state) => state.auth.status);

  const navItems = [
    {
      name: "Login",
      status: !authStatus,
      html_element: <CiLogin />,
    },
    {
      name: "Register",
      status: !authStatus,
      html_element: <FaRegRegistered />,
    },
    {
      name: "All chats",
      status: authStatus,
      html_element: <BsChatSquare />,
    },
    {
      name: "Users",
      status: true,
      html_element: <FaUsers />,
    },
    {
      name: "Profile",
      status: authStatus,
      html_element: <CgProfile />,
    },
  ];

  return (
    <div className="header h-screen flex flex-col justify-start text-center bg-black text-white rounded-3xl p-4">
      {/* Top Header Section */}
      <div className="header__top w-full  h-24 rounded-3xl">
      <Link to='/'>
            <div>
              <b>Logo</b>
            </div>

              </Link>
      </div>
      
      {/* Navigation Items */}
      <div className="nav-items mt-4 flex flex-col items-center space-y-6">
        {navItems.map((item) => {
          if (item.status) {
            return (
              <div className="rounded-2xl p-3 hover:bg-blue-300 transition">
                <div
                key={item.name}
                className="flex flex-col items-center text-white"
              >
                <div className="icon text-2xl">{item.html_element}</div>
                <div className="name mt-2">{item.name}</div>
              </div>
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Logout */}
     {
      authStatus?  <div className="logout mt-auto p-4 text-center text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer">
      Logout
    </div>: null
     }
    </div>
  );
};

export default Header;
