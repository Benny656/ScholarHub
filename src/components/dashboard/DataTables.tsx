import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  ExternalLink, 
  Lock, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle, 
  MoreVertical,
  Check,
  ChevronDown
} from "lucide-react";
import { SecurityEvent, initialSecurityEvents } from "../../lib/mockData";
import { motion } from "framer-motion";

interface DataTablesProps {
  roleId: string;
}

export default function DataTables({ roleId }: DataTablesProps) {
  const [secEvents, setSecEvents] = useState<SecurityEvent[]>(initialSecurityEvents);
  const [searchTerm, setSearchTerm] = useState("");

  const studentDirectory = [
    { name: "Alex Mercer", mail: "amercer@nexlearn.edu", level: "College Junior", gpa: "3.91", subjects: 4, compliance: "Verified" },
    { name: "Elena Rodriguez", mail: "erodriguez@nexlearn.edu", level: "College Senior", gpa: "3.84", subjects: 4, compliance: "Verified" },
    { name: "Marcus Thorne", mail: "mthorne@school.edu", level: "School Grade 11", gpa: "3.22", subjects: 5, compliance: "Pending" },
    { name: "Chloe Fraser", mail: "cfraser@college.edu", level: "College Freshman", gpa: "3.65", subjects: 4, compliance: "Verified" },
    { name: "Nathan Drake", mail: "ndrake@school.edu", level: "School Grade 11", gpa: "2.98", subjects: 5, compliance: "Suspended" },
  ];

  const institutionRoster = [
    { name: "Royal Academy of Science", country: "United Kingdom", license: "Enterprise-Max", activeUsers: "12,940", serverRegion: "eu-west2" },
    { name: "North-West Prep System", country: "United States", license: "Enterprise-Core", activeUsers: "8,240", serverRegion: "us-east1" },
    { name: "Munich Technical Lyceum", country: "Germany", license: "District-Wide", activeUsers: "14,880", serverRegion: "eu-central1" },
    { name: "Tokyo Science Center", country: "Japan", license: "Enterprise-Core", activeUsers: "4,650", serverRegion: "asia-northeast1" },
  ];

  const filteredStudents = studentDirectory.filter(std => 
    std.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    std.mail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* 1. ADMIN SHEETS: Security Auditing or Institutional billing directory */}
      {roleId === "admin" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Security Logging (2 Columns on large screen) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-2 bg-[#FFFCE1] rounded-3xl border border-[#E1DCC9]/20 p-6 dark:bg-[#412D15] dark:border-[#412D15] shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-serif font-bold text-base text-[#0e100f] dark:text-[#E1DCC9] flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-brand-primary" />
                  <span>Administrative Security & Access Logs</span>
                </h4>
                <p className="text-xs text-[#7c7c6f]">Real-time intrusion tracking & system checkpoints</p>
              </div>
              
              <button 
                onClick={() => setSecEvents(initialSecurityEvents)}
                className="text-xs text-brand-primary hover:underline font-semibold"
              >
                Clear Filters
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E1DCC9]/20 dark:border-[#412D15] text-[#7c7c6f] font-extrabold uppercase tracking-widest bg-[#FFFCE1]/50 dark:bg-[#412D15]/20">
                    <th className="p-3">Audit Event Details</th>
                    <th className="p-3">Client IP Address</th>
                    <th className="p-3">Physical Region</th>
                    <th className="p-3">Timestamps</th>
                    <th className="p-3 text-right">Integrity Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {secEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-[#FFFCE1]/50 dark:hover:bg-[#412D15]/30 transition-all font-mono">
                      <td className="p-3 font-sans font-bold text-[#0e100f] dark:text-neutral-200">
                        {evt.event}
                      </td>
                      <td className="p-3 text-[#7c7c6f] dark:text-[#7c7c6f]">{evt.ip}</td>
                      <td className="p-3 text-[#7c7c6f] dark:text-[#7c7c6f] font-sans">{evt.location}</td>
                      <td className="p-3 text-[#7c7c6f]">{evt.time}</td>
                      <td className="p-3 text-right font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          evt.type === "alert" 
                            ? "bg-red-500 text-red-500 dark:bg-red-500/20 dark:text-red-500"
                            : evt.type === "warning"
                            ? "bg-amber-500 text-amber-500 dark:bg-amber-500/20 dark:text-amber-500"
                            : "bg-[#00bae2] text-brand-primary dark:bg-[#00bae2]/20 dark:text-[#00bae2]"
                        }`}>
                          {evt.type.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Institutional Licensing table */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#FFFCE1] rounded-3xl border border-[#E1DCC9]/20 p-6 dark:bg-[#412D15] dark:border-[#412D15] shadow-sm"
          >
            <div className="mb-4">
              <h4 className="font-serif font-bold text-base text-[#0e100f] dark:text-[#E1DCC9]">
                School Districts & License keys
              </h4>
              <p className="text-xs text-[#7c7c6f]">Active multi-institution seats licenses</p>
            </div>

            <div className="space-y-4">
              {institutionRoster.map((inst) => (
                <div key={inst.name} className="p-3.5 bg-[#FFFCE1]/50 dark:bg-[#412D15]/30 border border-[#E1DCC9]/50 dark:border-[#412D15]/50 rounded-xl space-y-1">
                  <div className="flex justify-between items-start">
                    <h5 className="text-xs font-bold text-[#0e100f] dark:text-neutral-200">{inst.name}</h5>
                    <span className="text-[9px] uppercase font-bold text-brand-primary tracking-wider">{inst.license}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#7c7c6f] font-mono">
                    <span>Active seats: {inst.activeUsers}</span>
                    <span className="capitalize">{inst.serverRegion}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      )}

      {/* 2. TEACHERS / EDUCATOR WORKSPACE: Student Gradebook directory */}
      {(roleId === "teacher" || roleId === "student_school" || roleId === "student_college") && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFFCE1] rounded-3xl border border-[#E1DCC9]/20 p-6 dark:bg-[#412D15] dark:border-[#412D15] shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="font-serif font-bold text-base text-[#0e100f] dark:text-[#E1DCC9] flex items-center gap-1.5">
                <Users className="w-5 h-5 text-brand-secondary" />
                <span>ScholarHub Academic Roster & Transcripts</span>
              </h4>
              <p className="text-xs text-[#7c7c6f]">Supervisory gradebook, GPA indexes, and compliance checks</p>
            </div>

            {/* Local filtering */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-[#7c7c6f]" />
                </span>
                <input
                  type="text"
                  placeholder="Roster search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 rounded-lg text-xs bg-[#FFFCE1] border border-[#E1DCC9]/20 focus:outline-none dark:bg-[#412D15] dark:border-[#412D15] dark:text-neutral-200"
                />
              </div>

              <button className="flex items-center gap-1.5 border border-[#E1DCC9]/20 dark:border-[#412D15] rounded-lg px-3 py-1.5 text-xs text-[#7c7c6f] dark:text-[#7c7c6f] bg-[#FFFCE1]/50 dark:bg-[#412D15]/30 font-semibold">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E1DCC9]/20 dark:border-[#412D15] text-[#7c7c6f] font-extrabold uppercase tracking-widest bg-[#FFFCE1]/50 dark:bg-[#412D15]/20">
                  <th className="p-3">Scholar Name</th>
                  <th className="p-3">Authorized Mail</th>
                  <th className="p-3">Grade Tier</th>
                  <th className="p-3">Active Subjects</th>
                  <th className="p-3">Cumulative GPA</th>
                  <th className="p-3 text-right">Access Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {filteredStudents.map((std) => (
                  <tr key={std.name} className="hover:bg-[#FFFCE1]/50 dark:hover:bg-[#412D15]/30 transition-all">
                    <td className="p-3 font-bold text-[#0e100f] dark:text-neutral-200 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#FFFCE1] dark:bg-[#412D15] flex items-center justify-center font-serif text-[11px] text-brand-primary border border-brand-primary/25">
                        {std.name.charAt(0)}
                      </span>
                      <span>{std.name}</span>
                    </td>
                    <td className="p-3 text-[#7c7c6f] dark:text-[#7c7c6f] font-mono">{std.mail}</td>
                    <td className="p-3 text-[#7c7c6f] dark:text-[#7c7c6f]">{std.level}</td>
                    <td className="p-3 text-[#7c7c6f] dark:text-[#7c7c6f] font-mono font-semibold">{std.subjects} Coursework</td>
                    <td className="p-3 text-[#0e100f] dark:text-neutral-200 mt-2">
                      <span className="font-mono font-bold text-[#00bae2] dark:text-[#00bae2] bg-[#00bae2] dark:bg-[#00bae2]/20 px-2 py-0.5 rounded">
                        {std.gpa} GPA
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        std.compliance === "Verified"
                          ? "bg-[#00bae2] text-[#00bae2] dark:bg-[#00bae2]/25 dark:text-[#00bae2]"
                          : std.compliance === "Pending"
                          ? "bg-amber-500 text-amber-500 dark:bg-amber-500/25 dark:text-amber-500"
                          : "bg-red-500 text-red-500 dark:bg-red-500/25 dark:text-red-500"
                      }`}>
                        {std.compliance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

    </div>
  );
}
