-- Alter clinics table to add detailed columns for clinic settings profiles

ALTER TABLE clinics ADD COLUMN logo_url VARCHAR(255);
ALTER TABLE clinics ADD COLUMN website VARCHAR(255);
ALTER TABLE clinics ADD COLUMN gst_number VARCHAR(100);
ALTER TABLE clinics ADD COLUMN registration_number VARCHAR(100);
ALTER TABLE clinics ADD COLUMN address_line VARCHAR(255);
ALTER TABLE clinics ADD COLUMN city VARCHAR(100);
ALTER TABLE clinics ADD COLUMN state VARCHAR(100);
ALTER TABLE clinics ADD COLUMN country VARCHAR(100);
ALTER TABLE clinics ADD COLUMN pincode VARCHAR(50);
ALTER TABLE clinics ADD COLUMN currency VARCHAR(50);
ALTER TABLE clinics ADD COLUMN language VARCHAR(50);

-- Populate initial values for clinic ID 1
UPDATE clinics SET 
  logo_url = 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&auto=format&fit=crop&q=80',
  website = 'www.healthflow.clinic',
  gst_number = '22AAAAA0000A1Z5',
  registration_number = 'REG-2023-88910',
  address_line = '452 Innovation Blvd, Suite 200',
  city = 'New Delhi',
  state = 'Delhi',
  country = 'India',
  pincode = '110001',
  currency = 'INR (₹)',
  language = 'English (India)'
WHERE id = 1;
