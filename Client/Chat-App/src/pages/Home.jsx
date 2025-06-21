import { BsChatSquareDots } from "react-icons/bs";

function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-center py-12">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-blue-100 rounded-full p-6 shadow-lg mb-6">
          <BsChatSquareDots className="text-blue-600" size={64} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4 tracking-tight">Welcome to Chat App</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-xl mb-6">
          Connect, chat, and collaborate in real time. Start a conversation or join a group chat to experience seamless communication with a modern, fresh interface.
        </p>
        <a href="/all-chats" className="inline-block mt-4 px-8 py-3 bg-blue-600 text-white rounded-full shadow-lg text-lg font-semibold hover:bg-blue-700 transition">Start Chatting</a>
      </div>
    </div>
  );
}

export default Home;