import { Link } from 'react-router-dom';
import { Moon, Sun, Code2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-white/95 dark:bg-slate-900/75">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary-500" />
            <span className="font-bold text-xl tracking-tight">DSA Roadmap</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDark(!isDark)} 
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-500" />}
            </button>
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
