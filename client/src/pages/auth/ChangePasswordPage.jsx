import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, Lock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { changePassword } = useAuth();

  const isPassLengthValid = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Current password is required.');
      return;
    }

    if (!isPassLengthValid || !hasUppercase || !hasSpecialChar) {
      setError('New password must be 8-16 characters with at least one uppercase letter and one special character.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);
      setSuccess('Your password has been successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <KeyRound className="w-6 h-6 text-indigo-600" />
          <span>Change Password</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Update your account security credentials
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                New Password
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
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New secure password"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
              />
            </div>

            {newPassword.length > 0 && (
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

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Confirm New Password
              </label>
              {confirmPassword.length > 0 && (
                <span className={`text-[11px] font-medium ${passwordsMatch ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm shadow-indigo-200 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
