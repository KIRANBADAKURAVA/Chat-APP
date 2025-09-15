import React , {useRef, useEffect}from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiLogIn } from "react-icons/fi";
import { FiUserPlus } from "react-icons/fi";
import { BsChatSquare } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { logout } from "../store/authSilce";
import { useDispatch } from "react-redux";
import logoImage from "../assets/Chat-APP-logo-nobg.png";
import { io } from "socket.io-client";

const navIconSize = 24;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authStatus = useSelector((state) => state.auth.status);
  const username = useSelector(state => state.auth.data?.user?.loggedUser.username);
  const userId = useSelector(state => state.auth.data?.user?.loggedUser._id);
  const dispatch = useDispatch();

  

  const navItems = [
    {
      name: "Login",
      status: !authStatus,
      icon: <FiLogIn size={navIconSize} />,
      path: "/login",
    },
    {
      name: "Register",
      status: !authStatus,
      icon: <FiUserPlus size={navIconSize} />,
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


  const ENDPOINT = ""; 

  const socketRef = useRef(null);

    useEffect(() => {
      socketRef.current = io(ENDPOINT, {
          transports: ["websocket"],
          upgrade: false,
      });

    
      return () => {
          if (socketRef.current) {
              socketRef.current.disconnect();

          }
      };
  }, []);

  const logoutfn = (e) => {
    e.preventDefault();
    console.log("Logging out user:", userId);
    if (socketRef.current) {
      console.log("Emitting set offline for user:", userId);
      socketRef.current.emit("set offline", userId);
    } 
    localStorage.clear();
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="flex flex-col h-full w-full items-center justify-between bg-white dark:bg-dark-secondary shadow-none border-none transition-colors duration-300">
      {/* Logo at the top */}
      <div className="mt-8 mb-8">
        <Link to="/">
          <div className="flex items-center justify-center w-28 h-28 hover:scale-110 transition-transform duration-300 transform rotate-3 hover:rotate-0">
            <img 
              src={logoImage} 
              alt="Chat App Logo" 
              className="w-full h-full object-contain"
              style={{
                transform: 'perspective(1000px) rotateY(5deg) rotateX(5deg)',
              }}
            />
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <ul className="flex-1 flex flex-col items-center justify-center space-y-6 w-full px-2">
        {navItems.map(
          (item) =>
            item.status && (
              <li key={item.name} className="w-full flex justify-center">
                <button
                  onClick={() => handleNavigate(item)}
                  className={`flex flex-col md:flex-row items-center md:justify-start w-12 md:w-36 py-3 md:px-4 rounded-xl transition-all duration-300 group relative overflow-hidden
                    ${location.pathname === item.path 
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105" 
                      : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-dark-tertiary dark:hover:to-dark-tertiary text-gray-700 dark:text-dark-text hover:text-blue-700 dark:hover:text-blue-400 hover:shadow-md"
                    }`}
                  title={item.name}
                >
                  <span className={`text-xl mb-2 md:mb-0 group-hover:scale-110 transition-transform duration-200 ${location.pathname === item.path ? 'text-white' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                    {item.icon}
                  </span>
                  <span className={`hidden md:inline ml-3 text-sm font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 ${location.pathname === item.path ? 'text-white' : ''}`}>
                    {item.name}
                  </span>
                  {/* Active indicator */}
                  {location.pathname === item.path && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              </li>
            )
        )}
      </ul>

      {/* User Info and Logout */}
      {authStatus && (
        <div className="mb-8 flex flex-col items-center">
          <div className="text-center mb-4">
            <span className="text-gray-800 dark:text-dark-text font-semibold text-sm">{username}</span>
          </div>
          <button
            onClick={logoutfn}
            className="w-12 md:w-36 py-3 md:px-4 flex flex-col md:flex-row items-center text-center justify-center md:justify-start rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 text-white shadow-md hover:shadow-lg transform hover:scale-105 text-sm font-semibold"
          >
            <span className="text-base md:mr-2">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Header;
