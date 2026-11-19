import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { StarRating } from '../../components/common/StarRating';
import { RoleBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner, TableSkeleton } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Store,
  Star,
  TrendingUp,
  UserPlus,
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';

export const AdminDashboard = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active view tab on the dashboard: 'users' or 'stores'
  const [activeTab, setActiveTab] = useState('users');

  // Users Table State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSortBy, setUserSortBy] = useState('created_at');
  const [userSortOrder, setUserSortOrder] = useState('DESC');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userTotal, setUserTotal] = useState(0);

  // Stores Table State
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('created_at');
  const [storeSortOrder, setStoreSortOrder] = useState('DESC');
  const [storePage, setStorePage] = useState(1);
  const [storeTotalPages, setStoreTotalPages] = useState(1);
  const [storeTotal, setStoreTotal] = useState(0);

  // Detail Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await adminApi.getDashboardStats();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await adminApi.getUsers({
        search: userSearch,
        role: userRoleFilter,
        sortBy: userSortBy,
        sortOrder: userSortOrder,
        page: userPage,
        limit: 5
      });
      if (res.data.success) {
        setUsers(res.data.data.users);
        setUserTotalPages(res.data.data.pagination.totalPages);
        setUserTotal(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch Stores
  const fetchStores = async () => {
    try {
      setStoresLoading(true);
      const res = await adminApi.getStores({
        search: storeSearch,
        sortBy: storeSortBy,
        sortOrder: storeSortOrder,
        page: storePage,
        limit: 5
      });
      if (res.data.success) {
        setStores(res.data.data.stores);
        setStoreTotalPages(res.data.data.pagination.totalPages);
        setStoreTotal(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStoresLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchStats(), fetchUsers(), fetchStores()]).finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userPage, userRoleFilter, userSortBy, userSortOrder]);

  useEffect(() => {
    fetchStores();
  }, [storePage, storeSortBy, storeSortOrder]);

  // Handle Sorts
  const handleUserSort = (col) => {
    if (userSortBy === col) {
      setUserSortOrder(userSortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setUserSortBy(col);
      setUserSortOrder('ASC');
    }
    setUserPage(1);
  };

  const handleStoreSort = (col) => {
    if (storeSortBy === col) {
      setStoreSortOrder(storeSortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setStoreSortBy(col);
      setStoreSortOrder('ASC');
    }
    setStorePage(1);
  };

  // View User Details
  const handleInspectUser = async (id) => {
    try {
      setIsUserModalOpen(true);
      setModalLoading(true);
      const res = await adminApi.getUserDetails(id);
      if (res.data.success) {
        setSelectedUser(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load user details', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // View Store Details
  const handleInspectStore = async (id) => {
    try {
      setIsStoreModalOpen(true);
      setModalLoading(true);
      const res = await adminApi.getStoreDetails(id);
      if (res.data.success) {
        setSelectedStore(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load store details', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Administrator Dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            System Overview
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Real-time analytics, user accounts, registered stores, and ratings
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/users?action=new"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </Link>
          <Link
            to="/admin/stores?action=new"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-[#172033] border border-[#E2E8F0] text-xs font-semibold rounded-xl shadow-subtle transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            <span>Add Store</span>
          </Link>
        </div>
      </div>

      {/* Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          subtitle={`${stats?.totalNormalUsers || 0} Users · ${stats?.totalStoreOwners || 0} Owners · ${stats?.totalAdmins || 0} Admins`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Total Stores"
          value={stats?.totalStores || 0}
          subtitle="Registered commercial outlets"
          icon={Store}
          color="emerald"
        />
        <StatCard
          title="Total Ratings"
          value={stats?.totalRatings || 0}
          subtitle="Verified customer evaluations"
          icon={Star}
          color="amber"
        />
        <StatCard
          title="Average Rating"
          value={`${stats?.averageRating ? Number(stats.averageRating).toFixed(1) : '0.0'} / 5`}
          subtitle="System-wide store score"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-[#172033]">
              Recent Activity & Submitted Ratings
            </h2>
          </div>
          <Link
            to="/stores"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All Stores</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recentRatings && stats.recentRatings.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {stats.recentRatings.map((r) => (
              <div key={r.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-semibold text-[#172033] text-sm">{r.store_name}</span>
                  <p className="text-[#64748B] text-xs mt-0.5">
                    Rated by <span className="font-medium text-[#172033]">{r.user_name}</span> ({r.user_email})
                  </p>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <StarRating rating={r.rating} size="sm" showScore={true} />
                  <span className="text-[#64748B] text-[11px]">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#64748B] italic py-4">No recent rating activity.</p>
        )}
      </div>

      {/* Integrated User Management & Store Management Tables on Dashboard */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden">
        {/* Table Tabs Navigation */}
        <div className="border-b border-[#E2E8F0] px-6 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-[#64748B] hover:text-[#172033]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Management Table ({userTotal})</span>
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'stores'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-[#64748B] hover:text-[#172033]'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Store Management Table ({storeTotal})</span>
            </button>
          </div>

          <Link
            to={activeTab === 'users' ? '/admin/users' : '/admin/stores'}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hidden sm:flex items-center gap-1 pb-4"
          >
            <span>Full Page View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tab 1: User Management Table */}
        {activeTab === 'users' && (
          <div>
            {/* Filter Toolbar */}
            <div className="p-4 bg-slate-50/50 border-b border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  placeholder="Search user name, email, or address..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="py-1.5 px-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Roles</option>
                  <option value="USER">Normal User</option>
                  <option value="STORE_OWNER">Store Owner</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#64748B]">
                <thead className="bg-slate-50 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                  <tr>
                    <th onClick={() => handleUserSort('name')} className="px-6 py-3 cursor-pointer select-none">
                      <div className="flex items-center gap-1">
                        <span>Name</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th onClick={() => handleUserSort('email')} className="px-6 py-3 cursor-pointer select-none">
                      <div className="flex items-center gap-1">
                        <span>Email</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3">Address</th>
                    <th onClick={() => handleUserSort('role')} className="px-6 py-3 cursor-pointer select-none">
                      <div className="flex items-center gap-1">
                        <span>Role</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersLoading ? (
                    <tr>
                      <td colSpan="5">
                        <TableSkeleton rows={4} cols={5} />
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3.5 font-semibold text-[#172033]">
                          {u.name}
                        </td>
                        <td className="px-6 py-3.5">{u.email}</td>
                        <td className="px-6 py-3.5 max-w-xs truncate">{u.address || '-'}</td>
                        <td className="px-6 py-3.5">
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button
                            onClick={() => handleInspectUser(u.id)}
                            className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50"
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

            {/* Pagination */}
            <div className="p-3.5 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
              <span>Showing {users.length} of {userTotal} users</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={userPage <= 1}
                  onClick={() => setUserPage((p) => p - 1)}
                  className="p-1 rounded border border-[#E2E8F0] disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span>Page {userPage} of {userTotalPages || 1}</span>
                <button
                  disabled={userPage >= userTotalPages}
                  onClick={() => setUserPage((p) => p + 1)}
                  className="p-1 rounded border border-[#E2E8F0] disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Store Management Table */}
        {activeTab === 'stores' && (
          <div>
            {/* Filter Toolbar */}
            <div className="p-4 bg-slate-50/50 border-b border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={storeSearch}
                  onChange={(e) => {
                    setStoreSearch(e.target.value);
                    setStorePage(1);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && fetchStores()}
                  placeholder="Search store name, address, or email..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#64748B]">
                <thead className="bg-slate-50 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                  <tr>
                    <th onClick={() => handleStoreSort('name')} className="px-6 py-3 cursor-pointer select-none">
                      <div className="flex items-center gap-1">
                        <span>Store Name</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3">Address</th>
                    <th className="px-6 py-3">Owner</th>
                    <th onClick={() => handleStoreSort('rating')} className="px-6 py-3 cursor-pointer select-none">
                      <div className="flex items-center gap-1">
                        <span>Average Rating</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {storesLoading ? (
                    <tr>
                      <td colSpan="5">
                        <TableSkeleton rows={4} cols={5} />
                      </td>
                    </tr>
                  ) : stores.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                        No stores found.
                      </td>
                    </tr>
                  ) : (
                    stores.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3.5 font-semibold text-[#172033]">
                          {s.name}
                        </td>
                        <td className="px-6 py-3.5 max-w-xs truncate">{s.address}</td>
                        <td className="px-6 py-3.5">
                          {s.owner_name ? (
                            <span className="font-medium text-[#172033]">{s.owner_name}</span>
                          ) : (
                            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px]">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <StarRating rating={s.average_rating} showScore={true} totalReviews={s.total_ratings} size="sm" />
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button
                            onClick={() => handleInspectStore(s.id)}
                            className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50"
                            title="View Store Details"
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

            {/* Pagination */}
            <div className="p-3.5 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
              <span>Showing {stores.length} of {storeTotal} stores</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={storePage <= 1}
                  onClick={() => setStorePage((p) => p - 1)}
                  className="p-1 rounded border border-[#E2E8F0] disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span>Page {storePage} of {storeTotalPages || 1}</span>
                <button
                  disabled={storePage >= storeTotalPages}
                  onClick={() => setStorePage((p) => p + 1)}
                  className="p-1 rounded border border-[#E2E8F0] disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="User Profile & Activity" maxWidth="max-w-2xl">
        {modalLoading ? (
          <LoadingSpinner text="Fetching user details..." />
        ) : selectedUser?.user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#172033] text-base">{selectedUser.user.name}</h4>
                  <p className="text-xs text-[#64748B]">{selectedUser.user.email}</p>
                </div>
                <RoleBadge role={selectedUser.user.role} />
              </div>
              <p className="text-xs text-[#64748B] mt-2">Address: {selectedUser.user.address || 'None provided'}</p>
            </div>

            {selectedUser.user.role === 'USER' && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">
                  Ratings Submitted ({selectedUser.submittedRatings?.length || 0})
                </h5>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-[#E2E8F0] rounded-xl text-xs">
                  {selectedUser.submittedRatings?.map((r) => (
                    <div key={r.id} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#172033]">{r.store_name}</p>
                        <p className="text-[#64748B] text-[11px]">{r.store_address}</p>
                      </div>
                      <StarRating rating={r.rating} size="sm" showScore={true} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Store Details Modal */}
      <Modal isOpen={isStoreModalOpen} onClose={() => setIsStoreModalOpen(false)} title="Store Performance & Customer Reviews" maxWidth="max-w-2xl">
        {modalLoading ? (
          <LoadingSpinner text="Loading store details..." />
        ) : selectedStore?.store ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#172033] text-base">{selectedStore.store.name}</h4>
                <p className="text-xs text-[#64748B]">{selectedStore.store.address}</p>
              </div>
              <div className="text-right">
                <StarRating rating={selectedStore.store.average_rating} showScore={true} size="md" />
                <span className="text-[11px] text-[#64748B]">{selectedStore.store.total_ratings} reviews</span>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">
                Customer Reviews ({selectedStore.ratings?.length || 0})
              </h5>
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-[#E2E8F0] rounded-xl text-xs">
                {selectedStore.ratings?.map((r) => (
                  <div key={r.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#172033]">{r.user_name}</p>
                      <p className="text-[#64748B] text-[11px]">{r.user_email}</p>
                    </div>
                    <StarRating rating={r.rating} size="sm" showScore={true} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
