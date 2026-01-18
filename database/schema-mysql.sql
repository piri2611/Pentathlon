-- MySQL Schema for Pentathlon

-- Create database
CREATE DATABASE IF NOT EXISTS pentathlon;
USE pentathlon;

-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index on school_name for faster lookups
CREATE INDEX idx_school_name ON schools(school_name);

-- Insert a school name
INSERT INTO schools (school_name) VALUES ('Example School Name');

-- Query to get all schools
SELECT * FROM schools ORDER BY created_at DESC;

-- Query to get a specific school by name
SELECT * FROM schools WHERE school_name = 'Example School Name';

-- Query to update a school name
UPDATE schools SET school_name = 'Updated School Name' WHERE id = 1;

-- Query to delete a school
DELETE FROM schools WHERE id = 1;
