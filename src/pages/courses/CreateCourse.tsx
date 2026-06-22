import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button, GlassCard, Select } from '../../components/ui/index';
import { Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function CreateCourse() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileInstitution, setProfileInstitution] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | string>(0);
  const [targetYear, setTargetYear] = useState('1st Year');
  const [gradeLevel, setGradeLevel] = useState('Grade 9');

  const isK12 = profileInstitution === 'k12';
  const isUni = profileInstitution === 'uni';

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setIsProfileLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('institution')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          setProfileInstitution(data.institution);
        }
      } finally {
        setIsProfileLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in.');
      return;
    }
    if (!title.trim()) {
      toast.error('Title/Subject Name is required.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        instructor_id: user.id,
        institution_type: 'uni',
        title,
        description,
        price: Number(price),
        target_year: targetYear,
        grade_level: null,
      };

      const { error } = await supabase
        .from('courses')
        .insert(payload);

      if (error) throw error;

      toast.success('Course created successfully! 🚀');
      navigate('/courses'); // Redirect to courses list
    } catch (error: any) {
      console.error('Course Creation Error:', error);
      toast.error(error.message || 'Failed to create course.');
    } finally {
      setLoading(false);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="animate-spin text-brand-primary" size={32} />
        <p className="text-sm text-[#7c7c6f]">Verifying workspace...</p>
      </div>
    );
  }

  if (isK12) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <GlassCard className="p-8">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-[#7c7c6f] dark:text-[#7c7c6f]">
            K-12 Teachers cannot manually create subjects. Subjects must be assigned by an Administrator.
          </p>
          <Button variant="secondary" className="mt-6" onClick={() => navigate('/k12-teacher/dashboard')}>
            Return to Dashboard
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <GlassCard className="p-6 md:p-8">
        <div className="mb-8 border-b border-[#E1DCC9]/20 dark:border-[#412D15] pb-4">
          <h1 className="text-2xl font-bold text-[#0e100f] dark:text-[#E1DCC9] font-serif">
            Create University Course
          </h1>
          <p className="text-sm text-[#7c7c6f] dark:text-[#7c7c6f] mt-1">
            Set up a new college course offering.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#7c7c6f] dark:text-[#7c7c6f] mb-1.5">Course Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Intro to Computer Science"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E1DCC9]/20 dark:border-[#412D15] bg-[#FFFCE1] dark:bg-[#412D15] text-[#0e100f] dark:text-[#E1DCC9] focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#7c7c6f] dark:text-[#7c7c6f] mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Comprehensive overview of the course..."
              className="w-full px-4 py-3 rounded-xl border border-[#E1DCC9]/20 dark:border-[#412D15] bg-[#FFFCE1] dark:bg-[#412D15] text-[#0e100f] dark:text-[#E1DCC9] focus:outline-none focus:ring-2 focus:ring-brand-primary/50 resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Select
              label="Target Year"
              value={targetYear}
              onChange={(e) => setTargetYear(e.target.value)}
              options={[
                { value: '1st Year', label: '1st Year' },
                { value: '2nd Year', label: '2nd Year' },
                { value: '3rd Year', label: '3rd Year' },
                { value: '4th Year', label: '4th Year' },
                { value: 'Postgraduate', label: 'Postgraduate' },
              ]}
            />

            <div>
              <label className="block text-sm font-semibold text-[#7c7c6f] dark:text-[#7c7c6f] mb-1.5">Price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E1DCC9]/20 dark:border-[#412D15] bg-[#FFFCE1] dark:bg-[#412D15] text-[#0e100f] dark:text-[#E1DCC9] focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              />
            </div>
          </div>

          {(!isK12 && !isUni && user?.role === 'admin') && (
            <div className="p-4 rounded-xl bg-[#00bae2] text-[#00bae2] border border-[#00bae2]">
              Admin View: Admins can manage courses via the main Admin Dashboard instead.
            </div>
          )}

          <div className="pt-6 border-t border-[#E1DCC9]/20 dark:border-[#412D15] flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !isUni}
              icon={loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
              className="w-full sm:w-auto px-8"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
