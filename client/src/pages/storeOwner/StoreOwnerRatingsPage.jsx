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
  ChevronRight,
  Mail,
  MapPin,
  Calendar
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Users className="w-6 h-6 text-indigo-600" />
          <span>Customer Ratings & Reviews</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Detailed breakdown of all users who submitted ratings for your store
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search raters by name or email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
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
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Customer Name</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Email Address</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-6 py-3.5">Customer Address</th>
                <th
                  onClick={() => handleSort('rating')}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Rating Given</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('created_at')}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Submitted On</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
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
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No customer ratings found.
                  </td>
                </tr>
              ) : (
                ratings.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {r.user_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {r.user_email}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={r.user_address}>
                      {r.user_address || <span className="text-slate-400 italic">Not provided</span>}
                    </td>
                    <td className="px-6 py-4">
                      <StarRating rating={r.rating} showScore={true} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{ratings.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{pagination.total}</span> raters
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
