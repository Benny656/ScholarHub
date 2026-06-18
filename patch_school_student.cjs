const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'school-student', 'SchoolStudentDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /const loadDashboardData = async \(\) => \{[\s\S]*?\} finally \{\s*setLoading\(false\);\s*\}\s*\};/;

const newFunc = `const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      let stats = { streak: 0, xp: 0, level: 1 };
      try {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('xp, level, streak')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;
        stats = {
          streak: Number(userData?.streak || 0),
          xp: Number(userData?.xp || 0),
          level: Number(userData?.level || 1)
        };
      } catch(e) { console.error("Dashboard Fetch Error Details (profiles):", e); }
      setGamifiedStats(stats);

      let validEnrollments = [];
      let enrolledCourseIds = [];
      try {
        const { data: enrollmentsData, error: enrollError } = await supabase
          .from('enrollments')
          .select(\`
            progress,
            courses (
              id,
              title,
              description,
              category,
              level,
              teacher_id,
              profiles:teacher_id (
                full_name
              )
            )
          \`)
          .eq('student_id', user.id);

        if (enrollError) throw enrollError;
        validEnrollments = (enrollmentsData || []);
        setEnrollments(validEnrollments);

        enrolledCourseIds = validEnrollments
          .map(e => e.courses?.id)
          .filter(id => !!id);
      } catch(e) { console.error("Dashboard Fetch Error Details (enrollments):", e); }

      let schedule = [];
      if (enrolledCourseIds.length > 0) {
        try {
          const { data: classesData, error: classesError } = await supabase
            .from('live_classes')
            .select(\`
              id, 
              title, 
              scheduled_at, 
              room_id, 
              status,
              courses (
                id, 
                title,
                profiles:teacher_id (
                  full_name
                )
              )
            \`)
            .in('course_id', enrolledCourseIds)
            .gte('scheduled_at', new Date().toISOString())
            .order('scheduled_at', { ascending: true })
            .limit(5);

          if (classesError) throw classesError;
          schedule = (classesData || []);
        } catch(e) { console.error("Dashboard Fetch Error Details (live_classes):", e); }
      }
      setTimetable(schedule);

      let homework = [];
      if (enrolledCourseIds.length > 0) {
        try {
          const { data: assignmentsData, error: assignmentsError } = await supabase
            .from('assignments')
            .select(\`
              id, 
              title, 
              due_date, 
              course_id,
              courses (
                title
              )
            \`)
            .in('course_id', enrolledCourseIds)
            .order('due_date', { ascending: true });

          if (assignmentsError) throw assignmentsError;

          const { data: submissionsData, error: submissionsError } = await supabase
            .from('submissions')
            .select('assignment_id')
            .eq('student_id', user.id);

          if (submissionsError) throw submissionsError;
          const submittedIds = new Set((submissionsData || []).map(s => s.assignment_id));

          homework = (assignmentsData || [])
            .filter(a => !submittedIds.has(a.id))
            .slice(0, 5);
        } catch(e) { console.error("Dashboard Fetch Error Details (assignments):", e); }
      }
      setHomeworkList(homework);

      if (enrolledCourseIds.length > 0) {
        try {
          const { data: attendanceData, error: attendanceError } = await supabase
            .from('attendance')
            .select('id, status')
            .eq('student_id', user.id);

          if (attendanceError) throw attendanceError;
          const total = attendanceData?.length || 0;
          const present = (attendanceData || []).filter(a => a.status === 'present' || a.status === 'late').length;
          setAttendancePercent(total > 0 ? Math.round((present / total) * 100) : 100);
        } catch(e) { console.error("Dashboard Fetch Error Details (attendance):", e); }
      } else {
        setAttendancePercent(100);
      }

      const badgesConfig = [
        {
          id: 'newbie',
          title: 'First Step',
          description: 'Created account',
          icon: '🌱',
          earned: true,
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        },
        {
          id: 'streak-3',
          title: 'Class Regular',
          description: '3+ Days Streak',
          icon: '🔥',
          earned: stats.streak >= 3,
          color: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
        },
        {
          id: 'level-5',
          title: 'Super Kid',
          description: 'Reach Level 5',
          icon: '⚡',
          earned: stats.level >= 5,
          color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        },
        {
          id: 'xp-1000',
          title: 'Star Kid',
          description: 'Earn 1000+ XP',
          icon: '🏆',
          earned: stats.xp >= 1000,
          color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
        }
      ];
      setBadges(badgesConfig);

    } catch (err) {
      console.error("Dashboard Fetch Error Details:", err);
      setError(err.message || 'Failed to load school dashboard data.');
    } finally {
      setLoading(false);
    }
  };`;

content = content.replace(regex, newFunc);
content = content.replace(/users \(/g, 'profiles:teacher_id (');
content = content.replace(/users:student_id \(/g, 'profiles:student_id (');
// Replace name with full_name inside the render components:
content = content.replace(/users\?.name/g, 'profiles?.full_name');
fs.writeFileSync(filePath, content, 'utf8');
console.log('patched school student dashboard');
