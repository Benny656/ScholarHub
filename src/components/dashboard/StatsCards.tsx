import React from "react";
import { 
  Building, 
  Users, 
  Activity, 
  DollarSign, 
  Clock, 
  BookOpen, 
  CheckCircle,
  TrendingUp,
  Cpu
} from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardItem {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative";
  icon: React.ComponentType<any>;
  description?: string;
  accent: string;
}

interface StatsCardsProps {
  roleId: string;
  customStats?: StatsCardItem[]; // Option to pass custom ones
}

export default function StatsCards({ roleId, customStats }: StatsCardsProps) {
  
  const getStatsForRole = (): StatsCardItem[] => {
    if (customStats) return customStats;

    switch (roleId) {
      case "admin":
        return [
          {
            title: "Supervised Institutions",
            value: "2,842",
            change: "+12.4%",
            changeType: "positive",
            icon: Building,
            description: "Active high schools & universities",
            accent: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20"
          },
          {
            title: "Annual Recurring Revenue",
            value: "$3.4M",
            change: "+18.2%",
            changeType: "positive",
            icon: DollarSign,
            description: "SaaS licensing models",
            accent: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20"
          },
          {
            title: "Platform Active MAUs",
            value: "214.8K",
            change: "+31.5%",
            changeType: "positive",
            icon: Users,
            description: "Combined student-teacher registry",
            accent: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/20"
          },
          {
            title: "Main Frame Cluster Uptime",
            value: "99.98%",
            change: "Optimal",
            changeType: "positive",
            icon: Cpu,
            description: "Cloud SQL & Run load balances",
            accent: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20"
          },
        ];

      case "teacher":
        return [
          {
            title: "Direct Subject Students",
            value: "1,142",
            change: "+8.4%",
            changeType: "positive",
            icon: Users,
            description: "Across 4 active syllabus lectures",
            accent: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20"
          },
          {
            title: "Assignments Evaluated",
            value: "189 / 240",
            change: "78% Complete",
            changeType: "positive",
            icon: CheckCircle,
            description: "Target cycle for midterms complete",
            accent: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20"
          },
          {
            title: "Teaching Hours Registered",
            value: "38h / mo",
            change: "+4h",
            changeType: "positive",
            icon: Clock,
            description: "Synchronous laboratory tutorials",
            accent: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/20"
          },
          {
            title: "AI Grading Optimization",
            value: "100%",
            change: "Active",
            changeType: "positive",
            icon: Activity,
            description: "Gemini-3.5 feedback loop active",
            accent: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20"
          },
        ];

      default: // student (school / college)
        return [
          {
            title: "Active Courses Enrolled",
            value: roleId === "student_school" ? "5 Subjects" : "4 Core modules",
            change: "No delays",
            changeType: "positive",
            icon: BookOpen,
            description: "Spring Term, 2026",
            accent: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20"
          },
          {
            title: "Assignments Completed",
            value: "16 / 18",
            change: "88% ratio",
            changeType: "positive",
            icon: CheckCircle,
            description: "Highest scoring in logic assignments",
            accent: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20"
          },
          {
            title: "Cumulative GPA",
            value: roleId === "student_school" ? "3.91 Grade" : "3.84 Total",
            change: "Top 5%",
            changeType: "positive",
            icon: TrendingUp,
            description: "Verified academic transcripts",
            accent: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/20"
          },
          {
            title: "Lectures Attendance Grade",
            value: "96.4%",
            change: "Distinguished",
            changeType: "positive",
            icon: Clock,
            description: "Only 1 calendar session excused",
            accent: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20"
          },
        ];
    }
  };

  const currentStats = getStatsForRole();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {currentStats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.04 }}
            className="p-6 bg-white rounded-3xl border border-slate-200 flex flex-col justify-between dark:bg-neutral-900 dark:border-neutral-800 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest leading-none mb-2">
                  {stat.title}
                </p>
                <h3 className="font-sans text-2xl font-bold text-neutral-950 dark:text-neutral-50 tracking-tight">
                  {stat.value}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.accent}`}>
                <IconComponent className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-50 dark:border-neutral-800/60 flex items-center justify-between text-xs">
              <span className="text-neutral-500 dark:text-neutral-400 truncate max-w-[150px]">
                {stat.description}
              </span>
              {stat.change && (
                <span className={`font-semibold px-2 py-0.5 rounded ${
                  stat.changeType === "positive" 
                    ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/25" 
                    : "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/25"
                }`}>
                  {stat.change}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
