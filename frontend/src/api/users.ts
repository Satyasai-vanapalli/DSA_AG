import apiClient from './client';

export interface LeaderboardUser {
  name: string;
  completedCount: number;
  currentStreak: number;
  profilePictureUrl?: string;
}

export const usersApi = {
  getLeaderboard: async (category?: string): Promise<LeaderboardUser[]> => {
    const url = category ? `/users/leaderboard?category=${category}` : `/users/leaderboard`;
    const response = await apiClient.get<LeaderboardUser[]>(url);
    return response.data;
  },
  ping: async (): Promise<void> => {
    await apiClient.post(`/users/ping`, {});
  },
  logout: async (): Promise<void> => {
    await apiClient.post(`/users/logout`, {});
  },
  updateProfile: async (formData: FormData): Promise<{ name: string; profilePictureUrl: string }> => {
    const response = await apiClient.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
