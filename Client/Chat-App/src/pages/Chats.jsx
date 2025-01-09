import { useEffect, useState } from 'react';
import { ChatBox, Userbox, GroupBox } from '../index.jsx';
import { FiSearch } from 'react-icons/fi';
import GroupMessageBox from '../components/GroupMessageBox.jsx';

export default function Chats() {
  const [chat, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [currentUserID, setCurrentUserID] = useState(null);
  const [chatID, setChatID] = useState(null);
  const [groupbox, setGroupbox] = useState(false);
  const [isGroupChat, setIsGroupChat] = useState(false);

  // Fetch all chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('http://localhost:9000/api/v1/chat/getallchats', {
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
        const response = await fetch('http://localhost:9000/api/v1/user/getuser', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accesstoken')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUserID(data.data._id);
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
    <ChatBox chatId={chatID} currentUserID={currentUserID} />
  );

  return (
    <div className="outer_box bg-white w-full h-full flex rounded-x shadow-md">
      {/* Chat List Section */}
      <div className="chat_box flex-[4] w-full h-full rounded-xl flex flex-col relative">
        {/* Search Bar */}
        <div className="flex items-center bg-purple-100 rounded-full px-4 py-2 w-full shadow-sm m-2">
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => handleSearch(e.target.value)}
            className="ml-2 bg-transparent outline-none text-gray-600 text-sm w-full"
          />
          <FiSearch className="text-gray-500 text-lg" />
        </div>

        {/* Group Box Toggle */}
        {groupbox ? (
          <GroupBox setGroupbox={setGroupbox} chat={chat} currentUserID={currentUserID} />
        ) : (
          <div
            onClick={() => setGroupbox(true)}
            className="h-16 w-8 bg-black absolute bottom-4 right-4 rounded-md flex items-center justify-center text-white font-bold cursor-pointer"
          >
            +
          </div>
        )}

        {/* Chat List */}
        <div className="chat_list overflow-y-auto">
          {filteredChats.length > 0 ? (
            filteredChats.map((chatItem) => (
              <button
                key={chatItem._id}
                className="w-full text-left p-2 hover:bg-gray-100"
                onClick={() => handleChatClick(chatItem)}
              >
                <Userbox userdata={chatItem} />
              </button>
            ))
          ) : (
            <p className="text-center text-gray-500">No chats available</p>
          )}
        </div>
      </div>

      {/* Messages Section */}
      <div className="Message_box flex-[6] h-full rounded-r-xl p-4 bg-gray-50">
     {messageBoxContent}
      </div>
    </div>
  );
}
