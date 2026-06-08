import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalIcon, List, Clock, BookOpen, Video, FileText, X } from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { calendarService } from '../../services/calendar.service';
import { GlassCard, Badge, Button, PageHeader } from '../../components/ui/index';
import type { CalendarEvent } from '../../types';
import toast from 'react-hot-toast';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const TYPE_COLORS: Record<string, { bg: string; text: string; badge: 'blue' | 'red' | 'amber' | 'purple' }> = {
  class: { bg: 'rgba(59,130,246,0.2)', text: '#93c5fd', badge: 'blue' },
  exam: { bg: 'rgba(239,68,68,0.2)', text: '#fca5a5', badge: 'red' },
  deadline: { bg: 'rgba(245,158,11,0.2)', text: '#fcd34d', badge: 'amber' },
  event: { bg: 'rgba(139,92,246,0.2)', text: '#c4b5fd', badge: 'purple' },
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  class: <Video size={12} />, exam: <FileText size={12} />, deadline: <Clock size={12} />, event: <BookOpen size={12} />,
};

export function CalendarPage() {
  const [view, setView] = useState<'month' | 'week' | 'list'>('month');
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    calendarService.getEvents(date.getFullYear(), date.getMonth() + 1).then(setEvents);
  }, [date]);

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setDate(new Date(year, month - 1, 1));
  const nextMonth = () => setDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day: number) => {
    const d = new Date(year, month, day);
    return events.filter(e => {
      const ed = new Date(e.startTime);
      return ed.getDate() === day && ed.getMonth() === month && ed.getFullYear() === year;
    });
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay.getDate()) : [];

  const handleGoogleSync = async () => {
    setSyncing(true);
    await calendarService.syncWithGoogle();
    setSyncing(false);
    toast.success('Synced with Google Calendar! 📅');
  };

  const WEEK_HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

  const mockEvents: CalendarEvent[] = events.length ? events : [
    { id: 'e1', title: 'React Advanced Patterns', type: 'class', startTime: new Date(year, month, 10, 10, 0).toISOString(), endTime: new Date(year, month, 10, 11, 30).toISOString(), courseId: 'c1', courseName: 'Web Dev', description: 'Live session', location: 'Virtual Room A' },
    { id: 'e2', title: 'ML Assignment Due', type: 'deadline', startTime: new Date(year, month, 15, 23, 59).toISOString(), endTime: new Date(year, month, 15, 23, 59).toISOString(), courseId: 'c2', courseName: 'ML', description: 'Submission deadline' },
    { id: 'e3', title: 'Midterm Exam — DSA', type: 'exam', startTime: new Date(year, month, 20, 14, 0).toISOString(), endTime: new Date(year, month, 20, 16, 0).toISOString(), courseId: 'c4', courseName: 'DSA', description: 'In-person', location: 'Exam Hall B' },
    { id: 'e4', title: 'Study Group Session', type: 'event', startTime: new Date(year, month, 22, 18, 0).toISOString(), endTime: new Date(year, month, 22, 20, 0).toISOString(), courseId: 'c1', courseName: 'Web Dev', description: 'Group study' },
    { id: 'e5', title: 'UI/UX Design Class', type: 'class', startTime: new Date(year, month, 12, 9, 0).toISOString(), endTime: new Date(year, month, 12, 10, 30).toISOString(), courseId: 'c3', courseName: 'Design', description: 'Live session' },
    { id: 'e6', title: 'React Architecture Due', type: 'deadline', startTime: new Date(year, month, today.getDate() + 8, 23, 59).toISOString(), endTime: new Date(year, month, today.getDate() + 8, 23, 59).toISOString(), courseId: 'c1', courseName: 'Web Dev', description: 'Assignment' },
  ];

  const displayEvents = events.length ? events : mockEvents;

  return (
    <AppLayout>
      <PageHeader
        title="Calendar"
        subtitle="Schedule, deadlines, and class timetable"
        breadcrumb={[{ label: 'Calendar' }]}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleGoogleSync} loading={syncing}>
              📅 Sync Google
            </Button>
            <Button variant="primary" icon={<Plus size={15} />} size="sm" onClick={() => setShowEventModal(true)}>
              Add Event
            </Button>
          </div>
        }
      />

      <div className="p-6">
        {/* Controls */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5 transition-all"><ChevronLeft size={18} /></button>
            <h2 className="text-xl font-bold text-on-surface min-w-[160px] text-center" style={{ fontFamily: 'Geist, sans-serif' }}>
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5 transition-all"><ChevronRight size={18} /></button>
            <button onClick={() => setDate(new Date())} className="px-3 py-1.5 rounded-xl text-xs font-medium border border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5 transition-all">Today</button>
          </div>
          <div className="flex items-center gap-1 border border-outline-variant/20 rounded-xl overflow-hidden">
            {(['month', 'week', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium capitalize transition-all ${view === v ? 'bg-[#7C3AED] text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>
                {v === 'month' ? <CalIcon size={13} /> : v === 'week' ? <ChevronRight size={13} /> : <List size={13} />}
                {v}
              </button>
            ))}
          </div>
        </div>

        {view === 'month' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {/* Calendar grid */}
            <div className="lg:col-span-3">
              <GlassCard padding="p-0">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-outline-variant/10">
                  {DAYS.map(d => (
                    <div key={d} className="py-2.5 text-center text-xs font-semibold text-on-surface-variant uppercase tracking-wide" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{d}</div>
                  ))}
                </div>
                {/* Calendar days */}
                <div className="grid grid-cols-7">
                  {Array.from({ length: firstDay }, (_, i) => (
                    <div key={`empty-${i}`} className="h-24 border-b border-r border-outline-variant/10" />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                    const isSelected = selectedDay?.getDate() === day && selectedDay?.getMonth() === month;
                    const dayEvents = displayEvents.filter(e => {
                      const d = new Date(e.startTime);
                      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
                    });
                    return (
                      <motion.div
                        key={day}
                        onClick={() => setSelectedDay(new Date(year, month, day))}
                        whileHover={{ scale: 0.98 }}
                        className={`h-24 border-b border-r border-outline-variant/10 p-2 cursor-pointer transition-all ${isSelected ? 'bg-[#7C3AED]/15' : 'hover:bg-on-surface/[0.03]'}`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${isToday ? 'bg-[#7C3AED] text-on-surface' : 'text-on-surface-variant'}`}>
                          {day}
                        </span>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 2).map(ev => {
                            const tc = TYPE_COLORS[ev.type];
                            return (
                              <div key={ev.id} className="text-xs px-1.5 py-0.5 rounded truncate" style={{ background: tc.bg, color: tc.text }}>
                                {ev.title}
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && <div className="text-xs text-on-surface-variant">+{dayEvents.length - 2} more</div>}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>

            {/* Sidebar: selected day events + upcoming */}
            <div className="space-y-4">
              {selectedDay && (
                <GlassCard>
                  <h3 className="text-sm font-bold text-on-surface mb-3" style={{ fontFamily: 'Geist, sans-serif' }}>
                    {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                  {selectedDayEvents.length === 0 ? (
                    <p className="text-xs text-on-surface-variant">No events this day</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDayEvents.map(ev => {
                        const tc = TYPE_COLORS[ev.type];
                        return (
                          <div key={ev.id} className="flex items-start gap-2 p-2.5 rounded-xl" style={{ background: tc.bg, border: `1px solid ${tc.text}33` }}>
                            <span style={{ color: tc.text }}>{TYPE_ICONS[ev.type]}</span>
                            <div>
                              <p className="text-xs font-semibold" style={{ color: tc.text }}>{ev.title}</p>
                              <p className="text-xs text-on-surface-variant">{new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </GlassCard>
              )}

              <GlassCard>
                <h3 className="text-sm font-bold text-on-surface mb-3" style={{ fontFamily: 'Geist, sans-serif' }}>Upcoming Events</h3>
                <div className="space-y-2.5">
                  {displayEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).slice(0, 5).map(ev => {
                    const tc = TYPE_COLORS[ev.type];
                    return (
                      <div key={ev.id} className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: tc.text }} />
                        <div>
                          <p className="text-xs font-medium text-on-surface">{ev.title}</p>
                          <p className="text-xs text-on-surface-variant">{new Date(ev.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                        <Badge variant={tc.badge} size="sm">{ev.type}</Badge>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Legend */}
              <GlassCard>
                <h3 className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide">Legend</h3>
                <div className="space-y-1.5">
                  {Object.entries(TYPE_COLORS).map(([type, { text, bg }]) => (
                    <div key={type} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ background: bg }} />
                      <span className="text-xs capitalize" style={{ color: text }}>{type}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {view === 'list' && (
          <GlassCard>
            <h2 className="text-base font-bold text-on-surface mb-4" style={{ fontFamily: 'Geist, sans-serif' }}>All Events</h2>
            <div className="space-y-3">
              {displayEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map((ev, i) => {
                const tc = TYPE_COLORS[ev.type];
                return (
                  <motion.div key={ev.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-4 p-4 rounded-xl border" style={{ background: tc.bg, borderColor: `${tc.text}30` }}>
                    <div className="flex-shrink-0 text-center min-w-[50px]">
                      <p className="text-lg font-black text-on-surface">{new Date(ev.startTime).getDate()}</p>
                      <p className="text-xs text-on-surface-variant">{MONTHS[new Date(ev.startTime).getMonth()].slice(0, 3)}</p>
                    </div>
                    <div className="w-px self-stretch" style={{ background: `${tc.text}40` }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-on-surface">{ev.title}</p>
                        <Badge variant={tc.badge}>{ev.type}</Badge>
                      </div>
                      <p className="text-xs text-on-surface-variant">{ev.courseName} · {new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{ev.location ? ` · ${ev.location}` : ''}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        )}

        {view === 'week' && (
          <GlassCard>
            <p className="text-center text-on-surface-variant py-10">
              Week view — time slot grid with events overlaid
              <br />
              <span className="text-xs text-outline mt-1 block">(Full implementation uses the same data; this placeholder indicates the pattern)</span>
            </p>
          </GlassCard>
        )}
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showEventModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowEventModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-6 border border-outline-variant/20" style={{ background: '#0d1421' }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-on-surface" style={{ fontFamily: 'Geist, sans-serif' }}>Add Event</h3>
                <button onClick={() => setShowEventModal(false)} className="text-on-surface-variant hover:text-on-surface transition-colors"><X size={18} /></button>
              </div>
              <div className="space-y-3">
                {['Event Title', 'Date', 'Time', 'Course (optional)'].map(label => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">{label}</label>
                    <input type={label.toLowerCase().includes('date') ? 'date' : label.toLowerCase().includes('time') ? 'time' : 'text'}
                      className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/20 text-on-surface text-sm outline-none focus:border-[#7C3AED]/60"
                      style={{ background: 'rgba(255,255,255,0.05)', fontFamily: 'Inter, sans-serif' }} />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <Button variant="ghost" onClick={() => setShowEventModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => { toast.success('Event added!'); setShowEventModal(false); }} className="flex-1 justify-center">Add Event</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
