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
    <div className="min-h-screen flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 justify-center items-center">
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-[float_10s_ease-in-out_infinite]" />
        
        <div className="z-10 text-center max-w-md px-8">
          <div className="mb-8 inline-flex p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <User className="w-12 h-12 text-primary-400" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">Join the Elite</h2>
          <p className="text-lg text-slate-300">
            Start your journey to mastering Data Structures, Algorithms, and Competitive Programming today.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-slate-50 dark:bg-dark-bg relative">
        <div className="max-w-md w-full space-y-8 glass-card p-10 rounded-3xl shadow-2xl relative z-10">
          {step === 1 ? (
            <>
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Create an account
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Start solving problems today.
                </p>
              </div>

              {registerMutation.isError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm text-center font-medium">
                  {(registerMutation.error as any)?.response?.data?.message || 'Registration failed. Email might already be taken.'}
                </div>
              )}

              <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      {...register('name')}
                      type="text"
                      className="block w-full pl-12 px-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all backdrop-blur-sm"
                      autoComplete="off"
                    />
                  </div>
                  {errors.name && <p className="mt-2 text-xs text-red-500 font-medium">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      className="block w-full pl-12 px-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all backdrop-blur-sm"
                      autoComplete="off"
                    />
                  </div>
                  {errors.email && <p className="mt-2 text-xs text-red-500 font-medium">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      {...register('password')}
                      type={showPassword ? "text" : "password"}
                      className="block w-full pl-12 pr-12 px-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all backdrop-blur-sm"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-2 text-xs text-red-500 font-medium">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? "text" : "password"}
                      className="block w-full pl-12 pr-12 px-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all backdrop-blur-sm"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-2 text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full mt-4 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 shadow-lg shadow-primary-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-card disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
                >
                  {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Sign Up'}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Verify Email
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  We've sent a 6-digit OTP to <span className="font-bold text-slate-900 dark:text-white">{registerData?.email}</span>
                </p>
              </div>

              {otpError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm text-center font-medium">
                  {otpError}
                </div>
              )}

              <form className="mt-8 space-y-6" onSubmit={handleVerify}>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">OTP Code</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="block w-full pl-12 px-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-xl text-center tracking-widest font-mono text-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all backdrop-blur-sm"
                      placeholder="000000"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={verifyMutation.isPending}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 shadow-lg shadow-primary-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-card disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
                >
                  {verifyMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify Account'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
