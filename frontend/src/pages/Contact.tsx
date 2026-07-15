import { useQuery } from '@tanstack/react-query';
import { contactApi } from '../api/contact';
import { Loader2, ExternalLink } from 'lucide-react';

export default function Contact() {
  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactApi.getAll,
  });

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  const getIcon = (platform: string) => {
    switch (platform.toUpperCase()) {
      case 'WHATSAPP': return <img src="/icons/whatsapp.png" alt="WhatsApp" className="w-full h-full object-cover" />;
      case 'INSTAGRAM': return <img src="/icons/instagram.png" alt="Instagram" className="w-full h-full object-cover" />;
      case 'GMAIL': return <img src="/icons/gmail.png" alt="Gmail" className="w-full h-full object-cover" />;
      case 'OUTLOOK': return <img src="/icons/outlook.png" alt="Outlook" className="w-full h-full object-cover" />;
      default: return <ExternalLink className="w-8 h-8 text-blue-500 m-4" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-12 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="text-center space-y-4 mb-14 relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-600 tracking-tighter drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]">
          Contact <span className="text-white">Admin</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
          Reach out to the Super Admin via any of the following platforms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {contacts?.map(contact => (
          <a
            key={contact.id}
            href={contact.link.startsWith('http') ? contact.link : (contact.platform.toUpperCase() === 'GMAIL' ? `mailto:${contact.link}` : `https://${contact.link}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="group glass-card flex items-center p-6 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-16 h-16 flex-shrink-0 rounded-2xl overflow-hidden bg-white/50 dark:bg-white/5 group-hover:scale-110 transition-transform duration-300 shadow-sm relative z-10 flex items-center justify-center">
              {getIcon(contact.platform)}
            </div>
            <div className="ml-5 flex-1 relative z-10">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{contact.platform}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{contact.value}</p>
            </div>
            <ExternalLink className="w-6 h-6 text-slate-300 group-hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-all duration-300 relative z-10 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
          </a>
        ))}
        {contacts?.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">No contact information available right now.</div>
        )}
        
        {/* Hardcoded fallback for Outlook if not added via admin panel */}
        {contacts && !contacts.some(c => c.platform.toUpperCase() === 'OUTLOOK') && (
          <a
            href="mailto:2300031222@kluniversity.in"
            target="_blank"
            rel="noopener noreferrer"
            className="group glass-card flex items-center p-6 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-16 h-16 flex-shrink-0 rounded-2xl overflow-hidden bg-white/50 dark:bg-white/5 group-hover:scale-110 transition-transform duration-300 shadow-sm relative z-10 flex items-center justify-center">
              <img src="/icons/outlook.png" alt="Outlook" className="w-full h-full object-cover" />
            </div>
            <div className="ml-5 flex-1 relative z-10">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">OUTLOOK</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">2300031222@kluniversity.in</p>
            </div>
            <ExternalLink className="w-6 h-6 text-slate-300 group-hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-all duration-300 relative z-10 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
          </a>
        )}
      </div>
    </div>
  );
}
