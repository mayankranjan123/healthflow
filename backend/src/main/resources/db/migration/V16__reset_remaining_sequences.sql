-- Reset remaining sequence counters after seeding hardcoded IDs to prevent duplicate key violations

SELECT setval('prescriptions_id_seq', COALESCE((SELECT MAX(id) FROM prescriptions), 1));
SELECT setval('prescription_medicines_id_seq', COALESCE((SELECT MAX(id) FROM prescription_medicines), 1));
SELECT setval('invoices_id_seq', COALESCE((SELECT MAX(id) FROM invoices), 1));
SELECT setval('invoice_items_id_seq', COALESCE((SELECT MAX(id) FROM invoice_items), 1));
SELECT setval('payments_id_seq', COALESCE((SELECT MAX(id) FROM payments), 1));
SELECT setval('clinic_settings_id_seq', COALESCE((SELECT MAX(id) FROM clinic_settings), 1));
SELECT setval('billing_settings_id_seq', COALESCE((SELECT MAX(id) FROM billing_settings), 1));
SELECT setval('audit_logs_id_seq', COALESCE((SELECT MAX(id) FROM audit_logs), 1));
