CREATE TABLE IF NOT EXISTS public.course_details (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  course_description text,
  course_objectives text,
  course_duration text,
  course_level text,
  course_thumbnail text,
  prerequisites text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(course_id)
);

ALTER TABLE public.course_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view course details"
ON public.course_details FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage course details"
ON public.course_details FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "University Teachers can edit their own course details"
ON public.course_details FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = course_details.course_id 
    AND c.instructor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = course_details.course_id 
    AND c.instructor_id = auth.uid()
  )
);