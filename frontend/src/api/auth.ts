import apiClient from './client';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const verifyRegisterSchema = registerSchema.extend({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type VerifyRegisterData = z.infer<typeof verifyRegisterSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export const authApi = {
  login: async (data: LoginData) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },
  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
  verifyRegister: async (data: VerifyRegisterData) => {
    const response = await apiClient.post('/auth/verify-register', data);
    return response.data;
  },
  forgotPassword: async (data: ForgotPasswordData) => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },
  resetPassword: async (data: ResetPasswordData) => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },
};
