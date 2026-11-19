import React, { useState, useEffect } from 'react';
import { storesApi, ratingsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StarRating } from '../../components/common/StarRating';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner, TableSkeleton } from '../../components/common/LoadingSpinner';
import {
  Store,
  Search,
  MapPin,
  Mail,
  Star,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Check
} from 'lucide-react';

export const StoreListingPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isNormalUser = user?.role === 'USER';

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  // Filters & sorting
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [viewMode, setViewMode] = useState('grid');

  // Rating Modal
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [activeStore, setActiveStore] = useState(null);
  const [selectedScore, setSelectedScore] = useState(5);
  const [ratingLoading, setRatingLoading] = useState(false);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await storesApi.getStores({
        search,
        sortBy,
        sortOrder,
        page: pagination.page,
        limit: pagination.limit
      });
      if (res.data.success) {
        setStores(res.data.data.stores);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [pagination.page, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
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
      setRatingLoading(true);
      const res = await ratingsApi.submitRating({
        store_id: activeStore.id,
        rating: selectedScore
      });

      if (res.data.success) {
        showToast(
          activeStore.user_rating
            ? `Your rating for "${activeStore.name}" was updated to ${selectedScore} stars!`
            : `Thank you! Submitted ${selectedScore}-star rating for "${activeStore.name}".`,
          'success'
        );

        setStores((prev) =>
          prev.map((s) => {
            if (s.id === activeStore.id) {
              return {
                ...s,
                user_rating: selectedScore,
                average_rating: res.data.data.average_rating,
                total_ratings: res.data.data.total_ratings
              };
            }
            return s;
          })
        );

        setIsRatingModalOpen(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit rating.';
      showToast(msg, 'error');
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight flex items-center gap-2.5">
            <Store className="w-6 h-6 text-indigo-600" />
            <span>Store Directory</span>
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Browse registered stores, view ratings, and submit your review
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-[#64748B] hover:text-[#172033]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-[#64748B] hover:text-[#172033]'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Sort Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-card flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores by name or address..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-[#64748B] font-medium">Sort by:</span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [col, ord] = e.target.value.split('-');
              setSortBy(col);
              setSortOrder(ord);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="py-1.5 px-3 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="name-ASC">Name (A–Z)</option>
            <option value="name-DESC">Name (Z–A)</option>
            <option value="rating-DESC">Highest Rated</option>
            <option value="rating-ASC">Lowest Rated</option>
            <option value="created_at-DESC">Recently Added</option>
          </select>
        </div>
      </div>

      {/* View Mode: Grid */}
      {viewMode === 'grid' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white p-6 rounded-2xl border border-slate-100 h-52" />
              ))}
            </div>
          ) : stores.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-[#E2E8F0] text-[#64748B]">
              No stores found matching your search.
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

                  {/* Rating Action for Users */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {store.user_rating ? (
                        <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-1 rounded-lg">
                          <Check className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Your rating: {store.user_rating} ★</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not rated by you</span>
                      )}
                    </div>

                    {isNormalUser && (
                      <button
                        onClick={() => handleOpenRating(store)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-subtle ${
                          store.user_rating
                            ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                        }`}
                      >
                        {store.user_rating ? 'Modify Rating' : 'Rate Store'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* View Mode: Table */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#64748B]">
              <thead className="bg-slate-50 text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-6 py-3.5">Store Name</th>
                  <th className="px-6 py-3.5">Address</th>
                  <th className="px-6 py-3.5">Contact Email</th>
                  <th className="px-6 py-3.5">Overall Rating</th>
                  <th className="px-6 py-3.5">Your Rating</th>
                  {isNormalUser && <th className="px-6 py-3.5 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6">
                      <TableSkeleton rows={5} cols={6} />
                    </td>
                  </tr>
                ) : stores.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-[#64748B]">
                      No stores found.
                    </td>
                  </tr>
                ) : (
                  stores.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#172033]">
                        {s.name}
                      </td>
                      <td className="px-6 py-4 text-[#64748B] max-w-xs truncate" title={s.address}>
                        {s.address}
                      </td>
                      <td className="px-6 py-4 text-[#64748B]">
                        {s.email}
                      </td>
                      <td className="px-6 py-4">
                        <StarRating
                          rating={s.average_rating}
                          showScore={true}
                          totalReviews={s.total_ratings}
                          size="sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        {s.user_rating ? (
                          <span className="font-semibold text-indigo-600 text-xs">
                            {s.user_rating} ★
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">-</span>
                        )}
                      </td>
                      {isNormalUser && (
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenRating(s)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-colors"
                          >
                            {s.user_rating ? 'Edit' : 'Rate'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="bg-white px-6 py-3.5 rounded-2xl border border-[#E2E8F0] shadow-card flex items-center justify-between text-xs text-[#64748B]">
        <div>
          Showing <span className="font-semibold text-[#172033]">{stores.length}</span> of{' '}
          <span className="font-semibold text-[#172033]">{pagination.total}</span> stores
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
            className="p-1.5 rounded-lg border border-[#E2E8F0] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-[#64748B]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-medium text-[#172033]">
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
            className="p-1.5 rounded-lg border border-[#E2E8F0] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-[#64748B]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rate Store Modal */}
      <Modal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        title={activeStore?.user_rating ? 'Modify Store Rating' : 'Submit Store Rating'}
      >
        {activeStore && (
          <form onSubmit={handleSubmitRating} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0]">
              <h4 className="font-bold text-[#172033] text-base">{activeStore.name}</h4>
              <p className="text-xs text-[#64748B] mt-1">{activeStore.address}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-[#64748B]">
                <span>Current store rating:</span>
                <StarRating rating={activeStore.average_rating} showScore={true} size="sm" />
              </div>
            </div>

            <div className="text-center py-4">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                Select your rating (1 to 5 Stars)
              </p>
              <div className="flex justify-center">
                <StarRating
                  rating={selectedScore}
                  interactive={true}
                  onChange={(val) => setSelectedScore(val)}
                  size="xl"
                />
              </div>
              <p className="text-sm font-bold text-indigo-600 mt-2">
                {selectedScore} out of 5 Stars
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setIsRatingModalOpen(false)}
                className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={ratingLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 disabled:opacity-60 shadow-sm shadow-indigo-200"
              >
                {ratingLoading ? 'Saving...' : activeStore.user_rating ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
