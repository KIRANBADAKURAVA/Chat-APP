import React, { useEffect, useState, useRef, useCallback } from "react";
import io from "socket.io-client";
import { FiSend, FiCornerUpLeft } from "react-icons/fi";

export default function GroupMessageBox({ chatId, currentUserID }) {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [chatName, setChatName] = useState("");
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const ENDPOINT = ""; // Not needed for proxy
    const [replyToMessage, setReplyToMessage] = useState(null);
    const [highlightedMsgId, setHighlightedMsgId] = useState(null);
    const messageRefs = useRef({});

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

    // Update useEffect to use fetchMessages
    useEffect(() => {
        if (chatId) {
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
            let url = `/api/v1/message/sendGroupMessage/${chatId}`;
            let body = { content: messageInput };
            if (replyToMessage) {
                url = `/api/v1/message/replyMessage/${chatId}`;
                body.replyTo = replyToMessage._id;
            }
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                },
                body: JSON.stringify(body),
            });
            if (response.ok) {
                const data = await response.json();
                socketRef.current.emit("new message", { message: data.data.message || data.data });
                fetchMessages();
                setMessageInput("");
                setReplyToMessage(null);
            } else {
                console.error("Failed to send message:", response.statusText);
            }
        } catch (error) {
            console.error("Error sending group message:", error.message);
        }
    };

    const handleReplyPreviewClick = useCallback((replyToId) => {
        const ref = messageRefs.current[replyToId];
        if (ref) {
            ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedMsgId(replyToId);
            setTimeout(() => setHighlightedMsgId(null), 1200);
        }
    }, []);

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
                        // Assign ref for scroll-to-original
                        const msgId = message._id;
                        return (
                            <div
                                key={msgId || Math.random()}
                                ref={el => { if (msgId) messageRefs.current[msgId] = el; }}
                                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} w-full ${extraMargin} ${highlightedMsgId === msgId ? 'bg-yellow-100 transition-colors duration-500' : ''}`}
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
                                        {/* Reply icon */}
                                        <FiCornerUpLeft
                                            className="absolute left-[-28px] top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-500"
                                            size={18}
                                            title="Reply"
                                            onClick={() => setReplyToMessage(message)}
                                        />
                                    </div>
                                    {message.repliedTo && message.repliedTo[0] && (
                                        <div
                                            className={`flex flex-col px-2 py-1 mb-1 rounded-lg cursor-pointer transition-colors duration-150 ${
                                                isCurrentUser ? 'border-l-4 border-green-400 bg-green-50 hover:bg-green-100' : 'border-l-4 border-blue-400 bg-blue-50 hover:bg-blue-100'
                                            }`}
                                            onClick={() => handleReplyPreviewClick(message.repliedTo[0]._id)}
                                            title="Go to original message"
                                        >
                                            {message.repliedTo[0].sender?.username && (
                                                <span className="text-xs font-semibold text-gray-700">
                                                    {message.repliedTo[0].sender.username}
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-600 whitespace-pre-line line-clamp-2">{message.repliedTo[0].content}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-gray-400">No messages available</p>
                )}
                <div ref={messagesEndRef} />
            </div>
            {/* Sticky Input */}
            <div className="w-full flex flex-col bg-white border-t border-gray-200 px-4 pt-2 pb-2 sticky bottom-0 z-10">
                {replyToMessage && (
                    <div className="flex items-center mb-2 px-3 py-2 bg-gray-50 border-l-4 border-blue-500 rounded-r-lg shadow-sm max-w-[80%]">
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-xs font-semibold text-gray-700">Replying to {replyToMessage.sender?.username || 'Unknown'}</span>
                            <span className="text-xs text-gray-600 whitespace-pre-line line-clamp-2">{replyToMessage.content || '[No content]'}</span>
                        </div>
                        <button 
                            onClick={() => setReplyToMessage(null)} 
                            className="ml-2 text-xs text-red-400 hover:text-red-600 font-bold transition-colors duration-150"
                        >
                            ✕
                        </button>
                    </div>
                )}
                <div className="w-full flex items-center">
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
        </div>
    );
}
