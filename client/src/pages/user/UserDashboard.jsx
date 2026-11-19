import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { storesApi, ratingsApi } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { StarRating } from '../../components/common/StarRating';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner, TableSkeleton } from '../../components/common/LoadingSpinner';
import {
  Compass,
  Star,
  Search,
  MapPin,
  Mail,
  CheckCircle2,
  KeyRound,
  LogOut,
  Sparkles,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';

export const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Stats
  const [myRatingsCount, setMyRatingsCount] = useState(0);

  // Rating Modal State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [activeStore, setActiveStore] = useState(null);
  const [selectedScore, setSelectedScore] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);

  // Logout confirm
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Fetch stores
  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await storesApi.getStores({
        search,
        sortBy,
        sortOrder,
        limit: 100 // show all available discovery stores
      });

      if (res.data.success) {
        setStores(res.data.data.stores);
        const rated = res.data.data.stores.filter((s) => s.user_rating !== null).length;
        setMyRatingsCount(rated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const handleOpenRating = (store) => {
    setActiveStore(store);
    setSelectedScore(store.user_rating || 5);
    setIsRatingModalOpen(true);
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!activeStore) return;

    try {
      setSubmittingRating(true);
      const res = await ratingsApi.submitRating({
        store_id: activeStore.id,
        rating: selectedScore
      });

      if (res.data.success) {
        showToast(
          activeStore.user_rating
            ? `Your rating for "${activeStore.name}" was updated to ${selectedScore} stars!`
            : `Thank you! Submitted ${selectedScore} stars for "${activeStore.name}".`,
          'success'
        );

        // Update local state optimistically
        setStores((prev) =>
          prev.map((s) =>
            s.id === activeStore.id
              ? {
                  ...s,
                  user_rating: selectedScore,
                  average_rating: res.data.data.average_rating,
                  total_ratings: res.data.data.total_ratings
                }
              : s
          )
        );

        setIsRatingModalOpen(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save rating.';
      showToast(msg, 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    showToast('Logged out successfully', 'success');
    logout();
  };

  return (
    <div className="space-y-8">
      {/* Welcome Heading Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Store Discovery Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-sm text-[#64748B] mt-1 max-w-xl">
            Browse registered stores, view overall ratings, and submit or update your reviews.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          <Link
            to="/change-password"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#172033] bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] transition-colors"
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Available Stores"
          value={stores.length}
          subtitle="Registered in the store directory"
          icon={Compass}
          color="indigo"
        />
        <StatCard
          title="My Submitted Ratings"
          value={myRatingsCount}
          subtitle="Stores you have reviewed"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Pending Reviews"
          value={Math.max(0, stores.length - myRatingsCount)}
          subtitle="Stores awaiting your feedback"
          icon={Star}
          color="amber"
        />
      </div>

      {/* Search & Sort Discovery Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores by name or address..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-[#64748B] font-medium">Sort by:</span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [col, ord] = e.target.value.split('-');
              setSortBy(col);
              setSortOrder(ord);
            }}
            className="py-1.5 px-3 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="name-ASC">Name (A–Z)</option>
            <option value="name-DESC">Name (Z–A)</option>
            <option value="rating-DESC">Highest Rated</option>
            <option value="rating-ASC">Lowest Rated</option>
          </select>
        </div>
      </div>

      {/* Store Listing Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-2xl border border-slate-100 h-56" />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-[#E2E8F0] text-[#64748B]">
          <Compass className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#172033]">No stores found</h3>
          <p className="text-xs text-[#64748B] mt-1">
            Try adjusting your search query to discover stores.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card hover:shadow-popover transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-[#172033] text-base leading-snug">
                    {store.name}
                  </h3>
                  <div className="shrink-0 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span className="text-xs font-bold text-amber-800">
                      {store.average_rating ? Number(store.average_rating).toFixed(1) : '0.0'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-[#64748B]">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{store.email}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B]">Overall Score</span>
                  <StarRating
                    rating={store.average_rating}
                    totalReviews={store.total_ratings}
                    size="sm"
                    showScore={true}
                  />
                </div>
              </div>

              {/* User's Submitted Rating & Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {store.user_rating ? (
                    <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-1 rounded-lg">
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Your rating: {store.user_rating} ★</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Not rated yet</span>
                  )}
                </div>

                <button
                  onClick={() => handleOpenRating(store)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-subtle ${
                    store.user_rating
                      ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                  }`}
                >
                  {store.user_rating ? 'Update Rating' : 'Rate Store'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive 5-Star Rating Modal */}
      <Modal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        title={activeStore?.user_rating ? 'Modify Submitted Rating' : 'Submit Five-Star Rating'}
      >
        {activeStore && (
          <form onSubmit={handleSubmitRating} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0]">
              <h4 className="font-bold text-[#172033] text-base">{activeStore.name}</h4>
              <p className="text-xs text-[#64748B] mt-1">{activeStore.address}</p>
              <div className="mt-2.5 flex items-center gap-2 text-xs text-[#64748B]">
                <span>Overall average rating:</span>
                <StarRating rating={activeStore.average_rating} showScore={true} size="sm" />
              </div>
            </div>

            <div className="text-center py-4">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                Click a star to select your rating (1 to 5 Stars)
              </p>
              <div className="flex justify-center">
                <StarRating
                  rating={selectedScore}
                  interactive={true}
                  onChange={(val) => setSelectedScore(val)}
                  size="xl"
                />
              </div>
              <p className="text-base font-bold text-indigo-600 mt-3">
                {selectedScore} out of 5 Stars
              </p>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setIsRatingModalOpen(false)}
                className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingRating}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 disabled:opacity-60 shadow-sm shadow-indigo-200"
              >
                {submittingRating ? 'Saving...' : activeStore.user_rating ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Sign Out"
        message="Are you sure you want to log out of your Roxiler account?"
        confirmText="Log Out"
        isDanger={true}
      />
    </div>
  );
};
