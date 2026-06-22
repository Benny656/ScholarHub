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
          <h1 className="text-2xl md:text-3xl font-semibold text-[#0e100f] dark:text-[#E1DCC9] tracking-tight mb-2">
            Course Catalogue
          </h1>
          <p className="text-sm text-[#7c7c6f] dark:text-[#7c7c6f] max-w-xl">
            Audit course listings, manage curriculum publications, highlight featured courses, or archive deprecated content.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7c6f] dark:text-[#7c7c6f]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title or category..."
            className="w-full bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/20 dark:border-[#412D15] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#0e100f] dark:text-[#E1DCC9] outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/80 transition-all"
          />
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
            className="w-full bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/20 dark:border-[#412D15] rounded-xl py-2.5 px-3 text-sm text-[#0e100f] dark:text-[#E1DCC9] outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/80 transition-all"
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
        <div className="bg-[#FFFCE1] dark:bg-[#412D15] rounded-2xl border border-[#E1DCC9]/20 dark:border-[#412D15] p-16 text-center">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#7c7c6f]">Querying platform database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Main Course Table (Takes 2 cols) */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 bg-[#FFFCE1] dark:bg-[#412D15] rounded-2xl border border-[#E1DCC9]/60 dark:border-[#412D15] overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#E1DCC9]/20 dark:border-[#412D15] bg-[#FFFCE1]/50 dark:bg-[#412D15]/50 text-[#7c7c6f] dark:text-[#7c7c6f] text-xs font-bold uppercase tracking-wider">
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
                      <td colSpan={5} className="p-12 text-center text-[#7c7c6f]">
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
                          className={`hover:bg-[#FFFCE1]/50 dark:hover:bg-[#412D15]/10 cursor-pointer transition-colors ${
                            selectedCourse?.id === c.id ? 'bg-[#FFFCE1] dark:bg-[#412D15]/15' : ''
                          }`}
                        >
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-9 rounded-lg bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/20 dark:border-[#412D15] overflow-hidden flex-shrink-0">
                                {c.thumbnail_url ? (
                                  <img src={c.thumbnail_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-[#9d95ff]/20" />
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-[#0e100f] dark:text-[#E1DCC9] truncate max-w-[200px]">
                                  {c.title || 'Untitled Course'}
                                </span>
                                <span className="text-[10px] text-[#7c7c6f] dark:text-[#7c7c6f] uppercase tracking-widest font-bold mt-0.5">
                                  {c.category || 'General'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-xs text-[#0e100f] dark:text-[#E1DCC9] truncate max-w-[140px]">
                                {c.users?.name || 'Instructor'}
                              </span>
                              <span className="text-[10px] text-[#7c7c6f] dark:text-[#7c7c6f] truncate max-w-[140px]">
                                {c.users?.email}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold text-xs text-[#0e100f] dark:text-neutral-200">
                            ₹{c.price || 0}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1.5 items-start">
                              <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded ${
                                isPublished
                                  ? 'bg-[#00bae2] text-[#00bae2] border border-[#00bae2] dark:bg-[#00bae2]/10 dark:text-[#00bae2] dark:border-[#00bae2]/20'
                                  : 'bg-red-500 text-red-500 border border-red-500 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20'
                              }`}>
                                {isPublished ? 'Published' : 'Draft'}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {isFeatured && (
                                  <span className="text-[8px] uppercase font-bold px-1.5 py-0.2 bg-amber-500 text-amber-500 rounded dark:bg-amber-500/10 dark:text-amber-500">
                                    Featured
                                  </span>
                                )}
                                {isArchived && (
                                  <span className="text-[8px] uppercase font-bold px-1.5 py-0.2 bg-neutral-200 text-[#7c7c6f] rounded dark:bg-[#412D15] dark:text-[#7c7c6f]">
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
                                    : 'bg-[#FFFCE1] dark:bg-[#412D15] border-[#E1DCC9]/20 dark:border-neutral-850 hover:bg-neutral-200 text-[#7c7c6f] hover:text-amber-500'
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
                                    : 'bg-[#00bae2]/10 border-[#00bae2]/20 text-[#00bae2] hover:bg-[#00bae2]/20'
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
                                    ? 'bg-neutral-200 border-neutral-300 text-[#7c7c6f] dark:bg-[#412D15] dark:border-[#412D15] dark:text-[#7c7c6f]'
                                    : 'bg-[#FFFCE1] dark:bg-[#412D15] border-[#E1DCC9]/20 dark:border-neutral-850 hover:text-[#7c7c6f] hover:bg-neutral-200'
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
              <div className="flex justify-between items-center px-6 py-4 border-t border-[#E1DCC9]/20 dark:border-[#412D15] text-xs text-[#7c7c6f] font-semibold bg-[#FFFCE1]/30 dark:bg-[#412D15]/25">
                <span>
                  Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} listings
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

          {/* Details Sidebar Panel (Takes 1 col) */}
          <div className="lg:col-span-1 space-y-6">
            <AnimatePresence mode="wait">
              {selectedCourse ? (
                <motion.div
                  key={selectedCourse.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/20 dark:border-[#412D15] rounded-2xl p-6 shadow-sm space-y-5"
                >
                  <div className="aspect-video w-full rounded-xl bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/20 dark:border-neutral-750 overflow-hidden relative">
                    {selectedCourse.thumbnail_url ? (
                      <img src={selectedCourse.thumbnail_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-[#9d95ff]/20 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-brand-primary/40" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg text-[#0e100f] dark:text-[#E1DCC9] leading-snug">
                      {selectedCourse.title || 'Untitled Course'}
                    </h3>
                    <p className="text-xs text-[#7c7c6f] dark:text-[#7c7c6f] capitalize mt-1">
                      Category: {selectedCourse.category || 'General'}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-[#E1DCC9]/20 dark:border-[#412D15]">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#7c7c6f] flex items-center gap-1.5"><User size={13} /> Instructor:</span>
                      <span className="text-xs font-semibold text-[#0e100f] dark:text-neutral-200">{selectedCourse.users?.name || 'Teacher'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#7c7c6f] flex items-center gap-1.5"><DollarSign size={13} /> Price Tier:</span>
                      <span className="text-xs font-bold text-[#0e100f] dark:text-neutral-200">₹{selectedCourse.price || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#7c7c6f] flex items-center gap-1.5"><Layers size={13} /> Difficulty:</span>
                      <span className="text-xs font-semibold text-neutral-850 dark:text-neutral-200 capitalize">{selectedCourse.level || 'Intermediate'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#7c7c6f] flex items-center gap-1.5"><Award size={13} /> XP Reward:</span>
                      <span className="text-xs font-mono font-bold text-neutral-850 dark:text-neutral-200">{selectedCourse.xp_reward || 100} XP</span>
                    </div>
                  </div>

                  {selectedCourse.description && (
                    <div className="pt-3 border-t border-[#E1DCC9]/20 dark:border-[#412D15]">
                      <h4 className="text-[10px] text-[#7c7c6f] uppercase font-bold tracking-wider mb-1">Course Description</h4>
                      <p className="text-xs text-[#7c7c6f] dark:text-[#7c7c6f] leading-relaxed max-h-24 overflow-y-auto pr-1">
                        {selectedCourse.description}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#E1DCC9]/20 dark:border-[#412D15] flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePublishToggle(selectedCourse.id, selectedCourse.is_published)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                          selectedCourse.is_published
                            ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                            : 'bg-[#00bae2]/10 border-[#00bae2]/20 text-[#00bae2] hover:bg-[#00bae2]/20'
                        }`}
                      >
                        {selectedCourse.is_published ? 'Unpublish Course' : 'Approve & Publish'}
                      </button>
                      
                      <button
                        onClick={() => handleFeatureToggle(selectedCourse.id, selectedCourse.tags || [])}
                        className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          selectedCourse.tags?.includes('featured')
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20'
                            : 'bg-[#FFFCE1] dark:bg-[#412D15] border-[#E1DCC9]/20 dark:border-[#412D15] hover:text-amber-500'
                        }`}
                      >
                        <Star size={14} className={selectedCourse.tags?.includes('featured') ? 'fill-amber-500 text-amber-500' : ''} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteCourse(selectedCourse.id)}
                      className="w-full py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-[#E1DCC9] text-red-500 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <Trash2 size={13} /> Delete Course Listing
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-[#FFFCE1] dark:bg-[#412D15]/40 border border-[#E1DCC9]/50 dark:border-[#412D15]/80 rounded-2xl p-8 text-center text-[#7c7c6f] dark:text-[#7c7c6f]">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 text-[#7c7c6f] dark:text-[#7c7c6f]" />
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
