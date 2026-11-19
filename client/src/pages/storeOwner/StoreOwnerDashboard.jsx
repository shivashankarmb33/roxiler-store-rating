import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storeOwnerApi } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { StarRating } from '../../components/common/StarRating';
import { LoadingSpinner, TableSkeleton } from '../../components/common/LoadingSpinner';
import {
  Store,
  Star,
  Users,
  TrendingUp,
  MapPin,
  Mail,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const StoreOwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [recentRatings, setRecentRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, ratingsRes] = await Promise.all([
        storeOwnerApi.getDashboardStats(),
        storeOwnerApi.getStoreRatings({ limit: 5, sortBy: 'created_at', sortOrder: 'DESC' })
      ]);

      if (dashRes.data.success) {
        setData(dashRes.data.data);
      }
      if (ratingsRes.data.success) {
        setRecentRatings(ratingsRes.data.data.ratings);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load store owner dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading Store Owner Dashboard..." />;
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700">
        <p className="font-semibold">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const hasStore = data?.hasStore;
  const store = data?.store;
  const stats = data?.stats;
  const total = stats?.totalRatings || 0;
  const distribution = stats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Store className="w-6 h-6 text-indigo-600" />
          <span>Store Owner Portal</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor your store performance, review customer feedback, and analyze ratings
        </p>
      </div>

      {!hasStore ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center max-w-xl mx-auto">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No Store Assigned Yet
          </h3>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
            Your account is registered as a Store Owner, but no store has been assigned to you yet.
            Please contact the System Administrator to assign your store location.
          </p>
        </div>
      ) : (
        <>
          {/* Store Overview Banner */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Store
                </span>
                <span className="text-xs text-slate-400">
                  ID: #{store.id}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {store.name}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
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

            <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-xl flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Overall Rating
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
              title="Average Rating"
              value={`${stats?.averageRating ? Number(stats.averageRating).toFixed(1) : '0.0'} / 5`}
              subtitle="Customer satisfaction index"
              icon={TrendingUp}
              color="indigo"
            />
            <StatCard
              title="Total Reviews"
              value={total}
              subtitle="Ratings submitted by customers"
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

          {/* Rating Breakdown & Recent Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rating Breakdown Bars */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-4">
                  Rating Distribution
                </h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = distribution[stars] || 0;
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs">
                        <span className="w-12 font-semibold text-slate-700 flex items-center gap-1 shrink-0">
                          {stars} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-slate-500 font-medium">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500">
                Calculated from all {total} verified user ratings
              </div>
            </div>

            {/* Recent Customers Who Rated */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-800">
                  Recent Customer Ratings
                </h3>
                <Link
                  to="/store-owner/ratings"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>View all raters</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentRatings.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No customers have rated your store yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentRatings.map((r) => (
                    <div key={r.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">
                          {r.user_name}
                        </p>
                        <p className="text-xs text-slate-400">{r.user_email}</p>
                      </div>

                      <div className="flex flex-col items-end">
                        <StarRating rating={r.rating} size="sm" />
                        <span className="text-[10px] text-slate-400 mt-1">
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
