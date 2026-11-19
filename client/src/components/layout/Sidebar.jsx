import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Store,
  Star,
  KeyRound,
  Compass,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role;

  // Build role-specific navigation links
  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'User Management', path: '/admin/users', icon: Users },
          { name: 'Store Management', path: '/admin/stores', icon: Store },
          { name: 'Browse Stores', path: '/stores', icon: Compass },
          { name: 'Change Password', path: '/change-password', icon: KeyRound }
        ];
      case 'STORE_OWNER':
        return [
          { name: 'Store Dashboard', path: '/store-owner/dashboard', icon: LayoutDashboard },
          { name: 'Customer Ratings', path: '/store-owner/ratings', icon: Star },
          { name: 'Browse Stores', path: '/stores', icon: Compass },
          { name: 'Change Password', path: '/change-password', icon: KeyRound }
        ];
      case 'USER':
      default:
        return [
          { name: 'User Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
          { name: 'Browse Stores', path: '/stores', icon: Compass },
          { name: 'My Ratings', path: '/user/my-ratings', icon: Star },
          { name: 'Change Password', path: '/change-password', icon: KeyRound }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5 font-bold tracking-tight text-white">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-extrabold text-base">
              R
            </div>
            <span className="text-base">Roxiler Portal</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-4 rounded-xl bg-slate-800/80 border border-slate-700/50">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Current Account
          </p>
          <p className="text-sm font-semibold text-white mt-1 truncate">
            {user?.name || 'User'}
          </p>
          <p className="text-xs text-indigo-400 font-medium capitalize mt-0.5">
            {user?.role?.replace('_', ' ').toLowerCase()}
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
          &copy; 2026 Roxiler Systems
        </div>
      </aside>
    </>
  );
};
