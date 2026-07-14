import apiClient from './client';

export interface Comment {
  id: string;
  content: string;
  userName: string;
  createdAt: string;
}

export interface Motivation {
  id: string;
  type: 'QUOTE' | 'IMAGE' | 'VIDEO' | 'LINK';
  content: string;
  author?: string;
  active: boolean;
  createdAt?: string;
  likesCount?: number;
  commentsCount?: number;
  isLikedByCurrentUser?: boolean;
  likedBy?: string[];
  comments?: Comment[];
}

export interface MotivationView {
  userName: string;
  userEmail: string;
  lastViewedAt: string;
}

export const motivationApi = {
  getActive: async () => {
    const response = await apiClient.get<Motivation[]>('/motivation');
    return response.data;
  },
  getAllAdmin: async () => {
    const response = await apiClient.get<Motivation[]>('/admin/motivation');
    return response.data;
  },
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ url: string }>('/admin/motivation/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  create: async (data: Omit<Motivation, 'id' | 'createdAt'>) => {
    const response = await apiClient.post<Motivation>('/admin/motivation', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Motivation>) => {
    const response = await apiClient.put<Motivation>(`/admin/motivation/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/admin/motivation/${id}`);
  },
  toggleLike: async (id: string) => {
    await apiClient.post(`/motivation/${id}/like`);
  },
  addComment: async (id: string, content: string) => {
    const response = await apiClient.post<Comment>(`/motivation/${id}/comment`, { content });
    return response.data;
  },
  getViewers: async () => {
    const response = await apiClient.get<MotivationView[]>('/admin/motivation/views');
    return response.data;
  },
};
