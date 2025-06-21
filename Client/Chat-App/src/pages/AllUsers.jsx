import React, { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const MOCK_USERS = [
  {
    _id: 'mock1',
    username: 'Alice',
    profilePicture: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    _id: 'mock2',
    username: 'Bob',
    profilePicture: 'https://randomuser.me/api/portraits/men/65.jpg',
  },
  {
    _id: 'mock3',
    username: 'Charlie',
    profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    _id: 'mock4',
    username: 'Diana',
    profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    _id: 'mock5',
    username: 'Eve',
    profilePicture: 'https://randomuser.me/api/portraits/women/12.jpg',
  },
  {
    _id: 'mock6',
    username: 'Frank',
    profilePicture: 'https://randomuser.me/api/portraits/men/23.jpg',
  },
];

function AllUsers() {
  const [user, setUser] = useState([]);
  const [hoveredUserId, setHoveredUserId] = useState(null);
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);

  useEffect(() => {
    async function getUsers() {
      try {
        const response = await fetch('/api/v1/user/getallusers', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.data && data.data.length > 0 ? data.data : MOCK_USERS);
        } else {
          setUser(MOCK_USERS);
        }
      } catch (error) {
        setUser(MOCK_USERS);
      }
    }
    getUsers();
  }, []);

  const handleChatClick = async (user) => {
    if (!authStatus) {
      navigate('/login');
      return;
    }
    try {
      const response = await fetch('/api/v1/message/sendIndividualMessage/' + user._id, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('accesstoken'),
        },
        body: JSON.stringify({ content: 'Hi ' + user.username }),
      });
      if (response.ok) {
        navigate('/all-chats');
      } else {
        console.error('Failed to create chat:', response.statusText);
      }
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
        setUser(data.data && data.data.length > 0 ? data.data : MOCK_USERS);
      } else {
        setUser(MOCK_USERS);
      }
    } catch (error) {
      setUser(MOCK_USERS);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start bg-gradient-to-br from-blue-50 to-white p-0 md:p-4">
      <div className="w-full max-w-5xl mx-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 py-6 px-2 md:px-0">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
            <FaUsers className="text-blue-600" size={28} />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700 tracking-tight">All Users</h1>
        </div>

        {/* Search Box */}
        <div className="flex items-center bg-white rounded-full px-4 py-2 shadow border border-gray-200 w-full max-w-md mb-8 mx-auto">
          <FiSearch className="text-gray-400 text-xl mr-2" />
          <input
            type="text"
            placeholder="Search users..."
            onChange={(e) => handleSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e.target.value)}
            className="bg-transparent outline-none text-gray-700 text-base w-full"
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
                  className="flex flex-col items-center p-6 rounded-2xl bg-white hover:bg-blue-50 transition duration-200 shadow border border-gray-100 relative group"
                >
                  <div className="w-16 h-16 mb-3">
                    {userItem.profilePicture ? (
                      <img
                        src={userItem.profilePicture}
                        alt="profile"
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-400 shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-2xl">
                        {userItem.username ? userItem.username[0].toUpperCase() : '?'}
                      </div>
                    )}
                  </div>
                  <div className="font-semibold text-gray-800 text-lg mb-1 truncate w-full text-center">{userItem.username}</div>
                  {hoveredUserId === userItem._id && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white font-medium bg-blue-600 px-4 py-2 rounded-full shadow-lg animate-fade-in">
                      {authStatus ? 'Say Hi 👋' : 'Login to Chat'}
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <p className="text-center text-gray-400 col-span-full">No Users Available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllUsers;
