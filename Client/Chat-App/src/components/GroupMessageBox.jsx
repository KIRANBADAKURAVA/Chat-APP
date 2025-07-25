import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { FiSend, FiCornerUpLeft, FiX } from "react-icons/fi";
import { sendEncryptedGroupMessage } from '../utils/messageUtils';
import ReplyMessage from './ReplyMessage';

export default function GroupMessageBox({ chatId, currentUserID }) {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [chatName, setChatName] = useState("");
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const [replyTo, setReplyTo] = useState(null);

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
                        setMessages(data.data.messages);
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
            const data = await sendEncryptedGroupMessage(chatId, messageInput, currentUserID, socketRef, replyTo?._id);
            setMessages((prevMessages) => [...prevMessages, data.data]);
            setMessageInput("");
            setReplyTo(null); // Clear reply after sending
        } catch (error) {
            console.error("Error sending message:", error.message);
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
                    messages.map((message) => {
                        const isCurrentUser = message.sender?._id === currentUserID || message.sender === currentUserID;
                        return (
                            <div
                                key={message._id || Math.random()}
                                className={`flex items-end ${isCurrentUser ? "justify-end" : "justify-start"} group relative`}
                            >
                                {!isCurrentUser && (
                                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold mr-2 text-sm">
                                        {message.sender?.username ? message.sender.username[0]?.toUpperCase() : 'U'}
                                    </div>
                                )}
                                {/* Reply button for other user messages */}
                                {!isCurrentUser && (
                                    <button
                                        onClick={() => setReplyTo(message)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-gray-200 mr-1"
                                        title="Reply to message"
                                    >
                                        <FiCornerUpLeft className="w-4 h-4 text-gray-500" />
                                    </button>
                                )}
                                <div
                                    className={`max-w-xs px-4 py-2 rounded-2xl shadow-md text-sm break-words ${
                                        isCurrentUser
                                            ? "bg-blue-500 text-white rounded-br-none"
                                            : "bg-white text-gray-900 rounded-bl-none"
                                    }`}
                                >
                                    {/* Reply to message */}
                                    {message.replyTo && (
                                        <ReplyMessage 
                                            replyTo={message.replyTo}
                                            isCurrentUser={isCurrentUser}
                                            profilePic={message.sender?.profilePicture}
                                            userProfilePic={null}
                                            currentUserID={currentUserID}
                                        />
                                    )}
                                    {message.content}
                                </div>
                                {/* Reply button for self messages */}
                                {isCurrentUser && (
                                    <button
                                        onClick={() => setReplyTo(message)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-gray-200 ml-1"
                                        title="Reply to message"
                                    >
                                        <FiCornerUpLeft className="w-4 h-4 text-gray-500" />
                                    </button>
                                )}
                                {isCurrentUser && (
                                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold ml-2 text-sm">
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
            {/* Reply Indicator */}
            {replyTo && (
                <div className="w-full bg-blue-50 border-t border-blue-200 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center">
                        <FiCornerUpLeft className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm text-blue-700">
                            Replying to: {replyTo.content?.substring(0, 30)}...
                        </span>
                    </div>
                    <button
                        onClick={() => setReplyTo(null)}
                        className="p-1 hover:bg-blue-100 rounded-full"
                    >
                        <FiX className="w-4 h-4 text-blue-500" />
                    </button>
                </div>
            )}
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
