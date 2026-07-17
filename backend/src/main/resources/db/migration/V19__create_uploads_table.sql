-- Create uploads table for Supabase upload metadata
CREATE TABLE uploads (
    upload_id VARCHAR(50) PRIMARY KEY,
    file_type VARCHAR(10) NOT NULL,
    file_name VARCHAR(255),
    file_size BIGINT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
