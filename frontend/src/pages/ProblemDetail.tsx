import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roadmapApi } from '../api/roadmap';
import { progressApi } from '../api/progress';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { ArrowLeft, CheckCircle, Star, PlayCircle, Copy, FileText } from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { PlatformIcon, getPlatformName } from '../components/PlatformIcon';

export default function ProblemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>('optimal');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const { data: problem, isLoading } = useQuery({
    queryKey: ['problem', id],
    queryFn: () => roadmapApi.getProblemById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (problem && problem.solutions && problem.solutions.length > 0) {
      if (!selectedLanguage) {
        setSelectedLanguage(problem.solutions[0].language);
      }
    }
  }, [problem]);

  const activeLangObj = problem?.solutions?.find(s => s.language === selectedLanguage) || problem?.solutions?.[0];

  useEffect(() => {
    if (activeLangObj) {
      if (activeLangObj.optimalSolution) setActiveTab('optimal');
      else if (activeLangObj.betterSolution) setActiveTab('better');
      else if (activeLangObj.bruteSolution) setActiveTab('brute');
      else if (activeLangObj.additionalSolutions && activeLangObj.additionalSolutions.length > 0) setActiveTab('solution_0');
    }
  }, [activeLangObj]);

  const { data: userProgress } = useQuery({
    queryKey: ['progress'],
    queryFn: progressApi.getMyProgress,
    enabled: isAuthenticated,
  });

  // Track last opened
  useEffect(() => {
    if (isAuthenticated && id) {
      progressApi.updateLastOpened(id).catch(console.error);
    }
  }, [id, isAuthenticated]);

  const toggleCompleted = useMutation({
    mutationFn: (timeSpent?: number) => progressApi.toggleCompleted(id!, timeSpent),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['progress'] });
      const previousProgress = queryClient.getQueryData(['progress']);
      queryClient.setQueryData(['progress'], (old: any) => {
        if (!old) return old;
        const index = old.findIndex((p: any) => p.problemId === id);
        if (index > -1) {
          const newProgress = [...old];
          newProgress[index] = { ...newProgress[index], completed: !newProgress[index].completed };
          return newProgress;
        } else {
          return [...old, { problemId: id, completed: true }];
        }
      });
      return { previousProgress };
    },
    onError: (_err, _newData, context: any) => {
      queryClient.setQueryData(['progress'], context.previousProgress);
      toast('Failed to update progress', 'error');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  });

  const handleToggleComplete = () => {
    toggleCompleted.mutate(undefined);
  };

  const toggleRevision = useMutation({
    mutationFn: () => progressApi.toggleRevision(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      toast('Revision status updated', 'success');
    },
    onError: () => toast('Failed to update revision status', 'error')
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="h-6 w-24 bg-slate-200 dark:bg-slate-800/60 rounded-md relative overflow-hidden">
           <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent w-1/2" />
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="h-8 w-16 bg-slate-200 dark:bg-slate-800/60 rounded-lg relative overflow-hidden">
                 <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent w-1/2" />
               </motion.div>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800/60 rounded-xl relative overflow-hidden">
                 <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.2 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent w-1/2" />
               </motion.div>
               <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="h-14 w-full bg-slate-200 dark:bg-slate-800/60 rounded-xl relative overflow-hidden">
                    <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.3 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent w-1/2" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="h-14 w-full bg-slate-200 dark:bg-slate-800/60 rounded-xl relative overflow-hidden">
                    <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.4 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent w-1/2" />
                  </motion.div>
               </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
             <div className="glass-card rounded-3xl p-4 md:p-6 min-h-[600px] relative overflow-hidden">
                <div className="flex gap-2 mb-6">
                  {[1,2,3].map(i => (
                     <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + (i * 0.1) }} className="h-10 w-24 bg-slate-200 dark:bg-slate-800/60 rounded-lg relative overflow-hidden">
                       <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.2 + (i * 0.1) }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent w-1/2" />
                     </motion.div>
                  ))}
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="h-[500px] w-full bg-slate-200 dark:bg-slate-800/60 rounded-2xl relative overflow-hidden">
                  <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.5 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent w-1/2" />
                </motion.div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Problem Not Found</h2>
        <button onClick={() => navigate('/')} className="text-primary-600 hover:underline">
          Return to Roadmap
        </button>
      </div>
    );
  }

  const prog = userProgress?.find(up => up.problemId === id);
  const isCompleted = prog?.completed || false;
  const isRevision = prog?.revision || false;

  const currentSolution = activeLangObj ? (
    activeTab === 'brute' ? activeLangObj.bruteSolution :
    activeTab === 'better' ? activeLangObj.betterSolution :
    activeTab === 'optimal' ? activeLangObj.optimalSolution :
    (activeTab.startsWith('solution_') ? activeLangObj.additionalSolutions?.[parseInt(activeTab.split('_')[1])]?.code : null)
  ) : null;

  const currentTc = activeLangObj ? (
    activeTab === 'brute' ? activeLangObj.bruteTc :
    activeTab === 'better' ? activeLangObj.betterTc :
    activeTab === 'optimal' ? activeLangObj.optimalTc :
    (activeTab.startsWith('solution_') ? activeLangObj.additionalSolutions?.[parseInt(activeTab.split('_')[1])]?.tc : null)
  ) : null;

  const currentSc = activeLangObj ? (
    activeTab === 'brute' ? activeLangObj.bruteSc :
    activeTab === 'better' ? activeLangObj.betterSc :
    activeTab === 'optimal' ? activeLangObj.optimalSc :
    (activeTab.startsWith('solution_') ? activeLangObj.additionalSolutions?.[parseInt(activeTab.split('_')[1])]?.sc : null)
  ) : null;

  const copyCode = () => {
    if (currentSolution) {
      navigator.clipboard.writeText(currentSolution);
      toast('Code copied to clipboard', 'success');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Problem Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex flex-wrap items-center gap-3 mb-4 relative z-10">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm ${
                problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' :
                problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20' :
                'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
              }`}>
                {problem.difficulty}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight relative z-10 glow-text">
              {problem.title}
            </h1>

            {isAuthenticated && (
              <div className="flex gap-3 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                <button
                  onClick={handleToggleComplete}
                  disabled={toggleCompleted.isPending}
                  className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                    isCompleted 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/25 hover:bg-green-600 hover:scale-[1.02]' 
                    : 'bg-white/50 dark:bg-black/20 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
                  }`}
                >
                  <CheckCircle className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
                  {isCompleted ? 'Completed' : 'Mark as Complete'}
                </button>
                <button
                  onClick={() => toggleRevision.mutate()}
                  disabled={toggleRevision.isPending}
                  className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                    isRevision 
                    ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/25 hover:bg-yellow-600 hover:scale-[1.02]' 
                    : 'bg-white/50 dark:bg-black/20 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
                  }`}
                >
                  <Star className={`w-5 h-5 ${isRevision ? 'text-white fill-white' : 'text-slate-400'}`} />
                  {isRevision ? 'Marked for Revision' : 'Mark for Revision'}
                </button>
              </div>
            )}

            {/* Links and Videos */}
            <div className="space-y-3">
              {problem.problemLink && (
                <div className="flex items-center gap-2 py-2">
                  <PlatformIcon name={getPlatformName(problem.problemLink)} url={problem.problemLink} />
                  <a href={problem.problemLink.startsWith('http') ? problem.problemLink : `https://${problem.problemLink}`} target="_blank" rel="noopener noreferrer" className="font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Solve on {getPlatformName(problem.problemLink) !== 'External' ? getPlatformName(problem.problemLink) : 'Platform'}
                  </a>
                </div>
              )}
              {problem.youtubeLink && (
                <a href={problem.youtubeLink.startsWith('http') ? problem.youtubeLink : `https://${problem.youtubeLink}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-semibold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                  <PlayCircle className="w-5 h-5" /> Watch Video Explanation
                </a>
              )}
              {problem.documentationLink && (
                <a href={problem.documentationLink.startsWith('http') ? problem.documentationLink : `https://${problem.documentationLink}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-3 bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 font-semibold rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors">
                  <FileText className="w-5 h-5" /> Read Documentation
                </a>
              )}
            </div>

            {/* Documentation Content */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-500" />
                  Documentation
                </h3>
              </div>
              {problem.description ? (
                <div className="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                  {problem.description}
                </div>
              ) : (
                <div className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  Oops, still not added documentation.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Code Editor */}
        <div className="lg:col-span-2">
          {/* Editor Container with Glow */}
          <div className="glass-card rounded-3xl overflow-hidden shadow-2xl glow-border flex flex-col h-[700px] lg:h-[800px]">
            {/* Editor Header */}
            <div className="border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 backdrop-blur-sm relative z-10">
              <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                {(['brute', 'better', 'optimal'] as const).map((tab) => {
                  const hasSolution = activeLangObj && (
                    (tab === 'brute' && activeLangObj.bruteSolution) ||
                    (tab === 'better' && activeLangObj.betterSolution) ||
                    (tab === 'optimal' && activeLangObj.optimalSolution)
                  );

                  if (!hasSolution) return null;

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap capitalize ${
                        activeTab === tab
                          ? 'bg-[#1e1e1e] text-blue-400'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#2d2d2d]'
                      }`}
                    >
                      {tab} Solution
                    </button>
                  );
                })}
                
                {activeLangObj?.additionalSolutions?.map((sol: any, index: number) => {
                  const tabId = `solution_${index}`;
                  return (
                    <button
                      key={tabId}
                      onClick={() => setActiveTab(tabId)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                        activeTab === tabId
                          ? 'bg-[#1e1e1e] text-blue-400'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#2d2d2d]'
                      }`}
                    >
                      {sol.name || `Solution ${index + 1}`}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 pr-2">
                {(currentTc || currentSc) && (
                  <div className="flex items-center gap-2 text-xs">
                    {currentTc && <span className="bg-slate-700 text-slate-200 px-2 py-1 rounded font-mono">TC: {currentTc}</span>}
                    {currentSc && <span className="bg-slate-700 text-slate-200 px-2 py-1 rounded font-mono">SC: {currentSc}</span>}
                  </div>
                )}
                {problem.solutions && problem.solutions.length > 0 && (
                  <select 
                    value={selectedLanguage} 
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-[#2d2d2d] text-white text-xs px-2 py-1 rounded border border-[#444] focus:outline-none focus:border-blue-500"
                  >
                    {problem.solutions.map((s: any) => (
                      <option key={s.language} value={s.language}>{s.language}</option>
                    ))}
                  </select>
                )}
                <button onClick={copyCode} className="p-1.5 text-slate-400 hover:text-white rounded transition-colors" title="Copy Code">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 relative">
              {currentSolution ? (
                <Editor
                  height="100%"
                  language={selectedLanguage.toLowerCase() === 'python' ? 'python' : selectedLanguage.toLowerCase() === 'java' ? 'java' : 'cpp'}
                  theme="vs-dark"
                  value={currentSolution}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 16, bottom: 16 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                  Select a solution tab to view code.
                </div>
              )}
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
