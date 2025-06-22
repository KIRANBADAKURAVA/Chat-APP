import { Header } from './index.jsx';
import { Outlet } from 'react-router-dom';
import './index.css';
import logoImage from './assets/Chat-App-logo-nobg.png';

function App() {
  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Sidebar */}
      <aside className="flex flex-col items-center bg-white w-16 md:w-40 h-full shadow-md border-r border-gray-200">
        <Header />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:p-8 h-full overflow-y-auto">
        
        <div className="flex-1 w-full flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default App;
