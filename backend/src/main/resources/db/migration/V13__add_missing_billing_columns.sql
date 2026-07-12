-- Add missing billing settings columns to existing billing_settings table

ALTER TABLE billing_settings ADD COLUMN IF NOT EXISTS starting_invoice_number INT DEFAULT 1001;
ALTER TABLE billing_settings ADD COLUMN IF NOT EXISTS auto_generate_invoice_number BOOLEAN DEFAULT TRUE;
ALTER TABLE billing_settings ADD COLUMN IF NOT EXISTS default_tax_percent INT DEFAULT 18;
ALTER TABLE billing_settings ADD COLUMN IF NOT EXISTS tax_label VARCHAR(50) DEFAULT 'GST';
ALTER TABLE billing_settings ADD COLUMN IF NOT EXISTS enable_item_level_tax BOOLEAN DEFAULT TRUE;
ALTER TABLE billing_settings ADD COLUMN IF NOT EXISTS enable_invoice_level_discount BOOLEAN DEFAULT TRUE;
ALTER TABLE billing_settings ADD COLUMN IF NOT EXISTS selected_template_id VARCHAR(50) DEFAULT 'CLASSIC_MEDICAL';
ALTER TABLE billing_settings ADD COLUMN IF NOT EXISTS show_clinic_logo BOOLEAN DEFAULT TRUE;
ALTER TABLE billing_settings ADD COLUMN IF NOT EXISTS show_clinic_address BOOLEAN DEFAULT TRUE;
ALTER TABLE billing_settings ADD COLUMN IF NOT EXISTS show_clinic_contact BOOLEAN DEFAULT TRUE;
ALTER TABLE billing_settings ADD COLUMN IF NOT EXISTS show_doctor_name BOOLEAN DEFAULT TRUE;
ALTER TABLE billing_settings ADD COLUMN IF NOT EXISTS show_patient_mobile BOOLEAN DEFAULT TRUE;
ALTER TABLE billing_settings ADD COLUMN IF NOT EXISTS show_payment_summary BOOLEAN DEFAULT TRUE;
ALTER TABLE billing_settings ADD COLUMN IF NOT EXISTS show_footer_message BOOLEAN DEFAULT TRUE;
ALTER TABLE billing_settings ADD COLUMN IF NOT EXISTS show_authorized_signature BOOLEAN DEFAULT TRUE;
ALTER TABLE billing_settings ADD COLUMN IF NOT EXISTS footer_message VARCHAR(255) DEFAULT 'Thank you for visiting HealthFlow. Wish you a speedy recovery!';
