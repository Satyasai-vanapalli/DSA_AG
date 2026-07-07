import { Code2, BrainCircuit, Trophy, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

export default function Landing() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-center">
      {/* Abstract Animated Shapes in Background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl -z-10 animate-[float_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent-500/10 rounded-full blur-3xl -z-10 animate-[float_12s_ease-in-out_infinite_reverse]" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center z-10"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium text-primary-500 dark:text-primary-400 mb-8 border border-primary-500/20">
          <Sparkles className="w-4 h-4" />
          <span>The next-generation coding platform</span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-extrabold text-slate-900 dark:text-white tracking-tighter mb-6 leading-tight">
          Code with <br/>
          <span className="glow-text">Absolute Mastery.</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 font-medium">
          Elevate your logic, master algorithms, and conquer coding interviews with a platform designed for the elite.
        </motion.p>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1 */}
          <Link to="/learn" className="group relative rounded-3xl p-8 glass-card border border-white/20 dark:border-white/10 hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.3)] text-left overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30">
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">Master Concepts</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">Learn the theory and core fundamentals across multiple languages.</p>
            <div className="flex items-center text-primary-600 dark:text-primary-400 font-bold text-sm uppercase tracking-wider">
              Start Learning <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2 */}
          <Link to="/practice" className="group relative rounded-3xl p-8 glass-card border border-white/20 dark:border-white/10 hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.3)] text-left overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center mb-6 shadow-lg shadow-accent-500/30">
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-accent-500 transition-colors">Practice DSA</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">Solve standard data structures and algorithm problems step-by-step.</p>
            <div className="flex items-center text-accent-600 dark:text-accent-400 font-bold text-sm uppercase tracking-wider">
              Start Practicing <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3 */}
          <Link to="/cp" className="group relative rounded-3xl p-8 glass-card border border-white/20 dark:border-white/10 hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(234,179,8,0.3)] text-left overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/30">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-yellow-500 transition-colors">Competitive</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">Prepare for real-world contests with advanced algorithmic challenges.</p>
            <div className="flex items-center text-yellow-600 dark:text-yellow-500 font-bold text-sm uppercase tracking-wider">
              Compete Now <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
