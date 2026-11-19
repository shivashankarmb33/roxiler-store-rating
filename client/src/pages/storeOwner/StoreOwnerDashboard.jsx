import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { storeOwnerApi } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { StarRating } from '../../components/common/StarRating';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner, TableSkeleton } from '../../components/common/LoadingSpinner';
import {
  Store,
  Star,
  Users,
  TrendingUp,
  MapPin,
  Mail,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  LogOut,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const StoreOwnerDashboard = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Customer Ratings Table State
  const [ratings, setRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRatingsCount, setTotalRatingsCount] = useState(0);

  // Logout dialog
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Fetch Dashboard Summary Stats
  const fetchDashboardStats = async () => {
    try {
      const res = await storeOwnerApi.getDashboardStats();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Customer Ratings Table
  const fetchRatings = async () => {
    try {
      setRatingsLoading(true);
      const res = await storeOwnerApi.getStoreRatings({
        search,
        rating: ratingFilter,
        sortBy,
        sortOrder,
        page,
        limit: 10
      });

      if (res.data.success) {
        setRatings(res.data.data.ratings);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalRatingsCount(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRatingsLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDashboardStats(), fetchRatings()]).finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchRatings();
  }, [page, ratingFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRatings();
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
    setPage(1);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    showToast('Logged out successfully', 'success');
    logout();
  };

  if (loading) {
    return <LoadingSpinner text="Loading Store Business Analytics..." />;
  }

  const hasStore = data?.hasStore;
  const store = data?.store;
  const stats = data?.stats;
  const total = stats?.totalRatings || 0;
  const distribution = stats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Store Performance Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Store Owner Dashboard
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Monitor overall customer feedback, ratings trends, and reviewer details
          </p>
        </div>

        {/* Quick action buttons: Change Password & Logout */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/change-password"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#172033] bg-white hover:bg-slate-50 border border-[#E2E8F0] shadow-subtle transition-colors"
          >
            <KeyRound className="w-4 h-4 text-slate-500" />
            <span>Change Password</span>
          </Link>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {!hasStore ? (
        <div className="bg-white rounded-2xl p-12 border border-[#E2E8F0] shadow-card text-center max-w-xl mx-auto">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#172033]">
            No Store Assigned Yet
          </h3>
          <p className="text-sm text-[#64748B] mt-1.5 leading-relaxed">
            Your account is registered as a Store Owner, but no commercial store has been assigned to you.
            Please contact the System Administrator to assign your store location.
          </p>
        </div>
      ) : (
        <>
          {/* Store Overview Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
                  Active Commercial Store
                </span>
                <span className="text-xs text-[#64748B]">
                  Store ID: #{store.id}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight">
                {store.name}
              </h2>
              <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{store.address}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{store.email}</span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50/80 border border-indigo-100 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-subtle">
              <div className="text-right">
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Store Score
                </p>
                <p className="text-2xl font-black text-indigo-700">
                  {stats?.averageRating ? Number(stats.averageRating).toFixed(1) : '0.0'}
                </p>
              </div>
              <StarRating rating={stats?.averageRating} size="lg" />
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              title="Average Store Rating"
              value={`${stats?.averageRating ? Number(stats.averageRating).toFixed(1) : '0.0'} / 5`}
              subtitle="Calculated customer score"
              icon={TrendingUp}
              color="indigo"
            />
            <StatCard
              title="Total Submitted Ratings"
              value={total}
              subtitle="Total verified customer evaluations"
              icon={Users}
              color="emerald"
            />
            <StatCard
              title="5-Star Ratings"
              value={distribution[5] || 0}
              subtitle={`${total > 0 ? Math.round(((distribution[5] || 0) / total) * 100) : 0}% of all customer reviews`}
              icon={Star}
              color="amber"
            />
          </div>

          {/* Rating Distribution Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-card">
            <h3 className="text-base font-bold text-[#172033] mb-4">
              Rating Distribution Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = distribution[stars] || 0;
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={stars} className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#172033] mb-2">
                      <span className="flex items-center gap-1">
                        {stars} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      </span>
                      <span className="text-[#64748B]">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-1.5">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-[#64748B] text-right font-medium">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Ratings Table Section */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden">
            <div className="p-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#172033]">
                  Customer Ratings & Feedback
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Full list of verified customers who rated your store
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search customer name or email..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white"
                  />
                </form>

                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={ratingFilter}
                    onChange={(e) => {
                      setRatingFilter(e.target.value);
                      setPage(1);
                    }}
                    className="py-1.5 px-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Stars</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#64748B]">
                <thead className="bg-slate-50 text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                  <tr>
                    <th
                      onClick={() => handleSort('name')}
                      className="px-6 py-3.5 cursor-pointer hover:text-[#172033] select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Customer Name</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('email')}
                      className="px-6 py-3.5 cursor-pointer hover:text-[#172033] select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Email Address</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('rating')}
                      className="px-6 py-3.5 cursor-pointer hover:text-[#172033] select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Rating Submitted</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('created_at')}
                      className="px-6 py-3.5 cursor-pointer hover:text-[#172033] select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Submission Date</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ratingsLoading ? (
                    <tr>
                      <td colSpan="4">
                        <TableSkeleton rows={4} cols={4} />
                      </td>
                    </tr>
                  ) : ratings.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-[#64748B]">
                        No customer ratings found.
                      </td>
                    </tr>
                  ) : (
                    ratings.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-semibold text-[#172033]">
                          {r.user_name}
                        </td>
                        <td className="px-6 py-4 text-[#64748B]">
                          {r.user_email}
                        </td>
                        <td className="px-6 py-4">
                          <StarRating rating={r.rating} showScore={true} size="sm" />
                        </td>
                        <td className="px-6 py-4 text-[#64748B] text-xs">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-3.5 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
              <div>
                Showing <span className="font-semibold text-[#172033]">{ratings.length}</span> of{' '}
                <span className="font-semibold text-[#172033]">{totalRatingsCount}</span> ratings
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1.5 rounded-lg border border-[#E2E8F0] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-[#64748B]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-medium text-[#172033]">
                  Page {page} of {totalPages || 1}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-[#E2E8F0] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-[#64748B]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of the Store Owner portal?"
        confirmText="Log Out"
        isDanger={true}
      />
    </div>
  );
};
