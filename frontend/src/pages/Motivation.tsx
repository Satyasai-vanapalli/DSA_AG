import { useQuery } from '@tanstack/react-query';
import { motivationApi } from '../api/motivation';
import { Loader2, Quote, ExternalLink } from 'lucide-react';

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
          <div key={m.id} className="break-inside-avoid glass-card rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
            {m.type === 'IMAGE' && (
              <img 
                src={m.content.startsWith('http') ? m.content : (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', m.content) : `http://localhost:8081${m.content}`)} 
                alt="motivation" 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            )}
            
            {m.type === 'VIDEO' && (
              <video 
                controls 
                className="w-full h-auto"
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
        ))}
        {motivations?.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12 w-full block">No motivation available right now.</div>
        )}
      </div>
    </div>
  );
}
