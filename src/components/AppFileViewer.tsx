import { Button } from "@/components/ui/button";
import { Play, Save } from "lucide-react";

const AppFileViewer = () => {
  const code = `import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { Footer } from './components/Footer';
import './styles/App.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user');
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className={\`app-container theme-\${theme}\`}>
      <Header user={user} onThemeToggle={toggleTheme} />
      <div className="app-body">
        <Sidebar />
        <MainContent user={user} />
      </div>
      <Footer />
    </div>
  );
};

export default App;`;

  return (
    <div className="h-full flex flex-col dark:bg-slate-900 bg-gray-50">
      <div className="flex items-center justify-between p-2 border-b dark:border-slate-700 border-gray-300">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="dark:text-slate-400 text-gray-600 dark:hover:text-slate-200 hover:text-gray-900 dark:hover:bg-slate-700 hover:bg-gray-200">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button variant="ghost" size="sm" className="dark:text-slate-400 text-gray-600 dark:hover:text-slate-200 hover:text-gray-900 dark:hover:bg-slate-700 hover:bg-gray-200">
            <Play className="w-4 h-4 mr-1" />
            Run
          </Button>
        </div>
        <div className="text-xs dark:text-slate-500 text-gray-500">
          App.tsx • Modified
        </div>
      </div>
      
      <div className="flex-1 flex">
        {/* Line numbers */}
        <div className="dark:bg-slate-800 bg-gray-100 dark:text-slate-500 text-gray-600 text-sm font-mono p-4 pr-2 select-none border-r dark:border-slate-700 border-gray-300">
          {code.split('\n').map((_, index) => (
            <div key={index} className="leading-6">
              {index + 1}
            </div>
          ))}
        </div>
        
        {/* Code content */}
        <div className="flex-1 overflow-auto">
          <pre className="text-sm font-mono p-4 leading-6 dark:text-slate-100 text-gray-900 whitespace-pre">
            {code}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AppFileViewer;

// Made with Bob
