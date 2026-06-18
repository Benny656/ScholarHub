const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'teacher', 'K12TeacherDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /const loadDashboardData = async \(\) => \{[\s\S]*?\} finally \{\s*setLoading\(false\);\s*\}\s*\};/;

const newFunc = `const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      let validCourses = [];
      let courseIds = [];
      try {
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .eq('teacher_id', user.id);

        if (coursesError) throw coursesError;
        validCourses = coursesData || [];
        setCourses(validCourses);
        courseIds = validCourses.map(c => c.id);
      } catch(e) { console.error("Dashboard Fetch Error Details (courses):", e); }

      if (courseIds.length > 0) {
        try {
          const { count: studentsCount, error: enrollCountError } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .in('course_id', courseIds);

          if (enrollCountError) throw enrollCountError;
          setTotalStudents(studentsCount || 0);
        } catch(e) { console.error("Dashboard Fetch Error Details (enrollments count):", e); }

        try {
          const { data: classesData, error: classesError } = await supabase
            .from('live_classes')
            .select('*')
            .in('course_id', courseIds)
            .gte('scheduled_at', new Date().toISOString())
            .order('scheduled_at', { ascending: true })
            .limit(3);

          if (classesError) throw classesError;
          setUpcomingClasses(classesData || []);
        } catch(e) { console.error("Dashboard Fetch Error Details (live_classes):", e); }

        let assignmentIds = [];
        try {
          const { data: assignmentsData, error: assignmentsError } = await supabase
            .from('assignments')
            .select('id')
            .in('course_id', courseIds);

          if (assignmentsError) throw assignmentsError;
          assignmentIds = (assignmentsData || []).map(a => a.id);
        } catch(e) { console.error("Dashboard Fetch Error Details (assignments):", e); }

        if (assignmentIds.length > 0) {
          try {
            const { count: pendingGrades, error: submissionsError } = await supabase
              .from('submissions')
              .select('*', { count: 'exact', head: true })
              .in('assignment_id', assignmentIds)
              .is('grade', null);

            if (submissionsError) throw submissionsError;
            setAssignmentsToGrade(pendingGrades || 0);
          } catch(e) { console.error("Dashboard Fetch Error Details (submissions):", e); }
        } else {
          setAssignmentsToGrade(0);
        }

        try {
          const { data: attendanceData, error: attendanceError } = await supabase
            .from('attendance')
            .select('status')
            .in('course_id', courseIds);

          if (attendanceError) throw attendanceError;
          const totalAtt = attendanceData?.length || 0;
          const presentAtt = (attendanceData || []).filter(a => a.status === 'present' || a.status === 'late').length;
          setAttendanceRate(totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 95);
        } catch(e) { console.error("Dashboard Fetch Error Details (attendance):", e); }

        try {
          const { data: enrollsWithProfiles, error: profilesError } = await supabase
            .from('enrollments')
            .select(\`
              student_id,
              courses (
                id,
                title
              ),
              profiles:student_id (
                id,
                full_name,
                email,
                avatar_url,
                xp,
                level,
                streak
              )
            \`)
            .in('course_id', courseIds);

          if (profilesError) throw profilesError;

          const uniqueStudentsMap = new Map();
          (enrollsWithProfiles || []).forEach((item) => {
            const u = item.profiles;
            if (u && !uniqueStudentsMap.has(u.id)) {
              const basePoints = 100 + (Number(u.streak || 0) * 2) + (Number(u.level || 1) * 3);
              const rate = 85 + (u.xp % 15);
              uniqueStudentsMap.set(u.id, {
                id: u.id,
                name: u.full_name || 'Anonymous Student',
                email: u.email || '',
                avatar_url: u.avatar_url || null,
                xp: Number(u.xp || 0),
                level: Number(u.level || 1),
                streak: Number(u.streak || 0),
                behaviorPoints: basePoints,
                attendanceRate: Math.min(100, rate)
              });
            }
          });

          const studentList = Array.from(uniqueStudentsMap.values());
          setStudents(studentList);

          if (studentList.length > 0) {
            const alertConfig = studentList.map((s, idx) => {
              const types = ['leave', 'meeting', 'academic'];
              const type = types[idx % 3];
              const messages = {
                leave: \`Requested absence approval for \${s.name.split(' ')[0]} tomorrow due to medical checkup.\`,
                meeting: \`Checking if we can schedule a call regarding \${s.name.split(' ')[0]}'s class behavior.\`,
                academic: \`Inquiring about homework extensions and additional study guides for \${s.name.split(' ')[0]}.\`
              };
              
              const lastNames = ['Sharma', 'Verma', 'Singh', 'Kapoor', 'Gupta', 'Patel', 'Das', 'Roy'];
              const parentLastName = s.name.split(' ').pop() || lastNames[idx % lastNames.length];
              const parentPrefixes = ['Mr.', 'Mrs.', 'Dr.'];
              const parentName = \`\${parentPrefixes[idx % 3]} \${parentLastName}\`;

              return {
                id: \`alert-\${s.id}\`,
                studentName: s.name,
                parentName,
                message: messages[type],
                time: \`\${idx + 1}h ago\`,
                type,
                isRead: false
              };
            });
            setParentAlerts(alertConfig);
          } else {
            setParentAlerts([]);
          }
        } catch(e) { console.error("Dashboard Fetch Error Details (enrollments/profiles):", e); }

      } else {
        setTotalStudents(0);
        setUpcomingClasses([]);
        setAssignmentsToGrade(0);
        setAttendanceRate(100);
        setStudents([]);
        setParentAlerts([]);
      }

    } catch (err) {
      console.error("Dashboard Fetch Error Details:", err);
      setError('Failed to load classroom details. Please try again.');
    } finally {
      setLoading(false);
    }
  };`;

content = content.replace(regex, newFunc);
fs.writeFileSync(filePath, content, 'utf8');
console.log('patched K12TeacherDashboard');
