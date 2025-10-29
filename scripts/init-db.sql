-- Initial database setup script
-- This runs automatically when PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schemas if needed (for future multi-tenancy or separation)
-- CREATE SCHEMA IF NOT EXISTS barbershop;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE barbershop TO barbershop_user;

-- Create custom types (will be used by Prisma migrations)
DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM (
        'PENDING',
        'CONFIRMED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
        'NO_SHOW'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE barber_status AS ENUM (
        'ACTIVE',
        'INACTIVE',
        'ON_BREAK'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE client_segment AS ENUM (
        'REGULAR',
        'VIP',
        'PREMIUM'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_category AS ENUM (
        'HAIRCUT',
        'BEARD',
        'STYLING',
        'COLORING',
        'TREATMENT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Performance optimization settings
ALTER DATABASE barbershop SET timezone TO 'UTC';

-- Create a healthcheck function
CREATE OR REPLACE FUNCTION public.healthcheck()
RETURNS text AS $$
BEGIN
    RETURN 'OK';
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Database initialized successfully!' AS status;
