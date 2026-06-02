-- ============================================================
-- Fair Sys — Drop all tables and types
-- Ejecutar en Supabase SQL Editor para limpiar la base de datos.
-- ============================================================

-- Tablas en orden inverso de dependencia
DROP TABLE IF EXISTS meetings        CASCADE;
DROP TABLE IF EXISTS product_visits  CASCADE;
DROP TABLE IF EXISTS product_images  CASCADE;
DROP TABLE IF EXISTS products        CASCADE;
DROP TABLE IF EXISTS exhibitors      CASCADE;
DROP TABLE IF EXISTS categories      CASCADE;
DROP TABLE IF EXISTS fair_editions   CASCADE;
DROP TABLE IF EXISTS users           CASCADE;

-- Tipos (enums)
DROP TYPE IF EXISTS meeting_state_enum CASCADE;
DROP TYPE IF EXISTS user_role_enum     CASCADE;
DROP TYPE IF EXISTS state_enum         CASCADE;

-- Función de trigger
DROP FUNCTION IF EXISTS set_updated_at CASCADE;
