-- Connect to postgres database
\c postgres

-- Terminate all connections to the target database
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'ecommerce_db'
  AND pid <> pg_backend_pid();

-- Drop the database
DROP DATABASE IF EXISTS ecommerce_db;

-- Create the database
CREATE DATABASE ecommerce_db;

-- Show success message
SELECT 'Database ecommerce_db has been reset successfully!' as message;