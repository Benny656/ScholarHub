import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Scan, Calendar, BarChart3, Sparkles, RefreshCw, CheckCircle, X, Clock, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AppLayout } from '../../layouts/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendance.service';
import { aiService } from '../../services/ai.service';
import { GlassCard, Badge, ProgressBar, PageHeader, Button, SectionHeader, Avatar } from '../../components/ui/index';
import toast from 'react-hot-toast';

function HeatCell({ count }: { count: number }) {
  const o = count === 0 ? 0.05 : count === 1 ? 0.3 : count === 2 ? 0.55 : count === 3 ? 0.75 : 1;
  return <div className="w-4 h-4 rounded-sm transition-all hover:scale-125" style={{ background: `rgba(78,222,163,${o})` }} title={`${count} classes`} />;
}

export function Attendance() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'overview' | 'qr' | 'scanner' | 'reports' | 'insights'>('overview');
  const [summary, setSummary] = useState({ total: 45, present: 38, absent: 4, late: 3, percentage: 84 });
  const [calendarData, setCalendarData] = useState<{ date: string; count: number }[]>([]);
  const [report, setReport] = useState<{ studentName: string; percentage: number; total: number; present: number }[]>([]);
  const [qrData, setQrData] = useState<{ qrData: string; expiresAt: string; sessionId: string } | null>(null);
  const [qrTimer, setQrTimer] = useState(0);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [insights, setInsights] = useState<Awaited<ReturnType<typeof aiService.getAttendanceInsights>>>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (!user) return;
    attendanceService.getStudentAttendance(user.id).then(({ summary: s, calendarData: c }) => {
      setSummary(s);
      setCalendarData(c);
    });
    attendanceService.getAttendanceReport('c1').then(setReport);
  }, [user]);

  useEffect(() => {
    if (!qrData || qrTimer <= 0) return;
    const t = setInterval(() => setQrTimer(q => q - 1), 1000);
    return () => clearInterval(t);
  }, [qrData, qrTimer]);

  const generateQR = async () => {
    setGeneratingQR(true);
    const data = await attendanceService.generateQRCode('c1', 300);
    setQrData(data);
    setQrTimer(300);
    setGeneratingQR(false);
    toast.success('QR code generated (5 min expiry)');
  };

  const handleScan = async () => {
    if (!user) return;
    setScanning(true);
    await attendanceService.scanQRCode('nexlearn://attendance/c1/sess-123', user.id);
    setScanning(false);
    toast.success('Attendance marked! ✅');
  };

  const loadInsights = async () => {
    if (!user) return;
    setLoadingInsights(true);
    const data = await aiService.getAttendanceInsights(user.id, { percentage: summary.percentage, trend: 'stable' });
    setInsights(data);
    setLoadingInsights(false);
  };

  const pieData = [
    { name: 'Present', value: summary.present, fill: '#4edea3' },
    { name: 'Absent', value: summary.absent, fill: '#EF4444' },
    { name: 'Late', value: summary.late, fill: '#F59E0B' },
  ];

  const TOOLTIP = { background: 'rgba(13,20,45,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0', fontSize: 12 };

  return (
    <AppLayout>
      <PageHeader title="Attendance" subtitle="Track and manage class attendance" breadcrumb={[{ label: 'Attendance' }]} />
      <div className="p-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart3 size={14} /> },
            ...(user?.role === 'teacher' ? [{ id: 'qr', label: 'QR Generator', icon: <QrCode size={14} /> }] : [{ id: 'scanner', label: 'Scan QR', icon: <Scan size={14} /> }]),
            { id: 'reports', label: 'Reports', icon: <Users size={14} /> },
            { id: 'insights', label: 'AI Insights', icon: <Sparkles size={14} /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0 transition-all ${tab === t.id ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5'}`}
              style={tab === t.id ? { background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' } : {}}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Overview */}
          {tab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Classes', value: summary.total, color: 'text-on-surface' },
                  { label: 'Present', value: summary.present, color: 'text-emerald-400' },
                  { label: 'Absent', value: summary.absent, color: 'text-red-400' },
                  { label: 'Late', value: summary.late, color: 'text-amber-400' },
                ].map((s, i) => (
                  <GlassCard key={i}>
                    <p className="text-xs text-on-surface-variant mb-1">{s.label}</p>
                    <p className={`text-3xl font-bold ${s.color}`} style={{ fontFamily: 'Geist, sans-serif' }}>{s.value}</p>
                  </GlassCard>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <GlassCard tint="emerald">
                  <SectionHeader title="Attendance Summary" />
                  <div className="flex items-center gap-6">
                    <PieChart width={160} height={160}>
                      <Pie data={pieData} innerRadius={50} outerRadius={72} startAngle={90} endAngle={-270} dataKey="value" isAnimationActive animationDuration={1000}>
                        {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Pie>
                    </PieChart>
                    <div className="flex-1">
                      <div className="text-center mb-3">
                        <p className="text-4xl font-black text-on-surface">{summary.percentage}%</p>
                        <p className="text-xs text-on-surface-variant">Overall Attendance</p>
                      </div>
                      {pieData.map(d => (
                        <div key={d.name} className="flex items-center justify-between text-sm mb-1">
                          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} /><span className="text-on-surface-variant">{d.name}</span></div>
                          <span className="text-on-surface font-medium">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>

                <GlassCard>
                  <SectionHeader title="Activity Calendar" subtitle="Last 63 days" />
                  <div className="flex flex-wrap gap-1">
                    {(calendarData.length ? calendarData : Array.from({ length: 63 }, (_, i) => ({ date: String(i), count: Math.random() > 0.35 ? Math.floor(Math.random() * 4) + 1 : 0 }))).map((c, i) => (
                      <HeatCell key={i} count={c.count} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-outline">
                    <span>Less</span>
                    {[0.05, 0.3, 0.55, 0.75, 1].map((o, i) => <div key={i} className="w-4 h-4 rounded-sm" style={{ background: `rgba(78,222,163,${o})` }} />)}
                    <span>More</span>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {/* QR Generator (teacher) */}
          {tab === 'qr' && (
            <motion.div key="qr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-lg mx-auto">
              <GlassCard tint="blue">
                <SectionHeader title="QR Code Generator" subtitle="Generate a QR for today's class" />
                {!qrData ? (
                  <div className="text-center py-10">
                    <div className="w-24 h-24 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
                      <QrCode size={48} className="text-blue-400" />
                    </div>
                    <Button variant="primary" onClick={generateQR} loading={generatingQR} icon={<QrCode size={16} />}>
                      Generate QR Code
                    </Button>
                  </div>
                ) : (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                    {/* Fake QR Code */}
                    <div className="w-48 h-48 mx-auto mb-4 rounded-2xl p-4 bg-white flex items-center justify-center">
                      <div className="grid grid-cols-8 gap-0.5 w-full h-full">
                        {Array.from({ length: 64 }, (_, i) => (
                          <div key={i} className="rounded-sm" style={{ background: Math.random() > 0.4 ? 'var(--color-bg)' : 'white' }} />
                        ))}
                      </div>
                    </div>
                    <div className={`text-lg font-bold mb-2 ${qrTimer < 60 ? 'text-red-400' : 'text-emerald-400'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {Math.floor(qrTimer / 60)}:{String(qrTimer % 60).padStart(2, '0')} remaining
                    </div>
                    <p className="text-xs text-on-surface-variant mb-4" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Session: {qrData.sessionId}</p>
                    <Button variant="secondary" onClick={generateQR} icon={<RefreshCw size={14} />}>Regenerate</Button>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* Scanner (student) */}
          {tab === 'scanner' && (
            <motion.div key="scanner" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-lg mx-auto">
              <GlassCard tint="blue">
                <SectionHeader title="QR Code Scanner" subtitle="Scan to mark your attendance" />
                <div className="rounded-2xl overflow-hidden border border-outline-variant/20 aspect-square flex items-center justify-center mb-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <div className="relative w-48 h-48">
                    <div className="absolute inset-0 border-2 border-[#10B981]/60 rounded-xl" />
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#10B981] rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#10B981] rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#10B981] rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#10B981] rounded-br-xl" />
                    <motion.div className="absolute left-0 right-0 h-0.5 bg-[#10B981]/60"
                      animate={{ top: ['10%', '90%', '10%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-xs text-on-surface-variant text-center">Camera placeholder<br />(In production: use QR scanner)</p>
                    </div>
                  </div>
                </div>
                <Button variant="primary" onClick={handleScan} loading={scanning} icon={<Scan size={16} />} className="w-full justify-center">
                  Simulate Scan
                </Button>
              </GlassCard>
            </motion.div>
          )}

          {/* Reports */}
          {tab === 'reports' && (
            <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <GlassCard padding="p-0">
                <div className="p-5 border-b border-outline-variant/10">
                  <h2 className="text-lg font-bold text-on-surface">Student Attendance Report</h2>
                  <p className="text-sm text-on-surface-variant">Full-Stack Web Development — Class Report</p>
                </div>
                <div className="h-52 p-5">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={report.length ? report : [
                      { studentName: 'Alex J.', percentage: 84 }, { studentName: 'Priya S.', percentage: 96 },
                      { studentName: 'Jordan L.', percentage: 71 }, { studentName: 'Marcus B.', percentage: 62 }, { studentName: 'Sara W.', percentage: 89 },
                    ]} barSize={32}>
                      <XAxis dataKey="studentName" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                      <Tooltip contentStyle={TOOLTIP} formatter={(v: number) => [`${v}%`, 'Attendance']} />
                      <Bar dataKey="percentage" radius={[6, 6, 0, 0]} isAnimationActive>
                        {(report.length ? report : [84, 96, 71, 62, 89]).map((v, i) => (
                          <Cell key={i} fill={typeof v === 'number' && v >= 80 ? '#4edea3' : typeof v === 'number' && v >= 70 ? '#F59E0B' : '#EF4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-outline-variant/10">
                      {['Student', 'Classes', 'Present', 'Attendance', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {(report.length ? report : [
                        { studentName: 'Alex Johnson', total: 45, present: 38, percentage: 84 },
                        { studentName: 'Priya Sharma', total: 45, present: 43, percentage: 96 },
                        { studentName: 'Jordan Lee', total: 45, present: 32, percentage: 71 },
                        { studentName: 'Marcus Brown', total: 45, present: 28, percentage: 62 },
                        { studentName: 'Sara Wilson', total: 45, present: 40, percentage: 89 },
                      ]).map((r, i) => (
                        <tr key={i} className="border-b border-outline-variant/10 hover:bg-on-surface/[0.03] transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={r.studentName} size="sm" />
                              <span className="font-medium text-on-surface">{r.studentName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-on-surface-variant">{r.total}</td>
                          <td className="px-5 py-3.5 text-on-surface-variant">{r.present}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <ProgressBar value={r.percentage} color={r.percentage >= 80 ? 'emerald' : r.percentage >= 70 ? 'amber' : 'red'} />
                              <span className="text-xs font-bold w-10" style={{ color: r.percentage >= 80 ? '#4edea3' : r.percentage >= 70 ? '#F59E0B' : '#EF4444' }}>{r.percentage}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5"><Badge variant={r.percentage >= 75 ? 'emerald' : 'red'}>{r.percentage >= 75 ? 'On Track' : 'At Risk'}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* AI Insights */}
          {tab === 'insights' && (
            <motion.div key="insights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto space-y-4">
              <GlassCard tint="purple">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles size={20} className="text-[#10B981]" />
                  <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: 'Geist, sans-serif' }}>AI Attendance Insights</h2>
                </div>
                {insights.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-on-surface-variant mb-4 text-sm">Get AI-powered insights about your attendance patterns</p>
                    <Button variant="primary" onClick={loadInsights} loading={loadingInsights} icon={<Sparkles size={15} />}>
                      Analyze My Attendance
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {insights.map((ins, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-xl border ${ins.type === 'warning' ? 'border-amber-500/25 bg-amber-500/8' : ins.type === 'success' ? 'border-emerald-500/25 bg-emerald-500/8' : 'border-blue-500/25 bg-blue-500/8'}`}>
                        <p className="text-sm font-semibold text-on-surface mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{ins.insight}</p>
                        <p className="text-xs text-on-surface-variant">{ins.recommendation}</p>
                      </motion.div>
                    ))}
                    <Button variant="ghost" onClick={loadInsights} loading={loadingInsights} icon={<RefreshCw size={14} />} size="sm">Refresh</Button>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
