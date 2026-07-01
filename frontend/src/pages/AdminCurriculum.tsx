import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roadmapApi, type Concept } from '../api/roadmap';
import { adminApi } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, GripVertical, ChevronDown, X, Edit2, FolderPlus, FileText, BookOpen } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCurriculum({ category, title }: { category: string, title: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddConcept, setShowAddConcept] = useState(false);
  const [newConceptName, setNewConceptName] = useState('');

  if (user?.role !== 'ADMIN' && !user?.adminCategories?.includes(category)) return <Navigate to="/" replace />;

  const { data: concepts, isLoading } = useQuery({
    queryKey: ['concepts', category],
    queryFn: () => roadmapApi.getConceptsByCategory(category),
  });

  const createConceptMutation = useMutation({
    mutationFn: () => adminApi.createConcept({ name: newConceptName, category }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concepts', category] });
      toast('Concept created', 'success');
      setNewConceptName('');
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
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/admin" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors mb-2 font-medium">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
        </div>
        <button 
          onClick={() => setShowAddConcept(true)} 
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Concept
        </button>
      </div>

      {showAddConcept && (
        <div className="mb-6 bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border p-6 shadow-sm flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Concept Name</label>
            <input 
              type="text" 
              value={newConceptName} 
              onChange={(e) => setNewConceptName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && newConceptName.trim()) createConceptMutation.mutate(); }}
              className="w-full px-4 py-2 border border-slate-300 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-bg dark:text-white" 
            />
          </div>
          <button 
            onClick={() => createConceptMutation.mutate()}
            disabled={!newConceptName.trim() || createConceptMutation.isPending}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 h-[42px]"
          >
            Create
          </button>
          <button 
            onClick={() => setShowAddConcept(false)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors h-[42px]"
          >
            Cancel
          </button>
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
    mutationFn: () => adminApi.updateConcept(concept.id, { name: editConceptName, description: materialText, category }),
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
                  onClick={() => { setMaterialText(concept.description || ''); setEditConceptName(concept.name || ''); setShowEditMaterial(true); }}
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
                    className="w-full mb-3 px-3 py-2 text-sm border border-green-300 dark:border-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-dark-bg dark:text-white"
                  />
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

function ProblemEditor({ conceptId, category, initialData, onClose }: { conceptId: string, category: string, initialData?: any, onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState({
    title: initialData?.title || '',
    difficulty: initialData?.difficulty || 'Easy',
    problemLink: initialData?.problemLink || '',
    youtubeLink: initialData?.youtubeLink || '',
    documentationLink: initialData?.documentationLink || '',
    description: initialData?.description || '',
    bruteSolution: initialData?.bruteSolution || '',
    betterSolution: initialData?.betterSolution || '',
    optimalSolution: initialData?.optimalSolution || '',
    additionalSolutions: initialData?.additionalSolutions || [],
  });

  const addAdditionalSolution = () => {
    setForm(prev => ({
      ...prev,
      additionalSolutions: [...prev.additionalSolutions, '']
    }));
  };

  const updateAdditionalSolution = (index: number, value: string) => {
    setForm(prev => {
      const newSols = [...prev.additionalSolutions];
      newSols[index] = value;
      return { ...prev, additionalSolutions: newSols };
    });
  };

  const removeAdditionalSolution = (index: number) => {
    setForm(prev => {
      const newSols = [...prev.additionalSolutions];
      newSols.splice(index, 1);
      return { ...prev, additionalSolutions: newSols };
    });
  };

  const saveMutation = useMutation({
    mutationFn: () => initialData 
      ? adminApi.updateProblem(initialData.id, {
          ...form,
          category,
          concept: { id: conceptId }
        })
      : adminApi.createProblem({
          ...form,
          category,
          concept: { id: conceptId }
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems', conceptId] });
      toast(initialData ? 'Problem updated' : 'Problem added', 'success');
      onClose();
    },
    onError: () => toast(initialData ? 'Failed to update problem' : 'Failed to add problem', 'error')
  });

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-4 mt-2">
      <div className="flex justify-between items-center mb-4">
        <h5 className="font-bold text-slate-900 dark:text-white">{initialData ? 'Edit Problem' : 'Add Problem'}</h5>
        <button onClick={onClose} className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"><X className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Problem Link</label>
          <input type="text" value={form.problemLink} onChange={e => setForm({...form, problemLink: e.target.value})} className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-dark-border rounded-lg dark:bg-dark-bg dark:text-white" placeholder="https://leetcode.com/..." />
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
        </div>
        
        <div className="md:col-span-2 space-y-3 mt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Brute Solution Code</label>
            <textarea value={form.bruteSolution} onChange={e => setForm({...form, bruteSolution: e.target.value})} rows={3} className="w-full font-mono text-xs px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg dark:bg-dark-bg dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Better Solution Code</label>
            <textarea value={form.betterSolution} onChange={e => setForm({...form, betterSolution: e.target.value})} rows={3} className="w-full font-mono text-xs px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg dark:bg-dark-bg dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Optimal Solution Code</label>
            <textarea value={form.optimalSolution} onChange={e => setForm({...form, optimalSolution: e.target.value})} rows={3} className="w-full font-mono text-xs px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg dark:bg-dark-bg dark:text-white" />
          </div>
          
          {/* Dynamic Additional Solutions */}
          {form.additionalSolutions.map((sol: string, index: number) => (
            <div key={index} className="relative">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Solution {index + 1} Code</label>
              <textarea 
                value={sol} 
                onChange={e => updateAdditionalSolution(index, e.target.value)} 
                rows={3} 
                className="w-full font-mono text-xs px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg dark:bg-dark-bg dark:text-white" 
              />
              <button 
                onClick={() => removeAdditionalSolution(index)}
                className="absolute top-0 right-0 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                title="Remove this solution"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          <button
            onClick={addAdditionalSolution}
            className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
          >
            + Add Additional Solution
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
        <button 
          onClick={() => saveMutation.mutate()} 
          disabled={!form.title.trim() || saveMutation.isPending}
          className="px-4 py-1.5 text-sm font-semibold bg-primary-600 text-white hover:bg-primary-500 rounded-lg disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Problem'}
        </button>
      </div>
    </div>
  );
}
