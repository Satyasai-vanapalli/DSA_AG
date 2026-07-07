import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminUser } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldOff, Settings, Ban, Trash2, CheckCircle } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

const CategoryAdminManager = ({ user, toggleMutation }: { user: AdminUser, toggleMutation: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const categories = [
    { id: 'LEARN', label: 'Java' }, 
    { id: 'LEARN_PYTHON', label: 'Python' },
    { id: 'LEARN_C', label: 'C' },
    { id: 'LEARN_CPP', label: 'C++' },
    { id: 'LEARN_KOTLIN', label: 'Kotlin' },
    { id: 'PRACTICE', label: 'DSA Practice' },
    { id: 'CP', label: 'CP' },
    { id: 'MOTIVATION', label: 'Motivation' },
    { id: 'CONTACT', label: 'Contact Admin' }
  ];

  return (
    <div className="relative inline-block text-left ml-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
      >
        <Settings className="w-3.5 h-3.5" /> Manage Roles
      </button>
      
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-200 dark:border-dark-border">
          <div className="py-1">
            {categories.map(cat => {
              const isCatAdmin = user.adminCategories?.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    toggleMutation.mutate({ userId: user.id, category: cat.id });
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${isCatAdmin ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                >
                  {isCatAdmin ? `Remove ${cat.label} Admin` : `Make ${cat.label} Admin`}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState<'SUPER_ADMINS' | 'ADMINS' | 'USERS'>('SUPER_ADMINS');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isSuperAdmin = user?.role === 'ADMIN';

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
    enabled: isSuperAdmin,
  });

  const promoteMutation = useMutation({
    mutationFn: adminApi.promoteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast('User promoted to Super Admin', 'success');
    },
    onError: () => toast('Failed to promote user', 'error'),
  });

  const demoteMutation = useMutation({
    mutationFn: adminApi.demoteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast('User demoted to User role', 'success');
    },
    onError: () => toast('Failed to demote user', 'error'),
  });

  const toggleCategoryMutation = useMutation({
    mutationFn: ({ userId, category }: { userId: string, category: string }) => adminApi.toggleCategoryAdmin(userId, category),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast(data.message, 'success');
    },
    onError: () => toast('Failed to update category admin role', 'error'),
  });

  const forceLogoutMutation = useMutation({
    mutationFn: adminApi.forceLogoutUser,
    onSuccess: () => toast('User forcibly logged out', 'success'),
    onError: () => toast('Failed to log out user', 'error'),
  });

  const blockMutation = useMutation({
    mutationFn: adminApi.blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast('User blocked', 'success');
    },
    onError: () => toast('Failed to block user', 'error'),
  });

  const unblockMutation = useMutation({
    mutationFn: adminApi.unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast('User unblocked', 'success');
    },
    onError: () => toast('Failed to unblock user', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast('User deleted', 'success');
    },
    onError: () => toast('Failed to delete user', 'error'),
  });

  if (loadingUsers) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const superAdmins = users?.filter(u => u.role === 'ADMIN') || [];
  const partialAdmins = users?.filter(u => u.role !== 'ADMIN' && u.adminCategories && u.adminCategories.length > 0) || [];
  const students = users?.filter(u => u.role !== 'ADMIN' && (!u.adminCategories || u.adminCategories.length === 0)) || [];
  
  const displayedUsers = activeTab === 'SUPER_ADMINS' ? superAdmins : (activeTab === 'ADMINS' ? partialAdmins : students);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <div className="mb-10 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tighter">
            User <span className="glow-text">Management</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Promote users to Admin or demote them to regular User role.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('SUPER_ADMINS')}
            className={`font-bold px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${activeTab === 'SUPER_ADMINS' ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/25 scale-105' : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'}`}
          >
            {superAdmins.length} Super Admins
          </button>
          <button
            onClick={() => setActiveTab('ADMINS')}
            className={`font-bold px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${activeTab === 'ADMINS' ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-500/25 scale-105' : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'}`}
          >
            {partialAdmins.length} Admins
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`font-bold px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${activeTab === 'USERS' ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg shadow-primary-500/25 scale-105' : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'}`}
          >
            {students.length} Users
          </button>
        </div>
      </div>

      <div className="glass-card rounded-3xl shadow-xl relative z-10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/30 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <th className="px-6 md:px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Name</th>
                <th className="px-6 md:px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-6 md:px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Email</th>
                <th className="px-6 md:px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Role</th>
                <th className="px-6 md:px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
              {displayedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{u.name}</td>
                  <td className="px-6 py-4">
                    {(() => {
                      if (!u.lastActiveTime) return <span className="text-sm text-slate-500">Never active</span>;
                      const lastActive = new Date(u.lastActiveTime + 'Z');
                      const diffMins = Math.floor((Date.now() - lastActive.getTime()) / 60000);
                      if (diffMins < 5) {
                        return <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Online</span></div>;
                      }
                      if (diffMins < 60) return <span className="text-sm text-slate-500">Last seen {diffMins} mins ago</span>;
                      if (u.isBlocked) return <span className="text-sm font-bold text-red-500">Blocked</span>;
                      const diffHrs = Math.floor(diffMins / 60);
                      if (diffHrs < 24) return <span className="text-sm text-slate-500">Last seen {diffHrs} hrs ago</span>;
                      return <span className="text-sm text-slate-500">Last seen {Math.floor(diffHrs/24)} days ago</span>;
                    })()}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{u.email}</td>
                  <td className="px-6 py-4">
                    {u.role === 'ADMIN' ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">
                        SUPER_ADMIN
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {u.role}
                        </span>
                        {u.adminCategories?.map(cat => (
                          <span key={cat} className="text-xs font-bold px-2.5 py-1 rounded-md bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400">
                            {cat} ADMIN
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.email !== user?.email && u.role === 'ADMIN' && (
                      <button
                        onClick={() => demoteMutation.mutate(u.id)}
                        disabled={demoteMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      >
                        <ShieldOff className="w-3.5 h-3.5" /> Remove Super Admin
                      </button>
                    )}
                    {u.email !== user?.email && u.role !== 'ADMIN' && (
                      <>
                        <button
                          onClick={() => promoteMutation.mutate(u.id)}
                          disabled={promoteMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5" /> Make Super Admin
                        </button>
                        <CategoryAdminManager user={u} toggleMutation={toggleCategoryMutation} />
                      </>
                    )}
                    {u.email !== user?.email && (
                      <div className="flex flex-wrap items-center justify-end gap-2 mt-2">
                        <button
                          onClick={() => forceLogoutMutation.mutate(u.id)}
                          disabled={forceLogoutMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
                        >
                          <ShieldOff className="w-3.5 h-3.5" /> Force Logout
                        </button>
                        
                        {u.isBlocked ? (
                          <button
                            onClick={() => unblockMutation.mutate(u.id)}
                            disabled={unblockMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if(window.confirm(`Are you sure you want to block ${u.email}?`)) {
                                blockMutation.mutate(u.id);
                              }
                            }}
                            disabled={blockMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" /> Block
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            if(window.confirm(`Are you sure you want to permanently DELETE ${u.email}? This action cannot be undone and will delete all their progress.`)) {
                              deleteMutation.mutate(u.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {displayedUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">No users found in this category</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
