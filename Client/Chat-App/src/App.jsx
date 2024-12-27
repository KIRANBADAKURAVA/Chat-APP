import { Header } from './index.jsx';
import { Outlet } from 'react-router-dom';
import './index.css';

function App() {
  return (
    <div className="Parent container flex w-full h-screen bg-black">
      {/* Sidebar Section */}
      <aside className="header flex-[1] bg-black p-4 flex flex-col justify-between">
        <Header />
      </aside>

      {/* Main Content Section */}
      <main className="content flex-[9] bg-white m-4 p-6 rounded-2xl shadow-lg overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
