import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { FiSend } from "react-icons/fi";

function ChatBox({ currentUserID, chatId }) {
    const [messageInput, setMessageInput] = useState("");
    const [recipientID, setRecipientID] = useState(null);
    const [recipientName, setRecipientName] = useState(""); 
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);
    const [chatName, setChatName] = useState("");
    const [chat , setChat] = useState({})
    const messagesEndRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    const [lastSeen, setLastSeen] = useState(null); // Mocked for now
    const typingTimeout = useRef(null);

    const ENDPOINT = ""; // Not needed for proxy

    // Initialize socket connection
    useEffect(() => {
        socketRef.current = io(ENDPOINT, {
            transports: ["websocket"],
            upgrade: false,
        });
        return () => {
            socketRef.current.disconnect();
        };
    }, []);

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
                    setChatName(data.data.participants[0].username)
                    // Mock last seen: 2 minutes ago
                    setLastSeen(Date.now() - 2 * 60 * 1000);
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
                            const recID = chatData.data[0].reciever[0]._id;
                            setRecipientID(recID);
                            setRecipientName(chatData.data[0].reciever[0].username);
                            setMessages(chatData.data);
                            // Fetch real lastSeen for recipient
                            try {
                              const usersRes = await fetch('/api/v1/user/getallusers', {
                                headers: { 'Content-Type': 'application/json' }
                              });
                              if (usersRes.ok) {
                                const usersData = await usersRes.json();
                                const found = usersData.data.find(u => u._id === recID);
                                if (found && found.lastSeen) {
                                  setLastSeen(new Date(found.lastSeen).getTime());
                                } else {
                                  setLastSeen(Date.now() - 2 * 60 * 1000); // fallback mock
                                }
                              } else {
                                setLastSeen(Date.now() - 2 * 60 * 1000); // fallback mock
                              }
                            } catch {
                              setLastSeen(Date.now() - 2 * 60 * 1000); // fallback mock
                            }
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
        if (recipientID) {
            socketRef.current.emit("setup", { _id: recipientID });
            socketRef.current.emit("join chat", recipientID);
        }
    }, [recipientID]);

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
        socketRef.current.on("message received", (newMessage) => {
            if (newMessage?.message) {
                setMessages((prevMessages) => [...prevMessages, newMessage.message]);
                setIsTyping(false); // Stop typing on new message
            }
        });
        return () => {
            socketRef.current.off("message received");
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
        if (!messageInput.trim()) return;
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
                socketRef.current.emit("new message", { message: data.data.message });
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

    // Format last seen (mocked)
    const getLastSeenText = () => {
        if (!lastSeen) return null;
        const diff = Math.floor((Date.now() - lastSeen) / 60000);
        if (diff < 1) return "Online";
        if (diff === 1) return "Last seen 1 minute ago";
        return `Last seen ${diff} minutes ago`;
    };

    return (
        <div className="chat_box w-full h-full flex flex-col bg-gray-50 rounded-lg shadow-lg">
            {/* Sticky Chat Header */}
            <div className="chat_header w-full p-4 bg-blue-600 text-white flex items-center rounded-t-lg sticky top-0 z-10 shadow-md">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold mr-3">
                  {/* Avatar Placeholder */}
                  {chatName ? chatName[0]?.toUpperCase() : 'C'}
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold truncate">{ chatName || "Chat"}</h2>
                  <span className="text-xs text-blue-100 font-normal">{getLastSeenText()}</span>
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
                                    {recipientName ? recipientName[0]?.toUpperCase() : 'U'}
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
                                    You
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
              <div className="px-6 py-2 text-blue-500 text-sm font-medium animate-pulse">{recipientName || 'User'} is typing…</div>
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
