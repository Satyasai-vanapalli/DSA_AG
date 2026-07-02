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
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Daily Motivation</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Fuel your coding journey with curated quotes, images, and videos.</p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {motivations?.map(m => (
          <div key={m.id} className="break-inside-avoid bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 overflow-hidden group">
            {m.type === 'IMAGE' && (
              <img 
                src={import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', m.content) : `http://localhost:8081${m.content}`} 
                alt="motivation" 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            )}
            
            {m.type === 'VIDEO' && (
              <video 
                controls 
                className="w-full h-auto"
                src={import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', m.content) : `http://localhost:8081${m.content}`}
              />
            )}

            {m.type === 'QUOTE' && (
              <div className="p-8 relative">
                <Quote className="w-10 h-10 text-blue-100 dark:text-blue-900 absolute top-4 left-4" />
                <blockquote className="relative z-10 text-gray-800 dark:text-gray-200 text-lg italic leading-relaxed">
                  "{m.content}"
                </blockquote>
                {m.author && (
                  <p className="mt-4 font-semibold text-blue-600 dark:text-blue-400 text-right">- {m.author}</p>
                )}
              </div>
            )}

            {m.type === 'LINK' && (
              <a href={m.content} target="_blank" rel="noopener noreferrer" className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white line-clamp-2">{m.content}</span>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
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
