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
          console.log(data);
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

      navigate('/login')
      
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
        const data = await response.json();
       // console.log(data);
        navigate('/all-chats');
      } else {
        console.error('Failed to create chat:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating chat:', error.message);
    }
  };

  const handleSearch = async (term)=>{ 

    try {
      const response = await fetch(`http://localhost:9000/api/v1/user/searchuser?username=${term}`, {
        method: 'GET',

        headers: {
          'Content-Type': 'application/json',
        },  
      });

      if(response.ok){
        const data = await response.json();
        setUser(data.data)
        
      }
      else{
        console.error('Failed to fetch users:', response.statusText);
      }

    } catch (error) {
      console.error('Error fetching users:', error.message);
    }
  }


      
  
  
  return (
    <div className="container mx-auto p-6 flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-blue-600 text-white font-bold text-lg text-center">
          All Users
        </div>

       
        <div className="p-4">
           {/* Search box */}
          <div className="flex items-center bg-purple-100 rounded-full px-4 py-2 w-full shadow-sm m-2">
               {/* Search Icon */}
              
         
               {/* Search Input */}
               <input
                 type="text"
                 placeholder="Search"
                 onKeyPress={(e)=> e.key === 'Enter' && handleSearch(e.target.value)}
                 className="ml-2 bg-transparent outline-none text-gray-600 text-sm w-full"
               />
                <FiSearch className="text-gray-500 text-lg" />
             </div>
          <div className="mt-4 space-y-2 flex justify-evenly transition-transform">
            {user.length > 0 ? (
              user.map((userItem) => (
                <button
                onClick={() => handleChatClick(userItem)}
                >
                    <div
                  key={userItem._id}
                  onMouseEnter={() => setHoveredUserId(userItem._id)}
                  onMouseLeave={() => setHoveredUserId(null)}
                  className=" p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-300 ease-in-out shadow-sm"
                >
                  {/* Profile Icon */}
                  <div className="w-14 h-14 flex-shrink-0">
                    <img
                      src={userItem.profilePicture}
                      alt="profile"
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
                    />
                  </div>

                  {/* Chat Details */}
                  <div className="ml-4 flex-grow">
                    <div className="font-semibold text-gray-800">{userItem.username}</div>
                  </div>

                  {/* "Say Hi" Text */}
                  {hoveredUserId === userItem._id &&  (
                   authStatus?   <div className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-lg shadow-md ">
                   Say Hi
                 </div>:
                 
                 <div className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-lg shadow-md ">
                 Login
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
