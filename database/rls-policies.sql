-- RLS Policies for schools table

-- Enable RLS on schools table
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Policy 1: SELECT - Users can only see their own school data
DROP POLICY IF EXISTS "Users can view own school data" ON schools;
CREATE POLICY "Users can view own school data"
ON schools
FOR SELECT
USING (school_name = auth.uid()::text);

-- Policy 2: INSERT - Users can insert only their own school (first time)
DROP POLICY IF EXISTS "Users can insert own school" ON schools;
CREATE POLICY "Users can insert own school"
ON schools
FOR INSERT
WITH CHECK (school_name = auth.uid()::text);

-- Policy 3: UPDATE - Users can update only their own school data
DROP POLICY IF EXISTS "Users can update own school data" ON schools;
CREATE POLICY "Users can update own school data"
ON schools
FOR UPDATE
USING (school_name = auth.uid()::text)
WITH CHECK (school_name = auth.uid()::text);

-- Policy 4: DELETE - Prevent deletion (optional)
DROP POLICY IF EXISTS "Prevent deletion" ON schools;
CREATE POLICY "Prevent deletion"
ON schools
FOR DELETE
USING (false);

-- View all RLS policies
SELECT * FROM pg_policies WHERE tablename = 'schools';
