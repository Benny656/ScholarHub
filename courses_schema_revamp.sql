-- Step 1: Safely drop the existing table and its dependencies
DROP TABLE IF EXISTS public.courses CASCADE;

-- Step 2: Create the unified courses table
CREATE TABLE public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_type TEXT NOT NULL CHECK (institution_type IN ('k12', 'uni')),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2),
    target_year TEXT,
    grade_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 3: Enable Row Level Security (RLS)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies
-- Allow anyone authenticated to select courses
CREATE POLICY "Enable read access for all authenticated users" ON public.courses
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow teachers, admins, k12_teachers, college_teachers to insert their own courses
CREATE POLICY "Enable insert for instructors" ON public.courses
    FOR INSERT
    TO authenticated
    WITH CHECK (
        instructor_id = auth.uid() AND (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('teacher', 'admin', 'k12_teacher', 'college_teacher')
            )
        )
    );

-- Optional: Allow instructors to update/delete their own courses
CREATE POLICY "Enable update for course owners" ON public.courses
    FOR UPDATE
    TO authenticated
    USING (instructor_id = auth.uid());

CREATE POLICY "Enable delete for course owners" ON public.courses
    FOR DELETE
    TO authenticated
    USING (instructor_id = auth.uid());
