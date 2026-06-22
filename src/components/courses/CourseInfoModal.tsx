import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CourseDetailsRow, CourseRow } from '../../types/database';
import { GlassCard, Button } from '../ui/index';
import { useAuth } from '../../context/AuthContext';
import { Edit2, X, Clock, BarChart, FileText, CheckCircle, Image as ImageIcon, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

interface CourseInfoModalProps {
  course: CourseRow & { users?: { name?: string; full_name?: string; avatar_url?: string } | null };
  isOpen: boolean;
  onClose: () => void;
}

export function CourseInfoModal({ course, isOpen, onClose }: CourseInfoModalProps) {
  const { user } = useAuth();
  const [details, setDetails] = useState<CourseDetailsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    course_description: '',
    course_objectives: '',
    course_duration: '',
    course_level: '',
    prerequisites: '',
    course_thumbnail: ''
  });

  const canEdit = user?.role === 'admin' || (user?.role === 'teacher' && course.instructor_id === user?.id && course.institution_type !== 'k12');

  useEffect(() => {
    if (isOpen && course) {
      fetchDetails();
    }
  }, [isOpen, course]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('course_details')
        .select('*')
        .eq('course_id', course.id)
        .maybeSingle() as any;

      if (error) {
        console.error('Failed to load course details:', error);
      } else if (data) {
        setDetails(data);
        setFormData({
          course_description: data.course_description || '',
          course_objectives: data.course_objectives || '',
          course_duration: data.course_duration || '',
          course_level: data.course_level || '',
          prerequisites: data.prerequisites || '',
          course_thumbnail: data.course_thumbnail || ''
        });
      } else {
        setDetails(null);
      }
    } catch (err) {
      console.error('Unexpected error loading details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        course_id: course.id,
        ...formData
      };

      if (details?.id) {
        // Update
        const { error } = await supabase
          .from<any, any>('course_details')
          .update(payload)
          .eq('id', details.id);
        if (error) throw error;
        toast.success('Course details updated');
      } else {
        const { error } = await supabase
          .from<any, any>('course_details')
          .insert([payload]);
        if (error) throw error;
        toast.success('Course details created');
      }
      setIsEditing(false);
      await fetchDetails();
    } catch (err: any) {
      console.error('Error saving details:', err);
      toast.error('Failed to save course details');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F150C]/50 backdrop-blur-sm">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#7c7c6f] hover:bg-[#FFFCE1] dark:hover:bg-[#412D15] rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <div className="flex items-start justify-between mb-6 pr-8">
            <div>
              <h2 className="text-2xl font-bold text-[#0e100f] dark:text-[#E1DCC9] mb-2 font-serif">
                {course.title}
              </h2>
              <div className="flex items-center gap-2 text-[#7c7c6f] dark:text-[#7c7c6f]">
                <span className="text-sm">Instructor: {course.users?.full_name || course.users?.name || 'Unassigned'}</span>
              </div>
            </div>
            {canEdit && !isEditing && (
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 size={16} className="mr-2" /> Edit Details
              </Button>
            )}
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#7c7c6f] dark:text-[#7c7c6f] mb-1">Description</label>
                <textarea 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-[#412D15] dark:border-slate-700 dark:text-[#E1DCC9]"
                  rows={3}
                  value={formData.course_description}
                  onChange={e => setFormData({...formData, course_description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#7c7c6f] dark:text-[#7c7c6f] mb-1">Duration</label>
                  <input 
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-[#412D15] dark:border-slate-700 dark:text-[#E1DCC9]"
                    placeholder="e.g. 10 weeks"
                    value={formData.course_duration}
                    onChange={e => setFormData({...formData, course_duration: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7c7c6f] dark:text-[#7c7c6f] mb-1">Level</label>
                  <input 
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-[#412D15] dark:border-slate-700 dark:text-[#E1DCC9]"
                    placeholder="e.g. Intermediate"
                    value={formData.course_level}
                    onChange={e => setFormData({...formData, course_level: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7c7c6f] dark:text-[#7c7c6f] mb-1">Objectives</label>
                <textarea 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-[#412D15] dark:border-slate-700 dark:text-[#E1DCC9]"
                  rows={2}
                  value={formData.course_objectives}
                  onChange={e => setFormData({...formData, course_objectives: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7c7c6f] dark:text-[#7c7c6f] mb-1">Prerequisites</label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-[#412D15] dark:border-slate-700 dark:text-[#E1DCC9]"
                  value={formData.prerequisites}
                  onChange={e => setFormData({...formData, prerequisites: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</Button>
                <Button variant="primary" onClick={handleSave} loading={saving}>Save Changes</Button>
              </div>
            </div>
          ) : !details ? (
            <div className="py-12 text-center bg-[#FFFCE1] dark:bg-[#412D15]/50 rounded-xl border border-dashed border-[#E1DCC9]/20 dark:border-slate-700">
              <BookOpen className="w-12 h-12 text-[#7c7c6f] mx-auto mb-3" />
              <p className="text-[#7c7c6f] dark:text-[#7c7c6f]">Course information has not been added yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {details.course_thumbnail && (
                <div className="w-full h-48 rounded-xl overflow-hidden bg-[#FFFCE1] dark:bg-[#412D15] flex items-center justify-center">
                  <img src={details.course_thumbnail} alt={course.title || 'Course'} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#FFFCE1] dark:bg-[#412D15]/50 rounded-xl border border-[#E1DCC9]/20 dark:border-slate-700 flex items-start gap-3">
                  <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#7c7c6f] dark:text-[#7c7c6f]">Duration</p>
                    <p className="text-[#0e100f] dark:text-[#E1DCC9] font-medium">{details.course_duration || 'N/A'}</p>
                  </div>
                </div>
                <div className="p-4 bg-[#FFFCE1] dark:bg-[#412D15]/50 rounded-xl border border-[#E1DCC9]/20 dark:border-slate-700 flex items-start gap-3">
                  <div className="p-2 bg-[#9d95ff]/10 rounded-lg text-[#9d95ff]">
                    <BarChart size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#7c7c6f] dark:text-[#7c7c6f]">Level</p>
                    <p className="text-[#0e100f] dark:text-[#E1DCC9] font-medium">{details.course_level || course.level || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {details.course_description && (
                <div>
                  <h3 className="text-lg font-semibold text-[#0e100f] dark:text-[#E1DCC9] mb-2 flex items-center gap-2">
                    <FileText size={18} className="text-brand-primary" />
                    Description
                  </h3>
                  <p className="text-[#7c7c6f] dark:text-[#7c7c6f] leading-relaxed text-sm whitespace-pre-wrap">
                    {details.course_description}
                  </p>
                </div>
              )}

              {details.course_objectives && (
                <div>
                  <h3 className="text-lg font-semibold text-[#0e100f] dark:text-[#E1DCC9] mb-2 flex items-center gap-2">
                    <CheckCircle size={18} className="text-[#00bae2]" />
                    Objectives
                  </h3>
                  <p className="text-[#7c7c6f] dark:text-[#7c7c6f] leading-relaxed text-sm whitespace-pre-wrap">
                    {details.course_objectives}
                  </p>
                </div>
              )}

              {details.prerequisites && (
                <div className="p-4 bg-amber-500 dark:bg-amber-500/10 rounded-xl border border-amber-500 dark:border-amber-500/30">
                  <h3 className="text-sm font-semibold text-amber-500 dark:text-amber-500 mb-1">Prerequisites</h3>
                  <p className="text-sm text-amber-500 dark:text-amber-500">{details.prerequisites}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
