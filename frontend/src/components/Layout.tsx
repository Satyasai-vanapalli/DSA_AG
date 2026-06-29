import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg transition-colors duration-200">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}
