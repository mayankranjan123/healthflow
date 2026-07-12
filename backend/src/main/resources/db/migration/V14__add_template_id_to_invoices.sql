-- Add template_id to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS template_id VARCHAR(50) DEFAULT 'CLASSIC_MEDICAL';
