import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminUser } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldOff, Settings, Ban, Trash2, CheckCircle } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { Download, Search, X, BarChart2, Calendar, Activity, Loader2 } from 'lucide-react';

// Progress Modal Component
const UserProgressModal = ({ userId, onClose }: { userId: string; onClose: () => void }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-user-progress', userId],
    queryFn: () => adminApi.getUserDetailedProgress(userId),
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 max-h-[85vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary-500" />
              Detailed User Progress
            </h3>
            {data && <p className="text-sm text-slate-500 dark:text-slate-400">{data.name} ({data.email})</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          )}
          {isError && <p className="text-center text-red-500 py-4">Failed to load progress data.</p>}
          {data && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 text-center">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{data.totalSolved}</p>
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Total Solved</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30 text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">🔥 {data.currentStreak}</p>
                  <p className="text-xs font-medium text-orange-700 dark:text-orange-300">Current Streak</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.maxStreak}</p>
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Max Streak</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.totalActiveDays}</p>
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Active Days</p>
                </div>
              </div>

              {/* Solved Problems List */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-3">Solved Problems ({data.solvedProblems.length})</h4>
                {data.solvedProblems.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {data.solvedProblems.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-400 w-6">{i + 1}.</span>
                          <div>
                            <p className="font-medium text-sm text-slate-900 dark:text-white">{p.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{p.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            p.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            p.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>{p.difficulty}</span>
                          {p.completedAt && (
                            <span className="text-xs text-slate-400">{new Date(p.completedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-4">No problems solved yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIdForProgress, setSelectedUserIdForProgress] = useState<string | null>(null);

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

  const filteredUsers = users?.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const superAdmins = filteredUsers.filter(u => u.role === 'ADMIN');
  const partialAdmins = filteredUsers.filter(u => u.role !== 'ADMIN' && u.adminCategories && u.adminCategories.length > 0);
  const students = filteredUsers.filter(u => u.role !== 'ADMIN' && (!u.adminCategories || u.adminCategories.length === 0));
  
  const displayedUsers = activeTab === 'SUPER_ADMINS' ? superAdmins : (activeTab === 'ADMINS' ? partialAdmins : students);

  const exportToCSV = () => {
    if (!users) return;
    const headers = ['Name', 'Email', 'Role', 'Status', 'Last Active'];
    // Add dynamic headers for progress
    const allCategories = new Set<string>();
    users.forEach(u => {
      if (u.progress) Object.keys(u.progress).forEach(cat => allCategories.add(cat));
    });
    const categoryHeaders = Array.from(allCategories);
    
    const csvRows = [];
    csvRows.push([...headers, ...categoryHeaders].join(','));
    
    users.forEach(u => {
      const row = [
        `"${u.name}"`,
        `"${u.email}"`,
        u.role,
        u.isBlocked ? 'Blocked' : 'Active',
        u.lastActiveTime ? new Date(u.lastActiveTime + 'Z').toLocaleString() : 'Never'
      ];
      categoryHeaders.forEach(cat => {
        row.push(u.progress && u.progress[cat] ? u.progress[cat].toString() : '0');
      });
      csvRows.push(row.join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <div className="mb-10 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter">
              User <span className="glow-text">Management</span>
            </h1>
            <div className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-bold text-sm">
              Total Users: {users?.length || 0}
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Promote users to Admin or demote them to regular User role.</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-64"
              />
            </div>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl text-sm transition-all duration-300 bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:scale-105"
            >
              <Download className="w-4 h-4" /> Export
            </button>
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
      </div>

      <div className="glass-card rounded-3xl shadow-xl relative z-10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/30 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <th className="px-6 md:px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Name</th>
                <th className="px-6 md:px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-6 md:px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Email</th>
                <th className="px-6 md:px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Joined</th>
                <th className="px-6 md:px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Active Days</th>
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
                    {(() => {
                      if (!u.createdAt) return <span className="text-sm text-slate-500">N/A</span>;
                      const joinDate = new Date(u.createdAt + 'Z');
                      const daysAgo = Math.floor((Date.now() - joinDate.getTime()) / 86400000);
                      return (
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-900 dark:text-white flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {joinDate.toLocaleDateString()}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{daysAgo} days ago</span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
                      <Activity className="w-3.5 h-3.5" />
                      {u.totalActiveDays ?? 0}
                    </span>
                  </td>
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
                    <button
                      onClick={() => setSelectedUserIdForProgress(u.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors mr-2"
                    >
                      <BarChart2 className="w-3.5 h-3.5" /> Progress
                    </button>
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
                  <td colSpan={7} className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">No users found in this category</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedUserIdForProgress && (
        <UserProgressModal 
          userId={selectedUserIdForProgress} 
          onClose={() => setSelectedUserIdForProgress(null)} 
        />
      )}
    </div>
  );
}
