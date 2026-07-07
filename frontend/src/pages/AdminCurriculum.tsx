import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roadmapApi, type Concept } from '../api/roadmap';
import { adminApi } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, GripVertical, ChevronDown, X, Edit2, FolderPlus, BookOpen, ListChecks, Search, ArrowRightLeft } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCurriculum({ category, title }: { category: string, title: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddConcept, setShowAddConcept] = useState(false);
  const [newConceptName, setNewConceptName] = useState('');
  const [newConceptDescription, setNewConceptDescription] = useState('');
  const [newConceptIsMaterialOnly, setNewConceptIsMaterialOnly] = useState(false);
  const [showProblemManager, setShowProblemManager] = useState(false);
  const [pmSearch, setPmSearch] = useState('');
  const [pmDifficultyFilter, setPmDifficultyFilter] = useState<string>('All');
  const [pmConceptFilter, setPmConceptFilter] = useState<string>('All');

  if (user?.role !== 'ADMIN' && !user?.adminCategories?.includes(category)) return <Navigate to="/" replace />;

  const { data: concepts, isLoading } = useQuery({
    queryKey: ['concepts', category],
    queryFn: () => roadmapApi.getConceptsByCategory(category),
  });

  const { data: allProblems, isLoading: isLoadingProblems } = useQuery({
    queryKey: ['allProblems', category],
    queryFn: () => roadmapApi.getProblemsByCategory(category),
    enabled: showProblemManager,
  });

  const moveProblemMutation = useMutation({
    mutationFn: ({ problemId, conceptId }: { problemId: string; conceptId: string }) =>
      roadmapApi.moveProblemToConcept(problemId, conceptId === "" ? "" : conceptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProblems', category] });
      queryClient.invalidateQueries({ queryKey: ['concepts', category] });
      toast('Problem moved successfully', 'success');
    },
    onError: (err: any) => {
      console.error("Failed to move problem:", err);
      const serverMsg = err?.response?.data?.message || err?.message || 'Unknown server error';
      toast(`Failed to move problem: ${serverMsg}`, 'error');
    },
  });

  // Flatten concepts tree into a flat list with indentation info for the dropdown
  const flatConcepts = useMemo(() => {
    if (!concepts) return [];
    const result: { id: string; name: string; depth: number }[] = [];
    const flatten = (items: Concept[], depth: number) => {
      for (const c of items) {
        if (!c.isMaterialOnly) {
          result.push({ id: c.id, name: c.name, depth });
        }
        if (c.children && c.children.length > 0) flatten(c.children, depth + 1);
      }
    };
    flatten(concepts, 0);
    return result;
  }, [concepts]);

  const filteredProblems = useMemo(() => {
    if (!allProblems) return [];
    return allProblems.filter(p => {
      const matchesSearch = !pmSearch || p.title.toLowerCase().includes(pmSearch.toLowerCase());
      const matchesDifficulty = pmDifficultyFilter === 'All' || p.difficulty === pmDifficultyFilter;
      const matchesConcept = pmConceptFilter === 'All' ||
        (pmConceptFilter === 'Unassigned' ? !p.concept : p.concept?.id === pmConceptFilter);
      return matchesSearch && matchesDifficulty && matchesConcept;
    });
  }, [allProblems, pmSearch, pmDifficultyFilter, pmConceptFilter]);

  const createConceptMutation = useMutation({
    mutationFn: () => adminApi.createConcept({ 
      name: newConceptIsMaterialOnly ? (newConceptName.trim() || 'Material Block') : newConceptName, 
      category,
      description: newConceptDescription,
      isMaterialOnly: newConceptIsMaterialOnly 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concepts', category] });
      toast('Concept created', 'success');
      setNewConceptName('');
      setNewConceptDescription('');
      setNewConceptIsMaterialOnly(false);
      setShowAddConcept(false);
    },
    onError: () => toast('Failed to create concept', 'error'),
  });

  const deleteConceptMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteConcept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concepts', category] });
      toast('Concept deleted', 'success');
    },
    onError: () => toast('Failed to delete concept', 'error'),
  });

  const reorderConceptsMutation = useMutation({
    mutationFn: adminApi.reorderConcepts,
    onSuccess: () => toast('Concepts reordered', 'success'),
    onError: () => {
      toast('Failed to reorder', 'error');
      queryClient.invalidateQueries({ queryKey: ['concepts', category] });
    },
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !concepts) return;
    
    const items = Array.from(concepts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    queryClient.setQueryData(['concepts', category], items);
    
    const orderedIds = items.map(c => c.id);
    reorderConceptsMutation.mutate(orderedIds);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 relative z-10">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors mb-3 font-semibold text-sm group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter">
            <span className="glow-text">{title}</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowProblemManager(true)} 
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5"
          >
            <ListChecks className="w-5 h-5 drop-shadow-md" /> Problem Manager
          </button>
          <button 
            onClick={() => setShowAddConcept(true)} 
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5 drop-shadow-md" /> Add Concept
          </button>
        </div>
      </div>

      {showAddConcept && (
        <div className="mb-8 glass-card rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-5 relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Concept Name</label>
              <input 
                type="text" 
                value={newConceptName} 
                onChange={(e) => setNewConceptName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (newConceptName.trim() || newConceptIsMaterialOnly)) createConceptMutation.mutate(); }}
                className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white disabled:opacity-50 transition-all shadow-inner"
                placeholder={newConceptIsMaterialOnly ? "Optional: Admin label (won't be shown to users)" : "e.g., Introduction to Arrays"}
              />
            </div>
            <div className="flex items-center gap-3 md:mt-9 bg-white/50 dark:bg-white/5 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10">
              <input 
                type="checkbox" 
                id="isMaterialOnly" 
                checked={newConceptIsMaterialOnly} 
                onChange={(e) => setNewConceptIsMaterialOnly(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded border-slate-300 focus:ring-primary-500 bg-white/50 dark:bg-black/20 cursor-pointer"
              />
              <label htmlFor="isMaterialOnly" className="text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap cursor-pointer select-none">
                Is Material Only
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Material (Markdown)</label>
            <textarea 
              value={newConceptDescription} 
              onChange={(e) => setNewConceptDescription(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px] bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white transition-all shadow-inner font-mono text-sm"
              placeholder="Add study materials, notes, or explanations in Markdown..."
            />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button 
              onClick={() => setShowAddConcept(false)}
              className="px-5 py-2.5 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all h-[44px] border border-slate-200 dark:border-white/5"
            >
              Cancel
            </button>
            <button 
              onClick={() => createConceptMutation.mutate()}
              disabled={(!newConceptName.trim() && !newConceptIsMaterialOnly) || createConceptMutation.isPending}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-50 h-[44px]"
            >
              {createConceptMutation.isPending ? 'Creating...' : 'Create Concept'}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="concepts-list">
            {(provided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {concepts?.map((concept, index) => (
                  <Draggable key={concept.id} draggableId={concept.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border overflow-hidden shadow-sm"
                      >
                        <ConceptRow 
                          concept={concept} 
                          dragHandleProps={provided.dragHandleProps} 
                          onDelete={() => deleteConceptMutation.mutate(concept.id)}
                          category={category}
                          depth={0}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Problem Manager Modal */}
      <AnimatePresence>
        {showProblemManager && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
            onClick={() => setShowProblemManager(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-5xl max-h-[90vh] glass-card rounded-3xl shadow-[0_0_40px_rgba(245,158,11,0.15)] flex flex-col overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 pointer-events-none" />
              {/* Header */}
              <div className="flex items-center justify-between p-6 md:px-8 md:py-6 border-b border-slate-200 dark:border-white/10 shrink-0 relative z-10 bg-white/30 dark:bg-black/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/30">
                    <ListChecks className="w-7 h-7 text-white drop-shadow-md" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Problem Manager</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-amber-200/70 mt-1">
                      {allProblems?.length ?? 0} problems total
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowProblemManager(false)} className="p-2.5 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-all hover:rotate-90">
                  <X className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              {/* Filters */}
              <div className="p-4 md:px-8 md:py-5 border-b border-slate-200 dark:border-white/10 shrink-0 flex flex-wrap items-center gap-4 relative z-10">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-amber-200/50" />
                  <input
                    type="text"
                    value={pmSearch}
                    onChange={(e) => setPmSearch(e.target.value)}
                    placeholder="Search problems..."
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white text-sm font-medium transition-all placeholder-slate-400 dark:placeholder-slate-500 shadow-inner"
                  />
                </div>
                <select
                  value={pmDifficultyFilter}
                  onChange={(e) => setPmDifficultyFilter(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer shadow-sm"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <select
                  value={pmConceptFilter}
                  onChange={(e) => setPmConceptFilter(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer max-w-[250px] shadow-sm"
                >
                  <option value="All">All Concepts</option>
                  <option value="Unassigned">Unassigned</option>
                  {flatConcepts.map(fc => (
                    <option key={fc.id} value={fc.id}>
                      {'—'.repeat(fc.depth)} {fc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
                {isLoadingProblems ? (
                  <div className="flex justify-center items-center p-16">
                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                  </div>
                ) : filteredProblems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-16 text-slate-400">
                    <Search className="w-16 h-16 mb-4 opacity-20 text-amber-500" />
                    <p className="text-xl font-bold dark:text-white">No problems found</p>
                    <p className="text-sm mt-1 font-medium text-slate-500">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white/80 dark:bg-black/60 backdrop-blur-md z-20 border-b border-slate-200 dark:border-white/10">
                      <tr>
                        <th className="text-left text-xs font-bold text-slate-500 dark:text-amber-200/50 uppercase tracking-widest px-8 py-4">Problem</th>
                        <th className="text-left text-xs font-bold text-slate-500 dark:text-amber-200/50 uppercase tracking-widest px-4 py-4 w-28">Difficulty</th>
                        <th className="text-left text-xs font-bold text-slate-500 dark:text-amber-200/50 uppercase tracking-widest px-4 py-4 w-72">
                          <div className="flex items-center gap-1.5">
                            <ArrowRightLeft className="w-4 h-4 text-amber-500" /> Move to Concept
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {filteredProblems.map((problem) => (
                        <tr key={problem.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-4">
                            <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{problem.title}</div>
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                              {problem.concept ? problem.concept.name : <span className="italic text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded-full">Unassigned</span>}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border ${
                              problem.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                              problem.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' :
                              'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 shadow-[0_0_10px_rgba(243,62,112,0.1)]'
                            }`}>
                              {problem.difficulty}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={problem.concept?.id || ''}
                              onChange={(e) => {
                                const newConceptId = e.target.value;
                                moveProblemMutation.mutate({ problemId: problem.id, conceptId: newConceptId });
                              }}
                              className="w-full px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl bg-white/50 dark:bg-black/40 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer hover:bg-white dark:hover:bg-black/60"
                            >
                              <option value="">Unassigned</option>
                              {flatConcepts.map(fc => (
                                <option key={fc.id} value={fc.id}>
                                  {'—'.repeat(fc.depth)} {fc.name}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 md:px-8 border-t border-slate-200 dark:border-white/10 shrink-0 flex items-center justify-between relative z-10 bg-white/30 dark:bg-black/20">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  SHOWING <span className="text-amber-600 dark:text-amber-400">{filteredProblems.length}</span> OF {allProblems?.length ?? 0} PROBLEMS
                </p>
                <button
                  onClick={() => setShowProblemManager(false)}
                  className="px-6 py-2.5 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-white font-bold rounded-xl transition-all text-sm border border-slate-200 dark:border-white/10 shadow-sm"
                >
                  Close Manager
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Recursive component for Concept row — supports infinite nesting
function ConceptRow({ concept, dragHandleProps, onDelete, category, depth }: { concept: Concept, dragHandleProps: any, onDelete: () => void, category: string, depth: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddProblem, setShowAddProblem] = useState(false);
  const [showAddSubConcept, setShowAddSubConcept] = useState(false);
  const [showEditMaterial, setShowEditMaterial] = useState(false);
  const [newSubConceptName, setNewSubConceptName] = useState('');
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);
  const [materialText, setMaterialText] = useState(concept.description || '');
  const [editConceptName, setEditConceptName] = useState(concept.name || '');
  const [editIsMaterialOnly, setEditIsMaterialOnly] = useState(concept.isMaterialOnly || false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch problems for this concept
  const { data: problems, isLoading: loadingProblems } = useQuery({
    queryKey: ['problems', concept.id],
    queryFn: () => roadmapApi.getProblemsByConcept(concept.id),
  });

  // Fetch sub-concepts for this concept
  const { data: subConcepts, isLoading: loadingChildren } = useQuery({
    queryKey: ['subconcepts', concept.id],
    queryFn: () => roadmapApi.getSubConcepts(concept.id),
  });

  // Create sub-concept mutation
  const createSubConceptMutation = useMutation({
    mutationFn: () => adminApi.createConcept({ name: newSubConceptName, category, parentId: concept.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subconcepts', concept.id] });
      toast('Sub-concept created', 'success');
      setNewSubConceptName('');
      setShowAddSubConcept(false);
    },
    onError: () => toast('Failed to create sub-concept', 'error'),
  });

  // Delete sub-concept mutation
  const deleteSubConceptMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteConcept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subconcepts', concept.id] });
      toast('Sub-concept deleted', 'success');
    },
    onError: () => toast('Failed to delete sub-concept', 'error'),
  });

  // Update material/description mutation
  const updateMaterialMutation = useMutation({
    mutationFn: () => adminApi.updateConcept(concept.id, { 
      name: editIsMaterialOnly ? (editConceptName.trim() || 'Material Block') : editConceptName, 
      description: materialText, 
      category,
      isMaterialOnly: editIsMaterialOnly 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concepts', category] });
      queryClient.invalidateQueries({ queryKey: ['subconcepts'] });
      toast('Concept updated', 'success');
      setShowEditMaterial(false);
    },
    onError: () => toast('Failed to update concept', 'error'),
  });

  const reorderProblemsMutation = useMutation({
    mutationFn: adminApi.reorderProblems,
    onSuccess: () => toast('Problems reordered', 'success'),
    onError: () => {
      toast('Failed to reorder problems', 'error');
      queryClient.invalidateQueries({ queryKey: ['problems', concept.id] });
    },
  });

  const reorderSubConceptsMutation = useMutation({
    mutationFn: adminApi.reorderConcepts,
    onSuccess: () => toast('Sub-concepts reordered', 'success'),
    onError: () => {
      toast('Failed to reorder sub-concepts', 'error');
      queryClient.invalidateQueries({ queryKey: ['subconcepts', concept.id] });
    },
  });

  const deleteProblemMutation = useMutation({
    mutationFn: adminApi.deleteProblem,
    onSuccess: () => {
      toast('Problem deleted', 'success');
      queryClient.invalidateQueries({ queryKey: ['problems', concept.id] });
    },
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !problems) return;
    
    const items = Array.from(problems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    queryClient.setQueryData(['problems', concept.id], items);
    
    const orderedIds = items.map(p => p.id);
    reorderProblemsMutation.mutate(orderedIds);
  };

  const handleSubConceptDragEnd = (result: DropResult) => {
    if (!result.destination || !subConcepts) return;
    
    const items = Array.from(subConcepts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    queryClient.setQueryData(['subconcepts', concept.id], items);
    
    const orderedIds = items.map(c => c.id);
    reorderSubConceptsMutation.mutate(orderedIds);
  };

  const subConceptCount = subConcepts?.length || 0;
  const problemCount = problems?.length || 0;

  return (
    <>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
          depth > 0 ? 'bg-white dark:bg-dark-card' : 'bg-slate-50 dark:bg-slate-800/40'
        }`}
      >
        <div className="flex items-center gap-4">
          {dragHandleProps && (
            <div {...dragHandleProps} onClick={(e) => e.stopPropagation()} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing">
              <GripVertical className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {depth > 0 && <span className="text-xs text-slate-400">↳</span>}
              <h3 className={`font-bold text-slate-900 dark:text-white ${depth === 0 ? 'text-lg' : 'text-base'}`}>{concept.name}</h3>
            </div>
            <div className="flex items-center gap-3 mt-1">
              {subConceptCount > 0 && (
                <span className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">
                  📂 {subConceptCount} sub-concept{subConceptCount !== 1 ? 's' : ''}
                </span>
              )}
              {problemCount > 0 && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {problemCount} problem{problemCount !== 1 ? 's' : ''}
                </span>
              )}
              {concept.description && (
                <span className="text-xs text-green-500 dark:text-green-400 font-medium">📄 Has Material</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              setMaterialText(concept.description || ''); 
              setEditConceptName(concept.name || ''); 
              setEditIsMaterialOnly(concept.isMaterialOnly || false);
              setShowEditMaterial(true); 
              setIsOpen(true); 
            }}
            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Edit Concept"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${concept.name}"?`)) onDelete(); }}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-200 dark:border-dark-border"
          >
            <div className={`p-4 ${depth > 0 ? 'pl-8' : ''}`}>
              {/* Action Buttons Row */}
              <div className="flex flex-wrap gap-2 mb-5">
                <button 
                  onClick={() => setShowAddSubConcept(true)}
                  className="text-sm px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-semibold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1"
                >
                  <FolderPlus className="w-4 h-4" /> Add Sub-Concept
                </button>
                <button 
                  onClick={() => setShowAddProblem(true)}
                  className="text-sm px-3 py-1.5 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-semibold rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Problem
                </button>
                <button 
                  onClick={() => { 
                    setMaterialText(concept.description || ''); 
                    setEditConceptName(concept.name || ''); 
                    setEditIsMaterialOnly(concept.isMaterialOnly || false);
                    setShowEditMaterial(true); 
                  }}
                  className="text-sm px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-semibold rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4" /> Edit Concept
                </button>
              </div>

              {/* Add Sub-Concept Form */}
              {showAddSubConcept && (
                <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-1">Sub-Concept Name</label>
                    <input 
                      type="text" 
                      value={newSubConceptName} 
                      onChange={(e) => setNewSubConceptName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && newSubConceptName.trim()) createSubConceptMutation.mutate(); }}
                      className="w-full px-3 py-2 text-sm border border-indigo-300 dark:border-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-dark-bg dark:text-white"
                      placeholder="e.g., Variables, Data Types..."
                      autoFocus
                    />
                  </div>
                  <button 
                    onClick={() => createSubConceptMutation.mutate()}
                    disabled={!newSubConceptName.trim() || createSubConceptMutation.isPending}
                    className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button 
                    onClick={() => { setShowAddSubConcept(false); setNewSubConceptName(''); }}
                    className="px-3 py-2 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Material Editor */}
              {showEditMaterial && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
                  <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">Concept Name</label>
                  <input 
                    type="text" 
                    value={editConceptName} 
                    onChange={(e) => setEditConceptName(e.target.value)}
                    className="w-full mb-3 px-3 py-2 text-sm border border-green-300 dark:border-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-dark-bg dark:text-white disabled:opacity-50"
                    placeholder={editIsMaterialOnly ? "Optional: Admin label (won't be shown to users)" : ""}
                  />
                  
                  <div className="flex items-center gap-2 mb-3">
                    <input 
                      type="checkbox" 
                      id={`editIsMaterialOnly-${concept.id}`}
                      checked={editIsMaterialOnly} 
                      onChange={(e) => setEditIsMaterialOnly(e.target.checked)}
                      className="w-4 h-4 text-green-600 rounded border-green-300 focus:ring-green-500"
                    />
                    <label htmlFor={`editIsMaterialOnly-${concept.id}`} className="text-xs font-medium text-green-700 dark:text-green-300">
                      Is Material Only
                    </label>
                  </div>

                  <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-2">Material / Notes</label>
                  <textarea 
                    value={materialText} 
                    onChange={(e) => setMaterialText(e.target.value)} 
                    rows={6} 
                    className="w-full text-sm px-3 py-2 border border-green-300 dark:border-green-700 rounded-lg dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" 
                    placeholder="Write learning material, notes, or explanations here..."
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setShowEditMaterial(false)} className="px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                    <button 
                      onClick={() => updateMaterialMutation.mutate()} 
                      disabled={updateMaterialMutation.isPending || !editConceptName.trim()}
                      className="px-4 py-1.5 text-sm font-semibold bg-green-600 text-white hover:bg-green-500 rounded-lg disabled:opacity-50"
                    >
                      {updateMaterialMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Display existing material */}
              {concept.description && !showEditMaterial && (
                <div className="mb-4 p-4 bg-green-50/50 dark:bg-green-900/5 rounded-xl border border-green-200/50 dark:border-green-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Material</span>
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{concept.description}</div>
                </div>
              )}

              {/* Sub-Concepts Section */}
              {loadingChildren ? (
                <div className="py-2 text-center text-sm text-slate-500">Loading sub-concepts...</div>
              ) : subConcepts && subConcepts.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    📂 Sub-Concepts
                  </h4>
                  <DragDropContext onDragEnd={handleSubConceptDragEnd}>
                    <Droppable droppableId={`subconcepts-${concept.id}`}>
                      {(provided) => (
                        <div 
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2 ml-2 border-l-2 border-indigo-200 dark:border-indigo-800 pl-3"
                        >
                          {subConcepts.map((sub, index) => (
                            <Draggable key={sub.id} draggableId={sub.id} index={index}>
                              {(provided) => (
                                <div 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border overflow-hidden shadow-sm"
                                >
                                  <ConceptRow 
                                    concept={sub} 
                                    dragHandleProps={provided.dragHandleProps} 
                                    onDelete={() => deleteSubConceptMutation.mutate(sub.id)}
                                    category={category}
                                    depth={depth + 1}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              )}

              {/* Problems Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Problems</h4>
                </div>

                {showAddProblem && (
                  <ProblemEditor 
                    conceptId={concept.id} 
                    category={category} 
                    onClose={() => setShowAddProblem(false)} 
                  />
                )}

                {loadingProblems ? (
                  <div className="py-4 text-center text-slate-500">Loading problems...</div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId={`problems-${concept.id}`}>
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {problems?.map((problem, index) => (
                            <Draggable key={problem.id} draggableId={problem.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center justify-between p-3 bg-white dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl shadow-sm"
                                >
                                  <div className="flex items-center gap-3">
                                    <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing">
                                      <GripVertical className="w-4 h-4" />
                                    </div>
                                    
                                    {editingProblemId === problem.id ? (
                                      <div className="flex-1 min-w-0 py-2">
                                        <ProblemEditor 
                                          conceptId={concept.id} 
                                          category={category} 
                                          initialData={problem}
                                          onClose={() => setEditingProblemId(null)} 
                                        />
                                      </div>
                                    ) : (
                                      <>
                                        <div>
                                          <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                            {problem.title}
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                              problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                              problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                              'bg-red-100 text-red-700'
                                            }`}>
                                              {problem.difficulty}
                                            </span>
                                          </div>
                                          <div className="text-xs text-slate-500 flex gap-3 mt-1">
                                            {problem.problemLink && <span title="Problem Link">🔗 Problem</span>}
                                            {problem.youtubeLink && <span title="Youtube Link">▶️ Video</span>}
                                            {problem.documentationLink && <span title="Doc Link">📄 Doc</span>}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  {editingProblemId !== problem.id && (
                                    <div className="flex gap-1 shrink-0">
                                      <button 
                                        onClick={() => setEditingProblemId(problem.id)}
                                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                        title="Edit Problem"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => { if (confirm(`Delete problem "${problem.title}"?`)) deleteProblemMutation.mutate(problem.id); }}
                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete Problem"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {problems?.length === 0 && !showAddProblem && (
                            <div className="text-center py-3 text-sm text-slate-400 italic">No problems added yet.</div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const getPlatformName = (url: string) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('leetcode.com')) return 'LeetCode';
  if (lowerUrl.includes('geeksforgeeks.org')) return 'GeeksforGeeks';
  if (lowerUrl.includes('codechef.com')) return 'CodeChef';
  if (lowerUrl.includes('codeforces.com')) return 'Codeforces';
  if (lowerUrl.includes('hackerrank.com')) return 'HackerRank';
  if (lowerUrl.includes('hackerearth.com')) return 'HackerEarth';
  if (lowerUrl.includes('codingninjas.com')) return 'CodingNinjas';
  return 'External';
};

const LANGUAGES = ['Java', 'Python', 'C++', 'C', 'Kotlin'];

const COMPLEXITY_OPTIONS = ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)', 'O(N²)', 'O(2^N)', 'O(N!)', 'Custom'];

function ComplexitySelect({ value, onChange, label }: { value: string, onChange: (val: string) => void, label: string }) {
  const isCustom = value && !COMPLEXITY_OPTIONS.includes(value) && value !== '';
  const [showCustom, setShowCustom] = useState(isCustom);

  return (
    <div className="flex flex-col gap-1 w-32">
      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</label>
      {showCustom ? (
        <div className="flex items-center gap-1">
          <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-xs px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded dark:bg-dark-bg dark:text-white"
            placeholder="e.g. O(N)"
          />
          <button onClick={() => { setShowCustom(false); onChange(''); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <select 
          value={value || ''} 
          onChange={(e) => {
            if (e.target.value === 'Custom') {
              setShowCustom(true);
              onChange('');
            } else {
              onChange(e.target.value);
            }
          }}
          className="w-full text-xs px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded dark:bg-dark-bg dark:text-white"
        >
          <option value="">-</option>
          {COMPLEXITY_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
    </div>
  );
}

function ProblemEditor({ conceptId, category, initialData, onClose, concepts }: { conceptId: string, category: string, initialData?: any, onClose: () => void, concepts?: any[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeLangTab, setActiveLangTab] = useState('Java');
  const [localConceptId, setLocalConceptId] = useState(conceptId || (concepts && concepts.length > 0 ? concepts[0].id : ''));
  
  const initSolutions = () => {
    if (initialData?.solutions && initialData.solutions.length > 0) {
      const existingLangs = initialData.solutions.map((s: any) => s.language);
      const missing = LANGUAGES.filter(l => !existingLangs.includes(l)).map(l => ({
        language: l, bruteSolution: '', bruteTc: '', bruteSc: '', betterSolution: '', betterTc: '', betterSc: '', optimalSolution: '', optimalTc: '', optimalSc: '', additionalSolutions: []
      }));
      // Map existing additionalSolutions to ensure they are objects
      const formattedSolutions = initialData.solutions.map((s: any) => ({
        ...s,
        additionalSolutions: (s.additionalSolutions || []).map((as: any) => 
          typeof as === 'string' ? { name: '', code: as } : as
        )
      }));
      return [...formattedSolutions, ...missing];
    }
    return LANGUAGES.map(l => ({ language: l, bruteSolution: '', bruteTc: '', bruteSc: '', betterSolution: '', betterTc: '', betterSc: '', optimalSolution: '', optimalTc: '', optimalSc: '', additionalSolutions: [] }));
  };

  const [form, setForm] = useState({
    title: initialData?.title || '',
    difficulty: initialData?.difficulty || 'Easy',
    problemLink: initialData?.problemLink || '',
    youtubeLink: initialData?.youtubeLink || '',
    documentationLink: initialData?.documentationLink || '',
    description: initialData?.description || '',
    solutions: initSolutions(),
    platformLinks: initialData?.platformLinks?.length > 0 
      ? initialData.platformLinks 
      : (initialData?.problemLink ? [{ platformName: getPlatformName(initialData.problemLink), url: initialData.problemLink }] : []),
  });

  const addPlatformLink = () => {
    setForm(prev => ({ ...prev, platformLinks: [...(prev.platformLinks || []), { platformName: 'External', url: '' }] }));
  };

  const updatePlatformLink = (index: number, url: string) => {
    setForm(prev => {
      const newLinks = [...(prev.platformLinks || [])];
      newLinks[index] = { platformName: getPlatformName(url), url };
      return { ...prev, platformLinks: newLinks };
    });
  };

  const removePlatformLink = (index: number) => {
    setForm(prev => {
      const newLinks = [...(prev.platformLinks || [])];
      newLinks.splice(index, 1);
      return { ...prev, platformLinks: newLinks };
    });
  };

  const updateSolution = (field: 'bruteSolution' | 'bruteTc' | 'bruteSc' | 'betterSolution' | 'betterTc' | 'betterSc' | 'optimalSolution' | 'optimalTc' | 'optimalSc', value: string) => {
    setForm(prev => {
      const newSols = [...prev.solutions];
      const idx = newSols.findIndex(s => s.language === activeLangTab);
      if (idx !== -1) {
        newSols[idx] = { ...newSols[idx], [field]: value };
      }
      return { ...prev, solutions: newSols };
    });
  };

  const addAdditionalSolution = () => {
    setForm(prev => {
      const newSols = [...prev.solutions];
      const idx = newSols.findIndex(s => s.language === activeLangTab);
      if (idx !== -1) {
        const adds = newSols[idx].additionalSolutions || [];
        newSols[idx] = { ...newSols[idx], additionalSolutions: [...adds, { name: '', code: '', tc: '', sc: '' }] };
      }
      return { ...prev, solutions: newSols };
    });
  };

  const updateAdditionalSolution = (index: number, field: 'name' | 'code' | 'tc' | 'sc', value: string) => {
    setForm(prev => {
      const newSols = [...prev.solutions];
      const idx = newSols.findIndex(s => s.language === activeLangTab);
      if (idx !== -1) {
        const adds = [...(newSols[idx].additionalSolutions || [])];
        adds[index] = { ...adds[index], [field]: value };
        newSols[idx] = { ...newSols[idx], additionalSolutions: adds };
      }
      return { ...prev, solutions: newSols };
    });
  };

  const removeAdditionalSolution = (index: number) => {
    setForm(prev => {
      const newSols = [...prev.solutions];
      const idx = newSols.findIndex(s => s.language === activeLangTab);
      if (idx !== -1) {
        const adds = [...(newSols[idx].additionalSolutions || [])];
        adds.splice(index, 1);
        newSols[idx] = { ...newSols[idx], additionalSolutions: adds };
      }
      return { ...prev, solutions: newSols };
    });
  };

  const saveMutation = useMutation({
    mutationFn: () => initialData 
      ? adminApi.updateProblem(initialData.id, {
          ...form,
          category,
          concept: { id: localConceptId || conceptId }
        })
      : adminApi.createProblem({
          ...form,
          category,
          concept: { id: localConceptId || conceptId }
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems', localConceptId || conceptId] });
      toast(initialData ? 'Problem updated successfully' : 'Problem added successfully', 'success');
      onClose();
    },
    onError: (err: any) => {
      console.error("Save Problem Error:", err);
      const serverMsg = err?.response?.data?.message || err?.message || 'Unknown server error';
      toast(`Failed to save problem: ${serverMsg}`, 'error');
    }
  });

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-4 mt-2">
      <div className="flex justify-between items-center mb-4">
        <h5 className="font-bold text-slate-900 dark:text-white">{initialData ? 'Edit Problem' : 'Add Problem'}</h5>
        <button onClick={onClose} className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"><X className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {(!conceptId && concepts && concepts.length > 0) && (
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Concept *</label>
            <select
              value={localConceptId}
              onChange={(e) => setLocalConceptId(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-bg text-slate-900 dark:text-white"
            >
              {concepts.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
          <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-dark-border rounded-lg dark:bg-dark-bg dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
          <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-dark-border rounded-lg dark:bg-dark-bg dark:text-white">
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Platform Links</label>
            <button type="button" onClick={addPlatformLink} className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium flex items-center gap-1">+ Add Link</button>
          </div>
          <div className="space-y-2">
            {form.platformLinks?.map((link: any, index: number) => (
              <div key={index} className="flex gap-2 items-center">
                <div className="px-3 py-1.5 text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg w-32 text-center whitespace-nowrap overflow-hidden text-ellipsis">
                  {link.platformName}
                </div>
                <input 
                  type="text" 
                  value={link.url} 
                  onChange={e => updatePlatformLink(index, e.target.value)} 
                  className="flex-1 px-3 py-1.5 text-sm border border-slate-300 dark:border-dark-border rounded-lg dark:bg-dark-bg dark:text-white" 
                  placeholder="https://..." 
                />
                <button type="button" onClick={() => removePlatformLink(index)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!form.platformLinks || form.platformLinks.length === 0) && (
              <div className="text-xs text-slate-400 italic">No platform links added. Click "+ Add Link" to add one.</div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">YouTube Link</label>
          <input type="text" value={form.youtubeLink} onChange={e => setForm({...form, youtubeLink: e.target.value})} className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-dark-border rounded-lg dark:bg-dark-bg dark:text-white" placeholder="https://youtube.com/..." />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Documentation Link</label>
          <input type="text" value={form.documentationLink} onChange={e => setForm({...form, documentationLink: e.target.value})} className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-dark-border rounded-lg dark:bg-dark-bg dark:text-white" placeholder="https://..." />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Documentation Content</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full text-sm px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg dark:bg-dark-bg dark:text-white" placeholder="Write documentation data here..." />
         <div className="md:col-span-2 space-y-3 mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Solutions</label>
          <div className="flex gap-1 overflow-x-auto hide-scrollbar border-b border-slate-200 dark:border-slate-700 pb-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLangTab(lang)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeLangTab === lang
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {(() => {
            const activeSol = form.solutions.find(s => s.language === activeLangTab) || { bruteSolution: '', bruteTc: '', bruteSc: '', betterSolution: '', betterTc: '', betterSc: '', optimalSolution: '', optimalTc: '', optimalSc: '', additionalSolutions: [] };
            return (
              <div className="space-y-3 mt-3">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Brute Solution Code ({activeLangTab})</label>
                    <div className="flex gap-2">
                      <ComplexitySelect value={activeSol.bruteTc || ''} onChange={(val) => updateSolution('bruteTc', val)} label="TC" />
                      <ComplexitySelect value={activeSol.bruteSc || ''} onChange={(val) => updateSolution('bruteSc', val)} label="SC" />
                    </div>
                  </div>
                  <textarea value={activeSol.bruteSolution || ''} onChange={e => updateSolution('bruteSolution', e.target.value)} rows={3} className="w-full font-mono text-xs px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg dark:bg-dark-bg dark:text-white" />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Better Solution Code ({activeLangTab})</label>
                    <div className="flex gap-2">
                      <ComplexitySelect value={activeSol.betterTc || ''} onChange={(val) => updateSolution('betterTc', val)} label="TC" />
                      <ComplexitySelect value={activeSol.betterSc || ''} onChange={(val) => updateSolution('betterSc', val)} label="SC" />
                    </div>
                  </div>
                  <textarea value={activeSol.betterSolution || ''} onChange={e => updateSolution('betterSolution', e.target.value)} rows={3} className="w-full font-mono text-xs px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg dark:bg-dark-bg dark:text-white" />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Optimal Solution Code ({activeLangTab})</label>
                    <div className="flex gap-2">
                      <ComplexitySelect value={activeSol.optimalTc || ''} onChange={(val) => updateSolution('optimalTc', val)} label="TC" />
                      <ComplexitySelect value={activeSol.optimalSc || ''} onChange={(val) => updateSolution('optimalSc', val)} label="SC" />
                    </div>
                  </div>
                  <textarea value={activeSol.optimalSolution || ''} onChange={e => updateSolution('optimalSolution', e.target.value)} rows={3} className="w-full font-mono text-xs px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg dark:bg-dark-bg dark:text-white" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Additional Solutions ({activeLangTab})</label>
                  </div>
                  {activeSol.additionalSolutions?.map((sol: any, index: number) => (
                    <div key={index} className="relative bg-slate-50 dark:bg-[#1a1a1a] p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="mb-2 flex items-end gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Solution Name</label>
                          <input 
                            type="text" 
                            value={sol.name} 
                            onChange={e => updateAdditionalSolution(index, 'name', e.target.value)} 
                            className="w-full text-xs px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded dark:bg-dark-bg dark:text-white" 
                            placeholder="e.g. Space Optimized, Recursive..." 
                          />
                        </div>
                        <ComplexitySelect value={sol.tc || ''} onChange={(val) => updateAdditionalSolution(index, 'tc', val)} label="TC" />
                        <ComplexitySelect value={sol.sc || ''} onChange={(val) => updateAdditionalSolution(index, 'sc', val)} label="SC" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Code</label>
                        <textarea 
                          value={sol.code} 
                          onChange={e => updateAdditionalSolution(index, 'code', e.target.value)} 
                          rows={3} 
                          className="w-full font-mono text-xs px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded dark:bg-dark-bg dark:text-white" 
                        />
                      </div>
                      <button type="button" onClick={() => removeAdditionalSolution(index)} className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addAdditionalSolution} className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    + Add Additional Solution for {activeLangTab}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
        <button 
          onClick={() => saveMutation.mutate()} 
          disabled={!form.title.trim() || saveMutation.isPending || (!conceptId && !localConceptId)}
          className="px-4 py-1.5 text-sm font-semibold bg-primary-600 text-white hover:bg-primary-500 rounded-lg disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Problem'}
        </button>
      </div>
    </div>
  );
}
