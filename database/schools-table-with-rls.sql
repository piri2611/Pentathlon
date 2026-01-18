-- Create schools table with single press timestamp
CREATE TABLE schools (
    id SERIAL PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL UNIQUE,
    pressed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_school_name ON schools(school_name);
CREATE INDEX idx_pressed_at ON schools(pressed_at);

-- Trigger function to auto-update pressed_at timestamp
CREATE OR REPLACE FUNCTION update_pressed_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.pressed_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_buzzer_timestamp ON schools;
CREATE TRIGGER update_buzzer_timestamp
BEFORE UPDATE ON schools
FOR EACH ROW
EXECUTE FUNCTION update_pressed_at();

-- View all schools with their press times in order
SELECT 
    id,
    school_name,
    pressed_at,
    created_at
FROM schools
WHERE pressed_at IS NOT NULL
ORDER BY pressed_at ASC; 