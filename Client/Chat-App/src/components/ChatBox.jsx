import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { FiSend, FiCornerUpLeft, FiX } from "react-icons/fi";
import { sendEncryptedIndividualMessage, stopTyping, startTyping } from '../utils/messageUtils';
import { decryptMessage } from '../EncryptionUtils/Decrypt.utils.js'
import Message from './Message'; // see below for Message component

function ChatBox({ userProfilePic, currentUserID, chatId }) {
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
  const ENDPOINT = ""; // Your server endpoint here if needed
  const [decryptedMessages, setDecryptedMessages] = useState([]);
  const [replyTo, setReplyTo] = useState(null);

  // Refs for message elements and unseen tracking
  const messageRefs = useRef({});
  const unseenMessageIds = useRef(new Set());

  // Initialize socket connection and setup
  useEffect(() => {
    socketRef.current = io(ENDPOINT, {
      transports: ["websocket"],
      upgrade: false,
    });

    if (currentUserID) {
      socketRef.current.emit("setup", { _id: currentUserID });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUserID]);

  // Fetch chat name and recipient info
  useEffect(() => {
    async function getChatName(id) {
      try {
        const response = await fetch(`/api/v1/chat/getchatbyid/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const participant = data.data.participants[0];
          setChatName(participant.username);
          setRecipientID(participant._id);
          setRecipientName(participant.username);
          setProfilePic(participant.profilePicture);
        } else {
          console.error("Failed to fetch chat name:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching chat name:", error.message);
      }
    }
    if (chatId) getChatName(chatId);
  }, [chatId]);

  // Fetch messages for the chat
  useEffect(() => {
    if (!chatId) return;
    let isMounted = true;
    async function fetchMessages() {
      try {
        const response = await fetch(`/api/v1/chat/getallmessages/${chatId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (isMounted && data.data.messages) {
            setMessages(data.data.messages);
          }
        } else {
          console.error("Failed to fetch chat messages:", response.statusText);
        }
      } catch (err) {
        console.error("Error fetching chat messages:", err.message);
      }
    }
    fetchMessages();
    return () => { isMounted = false; };
  }, [chatId]);

  // Join socket room on recipientID set
  useEffect(() => {
    if (recipientID && socketRef.current) {
      socketRef.current.emit("join chat", chatId);
    }
  }, [recipientID, chatId]);

  // Handle incoming socket events
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;

    const handleMessageReceived = (newMessage) => {
      if (newMessage?.message) {
        // Mark message as seen by current user locally
        const messageWithSeen = {
          ...newMessage.message,
          seenBy: { ...newMessage.message.seenBy, [currentUserID]: true },
        };
        setMessages(prev => [...prev, messageWithSeen]);
        setIsTyping(false);

        // Notify server
        socket.emit("message seen", { chatId, messageId: newMessage.message._id, userId: currentUserID });
      }
    };

    const handleUpdateSeen = (data) => {
      if (data.chatId !== chatId) return;
      setMessages(prevMsgs =>
        prevMsgs.map(msg =>
          msg._id === data.messageId
            ? { ...msg, seenBy: { ...msg.seenBy, [data.userId]: true } }
            : msg
        )
      );
    };

    const handleTyping = () => {
      setIsTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setIsTyping(false), 3000);
    };

    const handleStopTyping = (id) => {
      if (id === recipientID) {
        setIsTyping(false);
        clearTimeout(typingTimeout.current);
      }
    };

    socket.on("message received", handleMessageReceived);
    socket.on("update seen", handleUpdateSeen);
    socket.on("typing", handleTyping);
    socket.on("stop typing", handleStopTyping);

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return () => {
      socket.off("message received", handleMessageReceived);
      socket.off("update seen", handleUpdateSeen);
      socket.off("typing", handleTyping);
      socket.off("stop typing", handleStopTyping);
      socket.off("error");
    };
  }, [chatId, currentUserID, recipientID]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Decrypt all messages on change
  useEffect(() => {
    async function decryptAll() {
      const results = await Promise.all(
        messages.map(async (message) => {
          try {
            const decryptedContent = await decryptMessage(
              message.content,
              message.encryptedKeys?.[currentUserID],
              message.iv
            );
            return { ...message, decryptedContent };
          } catch (e) {
            return { ...message, decryptedContent: "[Failed to decrypt]" };
          }
        })
      );
      setDecryptedMessages(results);
    }
    if (messages.length > 0) {
      decryptAll();
    } else {
      setDecryptedMessages([]);
    }
  }, [messages, currentUserID]);

  // Assign refs to messages
  decryptedMessages.forEach((msg) => {
    if (!messageRefs.current[msg._id]) {
      messageRefs.current[msg._id] = React.createRef();
    }
  });

  // Intersection Observer to detect visible messages
  useEffect(() => {
    if (!decryptedMessages.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-message-id");
            const msg = messages.find(m => m._id === id);
            if (
              id &&
              msg &&
              msg.sender !== currentUserID &&
              !(msg.seenBy && msg.seenBy[currentUserID])
            ) {
              unseenMessageIds.current.add(id);
            }
          }
        });
      },
      {
        root: null,
        threshold: 0.5, // 50% visible considered as seen
      }
    );

    Object.values(messageRefs.current).forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => {
      observer.disconnect();
    };
  }, [decryptedMessages, currentUserID, messages]);

  // Batch update seen status every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (unseenMessageIds.current.size === 0) return;

      setMessages(prevMsgs =>
        prevMsgs.map(msg =>
          unseenMessageIds.current.has(msg._id) &&
          !(msg.seenBy && msg.seenBy[currentUserID])
            ? { ...msg, seenBy: { ...msg.seenBy, [currentUserID]: true } }
            : msg
        )
      );

      unseenMessageIds.current.forEach((msgId) => {
        socketRef.current.emit("message seen", { chatId, messageId: msgId, userId: currentUserID });
      });

      unseenMessageIds.current.clear();
    }, 2000); // adjust batch interval as needed

    return () => clearInterval(interval);
  }, [chatId, currentUserID]);

  // Handle input change (typing event)
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (!socketRef.current || !recipientID) return;

    startTyping(recipientID, socketRef);
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      stopTyping(recipientID, socketRef);
    }, 500);
  };

  // Send message handler
  const sendMessage = async () => {
    if (!messageInput.trim() || !recipientID) return;

    try {
      const data = await sendEncryptedIndividualMessage(recipientID, messageInput, currentUserID, socketRef, replyTo?._id);
      setMessages(prev => [...prev, data.data.message]);
      setMessageInput("");
      setReplyTo(null);
      stopTyping(recipientID, socketRef);
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  };

  return (
    <div className="chat_box w-full h-full flex flex-col bg-gray-50 dark:bg-dark-primary rounded-lg shadow-lg transition-colors duration-300">
      {/* Sticky Chat Header */}
      <div className="chat_header w-full p-4 bg-blue-600 dark:bg-blue-500 text-white flex items-center rounded-t-lg sticky top-0 z-10 shadow-md transition-colors duration-300">
        <div className="w-10 h-10 rounded-full bg-white dark:bg-dark-secondary flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mr-3">
          <img src={profilePic} alt="Profile" className="w-full h-full rounded-full" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold truncate">{chatName || "Chat"}</h2>
        </div>
      </div>

      {/* Messages Display Area */}
      <div className="message_display_area w-full flex-grow bg-gray-100 dark:bg-dark-secondary overflow-y-auto p-4 flex flex-col space-y-2 transition-colors duration-300">
        {decryptedMessages.length > 0 ? (
          decryptedMessages.map((message) => (
            <div
              key={message._id}
              ref={messageRefs.current[message._id]}
              data-message-id={message._id}
            >
              <Message
                message={message}
                currentUserID={currentUserID}
                recipientID={recipientID}
                profilePic={profilePic}
                userProfilePic={userProfilePic}
                setReplyTo={setReplyTo}
              />
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 dark:text-gray-500">No messages available</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex items-center px-6 py-2 text-blue-500 dark:text-blue-400 text-sm font-medium mb-1" style={{ minHeight: '28px' }}>
          <span className="mr-2">{recipientName || "Someone"} typing...</span>
          <span className="flex space-x-1">
            <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </span>
        </div>
      )}

      {/* Reply Indicator */}
      {replyTo && (
        <div className="w-full bg-blue-50 dark:bg-dark-tertiary border-t border-blue-200 dark:border-dark-border px-4 py-2 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center">
            <FiCornerUpLeft className="w-4 h-4 text-blue-500 dark:text-blue-400 mr-2" />
            <span className="text-sm text-blue-700 dark:text-blue-400">
              Replying to: {(replyTo.decryptedContent || replyTo.content)?.substring(0, 30)}...
            </span>
          </div>
          <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-blue-100 dark:hover:bg-dark-secondary rounded-full">
            <FiX className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="message_input_box w-full h-16 flex items-center bg-white dark:bg-dark-secondary border-t border-gray-200 dark:border-dark-border px-4 sticky bottom-0 z-10 transition-colors duration-300">
        <input
          type="text"
          value={messageInput}
          onChange={handleInputChange}
          className="flex-grow h-10 px-4 bg-gray-100 dark:bg-dark-tertiary text-gray-900 dark:text-dark-text rounded-full focus:outline-none focus:ring focus:ring-blue-400 dark:focus:ring-blue-500 transition-colors duration-300"
          placeholder="Type a message..."
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
        />
        <button
          className="ml-4 p-3 text-2xl bg-blue-500 dark:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 dark:hover:bg-blue-700 transition"
          onClick={sendMessage}
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
