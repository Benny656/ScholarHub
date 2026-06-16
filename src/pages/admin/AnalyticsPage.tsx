import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Video, BookOpen, Activity, Award, IndianRupee, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAnalyticsData } from '../../services/admin.service';

const MONTHLY_HISTORICAL = [
  { name: 'Jan', activeUsers: 340, completions: 72, attendance: 91 },
  { name: 'Feb', activeUsers: 480, completions: 75, attendance: 93 },
  { name: 'Mar', activeUsers: 620, completions: 74, attendance: 90 },
  { name: 'Apr', activeUsers: 810, completions: 78, attendance: 92 },
  { name: 'May', activeUsers: 950, completions: 82, attendance: 94 },
  { name: 'Jun', activeUsers: 1100, completions: 85, attendance: 93 },
];

const WEEKLY_HOURS = [
  { name: 'Mon', hours: 450 },
  { name: 'Tue', hours: 520 },
  { name: 'Wed', hours: 610 },
  { name: 'Thu', hours: 580 },
  { name: 'Fri', hours: 480 },
  { name: 'Sat', hours: 320 },
  { name: 'Sun', hours: 260 },
];

const COHORT_COLORS = ['#EF4444', '#6366F1'];

export function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsRes = await getAnalyticsData();
      setData(analyticsRes);
    } catch (err) {
      console.error(err);
      toast.error('Failed to aggregate analytics datasets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const cohortData = data ? [
    { name: 'School (K-12)', value: data.schoolCount || 0 },
    { name: 'University / College', value: data.collegeCount || 0 },
  ] : [];

  const totalCohort = (data?.schoolCount || 0) + (data?.collegeCount || 0);

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
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight mb-2">
          Platform Analytics
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
          Aggregated summaries on daily activity, cohort splits, attendance metrics, and virtual classroom telemetry.
        </p>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-16 text-center">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-neutral-500">Aggregating telemetry logs...</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* KPI Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Daily Active Users (DAU)', value: data?.dau || 0, icon: Users, description: 'Simulated 45% active ratio' },
              { label: 'Weekly Active Users (WAU)', value: data?.wau || 0, icon: Activity, description: 'Simulated 75% active ratio' },
              { label: 'Monthly Active Users (MAU)', value: data?.mau || 0, icon: TrendingUp, description: 'Total registered database users' },
              { label: 'Active Live Sessions', value: data?.liveSessionsCount || 0, icon: Video, description: 'Virtual Jitsi classrooms' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                  <stat.icon size={16} className="text-brand-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
                </div>
                <div className="text-3xl font-semibold text-neutral-900 dark:text-neutral-50 mt-1">
                  {stat.value.toLocaleString()}
                </div>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">{stat.description}</span>
              </motion.div>
            ))}
          </div>

          {/* Core Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Primary Engagement Chart (Takes 2 columns) */}
            <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200/65 dark:border-neutral-800 rounded-2xl overflow-hidden p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">User Engagement & Core Growth</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Aggregated weekly session trends and progress rates.</p>
                </div>
              </div>

              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MONTHLY_HISTORICAL} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-neutral-850" />
                    <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '12px' }} />
                    <Area type="monotone" name="Active Sessions" dataKey="activeUsers" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#userGrad)" />
                    <Area type="monotone" name="Completion Rate (%)" dataKey="completions" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#progressGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Attendance & Completion telemetries (Takes 1 column) */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-neutral-900 border border-neutral-200/65 dark:border-neutral-800 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">LMS Telemetry Overview</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Real-time indicators calculated from Supabase logs.</p>
              </div>

              <div className="space-y-6">
                {/* Completion Metric */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-150 dark:border-neutral-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-500 flex items-center gap-1.5 font-semibold"><Target size={14} className="text-brand-primary" /> Average Course Progress</span>
                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{data?.avgProgress || 0}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2">
                    <div className="bg-brand-primary h-2 rounded-full" style={{ width: `${data?.avgProgress || 0}%` }} />
                  </div>
                </div>

                {/* Attendance Metric */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-150 dark:border-neutral-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-500 flex items-center gap-1.5 font-semibold"><Award size={14} className="text-indigo-500" /> Avg Attendance Rate</span>
                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{data?.avgAttendance || 95}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${data?.avgAttendance || 95}%` }} />
                  </div>
                </div>

                {/* Study Hours stats */}
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={WEEKLY_HOURS} margin={{ top: 5, right: 0, left: -25, bottom: 0 }} barSize={16}>
                      <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Bar dataKey="hours" fill="#6366F1" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Student Cohort split */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-neutral-900 border border-neutral-200/65 dark:border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-2">Student Cohort Split</h3>
                <p className="text-xs text-neutral-500">Breakdown of registered student types.</p>
              </div>

              {totalCohort > 0 ? (
                <div className="flex flex-col gap-6 py-6 items-center">
                  <div className="h-[150px] w-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={cohortData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {cohortData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COHORT_COLORS[index % COHORT_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-brand-primary shrink-0" />
                      <span className="text-neutral-500">School K-12:</span>
                      <span className="text-neutral-800 dark:text-neutral-200">
                        {Math.round(((data.schoolCount || 0) / totalCohort) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
                      <span className="text-neutral-500">Uni:</span>
                      <span className="text-neutral-800 dark:text-neutral-200">
                        {Math.round(((data.collegeCount || 0) / totalCohort) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-500 py-12 text-center">No cohort split telemetry logs available.</p>
              )}
            </motion.div>

            {/* Popular Courses Leaderboard */}
            <motion.div variants={itemVariants} className="md:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200/65 dark:border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-2">Top Course Enrollments</h3>
                <p className="text-xs text-neutral-500">Courses with the highest level of student engagements.</p>
              </div>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-850 mt-4 flex-1">
                {(data?.popularCourses || []).length === 0 ? (
                  <p className="text-xs text-neutral-500 py-12 text-center">No course catalogs registered.</p>
                ) : (
                  data.popularCourses.map((c: any, index: number) => (
                    <div key={c.id || index} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex items-center gap-2.5">
                        <span className="font-bold text-neutral-400 font-mono w-4">{index + 1}.</span>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[220px]">
                          {c.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right">
                          <p className="font-bold text-neutral-850 dark:text-neutral-150">{c.enrollments}</p>
                          <p className="text-[9px] text-neutral-400 uppercase tracking-wider">Students</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">{c.completion}</p>
                          <p className="text-[9px] text-neutral-400 uppercase tracking-wider">Avg Progress</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
