import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Code2, Terminal, Calendar, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>('Learn');
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  // Automatically expand if a child route is active on load
  useEffect(() => {
    if (location.pathname.startsWith('/learn')) {
      setExpanded('Learn');
    }
  }, [location.pathname]);

  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="w-5 h-5" /> },
    { 
      name: 'Learn', 
      icon: <BookOpen className="w-5 h-5" />,
      children: [
        { name: 'Learn C Programming', path: '/learn-c' },
        { name: 'Learn C++', path: '/learn-cpp' },
        { name: 'Learn Java', path: '/learn' },
        { name: 'Learn Python', path: '/learn-python' },
        { name: 'Learn Kotlin', path: '/learn-kotlin' }
      ]
    },
    { name: 'DSA Practice', path: '/practice', icon: <Code2 className="w-5 h-5" /> },
    { name: 'CP', path: '/cp', icon: <Terminal className="w-5 h-5" /> },
    { name: 'Daily Review', path: '/review', icon: <Calendar className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-sm"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-[55] transition-transform duration-300 flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <Code2 className="w-8 h-8 text-primary-500" />
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">DSA Roadmap</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            if (item.children) {
              const isActive = item.children.some(child => location.pathname === child.path || (child.path !== '/' && location.pathname.startsWith(`${child.path}/`)));
              const isExpanded = expanded === item.name;
              
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {item.name}
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {isExpanded && (
                    <div className="pl-11 pr-3 space-y-1 mt-1">
                      {item.children.map(child => {
                        const isChildActive = location.pathname === child.path || (child.path !== '/' && location.pathname.startsWith(`${child.path}/`));
                        return (
                          <Link
                            key={child.name}
                            to={child.path}
                            onClick={() => setIsOpen(false)}
                            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isChildActive
                                ? 'bg-primary-50/50 dark:bg-primary-500/5 text-primary-600 dark:text-primary-400'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(`${item.path}/`));
            return (
              <Link
                key={item.name}
                to={item.path!}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
