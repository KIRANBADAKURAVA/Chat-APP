import React, { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function AllUsers() {
  const [user, setUser] = useState([]);
  const [hoveredUserId, setHoveredUserId] = useState(null);
  const navigate = useNavigate();

  const authStatus = useSelector((state) => state.auth.status);

  useEffect(() => {
    async function getUsers() {
      try {
        const response = await fetch('http://localhost:9000/api/v1/user/getallusers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
        } else {
          console.error('Failed to fetch users:', response.statusText);
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

    try {
      const response = await fetch(`http://localhost:9000/api/v1/message/sendIndividualMessage/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accesstoken')}`,
        },
        body: JSON.stringify({ content: `Hi ${user.username}` }),
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
      const response = await fetch(`http://localhost:9000/api/v1/user/searchuser?username=${term}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        console.error('Failed to fetch users:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching users:', error.message);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-blue-600 text-white font-bold text-lg text-center rounded-t-lg">
          All Users
        </div>

        {/* Search Box */}
        <div className="p-4">
          <div className="flex items-center bg-purple-100 rounded-full px-4 py-2 w-full shadow-sm mb-4">
            <input
              type="text"
              placeholder="Search"
              onChange={(e) => handleSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e.target.value)}
              className="ml-2 bg-transparent outline-none text-gray-600 text-sm w-full"
            />
            <FiSearch className="text-gray-500 text-lg" />
          </div>

          {/* User List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {user.length > 0 ? (
              user.map((userItem) => (
                <button key={userItem._id} onClick={() => handleChatClick(userItem)}>
                  <div
                    onMouseEnter={() => setHoveredUserId(userItem._id)}
                    onMouseLeave={() => setHoveredUserId(null)}
                    className="flex items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-300 ease-in-out shadow-sm"
                  >
                    <div className="w-14 h-14 flex-shrink-0">
                      <img
                        src={userItem.profilePicture}
                        alt="profile"
                        className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="font-semibold text-gray-800">{userItem.username}</div>
                    </div>
                    {hoveredUserId === userItem._id && (
                      <div className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-lg shadow-md">
                        {authStatus ? 'Say Hi' : 'Login to Chat'}
                      </div>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center text-gray-500">No Users Available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllUsers;
