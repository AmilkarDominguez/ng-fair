-- ============================================================
-- Fair Sys — Admin Module
-- Database: Supabase (PostgreSQL)
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- TYPES (enums)
-- ============================================================
DO $$ BEGIN
  CREATE TYPE state_enum AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'EXHIBITOR', 'VISITOR');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE meeting_state_enum AS ENUM ('PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- TABLES — Admin Module
-- ============================================================

-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT,
  email       TEXT            NOT NULL UNIQUE,
  password    TEXT            NOT NULL,
  role        user_role_enum  NOT NULL DEFAULT 'VISITOR',
  state       state_enum      NOT NULL DEFAULT 'ACTIVE',
  created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- 2. fair_editions
CREATE TABLE IF NOT EXISTS fair_editions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  start_date  DATE,
  end_date    DATE,
  state       state_enum  NOT NULL DEFAULT 'ACTIVE',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. categories
CREATE TABLE IF NOT EXISTS categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT,
  state       state_enum  NOT NULL DEFAULT 'ACTIVE',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. exhibitors
CREATE TABLE IF NOT EXISTS exhibitors (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id)        ON DELETE RESTRICT,
  edition_id   UUID        NOT NULL REFERENCES fair_editions(id) ON DELETE RESTRICT,
  company_name TEXT,
  sector       TEXT,
  logo_url     TEXT,
  state        state_enum  NOT NULL DEFAULT 'ACTIVE',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. products
CREATE TABLE IF NOT EXISTS products (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id UUID           NOT NULL REFERENCES exhibitors(id) ON DELETE RESTRICT,
  category_id  UUID           REFERENCES categories(id)          ON DELETE SET NULL,
  name         TEXT           NOT NULL,
  price        NUMERIC(10,2),
  state        state_enum     NOT NULL DEFAULT 'ACTIVE',
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- 6. product_images
CREATE TABLE IF NOT EXISTS product_images (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT,
  sort_order  INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. product_visits
CREATE TABLE IF NOT EXISTS product_visits (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  visitor_ip  TEXT,
  visited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. meetings
CREATE TABLE IF NOT EXISTS meetings (
  id           UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID                NOT NULL REFERENCES users(id)        ON DELETE RESTRICT,
  receiver_id  UUID                NOT NULL REFERENCES users(id)        ON DELETE RESTRICT,
  edition_id   UUID                NOT NULL REFERENCES fair_editions(id) ON DELETE RESTRICT,
  state        meeting_state_enum  NOT NULL DEFAULT 'PENDING',
  created_at   TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);


-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email              ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_state              ON users(state);
CREATE INDEX IF NOT EXISTS idx_users_role               ON users(role);
CREATE INDEX IF NOT EXISTS idx_fair_editions_state      ON fair_editions(state);
CREATE INDEX IF NOT EXISTS idx_categories_state         ON categories(state);
CREATE INDEX IF NOT EXISTS idx_exhibitors_user_id       ON exhibitors(user_id);
CREATE INDEX IF NOT EXISTS idx_exhibitors_edition_id    ON exhibitors(edition_id);
CREATE INDEX IF NOT EXISTS idx_exhibitors_state         ON exhibitors(state);
CREATE INDEX IF NOT EXISTS idx_products_exhibitor_id    ON products(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id     ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_state           ON products(state);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_visits_product_id ON product_visits(product_id);
CREATE INDEX IF NOT EXISTS idx_product_visits_visited_at ON product_visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_meetings_requester_id    ON meetings(requester_id);
CREATE INDEX IF NOT EXISTS idx_meetings_receiver_id     ON meetings(receiver_id);
CREATE INDEX IF NOT EXISTS idx_meetings_edition_id      ON meetings(edition_id);
CREATE INDEX IF NOT EXISTS idx_meetings_state           ON meetings(state);


-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$ DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'users',
    'fair_editions',
    'categories',
    'exhibitors',
    'products',
    'product_images',
    'product_visits',
    'meetings'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_set_updated_at ON %I;
       CREATE TRIGGER trg_set_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      tbl, tbl
    );
  END LOOP;
END $$;


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE fair_editions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitors      ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_visits  ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings        ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- RLS POLICIES — authenticated role
-- ============================================================

-- users
CREATE POLICY "auth_select_users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_users" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_users" ON users FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_users" ON users FOR DELETE TO authenticated USING (true);

-- fair_editions
CREATE POLICY "auth_select_fair_editions" ON fair_editions FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_fair_editions" ON fair_editions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_fair_editions" ON fair_editions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_fair_editions" ON fair_editions FOR DELETE TO authenticated USING (true);

-- categories
CREATE POLICY "auth_select_categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_categories" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_categories" ON categories FOR DELETE TO authenticated USING (true);

-- exhibitors
CREATE POLICY "auth_select_exhibitors" ON exhibitors FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_exhibitors" ON exhibitors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_exhibitors" ON exhibitors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_exhibitors" ON exhibitors FOR DELETE TO authenticated USING (true);

-- products
CREATE POLICY "auth_select_products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_products" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_products" ON products FOR DELETE TO authenticated USING (true);

-- product_images
CREATE POLICY "auth_select_product_images" ON product_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_product_images" ON product_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_product_images" ON product_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_product_images" ON product_images FOR DELETE TO authenticated USING (true);

-- product_visits
CREATE POLICY "auth_select_product_visits" ON product_visits FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_product_visits" ON product_visits FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_product_visits" ON product_visits FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_product_visits" ON product_visits FOR DELETE TO authenticated USING (true);

-- meetings
CREATE POLICY "auth_select_meetings" ON meetings FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_meetings" ON meetings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_meetings" ON meetings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_meetings" ON meetings FOR DELETE TO authenticated USING (true);


-- ============================================================
-- RLS POLICIES — anon role (desarrollo sin auth activo)
-- Remover estas políticas cuando se active el sistema de auth.
-- ============================================================

-- users
CREATE POLICY "anon_select_users" ON users FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_users" ON users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_users" ON users FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_users" ON users FOR DELETE TO anon USING (true);

-- fair_editions
CREATE POLICY "anon_select_fair_editions" ON fair_editions FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_fair_editions" ON fair_editions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_fair_editions" ON fair_editions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_fair_editions" ON fair_editions FOR DELETE TO anon USING (true);

-- categories
CREATE POLICY "anon_select_categories" ON categories FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE TO anon USING (true);

-- exhibitors
CREATE POLICY "anon_select_exhibitors" ON exhibitors FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_exhibitors" ON exhibitors FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_exhibitors" ON exhibitors FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_exhibitors" ON exhibitors FOR DELETE TO anon USING (true);

-- products
CREATE POLICY "anon_select_products" ON products FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_products" ON products FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_products" ON products FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_products" ON products FOR DELETE TO anon USING (true);

-- product_images
CREATE POLICY "anon_select_product_images" ON product_images FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_product_images" ON product_images FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_product_images" ON product_images FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_product_images" ON product_images FOR DELETE TO anon USING (true);

-- product_visits
CREATE POLICY "anon_select_product_visits" ON product_visits FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_product_visits" ON product_visits FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_product_visits" ON product_visits FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_product_visits" ON product_visits FOR DELETE TO anon USING (true);

-- meetings
CREATE POLICY "anon_select_meetings" ON meetings FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_meetings" ON meetings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_meetings" ON meetings FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_meetings" ON meetings FOR DELETE TO anon USING (true);


-- ============================================================
-- REALTIME — enable publications for live listening
-- ============================================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'users',
    'fair_editions',
    'categories',
    'exhibitors',
    'products',
    'product_images',
    'product_visits',
    'meetings'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I;', tbl);
    END IF;
  END LOOP;
END $$;
