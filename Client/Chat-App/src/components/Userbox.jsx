import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
export default function Userbox({ userdata }) {
  const { participants = [], isGroupChat, chatName } = userdata;
  
  
  // For group chat, show group name; otherwise, show the other participant
  
  
  const displayName = isGroupChat
    ? chatName || "Group Chat"
    : participants[0]?.username || "User";

    console.log("Userbox data:", participants[0].profilePicture);

  const ENDPOINT = ""; 

  const socketRef = useRef(null);
  const [isOnline, setIsOnline] = useState(false);

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
  }, [userdata]);


    useEffect(() => {
      socketRef.current.emit("online", () => {
         // console.log("Online users:", onlineUsers);
      });

      socketRef.current.on("online list", (onlineUsers) => {

        const currentUserId= participants[0]._id;
        
        // console.log("Current user ID:", currentUserId);
        //   console.log("Online users list:", onlineUsers);

        if( onlineUsers.includes(currentUserId)) {
          setIsOnline(true);
          
        } else {
          setIsOnline(false);
        }

        return () => {
          socketRef.current.off("online list");
          socketRef.current.off("online");
        };
      });
  }, [userdata]);


  useEffect(() => {

    socketRef.current.on("offline", (userId) => {
      console.log(participants[0]._id, userId);
      if (participants[0]._id === userId) {
        setIsOnline(false);
      }
    });
  }, []);


  return (
    <div className="flex items-center space-x-3 p-2">
      {/* Avatar Placeholder */}
      <div className="relative w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg">
        <img
          src={participants[0]?.profilePicture || ""}
          alt="User Avatar"
          className="w-full h-full rounded-full object-cover"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-medium text-gray-900 truncate">{displayName}</span>
        {isGroupChat && (
          <span className="text-xs text-gray-500 truncate">Group</span>
        )}
      </div>
    </div>
  );
}