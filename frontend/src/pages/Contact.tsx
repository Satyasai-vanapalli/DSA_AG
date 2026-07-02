import { useQuery } from '@tanstack/react-query';
import { contactApi } from '../api/contact';
import { Loader2, MessageCircle, Instagram, Mail, ExternalLink } from 'lucide-react';

export default function Contact() {
  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactApi.getAll,
  });

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  const getIcon = (platform: string) => {
    switch (platform.toUpperCase()) {
      case 'WHATSAPP': return <MessageCircle className="w-6 h-6 text-green-500" />;
      case 'INSTAGRAM': return <Instagram className="w-6 h-6 text-pink-500" />;
      case 'GMAIL': return <Mail className="w-6 h-6 text-red-500" />;
      default: return <ExternalLink className="w-6 h-6 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Admin</h1>
        <p className="text-gray-600 dark:text-gray-400">Reach out to the Super Admin via any of the following platforms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contacts?.map(contact => (
          <a
            key={contact.id}
            href={contact.link.startsWith('http') ? contact.link : (contact.platform.toUpperCase() === 'GMAIL' ? `mailto:${contact.link}` : `https://${contact.link}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all hover:-translate-y-1"
          >
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700 group-hover:scale-110 transition-transform">
              {getIcon(contact.platform)}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{contact.platform}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{contact.value}</p>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
          </a>
        ))}
        {contacts?.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">No contact information available right now.</div>
        )}
      </div>
    </div>
  );
}
