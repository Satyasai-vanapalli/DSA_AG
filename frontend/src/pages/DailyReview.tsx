import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi } from '../api/progress';
import { Brain, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function DailyReview() {
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['dueReviews'],
    queryFn: progressApi.getDueReviews,
  });

  const submitReview = useMutation({
    mutationFn: ({ problemId, remembered }: { problemId: string; remembered: boolean }) =>
      progressApi.submitReview(problemId, remembered),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dueReviews'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center mt-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-green-400/20 to-green-600/20 text-green-500 mb-8 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <CheckCircle className="w-12 h-12 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tighter">
          You're all <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">caught up!</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto">
          You've completed all your daily reviews. Spaced repetition ensures you retain these patterns long-term.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/25 hover:from-primary-500 hover:to-accent-500 transition-all hover:scale-105">
          Return Home <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400/20 to-purple-600/20 flex items-center justify-center text-purple-500 border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <Brain className="w-8 h-8 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter mb-1">
              Daily <span className="glow-text">Review</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
              You have {reviews.length} problem{reviews.length !== 1 ? 's' : ''} due for review today.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {reviews.map((progress, index) => (
            <motion.div
              key={progress.problemId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 md:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm ${
                    progress.problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' :
                    progress.problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20' :
                    'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                  }`}>
                    {progress.problem.difficulty}
                  </span>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-lg shadow-sm">
                    Interval: {progress.reviewIntervalDays}d
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {progress.problem.title}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-3 relative z-10">
                <Link
                  to={`/problem/${progress.problemId}`}
                  target="_blank"
                  className="px-5 py-3 bg-white/50 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-white dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 transition-all shadow-sm"
                >
                  View Problem
                </Link>
                <button
                  onClick={() => submitReview.mutate({ problemId: progress.problemId, remembered: false })}
                  disabled={submitReview.isPending}
                  className="flex items-center gap-2 px-5 py-3 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-bold rounded-xl hover:bg-red-500/20 transition-all shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]"
                >
                  <XCircle className="w-5 h-5 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> Forgot
                </button>
                <button
                  onClick={() => submitReview.mutate({ problemId: progress.problemId, remembered: true })}
                  disabled={submitReview.isPending}
                  className="flex items-center gap-2 px-5 py-3 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 font-bold rounded-xl hover:bg-green-500/20 transition-all shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]"
                >
                  <CheckCircle className="w-5 h-5 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> Remembered
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
