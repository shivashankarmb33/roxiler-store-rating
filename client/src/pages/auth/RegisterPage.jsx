import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Store, Lock, Mail, User, MapPin, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Validation rules helper
  const isNameValid = formData.name.trim().length >= 20 && formData.name.trim().length <= 60;
  const isPassLengthValid = formData.password.length >= 8 && formData.password.length <= 16;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(formData.password);
  const isAddressValid = formData.address.length <= 400;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isNameValid) {
      setError('Name must be between 20 and 60 characters.');
      return;
    }

    if (!isPassLengthValid || !hasUppercase || !hasSpecialChar) {
      setError('Password must be 8-16 characters with at least one uppercase letter and one special character.');
      return;
    }

    if (!isAddressValid) {
      setError('Address must be at most 400 characters.');
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      navigate('/user/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Store className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Create User Account
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          Join Roxiler Store Rating Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Full Name
                </label>
                <span className={`text-[11px] ${formData.name.length > 0 && !isNameValid ? 'text-rose-500 font-medium' : 'text-slate-400'}`}>
                  {formData.name.length}/60 (req: 20-60 chars)
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Johnathan Edward Alexander Doe"
                  className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 ${
                    formData.name.length > 0 && !isNameValid ? 'border-rose-300' : 'border-slate-200'
                  }`}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">
                  8–16 chars, uppercase & special char
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
                />
              </div>

              {/* Password Requirements Checklist */}
              {formData.password.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-1.5 text-[11px]">
                  <div className={`flex items-center gap-1 ${isPassLengthValid ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isPassLengthValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>8-16 chars</span>
                  </div>
                  <div className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>1 Uppercase</span>
                  </div>
                  <div className={`flex items-center gap-1 ${hasSpecialChar ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {hasSpecialChar ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>1 Special (!@#$)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Address */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Address (Optional)
                </label>
                <span className={`text-[11px] ${formData.address.length > 400 ? 'text-rose-500 font-medium' : 'text-slate-400'}`}>
                  {formData.address.length}/400 chars
                </span>
              </div>
              <div className="relative">
                <div className="absolute top-2.5 left-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <textarea
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street, City, State, ZIP..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm shadow-indigo-200 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
