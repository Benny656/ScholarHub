const fs = require('fs');
const path = require('path');
const pagesDir = path.join(__dirname, 'src', 'pages');
const files = [
  'profile/Profile.tsx',
  'messages/Messages.tsx',
  'courses/CreateCourse.tsx',
  'courses/CourseDetail.tsx',
  'courses/CourseCatalog.tsx',
  'certificates/Certificates.tsx',
  'calendar/Calendar.tsx',
  'attendance/Attendance.tsx',
  'assignments/Assignments.tsx',
  'analytics/Analytics.tsx',
  'pricing/PricingPage.tsx'
];

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/import \{ AppLayout \} from '\.\.\/\.\.\/layouts\/AppLayout';\n/g, '');
    content = content.replace(/<AppLayout>/g, '<div className="space-y-6">');
    content = content.replace(/<\/AppLayout>/g, '</div>');
    fs.writeFileSync(filePath, content);
    console.log('Processed', file);
  }
});
