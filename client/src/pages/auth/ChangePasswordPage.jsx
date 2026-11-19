import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { KeyRound, Lock, CheckCircle2, AlertCircle, XCircle, Eye, EyeOff } from 'lucide-react';

export const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { changePassword } = useAuth();
  const { showToast } = useToast();

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
      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update password.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight flex items-center gap-2.5">
          <KeyRound className="w-6 h-6 text-indigo-600" />
          <span>Change Password</span>
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Update your account security credentials
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-card">
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3 text-green-800 text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your existing password"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-sm text-[#172033] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-[#172033]">
                New Password
              </label>
              <span className="text-[11px] text-[#64748B]">
                8–16 chars, 1 uppercase, 1 special
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-sm text-[#172033] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {newPassword.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-1.5 text-[11px]">
                <div className={`flex items-center gap-1 ${isPassLengthValid ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
                  {isPassLengthValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>8-16 chars</span>
                </div>
                <div className={`flex items-center gap-1 ${hasUppercase ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
                  {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>1 Uppercase</span>
                </div>
                <div className={`flex items-center gap-1 ${hasSpecialChar ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
                  {hasSpecialChar ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>1 Special</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-[#172033]">
                Confirm New Password
              </label>
              {confirmPassword.length > 0 && (
                <span className={`text-[11px] font-semibold ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Does not match'}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-sm text-[#172033] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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
