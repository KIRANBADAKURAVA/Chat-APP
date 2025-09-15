import { useEffect, useState } from 'react';

function GroupChatBox({ userdata, members, setMembers }) {
  const [checked, setChecked] = useState(false);

  const handleCheckboxChange = () => {
    setChecked((prevChecked) => {
      const newChecked = !prevChecked;
      if (newChecked ) {
        // Add user to members
        setMembers((prevMembers) => [...prevMembers, userdata._id]);
      } else {
        // Remove user from members
        setMembers((prevMembers) => prevMembers.filter((member) => member !== userdata._id));
      }
      return newChecked;
    });
  };

  return (
    <div className="flex items-center justify-between bg-gray-100 dark:bg-dark-tertiary hover:bg-gray-400 dark:hover:bg-dark-border p-4 m-1 rounded-lg shadow-sm w-1/2 transition-colors duration-300">
      <div className="flex items-center">
        <div className="flex items-center justify-center text-white font-bold text-xl w-12 h-12 rounded-md">
          <img src={userdata.profilePicture || '/fallback-image.png'} alt="profile" className="w-12 h-12 rounded-full" />
        </div>
        <div className="ml-2 text-black dark:text-dark-text text-lg font-semibold">{userdata.username}</div>
      </div>
      <div>
        <input
          type="checkbox"
          checked={checked}
          onChange={handleCheckboxChange}
          className="h-6 w-6 accent-blue-500 dark:accent-blue-400"
        />
      </div>
    </div>
  );
}

export default GroupChatBox;
