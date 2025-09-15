import { useEffect, useState } from 'react';
import { ChatBox, Userbox, GroupBox } from '../index.jsx';
import { FiSearch } from 'react-icons/fi';
import GroupMessageBox from '../components/GroupMessageBox.jsx';
import { BsChatRightText } from "react-icons/bs";

export default function Chats() {
  const [chat, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [currentUserID, setCurrentUserID] = useState(null);
  const [chatID, setChatID] = useState(null);
  const [groupbox, setGroupbox] = useState(false);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [userProfilePic, setuserProfilePic] = useState('');
  // Fetch all chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('/api/v1/chat/getallchats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accesstoken')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setChats(data.data);
          setFilteredChats(data.data);
        } else {
          console.error('Failed to fetch chats:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching chats:', error.message);
      }
    };

    fetchChats();
  }, []); 

  // Fetch current user
  useEffect(() => {
    const getCurrentUser = async () => {
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
          setCurrentUserID(data.data._id);
          setuserProfilePic(data.data.profilePicture);
        } else {
          console.error('Failed to fetch user:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching user:', error.message);
      }
    };

    getCurrentUser();
  }, []);

  // Handle chat click
  const handleChatClick = (chat) => {
    setChatID(chat._id);
    setIsGroupChat(chat.isGroupChat);
  };

  // Handle search
  const handleSearch = (term) => {
    const filtered = chat.filter((chatItem) =>
      chatItem.participants.some((participant) =>
        participant.username.toLowerCase().includes(term.toLowerCase())
      )
    );
    setFilteredChats(filtered);
  };

  // Message box handler
  const messageBoxContent = isGroupChat ? (
    <GroupMessageBox chatId={chatID} currentUserID={currentUserID} />
  ) : (
    <ChatBox  userProfilePic= {userProfilePic} chatId={chatID} currentUserID={currentUserID} />
  );

  return (
    <div className="flex w-full h-full bg-transparent rounded-2xl shadow-lg overflow-hidden md:mt-2 md:mb-2 md:ml-0 md:mr-0">
      {/* Left Panel: Chat List */}
      <div className="hidden md:flex flex-col flex-[3] max-w-xs bg-white dark:bg-dark-secondary h-full border-r border-gray-200 dark:border-dark-border relative transition-colors duration-300">
        {/* Search Bar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-dark-secondary p-4 border-b border-gray-100 dark:border-dark-border transition-colors duration-300">
          <div className="flex items-center bg-gray-100 dark:bg-dark-tertiary rounded-full px-3 py-2 shadow-sm">
            <FiSearch className="text-gray-500 dark:text-gray-400 text-lg mr-2" />
            <input
              type="text"
              placeholder="Search chats..."
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent outline-none text-gray-700 dark:text-dark-text text-sm w-full"
            />
          </div>
        </div>

        {/* Group Box Toggle */}
        {groupbox ? (
          <GroupBox setGroupbox={setGroupbox} chat={chat} currentUserID={currentUserID} />
        ) : (
          <button
            onClick={() => setGroupbox(true)}
            className="absolute bottom-6 right-6 h-12 w-12 flex items-center justify-center bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            title="Create Group Chat"
          >
            <BsChatRightText size={24} />
          </button>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredChats.length > 0 ? (
            filteredChats.map((chatItem) => (
              <button
                key={chatItem._id}
                className="w-full text-left p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-dark-tertiary transition flex items-center"
                onClick={() => handleChatClick(chatItem)}
              >
                <Userbox userdata={chatItem} />
              </button>
            ))
          ) : (
            <p className="text-center text-gray-400 dark:text-gray-500 mt-8">No chats available</p>
          )}
        </div>
      </div>

      {/* Right Panel: Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-dark-primary transition-colors duration-300">
        {/* Mobile Chat List Toggle (optional for future) */}
        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full">
          {messageBoxContent}
        </div>
      </div>
    </div>
  );
}
