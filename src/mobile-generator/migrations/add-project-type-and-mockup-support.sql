-- Migration: Add project type and mockup support to mobile_app table
-- Date: 2024-01-20
-- Description: Adds support for multiple project types (Flutter/Angular) and mockup integration

-- Add project_type enum and column
CREATE TYPE project_type_enum AS ENUM ('flutter', 'angular');

ALTER TABLE mobile_app 
ADD COLUMN project_type project_type_enum DEFAULT 'flutter'::project_type_enum NOT NULL;

-- Add mockup_id for integration with @/pages
ALTER TABLE mobile_app 
ADD COLUMN mockup_id UUID NULL;

-- Add config JSON field for additional project configuration
ALTER TABLE mobile_app 
ADD COLUMN config JSONB NULL;

-- Update existing records to have explicit project_type
UPDATE mobile_app 
SET project_type = 'flutter'::project_type_enum 
WHERE project_type IS NULL;

-- Add indexes for performance
CREATE INDEX idx_mobile_app_project_type ON mobile_app(project_type);
CREATE INDEX idx_mobile_app_mockup_id ON mobile_app(mockup_id);
CREATE INDEX idx_mobile_app_user_project_type ON mobile_app(user_id, project_type);

-- Add foreign key constraint for mockup_id if mockup table exists
-- Uncomment the following line if you have a mockup table
-- ALTER TABLE mobile_app ADD CONSTRAINT fk_mobile_app_mockup FOREIGN KEY (mockup_id) REFERENCES mockup(id) ON DELETE SET NULL;

-- Add comments for documentation
COMMENT ON COLUMN mobile_app.project_type IS 'Type of project to generate: flutter or angular';
COMMENT ON COLUMN mobile_app.mockup_id IS 'Reference to mockup from @/pages module (optional)';
COMMENT ON COLUMN mobile_app.config IS 'Additional project configuration in JSON format';

-- Example config JSON structure:
-- {
--   "package_name": "com.example.myapp",
--   "version": "1.0.0", 
--   "description": "My awesome app",
--   "features": ["auth", "crud", "notifications"],
--   "theme": "material"
-- } 