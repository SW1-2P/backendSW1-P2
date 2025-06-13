-- Migration script for mobile_apps table
-- Add new columns to existing table

-- First, check if the columns exist and add them if they don't
DO $$
BEGIN
    -- Add mockup_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mobile_app' AND column_name = 'mockup_id'
    ) THEN
        ALTER TABLE mobile_app ADD COLUMN mockup_id UUID;
        ALTER TABLE mobile_app ADD CONSTRAINT FK_mobile_app_mockup 
            FOREIGN KEY (mockup_id) REFERENCES mockup(id) ON DELETE SET NULL;
    END IF;

    -- Add project_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mobile_app' AND column_name = 'project_type'
    ) THEN
        -- Create enum type if it doesn't exist
        DO $create_enum$
        BEGIN
            CREATE TYPE project_type_enum AS ENUM ('flutter', 'angular');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $create_enum$;

        ALTER TABLE mobile_app ADD COLUMN project_type project_type_enum DEFAULT 'flutter';
    END IF;

    -- Add config column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mobile_app' AND column_name = 'config'
    ) THEN
        ALTER TABLE mobile_app ADD COLUMN config JSONB;
    END IF;

    -- Update existing records to have default project_type
    UPDATE mobile_app SET project_type = 'flutter' WHERE project_type IS NULL;
    
    -- Make project_type NOT NULL after setting defaults
    ALTER TABLE mobile_app ALTER COLUMN project_type SET NOT NULL;

END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mobile_app_project_type ON mobile_app(project_type);
CREATE INDEX IF NOT EXISTS idx_mobile_app_mockup_id ON mobile_app(mockup_id);
CREATE INDEX IF NOT EXISTS idx_mobile_app_user_id ON mobile_app(user_id);

-- Update comments
COMMENT ON COLUMN mobile_app.mockup_id IS 'Reference to mockup used for generation';
COMMENT ON COLUMN mobile_app.project_type IS 'Type of project: flutter or angular';
COMMENT ON COLUMN mobile_app.config IS 'JSON configuration for project generation'; 