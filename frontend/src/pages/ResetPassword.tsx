import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { resetPasswordSchema, authApi } from '../api/auth';
import type { ResetPasswordData } from '../api/auth';
import { Lock, Loader2, KeyRound } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email }
  });

  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    }
  });

  const onSubmit = (data: ResetPasswordData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-card p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-dark-border">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Enter the OTP sent to {email} and your new password.
          </p>
        </div>

        {mutation.isError && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
            Invalid OTP or it has expired.
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm text-center">
            Password reset successfully! Redirecting...
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('email')} />
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">OTP Code</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...register('otp')}
                  type="text"
                  maxLength={6}
                  className="appearance-none block w-full pl-10 px-3 py-2 text-center tracking-widest font-mono text-lg border border-slate-300 dark:border-dark-border rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-bg dark:text-white transition-colors"
                  placeholder="000000"
                />
              </div>
              {errors.otp && <p className="mt-1 text-sm text-red-500">{errors.otp.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...register('newPassword')}
                  type="password"
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-bg dark:text-white sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
              {errors.newPassword && <p className="mt-1 text-sm text-red-500">{errors.newPassword.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending || success}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
