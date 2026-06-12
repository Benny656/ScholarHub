import React, { useState } from "react";
import { BarChart3, TrendingUp, Users, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsWidgets() {
  const [activeSegment, setActiveSegment] = useState<number | null>(null);

  // ARR Month metrics
  const monthlyARR = [
    { month: "Jan", revenue: 210, users: 120 },
    { month: "Feb", revenue: 240, users: 145 },
    { month: "Mar", revenue: 275, users: 160 },
    { month: "Apr", revenue: 290, users: 172 },
    { month: "May", revenue: 325, users: 198 },
    { month: "Jun", revenue: 340, users: 214 }, // current
  ];

  // Weekly Active registrations by role
  const rolesDistribution = [
    { day: "Mon", school: 4200, college: 6800, teachers: 740 },
    { day: "Tue", school: 4900, college: 7200, teachers: 810 },
    { day: "Wed", school: 5100, college: 7500, teachers: 840 },
    { day: "Thu", school: 4800, college: 7100, teachers: 790 },
    { day: "Fri", school: 3900, college: 6400, teachers: 680 },
  ];

  // SVG dimensions for ARR Area Chart
  const svgWidth = 500;
  const svgHeight = 200;
  const padding = 35;

  // Compute coordinates for Area Path
  const maxRev = 400; // grid limit
  const getX = (index: number) => padding + (index * (svgWidth - padding * 2)) / (monthlyARR.length - 1);
  const getY = (value: number) => svgHeight - padding - (value * (svgHeight - padding * 2)) / maxRev;

  // Generate Area points
  const points = monthlyARR.map((item, id) => `${getX(id)},${getY(item.revenue)}`).join(" ");
  const areaPath = `${points} ${getX(monthlyARR.length - 1)},${svgHeight - padding} ${getX(0)},${svgHeight - padding} Z`;
  const linePath = points;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* License Subscription revenue chart (ARR) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-slate-200 rounded-3xl p-6 dark:bg-neutral-900 dark:border-neutral-800 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-primary">
              Financial telemetry
            </span>
            <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-primary" />
              <span>SaaS License ARR Velocity</span>
            </h3>
          </div>
          <div className="text-right">
            <p className="text-lg font-sans font-bold text-emerald-600 dark:text-emerald-400">
              $3.4M Consolidated
            </p>
            <p className="text-[10px] text-neutral-400 font-medium">
              +18.2% annual growth index
            </p>
          </div>
        </div>

        {/* Custom SVG Graph */}
        <div className="relative w-full overflow-hidden">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 100, 200, 300, 400].map((v) => {
              const y = getY(v);
              return (
                <g key={v}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={svgWidth - padding}
                    y2={y}
                    stroke="#eaeaea"
                    strokeDasharray="4 4"
                    className="dark:stroke-neutral-800"
                  />
                  <text
                    x={padding - 5}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="9"
                    fill="#9c9c9c"
                    className="font-mono"
                  >
                    ${v}k
                  </text>
                </g>
              );
            })}

            {/* Area under the line */}
            <polyline fill="url(#areaGrad)" points={areaPath} />

            {/* Smooth connecting line */}
            <polyline
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2.5"
              points={linePath}
            />

            {/* Graph Data Dots */}
            {monthlyARR.map((item, index) => {
              const cx = getX(index);
              const cy = getY(item.revenue);
              const isHovered = activeSegment === index;

              return (
                <g
                  key={item.month}
                  onMouseEnter={() => setActiveSegment(index)}
                  onMouseLeave={() => setActiveSegment(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 6 : 4}
                    fill={isHovered ? "#7c3aed" : "#4f46e5"}
                    stroke="#fff"
                    strokeWidth="1.5"
                    className="transition-all"
                  />
                  {isHovered && (
                    <g>
                      <rect
                        x={cx - 45}
                        y={cy - 35}
                        width="90"
                        height="22"
                        rx="4"
                        fill="#1a1a1a"
                      />
                      <text
                        x={cx}
                        y={cy - 21}
                        fill="#fff"
                        fontSize="9"
                        textAnchor="middle"
                        className="font-bold font-mono"
                      >
                        ARR ${item.revenue}k
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* X-Axis labels */}
            {monthlyARR.map((item, index) => (
              <text
                key={item.month}
                x={getX(index)}
                y={svgHeight - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#8c8c8c"
                className="font-medium"
              >
                {item.month}
              </text>
            ))}
          </svg>
        </div>
      </motion.div>

      {/* Weekly active platform usage workload */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white border border-slate-200 rounded-3xl p-6 dark:bg-neutral-900 dark:border-neutral-800 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-secondary">
              User registries workload
            </span>
            <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-secondary" />
              <span>Workload Velocity Metrics (DAU)</span>
            </h3>
          </div>
          <div className="flex gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-brand-primary rounded" />
              <label className="text-neutral-600 dark:text-neutral-300">College</label>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-brand-tertiary rounded" />
              <label className="text-neutral-600 dark:text-neutral-300">School</label>
            </span>
          </div>
        </div>

        {/* Dynamic workload presentation bars */}
        <div className="space-y-4 pt-2">
          {rolesDistribution.map((item) => {
            const totUsers = item.school + item.college;
            const percentage = Math.min(((totUsers) / 13000) * 100, 100);

            return (
              <div key={item.day} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-mono">
                  <span>{item.day}day Session Attendance</span>
                  <span className="text-neutral-500">{(totUsers).toLocaleString()} Active Users</span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-4 rounded-lg overflow-hidden flex">
                  <div
                    style={{ width: `${(item.college / (item.school + item.college)) * percentage}%` }}
                    className="bg-brand-primary h-full"
                    title={`College: ${item.college}`}
                  />
                  <div
                    style={{ width: `${(item.school / (item.school + item.college)) * percentage}%` }}
                    className="bg-brand-tertiary h-full border-l border-white/20"
                    title={`School: ${item.school}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
}
