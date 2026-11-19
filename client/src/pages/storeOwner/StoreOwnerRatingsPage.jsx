import React, { useState, useEffect } from 'react';
import { storeOwnerApi } from '../../services/api';
import { StarRating } from '../../components/common/StarRating';
import { LoadingSpinner, TableSkeleton } from '../../components/common/LoadingSpinner';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const StoreOwnerRatingsPage = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filter & sort
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const res = await storeOwnerApi.getStoreRatings({
        search,
        rating: ratingFilter,
        sortBy,
        sortOrder,
        page: pagination.page,
        limit: pagination.limit
      });

      if (res.data.success) {
        setRatings(res.data.data.ratings);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [pagination.page, ratingFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
    fetchRatings();
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
    setPagination((p) => ({ ...p, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight flex items-center gap-2.5">
          <Users className="w-6 h-6 text-indigo-600" />
          <span>Customer Ratings & Feedback</span>
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Detailed breakdown of all users who submitted ratings for your store
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-card flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search raters by name or email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="py-1.5 px-3 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Star Ratings</option>
            <option value="5">5 Stars only</option>
            <option value="4">4 Stars only</option>
            <option value="3">3 Stars only</option>
            <option value="2">2 Stars only</option>
            <option value="1">1 Star only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden">
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
                <th className="px-6 py-3.5">Customer Address</th>
                <th
                  onClick={() => handleSort('rating')}
                  className="px-6 py-3.5 cursor-pointer hover:text-[#172033] select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Rating Given</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('created_at')}
                  className="px-6 py-3.5 cursor-pointer hover:text-[#172033] select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Submitted On</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5">
                    <TableSkeleton rows={5} cols={5} />
                  </td>
                </tr>
              ) : ratings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[#64748B]">
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
                    <td className="px-6 py-4 text-[#64748B] max-w-xs truncate" title={r.user_address}>
                      {r.user_address || <span className="text-slate-400 italic">Not provided</span>}
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
            <span className="font-semibold text-[#172033]">{pagination.total}</span> raters
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
      </div>
    </div>
  );
};
