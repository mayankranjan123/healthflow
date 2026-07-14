-- Reset sequence counters after seeding hardcoded IDs to prevent duplicate key violations

SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('doctors_id_seq', COALESCE((SELECT MAX(id) FROM doctors), 1));
SELECT setval('roles_id_seq', COALESCE((SELECT MAX(id) FROM roles), 1));
SELECT setval('patients_id_seq', COALESCE((SELECT MAX(id) FROM patients), 1));
SELECT setval('appointments_id_seq', COALESCE((SELECT MAX(id) FROM appointments), 1));
