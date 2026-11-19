import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Store, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedEmail = localStorage.getItem('roxiler_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    try {
      setLoading(true);
      if (rememberMe) {
        localStorage.setItem('roxiler_remember_email', email.trim());
      } else {
        localStorage.removeItem('roxiler_remember_email');
      }

      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}!`, 'success');

      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'STORE_OWNER') {
        navigate('/store-owner/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Store className="w-6 h-6" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-[#172033]">
          Sign in to your account
        </h2>
        <p className="mt-1 text-center text-sm text-[#64748B]">
          Store Rating Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card border border-[#E2E8F0] rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {location.search.includes('session=expired') && (
            <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              Your session expired. Please sign in again.
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-sm text-[#172033] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-sm text-[#172033] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#64748B] hover:text-[#172033]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-[#E2E8F0] focus:ring-indigo-500/20 cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <span className="text-[#64748B] text-[11px]">
                Protected by JWT Authentication
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm shadow-indigo-200 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-2.5 text-center">
              Quick Sign-in for Testing
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@roxiler.com', 'Admin@123')}
                className="py-1.5 px-2 text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-center transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('owner1@roxiler.com', 'Owner@123')}
                className="py-1.5 px-2 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-center transition-colors"
              >
                Store Owner
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('john.doe@example.com', 'User@1234')}
                className="py-1.5 px-2 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-center transition-colors"
              >
                Normal User
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#64748B]">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
