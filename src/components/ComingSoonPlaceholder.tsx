import { ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ComingSoonPlaceholder({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/20 dark:border-[#412D15] rounded-3xl shadow-sm max-w-xl mx-auto my-12">
      <div className="w-16 h-16 bg-[#9d95ff]/10 rounded-2xl flex items-center justify-center mb-6">
        <Clock className="w-8 h-8 text-[#9d95ff] animate-pulse" />
      </div>
      <h2 className="text-2xl font-bold text-[#0e100f] dark:text-[#E1DCC9] mb-3">
        Coming Soon
      </h2>
      <p className="text-sm text-[#7c7c6f] dark:text-[#7c7c6f] mb-8 max-w-sm">
        The feature for <span className="font-semibold text-[#0e100f] dark:text-neutral-200">"{title}"</span> is currently under development. Stay tuned for updates!
      </p>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#412D15] text-[#E1DCC9] dark:bg-[#FFFCE1] dark:text-[#0e100f] rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
      >
        <ArrowLeft size={16} /> Go Back
      </button>
    </div>
  );
}
