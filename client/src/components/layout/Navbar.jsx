import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/Badge';
import { Menu, LogOut, KeyRound, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 font-bold text-slate-800 text-lg">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Store className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Roxiler Stores
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {user && (
            <div className="flex items-center gap-2.5">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-800 leading-tight">
                  {user.name}
                </span>
                <span className="text-xs text-slate-500">
                  {user.email}
                </span>
              </div>
              <RoleBadge role={user.role} />
            </div>
          )}

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          <Link
            to="/change-password"
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Change Password"
          >
            <KeyRound className="w-4 h-4" />
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
