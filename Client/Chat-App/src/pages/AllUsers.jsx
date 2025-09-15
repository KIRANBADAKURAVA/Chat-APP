import React, { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { sendGreetingMessage } from '../utils/messageUtils';


function AllUsers() {
  const [user, setUser] = useState([]);
  const [hoveredUserId, setHoveredUserId] = useState(null);
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);
  const currentUserID = useSelector(state => state.auth.data?.user?.loggedUser?._id);

  useEffect(() => {
    async function getUsers() {
      try {
        const response = await fetch('/api/v1/user/getallusers', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.data );
        } 
      } catch (error) {
        console.error('Error fetching users:', error.message);
        
      }
    }
    getUsers();
  }, []);

  const handleChatClick = async (user) => {
    if (!authStatus) {
      navigate('/login');
      return;
    }
    
    console.log('Current user ID from Redux:', currentUserID);
    console.log('Recipient user:', user);
    
    // If currentUserID is not available from Redux, try to get it from the server
    let userId = currentUserID;
    if (!userId) {
    try {
        const response = await fetch('/api/v1/user/getuser', {
          method: 'GET',
        headers: {
          'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accesstoken')}`,
        },
      });
      if (response.ok) {
          const data = await response.json();
          userId = data.data._id;
          console.log('Current user ID from server:', userId);
        }
      } catch (error) {
        console.error('Failed to get current user from server:', error);
        return;
      }
    }
    
    if (!userId) {
      console.error('Current user ID is still undefined');
      return;
    }
    
    try {
      await sendGreetingMessage(user, userId);
      navigate('/all-chats');
    } catch (error) {
      console.error('Error creating chat:', error.message);
    }
  };

  const handleSearch = async (term) => {
    try {
      const response = await fetch('/api/v1/user/searchuser?username=' + term, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setUser( data.data );
      } else {
        console.error('Failed to search users:', response.statusText);
        setUser([]);
      }
    } catch (error) {
      console.error('Error searching users:', error.message);
      setUser([]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start bg-gradient-to-br from-blue-50 to-white dark:from-dark-primary dark:to-dark-secondary p-0 md:p-4 transition-colors duration-300">
      <div className="w-full max-w-5xl mx-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 py-6 px-2 md:px-0">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-dark-tertiary rounded-xl">
            <FaUsers className="text-blue-600 dark:text-blue-400" size={28} />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700 dark:text-blue-400 tracking-tight">All Users</h1>
        </div>

        {/* Search Box */}
        <div className="flex items-center bg-white dark:bg-dark-secondary rounded-full px-4 py-2 shadow border border-gray-200 dark:border-dark-border w-full max-w-md mb-8 mx-auto transition-colors duration-300">
          <FiSearch className="text-gray-400 dark:text-gray-500 text-xl mr-2" />
          <input
            type="text"
            placeholder="Search users..."
            onChange={(e) => handleSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e.target.value)}
            className="bg-transparent outline-none text-gray-700 dark:text-dark-text text-base w-full"
          />
        </div>

        {/* User List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {user.length > 0 ? (
            user.map((userItem) => (
              <button key={userItem._id} onClick={() => handleChatClick(userItem)} className="focus:outline-none">
                <div
                  onMouseEnter={() => setHoveredUserId(userItem._id)}
                  onMouseLeave={() => setHoveredUserId(null)}
                  className="flex flex-col items-center p-6 rounded-2xl bg-white dark:bg-dark-secondary hover:bg-blue-50 dark:hover:bg-dark-tertiary transition duration-200 shadow border border-gray-100 dark:border-dark-border relative group"
                >
                  <div className="w-16 h-16 mb-3">
                    {userItem.profilePicture ? (
                      <img
                        src={userItem.profilePicture}
                        alt="profile"
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-400 dark:border-blue-500 shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-200 dark:bg-dark-tertiary flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-2xl">
                        {userItem.username ? userItem.username[0].toUpperCase() : '?'}
                      </div>
                    )}
                  </div>
                  <div className="font-semibold text-gray-800 dark:text-dark-text text-lg mb-1 truncate w-full text-center">{userItem.username}</div>
                  {hoveredUserId === userItem._id && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white font-medium bg-blue-600 dark:bg-blue-500 px-4 py-2 rounded-full shadow-lg animate-fade-in">
                      {authStatus ? 'Say Hi 👋' : 'Login to Chat'}
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <p className="text-center text-gray-400 dark:text-gray-500 col-span-full">No Users Available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllUsers;
