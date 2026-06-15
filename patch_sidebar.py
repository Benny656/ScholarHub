import sys
import re

with open('src/components/layout/Sidebar.tsx', 'r') as f:
    code = f.read()

# 1. Remove allRoles import
code = code.replace("import { Role, allRoles } from '../../lib/mockData';\n", "")

# 2. Update interface
old_interface = '''interface SidebarProps {
  activeRole: Role;
  onChangeRole: (roleId: Role["id"]) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  onLogoClick?: () => void;
}'''

new_interface = '''interface SidebarProps {
  activeRole: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  onLogoClick?: () => void;
}'''

code = code.replace(old_interface, new_interface)

# 3. Update component signature
old_sig = '''export default function Sidebar({
  activeRole,
  onChangeRole,
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  onLogoClick,
}: SidebarProps) {'''

new_sig = '''export default function Sidebar({
  activeRole,
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  onLogoClick,
}: SidebarProps) {'''

code = code.replace(old_sig, new_sig)

# 4. Remove Persona Switcher UI
switcher_ui = '''        {/* Unified Fast Role Switcher */}
        <div className="p-3 bg-neutral-100/50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200/50 dark:border-neutral-800 space-y-2">
          <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
            Reviewer Persona Switcher
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {allRoles.map((role) => {
              const isSelected = activeRole.id === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => onChangeRole(role.id)}
                  className={`px-2 py-1.5 text-[11px] font-medium rounded-lg text-left truncate transition-all duration-150 ${
                    isSelected
                      ? "bg-brand-primary text-white shadow-sm"
                      : "bg-white hover:bg-neutral-200/50 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  }`}
                >
                  {role.id === "student_school" ? "Student (School)" : role.id === "student_college" ? "Student (College)" : role.name.split(" ")[1] || role.name}
                </button>
              );
            })}
          </div>
        </div>

'''

code = code.replace(switcher_ui, "")

with open('src/components/layout/Sidebar.tsx', 'w') as f:
    f.write(code)

print('Sidebar patched')
