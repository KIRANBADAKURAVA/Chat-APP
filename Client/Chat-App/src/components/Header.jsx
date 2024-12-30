import React from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { CiLogin } from "react-icons/ci";
import { FaRegRegistered } from "react-icons/fa";
import { BsChatSquare } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { logout } from "../store/authSilce";
import { useDispatch } from "react-redux";


const Header = () => {
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);
  const dispatch= useDispatch()
  
  
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
      name: "All-chats",
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

  const handleNavigate = (item) => {
    navigate(`/${item.name.toLowerCase()}`); // Ensure the path is valid
  };

  const logoutfn= (e)=>{
    e.preventDefault();

    localStorage.clear();

    dispatch(logout())
    navigate('/')


  }

  return (
    <div className="header h-screen flex flex-col justify-start text-center bg-black text-white rounded-3xl p-4">
      {/* Top Header Section */}
      <div className="header__top w-full h-24 rounded-3xl">
        <Link to="/">
          <div>
            <b>Logo</b>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="nav-items mt-4 flex flex-col items-center space-y-6">
        {navItems.map((item) =>
          item.status ? (
            <div
              key={item.name} 
              className="rounded-2xl p-3 hover:bg-blue-300 transition"
            >
              <button
                onClick={() => handleNavigate(item)} // Wrap in an arrow function
                className="flex flex-col items-center text-white"
              >
                <div className="icon text-2xl">{item.html_element}</div>
                <div className="name mt-2">{item.name}</div>
              </button>
            </div>
          ) : null
        )}
      </div>

      {/* Logout */}
      {authStatus && (
        <button 
        onClick={logoutfn}
        className="logout mt-auto p-4 text-center text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer">
          Logout
        </button>
      )}
    </div>
  );
};

export default Header;
