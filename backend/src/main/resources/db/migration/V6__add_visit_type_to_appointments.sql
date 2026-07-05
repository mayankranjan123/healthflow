-- Add visit_type column to appointments table
ALTER TABLE appointments ADD COLUMN visit_type VARCHAR(50) DEFAULT 'In-person Visit';
