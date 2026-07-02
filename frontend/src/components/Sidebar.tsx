import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Code2, Terminal, Calendar, Menu, X, ChevronDown, ChevronRight, LogOut, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { userApi } from '../api/user';
import { AnimatePresence, motion } from 'framer-motion';

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>('Learn');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [otp, setOtp] = useState('');
  const { isAuthenticated, logout, user } = useAuth();

  if (!isAuthenticated) return null;

  // Automatically expand if a child route is active on load
  useEffect(() => {
    if (location.pathname.startsWith('/learn')) {
      setExpanded('Learn');
    }
  }, [location.pathname]);

  const sendOtpMutation = useMutation({
    mutationFn: userApi.sendDeleteAccountOtp
  });

  const verifyDeleteMutation = useMutation({
    mutationFn: userApi.verifyAndDeleteAccount,
    onSuccess: () => {
      logout();
    }
  });

  const handleDeleteInitiate = () => {
    sendOtpMutation.mutate();
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (otp && otp.length === 6) {
      verifyDeleteMutation.mutate(otp);
    }
  };

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
    { name: 'Motivation', path: '/motivation', icon: <Code2 className="w-5 h-5" /> },
    { name: 'Contact Admin', path: '/contact', icon: <Terminal className="w-5 h-5" /> },
    ...(user?.role === 'SUPER_ADMIN' ? [
      { name: 'Admin Motivation', path: '/admin/motivation', icon: <Code2 className="w-5 h-5 text-purple-500" /> },
      { name: 'Admin Contact', path: '/admin/contact', icon: <Terminal className="w-5 h-5 text-purple-500" /> }
    ] : [])
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

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
          
          {user?.role === 'STUDENT' && (
            <button 
              onClick={handleDeleteInitiate}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Delete Account
            </button>
          )}
        </div>
      </aside>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-slate-200 dark:border-dark-border p-6"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Account</h3>
              
              {sendOtpMutation.isPending ? (
                <div className="py-8 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-500 dark:text-slate-400">Sending OTP to your email...</p>
                </div>
              ) : (
                <>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                    Are you absolutely sure you want to delete your account? This action is <strong>permanent</strong> and will delete all your progress. 
                    <br/><br/>
                    Please enter the 6-digit OTP sent to <strong>{user?.email}</strong>.
                  </p>
                  
                  {verifyDeleteMutation.isError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                      Invalid OTP or it has expired.
                    </div>
                  )}

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                    />
                    
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmDelete}
                        disabled={otp.length !== 6 || verifyDeleteMutation.isPending}
                        className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                      >
                        {verifyDeleteMutation.isPending && (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        )}
                        Permanently Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
