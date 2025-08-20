-- Create database if it doesn't exist
SELECT 'CREATE DATABASE ecommerce_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ecommerce_db')\gexec

-- Connect to the database (you'll need to run this separately)
\c ecommerce_db

-- The application will create tables automatically using TypeORM synchronization