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
    purple: { bg: 'bg-brand-primary/10 dark:bg-brand-primary/20', border: 'border-brand-primary/20', icon: 'text-brand-primary', text: 'text-brand-primary-light' },
    blue: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', border: 'border-blue-500/20', icon: 'text-blue-600 dark:text-blue-400', text: 'text-blue-600 dark:text-blue-300' },
    emerald: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', border: 'border-emerald-500/20', icon: 'text-emerald-600 dark:text-emerald-400', text: 'text-emerald-600 dark:text-emerald-300' },
    amber: { bg: 'bg-amber-500/10 dark:bg-amber-500/20', border: 'border-amber-500/20', icon: 'text-amber-600 dark:text-amber-400', text: 'text-amber-600 dark:text-amber-300' },
  };
  const c = colors[color];
  return (
    <div className="rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm transition-all hover:-translate-y-1 duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${c.bg} ${c.border}`}>
          <span className={c.icon}>{icon}</span>
        </div>
        {trend && (
          <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full ${trendUp ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-400/10' : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-400/10'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-serif font-black text-neutral-900 dark:text-neutral-50 mb-1 leading-none">{value}</p>
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 font-sans">{label}</p>
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

export function GlassCard({ children, className = '', tint = 'none', padding = 'p-6' }: GlassCardProps) {
  return (
    <div className={`bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm ${padding} ${className}`}>
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
    purple: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20 dark:bg-brand-primary/20 dark:text-brand-primary-light',
    blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
    amber: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
    red: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30',
    slate: 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
  };
  const sizes = { sm: 'px-2 py-0.5 text-[10px] uppercase tracking-wider', md: 'px-3 py-1 text-xs uppercase tracking-wider' };
  return (
    <span className={`inline-flex items-center rounded-md font-extrabold border ${variants[variant]} ${sizes[size]}`}>
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
  const bgColors = {
    purple: 'bg-brand-primary',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
  };
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
          <span>Progress</span><span>{pct}%</span>
        </div>
      )}
      <div className={`w-full ${heights[size]} rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${bgColors[color]}`}
          style={{ width: `${pct}%` }}
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
    <div className={`rounded-lg animate-pulse bg-neutral-200 dark:bg-neutral-800 ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2 mt-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-2 w-full mb-2" />
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
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
  const dotSizes = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3', xl: 'w-4 h-4' };
  return (
    <div className="relative inline-flex">
      {src ? (
        <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover border-2 border-white dark:border-neutral-900`} />
      ) : (
        <div className={`${sizes[size]} rounded-full bg-brand-primary flex items-center justify-center font-bold text-white flex-shrink-0 shadow-sm border-2 border-white dark:border-neutral-900`}>
          {name?.[0]?.toUpperCase() || 'U'}
        </div>
      )}
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 ${dotSizes[size]} rounded-full border-2 border-white dark:border-neutral-900 ${online ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
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
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
      <div>
        <h2 className="text-lg font-serif font-black text-neutral-900 dark:text-neutral-50 leading-tight">{title}</h2>
        {subtitle && <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-1 uppercase tracking-wider">{subtitle}</p>}
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
    primary: 'bg-brand-primary text-white hover:opacity-90 shadow-sm',
    secondary: 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800 dark:hover:bg-neutral-800 shadow-sm',
    ghost: 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800',
    danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/20 shadow-sm',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className}`}
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
        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-neutral-400 flex items-center pointer-events-none">{icon}</span>
        )}
        <input
          {...props}
          className={`w-full rounded-xl border text-sm outline-none transition-all placeholder-neutral-400 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 ${icon ? 'pl-9' : 'pl-3.5'} ${suffix ? 'pr-9' : 'pr-3.5'} py-2.5 ${error ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-neutral-200 dark:border-neutral-700 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary'} ${className}`}
        />
        {suffix && <span className="absolute right-3 text-neutral-400 flex items-center pointer-events-none">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-red-500 font-medium mt-1.5">{error}</p>}
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
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary placeholder-neutral-400 transition-all"
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
      {label && <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-300 mb-1.5">{label}</label>}
      <select
        {...props}
        className={`w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary px-3.5 py-2.5 transition-all ${className}`}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
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
    <div className="mb-8">
      {breadcrumb && (
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-neutral-300 dark:text-neutral-600">/</span>}
              <span className={b.href ? 'text-brand-primary cursor-pointer hover:underline' : 'text-neutral-500 dark:text-neutral-400'}>{b.label}</span>
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-black text-neutral-900 dark:text-neutral-50 tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
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
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 border-dashed">
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-lg font-serif font-bold text-neutral-900 dark:text-neutral-50 mb-1">{title}</h3>
      {description && <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}
