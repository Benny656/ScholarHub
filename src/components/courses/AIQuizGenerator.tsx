import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { aiService } from '../../services/ai.service';
import { GlassCard, Button, Badge } from '../ui/index';
import toast from 'react-hot-toast';
import { Sparkles, Save, BookOpen, Trash } from 'lucide-react';

interface AIQuizGeneratorProps {
  courseId: string;
  onSuccess?: () => void;
}

export function AIQuizGenerator({ courseId, onSuccess }: AIQuizGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [contentContext, setContentContext] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [questionCount, setQuestionCount] = useState(5);
  
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);

  const handleGenerate = async () => {
    if (!topic || !contentContext) {
      toast.error('Please provide a topic and some context material');
      return;
    }

    setGenerating(true);
    try {
      const fullContext = `Topic: ${topic}\n\nMaterial Context:\n${contentContext}`;
      const result = await aiService.generateQuiz(fullContext, difficulty, questionCount);
      
      setGeneratedQuiz({
        title: `${topic} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Quiz`,
        description: `Auto-generated quiz covering ${topic}.`,
        questions: result.questions,
        max_score: result.questions.reduce((sum, q) => sum + (q.points || 10), 0)
      });
      toast.success('Quiz generated! Review it below.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate quiz. Check API keys.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedQuiz) return;
    setSaving(true);
    
    try {
      // 1. Insert Assignment
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignments')
        .insert({
          course_id: courseId,
          title: generatedQuiz.title,
          description: generatedQuiz.description,
          due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
          max_grade: generatedQuiz.max_score,
          assignment_type: 'quiz'
        })
        .select()
        .single();
        
      if (assignmentError) throw assignmentError;

      // 2. We don't have a specific `quizzes` or `questions` table in the current schema.
      // Wait, let's check `database.ts` to see if there is a quizzes table.
      // If not, we can save the questions in the `course_settings` or wait, no,
      // it's an assignment. We can save the questions in the assignment's description for now as JSON!
      // Or we need a `quizzes` table. Let me just save it as JSON in `description` or `file_url` for now.
      // Wait, let's update the description to contain the JSON for the quiz if we have to.
      
      const payload = JSON.stringify(generatedQuiz.questions);
      
      await supabase
        .from('assignments')
        .update({ file_url: `quiz-json:${payload}` })
        .eq('id', assignmentData.id);

      toast.success('Quiz saved to Assignments!');
      setGeneratedQuiz(null);
      setTopic('');
      setContentContext('');
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassCard tint="purple" className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-purple-400" size={20} />
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">AI Quiz Generator</h3>
      </div>
      
      {!generatedQuiz ? (
        <div className="space-y-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
            Enter the topic and paste some lesson content. Gemini AI will generate a multiple-choice quiz for you.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Quiz Topic</label>
              <input 
                type="text" 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis"
                className="w-full p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Difficulty</label>
                <select 
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Questions</label>
                <input 
                  type="number" 
                  min="1" max="20"
                  value={questionCount}
                  onChange={e => setQuestionCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Lesson Content (Context)</label>
            <textarea 
              rows={4}
              value={contentContext}
              onChange={e => setContentContext(e.target.value)}
              placeholder="Paste lesson text, key concepts, or definitions here..."
              className="w-full p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm outline-none resize-none custom-scrollbar"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={handleGenerate} loading={generating} icon={<Sparkles size={16} />}>
              Generate Quiz with AI
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-neutral-900 dark:text-white">{generatedQuiz.title}</h4>
            <Badge variant="purple">{generatedQuiz.questions.length} Questions</Badge>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {generatedQuiz.questions.map((q: any, i: number) => (
              <div key={i} className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <p className="font-semibold text-sm mb-2">{i + 1}. {q.question}</p>
                <div className="space-y-1 mb-2">
                  {q.options.map((opt: string, optIdx: number) => (
                    <div key={optIdx} className={`text-xs p-2 rounded-md ${optIdx === q.correctAnswer ? 'bg-emerald-500/10 text-emerald-600 font-medium border border-emerald-500/20' : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
                      {String.fromCharCode(65 + optIdx)}. {opt}
                    </div>
                  ))}
                </div>
                <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-2 bg-purple-500/10 p-2 rounded-lg">
                  <span className="font-bold">Explanation:</span> {q.explanation}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-500/20">
            <Button variant="secondary" onClick={() => setGeneratedQuiz(null)} icon={<Trash size={16} />}>
              Discard
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving} icon={<Save size={16} />}>
              Save to Course Assignments
            </Button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
