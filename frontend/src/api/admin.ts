import apiClient from './client';

export interface AdminStats {
  totalUsers: number;
  totalConcepts: number;
  totalProblems: number;
  totalVideos: number;
  totalSolutions: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  adminCategories: string[];
  lastActiveTime?: string;
  isBlocked?: boolean;
}

export interface AdminInsights {
  activeUsers: number;
  popularProblems: { title: string; completedCount: number }[];
  struggledProblems: { title: string; averageTime: number }[];
}

export const adminApi = {
  getInsights: async (): Promise<AdminInsights> => {
    const response = await apiClient.get('/admin/insights');
    return response.data;
  },
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  promoteUser: async (userId: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/promote`);
  },

  demoteUser: async (userId: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/demote`);
  },

  toggleCategoryAdmin: async (userId: string, category: string): Promise<any> => {
    const response = await apiClient.post(`/admin/users/${userId}/category-admin/${category}`);
    return response.data;
  },

  forceLogoutUser: async (userId: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/logout`);
  },

  blockUser: async (userId: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/block`);
  },

  unblockUser: async (userId: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/unblock`);
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  // Concept CRUD
  createConcept: async (data: { name: string; description?: string; category?: string; parentId?: string; isMaterialOnly?: boolean }): Promise<any> => {
    const response = await apiClient.post('/concepts', data);
    return response.data;
  },

  updateConcept: async (id: string, data: { name: string; description?: string; category?: string; isMaterialOnly?: boolean }): Promise<any> => {
    const response = await apiClient.put(`/concepts/${id}`, data);
    return response.data;
  },

  deleteConcept: async (id: string): Promise<void> => {
    await apiClient.delete(`/concepts/${id}`);
  },

  reorderConcepts: async (conceptIds: string[]): Promise<void> => {
    await apiClient.put('/concepts/reorder', conceptIds);
  },

  // Problem CRUD
  createProblem: async (data: {
    title: string;
    description?: string;
    difficulty: string;
    estimatedTime?: string;
    constraints?: string;
    problemLink?: string;
    youtubeLink?: string;
    documentationLink?: string;
    bruteSolution?: string;
    betterSolution?: string;
    optimalSolution?: string;
    category?: string;
    concept?: { id: string };
  }): Promise<any> => {
    const response = await apiClient.post('/problems', data);
    return response.data;
  },

  updateProblem: async (id: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/problems/${id}`, data);
    return response.data;
  },

  deleteProblem: async (id: string): Promise<void> => {
    await apiClient.delete(`/problems/${id}`);
  },

  reorderProblems: async (problemIds: string[]): Promise<void> => {
    await apiClient.put('/problems/reorder', problemIds);
  },

  // Solution CRUD
  createSolution: async (data: {
    language: string;
    solutionCode: string;
    approach: string;
    timeComplexity: string;
    spaceComplexity: string;
    problem: { id: string };
  }): Promise<any> => {
    const response = await apiClient.post('/solutions', data);
    return response.data;
  },

  updateSolution: async (id: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/solutions/${id}`, data);
    return response.data;
  },

  deleteSolution: async (id: string): Promise<void> => {
    await apiClient.delete(`/solutions/${id}`);
  },
};
