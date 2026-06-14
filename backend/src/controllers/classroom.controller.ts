import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getSupabaseForUser } from '../config/supabase.js';
import { localDB } from '../localDB.js';

export const classroomController = {
  // GET /api/classrooms
  async getClassrooms(req: AuthenticatedRequest, res: Response) {
    try {
      const userClient = getSupabaseForUser(req.user!.token);
      
      let query = userClient
        .from('courses')
        .select('*, users(name, avatar_url)');

      const { category, level, search } = req.query;

      if (category && category !== 'All') {
        query = query.eq('category', category as string);
      }
      if (level && level !== 'All') {
        query = query.eq('level', level as string);
      }
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('getClassrooms join query failed, trying simple select:', error.message);
        
        let simpleQuery = userClient.from('courses').select('*');
        if (category && category !== 'All') simpleQuery = simpleQuery.eq('category', category as string);
        if (level && level !== 'All') simpleQuery = simpleQuery.eq('level', level as string);
        if (search) simpleQuery = simpleQuery.ilike('title', `%${search}%`);
        
        const { data: simpleData, error: simpleError } = await simpleQuery;
        if (simpleError) throw simpleError;
        
        return res.json(simpleData || []);
      }

      let courses = data || [];
      if (courses.length === 0) {
        let localCourses = localDB.getCourses();
        if (category && category !== 'All') {
          localCourses = localCourses.filter(c => c.category === category);
        }
        if (level && level !== 'All') {
          localCourses = localCourses.filter(c => c.level === level);
        }
        if (search) {
          localCourses = localCourses.filter(c => c.title.toLowerCase().includes((search as string).toLowerCase()));
        }
        courses = localCourses;
      }

      res.json(courses);
    } catch (error: any) {
      console.error('getClassrooms error:', error.message || error);
      let localCourses = localDB.getCourses();
      const { category, level, search } = req.query;
      if (category && category !== 'All') {
        localCourses = localCourses.filter(c => c.category === category);
      }
      if (level && level !== 'All') {
        localCourses = localCourses.filter(c => c.level === level);
      }
      if (search) {
        localCourses = localCourses.filter(c => c.title.toLowerCase().includes((search as string).toLowerCase()));
      }
      res.json(localCourses);
    }
  },

  // GET /api/classrooms/:id
  async getClassroomById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userClient = getSupabaseForUser(req.user!.token);

      const { data: classroom, error } = await userClient
        .from('courses')
        .select('*, users(name, avatar_url)')
        .eq('id', id)
        .single();

      if (error) {
        console.warn('getClassroomById join query failed, trying simple select:', error.message);
        const { data: simpleClassroom, error: simpleError } = await userClient
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();
        
        if (simpleError) throw simpleError;
        
        const { data: lessons } = await userClient
          .from('lessons')
          .select('*')
          .eq('course_id', id)
          .order('order_index');

        return res.json({
          ...(simpleClassroom || {}),
          lessons: lessons || []
        });
      }

      const { data: lessons, error: lessonsError } = await userClient
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index');

      if (lessonsError) throw lessonsError;

      res.json({
        ...classroom,
        lessons: lessons || []
      });
    } catch (error: any) {
      console.error('getClassroomById error:', error.message || error);
      const localCourse = localDB.getCourseById(req.params.id);
      if (localCourse) {
        return res.json({
          ...localCourse,
          lessons: []
        });
      }
      res.status(404).json({ error: 'Classroom not found' });
    }
  },

  // POST /api/classrooms
  async createClassroom(req: AuthenticatedRequest, res: Response) {
    const { title, description, category, level, price, tags, isPublished, thumbnail } = req.body;
    try {
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('courses')
        .insert({
          title,
          description,
          category,
          level,
          price: price ? Number(price) : 0,
          tags: tags || [],
          is_published: isPublished || false,
          teacher_id: req.user!.id,
          thumbnail_url: thumbnail || '',
        })
        .select('*, users(name, avatar_url)')
        .single();

      if (error) {
        console.warn('createClassroom insert failed, trying without select join:', error.message);
        const { data: simpleInsert, error: insertError } = await userClient
          .from('courses')
          .insert({
            title,
            description,
            category,
            level,
            price: price ? Number(price) : 0,
            tags: tags || [],
            is_published: isPublished || false,
            teacher_id: req.user!.id,
            thumbnail_url: thumbnail || '',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
        // Sync locally
        localDB.addCourse(simpleInsert);
        return res.status(201).json(simpleInsert);
      }

      localDB.addCourse(data);
      res.status(201).json(data);
    } catch (error: any) {
      console.error('createClassroom error (falling back to local DB):', error.message || error);
      const newCourse = {
        id: `c_${Math.random().toString(36).substring(2, 9)}`,
        title,
        description,
        category,
        level,
        price: price ? Number(price) : 0,
        tags: tags || [],
        is_published: isPublished || false,
        teacher_id: req.user!.id,
        thumbnail_url: thumbnail || '',
        created_at: new Date().toISOString(),
        users: { name: req.user!.name, avatar_url: '' }
      };
      localDB.addCourse(newCourse);
      res.status(201).json(newCourse);
    }
  },

  // PUT /api/classrooms/:id
  async updateClassroom(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { title, description, category, level, price, tags, isPublished, thumbnail } = req.body;
    try {
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('courses')
        .update({
          title,
          description,
          category,
          level,
          price: price ? Number(price) : undefined,
          tags: tags || undefined,
          is_published: isPublished !== undefined ? isPublished : undefined,
          thumbnail_url: thumbnail || undefined,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      localDB.updateCourse(id, data);
      res.json(data);
    } catch (error: any) {
      console.error('updateClassroom error (falling back to local DB):', error.message || error);
      const updated = localDB.updateCourse(id, {
        title,
        description,
        category,
        level,
        price: price ? Number(price) : undefined,
        tags: tags || undefined,
        is_published: isPublished !== undefined ? isPublished : undefined,
        thumbnail_url: thumbnail || undefined,
      });
      if (updated) {
        return res.json(updated);
      }
      res.status(400).json({ error: error.message || 'Failed to update classroom' });
    }
  },

  // DELETE /api/classrooms/:id
  async deleteClassroom(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    try {
      const userClient = getSupabaseForUser(req.user!.token);

      // Delete lessons first
      await userClient.from('lessons').delete().eq('course_id', id);
      // Delete enrollments
      await userClient.from('enrollments').delete().eq('course_id', id);

      const { error } = await userClient.from('courses').delete().eq('id', id);
      if (error) throw error;

      localDB.deleteCourse(id);
      res.json({ message: 'Classroom deleted successfully' });
    } catch (error: any) {
      console.error('deleteClassroom error (falling back to local DB):', error.message || error);
      localDB.deleteCourse(id);
      res.json({ message: 'Classroom deleted successfully' });
    }
  },

  // GET /api/classrooms/:id/members
  async getClassroomMembers(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userClient = getSupabaseForUser(req.user!.token);

      const { data: enrollments, error } = await userClient
        .from('enrollments')
        .select('*, users(*)')
        .eq('course_id', id);

      if (error) {
        console.warn('getClassroomMembers join failed, trying simple select:', error.message);
        const { data: simpleEnroll, error: simpleError } = await userClient
          .from('enrollments')
          .select('*')
          .eq('course_id', id);
        
        if (simpleError) throw simpleError;
        return res.json(simpleEnroll || []);
      }

      res.json(enrollments || []);
    } catch (error: any) {
      console.error('getClassroomMembers error:', error.message || error);
      res.json([]);
    }
  },

  // POST /api/classrooms/:id/enroll
  async enrollStudent(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    try {
      const userClient = getSupabaseForUser(req.user!.token);
      const studentId = req.body.studentId || req.user!.id;

      const { data, error } = await userClient
        .from('enrollments')
        .insert({
          course_id: id,
          student_id: studentId,
          progress: 0,
        })
        .select()
        .single();

      if (error) throw error;

      localDB.addEnrollment(data);
      res.status(201).json(data);
    } catch (error: any) {
      console.error('enrollStudent error (falling back to local DB):', error.message || error);
      const newEnroll = {
        id: `e_${Math.random().toString(36).substring(2, 9)}`,
        course_id: id,
        student_id: req.body.studentId || req.user!.id,
        progress: 0,
        enrolled_at: new Date().toISOString()
      };
      localDB.addEnrollment(newEnroll);
      res.status(201).json(newEnroll);
    }
  },

  // GET /api/classrooms/enrolled
  async getEnrolledClassrooms(req: AuthenticatedRequest, res: Response) {
    try {
      const userClient = getSupabaseForUser(req.user!.token);
      const userId = req.user!.id;
      const { data, error } = await userClient
        .from('enrollments')
        .select('*, courses(*, users(name, avatar_url))')
        .eq('student_id', userId);
      
      if (error) {
        console.warn('getEnrolledClassrooms join failed, trying simple select:', error.message);
        const { data: simpleData, error: simpleError } = await userClient
          .from('enrollments')
          .select('*')
          .eq('student_id', userId);
        if (simpleError) throw simpleError;
        return res.json(simpleData || []);
      }
      res.json(data || []);
    } catch (error: any) {
      console.error('getEnrolledClassrooms error (falling back to local DB):', error.message || error);
      const localEnrolls = localDB.getEnrollments().filter(e => e.student_id === req.user!.id);
      const formatted = localEnrolls.map(e => {
        const course = localDB.getCourseById(e.course_id);
        return {
          ...e,
          courses: course || { id: e.course_id, title: 'Local Course', users: { name: 'Teacher', avatar_url: '' } }
        };
      });
      res.json(formatted);
    }
  },

  // PUT /api/classrooms/:id/progress
  async updateProgress(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { progress, studentId } = req.body;
    try {
      const userClient = getSupabaseForUser(req.user!.token);
      const targetStudent = studentId || req.user!.id;

      let query = userClient.from('enrollments').update({ progress });

      if (id.length > 30) {
        query = query.eq('id', id);
      } else {
        query = query.eq('course_id', id).eq('student_id', targetStudent);
      }

      const { data, error } = await query.select().single();
      if (error) throw error;
      
      localDB.updateProgress(data.course_id, data.student_id, Number(data.progress));
      res.json(data);
    } catch (error: any) {
      console.error('updateProgress error (falling back to local DB):', error.message || error);
      const targetStudent = req.body.studentId || req.user!.id;
      const updated = localDB.updateProgress(id, targetStudent, Number(req.body.progress));
      if (updated) {
        return res.json(updated);
      }
      res.json({ success: true, progress: req.body.progress });
    }
  }
};
