import { useState, useRef } from 'react';
import { X, Camera, Save, Loader2, User as UserIcon } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  onClose: () => void;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMutation = useMutation({
    mutationFn: (formData: FormData) => usersApi.updateProfile(formData),
    onSuccess: (data) => {
      updateUser({
        name: data.name,
        profilePictureUrl: data.profilePictureUrl || undefined,
      });
      onClose();
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const formData = new FormData();
    if (name !== user?.name) {
      formData.append('name', name);
    }
    if (selectedFile) {
      formData.append('profilePicture', selectedFile);
    }
    updateMutation.mutate(formData);
  };

  const displayImage = previewUrl || user?.profilePictureUrl;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-primary-600/10 to-accent-600/10">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Edit Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center gap-6">
          {/* Profile Picture */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary-500/30 shadow-lg shadow-primary-500/10">
              {displayImage ? (
                <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2.5 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-500 transition-all hover:scale-110"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Name Field */}
          <div className="w-full space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              placeholder="Your name"
            />
          </div>

          {/* Email (read-only) */}
          <div className="w-full space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
            <input
              type="text"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>

          {/* Error */}
          {updateMutation.isError && (
            <p className="text-red-500 text-sm">Failed to update profile. Please try again.</p>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending || (!selectedFile && name === user?.name)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {updateMutation.isPending ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-5 h-5" /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
