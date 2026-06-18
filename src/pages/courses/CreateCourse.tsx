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
      const institution_type = isK12 ? 'k12' : 'uni';
      
      const payload = {
        instructor_id: user.id,
        institution_type,
        title,
        description: isK12 ? null : description,
        price: isK12 ? null : Number(price),
        target_year: isK12 ? null : targetYear,
        grade_level: isK12 ? gradeLevel : null,
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
        <p className="text-sm text-neutral-500">Verifying workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <GlassCard className="p-6 md:p-8">
        <div className="mb-8 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white font-serif">
            {isK12 ? 'Create K-12 Subject' : 'Create University Course'}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {isK12 ? 'Add a new subject for your students.' : 'Set up a new college course offering.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isK12 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Subject Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mathematics, Science"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div>
                <Select
                  label="Grade Level"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  options={[
                    { value: 'Grade 1', label: '1st Grade' },
                    { value: 'Grade 2', label: '2nd Grade' },
                    { value: 'Grade 3', label: '3rd Grade' },
                    { value: 'Grade 4', label: '4th Grade' },
                    { value: 'Grade 5', label: '5th Grade' },
                    { value: 'Grade 6', label: '6th Grade' },
                    { value: 'Grade 7', label: '7th Grade' },
                    { value: 'Grade 8', label: '8th Grade' },
                    { value: 'Grade 9', label: '9th Grade' },
                    { value: 'Grade 10', label: '10th Grade' },
                    { value: 'Grade 11', label: '11th Grade' },
                    { value: 'Grade 12', label: '12th Grade' },
                  ]}
                />
              </div>
            </>
          )}

          {isUni && (
            <>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Course Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Intro to Computer Science"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Comprehensive overview of the course..."
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 resize-y"
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
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  />
                </div>
              </div>
            </>
          )}

          {(!isK12 && !isUni && user?.role === 'admin') && (
            <div className="p-4 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              Admin View: Admins can manage courses via the main Admin Dashboard instead.
            </div>
          )}

          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={loading || (!isK12 && !isUni)}
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
