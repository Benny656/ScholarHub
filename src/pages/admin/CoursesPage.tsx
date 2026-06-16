import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Star, CheckCircle, XCircle, Archive, BookOpen, User, DollarSign, Award, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getCoursesList, updateCourseStatus, featureCourse, archiveCourse, deleteCourse } from '../../services/admin.service';

export function CoursesPage() {
  const { user: currentUser } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filtering & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all'); // Featured, Archived, Normal
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Course details modal
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getCoursesList();
      setCourses(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load course catalogue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handlePublishToggle = async (courseId: string, currentPublished: boolean) => {
    const nextPublished = !currentPublished;
    const action = nextPublished ? 'approve & publish' : 'reject & unpublish';

    if (!confirm(`Are you sure you want to ${action} this course?`)) {
      return;
    }

    try {
      await updateCourseStatus(currentUser!.id, courseId, nextPublished);
      toast.success(`Course successfully ${nextPublished ? 'published' : 'unpublished'}.`);
      loadCourses();
      if (selectedCourse?.id === courseId) {
        setSelectedCourse((prev: any) => prev ? { ...prev, is_published: nextPublished } : null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update course publication status.');
    }
  };

  const handleFeatureToggle = async (courseId: string, tags: string[]) => {
    const isFeatured = tags?.includes('featured') || false;
    const nextFeatured = !isFeatured;

    try {
      await featureCourse(currentUser!.id, courseId, nextFeatured);
      toast.success(nextFeatured ? 'Course highlighted as Featured!' : 'Featured badge removed.');
      loadCourses();
      if (selectedCourse?.id === courseId) {
        setSelectedCourse((prev: any) => {
          if (!prev) return null;
          const updatedTags = nextFeatured 
            ? [...(prev.tags || []), 'featured']
            : (prev.tags || []).filter((t: string) => t !== 'featured');
          return { ...prev, tags: updatedTags };
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to feature course.');
    }
  };

  const handleArchiveToggle = async (courseId: string, tags: string[]) => {
    const isArchived = tags?.includes('archived') || false;
    const nextArchived = !isArchived;
    const action = nextArchived ? 'archive' : 'unarchive';

    if (nextArchived && !confirm('Archiving this course will also automatically unpublish it from the catalog. Proceed?')) {
      return;
    }

    try {
      await archiveCourse(currentUser!.id, courseId, nextArchived);
      toast.success(`Course successfully ${nextArchived ? 'archived' : 'restored'}.`);
      loadCourses();
      if (selectedCourse?.id === courseId) {
        setSelectedCourse((prev: any) => {
          if (!prev) return null;
          let updatedTags = nextArchived 
            ? [...(prev.tags || []), 'archived']
            : (prev.tags || []).filter((t: string) => t !== 'archived');
          return { ...prev, tags: updatedTags, is_published: nextArchived ? false : prev.is_published };
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${action} course.`);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('CRITICAL WARNING: This will permanently delete the course and remove all student enrollment records. This action cannot be reverted. Proceed?')) {
      return;
    }

    try {
      await deleteCourse(currentUser!.id, courseId);
      toast.success('Course permanently deleted.');
      setSelectedCourse(null);
      loadCourses();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete course.');
    }
  };

  // Filters logic
  const filteredCourses = courses.filter((c: any) => {
    if (search && !c.title?.toLowerCase().includes(search.toLowerCase()) && !c.category?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'published' && !c.is_published) return false;
      if (statusFilter === 'draft' && c.is_published) return false;
    }

    if (tagFilter !== 'all') {
      const isFeatured = c.tags?.includes('featured') || false;
      const isArchived = c.tags?.includes('archived') || false;
      if (tagFilter === 'featured' && !isFeatured) return false;
      if (tagFilter === 'archived' && !isArchived) return false;
      if (tagFilter === 'normal' && (isFeatured || isArchived)) return false;
    }

    return true;
  });

  const paginatedCourses = filteredCourses.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight mb-2">
            Course Catalogue
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
            Audit course listings, manage curriculum publications, highlight featured courses, or archive deprecated content.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title or category..."
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/80 transition-all"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/80 transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="published">Approved & Published</option>
            <option value="draft">Draft / Rejected</option>
          </select>
        </div>

        <div>
          <select
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/80 transition-all"
          >
            <option value="all">All Highlights & Labels</option>
            <option value="featured">Featured Courses</option>
            <option value="archived">Archived Courses</option>
            <option value="normal">Standard Listings Only</option>
          </select>
        </div>
      </div>

      {/* Course List Card */}
      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-16 text-center">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-neutral-500">Querying platform database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Main Course Table (Takes 2 cols) */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4 pl-6">Course Listing</th>
                    <th className="p-4">Instructor</th>
                    <th className="p-4">Access Price</th>
                    <th className="p-4">Status & Tags</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {paginatedCourses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-neutral-500">
                        No matching course records registered.
                      </td>
                    </tr>
                  ) : (
                    paginatedCourses.map((c) => {
                      const isFeatured = c.tags?.includes('featured') || false;
                      const isArchived = c.tags?.includes('archived') || false;
                      const isPublished = c.is_published || false;

                      return (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedCourse(c)}
                          className={`hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 cursor-pointer transition-colors ${
                            selectedCourse?.id === c.id ? 'bg-neutral-50 dark:bg-neutral-800/15' : ''
                          }`}
                        >
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden flex-shrink-0">
                                {c.thumbnail_url ? (
                                  <img src={c.thumbnail_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-indigo-500/20" />
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[200px]">
                                  {c.title || 'Untitled Course'}
                                </span>
                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-bold mt-0.5">
                                  {c.category || 'General'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-xs text-neutral-900 dark:text-neutral-100 truncate max-w-[140px]">
                                {c.users?.name || 'Instructor'}
                              </span>
                              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate max-w-[140px]">
                                {c.users?.email}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold text-xs text-neutral-800 dark:text-neutral-200">
                            ₹{c.price || 0}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1.5 items-start">
                              <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded ${
                                isPublished
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                  : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                              }`}>
                                {isPublished ? 'Published' : 'Draft'}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {isFeatured && (
                                  <span className="text-[8px] uppercase font-bold px-1.5 py-0.2 bg-amber-100 text-amber-700 rounded dark:bg-amber-500/10 dark:text-amber-400">
                                    Featured
                                  </span>
                                )}
                                {isArchived && (
                                  <span className="text-[8px] uppercase font-bold px-1.5 py-0.2 bg-neutral-200 text-neutral-700 rounded dark:bg-neutral-800 dark:text-neutral-400">
                                    Archived
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              {/* Feature button */}
                              <button
                                onClick={() => handleFeatureToggle(c.id, c.tags || [])}
                                className={`p-1.5 rounded-lg border hover:scale-105 transition-all cursor-pointer ${
                                  isFeatured
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20'
                                    : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-850 hover:bg-neutral-200 text-neutral-400 hover:text-amber-400'
                                }`}
                                title={isFeatured ? 'Remove Feature Highlight' : 'Feature Course'}
                              >
                                <Star size={14} className={isFeatured ? "fill-amber-500" : ""} />
                              </button>

                              {/* Publish toggle */}
                              <button
                                onClick={() => handlePublishToggle(c.id, isPublished)}
                                className={`p-1.5 rounded-lg border hover:scale-105 transition-all cursor-pointer ${
                                  isPublished
                                    ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                                }`}
                                title={isPublished ? 'Reject Listing' : 'Approve & Publish'}
                              >
                                {isPublished ? <XCircle size={14} /> : <CheckCircle size={14} />}
                              </button>

                              {/* Archive toggle */}
                              <button
                                onClick={() => handleArchiveToggle(c.id, c.tags || [])}
                                className={`p-1.5 rounded-lg border hover:scale-105 transition-all cursor-pointer ${
                                  isArchived
                                    ? 'bg-neutral-200 border-neutral-300 text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300'
                                    : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-850 hover:text-neutral-600 hover:bg-neutral-200'
                                }`}
                                title={isArchived ? 'Unarchive Listing' : 'Archive Course'}
                              >
                                <Archive size={14} />
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
              <div className="flex justify-between items-center px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 font-semibold bg-neutral-50/30 dark:bg-neutral-900/25">
                <span>
                  Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} listings
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3.5 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-850 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-all font-semibold disabled:opacity-30 disabled:cursor-not-allowed border border-transparent dark:border-neutral-700/60"
                  >
                    Prev
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3.5 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-850 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-all font-semibold disabled:opacity-30 disabled:cursor-not-allowed border border-transparent dark:border-neutral-700/60"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Details Sidebar Panel (Takes 1 col) */}
          <div className="lg:col-span-1 space-y-6">
            <AnimatePresence mode="wait">
              {selectedCourse ? (
                <motion.div
                  key={selectedCourse.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-5"
                >
                  <div className="aspect-video w-full rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750 overflow-hidden relative">
                    {selectedCourse.thumbnail_url ? (
                      <img src={selectedCourse.thumbnail_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-indigo-500/20 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-brand-primary/40" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 leading-snug">
                      {selectedCourse.title || 'Untitled Course'}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize mt-1">
                      Category: {selectedCourse.category || 'General'}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-500 flex items-center gap-1.5"><User size={13} /> Instructor:</span>
                      <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{selectedCourse.users?.name || 'Teacher'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-500 flex items-center gap-1.5"><DollarSign size={13} /> Price Tier:</span>
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">₹{selectedCourse.price || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-500 flex items-center gap-1.5"><Layers size={13} /> Difficulty:</span>
                      <span className="text-xs font-semibold text-neutral-850 dark:text-neutral-200 capitalize">{selectedCourse.level || 'Intermediate'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-500 flex items-center gap-1.5"><Award size={13} /> XP Reward:</span>
                      <span className="text-xs font-mono font-bold text-neutral-850 dark:text-neutral-200">{selectedCourse.xp_reward || 100} XP</span>
                    </div>
                  </div>

                  {selectedCourse.description && (
                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                      <h4 className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-1">Course Description</h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-h-24 overflow-y-auto pr-1">
                        {selectedCourse.description}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePublishToggle(selectedCourse.id, selectedCourse.is_published)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                          selectedCourse.is_published
                            ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                        }`}
                      >
                        {selectedCourse.is_published ? 'Unpublish Course' : 'Approve & Publish'}
                      </button>
                      
                      <button
                        onClick={() => handleFeatureToggle(selectedCourse.id, selectedCourse.tags || [])}
                        className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          selectedCourse.tags?.includes('featured')
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20'
                            : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-800 hover:text-amber-500'
                        }`}
                      >
                        <Star size={14} className={selectedCourse.tags?.includes('featured') ? 'fill-amber-500 text-amber-500' : ''} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteCourse(selectedCourse.id)}
                      className="w-full py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <Trash2 size={13} /> Delete Course Listing
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/80 rounded-2xl p-8 text-center text-neutral-400 dark:text-neutral-500">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
                  <p className="text-xs font-semibold">Select a course from the inventory list to view its complete properties or execute detailed actions.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
