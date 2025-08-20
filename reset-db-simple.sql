-- Connect to postgres database first
\c postgres

-- Drop the database if it exists
DROP DATABASE IF EXISTS ecommerce_db;

-- Create the database
CREATE DATABASE ecommerce_db;

-- Connect to the new database
\c ecommerce_db

-- Database is now ready for the application to create tables