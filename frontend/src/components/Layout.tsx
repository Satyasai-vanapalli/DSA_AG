import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { AnimatePresence, motion } from 'framer-motion';

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-dark-bg transition-colors duration-200 relative overflow-hidden">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 z-0 bg-mesh opacity-30 dark:opacity-40 pointer-events-none" />
      
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        <Navbar />
        <main className="flex-grow relative">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
