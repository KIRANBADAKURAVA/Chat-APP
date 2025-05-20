import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { FiSend } from "react-icons/fi";

function GroupMessageBox({ currentUserID, chatId }) {
    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);
    const [chat, setChat] = useState({});
    const ENDPOINT = "https://chat-app-1-h2m8.onrender.com";

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
                const response = await fetch(`https://chat-app-1-h2m8.onrender.com/api/v1/chat/getchatbyid/${chatId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setChat(data.data);
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
                        `https://chat-app-1-h2m8.onrender.com/api/v1/chat/getallmessages/${chatId}`,
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

    // Send message
    const sendMessage = async () => {
        if (!messageInput.trim()) return;

        try {
            const response = await fetch(
                `https://chat-app-1-h2m8.onrender.com/api/v1/message/sendGroupMessage/${chatId}`,
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
                setMessages((prevMessages) => [...prevMessages, data.data]);
                setMessageInput("");
            } else {
                console.error("Failed to send message:", response.statusText);
            }
        } catch (error) {
            console.error("Error sending message:", error.message);
        }
    };

    return (
        <div className="chat_box w-full h-full flex flex-col bg-gray-50 rounded-lg shadow-lg">
            <div className="chat_header w-full p-6 bg-blue-600 text-white flex items-center px-4 rounded-t-lg">
                <h2 className="text-xl font-semibold">{chat.groupChatName || "Group Chat"}</h2>
            </div>
            <div className="message_display_area w-full flex-grow bg-gray-100 overflow-y-auto p-4">
                {messages.length > 0 ? (
                    messages.map((message) => {
                        const isCurrentUser = message.sender?._id === currentUserID || message.sender === currentUserID;
                        const senderProfilePic = message.sender?.profilePic || "https://via.placeholder.com/40";

                        return (
                            <div
                                key={message._id || Math.random()}
                                className={`message_box flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-center w-full mb-4`}
                            >
                                {!isCurrentUser && (
                                    <img
                                        src={senderProfilePic}
                                        alt="Profile"
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                )}
                                <div
                                    className={`message max-w-xs px-4 py-2 rounded-lg shadow-md ${
                                        isCurrentUser
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200 text-black"
                                    }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-gray-500">No messages available</p>
                )}
            </div>
            <div className="message_input_box w-full h-16 flex items-center bg-white border-t border-gray-300 px-4">
                <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="message_input flex-grow h-10 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring focus:ring-blue-400"
                    placeholder="Type a message..."
                />
                <button
                    className="message_send_button ml-4 p-3 text-2xl bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 transition"
                    onClick={sendMessage}
                >
                    <FiSend />
                </button>
            </div>
        </div>
    );
}

export default GroupMessageBox;
