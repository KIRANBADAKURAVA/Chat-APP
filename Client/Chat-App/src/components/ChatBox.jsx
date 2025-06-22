import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { FiSend } from "react-icons/fi";

function ChatBox({userProfilePic, currentUserID, chatId }) {
    const [messageInput, setMessageInput] = useState("");
    const [recipientID, setRecipientID] = useState(null);
    const [recipientName, setRecipientName] = useState(""); 
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);
    const [chatName, setChatName] = useState("");
    const messagesEndRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeout = useRef(null);
    const [profilePic, setProfilePic] = useState("");
    const ENDPOINT = ""; // Not needed for proxy
    
    // Initialize socket connection
    useEffect(() => {
        socketRef.current = io(ENDPOINT, {
            transports: ["websocket"],
            upgrade: false,
        });

        // Setup socket with current user ID
        if (currentUserID) {
            socketRef.current.emit("setup", { _id: currentUserID });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [currentUserID]);

    // get chatname
    useEffect(() => {
        async function getChatName(chatId) {
            try {
                const response = await fetch(`/api/v1/chat/getchatbyid/${chatId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log("Chat data fetched:", data.data.participants);
                    setChatName(data.data.participants[0].username)
                    setRecipientID(data.data.participants[0]._id);
                    setRecipientName(data.data.participants[0].username);
                    setProfilePic(data.data.participants[0].profilePicture );

                } else {
                    console.error("Failed to fetch chat name:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching chat name:", error.message);
            }
        }
        getChatName(chatId);
    }, [chatId]);

    // Fetch chat messages and set recipient ID
    useEffect(() => {
        if (chatId) {
            let isMounted = true;
            const fetchMessages = async () => {
                try {
                    const chatResponse = await fetch(
                        `/api/v1/chat/getallmessages/${chatId}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                            },
                        }
                    );
                    if (chatResponse.ok) {
                        const chatData = await chatResponse.json();
                        if (isMounted && chatData.data.length > 0) {
                            console.log("Chat data fetched:", chatData.data);
                           
                            console.log(chatData.data[0].reciever[0].username);
                           
                            setMessages(chatData.data);
                        }
                    } else {
                        console.error("Failed to fetch chat messages:", chatResponse.statusText);
                    }
                } catch (error) {
                    console.error("Error fetching chat messages:", error.message);
                }
            };
            fetchMessages();
            return () => {
                isMounted = false;
            };
        }
    }, [chatId]);

    // Join chat room when recipientID is set
    useEffect(() => {
        if (recipientID && socketRef.current) {
            socketRef.current.emit("join chat", chatId);
        }
    }, [recipientID, chatId]);

    // Typing indicator logic
    useEffect(() => {
        if (!socketRef.current) return;
        socketRef.current.on("typing", () => setIsTyping(true));
        socketRef.current.on("stop typing", () => setIsTyping(false));
        return () => {
            socketRef.current.off("typing");
            socketRef.current.off("stop typing");
        };
    }, []);

    // Handle incoming messages
    useEffect(() => {
        if (!socketRef.current) return;
        
        socketRef.current.on("message received", (newMessage) => {
            console.log("Message received:", newMessage);
            if (newMessage?.message) {
                setMessages((prevMessages) => [...prevMessages, newMessage.message]);
                setIsTyping(false); // Stop typing on new message
            }
        });

        socketRef.current.on("connected", () => {
            console.log("Socket connected successfully");
        });

        socketRef.current.on("error", (error) => {
            console.error("Socket error:", error);
        });

        return () => {
            socketRef.current.off("message received");
            socketRef.current.off("connected");
            socketRef.current.off("error");
        };
    }, [chatId]);

    // Scroll to bottom on new message
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // send Messages
    const sendMessage = async () => {
        if (!messageInput.trim() || !recipientID) return;
        try {
            const response = await fetch(
                `/api/v1/message/sendIndividualMessage/${recipientID}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                    },
                    body: JSON.stringify({ content: messageInput }),
                }
            );
            if (response.ok) {
                const data = await response.json();
                // Emit message with correct structure
                console.log('Message sent to ' + recipientID + ':', data.data.message);
                socketRef.current.emit("new message", { 
                    message: data.data.message, 
                    reciever: recipientID 
                });
                setMessages((prevMessages) => [...prevMessages, data.data.message]);
                setMessageInput("");
                socketRef.current.emit("stop typing", { to: recipientID });
            } else {
                console.error("Failed to send message:", response.statusText);
            }
        } catch (error) {
            console.error("Error sending message:", error.message);
        }
    };

    // Typing event handlers
    const handleInputChange = (e) => {
        setMessageInput(e.target.value);
        if (!socketRef.current) return;
        socketRef.current.emit("typing", { to: recipientID });
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            socketRef.current.emit("stop typing", { to: recipientID });
        }, 1500);
    };

    return (
        <div className="chat_box w-full h-full flex flex-col bg-gray-50 rounded-lg shadow-lg">
            {/* Sticky Chat Header */}
            <div className="chat_header w-full p-4 bg-blue-600 text-white flex items-center rounded-t-lg sticky top-0 z-10 shadow-md">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold mr-3">
                  {/* Avatar Placeholder */}
                 <img src={profilePic} alt="Profile" className="w-full h-full rounded-full" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold truncate">{ chatName || "Chat"}</h2>
                </div>
            </div>
            {/* Scrollable Messages */}
            <div className="message_display_area w-full flex-grow bg-gray-100 overflow-y-auto p-4 flex flex-col space-y-2">
                {messages.length > 0 ? (
                    messages.map((message) => {
                        let isCurrentUser = (message.sender?._id === currentUserID || message.sender === currentUserID);
                        return (
                            <div
                                key={message._id || Math.random()}
                                className={`flex items-end ${isCurrentUser ? "justify-end" : "justify-start"}`}
                            >
                                {!isCurrentUser && (
                                  <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold mr-2 text-sm">
                                    {/* Sender Avatar Placeholder */}
                                  
                                    <img src={profilePic} alt="Profile" className="w-full h-full rounded-full" />
                                  </div>
                                )}
                                <div
                                    className={`max-w-xs px-4 py-2 rounded-2xl shadow-md text-sm break-words ${
                                        isCurrentUser
                                            ? "bg-blue-500 text-white rounded-br-none"
                                            : "bg-white text-gray-900 rounded-bl-none"
                                    }`}
                                >
                                    {message.content}
                                </div>
                                {isCurrentUser && (
                                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold ml-2 text-sm">
                                    {/* User Avatar Placeholder */}
                                    <img src={userProfilePic} alt="User Profile" className="w-full h-full rounded-full" />
                                  </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-gray-400">No messages available</p>
                )}
                <div ref={messagesEndRef} />
            </div>
            {/* Typing Indicator */}
            {isTyping && (
              <div className="px-6 py-2 text-blue-500 text-sm font-medium animate-pulse">{recipientName || 'here'} is typing…</div>
            )}
            {/* Sticky Input */}
            <div className="message_input_box w-full h-16 flex items-center bg-white border-t border-gray-200 px-4 sticky bottom-0 z-10">
                <input
                    type="text"
                    value={messageInput}
                    onChange={handleInputChange}
                    className="flex-grow h-10 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring focus:ring-blue-400"
                    placeholder="Type a message..."
                    onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                />
                <button
                    className="ml-4 p-3 text-2xl bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 transition"
                    onClick={sendMessage}
                >
                    <FiSend />
                </button>
            </div>
        </div>
    );
}

export default ChatBox;
