import sys
import re

with open('src/pages/teacher/Dashboard.tsx', 'r') as f:
    code = f.read()

# 1. Rename Component
code = code.replace("export function TeacherDashboard()", "export function K12TeacherDashboard()")

# 2. Change course details to K-12 appropriate
code = code.replace("'Full-Stack Web Development'", "'8th Grade Math'")
code = code.replace("'Data Structures & Algorithms'", "'7th Grade Science'")
code = code.replace("'Machine Learning Fundamentals'", "'6th Grade History'")
code = code.replace("'Advanced React Patterns'", "'9th Grade English'")
code = code.replace("'Web Dev'", "'Math'")
code = code.replace("'DSA'", "'Science'")
code = code.replace("'Machine Learning'", "'History'")

with open('src/pages/teacher/K12TeacherDashboard.tsx', 'w') as f:
    f.write(code)

print('K12TeacherDashboard created')
