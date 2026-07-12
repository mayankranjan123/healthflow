ALTER TABLE users ADD COLUMN gender VARCHAR(50);
ALTER TABLE users ADD COLUMN date_of_birth DATE;

ALTER TABLE doctors ADD COLUMN followup_fees NUMERIC(10, 2);
