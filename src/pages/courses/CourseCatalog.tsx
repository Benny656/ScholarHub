import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, Users, Clock, BookOpen, ChevronRight, Plus, SlidersHorizontal } from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { coursesService, MOCK_COURSES } from '../../services/courses.service';
import { useAuth } from '../../context/AuthContext';
import { GlassCard, Badge, ProgressBar, SkeletonCard, PageHeader, Button, SearchInput, Select } from '../../components/ui/index';
import type { Course } from '../../types';
import toast from 'react-hot-toast';

const LEVEL_COLORS = { Beginner: 'emerald', Intermediate: 'blue', Advanced: 'red' } as const;
const GRADIENT_PAIRS = [
  ['#8B5CF6', '#3B82F6'], ['#3B82F6', '#4edea3'], ['#4edea3', '#8B5CF6'],
  ['#F59E0B', '#EF4444'], ['#EF4444', '#8B5CF6'], ['#6366F1', '#3B82F6'],
];

function CourseCard({ course, index, enrolled, onEnroll }: {
  course: Course; index: number; enrolled?: boolean; onEnroll?: (id: string) => void;
}) {
  const grad = GRADIENT_PAIRS[index % GRADIENT_PAIRS.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <div className="rounded-2xl border border-white/8 overflow-hidden hover:border-purple-500/30 transition-all duration-300 flex flex-col h-full"
        style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}>
        {/* Thumbnail */}
        <div className="h-40 relative flex-shrink-0 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${grad[0]}22, ${grad[1]}33)` }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white"
            style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`, boxShadow: `0 8px 24px ${grad[0]}44` }}>
            {course.title[0]}
          </div>
          <div className="absolute top-3 left-3">
            <Badge variant={LEVEL_COLORS[course.level]}>{course.level}</Badge>
          </div>
          {enrolled && (
            <div className="absolute top-3 right-3">
              <Badge variant="emerald">Enrolled</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start gap-2 mb-2">
            <h3 className="text-sm font-bold text-white leading-tight flex-1 group-hover:text-purple-300 transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
              {course.title}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            {course.description}
          </p>

          <div className="flex items-center gap-1 mb-3">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={11} fill={s <= Math.floor(course.rating) ? '#F59E0B' : 'none'} className="text-amber-400" />
            ))}
            <span className="text-xs text-amber-400 ml-1 font-medium">{course.rating}</span>
            <span className="text-xs text-slate-600 ml-1">({course.reviews.toLocaleString()})</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1"><Users size={11} /> {course.enrolled.toLocaleString()}</span>
            <span className="flex items-center gap-1"><BookOpen size={11} /> {course.lessons} lessons</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {course.duration}</span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5 mb-4">
            {course.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.12)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.2)' }}>
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div>
              <p className="text-lg font-bold text-white">${course.price}</p>
              <p className="text-xs text-slate-500">{course.instructor}</p>
            </div>
            {enrolled ? (
              <Link to={`/learn/${course.id}/l1`}>
                <button className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white transition-all" style={{ background: 'linear-gradient(135deg, #4edea3, #3B82F6)' }}>
                  Continue →
                </button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to={`/courses/${course.id}`}>
                  <button className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 border border-white/15 hover:bg-white/8 transition-all">
                    Details
                  </button>
                </Link>
                {onEnroll && (
                  <button onClick={() => onEnroll(course.id)} className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all" style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
                    Enroll
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CourseCatalog() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [enrolledIds] = useState<string[]>(user?.enrolledCourses || ['c1', 'c2', 'c3']);

  const categories = coursesService.getCategories();

  useEffect(() => {
    setLoading(true);
    coursesService.getCatalog({ category: category !== 'All' ? category : undefined, level: level !== 'All' ? level : undefined, search })
      .then(data => { setCourses(data); setLoading(false); });
  }, [search, category, level]);

  const sorted = [...courses].sort((a, b) => {
    if (sortBy === 'popular') return b.enrolled - a.enrolled;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0;
  });

  const handleEnroll = (courseId: string) => {
    toast.success('Enrolled successfully! 🎉', { icon: '🎓' });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Course Catalog"
        subtitle={`${courses.length} courses available`}
        breadcrumb={[{ label: 'Home' }, { label: 'Courses' }]}
        action={user?.role !== 'student' ? (
          <Link to="/courses/create">
            <Button variant="primary" icon={<Plus size={16} />}>Create Course</Button>
          </Link>
        ) : undefined}
      />

      <div className="p-6">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex-1 min-w-[200px] max-w-md">
            <SearchInput value={search} onChange={setSearch} placeholder="Search courses, topics, instructors..." />
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5">
              {categories.slice(0, 6).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${category === cat ? 'text-white' : 'text-slate-400 border border-white/10 hover:text-white hover:border-white/20'}`}
                  style={category === cat ? { background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', fontFamily: 'Inter, sans-serif' } : { fontFamily: 'Inter, sans-serif' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Select
              options={[
                { value: 'All', label: 'All Levels' },
                { value: 'Beginner', label: 'Beginner' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Advanced', label: 'Advanced' },
              ]}
              value={level}
              onChange={e => setLevel(e.target.value)}
            />
            <Select
              options={[
                { value: 'popular', label: 'Most Popular' },
                { value: 'rating', label: 'Highest Rated' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' },
              ]}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-white mb-2">No courses found</h3>
            <p className="text-sm text-slate-400">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sorted.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                index={i}
                enrolled={enrolledIds.includes(course.id)}
                onEnroll={user?.role === 'student' ? handleEnroll : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
