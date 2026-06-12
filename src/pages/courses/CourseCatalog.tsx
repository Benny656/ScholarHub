import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Star, Users, Clock, BookOpen, Plus } from 'lucide-react';
import { coursesService } from '../../services/courses.service';
import { useAuth } from '../../context/AuthContext';
import { Badge, ProgressBar, PageHeader, Button, Select } from '../../components/ui/index';
import type { Course } from '../../types';
import toast from 'react-hot-toast';

const LEVEL_COLORS = { Beginner: 'emerald', Intermediate: 'blue', Advanced: 'red' } as const;

// Animated Gradient SVGs per category using SVG stop-color animations
function GeometricThumbnail({ category }: { category: string }) {
  const norm = category.toLowerCase();
  
  if (norm.includes('web')) {
    return (
      <svg className="w-full h-full object-cover" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="url(#webBg)" />
        <g opacity="0.3" stroke="#ffffff" strokeWidth="0.5">
          <circle cx="50" cy="50" r="40" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="30" />
          <path d="M10 50 H90 M50 10 V90" />
        </g>
        <path d="M25 40 L40 50 L25 60" stroke="#d8bcea" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M75 40 L60 50 L75 60" stroke="#d8bcea" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M55 35 L45 65" stroke="#f3b6cd" strokeWidth="4" strokeLinecap="round" />
        <defs>
          <linearGradient id="webBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#151315">
              <animate attributeName="stop-color" values="#151315;#3c284c;#1e152a;#151315" dur="10s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#3c284c">
              <animate attributeName="stop-color" values="#3c284c;#1e152a;#3c284c;#3c284c" dur="10s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#1e152a">
              <animate attributeName="stop-color" values="#1e152a;#151315;#3c284c;#1e152a" dur="10s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
      </svg>
    );
  } else if (norm.includes('ai') || norm.includes('machine') || norm.includes('ml')) {
    return (
      <svg className="w-full h-full object-cover" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="url(#aiBg)" />
        <g opacity="0.25" stroke="#ffffff" strokeWidth="0.5">
          <line x1="20" y1="20" x2="80" y2="80" />
          <line x1="80" y1="20" x2="20" y2="80" />
          <line x1="50" y1="10" x2="50" y2="90" />
        </g>
        <circle cx="50" cy="50" r="8" fill="#d8bcea" className="animate-pulse" />
        <circle cx="25" cy="30" r="4" fill="#3B82F6" />
        <circle cx="75" cy="30" r="4" fill="#3B82F6" />
        <circle cx="25" cy="70" r="4" fill="#4edea3" />
        <circle cx="75" cy="70" r="4" fill="#4edea3" />
        <line x1="25" y1="30" x2="50" y2="50" stroke="#3B82F6" strokeWidth="2" />
        <line x1="75" y1="30" x2="50" y2="50" stroke="#3B82F6" strokeWidth="2" />
        <line x1="25" y1="70" x2="50" y2="50" stroke="#4edea3" strokeWidth="2" />
        <line x1="75" y1="70" x2="50" y2="50" stroke="#4edea3" strokeWidth="2" />
        <defs>
          <linearGradient id="aiBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#151315">
              <animate attributeName="stop-color" values="#151315;#1c233d;#0d1425;#151315" dur="12s" repeatCount="indefinite" />
            </stop>
            <stop offset="60%" stopColor="#1c233d">
              <animate attributeName="stop-color" values="#1c233d;#0d1425;#1c233d;#1c233d" dur="12s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#0d1425">
              <animate attributeName="stop-color" values="#0d1425;#151315;#1c233d;#0d1425" dur="12s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
      </svg>
    );
  } else if (norm.includes('design') || norm.includes('ui') || norm.includes('ux')) {
    return (
      <svg className="w-full h-full object-cover" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="url(#designBg)" />
        <circle cx="45" cy="45" r="20" stroke="#d8bcea" strokeWidth="3" opacity="0.7" />
        <circle cx="58" cy="55" r="20" stroke="#f3b6cd" strokeWidth="3" opacity="0.7" />
        <rect x="25" y="25" width="50" height="50" stroke="#ffffff" strokeWidth="0.5" opacity="0.2" />
        <defs>
          <linearGradient id="designBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#151315">
              <animate attributeName="stop-color" values="#151315;#4c2335;#221118;#151315" dur="8s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#4c2335">
              <animate attributeName="stop-color" values="#4c2335;#221118;#4c2335;#4c2335" dur="8s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#221118">
              <animate attributeName="stop-color" values="#221118;#151315;#4c2335;#221118" dur="8s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
      </svg>
    );
  } else {
    return (
      <svg className="w-full h-full object-cover" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="url(#defaultBg)" />
        <g opacity="0.2" stroke="#ffffff" strokeWidth="0.5">
          <circle cx="50" cy="50" r="35" />
          <rect x="20" y="20" width="60" height="60" rx="8" />
        </g>
        <polygon points="50,25 75,65 25,65" stroke="#d8bcea" strokeWidth="3" fill="none" strokeLinejoin="round" />
        <defs>
          <linearGradient id="defaultBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#151315">
              <animate attributeName="stop-color" values="#151315;#252129;#151315" dur="15s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#252129">
              <animate attributeName="stop-color" values="#252129;#151315;#252129" dur="15s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#151315">
              <animate attributeName="stop-color" values="#151315;#252129;#151315" dur="15s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
      </svg>
    );
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }
};

// Immersive Glassmorphism Card with 3D Mouse Tilt & Border cursor glow tracking
function CourseCard({ course, index, enrolled, onEnroll, progress = 0 }: {
  course: Course; index: number; enrolled?: boolean; onEnroll?: (id: string) => void; progress?: number;
}) {
  const { user } = useAuth();
  const userType = user?.user_type;
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const normalizedX = (x / rect.width) - 0.5;
    const normalizedY = (y / rect.height) - 0.5;
    
    setCoords({ x: normalizedX, y: normalizedY });
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setCoords({ x: 0, y: 0 });
      }}
      variants={cardVariants}
      className="relative rounded-2xl border overflow-hidden flex flex-col h-full cursor-pointer"
      style={{
        background: 'rgba(21, 19, 21, 0.55)',
        backdropFilter: 'blur(12px)',
        borderColor: hovered ? 'rgba(216, 188, 234, 0.35)' : 'rgba(255, 255, 255, 0.08)',
        boxShadow: hovered ? '0 12px 35px -10px rgba(216, 188, 234, 0.22)' : '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
        transform: hovered 
          ? `perspective(1000px) rotateY(${coords.x * 12}deg) rotateX(${coords.y * -12}deg) scale3d(1.02, 1.02, 1.02)` 
          : 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)',
        transition: hovered ? 'none' : 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
      }}
    >
      {/* Dynamic Cursor Glowing Overlay */}
      {hovered && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition duration-300"
          style={{
            background: `radial-gradient(180px circle at var(--mouse-x) var(--mouse-y), rgba(216, 188, 234, 0.18), transparent 85%)`,
            border: '1px solid rgba(216, 188, 234, 0.35)',
          }}
        />
      )}

      {/* Thumbnail with Geometric SVGs and category gradient */}
      <div className="h-40 relative flex-shrink-0 overflow-hidden">
        <GeometricThumbnail category={course.category} />
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
      <div className="p-5 flex flex-col flex-1 relative z-10">
        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1.5">{course.category}</span>
        <h3 className="text-base font-bold text-white leading-tight mb-2 group-hover:text-purple-300 transition-colors" style={{ fontFamily: 'Playfair Display, serif' }}>
          {course.title}
        </h3>
        <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {course.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={11} fill={s <= Math.floor(course.rating) ? '#F59E0B' : 'none'} className="text-amber-400" />
          ))}
          <span className="text-xs text-amber-400 ml-1 font-semibold">{course.rating.toFixed(1)}</span>
        </div>

        {/* Metas */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 border-t border-white/5 pt-3">
          <span className="flex items-center gap-1"><Users size={11} /> {course.enrolled.toLocaleString()}</span>
          <span className="flex items-center gap-1"><BookOpen size={11} /> {course.lessons} lessons</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {course.duration}</span>
        </div>

        {/* Progress Bar for Enrolled Students */}
        {enrolled && (
          <div className="mb-4">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Enrollment Progress</span>
              <span>{progress}%</span>
            </div>
            <ProgressBar value={progress} color="purple" size="sm" />
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
          <div>
            <p className="text-lg font-bold text-white">{userType === 'school' ? 'Free Forever' : `₹${course.price}`}</p>
            <p className="text-[10px] text-slate-500">{course.instructor}</p>
          </div>
          
          {enrolled ? (
            <Link to={`/learn/${course.id}/l1`}>
              <button className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-lg hover:scale-105 active:scale-95 duration-200" style={{ background: 'linear-gradient(135deg, #d8bcea, #8B5CF6)' }}>
                Continue Learning
              </button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link to={`/courses/${course.id}`}>
                <button className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 border border-white/10 hover:bg-white/8 hover:text-white transition-all">
                  Details
                </button>
              </Link>
              {onEnroll && (
                <button onClick={() => onEnroll(course.id)} className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105 duration-200" style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
                  Enroll
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Premium Course Card Skeleton matching revamped design
function CourseSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full bg-white/3 animate-pulse">
      <div className="h-40 bg-white/5 w-full" />
      <div className="p-5 flex-1 space-y-4">
        <div className="h-3 w-1/4 bg-white/5 rounded-full" />
        <div className="h-5 w-3/4 bg-white/5 rounded-lg" />
        <div className="h-3 w-full bg-white/5 rounded-full" />
        <div className="h-3 w-5/6 bg-white/5 rounded-full" />
        <div className="h-1.5 w-full bg-white/5 rounded-full mt-4" />
        <div className="flex justify-between items-center mt-6 pt-3 border-t border-white/5">
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-1/3 bg-white/5 rounded-full" />
            <div className="h-3 w-1/4 bg-white/5 rounded-full" />
          </div>
          <div className="h-8 w-24 bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function CourseCatalog() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search parameters and debounce state
  const [searchVal, setSearchVal] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);

  const categories = coursesService.getCategories();

  // Search Debouncer logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchVal);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchVal]);

  // Load courses and enrollments on filters/search update
  useEffect(() => {
    setLoading(true);
    const filters = {
      category: category !== 'All' ? category : undefined,
      level: level !== 'All' ? level : undefined,
      search: debouncedSearch || undefined,
    };
    
    Promise.all([
      coursesService.getCourses(filters),
      user ? coursesService.getEnrolledCourses(user.id) : Promise.resolve([]),
    ]).then(([data, enrolled]) => {
      setCourses(data);
      setEnrolledCourses(enrolled);
      setLoading(false);
    });
  }, [debouncedSearch, category, level, user]);

  const sorted = [...courses].sort((a, b) => {
    if (sortBy === 'popular') return b.enrolled - a.enrolled;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0;
  });

  const handleEnroll = (courseId: string) => {
    if (!user) {
      toast.error('Please login to enroll in courses!');
      return;
    }
    coursesService.enrollCourse(courseId, user.id).then(() => {
      toast.success('Successfully enrolled in course! 🎉', { icon: '🎓' });
      // Reload enrolled courses list
      coursesService.getEnrolledCourses(user.id).then(setEnrolledCourses);
    }).catch(err => {
      toast.error('Enrollment failed, please try again.');
      console.error(err);
    });
  };

  const getProgress = (courseId: string) => {
    const found = enrolledCourses.find(e => e.course.id === courseId);
    return found ? found.enrollment.progress : 0;
  };

  const isEnrolled = (courseId: string) => {
    return enrolledCourses.some(e => e.course.id === courseId);
  };

  return (
    <div className="space-y-6">
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
        {/* Filters and debounced live search */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex-1 min-w-[280px] max-w-md relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search courses, titles, categories..."
              className="pl-10 pr-4 py-2.5 rounded-xl border border-white/10 text-white text-sm outline-none focus:border-purple-500/60 placeholder-slate-500 w-full transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Sliding Framer Motion Category Indicator */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl border border-white/5 bg-white/3">
              {categories.slice(0, 5).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
                    category === cat ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <span className="relative z-10">{cat}</span>
                  {category === cat && (
                    <motion.div
                      layoutId="activeCatalogTab"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'linear-gradient(135deg, var(--color-primary), #8B5CF6)' }}
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}
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

        {/* Catalog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => <CourseSkeleton key={i} />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-24 glass rounded-3xl border border-white/5 max-w-lg mx-auto">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>No courses found</h3>
            <p className="text-sm text-slate-400" style={{ fontFamily: 'Montserrat, sans-serif' }}>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <motion.div 
            variants={{
              show: {
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {sorted.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                index={i}
                enrolled={isEnrolled(course.id)}
                progress={getProgress(course.id)}
                onEnroll={user?.role === 'student' ? handleEnroll : undefined}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
