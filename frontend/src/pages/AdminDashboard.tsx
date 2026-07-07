import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { Users, BookOpen, Code2, ArrowRight, Trophy, Star, MessageCircle } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'ADMIN';
  const isPartialAdmin = !isSuperAdmin && user?.adminCategories && user.adminCategories.length > 0;

  if (!isSuperAdmin && !isPartialAdmin) {
    return <Navigate to="/" replace />;
  }

  const { isLoading: loadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
    enabled: isSuperAdmin,
  });

  if (isSuperAdmin && loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Manage Global', value: 'User Management', icon: Users, color: 'bg-blue-500', link: '/admin/users', categoryId: null },
    { label: 'Manage Curriculum', value: 'Learn C', icon: BookOpen, color: 'bg-sky-500', link: '/admin/curriculum/learn-c', categoryId: 'LEARN_C' },
    { label: 'Manage Curriculum', value: 'Learn C++', icon: BookOpen, color: 'bg-blue-600', link: '/admin/curriculum/learn-cpp', categoryId: 'LEARN_CPP' },
    { label: 'Manage Curriculum', value: 'Learn Java', icon: BookOpen, color: 'bg-indigo-500', link: '/admin/curriculum/learn', categoryId: 'LEARN' },
    { label: 'Manage Curriculum', value: 'Learn Python', icon: BookOpen, color: 'bg-cyan-500', link: '/admin/curriculum/learn-python', categoryId: 'LEARN_PYTHON' },
    { label: 'Manage Curriculum', value: 'Learn Kotlin', icon: BookOpen, color: 'bg-violet-500', link: '/admin/curriculum/learn-kotlin', categoryId: 'LEARN_KOTLIN' },
    { label: 'Manage Curriculum', value: 'DSA Practice', icon: Code2, color: 'bg-emerald-500', link: '/admin/curriculum/practice', categoryId: 'PRACTICE' },
    { label: 'Manage Curriculum', value: 'CP', icon: Trophy, color: 'bg-purple-500', link: '/admin/curriculum/cp', categoryId: 'CP' },
    { label: 'Manage Global', value: 'Motivation Feed', icon: Star, color: 'bg-amber-500', link: '/admin/motivation', categoryId: 'MOTIVATION' },
    { label: 'Manage Global', value: 'Contact Admin', icon: MessageCircle, color: 'bg-rose-500', link: '/admin/contact', categoryId: 'CONTACT' },
  ];

  let displayedCards = statCards;
  if (isPartialAdmin) {
    displayedCards = statCards.filter(card => card.categoryId && user?.adminCategories?.includes(card.categoryId));
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <div className="mb-10 relative z-10">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tighter">
          Admin <span className="glow-text">Dashboard</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Manage platform content and users.</p>
      </div>

      {/* Stats / Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative z-10">
        {displayedCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                </div>
              </div>
              <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mb-2 relative z-10">{stat.label}</h3>
              <div className="text-2xl font-black text-slate-900 dark:text-white mb-6 relative z-10 tracking-tight">
                {stat.categoryId === null && !isSuperAdmin ? '---' : stat.value}
              </div>
              {stat.link && (
                <Link to={stat.link} className="mt-auto flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors relative z-10 w-fit">
                  Manage <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
