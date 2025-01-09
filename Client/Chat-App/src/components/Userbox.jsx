function Userbox({
    userdata,
    unseenmessages,
  

}){
    const time = new Date(userdata.createdAt).toLocaleTimeString()

  //console.log(time)
    return(
        <div className="flex items-center justify-between bg-gray-100 hover:bg-gray-400 p-4 m-1 rounded-lg shadow-sm w-full">

        {/* Profile Icon */}
        <div className="flex items-center">
          <div className="flex items-center justify-center text-white font-bold text-xl w-12 h-12 rounded-md">
          <img src={userdata.participants[0].profilePicture} alt="profile" className="w-12 h-12 rounded-full" />
          </div>
      
          {/* Chat Details */}
          <div className="ml-3 ">
            <div className="text-gray-900 font-semibold">{userdata.groupChatName || userdata.participants[0].username}</div>
            <div className="text-sm text-gray-500">
             {userdata.latestMessage} 
            </div>
          </div>
        </div>
      
        {/* Time and Actions */}
        <div className="flex items-center space-x-3 ">
          <div className="text-sm text-gray-400">{time}</div>
      
          {/* Notification Badge */}
         
      
          
          
        </div>
      </div>
    )
}

export default Userbox