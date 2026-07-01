import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin';
import { Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminInsights() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['adminInsights'],
    queryFn: adminApi.getInsights,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin Insights</h1>
          <p className="text-slate-500 dark:text-slate-400">Platform overview and user analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Total Registered Users</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-4xl font-black text-slate-900 dark:text-white mt-4">{insights?.activeUsers || 0}</p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Popular Problems */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-dark-border flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Most Completed Problems</h3>
          </div>
          <div className="flex-1 p-0">
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {insights?.popularProblems?.map((prob, idx) => (
                <li key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{prob.title}</span>
                  <span className="inline-flex items-center justify-center px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold rounded text-xs">
                    {prob.completedCount} completions
                  </span>
                </li>
              ))}
              {(!insights?.popularProblems || insights.popularProblems.length === 0) && (
                <li className="p-8 text-center text-slate-500">No completions yet.</li>
              )}
            </ul>
          </div>
        </motion.div>

        {/* Struggled Problems */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-dark-border flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Most Struggled Problems</h3>
          </div>
          <div className="flex-1 p-0">
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {insights?.struggledProblems?.map((prob, idx) => (
                <li key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{prob.title}</span>
                  <span className="inline-flex items-center justify-center px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold rounded text-xs">
                    avg {Math.round(prob.averageTime)} mins
                  </span>
                </li>
              ))}
              {(!insights?.struggledProblems || insights.struggledProblems.length === 0) && (
                <li className="p-8 text-center text-slate-500">No time tracking data yet.</li>
              )}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
