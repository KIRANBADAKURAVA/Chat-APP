import { Header } from './index.jsx';
import { Outlet } from 'react-router-dom';
import './index.css';

function App() {
  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Sidebar */}
      <aside className="flex flex-col items-center bg-white w-16 md:w-40 h-full shadow-md border-r border-gray-200">
        <Header />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:p-8 h-full overflow-y-auto">
        {/* Top Bar Placeholder */}
        <div className="w-full h-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm flex items-center px-6 mb-4 sticky top-0 z-10 border-b border-blue-100">
          <span className="text-xl font-bold text-blue-700 tracking-wide">Chat App</span>
        </div>
        <div className="flex-1 w-full flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default App;
