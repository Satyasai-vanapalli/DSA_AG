import { Link } from 'react-router-dom';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { progressApi } from '../api/progress';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => progressApi.getMyStats(),
    enabled: isAuthenticated,
  });
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    // Default to dark mode unless 'light' was explicitly saved
    return saved !== 'light';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <nav className="sticky top-0 z-50 w-full flex-none transition-colors duration-500 border-b border-white/20 dark:border-white/10 bg-white/70 dark:bg-dark-bg/70 backdrop-blur-xl pl-14 lg:pl-0">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end h-16 items-center">
          
          <div className="flex items-center gap-4">

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-500" />}
            </button>
            
            {isAuthenticated ? (
              <>
                {(user?.role === 'ADMIN' || (user?.adminCategories && user.adminCategories.length > 0)) && (
                  <>
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <Link
                        to="/admin/insights"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        Insights
                      </Link>
                    )}
                  </>
                )}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                  {stats && stats.currentStreak > 0 && (
                    <div className="flex flex-col items-center justify-center mr-2 text-orange-500" title={`${stats.currentStreak} day streak`}>
                      <span className="text-lg leading-none">🔥</span>
                      <span className="text-[10px] font-bold leading-none">{stats.currentStreak}</span>
                    </div>
                  )}
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {user?.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.email}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
