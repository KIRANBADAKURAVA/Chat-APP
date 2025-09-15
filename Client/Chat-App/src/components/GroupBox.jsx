import { FiSearch } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import GroupChatBox from './GroupChatBox';

function GroupBox({ setGroupbox , currentUserID}) {
  const [user, setUser] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const [groupname, setGroupname] = useState('');
  const [groupchat, setGroupchat] = useState(false);

  useEffect(() => {
    async function getUsers() {
      try {
        const response = await fetch('/api/v1/user/getallusers', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          const userList= data.data.filter((user)=>(user._id!==currentUserID))
          setUser(userList);
        } else {
          setError('Failed to fetch users. Please try again.');
        }
      } catch (error) {
        setError('An error occurred while fetching users.');
      } finally {
        setLoading(false);
      }
    }

    getUsers();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  const filteredUsers = user.filter((userItem) =>
    userItem.username.toLowerCase().includes(searchTerm)
  );

  
  if (loading) return <p className="text-center text-gray-500 dark:text-gray-400">Loading users...</p>;
  if (error)
    return (
      <div className="text-center text-red-500">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-white bg-blue-500 dark:bg-blue-600 px-4 py-2 rounded-md mt-2 hover:bg-blue-600 dark:hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );


    // create group
    const handleSubmit = async () => {
        try {
          // Ensure groupname and members are valid
          if (!groupname || members.length === 0) {
            alert('Please provide a valid group name and add at least one member.');
            return;
          }

          
      
          const response = await fetch('/api/v1/chat/creategroupchat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accesstoken')}`,
            },
            body: JSON.stringify({ groupName: groupname, participants: members }),
          });
      
          if (response.ok) {
            const data = await response.json();
            console.log('Group Chat:', data);
            setGroupbox(false)
          } else {
            const errorData = await response.json();
            console.error('Error:', errorData);
            alert(`Failed to create group chat: ${errorData.message || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred while creating the group chat. Please try again.');
        }
      };
      

  return !groupchat ? (
    <div className="group-box absolute inset-0 z-30 p-6 bg-white dark:bg-dark-secondary w-full h-full rounded-lg shadow-lg flex flex-col transition-colors duration-300">
      <input
        type="text"
        placeholder="Enter Group Name"
        value={groupname}
        onChange={(e) => setGroupname(e.target.value)}
        className="bg-gray-100 dark:bg-dark-tertiary outline-none text-gray-700 dark:text-dark-text text-lg w-full p-3 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-colors duration-300"
      />
      <div className="flex justify-between mt-auto">
        <button
          onClick={() => setGroupbox(false)}
          className="text-white font-semibold bg-red-500 dark:bg-red-600 py-3 px-6 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors duration-300"
        >
          Close
        </button>
        <button
          onClick={() => setGroupchat(true)}
          disabled={!groupname}
          className={`text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 ${
            groupname
              ? 'bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700'
              : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  ) : (
    <div className="group-box absolute inset-0 z-30 p-6 bg-white dark:bg-dark-secondary w-full h-full rounded-lg shadow-lg flex flex-col transition-colors duration-300">
      <div className="flex items-center bg-gray-100 dark:bg-dark-tertiary rounded-full px-4 py-2 w-full shadow-sm mb-4">
        <input
          type="text"
          placeholder="Search for users"
          onChange={(e) => handleSearch(e.target.value)}
          className="bg-transparent outline-none text-gray-700 dark:text-dark-text text-lg w-full focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-colors duration-300"
        />
        <FiSearch className="text-gray-500 dark:text-gray-400 text-xl" />
      </div>

      <div className="chat_list flex flex-col items-center justify-start overflow-y-auto max-h-[calc(100%-160px)]">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((userItem) => (
            <button
              key={userItem._id}
              className="w-full flex justify-between items-center p-4 mb-2 rounded-lg bg-gray-100 dark:bg-dark-tertiary hover:bg-gray-200 dark:hover:bg-dark-border transition-colors duration-300"
            >
              <GroupChatBox userdata={userItem} members={members} setMembers={setMembers} />
            </button>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No users found. Try another search term.</p>
        )}
      </div>

      <div className="w-full flex items-center justify-between mt-auto">
        <button
          onClick={() => setGroupbox(false)}
          className="text-white font-semibold bg-red-500 dark:bg-red-600 py-3 px-6 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors duration-300"
        >
          Close
        </button>
        <button
          className="text-white font-semibold bg-green-500 dark:bg-green-600 py-3 px-6 rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-colors duration-300"
        onClick={handleSubmit}
        >
          Create Group
        </button>
      </div>
    </div>
  );
}

export default GroupBox;
