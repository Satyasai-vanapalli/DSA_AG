import apiClient from './client';

export interface UserProgress {
  id: string;
  problemId: string;
  completed: boolean;
  revision: boolean;
  timeSpent?: number;
  lastOpenedAt: string;
  completedAt?: string;
  nextReviewDate?: string;
  reviewIntervalDays?: number;
  problem?: any; // To hold the nested problem data from the backend
}

export interface ConceptProgress {
  id: string;
  conceptId: string;
  completed: boolean;
  completedAt?: string;
}

export interface UserStats {
  completed: number;
  revision: number;
  total: number;
  currentStreak: number;
  maxStreak: number;
}

export interface UserAnalytics {
  easy: number;
  medium: number;
  hard: number;
  averageTime: number;
}

// Removed getAuthHeaders as apiClient handles it automatically

export const progressApi = {
  toggleCompleted: async (problemId: string, timeSpent?: number): Promise<UserProgress> => {
    const url = timeSpent ? `/progress/toggle-completed/${problemId}?timeSpent=${timeSpent}` : `/progress/toggle-completed/${problemId}`;
    const response = await apiClient.post(url, {});
    return response.data;
  },

  toggleRevision: async (problemId: string): Promise<UserProgress> => {
    const response = await apiClient.post(`/progress/toggle-revision/${problemId}`, {});
    return response.data;
  },

  updateLastOpened: async (problemId: string): Promise<UserProgress> => {
    const response = await apiClient.post(`/progress/last-opened/${problemId}`, {});
    return response.data;
  },

  getMyProgress: async (): Promise<UserProgress[]> => {
    const response = await apiClient.get(`/progress/me`);
    return response.data;
  },

  getMyConceptProgress: async (): Promise<ConceptProgress[]> => {
    const response = await apiClient.get(`/progress/me/concepts`);
    return response.data;
  },

  toggleConceptCompleted: async (conceptId: string): Promise<ConceptProgress> => {
    const response = await apiClient.post(`/progress/toggle-concept-completed/${conceptId}`, {});
    return response.data;
  },

  getMyStats: async (category?: string): Promise<UserStats> => {
    const url = category ? `/progress/stats?category=${category}` : `/progress/stats`;
    const response = await apiClient.get(url);
    return response.data;
  },

  getMyAnalytics: async (category?: string): Promise<UserAnalytics> => {
    const url = category ? `/progress/analytics?category=${category}` : `/progress/analytics`;
    const response = await apiClient.get(url);
    return response.data;
  },

  getHeatmap: async (category?: string): Promise<Record<string, number>> => {
    const url = category ? `/progress/heatmap?category=${category}` : `/progress/heatmap`;
    const response = await apiClient.get(url);
    return response.data;
  },

  getDueReviews: async (): Promise<UserProgress[]> => {
    const response = await apiClient.get(`/progress/reviews`);
    return response.data;
  },

  submitReview: async (problemId: string, remembered: boolean): Promise<UserProgress> => {
    const response = await apiClient.post(`/progress/review/${problemId}?remembered=${remembered}`, {});
    return response.data;
  },
};
