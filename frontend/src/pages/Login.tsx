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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-card p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-dark-border">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
            {step === 1 ? 'Sign in to your account' : 'Enter your password'}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            {step === 1 ? 'Welcome back! Please enter your details.' : email}
          </p>
        </div>

        {loginMutation.isError && step === 2 && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
            Invalid password
          </div>
        )}

        {emailError && step === 1 && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
            {emailError}
          </div>
        )}

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-bg dark:text-white sm:text-sm transition-colors"
                  autoComplete="off"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={checkEmailMutation.isPending}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {checkEmailMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handlePasswordSubmit} autoComplete="off">
            {/* Hidden dummy fields to trick browser autofill */}
            <input type="text" name="prevent_autofill_name" id="prevent_autofill_name" autoComplete="off" style={{ display: 'none' }} tabIndex={-1} />
            <input type="password" name="prevent_autofill_pass" id="prevent_autofill_pass" autoComplete="off" style={{ display: 'none' }} tabIndex={-1} />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-10 px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-bg dark:text-white sm:text-sm transition-colors"
                  autoComplete="off"
                  name="login_pwd_field"
                  id="login_pwd_field"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="mt-1 text-sm text-red-500">Password must be at least 6 characters</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>
              
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending || password.length < 6}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
            </button>
          </form>
        )}

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-dark-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-dark-card text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-dark-border shadow-sm text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-dark-bg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
