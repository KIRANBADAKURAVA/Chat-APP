
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
    

    console.log("chatId", chatId);
    
    const ENDPOINT = "http://localhost:9000";

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
            const response = await fetch(`http://localhost:9000/api/v1/chat/getchatbyid/${chatId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                //console.log("chatname",data.data.participants[0].username  );
                setChatName(data.data.participants[0].username)
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
                        `http://localhost:9000/api/v1/chat/getallmessages/${chatId}`,
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
                            setRecipientID(chatData.data[0].reciever[0]._id);
                            setRecipientName(chatData.data[0].reciever[0].username);
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
        if (recipientID) {
            socketRef.current.emit("setup", { _id: recipientID });
            socketRef.current.emit("join chat", recipientID);
        }
    }, [recipientID]);

    // Handle incoming messages
    useEffect(() => {
        socketRef.current.on("message received", (newMessage) => {
            //console.log("New message received:", newMessage.message);
            if (newMessage?.message) {
                setMessages((prevMessages) => [...prevMessages, newMessage.message]);
            }
        });

        return () => {
            socketRef.current.off("message received");
        };
    }, [chatId]);

    // send Messages
    const sendMessage = async () => {
        if (!messageInput.trim()) return;

        try {
            const response = await fetch(
                `http://localhost:9000/api/v1/message/sendIndividualMessage/${recipientID}`,
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
                    //console.log("send method", data.data.message);  
                setMessages((prevMessages) => [...prevMessages, data.data.message]);
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
                <h2 className="text-xl font-semibold">{ chatName|| "Chat"}</h2>
            </div>
            <div className="message_display_area w-full flex-grow bg-gray-100 overflow-y-auto p-4">
                {messages.length > 0 ? (
                    messages.map((message) => {
                        let isCurrentUser;
                        (message.sender?._id === currentUserID || message.sender === currentUserID) ? isCurrentUser = true : isCurrentUser = false;
                        //console.log("in loop", message.sender);
                        return (
                            <div
                                key={message._id || Math.random()}
                                className={`message_box flex ${
                                    isCurrentUser ? "flex-row-reverse" : "flex-row"
                                } items-center w-full mb-3`}
                            >
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

export default ChatBox;
