const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'unistudents', 'Dashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const newFunc = `const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Enrollments
      let validEnrollments = [];
      let enrolledCourseIds = [];
      let avgProgress = 0;
      try {
        const { data: enrollmentsData, error: enrollError } = await supabase
          .from('enrollments')
          .select(\`
            progress, 
            enrolled_at, 
            courses (
              id, 
              title, 
              description, 
              category, 
              level, 
              duration_hours, 
              total_lessons, 
              teacher_id,
              users (
                name,
                avatar_url
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

        avgProgress = validEnrollments.length > 0
          ? Math.round(validEnrollments.reduce((sum, e) => sum + Number(e.progress), 0) / validEnrollments.length)
          : 0;
      } catch (e) {
        console.error("Dashboard Fetch Error Details (enrollments):", e);
      }

      // 2. Fetch Upcoming Classes
      let classes = [];
      let todayClassesCount = 0;
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
                users (
                  name
                )
              )
            \`)
            .in('course_id', enrolledCourseIds)
            .gte('scheduled_at', new Date().toISOString())
            .order('scheduled_at', { ascending: true })
            .limit(3);

          if (classesError) throw classesError;
          classes = (classesData || []);
          
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          const endOfToday = new Date();
          endOfToday.setHours(23, 59, 59, 999);
          
          todayClassesCount = classes.filter(c => {
            const schedDate = new Date(c.scheduled_at);
            return schedDate >= startOfToday && schedDate <= endOfToday;
          }).length;
        } catch(e) { console.error("Dashboard Fetch Error Details (live_classes):", e); }
      }
      setUpcomingClasses(classes);

      // 3. Fetch Assignments and Submissions
      let pending = [];
      let submissionsList = [];
      if (enrolledCourseIds.length > 0) {
        try {
          const { data: assignmentsData, error: assignmentsError } = await supabase
            .from('assignments')
            .select(\`
              id, 
              title, 
              due_date, 
              max_grade, 
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
            .select('assignment_id, submitted_at, grade')
            .eq('student_id', user.id);

          if (submissionsError) throw submissionsError;
          submissionsList = submissionsData || [];

          const submittedIds = new Set(submissionsList.map(s => s.assignment_id));
          pending = (assignmentsData || [])
            .filter(a => !submittedIds.has(a.id))
            .slice(0, 5);
        } catch(e) { console.error("Dashboard Fetch Error Details (assignments):", e); }
      }
      setPendingAssignments(pending);

      // 4. Fetch Attendance and calculate percentage
      let attendanceList = [];
      if (enrolledCourseIds.length > 0) {
        try {
          const { data: attendanceData, error: attendanceError } = await supabase
            .from('attendance')
            .select(\`
              id, 
              date, 
              status, 
              marked_at,
              courses (
                title
              )
            \`)
            .eq('student_id', user.id);

          if (attendanceError) throw attendanceError;
          attendanceList = attendanceData || [];
          
          const totalClasses = attendanceList.length;
          const presentClasses = attendanceList.filter(a => a.status === 'present' || a.status === 'late').length;
          setAttendancePercentage(totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100);
        } catch(e) { console.error("Dashboard Fetch Error Details (attendance):", e); }
      } else {
        setAttendancePercentage(100);
      }

      // 5. Fetch Certificates
      let certsList = [];
      try {
        const { data: certificatesData, error: certError } = await supabase
          .from('certificates')
          .select(\`
            id, 
            issued_at,
            courses (
              title
            )
          \`)
          .eq('student_id', user.id)
          .order('issued_at', { ascending: false })
          .limit(5);
        if (certError) throw certError;
        certsList = certificatesData || [];
      } catch(e) { console.error("Dashboard Fetch Error Details (certificates):", e); }

      // 6. Build Recent Activity Feed (up to 5 items)
      const activities = [];

      // Add enrollments to activity
      validEnrollments.forEach((e, i) => {
        if (e.enrolled_at) {
          activities.push({
            id: \`enroll-\${i}-\${e.courses?.id}\`,
            type: 'enrollment',
            title: \`Enrolled in course "\${e.courses?.title || 'Unknown course'}"\`,
            timestamp: e.enrolled_at,
            badgeText: 'Enrollment',
            badgeVariant: 'blue',
            icon: BookOpen
          });
        }
      });

      // Add submissions to activity
      submissionsList.forEach((s, i) => {
        if (s.submitted_at) {
          activities.push({
            id: \`sub-\${i}-\${s.assignment_id}\`,
            type: 'submission',
            title: \`Submitted assignment\`,
            timestamp: s.submitted_at,
            badgeText: s.grade !== null && s.grade !== undefined ? \`Graded: \${s.grade}\` : 'Submitted',
            badgeVariant: s.grade !== null && s.grade !== undefined ? 'emerald' : 'purple',
            icon: FileText
          });
        }
      });

      // Add attendance markings to activity
      attendanceList.forEach((a, i) => {
        if (a.marked_at) {
          activities.push({
            id: \`att-\${i}-\${a.id}\`,
            type: 'attendance',
            title: \`Marked \${a.status} in course "\${a.courses?.title || 'Class'}"\`,
            timestamp: a.marked_at,
            badgeText: a.status.toUpperCase(),
            badgeVariant: a.status === 'present' ? 'emerald' : (a.status === 'late' ? 'amber' : 'amber'),
            icon: Clock
          });
        }
      });

      // Add certificates to activity
      certsList.forEach((c, i) => {
        if (c.issued_at) {
          activities.push({
            id: \`cert-\${i}-\${c.id}\`,
            type: 'certificate',
            title: \`Awarded Certificate for "\${c.courses?.title || 'Course'}"\`,
            timestamp: c.issued_at,
            badgeText: 'Certificate',
            badgeVariant: 'emerald',
            icon: Award
          });
        }
      });

      // Sort and take top 5
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
      
      setRecentActivities(sortedActivities);

      // Save Daily Summary stats
      setStats({
        classesCountToday: todayClassesCount,
        pendingAssignmentsCount: pending.length,
        averageProgress: avgProgress
      });

    } catch (err) {
      console.error("Dashboard Fetch Error Details:", err);
      setError(err.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };`;

const regex = /const loadDashboardData = async \(\) => \{[\s\S]*?\} finally \{\s*setLoading\(false\);\s*\}\s*\};/;
content = content.replace(regex, newFunc);
fs.writeFileSync(filePath, content, 'utf8');
console.log('patched unistudents/Dashboard.tsx');
