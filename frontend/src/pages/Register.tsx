import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { registerSchema, authApi } from '../api/auth';
import type { RegisterData } from '../api/auth';
import { Mail, Lock, User, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login: setAuthLogin } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [registerData, setRegisterData] = useState<RegisterData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema)
  });

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (_, variables) => {
      setRegisterData(variables);
      setStep(2);
    }
  });

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyRegister,
    onSuccess: (data) => {
      setAuthLogin(data.token, data);
      window.location.href = '/';
    },
    onError: () => {
      setOtpError('Invalid or expired OTP');
    }
  });

  const onSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError('OTP must be 6 digits');
      return;
    }
    if (registerData) {
      verifyMutation.mutate({ ...registerData, otp });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-card p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-dark-border">
        {step === 1 ? (
          <>
            <div>
              <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
                Create an account
              </h2>
              <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                Start solving problems today
              </p>
            </div>

            {registerMutation.isError && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
                {(registerMutation.error as any)?.response?.data?.message || 'Registration failed. Email might already be taken.'}
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      {...register('name')}
                      type="text"
                      className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-bg dark:text-white sm:text-sm transition-colors"
                      autoComplete="off"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-bg dark:text-white sm:text-sm transition-colors"
                      autoComplete="off"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      {...register('password')}
                      type={showPassword ? "text" : "password"}
                      className="appearance-none block w-full pl-10 pr-10 px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-bg dark:text-white sm:text-sm transition-colors"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? "text" : "password"}
                      className="appearance-none block w-full pl-10 pr-10 px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-bg dark:text-white sm:text-sm transition-colors"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <div>
              <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
                Verify Email
              </h2>
              <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                We've sent a 6-digit OTP to {registerData?.email}
              </p>
            </div>

            {otpError && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
                {otpError}
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleVerify}>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">OTP Code</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="appearance-none block w-full pl-10 px-3 py-2 text-center tracking-widest font-mono text-lg border border-slate-300 dark:border-dark-border rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-bg dark:text-white transition-colors"
                    placeholder="000000"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={verifyMutation.isPending}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {verifyMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
