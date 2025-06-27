import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { FiSend } from "react-icons/fi";

export default function GroupMessageBox({ chatId, currentUserID }) {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [chatName, setChatName] = useState("");
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
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

    // Fetch chat details
    useEffect(() => {
        async function getChatDetails(chatId) {
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
                    setChatName(data.data.chatName || "Group Chat");
                } else {
                    console.error("Failed to fetch chat details:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching chat details:", error.message);
            }
        }
        getChatDetails(chatId);
    }, [chatId]);

    // Fetch chat messages
    useEffect(() => {
        if (chatId) {
            const fetchMessages = async () => {
                try {
                    const response = await fetch(
                        `/api/v1/chat/getallmessages/${chatId}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                            },
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        setMessages(data.data);
                    } else {
                        console.error("Failed to fetch messages:", response.statusText);
                    }
                } catch (error) {
                    console.error("Error fetching messages:", error.message);
                }
            };

            fetchMessages();
        }
    }, [chatId]);

    // Join chat room
    useEffect(() => {
        if (chatId) {
            socketRef.current.emit("setup", { _id: chatId });
            socketRef.current.emit("join chat", chatId);
        }
    }, [chatId]);

    // Handle incoming messages
    useEffect(() => {
        socketRef.current.on("message received", (newMessage) => {
            if (newMessage?.message) {
                setMessages((prevMessages) => [...prevMessages, newMessage.message]);
            }
        });

        return () => {
            socketRef.current.off("message received");
        };
    }, [chatId]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Send message
    const sendMessage = async () => {
        if (!messageInput.trim()) return;
        try {
            const response = await fetch(
                `/api/v1/message/sendGroupMessage/${chatId}`,
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
                setMessages((prevMessages) => [
                    ...prevMessages,
                    data.data.message
                ]);
                setMessageInput("");
            } else {
                console.error("Failed to send message:", response.statusText);
            }
        } catch (error) {
            console.error("Error sending group message:", error.message);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-50 rounded-lg shadow-lg">
            {/* Sticky Group Chat Header */}
            <div className="w-full p-4 bg-blue-600 text-white flex items-center rounded-t-lg sticky top-0 z-10 shadow-md">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold mr-3">
                    {chatName ? chatName[0]?.toUpperCase() : 'G'}
                </div>
                <h2 className="text-lg font-semibold truncate">{chatName || "Group Chat"}</h2>
            </div>
            {/* Scrollable Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-2 bg-gray-100">
                {messages.length > 0 ? (
                    messages.map((message, idx) => {
                        const isCurrentUser = message.sender?._id === currentUserID || message.sender === currentUserID;
                        // Format timestamp
                        let timeString = '';
                        if (message.createdAt) {
                            const date = new Date(message.createdAt);
                            timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }
                        // Show avatar only if previous message is from a different sender
                        const showAvatar = !isCurrentUser && (idx === 0 || (messages[idx-1]?.sender?._id !== message.sender?._id && messages[idx-1]?.sender !== message.sender));
                        // Add extra margin if previous message is from a different sender
                        const extraMargin = idx === 0 || (messages[idx-1]?.sender?._id !== message.sender?._id && messages[idx-1]?.sender !== message.sender) ? 'mt-4' : 'mt-1';
                        return (
                            <div
                                key={message._id || Math.random()}
                                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} w-full ${extraMargin}`}
                            >
                                {/* Avatar for received messages */}
                                {!isCurrentUser && showAvatar && (
                                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold mr-2 text-sm self-end">
                                        {message.sender?.username ? message.sender.username[0]?.toUpperCase() : 'U'}
                                    </div>
                                )}
                                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                    <div
                                        className={`relative px-4 py-2 rounded-2xl shadow-md text-sm break-words whitespace-pre-line ${
                                            isCurrentUser
                                                ? 'bg-blue-600 text-white rounded-br-md rounded-tr-2xl rounded-tl-2xl'
                                                : 'bg-gray-200 text-gray-900 rounded-bl-md rounded-tr-2xl rounded-tl-2xl border border-gray-200'
                                        }`}
                                        style={{ wordBreak: 'break-word', minWidth: '60px' }}
                                    >
                                        <span className="block pr-8">{message.content}</span>
                                        {/* Timestamp inside bubble, bottom-right, small and light */}
                                        {timeString && (
                                            <span className={`absolute text-[10px] text-gray-300 bottom-1 right-3 ${isCurrentUser ? '' : 'left-3 right-auto'}`}>{timeString}</span>
                                        )}
                                    </div>
                                </div>
                                {/* Avatar for sent messages (optional, usually not shown in WhatsApp) */}
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-gray-400">No messages available</p>
                )}
                <div ref={messagesEndRef} />
            </div>
            {/* Sticky Input */}
            <div className="w-full h-16 flex items-center bg-white border-t border-gray-200 px-4 sticky bottom-0 z-10">
                <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
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
