import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ratingsApi } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { StarRating } from '../../components/common/StarRating';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Compass,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Edit3
} from 'lucide-react';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Rating Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeRating, setActiveRating] = useState(null);
  const [newScore, setNewScore] = useState(5);
  const [editLoading, setEditLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchMyRatings = async () => {
    try {
      setLoading(true);
      const res = await ratingsApi.getMyRatings();
      if (res.data.success) {
        setRatings(res.data.data.ratings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRatings();
  }, []);

  const totalRated = ratings.length;
  const avgGiven =
    totalRated > 0
      ? (ratings.reduce((acc, r) => acc + r.rating, 0) / totalRated).toFixed(1)
      : '0.0';

  const handleOpenEdit = (ratingItem) => {
    setActiveRating(ratingItem);
    setNewScore(ratingItem.rating);
    setIsEditModalOpen(true);
  };

  const handleUpdateRating = async (e) => {
    e.preventDefault();
    if (!activeRating) return;

    try {
      setEditLoading(true);
      const res = await ratingsApi.modifyRating(activeRating.store_id, { rating: newScore });
      if (res.data.success) {
        setFeedback('Rating updated successfully!');
        setIsEditModalOpen(false);
        fetchMyRatings();
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading user dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-900/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Customer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-indigo-100 text-sm mt-1.5 max-w-xl">
            Discover verified stores in your area, submit authentic customer reviews, and help others find the best services.
          </p>
        </div>

        <Link
          to="/stores"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-700 font-bold text-sm shadow-md hover:bg-indigo-50 transition-all self-start md:self-auto shrink-0"
        >
          <Compass className="w-4 h-4" />
          <span>Browse Stores</span>
        </Link>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Stores Rated"
          value={totalRated}
          subtitle="Your submitted store ratings"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Avg Rating Given"
          value={`${avgGiven} / 5`}
          subtitle="Your typical rating score"
          icon={Star}
          color="amber"
        />
        <StatCard
          title="Recent Activity"
          value={totalRated > 0 ? 'Active' : 'No Reviews'}
          subtitle={totalRated > 0 ? `Latest: ${new Date(ratings[0]?.updated_at).toLocaleDateString()}` : 'Start rating stores'}
          icon={Clock}
          color="indigo"
        />
      </div>

      {/* My Submitted Reviews List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Your Store Reviews & Ratings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review history and modifications
            </p>
          </div>

          <Link
            to="/stores"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Rate more stores</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {ratings.length === 0 ? (
          <div className="py-12 text-center">
            <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">No ratings submitted yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You haven't reviewed any stores yet. Browse available stores to submit your first rating!
            </p>
            <Link
              to="/stores"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Browse All Stores</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {ratings.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {item.store_name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.store_address}</p>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Store avg: {item.store_average_rating} ★ ({item.store_total_ratings} reviews)</span>
                    <span>·</span>
                    <span>Reviewed: {new Date(item.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] text-slate-400 mb-0.5">Your Rating</span>
                    <StarRating rating={item.rating} showScore={true} size="sm" />
                  </div>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 border border-indigo-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    title="Modify rating"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Rating Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modify Store Rating"
      >
        {activeRating && (
          <form onSubmit={handleUpdateRating} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <h4 className="font-bold text-slate-800 text-sm">{activeRating.store_name}</h4>
              <p className="text-xs text-slate-500 mt-1">{activeRating.store_address}</p>
            </div>

            <div className="text-center py-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Update your rating score (1 to 5 Stars)
              </p>
              <div className="flex justify-center">
                <StarRating
                  rating={newScore}
                  interactive={true}
                  onChange={(val) => setNewScore(val)}
                  size="xl"
                />
              </div>
              <p className="text-sm font-bold text-indigo-600 mt-2">
                {newScore} out of 5 Stars
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 disabled:opacity-60 shadow-sm shadow-indigo-200"
              >
                {editLoading ? 'Updating...' : 'Save New Rating'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
