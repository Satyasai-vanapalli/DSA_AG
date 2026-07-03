import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactApi, type ContactInfo } from '../api/contact';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminContact() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<ContactInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ platform: '', value: '', link: '' });

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactApi.getAll,
  });

  const isSuperAdmin = user?.role === 'ADMIN';
  const isContactAdmin = user?.adminCategories?.includes('CONTACT');

  if (!isSuperAdmin && !isContactAdmin) {
    return <Navigate to="/" replace />;
  }

  const createMutation = useMutation({
    mutationFn: contactApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setIsCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContactInfo> }) => contactApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setIsEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: contactApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate({ id: isEditing.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const startEdit = (contact: ContactInfo) => {
    setIsEditing(contact);
    setFormData({ platform: contact.platform, value: contact.value, link: contact.link });
    setIsCreating(false);
  };

  const startCreate = () => {
    setIsCreating(true);
    setIsEditing(null);
    setFormData({ platform: '', value: '', link: '' });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Contact Info</h2>
        <button onClick={startCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Add Contact
        </button>
      </div>

      {(isCreating || isEditing) && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
          <h3 className="text-lg font-semibold">{isEditing ? 'Edit Contact' : 'New Contact'}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Platform (e.g. WHATSAPP)</label>
              <input type="text" value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value.toUpperCase()})} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Value</label>
              <input type="text" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL Link</label>
              <input type="text" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => { setIsCreating(false); setIsEditing(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {contacts?.map(contact => (
            <li key={contact.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{contact.platform}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{contact.value}</p>
                <a href={contact.link} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:underline truncate max-w-xs block">{contact.link}</a>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => startEdit(contact)} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 className="w-5 h-5" /></button>
                <button onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(contact.id); }} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
