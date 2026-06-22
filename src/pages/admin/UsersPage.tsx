import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Trash2, Lock, Unlock, Users, ShieldAlert, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getUsersList, updateUserStatus, changeUserRole, deleteUser } from '../../services/admin.service';

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filters & Pagination
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cohortFilter, setCohortFilter] = useState('all'); // School vs University
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsersList();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleExportCSV = () => {
    if (users.length === 0) {
      toast.error('No user data to export.');
      return;
    }
    const headers = ['ID', 'Name', 'Email', 'Role', 'Grade/Cohort', 'Status', 'XP', 'Created At'];
    const rows = users.map(u => [
      u.id,
      u.name || 'Anonymous',
      u.email,
      u.role || 'student',
      u.grade_level || u.user_type || 'college',
      u.status || 'active',
      u.xp || 0,
      u.created_at || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `scholarhub_users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export download started.');
  };

  const handleUserStatusToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    const action = newStatus === 'suspended' ? 'suspend' : 'activate';
    
    if (userId === currentUser?.id) {
      toast.error('You cannot suspend your own account!');
      return;
    }

    if (!confirm(`Are you sure you want to ${action} this user's account?`)) {
      return;
    }

    try {
      await updateUserStatus(currentUser!.id, userId, newStatus);
      toast.success(`User successfully ${newStatus === 'suspended' ? 'suspended' : 'activated'}.`);
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${action} user.`);
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: 'student' | 'teacher' | 'admin') => {
    if (userId === currentUser?.id) {
      toast.error('You cannot demote or change your own admin role status!');
      return;
    }
    
    if (!confirm(`Change this user's role to ${newRole.toUpperCase()}?`)) {
      return;
    }

    try {
      await changeUserRole(currentUser!.id, userId, newRole);
      toast.success(`Role updated to ${newRole}.`);
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to change user role.');
    }
  };

  const handleUserDelete = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error('You cannot delete your own admin account!');
      return;
    }

    if (!confirm('CRITICAL WARNING: This will permanently delete the user account and all associated profile details, courses, and progress. This action CANNOT be undone. Proceed?')) {
      return;
    }

    try {
      await deleteUser(currentUser!.id, userId);
      toast.success('User permanently deleted.');
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete user.');
    }
  };

  // Filter logic
  const filteredUsers = users.filter((u: any) => {
    const term = search.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(term);
    const emailMatch = u.email?.toLowerCase().includes(term);
    if (search && !nameMatch && !emailMatch) return false;
    
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    
    if (statusFilter !== 'all') {
      const uStatus = u.status || 'active';
      if (statusFilter === 'active' && uStatus !== 'active') return false;
      if (statusFilter === 'suspended' && uStatus !== 'suspended') return false;
    }

    if (cohortFilter !== 'all') {
      const isK12 = u.grade_level?.toLowerCase().startsWith('k12') || u.user_type === 'k12';
      if (cohortFilter === 'k12' && !isK12) return false;
      if (cohortFilter === 'college' && isK12) return false;
    }

    return true;
  });

  const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-12 font-sans space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#0e100f] dark:text-[#E1DCC9] tracking-tight mb-2">
            User Directory
          </h1>
          <p className="text-sm text-[#7c7c6f] dark:text-[#7c7c6f] max-w-xl">
            Audit register status, update operational roles, suspend, or delete user listings.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/20 dark:border-[#412D15] hover:bg-neutral-200 dark:hover:bg-neutral-750 text-[#0e100f] dark:text-[#E1DCC9] rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          <Download size={16} /> Export User Registry
        </button>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7c6f] dark:text-[#7c7c6f]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="w-full bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/20 dark:border-[#412D15] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#0e100f] dark:text-[#E1DCC9] outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/80 transition-all"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/20 dark:border-[#412D15] rounded-xl py-2.5 px-3 text-sm text-[#0e100f] dark:text-[#E1DCC9] outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/80 transition-all"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        <div>
          <select
            value={cohortFilter}
            onChange={(e) => {
              setCohortFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/20 dark:border-[#412D15] rounded-xl py-2.5 px-3 text-sm text-[#0e100f] dark:text-[#E1DCC9] outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/80 transition-all"
          >
            <option value="all">All Education Cohorts</option>
            <option value="k12">School / K-12</option>
            <option value="college">College / University</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/20 dark:border-[#412D15] rounded-xl py-2.5 px-3 text-sm text-[#0e100f] dark:text-[#E1DCC9] outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/80 transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      {loading ? (
        <div className="bg-[#FFFCE1] dark:bg-[#412D15] rounded-2xl border border-[#E1DCC9]/20 dark:border-[#412D15] p-16 text-center">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#7c7c6f]">Querying platform database...</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-[#FFFCE1] dark:bg-[#412D15] rounded-2xl border border-[#E1DCC9]/60 dark:border-[#412D15] overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#E1DCC9]/20 dark:border-[#412D15] bg-[#FFFCE1]/50 dark:bg-[#412D15]/50 text-[#7c7c6f] dark:text-[#7c7c6f] text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">User Identity</th>
                  <th className="p-4">Authorization Role</th>
                  <th className="p-4">Education Cohort</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-center">Gamification XP</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-[#7c7c6f]">
                      No matching user accounts registered.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => {
                    const isSuspended = u.status === 'suspended';
                    const isSelf = u.id === currentUser?.id;
                    const isK12 = u.grade_level?.toLowerCase().startsWith('k12') || u.user_type === 'k12';

                    return (
                      <tr key={u.id} className="hover:bg-[#FFFCE1]/50 dark:hover:bg-[#412D15]/10 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'Scholar')}`}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-[#E1DCC9]/20 dark:border-[#412D15] bg-[#FFFCE1]"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-[#0e100f] dark:text-[#E1DCC9] flex items-center gap-1.5 truncate">
                                {u.name || 'Anonymous Learner'}
                                {isSelf && (
                                  <span className="text-[9px] bg-brand-primary/10 text-brand-primary px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                                    You
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-[#7c7c6f] dark:text-[#7c7c6f] truncate">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <select
                            value={u.role || 'student'}
                            disabled={isSelf}
                            onChange={(e) => handleUserRoleChange(u.id, e.target.value as any)}
                            className="bg-[#FFFCE1] dark:bg-neutral-850 border border-[#E1DCC9]/20 dark:border-neutral-850 text-xs rounded-lg px-2.5 py-1.5 outline-none font-medium text-neutral-850 dark:text-[#E1DCC9] focus:border-brand-primary disabled:opacity-50"
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            isK12 
                              ? 'bg-[#00bae2] text-[#00bae2] dark:bg-[#00bae2]/10 dark:text-[#00bae2]' 
                              : 'bg-[#9d95ff] text-[#9d95ff] dark:bg-[#9d95ff]/10 dark:text-[#9d95ff]'
                          }`}>
                            {isK12 ? 'K-12 School' : 'University'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                            isSuspended
                              ? 'bg-red-500 text-red-500 border-red-500 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20'
                              : 'bg-[#00bae2] text-[#00bae2] border-[#00bae2] dark:bg-[#00bae2]/10 dark:text-[#00bae2] dark:border-[#00bae2]/20'
                          }`}>
                            {isSuspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-[#7c7c6f] dark:text-[#7c7c6f]">
                          <div className="flex items-center justify-center gap-1">
                            <Award size={12} className="text-amber-500" />
                            <span>{u.xp || 0}</span>
                          </div>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUserStatusToggle(u.id, u.status || 'active')}
                              disabled={isSelf}
                              className={`p-1.5 rounded-lg border hover:scale-105 transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
                                isSuspended
                                  ? 'bg-[#00bae2]/10 border-[#00bae2]/20 text-[#00bae2] dark:text-[#00bae2] hover:bg-[#00bae2]/20'
                                  : 'bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-500 hover:bg-red-500/20'
                              }`}
                              title={isSuspended ? 'Activate User' : 'Suspend User'}
                            >
                              {isSuspended ? <Unlock size={14} /> : <Lock size={14} />}
                            </button>
                            <button
                              onClick={() => handleUserDelete(u.id)}
                              disabled={isSelf}
                              className="p-1.5 rounded-lg bg-neutral-150 dark:bg-[#412D15] border border-[#E1DCC9]/20 dark:border-[#412D15] text-[#7c7c6f] hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 hover:scale-105 transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                              title="Delete User"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-[#E1DCC9]/20 dark:border-[#412D15] text-xs text-[#7c7c6f] font-semibold bg-[#FFFCE1]/30 dark:bg-[#412D15]/25">
              <span>
                Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} records
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3.5 py-2 rounded-lg bg-[#FFFCE1] dark:bg-neutral-850 hover:bg-neutral-200 dark:hover:bg-[#412D15] text-[#0e100f] dark:text-neutral-200 transition-all font-semibold disabled:opacity-30 disabled:cursor-not-allowed border border-transparent dark:border-[#412D15]/60"
                >
                  Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3.5 py-2 rounded-lg bg-[#FFFCE1] dark:bg-neutral-850 hover:bg-neutral-200 dark:hover:bg-[#412D15] text-[#0e100f] dark:text-neutral-200 transition-all font-semibold disabled:opacity-30 disabled:cursor-not-allowed border border-transparent dark:border-[#412D15]/60"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
