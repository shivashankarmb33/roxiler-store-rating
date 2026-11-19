import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { StarRating } from '../../components/common/StarRating';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner, TableSkeleton } from '../../components/common/LoadingSpinner';
import {
  Store,
  Search,
  Plus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Mail,
  UserCheck
} from 'lucide-react';

export const StoreManagementPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters & sorting
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Modals & form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedStoreDetails, setSelectedStoreDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [storeOwners, setStoreOwners] = useState([]);
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch stores
  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getStores({
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

  // Fetch available store owners for dropdown
  const fetchStoreOwners = async () => {
    try {
      const res = await adminApi.getStoreOwners();
      if (res.data.success) {
        setStoreOwners(res.data.data.owners);
      }
    } catch (err) {
      console.error(err);
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

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // View store details
  const handleViewDetails = async (id) => {
    try {
      setIsDetailsOpen(true);
      setDetailsLoading(true);
      const res = await adminApi.getStoreDetails(id);
      if (res.data.success) {
        setSelectedStoreDetails(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Validation rules for store
  const isNameValid = newStore.name.trim().length >= 20 && newStore.name.trim().length <= 60;
  const isAddressValid = newStore.address.trim().length > 0 && newStore.address.length <= 400;

  // Handle Create Store
  const handleCreateStore = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isNameValid) {
      setFormError('Store name must be between 20 and 60 characters.');
      return;
    }

    if (!isAddressValid) {
      setFormError('Store address is required and cannot exceed 400 characters.');
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        name: newStore.name.trim(),
        email: newStore.email.trim(),
        address: newStore.address.trim(),
        owner_id: newStore.owner_id ? parseInt(newStore.owner_id, 10) : null
      };

      await adminApi.createStore(payload);
      setIsCreateOpen(false);
      setNewStore({ name: '', email: '', address: '', owner_id: '' });
      setSuccessMessage('Store created successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchStores();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create store.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Store className="w-6 h-6 text-indigo-600" />
            <span>Store Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create stores, assign store owners, and review customer ratings
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            fetchStoreOwners();
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Store</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores by name, email, or address..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
          />
        </form>
      </div>

      {/* Stores Sortable Table */}
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
                    <span>Store Name</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Store Email</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('address')}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Address</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-6 py-3.5">Assigned Owner</th>
                <th
                  onClick={() => handleSort('rating')}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Average Rating</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-6 py-3.5 text-right">Actions</th>
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
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No stores found matching your query.
                  </td>
                </tr>
              ) : (
                stores.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {s.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {s.email}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={s.address}>
                      {s.address}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {s.owner_name ? (
                        <div>
                          <p className="font-medium text-slate-800 text-xs">{s.owner_name}</p>
                          <p className="text-[11px] text-slate-400">{s.owner_email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StarRating
                        rating={s.average_rating}
                        showScore={true}
                        totalReviews={s.total_ratings}
                        size="sm"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewDetails(s.id)}
                        className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                        title="View Store Details & Ratings"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{stores.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{pagination.total}</span> stores
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

      {/* Create Store Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Store"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateStore} className="space-y-3.5">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Store Name
              </label>
              <span className={`text-[11px] ${newStore.name.length > 0 && !isNameValid ? 'text-rose-500' : 'text-slate-400'}`}>
                {newStore.name.length}/60 (req: 20-60 chars)
              </span>
            </div>
            <input
              type="text"
              required
              value={newStore.name}
              onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
              placeholder="e.g. Apex Electronics Superstore Flagship"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Contact Email
            </label>
            <input
              type="email"
              required
              value={newStore.email}
              onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
              placeholder="contact@storename.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Store Address
              </label>
              <span className="text-[11px] text-slate-400">
                {newStore.address.length}/400
              </span>
            </div>
            <textarea
              rows="2"
              required
              value={newStore.address}
              onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
              placeholder="Commercial address, Suite/Floor, City, State..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assign Store Owner (Optional)
            </label>
            <select
              value={newStore.owner_id}
              onChange={(e) => setNewStore({ ...newStore, owner_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
            >
              <option value="">None (Unassigned)</option>
              {storeOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Only users with the Store Owner role can be assigned.
            </p>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 disabled:opacity-60"
            >
              {formLoading ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Store Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Store Details & Feedback"
        maxWidth="max-w-2xl"
      >
        {detailsLoading ? (
          <LoadingSpinner text="Loading store details..." />
        ) : selectedStoreDetails?.store ? (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {selectedStoreDetails.store.name}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {selectedStoreDetails.store.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedStoreDetails.store.address}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <StarRating
                    rating={selectedStoreDetails.store.average_rating}
                    showScore={true}
                    size="sm"
                  />
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {selectedStoreDetails.store.total_ratings} total reviews
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs">
                <span className="text-slate-400">Assigned Store Owner: </span>
                {selectedStoreDetails.store.owner_name ? (
                  <span className="font-semibold text-slate-700">
                    {selectedStoreDetails.store.owner_name} ({selectedStoreDetails.store.owner_email})
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium italic">None assigned</span>
                )}
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Customer Ratings ({selectedStoreDetails.ratings?.length || 0})
              </h5>
              {selectedStoreDetails.ratings?.length > 0 ? (
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
                  {selectedStoreDetails.ratings.map((r) => (
                    <div key={r.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-800">{r.user_name}</p>
                        <p className="text-slate-400 text-[11px]">{r.user_email}</p>
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
              ) : (
                <p className="text-xs text-slate-400 italic">No ratings submitted for this store yet.</p>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
