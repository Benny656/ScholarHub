import sys
import re

with open('src/layouts/V2DashboardLayout.tsx', 'r') as f:
    code = f.read()

# 1. Remove allRoles import
code = code.replace("import { allRoles } from '../lib/mockData';\n", "")

# 2. Replace activeRole mapping
old_active_role = '''  // Map real user to V2 role object for UI rendering
  let roleId = user.role as string;
  if (roleId === 'student') roleId = 'student_college';
  
  // Custom user mapped to V2 Role interface
  const activeRole = allRoles.find(r => r.id === roleId) || {
    id: roleId,
    name: user.name,
    badge: user.role.toUpperCase(),
    avatar: user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name)
  };'''

new_active_role = '''  // Custom user mapped to V2 Role interface
  const activeRole = {
    id: user.role === 'teacher' 
      ? (user.teacherTrack === 'k12' ? 'k12-teacher' : 'teacher')
      : user.role === 'student' 
        ? (user.gradeLevel === 'k12' ? 'school-student' : 'unistudents')
        : 'admin',
    name: user.name,
    badge: user.role === 'teacher' ? (user.teacherTrack === 'k12' ? 'K-12 TEACHER' : 'COLLEGE TEACHER') :
           user.role === 'student' ? (user.gradeLevel === 'k12' ? 'SCHOOL STUDENT' : 'UNIVERSITY STUDENT') : 'ADMIN',
    avatar: user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name),
    roleType: user.role
  };'''

code = code.replace(old_active_role, new_active_role)

# 3. Replace basePath routing logic
old_base_path = '''      // Navigate based on user role base path
      let basePath = '';
      if (user.role === 'admin') basePath = '/admin';
      else if (user.role === 'teacher') basePath = '/teacher';
      else if (user.role === 'student') basePath = '/unistudents';'''

new_base_path = '''      // Navigate based on user role base path
      let basePath = '';
      if (user.role === 'admin') basePath = '/admin';
      else if (user.role === 'teacher') basePath = user.teacherTrack === 'k12' ? '/k12-teacher' : '/teacher';
      else if (user.role === 'student') basePath = user.gradeLevel === 'k12' ? '/school-student' : '/unistudents';'''

code = code.replace(old_base_path, new_base_path)

# 4. Update Sidebar props
old_sidebar = '''        <Sidebar
          activeRole={activeRole as any}
          onChangeRole={(newRoleId) => {
            console.log("Mock role switch:", newRoleId);
            // In a real app with real auth, changing role might mean logging out and logging in as someone else
          }}
          activeTab={activeTab}'''

new_sidebar = '''        <Sidebar
          activeRole={activeRole as any}
          activeTab={activeTab}'''

code = code.replace(old_sidebar, new_sidebar)

# 5. Update MobileNavigation props
old_mobile_nav = '''        <MobileNavigation
          activeRole={activeRole as any}
          onChangeRole={() => {}}
          activeTab={activeTab}'''

new_mobile_nav = '''        <MobileNavigation
          activeRole={activeRole as any}
          activeTab={activeTab}'''

code = code.replace(old_mobile_nav, new_mobile_nav)

with open('src/layouts/V2DashboardLayout.tsx', 'w') as f:
    f.write(code)

print('V2DashboardLayout patched')
