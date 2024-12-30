import { useEffect, useState } from 'react';
import { SearchBar, Userbox } from '../index.jsx';

export default function Chats() {
  const [chat, setChats] = useState([]);

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
          //console.log(data.data);
          setChats(data.data); // Adjust based on your API response structure

        } else {
          console.error('Failed to fetch chats:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching chats:', error.message);
      }
    };

    fetchChats();
  }, []);

  return (
    <div className="outer_box bg-white w-full h-full flex rounded-x shadow-md">
      <div className="chat_box flex-[4] w-full h-full rounded-l-xl flex flex-col">
        <SearchBar />
        <div className="chat_list overflow-y-auto">
          {chat.length > 0 ? (
            chat.map((chatItem) => (
              <Userbox key={chatItem._id}  userdata={chatItem} unseenmessages={1} />
            ))
          ) : (
            <p className="text-center text-gray-500">No chats available</p>
          )}
         
        </div>
      </div>
      <div className="Message_box flex-[6] h-full rounded-r-xl">
        {/* Message display area */}
      </div>
    </div>
  );
}
