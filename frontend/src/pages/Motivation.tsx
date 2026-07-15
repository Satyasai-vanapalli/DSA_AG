import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motivationApi } from '../api/motivation';
import type { Motivation as MotivationType } from '../api/motivation';
import { Loader2, Quote, ExternalLink, Heart, MessageCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Motivation() {
  const { data: motivations, isLoading } = useQuery({
    queryKey: ['motivations'],
    queryFn: motivationApi.getActive,
  });

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-4 mb-14 relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-600 tracking-tighter drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]">
          Daily <span className="text-white">Motivation</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
          Fuel your coding journey with curated quotes, images, and videos.
        </p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 relative z-10">
        {motivations?.map(m => (
          <MotivationCard key={m.id} motivation={m} />
        ))}
        {motivations?.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12 w-full block">No motivation available right now.</div>
        )}
      </div>
    </div>
  );
}

function MotivationCard({ motivation: m }: { motivation: MotivationType }) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const likeMutation = useMutation({
    mutationFn: () => motivationApi.toggleLike(m.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['motivations'] });
      const previousMotivations = queryClient.getQueryData<MotivationType[]>(['motivations']);
      if (previousMotivations) {
        queryClient.setQueryData<MotivationType[]>(['motivations'], old => {
          if (!old) return old;
          return old.map(oldM => {
            if (oldM.id === m.id) {
              const isLiked = !oldM.isLikedByCurrentUser;
              const currentUserName = user?.name || 'You';
              
              let newLikedBy = oldM.likedBy ? [...oldM.likedBy] : [];
              if (isLiked) {
                newLikedBy.unshift(currentUserName);
              } else {
                newLikedBy = newLikedBy.filter(name => name !== currentUserName);
              }

              return {
                ...oldM,
                isLikedByCurrentUser: isLiked,
                likesCount: (oldM.likesCount || 0) + (isLiked ? 1 : -1),
                likedBy: newLikedBy
              };
            }
            return oldM;
          });
        });
      }
      return { previousMotivations };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousMotivations) {
        queryClient.setQueryData(['motivations'], context.previousMotivations);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['motivations'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: (text: string) => motivationApi.addComment(m.id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motivations'] });
      setCommentText('');
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => motivationApi.deleteComment(m.id, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motivations'] });
    }
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  return (
    <div className="break-inside-avoid glass-card rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col">
      <div className="group relative">
        {m.type === 'IMAGE' && (
          <img 
            src={m.content.startsWith('http') ? m.content : (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', m.content) : `http://localhost:8081${m.content}`)} 
            alt="motivation" 
            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 relative z-20" 
          />
        )}
        
        {m.type === 'VIDEO' && (
          <video 
            controls 
            className="w-full h-auto relative z-20 pointer-events-auto"
            src={m.content.startsWith('http') ? m.content : (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', m.content) : `http://localhost:8081${m.content}`)}
          />
        )}
        
        {m.type === 'QUOTE' && (
          <div className="p-8 relative">
            <div className="absolute top-4 left-4 opacity-20">
              <Quote className="w-12 h-12 text-primary-500 fill-primary-500" />
            </div>
            <blockquote className="relative z-10 text-slate-800 dark:text-white text-lg md:text-xl font-medium italic leading-relaxed pt-4">
              "{m.content}"
            </blockquote>
            {m.author && (
              <p className="mt-6 font-bold text-primary-600 dark:text-primary-400 text-right uppercase tracking-widest text-sm">
                — {m.author}
              </p>
            )}
          </div>
        )}

        {m.type === 'LINK' && (
          <a href={m.content} target="_blank" rel="noopener noreferrer" className="block p-6 hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white line-clamp-2">{m.content}</span>
              <ExternalLink className="w-5 h-5 text-primary-500" />
            </div>
          </a>
        )}
      </div>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-4 mb-3">
          <button 
            onClick={() => {
              if (!isAuthenticated) return; // Maybe show login prompt
              likeMutation.mutate();
            }}
            disabled={likeMutation.isPending || !isAuthenticated}
            className={`transition-transform hover:scale-110 active:scale-95 flex items-center gap-2 ${
              m.isLikedByCurrentUser ? 'text-red-500' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Heart className={`w-6 h-6 ${m.isLikedByCurrentUser ? 'fill-current' : ''}`} />
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-transform hover:scale-110 active:scale-95 flex items-center gap-2"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="font-bold text-sm text-slate-900 dark:text-white mb-2">
          {m.likesCount || 0} {(m.likesCount === 1) ? 'like' : 'likes'}
          {m.likedBy && m.likedBy.length > 0 && (
            <span className="font-normal text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              Liked by {m.likedBy.slice(0, 2).join(', ')}
              {m.likedBy.length > 2 && ` and ${m.likedBy.length - 2} others`}
            </span>
          )}
        </div>
        
        {(m.commentsCount || 0) > 0 && !showComments && (
          <button 
            onClick={() => setShowComments(true)}
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          >
            View all {m.commentsCount} comments
          </button>
        )}
        
        {showComments && (
          <div className="mt-3 space-y-3">
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {m.comments?.map(c => (
                <div key={c.id} className="text-sm flex justify-between items-start group/comment">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white mr-2">{c.userName}</span>
                    <span className="text-slate-700 dark:text-slate-300">{c.content}</span>
                  </div>
                  {c.isOwner && (
                    <button 
                      onClick={() => { if (confirm('Delete comment?')) deleteCommentMutation.mutate(c.id); }}
                      className="text-red-500 opacity-0 group-hover/comment:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {m.comments?.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-2">No comments yet.</div>
              )}
            </div>
            
            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="flex gap-2 relative mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 px-0 text-slate-900 dark:text-white placeholder-slate-400"
                />
                <button 
                  type="submit" 
                  disabled={!commentText.trim() || commentMutation.isPending}
                  className="text-primary-500 hover:text-primary-600 disabled:opacity-50 font-semibold text-sm px-2"
                >
                  Post
                </button>
              </form>
            ) : (
              <div className="text-xs text-slate-500 text-center mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                Sign in to comment
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
