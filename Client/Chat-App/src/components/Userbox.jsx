import React from "react";

export default function Userbox({ userdata }) {
  const { participants = [], isGroupChat, chatName } = userdata;
  // For group chat, show group name; otherwise, show the other participant
  const displayName = isGroupChat
    ? chatName || "Group Chat"
    : participants[0]?.username || "User";
  return (
    <div className="flex items-center space-x-3 p-2">
      {/* Avatar Placeholder */}
      <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg">
        {displayName[0]?.toUpperCase()}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-medium text-gray-900 truncate">{displayName}</span>
        {isGroupChat && (
          <span className="text-xs text-gray-500 truncate">Group</span>
        )}
      </div>
    </div>
  );
}