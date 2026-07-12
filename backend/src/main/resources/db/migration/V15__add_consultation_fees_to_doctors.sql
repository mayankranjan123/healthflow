-- Add consultation_fees column to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS consultation_fees NUMERIC(10, 2) DEFAULT 0.00;
