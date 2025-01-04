import { useEffect, useState } from 'react';
import { ChatBox, SearchBar, Userbox } from '../index.jsx';
import { FiSearch } from 'react-icons/fi';
import { set } from 'mongoose';


export default function Chats() {
  const [chat, setChats] = useState([]);
  const [currentUserID, setCurrentUserID] = useState(null);
  const [chatID, setChatID] = useState(null);
  
  // fetch chats
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
          //console.log(data.data);
          
        } else {
          console.error('Failed to fetch chats:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching chats:', error.message);
      }
    };

    fetchChats();
  }, []);

  

    


  // fetch messages
  const handleChatClick = async (chatId) => {
  
   setChatID(chatId);
  };

  // fetch current user
  async function getCurrentUser() {
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
         //console.log(data.data._id);
        setCurrentUserID(data.data._id);
      } else {
        console.error('Failed to fetch user:', response.statusText);
        return null; // Return null or handle as needed
      }
    } catch (error) {
      console.error('Error fetching user:', error.message);
      return null; // Handle errors appropriately
    }
  }

  getCurrentUser()
  const chat1 = chat;
  const handleSearch = async (term)=>{
  
if(term === ''){
  setChats(chat1)
  return;
}
   

    const filteredChats = chat1.filter((chatItem) => {
      return chatItem.participants[0].username.toLowerCase().includes(term.toLowerCase());
    });

    setChats(filteredChats);

  }


 

  return (
    <div className="outer_box bg-white w-full h-full flex rounded-x shadow-md">
      {/* Chat List Section */}
      <div className="chat_box flex-[4] w-full h-full rounded-l-xl flex flex-col">
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
        <div className="chat_list overflow-y-auto">
          {chat.length > 0 ? (
            chat.map((chatItem) => (
              console.log(chatItem),
              <button
                key={chatItem._id}
                className="w-full text-left p-2 hover:bg-gray-100"
                onClick = {() => {  
                  handleChatClick(chatItem._id)
                 
                }}
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
        
          <ChatBox currentUserID={currentUserID} chatId={chatID} />
         
      </div>
    </div>
  );
}
