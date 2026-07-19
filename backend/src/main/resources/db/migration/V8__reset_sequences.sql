-- Reset sequence counters after seeding hardcoded IDs to prevent duplicate key violations

SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1)) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users_id_seq' AND relkind = 'S');
SELECT setval('doctors_id_seq', COALESCE((SELECT MAX(id) FROM doctors), 1)) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'doctors_id_seq' AND relkind = 'S');
SELECT setval('roles_id_seq', COALESCE((SELECT MAX(id) FROM roles), 1)) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'roles_id_seq' AND relkind = 'S');
SELECT setval('patients_id_seq', COALESCE((SELECT MAX(id) FROM patients), 1)) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'patients_id_seq' AND relkind = 'S');
SELECT setval('appointments_id_seq', COALESCE((SELECT MAX(id) FROM appointments), 1)) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'appointments_id_seq' AND relkind = 'S');
