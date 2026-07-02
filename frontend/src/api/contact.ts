import apiClient from './client';

export interface ContactInfo {
  id: string;
  platform: string;
  value: string;
  link: string;
}

export const contactApi = {
  getAll: async () => {
    const response = await apiClient.get<ContactInfo[]>('/contact');
    return response.data;
  },
  create: async (data: Omit<ContactInfo, 'id'>) => {
    const response = await apiClient.post<ContactInfo>('/admin/contact', data);
    return response.data;
  },
  update: async (id: string, data: Partial<ContactInfo>) => {
    const response = await apiClient.put<ContactInfo>(`/admin/contact/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/admin/contact/${id}`);
  },
};
