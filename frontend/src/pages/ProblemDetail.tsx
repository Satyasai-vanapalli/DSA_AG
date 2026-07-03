import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  const { data: problem, isLoading } = useQuery({
    queryKey: ['problem', id],
    queryFn: () => roadmapApi.getProblemById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (problem) {
      if (problem.optimalSolution) setActiveTab('optimal');
      else if (problem.betterSolution) setActiveTab('better');
      else if (problem.bruteSolution) setActiveTab('brute');
      else if (problem.additionalSolutions && problem.additionalSolutions.length > 0) setActiveTab('solution_0');
    }
  }, [problem]);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast('Progress updated successfully', 'success');
    },
    onError: () => toast('Failed to update progress', 'error')
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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
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

  const currentSolution = 
    activeTab === 'brute' ? problem.bruteSolution :
    activeTab === 'better' ? problem.betterSolution :
    activeTab === 'optimal' ? problem.optimalSolution :
    (activeTab.startsWith('solution_') ? problem.additionalSolutions?.[parseInt(activeTab.split('_')[1])] : null);

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
          <div className="bg-white dark:bg-dark-card rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-dark-border shadow-sm">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-md ${
                problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
              }`}>
                {problem.difficulty}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-6">
              {problem.title}
            </h1>

            {isAuthenticated && (
              <div className="flex gap-3 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                <button
                  onClick={handleToggleComplete}
                  disabled={toggleCompleted.isPending}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all ${
                    isCompleted 
                      ? 'bg-green-500 text-white shadow-md shadow-green-500/20' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <CheckCircle className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
                  {isCompleted ? 'Completed' : 'Mark Complete'}
                </button>
                <button
                  onClick={() => toggleRevision.mutate()}
                  disabled={toggleRevision.isPending}
                  className={`flex items-center justify-center gap-2 px-4 rounded-xl font-semibold transition-all ${
                    isRevision 
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={isRevision ? "Remove from Revision" : "Mark for Revision"}
                >
                  <Star className={`w-5 h-5 ${isRevision ? 'fill-current' : ''}`} />
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
                  <FileText className="w-5 h-5" /> Read Documentation Link
                </a>
              )}
            </div>

            {/* Documentation Content */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" />
                Documentation Data
              </h3>
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
          <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col h-[600px] lg:h-[800px]">
            {/* Editor Header */}
            <div className="bg-[#252526] border-b border-[#333] p-2 flex items-center justify-between">
              <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                {(['brute', 'better', 'optimal'] as const).map((tab) => {
                  const hasSolution = 
                    (tab === 'brute' && problem.bruteSolution) ||
                    (tab === 'better' && problem.betterSolution) ||
                    (tab === 'optimal' && problem.optimalSolution);

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
                
                {problem.additionalSolutions?.map((_: string, index: number) => {
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
                      Solution {index + 1}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-1 pr-2">
                <button onClick={copyCode} className="p-2 text-slate-400 hover:text-white rounded transition-colors" title="Copy Code">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 relative">
              {currentSolution ? (
                <Editor
                  height="100%"
                  language="cpp" // Default to a readable language like cpp/java
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
