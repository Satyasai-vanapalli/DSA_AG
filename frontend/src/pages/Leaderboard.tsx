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
    <div className="max-w-4xl mx-auto p-4 md:p-8 relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 text-yellow-500 mb-6 border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
          <Trophy className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tighter">
          {category === 'PRACTICE' ? 'DSA Practice' : category === 'CP' ? 'Competitive' : 'Global'}{' '}
          <span className="glow-text">Leaderboard</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
          Top performers dominating the charts.
        </p>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden shadow-2xl relative z-10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/50 dark:bg-black/20 border-b border-slate-200 dark:border-white/10 backdrop-blur-md">
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 w-24 text-center">Rank</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">User</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 w-32 text-right">Completed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5">
            {leaderboard?.map((user, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              return (
                <motion.tr 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                  key={index} 
                  className={`group transition-all duration-300 hover:bg-white/50 dark:hover:bg-white/5 ${
                    rank === 1 ? 'bg-yellow-500/5' : 
                    rank === 2 ? 'bg-slate-400/5' : 
                    rank === 3 ? 'bg-amber-600/5' : ''
                  }`}
                >
                  <td className="px-6 py-5 text-center font-extrabold">
                    {rank === 1 ? <Trophy className="w-7 h-7 text-yellow-500 mx-auto drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" /> :
                     rank === 2 ? <Medal className="w-7 h-7 text-slate-400 mx-auto drop-shadow-[0_0_8px_rgba(148,163,184,0.5)]" /> :
                     rank === 3 ? <Award className="w-7 h-7 text-amber-600 mx-auto drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]" /> :
                     <span className="text-slate-500 dark:text-slate-500">#{rank}</span>}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-lg ${isTop3 ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {user.name}
                      </span>
                      {user.currentStreak > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full shadow-sm" title={`${user.currentStreak} day streak`}>
                          🔥 {user.currentStreak}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="inline-flex items-center justify-center px-4 py-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 text-green-600 dark:text-green-400 font-extrabold rounded-xl text-sm shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]">
                      {user.completedCount}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
            {leaderboard?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-500 font-medium">
                  No users on the leaderboard yet. Be the first!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
