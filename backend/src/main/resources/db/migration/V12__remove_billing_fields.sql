-- Drop columns from billing_settings table as requested

ALTER TABLE billing_settings DROP COLUMN IF EXISTS receipt_prefix;
ALTER TABLE billing_settings DROP COLUMN IF EXISTS enable_item_level_discount;
ALTER TABLE billing_settings DROP COLUMN IF EXISTS round_off_amount;
ALTER TABLE billing_settings DROP COLUMN IF EXISTS show_pending_amount;
ALTER TABLE billing_settings DROP COLUMN IF EXISTS gst_number_display;
ALTER TABLE billing_settings DROP COLUMN IF EXISTS show_gst_on_header;
ALTER TABLE billing_settings DROP COLUMN IF EXISTS paper_size;
ALTER TABLE billing_settings DROP COLUMN IF EXISTS print_orientation;
ALTER TABLE billing_settings DROP COLUMN IF EXISTS pdf_footer_text;
ALTER TABLE billing_settings DROP COLUMN IF EXISTS download_file_name_format;
ALTER TABLE billing_settings DROP COLUMN IF EXISTS auto_download_after_save;
ALTER TABLE billing_settings DROP COLUMN IF EXISTS show_print_button_after_gen;
