import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { FiSend } from "react-icons/fi";
import { use } from "react";

// E2EE Helper Functions
async function importRSAPublicKey(spkiB64) {
    const binaryDer = Uint8Array.from(atob(spkiB64), c => c.charCodeAt(0));
    return await window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["encrypt"]
    );
}
async function generateAESKey() {
    return await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}
async function encryptMessageWithAES(aesKey, message) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(message);
    const ciphertext = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        encoded
    );
    return { ciphertext, iv };
}
async function encryptAESKeyWithRSA(publicKey, aesKey) {
    const rawAESKey = await window.crypto.subtle.exportKey("raw", aesKey);
    return await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        rawAESKey
    );
}
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

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

    //Typing indicator logic
    

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

    // send Messages
    const sendMessage = async () => {
        if (!messageInput.trim() || !recipientID) return;
        try {
            // 1. Fetch recipient's public key
            const userRes = await fetch(`/api/v1/user/getallusers`, {
                headers: { 'Content-Type': 'application/json' }
            });
            const userList = await userRes.json();
            console.log('All users:', userList.data.map(u => ({
                id: u._id,
                username: u.username,
                hasPublicKey: !!u.publicKey
            })));
            
            const recipient = userList.data.find(u => u._id === recipientID);
            console.log('Selected recipient:', {
                id: recipient?._id,
                username: recipient?.username,
                hasPublicKey: !!recipient?.publicKey
            });
            
            if (!recipient || !recipient.publicKey) {
                throw new Error('Recipient public key not found. They may need to re-register their account to enable encryption.');
            }
            const recipientPublicKey = await importRSAPublicKey(recipient.publicKey);
            // 2. Generate AES key
            const aesKey = await generateAESKey();
            // 3. Encrypt message with AES
            const { ciphertext, iv } = await encryptMessageWithAES(aesKey, messageInput);
            // 4. Encrypt AES key with recipient's public RSA key
            const encryptedAESKey = await encryptAESKeyWithRSA(recipientPublicKey, aesKey);
            // 5. Send encrypted payload
            const response = await fetch(
                `/api/v1/message/sendIndividualMessage/${recipientID}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                    },
                    body: JSON.stringify({
                        encryptedMessage: arrayBufferToBase64(ciphertext),
                        encryptedAESKey: arrayBufferToBase64(encryptedAESKey),
                        iv: arrayBufferToBase64(iv)
                    }),
                }
            );
            if (response.ok) {
                const data = await response.json();
                // Emit message with correct structure
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
