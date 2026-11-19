import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { StarRating } from '../../components/common/StarRating';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Users,
  Store,
  Star,
  TrendingUp,
  UserPlus,
  Store as StoreIcon,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDashboardStats();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading Administrator Dashboard..." />;
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700">
        <p className="font-semibold">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System overview, registered entities, and store ratings analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>
          <Link
            to="/admin/stores"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <StoreIcon className="w-4 h-4 text-indigo-600" />
            <span>Manage Stores</span>
          </Link>
        </div>
      </div>

      {/* Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          subtitle={`${stats?.totalNormalUsers || 0} Users · ${stats?.totalStoreOwners || 0} Store Owners`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Total Stores"
          value={stats?.totalStores || 0}
          subtitle="Registered commercial outlets"
          icon={Store}
          color="emerald"
        />
        <StatCard
          title="Submitted Ratings"
          value={stats?.totalRatings || 0}
          subtitle="User feedback submissions"
          icon={Star}
          color="amber"
        />
        <StatCard
          title="Average Rating"
          value={`${stats?.averageRating ? Number(stats.averageRating).toFixed(1) : '0.0'} / 5`}
          subtitle="System-wide store performance"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Secondary Information & Recent Ratings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Distribution breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-4">
              User Accounts Distribution
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Normal Users</span>
                  <span className="font-semibold text-slate-800">{stats?.totalNormalUsers || 0}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${stats?.totalUsers ? (stats.totalNormalUsers / stats.totalUsers) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Store Owners</span>
                  <span className="font-semibold text-slate-800">{stats?.totalStoreOwners || 0}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${stats?.totalUsers ? (stats.totalStoreOwners / stats.totalUsers) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Administrators</span>
                  <span className="font-semibold text-slate-800">{stats?.totalAdmins || 0}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{
                      width: `${stats?.totalUsers ? (stats.totalAdmins / stats.totalUsers) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <Link
              to="/admin/users"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center justify-between"
            >
              <span>View and manage all users</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Recent Ratings Timeline */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">
              Recent Store Ratings
            </h2>
            <Link
              to="/stores"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Browse stores</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.recentRatings && stats.recentRatings.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.recentRatings.map((rating) => (
                <div key={rating.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {rating.store_name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rated by <span className="font-medium text-slate-700">{rating.user_name}</span> ({rating.user_email})
                    </p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <StarRating rating={rating.rating} size="sm" />
                    <span className="text-[11px] text-slate-400 mt-1">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-slate-400">
              No store ratings submitted yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
