import axios from 'axios';

const API_URL = 'http://localhost:8081/api/progress';

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

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const progressApi = {
  toggleCompleted: async (problemId: string, timeSpent?: number): Promise<UserProgress> => {
    const url = timeSpent ? `${API_URL}/toggle-completed/${problemId}?timeSpent=${timeSpent}` : `${API_URL}/toggle-completed/${problemId}`;
    const response = await axios.post(url, {}, { headers: getAuthHeaders() });
    return response.data;
  },

  toggleRevision: async (problemId: string): Promise<UserProgress> => {
    const response = await axios.post(`${API_URL}/toggle-revision/${problemId}`, {}, { headers: getAuthHeaders() });
    return response.data;
  },

  updateLastOpened: async (problemId: string): Promise<UserProgress> => {
    const response = await axios.post(`${API_URL}/last-opened/${problemId}`, {}, { headers: getAuthHeaders() });
    return response.data;
  },

  getMyProgress: async (): Promise<UserProgress[]> => {
    const response = await axios.get(`${API_URL}/me`, { headers: getAuthHeaders() });
    return response.data;
  },

  getMyStats: async (category?: string): Promise<UserStats> => {
    const url = category ? `${API_URL}/stats?category=${category}` : `${API_URL}/stats`;
    const response = await axios.get(url, { headers: getAuthHeaders() });
    return response.data;
  },

  getMyAnalytics: async (category?: string): Promise<UserAnalytics> => {
    const url = category ? `${API_URL}/analytics?category=${category}` : `${API_URL}/analytics`;
    const response = await axios.get(url, { headers: getAuthHeaders() });
    return response.data;
  },

  getHeatmap: async (category?: string): Promise<Record<string, number>> => {
    const url = category ? `${API_URL}/heatmap?category=${category}` : `${API_URL}/heatmap`;
    const response = await axios.get(url, { headers: getAuthHeaders() });
    return response.data;
  },

  getDueReviews: async (): Promise<UserProgress[]> => {
    const response = await axios.get(`${API_URL}/reviews`, { headers: getAuthHeaders() });
    return response.data;
  },

  submitReview: async (problemId: string, remembered: boolean): Promise<UserProgress> => {
    const response = await axios.post(`${API_URL}/review/${problemId}?remembered=${remembered}`, {}, { headers: getAuthHeaders() });
    return response.data;
  },
};
