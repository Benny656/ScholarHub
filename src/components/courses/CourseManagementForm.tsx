import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button, GlassCard, Select } from '../ui/index';
import { Plus, X, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export function CourseManagementForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [outcomes, setOutcomes] = useState<string[]>(['']);

  const categories = [
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'Literature', label: 'Literature' },
    { value: 'General Sciences', label: 'General Sciences' },
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Design', label: 'Design' }
  ];

  const handleAddOutcome = () => {
    setOutcomes([...outcomes, '']);
  };

  const handleOutcomeChange = (index: number, value: string) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = value;
    setOutcomes(newOutcomes);
  };

  const handleRemoveOutcome = (index: number) => {
    if (outcomes.length > 1) {
      setOutcomes(outcomes.filter((_, i) => i !== index));
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Computer Science');
    setOutcomes(['']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Title and Description are required.');
      return;
    }
    if (!user) {
      toast.error('You must be logged in to create a course.');
      return;
    }

    setLoading(true);
    try {
      // Filter out empty outcomes before saving
      const validOutcomes = outcomes.filter(o => o.trim() !== '');

      const { error } = await supabase.from('courses').insert({
        title,
        description,
        category,
        learning_outcomes: validOutcomes,
        instructor_id: user.id
      } as any);

      if (error) throw error;

      toast.success('Course created successfully! 🚀');
      resetForm();
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast.error(error.message || 'Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="max-w-3xl mx-auto p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-serif">Create New Course</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Course Management - Section 3</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Course Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Introduction to Quantum Computing"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Course Description <span className="text-red-500">*</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            placeholder="Provide a comprehensive overview of what the course covers..."
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-shadow resize-y"
          />
        </div>

        <div>
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categories}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">Learning Outcomes</label>
            <button
              type="button"
              onClick={handleAddOutcome}
              className="text-xs font-semibold text-brand-primary hover:text-brand-primary/80 flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={14} /> Add Outcome
            </button>
          </div>
          
          <div className="space-y-3">
            {outcomes.map((outcome, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={outcome}
                    onChange={(e) => handleOutcomeChange(index, e.target.value)}
                    placeholder={`Outcome ${index + 1}`}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-primary transition-colors text-sm"
                  />
                </div>
                {outcomes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOutcome(index)}
                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                    title="Remove outcome"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            icon={loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            className="w-full sm:w-auto px-8"
          >
            {loading ? 'Creating Course...' : 'Create Course'}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
