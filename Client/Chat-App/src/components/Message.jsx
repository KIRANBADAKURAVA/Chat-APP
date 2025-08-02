import React from "react";
import { FiCornerUpLeft, FiCheck } from "react-icons/fi";
import ReplyMessage from './ReplyMessage';

const Message = React.memo(({ message, currentUserID, recipientID, profilePic, userProfilePic, setReplyTo }) => {
  const isCurrentUser = message.sender?._id === currentUserID || message.sender === currentUserID;
  const isSeenByRecipient = message.seenBy && recipientID && message.seenBy[recipientID];

  return (
    <div className={`flex items-end ${isCurrentUser ? "justify-end" : "justify-start"} group relative`}>
      {!isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold mr-2 text-sm">
          <img src={profilePic} alt="Profile" className="w-full h-full rounded-full" />
        </div>
      )}
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
            ? "bg-blue-500 text-white rounded-br-none pr-14"
            : "bg-white text-gray-900 rounded-bl-none"
        }`}
        style={{ position: 'relative' }}
      >
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
        {isCurrentUser && (
          <span
            className="m-1"
            style={{ position: 'absolute', right: 10, bottom: 6, display: 'flex', alignItems: 'center' }}
          >
            {isSeenByRecipient ? (
              <>
                <FiCheck size={14} color="#fff" style={{ marginRight: 1, filter: 'drop-shadow(0 0 2px #3b82f6)' }} />
                <FiCheck size={14} color="#fff" style={{ filter: 'drop-shadow(0 0 2px #3b82f6)' }} />
              </>
            ) : (
              <FiCheck size={16} color="#d1d5db" />
            )}
          </span>
        )}
      </div>
      {isCurrentUser && (
        <>
          <button
            onClick={() => setReplyTo(message)}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-gray-200 ml-1"
            title="Reply to message"
          >
            <FiCornerUpLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold ml-2 text-sm">
            <img src={userProfilePic} alt="User Profile" className="w-full h-full rounded-full" />
          </div>
        </>
      )}
    </div>
  );
});

export default Message;
