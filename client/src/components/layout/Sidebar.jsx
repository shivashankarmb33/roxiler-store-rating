import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  LayoutDashboard,
  Users,
  Store,
  Star,
  KeyRound,
  Compass,
  UserPlus,
  PlusCircle,
  LogOut,
  X,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const role = user?.role;

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    showToast('Logged out successfully', 'success');
    logout();
  };

  // Build role-specific navigation links
  const getNavSections = () => {
    if (role === 'ADMIN') {
      return [
        {
          heading: 'Core',
          items: [
            { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
            { name: 'Users', path: '/admin/users', icon: Users },
            { name: 'Stores', path: '/admin/stores', icon: Store }
          ]
        },
        {
          heading: 'Quick Actions',
          items: [
            { name: 'Add User', path: '/admin/users?action=new', icon: UserPlus },
            { name: 'Add Store', path: '/admin/stores?action=new', icon: PlusCircle }
          ]
        },
        {
          heading: 'Account',
          items: [
            { name: 'Browse Stores', path: '/stores', icon: Compass },
            { name: 'Change Password', path: '/change-password', icon: KeyRound }
          ]
        }
      ];
    } else if (role === 'STORE_OWNER') {
      return [
        {
          heading: 'Business Analytics',
          items: [
            { name: 'Overview', path: '/store-owner/dashboard', icon: LayoutDashboard },
            { name: 'Customer Ratings', path: '/store-owner/ratings', icon: Star }
          ]
        },
        {
          heading: 'General',
          items: [
            { name: 'Browse Stores', path: '/stores', icon: Compass },
            { name: 'Change Password', path: '/change-password', icon: KeyRound }
          ]
        }
      ];
    } else {
      // Normal User
      return [
        {
          heading: 'Discovery & Reviews',
          items: [
            { name: 'Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
            { name: 'Stores Directory', path: '/stores', icon: Compass },
            { name: 'My Submitted Ratings', path: '/user/my-ratings', icon: Star }
          ]
        },
        {
          heading: 'Settings',
          items: [
            { name: 'Change Password', path: '/change-password', icon: KeyRound }
          ]
        }
      ];
    }
  };

  const navSections = getNavSections();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white text-[#172033] border-r border-[#E2E8F0] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0 shadow-xl lg:shadow-none' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3 font-bold text-[#172033] tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm shadow-indigo-200">
              <Store className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[#172033] leading-none">
                Roxiler SaaS
              </span>
              <span className="text-[10px] font-medium text-[#64748B] mt-1">
                Store Rating System
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3.5 mx-3 mt-4 rounded-xl bg-slate-50 border border-[#E2E8F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#172033] truncate">
                {user?.name}
              </p>
              <p className="text-[11px] text-[#64748B] truncate">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {navSections.map((section, sIdx) => (
            <div key={sIdx}>
              <p className="px-3 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                {section.heading}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || (item.path.includes('?') && location.pathname + location.search === item.path);

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => onClose()}
                      className={({ isActive: linkActive }) => {
                        const active = isActive || linkActive;
                        return `flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                          active
                            ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-subtle'
                            : 'text-[#64748B] hover:text-[#172033] hover:bg-slate-50'
                        }`;
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout action in sidebar footer */}
        <div className="p-3 border-t border-[#E2E8F0]">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to sign out of the Roxiler Store Rating portal?"
        confirmText="Log Out"
        isDanger={true}
      />
    </>
  );
};
