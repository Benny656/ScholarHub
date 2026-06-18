import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { GlassCard, Button, Select } from '../../components/ui/index';
import { BookOpen, RefreshCw, CheckCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminSubjectAssignment() {
  const [loading, setLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [teachers, setTeachers] = useState<{ id: string; full_name: string }[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Grade 9');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'teacher')
          .eq('institution', 'k12');

        if (error) throw error;
        setTeachers((data || []).map((t: any) => ({ id: t.id, full_name: t.full_name || '' })));
      } catch (err) {
        console.error('Failed to fetch K-12 teachers:', err);
        toast.error('Could not load teachers.');
      } finally {
        setTeachersLoading(false);
      }
    }
    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Subject Name is required.');
      return;
    }
    if (!selectedTeacherId) {
      toast.error('Please select a teacher.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title,
        teacher_id: selectedTeacherId,
        instructor_id: selectedTeacherId, // Some old tables use instructor_id
        grade_level: gradeLevel,
        institution_type: 'k12',
      };

      const { error } = await supabase
        .from('courses')
        .insert(payload);

      if (error) throw error;

      toast.success('Subject assigned successfully! 🎉');
      setTitle('');
      setSelectedTeacherId('');
    } catch (error: any) {
      console.error('Subject Assignment Error:', error);
      toast.error(error.message || 'Failed to assign subject.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <GlassCard className="p-6 md:p-8">
        <div className="mb-8 border-b border-neutral-200 dark:border-neutral-800 pb-4 flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <BookOpen className="text-brand-primary" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white font-serif">
              Assign K-12 Subject
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Create a new subject and assign it directly to a K-12 Teacher.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Assign Teacher <span className="text-red-500">*</span></label>
              {teachersLoading ? (
                <div className="flex items-center gap-2 px-4 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                  <RefreshCw className="animate-spin text-neutral-400" size={16} />
                  <span className="text-sm text-neutral-500">Loading teachers...</span>
                </div>
              ) : (
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                  <option value="" disabled>Select a K-12 Teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name || 'Unnamed Teacher'}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={loading || teachersLoading || !selectedTeacherId}
              icon={loading ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              className="w-full sm:w-auto px-8"
            >
              {loading ? 'Assigning...' : 'Assign Subject'}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
