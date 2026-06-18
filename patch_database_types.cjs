const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'types', 'database.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace CourseRow
const courseRowRegex = /export type CourseRow = \{[\s\S]*?\n\};/;
const newCourseRow = `export type CourseRow = {
  id: string;
  instructor_id: string;
  institution_type: string;
  title: string;
  description: string | null;
  price: number | null;
  target_year: string | null;
  grade_level: string | null;
  created_at: string;
  // Retaining some old fields as optional to prevent breaking other UI temporarily, 
  // but strictly they are removed from DB.
  category?: string | null;
  level?: string | null;
  thumbnail_url?: string | null;
  teacher_id?: string | null;
  rating?: number;
  total_students?: number;
  total_lessons?: number;
  duration_hours?: number | null;
  tags?: string[] | null;
  is_published?: boolean;
};`;
content = content.replace(courseRowRegex, newCourseRow);

// Replace relationships for courses
const coursesRelRegex = /courses: \{\s*Row: CourseRow;\s*Insert: CourseInsert;\s*Update: CourseUpdate;\s*Relationships: \[\s*\{\s*foreignKeyName: "[^"]+";\s*columns: \["[^"]+"\];\s*isOneToOne: false;\s*referencedRelation: "[^"]+";\s*referencedColumns: \["id"\];\s*\}\s*\];\s*\};/;
const newCoursesRel = `courses: {
        Row: CourseRow;
        Insert: CourseInsert;
        Update: CourseUpdate;
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey";
            columns: ["instructor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };`;
content = content.replace(coursesRelRegex, newCoursesRel);

fs.writeFileSync(filePath, content, 'utf8');
console.log('patched database.ts');
