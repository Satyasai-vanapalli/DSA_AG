import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motivationApi, type Motivation } from '../api/motivation';
import { Loader2, Plus, Edit2, Trash2, Image as ImageIcon, Video, Type, Link as LinkIcon, Upload } from 'lucide-react';

export default function AdminMotivation() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<Motivation | null>(null);
  const [formData, setFormData] = useState<{type: Motivation['type'], content: string, author: string, active: boolean}>({
    type: 'QUOTE', content: '', author: '', active: true
  });
  const [uploading, setUploading] = useState(false);

  const { data: motivations, isLoading } = useQuery({
    queryKey: ['admin-motivations'],
    queryFn: motivationApi.getAllAdmin,
  });

  const createMutation = useMutation({
    mutationFn: motivationApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-motivations'] });
      setIsCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Motivation> }) => motivationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-motivations'] });
      setIsEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: motivationApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-motivations'] });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await motivationApi.uploadFile(file);
      setFormData(prev => ({ ...prev, content: res.url }));
    } catch (err) {
      alert("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate({ id: isEditing.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const startEdit = (m: Motivation) => {
    setIsEditing(m);
    setFormData({ type: m.type, content: m.content, author: m.author || '', active: m.active });
    setIsCreating(false);
  };

  const startCreate = () => {
    setIsCreating(true);
    setIsEditing(null);
    setFormData({ type: 'QUOTE', content: '', author: '', active: true });
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Motivation Feed</h2>
        <button onClick={startCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Add Item
        </button>
      </div>

      {(isCreating || isEditing) && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
          <h3 className="text-lg font-semibold">{isEditing ? 'Edit Item' : 'New Item'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as any})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="QUOTE">Quote (Text)</option>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="LINK">External Link</option>
              </select>
            </div>
            
            <div className="flex items-center mt-6">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({...formData, active: e.target.checked})} className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                <span>Active (Visible to users)</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {formData.type === 'QUOTE' ? 'Quote Text' : formData.type === 'LINK' ? 'External URL' : 'File URL'}
              </label>
              
              {(formData.type === 'IMAGE' || formData.type === 'VIDEO') ? (
                <div className="mt-1 flex items-center space-x-4">
                  <input type="text" readOnly value={formData.content} placeholder="URL will appear after upload" className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center shrink-0">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-4 h-4 mr-2"/> Upload</>}
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept={formData.type === 'IMAGE' ? "image/*" : "video/*"} onChange={handleFileUpload} />
                </div>
              ) : (
                <textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows={3} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              )}
            </div>

            {formData.type === 'QUOTE' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Author (Optional)</label>
                <input type="text" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => { setIsCreating(false); setIsEditing(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending || uploading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {motivations?.map(m => (
          <div key={m.id} className={`bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border-2 ${m.active ? 'border-transparent' : 'border-red-500/50'}`}>
            <div className="p-4 flex items-center space-x-3 border-b dark:border-gray-700">
              {m.type === 'QUOTE' ? <Type className="w-5 h-5 text-blue-500" /> : m.type === 'IMAGE' ? <ImageIcon className="w-5 h-5 text-green-500" /> : m.type === 'VIDEO' ? <Video className="w-5 h-5 text-purple-500" /> : <LinkIcon className="w-5 h-5 text-orange-500" />}
              <span className="font-semibold text-gray-700 dark:text-gray-300 flex-1">{m.type}</span>
              {!m.active && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium">Inactive</span>}
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 min-h-[120px] max-h-[200px] overflow-y-auto">
              {m.type === 'IMAGE' ? (
                <img src={m.content.startsWith('http') ? m.content : (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', m.content) : `http://localhost:8081${m.content}`)} alt="motivation" className="w-full h-32 object-cover rounded" />
              ) : m.type === 'VIDEO' ? (
                <video src={m.content.startsWith('http') ? m.content : (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', m.content) : `http://localhost:8081${m.content}`)} controls className="w-full h-32 bg-black rounded" />
              ) : (
                <blockquote className="text-gray-700 dark:text-gray-300 italic text-sm">
                  "{m.content}"
                  {m.author && <span className="block mt-2 font-semibold text-xs not-italic">- {m.author}</span>}
                </blockquote>
              )}
            </div>

            <div className="p-3 bg-white dark:bg-gray-800 flex justify-end space-x-2 border-t dark:border-gray-700">
              <button onClick={() => startEdit(m)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => { if(confirm('Delete permanently?')) deleteMutation.mutate(m.id); }} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
