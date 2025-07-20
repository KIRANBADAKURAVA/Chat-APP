import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { FiSend, FiCornerUpLeft, FiX } from "react-icons/fi";
import { sendEncryptedIndividualMessage, stopTyping, startTyping } from '../utils/messageUtils';
import { decryptMessage } from '../EncryptionUtils/Decrypt.utils.js'
import ReplyMessage from './ReplyMessage';

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
    const [decryptedMessages, setDecryptedMessages] = useState([]);
    const [replyTo, setReplyTo] = useState(null);
    
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
                        if (isMounted && chatData.data.messages) {
                            setMessages(chatData.data.messages);
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

    // Handle incoming messages
    useEffect(() => {
        if (!socketRef.current) return;
        
        socketRef.current.on("message received", (newMessage) => {
            if (newMessage?.message) {
                setMessages((prevMessages) => [...prevMessages, newMessage.message]);
                setIsTyping(false); // Stop typing on new message
            }
        });

        socketRef.current.on("typing", (data) => {
            setIsTyping(true);
            clearTimeout(typingTimeout.current);
            typingTimeout.current = setTimeout(() => {
                setIsTyping(false);
            }, 3000); 
        });

        socketRef.current.on("stop typing", (data) => {
            if (data=== recipientID) {
                setIsTyping(false);
                clearTimeout(typingTimeout.current);
            }
        });

        socketRef.current.on("connected", () => {
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

    // send Messages
    const sendMessage = async () => {
        if (!messageInput.trim() || !recipientID) return;
        try {
            const data = await sendEncryptedIndividualMessage(recipientID, messageInput, currentUserID, socketRef, replyTo?._id);
            setMessages((prevMessages) => [...prevMessages, data.data.message]);
            setMessageInput("");
            setReplyTo(null); // Clear reply after sending
            stopTyping(recipientID, socketRef);
        } catch (error) {
            console.error("Error sending message:", error.message);
        }
    };

    // Typing event handlers
    const handleInputChange = (e) => {
        setMessageInput(e.target.value);
        
        if (!socketRef.current || !recipientID) return;
        
        // Start typing indicator
        startTyping(recipientID, socketRef);
        
        // Clear existing timeout
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }
        
        // Set new timeout to stop typing
        typingTimeout.current = setTimeout(() => {
            stopTyping(recipientID, socketRef);
        }, 1500); // Stop typing after 1.5 seconds of inactivity
    };

    useEffect(() => {
        async function decryptAll() {
            const results = await Promise.all(
                (messages || []).map(async (message) => {
                    let decryptedContent;
                    try {
                        decryptedContent = await decryptMessage(
                            message.content,
                            message.encryptedKeys?.[currentUserID],
                            message.iv
                        );
                    } catch (e) {
                        decryptedContent = "[Failed to decrypt]";
                    }
                    return { ...message, decryptedContent };
                })
            );
            setDecryptedMessages(results);
        }
        if (messages && messages.length > 0) {
            decryptAll();
        } else {
            setDecryptedMessages([]);
        }
    }, [messages, currentUserID]);

    return (
        <div className="chat_box w-full h-full flex flex-col bg-gray-50 rounded-lg shadow-lg">
            {/* Sticky Chat Header */}
            <div className="chat_header w-full p-4 bg-blue-600 text-white flex items-center rounded-t-lg sticky top-0 z-10 shadow-md">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold mr-3">
                 <img src={profilePic} alt="Profile" className="w-full h-full rounded-full" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold truncate">{ chatName || "Chat"}</h2>
                </div>
            </div>
            {/* Scrollable Messages */}
            <div className="message_display_area w-full flex-grow bg-gray-100 overflow-y-auto p-4 flex flex-col space-y-2">
                {decryptedMessages.length > 0 ? (
                    decryptedMessages.map((message) => {
                        let isCurrentUser = (message.sender?._id === currentUserID || message.sender === currentUserID);
                        return (
                                                                                        <div
                                key={message._id || Math.random()}
                                className={`flex items-end ${isCurrentUser ? "justify-end" : "justify-start"} group relative`}
                            >
                                {!isCurrentUser && (
                                  <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold mr-2 text-sm">
                                    <img src={profilePic} alt="Profile" className="w-full h-full rounded-full" />
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
                                            profilePic={profilePic}
                                            userProfilePic={userProfilePic}
                                            currentUserID={currentUserID}
                                        />
                                    )}
                                    {message.decryptedContent}
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
              <div className="flex items-center px-6 py-2 text-blue-500 text-sm font-medium mb-1" style={{ minHeight: '28px' }}>
                <span className="mr-2">{recipientName || 'Someone'} typing...</span>
                <span className="flex space-x-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </div>
            )}
            {/* Reply Indicator */}
            {replyTo && (
                <div className="w-full bg-blue-50 border-t border-blue-200 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center">
                        <FiCornerUpLeft className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm text-blue-700">
                            Replying to: {(replyTo.decryptedContent || replyTo.content)?.substring(0, 30)}...
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
