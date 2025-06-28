import React, { useEffect, useState, useRef, useCallback } from "react";
import io from "socket.io-client";
import { FiSend, FiCornerUpLeft } from "react-icons/fi";

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
    const [replyToMessage, setReplyToMessage] = useState(null);
    const [highlightedMsgId, setHighlightedMsgId] = useState(null);
    const messageRefs = useRef({});

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

                    console.log("userId:", data.data.participants[0]._id);

                } else {
                    console.error("Failed to fetch chat name:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching chat name:", error.message);
            }
        }
        getChatName(chatId);
    }, [chatId]);

    // Move fetchMessages to top-level so it can be called from sendMessage
    const fetchMessages = async () => {
        try {
            console.log("Fetching messages for chatId:", chatId);
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
                if (chatData.data.length > 0) {
                    setMessages(chatData.data);
                }
            } else {
                console.error("Failed to fetch chat messages:", chatResponse.statusText);
            }
        } catch (error) {
            console.error("Error fetching chat messages:", error.message);
        }
    };

    // Update useEffect to use fetchMessages
    useEffect(() => {
        if (chatId) {
            fetchMessages();
        }
    }, [chatId]);

    // Join chat room when recipientID is set
    useEffect(() => {
        if (recipientID && socketRef.current) {
            socketRef.current.emit("join chat", chatId);
        }
    }, [recipientID, chatId,replyToMessage ]);

    //Typing indicator logic
    

    // Handle incoming messages
    useEffect(() => {
        if (!socketRef.current) return;
        
        socketRef.current.on("message received", (newMessage) => {
            console.log("Message received:", newMessage);
            if (newMessage?.message) {
                addMessage(newMessage.message);
                setIsTyping(false); // Stop typing on new message
            }
        });

        socketRef.current.on("typing", (data) => {
            console.log("Typing event received from:", data);
           
            setIsTyping(true);
            clearTimeout(typingTimeout.current);
            typingTimeout.current = setTimeout(() => {
                setIsTyping(false);
            }, 3000); 
        });

        socketRef.current.on("stop typing", (data) => {
            if (data=== recipientID) {
                console.log("Stop typing event received from:", data);
                setIsTyping(false);
                clearTimeout(typingTimeout.current);
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
            socketRef.current.off("typing");
            socketRef.current.off("stop typing");
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

    // Add useEffect to reset replyToMessage and messageInput on chatId change
    useEffect(() => {
        setReplyToMessage(null);
        setMessageInput("");
    }, [chatId]);

    // Deduplicate messages by _id
    const addMessage = (newMsg) => {
        setMessages((prev) => {
            if (!newMsg || !newMsg._id) return prev;
            if (prev.some((m) => m._id === newMsg._id)) return prev;
            return [...prev, newMsg];
        });
    };

    // send Messages
    const sendMessage = async () => {
        if (!messageInput.trim() || !recipientID) return;
        try {
            let url = `/api/v1/message/sendIndividualMessage/${recipientID}`;
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
                socketRef.current.emit("new message", { 
                    message: data.data.message || data.data, 
                    reciever: recipientID 
                });
                // Instead of addMessage, refetch all messages to get populated repliedTo
                fetchMessages();
                setMessageInput("");
                setReplyToMessage(null);
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
        
        if (!socketRef.current || !recipientID) return;
        
        // Emit typing event
        socketRef.current.emit("typing", recipientID );
        
        // Clear existing timeout
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }
        
        // Set new timeout to stop typing
        typingTimeout.current = setTimeout(() => {
            socketRef.current.emit("stop typing", recipientID );
        }, 1500); // Stop typing after 1.5 seconds of inactivity
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
                    messages.map((message, idx) => {
                        let isCurrentUser = (message.sender?._id === currentUserID || message.sender === currentUserID);
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
                        // Only show reply icon on hover or for received messages
                        const showReplyIcon = !isCurrentUser;
                        // Assign ref for scroll-to-original
                        const msgId = message._id;
                        return (
                            <div
                                key={msgId}
                                ref={el => { if (msgId) messageRefs.current[msgId] = el; }}
                                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} w-full ${extraMargin} ${highlightedMsgId === msgId ? 'bg-yellow-100 transition-colors duration-500' : ''}`}
                                onMouseEnter={() => setHighlightedMsgId(msgId)}
                                onMouseLeave={() => setHighlightedMsgId(null)}
                            >
                                {/* Avatar for received messages */}
                                {!isCurrentUser && showAvatar && (
                                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold mr-2 text-sm self-end">
                                        <img src={profilePic} alt="Profile" className="w-full h-full rounded-full" />
                                    </div>
                                )}
                                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                    {/* Show replied-to message preview if present */}
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
                                    <div
                                        className={`relative px-4 py-2 rounded-3xl shadow-lg text-sm break-words whitespace-pre-line group ${
                                            isCurrentUser
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-900 border border-gray-200'
                                        }`}
                                        style={{ wordBreak: 'break-word', minWidth: '60px' }}
                                    >
                                        <span className="block pr-10 mr-3">{message.content || '[No content]'}</span>
                                        {/* Timestamp inside bubble, bottom-right, lighter and with padding */}
                                        {timeString && (
                                            <span className="absolute bottom-1 right-2 text-[10px] text-gray-400 font-medium select-none" style={{letterSpacing: '0.5px', paddingRight: '2px'}}>{timeString}</span>
                                        )}
                                        {/* Reply icon - show on hover for all messages */}
                                        <FiCornerUpLeft
                                            className="absolute left-[-28px] top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            size={18}
                                            title="Reply"
                                            onClick={() => setReplyToMessage(message)}
                                        />
                                    </div>
                                </div>
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
              <div className="flex items-center px-6 py-2 text-blue-500 text-sm font-medium mb-1" style={{ minHeight: '28px' }}>
                <span className="mr-2">{recipientName || 'Someone'} typing...</span>
                <span className="flex space-x-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </div>
            )}
            {/* Sticky Input */}
            <div className="message_input_box w-full flex flex-col bg-white border-t border-gray-200 px-4 pt-2 pb-2 sticky bottom-0 z-10">
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
        </div>
    );
}

export default ChatBox;
