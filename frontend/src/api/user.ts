import apiClient from './client';

export const userApi = {
  sendDeleteAccountOtp: async (): Promise<void> => {
    await apiClient.post('/users/me/delete-account/send-otp');
  },
  
  verifyAndDeleteAccount: async (otp: string): Promise<void> => {
    await apiClient.post('/users/me/delete-account/verify', { otp });
  }
};
