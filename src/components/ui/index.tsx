// Shared UI Components for ScholarHub App Screens

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: 'purple' | 'blue' | 'emerald' | 'amber';
  delay?: number;
}

export function StatCard({ label, value, icon, trend, trendUp, color = 'purple', delay = 0 }: StatCardProps) {
  const colors = {
    purple: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.2)', icon: '#8B5CF6', text: '#c4b5fd' },
    blue: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.2)', icon: '#3B82F6', text: '#93c5fd' },
    emerald: { bg: 'rgba(78,222,163,0.15)', border: 'rgba(78,222,163,0.2)', icon: '#4edea3', text: '#6ee7b7' },
    amber: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.2)', icon: '#F59E0B', text: '#fcd34d' },
  };
  const c = colors[color];
  return (
    <div
      className="rounded-2xl p-5 border transition-all hover:scale-[1.02] duration-300"
      style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          <span style={{ color: c.icon }}>{icon}</span>
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trendUp ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white mb-0.5" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>{value}</p>
        <p className="text-xs text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</p>
      </div>
    </div>
  );
}

// ─── GlassCard ────────────────────────────────────────────────────────────────
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  tint?: 'purple' | 'blue' | 'emerald' | 'none';
  padding?: string;
}

export function GlassCard({ children, className = '', tint = 'none', padding = 'p-5' }: GlassCardProps) {
  const tints = {
    purple: 'rgba(139,92,246,0.06)',
    blue: 'rgba(59,130,246,0.06)',
    emerald: 'rgba(78,222,163,0.06)',
    none: 'rgba(255,255,255,0.04)',
  };
  return (
    <div
      className={`rounded-2xl border border-white/8 ${padding} ${className}`}
      style={{ background: tints[tint], backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'purple' | 'blue' | 'emerald' | 'amber' | 'red' | 'slate';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'purple', size = 'sm' }: BadgeProps) {
  const variants = {
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
    blue: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    red: 'bg-red-500/15 text-red-300 border-red-500/25',
    slate: 'bg-slate-500/15 text-slate-300 border-slate-500/25',
  };
  const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-3 py-1 text-sm' };
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'purple' | 'blue' | 'emerald' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ProgressBar({ value, max = 100, color = 'purple', size = 'sm', showLabel = false }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3' };
  const gradients = {
    purple: 'linear-gradient(90deg, #8B5CF6, #a78bfa)',
    blue: 'linear-gradient(90deg, #3B82F6, #60a5fa)',
    emerald: 'linear-gradient(90deg, #4edea3, #34d399)',
    amber: 'linear-gradient(90deg, #F59E0B, #fbbf24)',
  };
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Progress</span><span>{pct}%</span>
        </div>
      )}
      <div className={`w-full ${heights[size]} rounded-full overflow-hidden`} style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: gradients[color] }}
        />
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
  rows?: number;
}

export function Skeleton({ className = 'h-4 w-full' }: SkeletonProps) {
  return (
    <div
      className={`rounded-lg animate-pulse ${className}`}
      style={{ background: 'rgba(255,255,255,0.06)' }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
}

export function Avatar({ name, src, size = 'md', online }: AvatarProps) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
  const dotSizes = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3', xl: 'w-4 h-4' };
  return (
    <div className="relative inline-flex">
      {src ? (
        <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />
      ) : (
        <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white flex-shrink-0`}>
          {name?.[0]?.toUpperCase() || 'U'}
        </div>
      )}
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 ${dotSizes[size]} rounded-full border-2 border-slate-900 ${online ? 'bg-emerald-400' : 'bg-slate-500'}`} />
      )}
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }: ButtonProps) {
  const variants = {
    primary: 'text-white hover:opacity-90',
    secondary: 'text-white border border-white/15 hover:bg-white/10',
    ghost: 'text-slate-300 hover:text-white hover:bg-white/8',
    danger: 'text-red-300 border border-red-500/20 hover:bg-red-500/10',
  };
  const primaryBg = variant === 'primary' ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)' : undefined;
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      style={primaryBg ? { background: primaryBg, fontFamily: 'Inter, sans-serif' } : { fontFamily: 'Inter, sans-serif', background: variant === 'secondary' ? 'rgba(255,255,255,0.06)' : undefined }}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function Input({ label, error, icon, suffix, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-slate-400">{icon}</span>
        )}
        <input
          {...props}
          className={`w-full rounded-xl border text-white text-sm outline-none transition-all placeholder-slate-500 ${icon ? 'pl-10' : 'pl-3.5'} ${suffix ? 'pr-10' : 'pr-3.5'} py-2.5 ${error ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500/60'} ${className}`}
          style={{ background: 'rgba(255,255,255,0.05)', fontFamily: 'Inter, sans-serif', backdropFilter: 'blur(8px)' }}
        />
        {suffix && <span className="absolute right-3 text-slate-400">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

// ─── SearchInput ──────────────────────────────────────────────────────────────
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-4 py-2 rounded-xl border border-white/10 text-white text-sm outline-none focus:border-purple-500/60 placeholder-slate-500 w-full transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', fontFamily: 'Inter, sans-serif' }}
      />
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}
      <select
        {...props}
        className={`w-full rounded-xl border border-white/10 text-white text-sm outline-none focus:border-purple-500/60 px-3.5 py-2.5 transition-all ${className}`}
        style={{ background: 'rgba(13,20,45,0.9)', fontFamily: 'Inter, sans-serif' }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ background: '#0d1421' }}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}

export function PageHeader({ title, subtitle, action, breadcrumb }: PageHeaderProps) {
  return (
    <div className="px-6 py-5 border-b border-white/5">
      {breadcrumb && (
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span>/</span>}
              <span className={b.href ? 'text-purple-400 cursor-pointer hover:text-purple-300' : 'text-slate-500'}>{b.label}</span>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>{title}</h1>
          {subtitle && <p className="text-sm text-slate-400 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0 ml-4">{action}</div>}
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-300 mb-1" style={{ fontFamily: 'Geist, sans-serif' }}>{title}</h3>
      {description && <p className="text-sm text-slate-500 mb-4 max-w-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{description}</p>}
      {action}
    </div>
  );
}
