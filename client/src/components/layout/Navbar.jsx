import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { RoleBadge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Menu, LogOut, KeyRound, Bell, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    showToast('Logged out successfully', 'success');
    logout();
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-slate-100 lg:hidden transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-[#64748B]">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Secure Session</span>
              <span>·</span>
              <span className="font-medium text-[#172033]">
                {user?.role === 'ADMIN'
                  ? 'System Administration Portal'
                  : user?.role === 'STORE_OWNER'
                  ? 'Store Management Portal'
                  : 'Customer Rating Portal'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <div className="flex items-center gap-2.5">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs sm:text-sm font-semibold text-[#172033] leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    {user.email}
                  </span>
                </div>
                <RoleBadge role={user.role} />
              </div>
            )}

            <div className="h-5 w-px bg-[#E2E8F0] mx-1"></div>

            <Link
              to="/change-password"
              className="p-2 text-[#64748B] hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              title="Change Password"
            >
              <KeyRound className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to end your session and log out?"
        confirmText="Log Out"
        isDanger={true}
      />
    </>
  );
};
