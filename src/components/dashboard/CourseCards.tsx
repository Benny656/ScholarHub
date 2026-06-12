import React from "react";
import { BookOpen, User, Users, Play, ArrowRight, BarChart } from "lucide-react";
import { Course } from "../../lib/mockData";
import { motion } from "framer-motion";

interface CourseCardsProps {
  courses: Course[];
  roleId: string;
  onJoinLecture: (course: Course) => void;
  onSelectCourse?: (course: Course) => void;
}

export default function CourseCards({
  courses,
  roleId,
  onJoinLecture,
  onSelectCourse,
}: CourseCardsProps) {
  
  const isTeacher = roleId === "teacher";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course, index) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ y: -4 }}
          className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between dark:bg-neutral-900 dark:border-neutral-800 shadow-sm"
        >
          <div>
            {/* Header / Category Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] tracking-wider uppercase font-extrabold text-brand-secondary bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 px-2.5 py-1 rounded">
                {course.code}
              </span>
              <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                {course.category}
              </span>
            </div>

            {/* Course Title */}
            <h3 className="font-serif text-lg font-bold text-neutral-900 leading-snug mb-1 dark:text-neutral-50 hover:text-brand-primary cursor-pointer"
                onClick={() => onSelectCourse?.(course)}>
              {course.title}
            </h3>

            {/* Instructor / Student Count */}
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-5 dark:text-neutral-400 mt-2">
              {isTeacher ? (
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-neutral-400" />
                  <span><strong className="text-neutral-700 dark:text-neutral-300 font-semibold">{course.studentsCount}</strong> Active Students Enrolled</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{course.instructor}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Progress Bar (Student focus) or Activity Level (Teacher focus) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                <span>{isTeacher ? "Curriculum Completion" : "My Progress"}</span>
                <span>{course.progress}%</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${course.progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="bg-brand-primary h-full rounded-full"
                />
              </div>
            </div>

            {/* Action buttons bar */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-3">
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                <span className="block text-neutral-400 text-[9px] uppercase font-bold">Session</span>
                <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[140px] block">{course.nextSchedule}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onJoinLecture(course)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/60 font-semibold text-xs flex items-center gap-1 transition-all duration-150"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Join</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => onSelectCourse?.(course)}
                  aria-label="View Details"
                  className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
