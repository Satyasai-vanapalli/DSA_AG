import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login: setAuthLogin } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Reset password whenever we move to step 2
  useEffect(() => {
    if (step === 2) {
      setPassword('');
    }
  }, [step]);

  const checkEmailMutation = useMutation({
    mutationFn: authApi.checkEmail,
    onSuccess: (data) => {
      if (data.exists) {
        setStep(2);
        setEmailError('');
      } else {
        setEmailError('No account found with this email. Please sign up.');
      }
    },
    onError: () => {
      setEmailError('Failed to check email. Please try again.');
    }
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    checkEmailMutation.mutate(email);
  };

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuthLogin(data.token, data);
      window.location.href = '/';
    }
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) return;
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 justify-center items-center">
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-[float_10s_ease-in-out_infinite]" />
        
        <div className="z-10 text-center max-w-md px-8">
          <div className="mb-8 inline-flex p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <Lock className="w-12 h-12 text-primary-400" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">Welcome Back</h2>
          <p className="text-lg text-slate-300">
            Sign in to continue your journey to mastery. Your progress is saved and waiting for you.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-slate-50 dark:bg-dark-bg relative">
        <div className="max-w-md w-full space-y-8 glass-card p-10 rounded-3xl shadow-2xl relative z-10">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {step === 1 ? 'Sign In' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
              {step === 1 ? 'Enter your email to continue.' : <span className="flex items-center gap-2"><Mail className="w-4 h-4"/> {email}</span>}
            </p>
          </div>

          {loginMutation.isError && step === 2 && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm text-center font-medium">
              Invalid password
            </div>
          )}

          {emailError && step === 1 && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm text-center font-medium">
              {emailError}
            </div>
          )}

          {step === 1 ? (
            <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 px-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all backdrop-blur-sm"
                    autoComplete="off"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={checkEmailMutation.isPending}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 shadow-lg shadow-primary-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-card disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
              >
                {checkEmailMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Continue with Email'}
              </button>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handlePasswordSubmit} autoComplete="off">
              <input type="text" name="prevent_autofill_name" id="prevent_autofill_name" autoComplete="off" style={{ display: 'none' }} tabIndex={-1} />
              <input type="password" name="prevent_autofill_pass" id="prevent_autofill_pass" autoComplete="off" style={{ display: 'none' }} tabIndex={-1} />
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 px-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all backdrop-blur-sm"
                    autoComplete="off"
                    name="login_pwd_field"
                    id="login_pwd_field"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {password.length > 0 && password.length < 6 && (
                  <p className="mt-2 text-xs text-red-500 font-medium">Password must be at least 6 characters</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <Link to="/forgot-password" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending || password.length < 6}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 shadow-lg shadow-primary-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-card disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
              >
                {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Sign In'}
              </button>
            </form>
          )}

          {step === 1 && (
            <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors">
                Sign up
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
