import { Header } from './index.jsx';
import { Outlet } from 'react-router-dom';
import './index.css';
import logoImage from './assets/Chat-App-logo-nobg.png';
import ThemeToggle from './components/ThemeToggle.jsx';

function App() {
  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-blue-50 to-gray-100 dark:from-dark-primary dark:to-dark-secondary transition-colors duration-300">
      {/* Sidebar */}
      <aside className="flex flex-col items-center bg-white dark:bg-dark-secondary w-16 md:w-40 h-full shadow-md border-r border-gray-200 dark:border-dark-border transition-colors duration-300">
        <Header />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:p-8 h-full overflow-y-auto">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        
        <div className="flex-1 w-full flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default App;
