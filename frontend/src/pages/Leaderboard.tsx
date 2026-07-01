import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { Trophy, Medal, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard({ category }: { category?: string }) {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', category],
    queryFn: () => usersApi.getLeaderboard(category),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 mb-4">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
          {category === 'PRACTICE' ? 'DSA Practice Leaderboard' : category === 'CP' ? 'CP Leaderboard' : 'Global Leaderboard'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Top performers based on completed problems.
        </p>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-20 text-center">Rank</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">User</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-32 text-right">Completed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {leaderboard?.map((user, index) => {
              const rank = index + 1;
              return (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={index} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-300">
                    {rank === 1 ? <Trophy className="w-5 h-5 text-yellow-500 mx-auto" /> :
                     rank === 2 ? <Medal className="w-5 h-5 text-slate-400 mx-auto" /> :
                     rank === 3 ? <Award className="w-5 h-5 text-amber-600 mx-auto" /> :
                     <span className="text-slate-400">#{rank}</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{user.name}</span>
                      {user.currentStreak > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full" title={`${user.currentStreak} day streak`}>
                          🔥 {user.currentStreak}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center justify-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold rounded-lg text-sm">
                      {user.completedCount}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
            {leaderboard?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                  No users on the leaderboard yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
