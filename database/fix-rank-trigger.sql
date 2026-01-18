-- Solution 1: Create a trigger to auto-assign rank based on pressed_at timestamp
CREATE OR REPLACE FUNCTION assign_rank()
RETURNS TRIGGER AS $$
BEGIN
  NEW.rank := (
    SELECT COUNT(*) + 1
    FROM schools
    WHERE pressed_at IS NOT NULL
    AND pressed_at < NEW.pressed_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_rank_on_buzz ON schools;
CREATE TRIGGER set_rank_on_buzz
BEFORE UPDATE ON schools
FOR EACH ROW
WHEN (NEW.pressed_at IS DISTINCT FROM OLD.pressed_at)
EXECUTE FUNCTION assign_rank();

-- Solution 2: Update existing ranks based on pressed_at timestamp
UPDATE schools 
SET rank = (
  SELECT COUNT(*) + 1 
  FROM schools s2 
  WHERE s2.pressed_at <= schools.pressed_at 
  AND s2.pressed_at IS NOT NULL
)
WHERE pressed_at IS NOT NULL;

-- View all schools in correct ranking order
SELECT id, school_name, rank, pressed_at 
FROM schools 
WHERE pressed_at IS NOT NULL
ORDER BY pressed_at ASC;
