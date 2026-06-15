import sys
import re

with open('src/components/layout/MobileNavigation.tsx', 'r') as f:
    code = f.read()

# 1. Remove mockData import
code = code.replace("import { Role } from \"../../lib/mockData\";\n", "")

# 2. Update interface
old_interface = '''interface MobileNavigationProps {
  activeRole: Role;
  onChangeRole: (roleId: Role["id"]) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  menuItems: { id: string; label: string; icon: React.ComponentType<any> }[];
  notificationCount: number;
  onOpenNotifications: () => void;
  onLogoClick?: () => void;
}'''

new_interface = '''interface MobileNavigationProps {
  activeRole: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  menuItems: { id: string; label: string; icon: React.ComponentType<any> }[];
  notificationCount: number;
  onOpenNotifications: () => void;
  onLogoClick?: () => void;
}'''
code = code.replace(old_interface, new_interface)

# 3. Update component signature
old_sig = '''export default function MobileNavigation({
  activeRole,
  onChangeRole,
  activeTab,
  setActiveTab,'''

new_sig = '''export default function MobileNavigation({
  activeRole,
  activeTab,
  setActiveTab,'''
code = code.replace(old_sig, new_sig)

with open('src/components/layout/MobileNavigation.tsx', 'w') as f:
    f.write(code)

print('MobileNavigation patched')
