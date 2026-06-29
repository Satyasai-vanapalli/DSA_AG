import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPasswordSchema, authApi } from '../api/auth';
import type { ForgotPasswordData } from '../api/auth';
import { Mail, Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const mutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (_, variables) => {
      // Pass email to reset password page via state
      navigate('/reset-password', { state: { email: variables.email } });
    }
  });

  const onSubmit = (data: ForgotPasswordData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-card p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-dark-border">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
            Forgot Password?
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Enter your email and we'll send you an OTP to reset your password.
          </p>
        </div>

        {mutation.isError && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
            User not found or an error occurred.
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-bg dark:text-white sm:text-sm transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
