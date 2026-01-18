-- SQL to add ranking column to schools table

-- Option 1: If creating new table
CREATE TABLE schools (
    id SERIAL PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    rank INT DEFAULT NULL,
    pressed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Option 2: If table already exists, add the columns
ALTER TABLE schools ADD COLUMN rank INT DEFAULT NULL;
ALTER TABLE schools ADD COLUMN pressed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for faster ranking queries
CREATE INDEX idx_rank ON schools(rank);
CREATE INDEX idx_pressed_at ON schools(pressed_at);

-- View all schools in ranking order
SELECT id, school_name, rank, pressed_at, created_at 
FROM schools 
ORDER BY rank ASC;

-- Example data
-- When School 1 presses: rank = 1, pressed_at = 2026-01-17 10:30:00
-- When School 2 presses: rank = 2, pressed_at = 2026-01-17 10:30:05
-- When School 3 presses: rank = 3, pressed_at = 2026-01-17 10:30:12
