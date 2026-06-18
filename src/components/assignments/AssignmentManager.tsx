import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { assignmentsService } from '../../services/assignments.service';
import { PageHeader, GlassCard, Badge, SkeletonCard, SearchInput } from '../ui/index';
import { ClipboardList, Users, CheckCircle, Clock, BookOpen, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AssignmentManager() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    assignmentsService.getTeacherAssignments(user.id).then(data => {
      setAssignments(data);
      setLoading(false);
    });
  }, [user]);

  const filtered = assignments.filter(a => 
    !search || 
    (a.title || '').toLowerCase().includes(search.toLowerCase()) || 
    (a.courses?.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Assignment Manager" 
        subtitle="Manage and grade your course assignments" 
        breadcrumb={[{ label: 'Assignments' }]} 
      />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2">
            <Badge variant="purple">Total Assignments: {assignments.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Search assignments..." />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">
            <ClipboardList size={48} className="mx-auto mb-3 opacity-30" />
            <p>No assignments found. Go to a Course to create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a, i) => {
              const daysLeft = Math.ceil((new Date(a.due_date).getTime() - Date.now()) / 86400000);
              const courseTitle = Array.isArray(a.courses) ? a.courses[0]?.title : (a.courses as any)?.title;
              return (
                <Link to={`/courses/${a.course_id}`} key={a.id} className="block transition-all hover:scale-[1.02]">
                  <GlassCard className="h-full flex flex-col justify-between hover:border-purple-500/50">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="text-base font-bold text-neutral-900 dark:text-white line-clamp-1">{a.title}</h3>
                      </div>
                      <p className="text-xs text-neutral-500 line-clamp-2 mb-4">{a.description}</p>
                    </div>
                    <div className="space-y-2 mt-auto border-t border-neutral-100 dark:border-neutral-800 pt-3">
                      <div className="flex items-center text-xs text-neutral-600 dark:text-neutral-400 gap-2">
                        <BookOpen size={14} className="text-purple-500" />
                        <span className="truncate">{courseTitle || 'Unknown Course'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className={daysLeft < 0 ? 'text-red-500' : 'text-amber-500'} />
                          <span className={daysLeft < 0 ? 'text-red-500 font-semibold' : ''}>
                            {daysLeft < 0 ? 'Overdue' : `${daysLeft} days left`}
                          </span>
                        </div>
                        <span className="font-bold text-purple-600 dark:text-purple-400">Max: {a.max_grade}</span>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
