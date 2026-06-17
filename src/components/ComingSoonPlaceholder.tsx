import { ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ComingSoonPlaceholder({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm max-w-xl mx-auto my-12">
      <div className="w-16 h-16 bg-[#6D5DFC]/10 rounded-2xl flex items-center justify-center mb-6">
        <Clock className="w-8 h-8 text-[#6D5DFC] animate-pulse" />
      </div>
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-3">
        Coming Soon
      </h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-sm">
        The feature for <span className="font-semibold text-neutral-800 dark:text-neutral-200">"{title}"</span> is currently under development. Stay tuned for updates!
      </p>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
      >
        <ArrowLeft size={16} /> Go Back
      </button>
    </div>
  );
}
