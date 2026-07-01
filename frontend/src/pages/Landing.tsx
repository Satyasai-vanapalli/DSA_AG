import { Code2, BrainCircuit, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-12">
      <div className="text-center space-y-6 py-12 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Start Learning. <span className="text-primary-600 dark:text-primary-400">Start Evolving.</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            "The only way to learn mathematics is to do mathematics." - Paul Halmos. 
            The same goes for coding. Choose your path and start your journey today.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
        >
          <Link
            to="/learn"
            className="flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary-500/20"
          >
            <BrainCircuit className="w-6 h-6" />
            Learn Concepts
          </Link>
          <Link
            to="/practice"
            className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-dark-card border-2 border-slate-200 dark:border-dark-border hover:border-primary-500 dark:hover:border-primary-500 text-slate-900 dark:text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <Code2 className="w-6 h-6 text-primary-500" />
            Practice DSA
          </Link>
          <Link
            to="/cp"
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <Trophy className="w-6 h-6 text-yellow-500" />
            Competitive Programming
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
