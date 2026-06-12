import React from "react";
import { CheckSquare, Calendar, ChevronRight, FileText, Sparkles, Plus } from "lucide-react";
import { Assignment } from "../../lib/mockData";
import { motion } from "framer-motion";

interface AssignmentCardsProps {
  assignments: Assignment[];
  roleId: string;
  onOpenSubmissionModal?: (assignment: Assignment) => void;
  onOpenCheckModal?: (assignment: Assignment) => void;
  onGradeWithAI?: (assignment: Assignment) => void;
}

export default function AssignmentCards({
  assignments,
  roleId,
  onOpenSubmissionModal,
  onOpenCheckModal,
  onGradeWithAI,
}: AssignmentCardsProps) {
  
  const isTeacher = roleId === "teacher";

  const getStatusBadge = (status: Assignment["status"]) => {
    switch (status) {
      case "completed":
        return <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-2.5 py-1 rounded-md text-[11px] font-bold">Passed</span>;
      case "in_review":
        return <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 px-2.5 py-1 rounded-md text-[11px] font-bold">In Review</span>;
      case "in_progress":
        return <span className="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 px-2.5 py-1 rounded-md text-[11px] font-bold">Working</span>;
      default:
        return <span className="bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 px-2.5 py-1 rounded-md text-[11px] font-bold">Not Started</span>;
    }
  };

  return (
    <div className="space-y-4">
      {assignments.map((assignment, index) => (
        <motion.div
          key={assignment.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: index * 0.04 }}
          className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 dark:bg-neutral-900 dark:border-neutral-800 hover:border-indigo-400 dark:hover:border-indigo-650 transition-all duration-200 shadow-sm"
        >
          {/* Info Section */}
          <div className="flex gap-4 items-start">
            <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-brand-secondary" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                  {assignment.courseTitle}
                </span>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {assignment.type}
                </span>
              </div>
              
              <h4 className="font-serif font-bold text-neutral-900 text-base dark:text-neutral-50">
                {assignment.title}
              </h4>

              {isTeacher && assignment.studentName && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Submitted by: <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">{assignment.studentName}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Status & Action Controllers */}
          <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-3 md:pt-0 border-neutral-100 dark:border-neutral-800">
            
            {/* Due date or grading outcome info */}
            <div className="text-left md:text-right">
              {assignment.status === "completed" && assignment.score ? (
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block leading-none">Grade Report</span>
                  <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    A ({assignment.score}%) • GPA {assignment.gpaRating || "4.0"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{assignment.dueDate}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Context status pill badge */}
              {getStatusBadge(assignment.status)}

              {/* Action contextual trigger */}
              {isTeacher ? (
                assignment.status === "in_review" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onGradeWithAI?.(assignment)}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:hover:bg-purple-950/60 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Copilot Grade</span>
                    </button>
                    
                    <button
                      onClick={() => onOpenCheckModal?.(assignment)}
                      className="px-3 py-1.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 rounded-lg text-xs font-semibold"
                    >
                      Evaluate
                    </button>
                  </div>
                )
              ) : (
                // Students view submissions
                (assignment.status === "not_started" || assignment.status === "in_progress") && (
                  <button
                    onClick={() => onOpenSubmissionModal?.(assignment)}
                    className="px-3.5 py-2 bg-brand-primary text-white hover:bg-brand-primary-dark rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload Study Work</span>
                  </button>
                )
              )}
            </div>

          </div>
        </motion.div>
      ))}
    </div>
  );
}
