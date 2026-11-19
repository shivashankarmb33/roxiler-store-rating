import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ratingsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StarRating } from '../../components/common/StarRating';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Star,
  Search,
  MapPin,
  Compass,
  Edit3,
  Calendar
} from 'lucide-react';

export const MyRatingsPage = () => {
  const { showToast } = useToast();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeRating, setActiveRating] = useState(null);
  const [newScore, setNewScore] = useState(5);
  const [editLoading, setEditLoading] = useState(false);

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

  const filteredRatings = ratings.filter(
    (r) =>
      r.store_name.toLowerCase().includes(search.toLowerCase()) ||
      r.store_address.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenEdit = (item) => {
    setActiveRating(item);
    setNewScore(item.rating);
    setIsEditModalOpen(true);
  };

  const handleUpdateRating = async (e) => {
    e.preventDefault();
    if (!activeRating) return;

    try {
      setEditLoading(true);
      const res = await ratingsApi.modifyRating(activeRating.store_id, { rating: newScore });
      if (res.data.success) {
        showToast(`Updated rating for "${activeRating.store_name}" to ${newScore} stars!`, 'success');
        setIsEditModalOpen(false);
        fetchMyRatings();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update rating.';
      showToast(msg, 'error');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight flex items-center gap-2.5">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span>My Submitted Ratings</span>
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Manage your feedback history and modify previous ratings
          </p>
        </div>

        <Link
          to="/stores"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-colors"
        >
          <Compass className="w-4 h-4" />
          <span>Browse Stores</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-card">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your reviewed stores..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Ratings Grid */}
      {loading ? (
        <LoadingSpinner text="Loading your ratings..." />
      ) : filteredRatings.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-[#E2E8F0] text-[#64748B]">
          <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#172033]">No reviews found</h3>
          <p className="text-xs text-[#64748B] mt-1">
            {ratings.length === 0
              ? "You haven't submitted any reviews yet."
              : 'No reviewed stores match your search query.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRatings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-[#172033] text-base">
                  {item.store_name}
                </h3>
                <div className="flex items-start gap-1.5 text-xs text-[#64748B] mt-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{item.store_address}</span>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] block">
                      Your Rating
                    </span>
                    <StarRating rating={item.rating} showScore={true} size="md" />
                  </div>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-xl text-indigo-600 hover:bg-white hover:shadow-subtle border border-transparent hover:border-[#E2E8F0] transition-all flex items-center gap-1 text-xs font-semibold"
                    title="Edit Rating"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(item.updated_at).toLocaleDateString()}
                </span>
                <span>Store Overall: {item.store_average_rating} ★</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modify Store Rating"
      >
        {activeRating && (
          <form onSubmit={handleUpdateRating} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0]">
              <h4 className="font-bold text-[#172033] text-sm">{activeRating.store_name}</h4>
              <p className="text-xs text-[#64748B] mt-1">{activeRating.store_address}</p>
            </div>

            <div className="text-center py-4">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                Select your new rating (1 to 5 Stars)
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

            <div className="pt-2 flex justify-end gap-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 disabled:opacity-60 shadow-sm shadow-indigo-200"
              >
                {editLoading ? 'Saving...' : 'Update Rating'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
