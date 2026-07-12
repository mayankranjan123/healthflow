-- Create billing_settings table if not exists
CREATE TABLE IF NOT EXISTS billing_settings (
    clinic_id BIGINT PRIMARY KEY,
    invoice_prefix VARCHAR(50) DEFAULT 'INV',
    starting_invoice_number INT DEFAULT 1001,
    receipt_prefix VARCHAR(50) DEFAULT 'RCP',
    auto_generate_invoice_number BOOLEAN DEFAULT TRUE,
    default_tax_percent INT DEFAULT 18,
    tax_label VARCHAR(50) DEFAULT 'GST',
    enable_item_level_tax BOOLEAN DEFAULT TRUE,
    enable_invoice_level_discount BOOLEAN DEFAULT TRUE,
    enable_item_level_discount BOOLEAN DEFAULT FALSE,
    gst_number_display BOOLEAN DEFAULT TRUE,
    round_off_amount BOOLEAN DEFAULT TRUE,
    selected_template_id VARCHAR(50) DEFAULT 'CLASSIC_MEDICAL',
    show_clinic_logo BOOLEAN DEFAULT TRUE,
    show_clinic_address BOOLEAN DEFAULT TRUE,
    show_clinic_contact BOOLEAN DEFAULT TRUE,
    show_gst_on_header BOOLEAN DEFAULT TRUE,
    show_doctor_name BOOLEAN DEFAULT TRUE,
    show_patient_mobile BOOLEAN DEFAULT TRUE,
    show_payment_summary  BOOLEAN DEFAULT TRUE,
    show_pending_amount BOOLEAN DEFAULT TRUE,
    show_footer_message BOOLEAN DEFAULT TRUE,
    show_authorized_signature BOOLEAN DEFAULT TRUE,
    footer_message VARCHAR(255) DEFAULT 'Thank you for visiting HealthFlow. Wish you a speedy recovery!',
    paper_size VARCHAR(50) DEFAULT 'A4',
    print_orientation VARCHAR(50) DEFAULT 'PORTRAIT',
    pdf_footer_text VARCHAR(255) DEFAULT 'HealthFlow Specialty Clinic - Electronic Statement',
    download_file_name_format VARCHAR(255) DEFAULT 'INV-[NUMBER]_[PATIENT]',
    auto_download_after_save BOOLEAN DEFAULT FALSE,
    show_print_button_after_gen BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create prescription_settings table if not exists
CREATE TABLE IF NOT EXISTS prescription_settings (
    clinic_id BIGINT PRIMARY KEY,
    prefix VARCHAR(50) DEFAULT 'RX',
    starting_number INT DEFAULT 1001,
    auto_generate_number BOOLEAN DEFAULT TRUE,
    header_layout VARCHAR(50) DEFAULT 'CENTERED_PROFESSIONAL',
    show_clinic_logo BOOLEAN DEFAULT TRUE,
    show_doctor_qualifications BOOLEAN DEFAULT TRUE,
    show_doctor_department BOOLEAN DEFAULT TRUE,
    show_vitals BOOLEAN DEFAULT TRUE,
    show_patient_history BOOLEAN DEFAULT TRUE,
    show_diagnosis BOOLEAN DEFAULT TRUE,
    show_duration BOOLEAN DEFAULT TRUE,
    show_dosage_instructions BOOLEAN DEFAULT TRUE,
    default_footer_note VARCHAR(255) DEFAULT 'Please take medicines on time and review if symptoms persist.',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed defaults for clinic ID 1
INSERT INTO billing_settings (clinic_id) VALUES (1) ON CONFLICT (clinic_id) DO NOTHING;
INSERT INTO prescription_settings (clinic_id) VALUES (1) ON CONFLICT (clinic_id) DO NOTHING;
