-- Reset remaining sequence counters after seeding hardcoded IDs to prevent duplicate key violations

SELECT setval('prescriptions_id_seq', COALESCE((SELECT MAX(id) FROM prescriptions), 1)) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'prescriptions_id_seq' AND relkind = 'S');
SELECT setval('prescription_medicines_id_seq', COALESCE((SELECT MAX(id) FROM prescription_medicines), 1)) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'prescription_medicines_id_seq' AND relkind = 'S');
SELECT setval('invoices_id_seq', COALESCE((SELECT MAX(id) FROM invoices), 1)) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_id_seq' AND relkind = 'S');
SELECT setval('invoice_items_id_seq', COALESCE((SELECT MAX(id) FROM invoice_items), 1)) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoice_items_id_seq' AND relkind = 'S');
SELECT setval('payments_id_seq', COALESCE((SELECT MAX(id) FROM payments), 1)) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_id_seq' AND relkind = 'S');
SELECT setval('clinic_settings_id_seq', COALESCE((SELECT MAX(id) FROM clinic_settings), 1)) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'clinic_settings_id_seq' AND relkind = 'S');
SELECT setval('billing_settings_id_seq', COALESCE((SELECT MAX(id) FROM billing_settings), 1)) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'billing_settings_id_seq' AND relkind = 'S');
SELECT setval('audit_logs_id_seq', COALESCE((SELECT MAX(id) FROM audit_logs), 1)) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'audit_logs_id_seq' AND relkind = 'S');
