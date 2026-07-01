import axios from 'axios';

const API_URL = 'http://localhost:8081/api/users';

export interface LeaderboardUser {
  name: string;
  completedCount: number;
  currentStreak: number;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const usersApi = {
  getLeaderboard: async (category?: string): Promise<LeaderboardUser[]> => {
    const url = category ? `${API_URL}/leaderboard?category=${category}` : `${API_URL}/leaderboard`;
    const response = await axios.get(url, { headers: getAuthHeaders() });
    return response.data;
  },
  ping: async (): Promise<void> => {
    await axios.post(`${API_URL}/ping`, {}, { headers: getAuthHeaders() });
  },
  logout: async (): Promise<void> => {
    await axios.post(`${API_URL}/logout`, {}, { headers: getAuthHeaders() });
  },
};
