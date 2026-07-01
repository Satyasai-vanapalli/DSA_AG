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
      <div className="max-w-4xl mx-auto p-8 text-center mt-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          You're all caught up!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-xl mx-auto">
          You've completed all your daily reviews. Spaced repetition ensures you retain these patterns long-term.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-500 transition-colors">
          Return Home <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-500" /> Daily Review
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            You have {reviews.length} problem{reviews.length !== 1 ? 's' : ''} due for review today.
          </p>
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
              className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                    progress.problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                    progress.problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                  }`}>
                    {progress.problem.difficulty}
                  </span>
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1 rounded-md">
                    Interval: {progress.reviewIntervalDays}d
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {progress.problem.title}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={`/problem/${progress.problemId}`}
                  target="_blank"
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  View Problem
                </Link>
                <button
                  onClick={() => submitReview.mutate({ problemId: progress.problemId, remembered: false })}
                  disabled={submitReview.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-semibold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <XCircle className="w-5 h-5" /> Forgot
                </button>
                <button
                  onClick={() => submitReview.mutate({ problemId: progress.problemId, remembered: true })}
                  disabled={submitReview.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 font-semibold rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" /> Remembered
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
