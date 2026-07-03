import { useState, useMemo, useEffect, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roadmapApi, type Concept } from '../api/roadmap';
import { progressApi } from '../api/progress';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, CheckCircle, Code2, AlertCircle, Search, Star, PlayCircle, X, Copy, FileText } from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import Leaderboard from './Leaderboard';
import Analytics from './Analytics';

import { motion, AnimatePresence } from 'framer-motion';
import { PlatformIcon, getPlatformName } from '../components/PlatformIcon';



export default function Home({ category }: { category: string }) {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'problems' | 'leaderboard' | 'analytics'>('problems');

  const { data: concepts, isLoading, error } = useQuery({
    queryKey: ['concepts', category],
    queryFn: () => roadmapApi.getConceptsByCategory(category),
  });

  const { data: userStats } = useQuery({
    queryKey: ['stats', category],
    queryFn: () => progressApi.getMyStats(category),
    enabled: isAuthenticated,
  });

  const filteredConcepts = useMemo(() => {
    if (!concepts) return [];
    if (!searchQuery) return concepts;
    const lowerQuery = searchQuery.toLowerCase();
    return concepts.filter(c => {
      if ((c.name || '').toLowerCase().includes(lowerQuery)) return true;
      if (c.problems?.some(p => (p.title || '').toLowerCase().includes(lowerQuery))) return true;
      if (c.children?.some(sub => (sub.name || '').toLowerCase().includes(lowerQuery) || sub.problems?.some(p => (p.title || '').toLowerCase().includes(lowerQuery)))) return true;
      return false;
    });
  }, [concepts, searchQuery]);

  const pageTitle = category === 'LEARN'
    ? 'Learn Java'
    : category === 'LEARN_PYTHON'
      ? 'Learn Python'
      : category === 'LEARN_C'
        ? 'Learn C Programming'
        : category === 'LEARN_CPP'
          ? 'Learn C++'
          : category === 'LEARN_KOTLIN'
            ? 'Learn Kotlin'
            : category === 'PRACTICE'
              ? 'DSA Practice'
              : 'Competitive Programming';

  const pageSubtitle = category.startsWith('LEARN')
    ? 'Master theory and concepts.'
    : category === 'PRACTICE'
      ? 'Practice standard DSA problems.'
      : 'Prepare for contests with advanced problems.';

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2 dark:text-white">Failed to load {pageTitle.toLowerCase()}</h2>
        <p className="text-slate-600 dark:text-slate-400">Please try refreshing the page later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {pageSubtitle}
          </p>
          {category === 'LEARN_PYTHON' && (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Special thanks to <a href="https://jayasimha-portfolio-2300032389.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">JAYASIMHA</a> for managing the Python curriculum!
            </p>
          )}
        </div>

        {isAuthenticated && userStats && (
          <div className="flex gap-4">
            <div className="bg-white dark:bg-dark-card px-6 py-4 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm flex flex-col items-center min-w-[120px]">
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                {userStats.completed} <span className="text-xl text-slate-400">/ {userStats.total}</span>
              </span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Completed</span>
            </div>
            <div className="bg-white dark:bg-dark-card px-6 py-4 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm flex flex-col items-center min-w-[120px]">
              <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{userStats.revision}</span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">To Revise</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('problems')}
          className={`px-6 py-3 font-semibold text-sm transition-colors relative ${activeTab === 'problems' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          {category.startsWith('LEARN') ? 'Path' : 'Problems'}
          {activeTab === 'problems' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400" />
          )}
        </button>
        {!category.startsWith('LEARN') && (
          <>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 font-semibold text-sm transition-colors relative ${activeTab === 'leaderboard' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Leaderboard
              {activeTab === 'leaderboard' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-semibold text-sm transition-colors relative ${activeTab === 'analytics' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Analytics
              {activeTab === 'analytics' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400" />
              )}
            </button>
          </>
        )}
      </div>

      {activeTab === 'leaderboard' && (
        <Leaderboard category={category} />
      )}

      {activeTab === 'analytics' && (
        <Analytics category={category} />
      )}

      {activeTab === 'problems' && (
        <>
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-dark-card p-4 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search concepts or problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white transition-all"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${difficultyFilter === diff
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Roadmap List */}
          <div className="space-y-4">
            {filteredConcepts?.map((concept, index) => (
              <ConceptAccordion
                key={concept.id}
                concept={concept}
                index={index + 1}
                difficultyFilter={difficultyFilter}
                searchQuery={searchQuery}
              />
            ))}
            {filteredConcepts?.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-dark-card rounded-3xl border border-slate-200 dark:border-dark-border">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No matches found</h3>
                <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ConceptAccordion({ concept, index, difficultyFilter, searchQuery, depth = 0 }: { concept: Concept; index: number, difficultyFilter: string, searchQuery: string, depth?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedProblemIds, setExpandedProblemIds] = useState<Set<string>>(new Set());
  const [selectedSolutionProblem, setSelectedSolutionProblem] = useState<any | null>(null);

  const toggleProblemExpansion = (problemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedProblemIds(prev => {
      const next = new Set(prev);
      if (next.has(problemId)) next.delete(problemId);
      else next.add(problemId);
      return next;
    });
  };

  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const toggleCompletedMutation = useMutation({
    mutationFn: (data: { problemId: string; timeSpent?: number }) => progressApi.toggleCompleted(data.problemId, data.timeSpent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  });

  const toggleConceptCompletedMutation = useMutation({
    mutationFn: (conceptId: string) => progressApi.toggleConceptCompleted(conceptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conceptProgress'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  });

  const handleToggleCompleted = (e: React.MouseEvent, problemId: string, _isCompleted: boolean) => {
    e.stopPropagation();
    toggleCompletedMutation.mutate({ problemId });
  };

  const handleToggleConceptCompleted = (e: React.MouseEvent, conceptId: string) => {
    e.stopPropagation();
    toggleConceptCompletedMutation.mutate(conceptId);
  };

  const expanded = isOpen || searchQuery.length > 0;

  const { data: problems, isLoading } = useQuery({
    queryKey: ['problems', concept.id],
    queryFn: () => roadmapApi.getProblemsByConcept(concept.id),
  });

  const { data: userProgress } = useQuery({
    queryKey: ['progress'],
    queryFn: progressApi.getMyProgress,
    enabled: isAuthenticated,
  });

  const { data: userConceptProgress } = useQuery({
    queryKey: ['conceptProgress'],
    queryFn: progressApi.getMyConceptProgress,
    enabled: isAuthenticated,
  });

  // Fetch sub-concepts
  const { data: subConcepts } = useQuery({
    queryKey: ['subconcepts', concept.id],
    queryFn: () => roadmapApi.getSubConcepts(concept.id),
  });

  const filteredProblems = useMemo(() => {
    if (!problems) return [];
    let result = problems;
    if (difficultyFilter !== 'All') {
      result = result.filter(p => p.difficulty === difficultyFilter);
    }
    if (searchQuery) {
      result = result.filter(p => (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [problems, difficultyFilter, searchQuery]);

  if (searchQuery && filteredProblems.length === 0 && !(concept.name || '').toLowerCase().includes(searchQuery.toLowerCase())) {
    return null;
  }

  const isConceptCompleted = useMemo(() => {
    if (!userConceptProgress) return false;
    return userConceptProgress.some(cp => cp.conceptId === concept.id && cp.completed);
  }, [userConceptProgress, concept.id]);

  const { completedCount, conceptProgress, totalItemsCount } = useMemo(() => {
    let problemCount = 0;
    let completedProblemCount = 0;
    
    if (problems && problems.length > 0) {
      problemCount = problems.length;
      if (userProgress) {
        completedProblemCount = problems.filter(p =>
          userProgress.find(up => up.problemId === p.id && up.completed)
        ).length;
      }
    }

    let subConceptsWithMaterial = 0;
    let completedSubConceptsWithMaterial = 0;

    if (subConcepts && subConcepts.length > 0) {
      subConceptsWithMaterial = subConcepts.filter(c => c.description && c.description.trim() !== '').length;
      if (userConceptProgress && subConceptsWithMaterial > 0) {
        completedSubConceptsWithMaterial = subConcepts.filter(c => 
          c.description && c.description.trim() !== '' && userConceptProgress.find(up => up.conceptId === c.id && up.completed)
        ).length;
      }
    }

    const hasMaterial = concept.description && concept.description.trim() !== '' ? 1 : 0;
    const materialCompleted = isConceptCompleted ? 1 : 0;

    const totalItems = problemCount + subConceptsWithMaterial + hasMaterial;
    const completedItems = completedProblemCount + completedSubConceptsWithMaterial + materialCompleted;

    if (totalItems === 0) return { completedCount: 0, conceptProgress: 0, totalItemsCount: 0 };

    return {
      completedCount: completedItems,
      conceptProgress: Math.round((completedItems / totalItems) * 100),
      totalItemsCount: totalItems
    };
  }, [problems, userProgress, concept.description, isConceptCompleted, subConcepts, userConceptProgress]);

  if (concept.isMaterialOnly) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border overflow-hidden transition-all duration-300 shadow-sm mb-4">
        <div className="px-6 py-6 bg-blue-50/50 dark:bg-blue-900/5 flex justify-between items-start gap-4">
          <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap flex-1 leading-relaxed">{concept.description || concept.name}</div>
          {isAuthenticated && (
            <button
              onClick={(e) => handleToggleConceptCompleted(e, concept.id)}
              className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors"
              title={isConceptCompleted ? "Mark material as incomplete" : "Mark material as complete"}
            >
              {isConceptCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-500 hover:border-green-500 transition-colors" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between bg-white dark:bg-dark-card hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-bold text-lg">
            {index}
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{concept.name}</h3>
            {totalItemsCount > 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isAuthenticated
                  ? `${completedCount}/${totalItemsCount} items completed`
                  : `${totalItemsCount} item${totalItemsCount !== 1 ? 's' : ''}`
                }
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6">
          {isAuthenticated && totalItemsCount > 0 && (
            <div className="hidden sm:flex items-center gap-3 w-32">
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${conceptProgress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 w-9 text-right">
                {conceptProgress}%
              </span>
            </div>
          )}
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
            <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
              <ChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </motion.div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 dark:border-dark-border overflow-hidden"
          >
            <div className="overflow-x-auto">
              {/* Material/Description */}
              {concept.description && (
                <div className="px-6 py-4 bg-blue-50/50 dark:bg-blue-900/5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start gap-4">
                  <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap flex-1">{concept.description}</div>
                  {isAuthenticated && (
                    <button
                      onClick={(e) => handleToggleConceptCompleted(e, concept.id)}
                      className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors"
                      title={isConceptCompleted ? "Mark material as incomplete" : "Mark material as complete"}
                    >
                      {isConceptCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-500 hover:border-green-500 transition-colors" />
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Sub-Concepts */}
              {subConcepts && subConcepts.length > 0 && (
                <div className="px-6 py-4 space-y-3">
                  {subConcepts.map((sub, i) => (
                    <ConceptAccordion
                      key={sub.id}
                      concept={sub}
                      index={i + 1}
                      difficultyFilter={difficultyFilter}
                      searchQuery={searchQuery}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              )}
              {isLoading ? (
                <div className="py-8 flex justify-center">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredProblems.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-16 text-center">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Problem</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-28">Difficulty</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-28">Problem Link</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-28 text-center">Video Solution</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-24 text-center">Solution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredProblems.map((problem) => {
                      const prog = userProgress?.find((up: any) => up.problemId === problem.id);
                      const isCompleted = prog?.completed || false;
                      const isRevision = prog?.revision || false;

                      return (
                        <Fragment key={problem.id}>
                          <tr
                            onClick={(e) => toggleProblemExpansion(problem.id, e)}
                            className={`cursor-pointer transition-colors group ${isCompleted
                              ? 'bg-green-50/40 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20'
                              : 'bg-white dark:bg-dark-card hover:bg-slate-50 dark:hover:bg-slate-800/40'
                              }`}
                          >
                            {/* Status */}
                            <td className="px-4 py-3.5 text-center">
                              {isAuthenticated ? (
                                <button
                                  onClick={(e) => handleToggleCompleted(e, problem.id, isCompleted)}
                                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors mx-auto"
                                  title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                                >
                                  {isCompleted ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-500 hover:border-green-500 transition-colors" />
                                  )}
                                </button>
                              ) : (
                                <Code2 className="w-4 h-4 text-slate-400 mx-auto" />
                              )}
                            </td>

                            {/* Problem Name */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium text-sm transition-colors ${isCompleted
                                  ? 'text-green-800 dark:text-green-300'
                                  : 'text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400'
                                  }`}>
                                  {problem.title}
                                </span>
                                {isRevision && (
                                  <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded">
                                    <Star className="w-3 h-3 fill-current" /> Revise
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Difficulty */}
                            <td className="px-4 py-3.5">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' :
                                  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                }`}>
                                {problem.difficulty}
                              </span>
                            </td>

                            {/* Problem Links */}
                            <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {problem.platformLinks && problem.platformLinks.length > 0 ? (
                                  problem.platformLinks.map((link: any, i: number) => (
                                    <PlatformIcon key={i} name={link.platformName} url={link.url} />
                                  ))
                                ) : problem.problemLink ? (
                                  <PlatformIcon name={getPlatformName(problem.problemLink)} url={problem.problemLink} />
                                ) : (
                                  <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                                )}
                              </div>
                            </td>

                            {/* Video Solution */}
                            <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                              {problem.youtubeLink ? (
                                <a
                                  href={problem.youtubeLink.startsWith('http') ? problem.youtubeLink : `https://${problem.youtubeLink}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-xs font-medium"
                                >
                                  <PlayCircle className="w-3.5 h-3.5" /> Video
                                </a>
                              ) : (
                                <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                              )}
                            </td>

                            {/* Solution */}
                            <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSolutionProblem(problem);
                                }}
                                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors text-xs font-medium"
                              >
                                <Code2 className="w-3.5 h-3.5" /> View Solution
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Documentation Row */}
                          {expandedProblemIds.has(problem.id) && (
                            <tr>
                              <td colSpan={6} className="px-4 py-4 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                                <div className="text-sm text-slate-600 dark:text-slate-300 md:pl-16 space-y-4">
                                  {problem.documentationLink && (
                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                                      <FileText className="w-4 h-4" />
                                      <a href={problem.documentationLink.startsWith('http') ? problem.documentationLink : `https://${problem.documentationLink}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        Read Official Documentation
                                      </a>
                                    </div>
                                  )}
                                  {problem.description ? (
                                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                                      {problem.description}
                                    </div>
                                  ) : (
                                    <div className="italic text-slate-400">Oops, still not added documentation.</div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No matching problems in this topic.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedSolutionProblem && (
          <SolutionModal
            problem={selectedSolutionProblem}
            onClose={() => setSelectedSolutionProblem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SolutionModal({ problem, onClose }: { problem: any, onClose: () => void }) {
  const [activeLang, setActiveLang] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('optimal');

  // Initialize selected language
  useEffect(() => {
    if (problem && problem.solutions && problem.solutions.length > 0) {
      // Pick first language that has at least one solution
      const firstValid = problem.solutions.find((s: any) => s.bruteSolution || s.betterSolution || s.optimalSolution || (s.additionalSolutions && s.additionalSolutions.length > 0));
      if (firstValid) {
        setActiveLang(firstValid.language);
      }
    }
  }, [problem]);

  const activeSol = useMemo(() => {
    if (!problem?.solutions || !activeLang) return null;
    return problem.solutions.find((s: any) => s.language === activeLang);
  }, [problem, activeLang]);

  useEffect(() => {
    if (activeSol) {
      if (activeSol.optimalSolution) setActiveTab('optimal');
      else if (activeSol.betterSolution) setActiveTab('better');
      else if (activeSol.bruteSolution) setActiveTab('brute');
      else if (activeSol.additionalSolutions && activeSol.additionalSolutions.length > 0) setActiveTab('solution_0');
    }
  }, [activeSol, activeLang]);

  const currentSolution = activeSol ? (
    activeTab === 'brute' ? activeSol.bruteSolution :
      activeTab === 'better' ? activeSol.betterSolution :
        activeTab === 'optimal' ? activeSol.optimalSolution :
          (activeTab.startsWith('solution_') ? activeSol.additionalSolutions?.[parseInt(activeTab.split('_')[1])]?.code : null)
  ) : null;

  const currentTc = activeSol ? (
    activeTab === 'brute' ? activeSol.bruteTc :
    activeTab === 'better' ? activeSol.betterTc :
    activeTab === 'optimal' ? activeSol.optimalTc :
    (activeTab.startsWith('solution_') ? activeSol.additionalSolutions?.[parseInt(activeTab.split('_')[1])]?.tc : null)
  ) : null;

  const currentSc = activeSol ? (
    activeTab === 'brute' ? activeSol.bruteSc :
    activeTab === 'better' ? activeSol.betterSc :
    activeTab === 'optimal' ? activeSol.optimalSc :
    (activeTab.startsWith('solution_') ? activeSol.additionalSolutions?.[parseInt(activeTab.split('_')[1])]?.sc : null)
  ) : null;

  const copyCode = () => {
    if (currentSolution) {
      navigator.clipboard.writeText(currentSolution);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-[#1e1e1e] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col h-[80vh]"
      >
        <div className="bg-[#252526] border-b border-[#333] flex flex-col">
          {/* Language Tabs */}
          {problem.solutions && problem.solutions.length > 0 && (
            <div className="flex gap-1 overflow-x-auto hide-scrollbar px-2 pt-2">
              {problem.solutions.map((sol: any) => {
                const hasAny = sol.bruteSolution || sol.betterSolution || sol.optimalSolution || (sol.additionalSolutions && sol.additionalSolutions.length > 0);
                if (!hasAny) return null;
                return (
                  <button
                    key={sol.language}
                    onClick={() => setActiveLang(sol.language)}
                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${
                      activeLang === sol.language
                        ? 'bg-[#1e1e1e] text-emerald-400 border-b-2 border-emerald-400'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#2d2d2d]'
                    }`}
                  >
                    {sol.language}
                  </button>
                );
              })}
            </div>
          )}

          {/* Solution Type Tabs */}
          <div className="flex items-center justify-between px-2 py-1 bg-[#1e1e1e] border-b border-[#333]">
            <div className="flex gap-1 overflow-x-auto hide-scrollbar">
              {activeSol && (['brute', 'better', 'optimal'] as const).map((tab) => {
                const hasSolution =
                  (tab === 'brute' && activeSol.bruteSolution) ||
                  (tab === 'better' && activeSol.betterSolution) ||
                  (tab === 'optimal' && activeSol.optimalSolution);

                if (!hasSolution) return null;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap capitalize ${activeTab === tab
                      ? 'bg-[#2d2d2d] text-blue-400'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-[#252526]'
                      }`}
                  >
                    {tab} Solution
                  </button>
                );
              })}

              {activeSol?.additionalSolutions?.map((asol: any, index: number) => {
                const tabId = `solution_${index}`;
                const name = asol?.name && asol.name.trim() !== '' ? asol.name : `Solution ${index + 1}`;
                return (
                  <button
                    key={tabId}
                    onClick={() => setActiveTab(tabId)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${activeTab === tabId
                      ? 'bg-[#2d2d2d] text-blue-400'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-[#252526]'
                      }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 pr-2">
              {(currentTc || currentSc) && (
                <div className="flex items-center gap-2 text-xs mr-2">
                  {currentTc && <span className="bg-slate-700 text-slate-200 px-2 py-1 rounded font-mono">TC: {currentTc}</span>}
                  {currentSc && <span className="bg-slate-700 text-slate-200 px-2 py-1 rounded font-mono">SC: {currentSc}</span>}
                </div>
              )}
              <button onClick={copyCode} className="p-1.5 text-slate-400 hover:text-white rounded transition-colors" title="Copy Code">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded transition-colors" title="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          {currentSolution ? (
            <Editor
              height="100%"
              language={activeLang?.toLowerCase() === 'python' ? 'python' : activeLang?.toLowerCase() === 'java' ? 'java' : 'cpp'}
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
              No solutions have been added for this problem yet.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
