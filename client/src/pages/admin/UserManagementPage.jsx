import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { RoleBadge } from '../../components/common/Badge';
import { StarRating } from '../../components/common/StarRating';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner, TableSkeleton } from '../../components/common/LoadingSpinner';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters & sorting
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'USER'
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers({
        search,
        role: roleFilter,
        sortBy,
        sortOrder,
        page: pagination.page,
        limit: pagination.limit
      });
      if (res.data.success) {
        setUsers(res.data.data.users);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, roleFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers();
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

  // View User Details
  const handleViewDetails = async (id) => {
    try {
      setIsDetailsOpen(true);
      setDetailsLoading(true);
      const res = await adminApi.getUserDetails(id);
      if (res.data.success) {
        setSelectedUserDetails(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Validation rules check for create user
  const isNameValid = newUser.name.trim().length >= 20 && newUser.name.trim().length <= 60;
  const isPassLengthValid = newUser.password.length >= 8 && newUser.password.length <= 16;
  const hasUppercase = /[A-Z]/.test(newUser.password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newUser.password);
  const isAddressValid = newUser.address.length <= 400;

  // Handle Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isNameValid) {
      setFormError('Name must be between 20 and 60 characters.');
      return;
    }

    if (!isPassLengthValid || !hasUppercase || !hasSpecialChar) {
      setFormError('Password must be 8-16 characters with at least one uppercase letter and one special character.');
      return;
    }

    if (!isAddressValid) {
      setFormError('Address cannot exceed 400 characters.');
      return;
    }

    try {
      setFormLoading(true);
      await adminApi.createUser(newUser);
      setIsCreateOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'USER'
      });
      setSuccessMessage('New user created successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user.');
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
            <Users className="w-6 h-6 text-indigo-600" />
            <span>User Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, filter, inspect details, and create system users
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or address..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Roles</option>
              <option value="USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Sortable Table */}
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
                    <span>Name</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Email</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-6 py-3.5">Address</th>
                <th
                  onClick={() => handleSort('role')}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Role</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('created_at')}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Joined Date</span>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {u.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={u.address}>
                      {u.address || <span className="text-slate-400 italic">None provided</span>}
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewDetails(u.id)}
                        className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                        title="View User Details"
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
            Showing <span className="font-semibold text-slate-700">{users.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{pagination.total}</span> users
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

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New User"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-3.5">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Full Name
              </label>
              <span className={`text-[11px] ${newUser.name.length > 0 && !isNameValid ? 'text-rose-500' : 'text-slate-400'}`}>
                {newUser.name.length}/60 (req: 20-60 chars)
              </span>
            </div>
            <input
              type="text"
              required
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="e.g. Richard Franklin Henderson Owner"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="user@example.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <span className="text-[11px] text-slate-400">
                8–16 chars, uppercase & special char
              </span>
            </div>
            <input
              type="password"
              required
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
            />
            {newUser.password.length > 0 && (
              <div className="mt-1.5 grid grid-cols-3 gap-1 text-[10px]">
                <span className={isPassLengthValid ? 'text-emerald-600' : 'text-slate-400'}>
                  ✓ 8-16 chars
                </span>
                <span className={hasUppercase ? 'text-emerald-600' : 'text-slate-400'}>
                  ✓ 1 Uppercase
                </span>
                <span className={hasSpecialChar ? 'text-emerald-600' : 'text-slate-400'}>
                  ✓ 1 Special
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role
            </label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
            >
              <option value="USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Address (Optional)
              </label>
              <span className="text-[11px] text-slate-400">
                {newUser.address.length}/400
              </span>
            </div>
            <textarea
              rows="2"
              value={newUser.address}
              onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
              placeholder="Physical street address..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
            />
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
              {formLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* User Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="User Details & Activity"
        maxWidth="max-w-2xl"
      >
        {detailsLoading ? (
          <LoadingSpinner text="Fetching user details..." />
        ) : selectedUserDetails?.user ? (
          <div className="space-y-5">
            {/* User summary card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {selectedUserDetails.user.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedUserDetails.user.email}
                  </p>
                </div>
                <RoleBadge role={selectedUserDetails.user.role} />
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Address:</span>
                  <span className="text-slate-700 font-medium">
                    {selectedUserDetails.user.address || 'None provided'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Member Since:</span>
                  <span className="text-slate-700 font-medium">
                    {new Date(selectedUserDetails.user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Ratings Activity: If Normal User */}
            {selectedUserDetails.user.role === 'USER' && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Submitted Ratings ({selectedUserDetails.submittedRatings?.length || 0})
                </h5>
                {selectedUserDetails.submittedRatings?.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
                    {selectedUserDetails.submittedRatings.map((r) => (
                      <div key={r.id} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-800">{r.store_name}</p>
                          <p className="text-slate-400 text-[11px] truncate max-w-xs">{r.store_address}</p>
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
                  <p className="text-xs text-slate-400 italic">No ratings submitted yet.</p>
                )}
              </div>
            )}

            {/* If Store Owner: Owned Stores and Ratings Received */}
            {selectedUserDetails.user.role === 'STORE_OWNER' && (
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Owned Stores ({selectedUserDetails.ownedStores?.length || 0})
                  </h5>
                  {selectedUserDetails.ownedStores?.map((s) => (
                    <div key={s.id} className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 mb-2 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{s.name}</p>
                        <p className="text-slate-500">{s.address}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-indigo-700">{s.average_rating} ★</span>
                        <p className="text-[10px] text-slate-400">{s.total_ratings} reviews</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Customer Ratings Received ({selectedUserDetails.ratingsReceived?.length || 0})
                  </h5>
                  {selectedUserDetails.ratingsReceived?.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl text-xs">
                      {selectedUserDetails.ratingsReceived.map((r) => (
                        <div key={r.id} className="p-2.5 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-700">{r.user_name}</span>
                            <span className="text-slate-400 text-[11px] block">{r.user_email}</span>
                          </div>
                          <StarRating rating={r.rating} size="sm" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No ratings received yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
