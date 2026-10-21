-- ===================================================
-- FONE FUSION — SUPABASE COMPLETE DATABASE SCHEMA
-- ===================================================

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_email TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC NOT NULL,
    payment_id TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    order_status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public update orders" ON public.orders;
CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    image TEXT,
    slug TEXT NOT NULL UNIQUE
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public write categories" ON public.categories;
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public write categories" ON public.categories FOR ALL USING (true);

-- 3. BRANDS TABLE
CREATE TABLE IF NOT EXISTS public.brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE
);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read brands" ON public.brands;
DROP POLICY IF EXISTS "Allow public write brands" ON public.brands;
CREATE POLICY "Allow public read brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Allow public write brands" ON public.brands FOR ALL USING (true);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    discount_price NUMERIC,
    category_id TEXT,
    brand_ids TEXT[] DEFAULT '{}',
    stock INTEGER DEFAULT 50,
    images TEXT[] DEFAULT '{}',
    supported_models TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
DROP POLICY IF EXISTS "Allow public write products" ON public.products;
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public write products" ON public.products FOR ALL USING (true);

-- 5. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow public write settings" ON public.site_settings;
CREATE POLICY "Allow public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public write settings" ON public.site_settings FOR ALL USING (true);

-- ===================================================
-- SEED INITIAL DATA
-- ===================================================

-- Seed Categories
INSERT INTO public.categories (id, name, icon, image, slug) VALUES
('1', 'Covers & Cases', '📱', '/categories/covers.svg', 'covers'),
('2', 'Chargers', '⚡', '/categories/chargers.svg', 'chargers'),
('3', 'Cables', '🔌', '/categories/cables.svg', 'cables'),
('4', 'Earphones', '🎧', '/categories/earphones.svg', 'earphones'),
('5', 'Screen Guards', '🛡️', '/categories/screen-guards.svg', 'screen-guards'),
('6', 'Holders & Stands', '🗜️', '/categories/holders.svg', 'holders')
ON CONFLICT (id) DO NOTHING;

-- Seed Brands
INSERT INTO public.brands (id, name, slug) VALUES
('1', 'Samsung', 'samsung'),
('2', 'Apple', 'apple'),
('3', 'Realme', 'realme'),
('4', 'Redmi', 'redmi'),
('5', 'Vivo', 'vivo'),
('6', 'Oppo', 'oppo')
ON CONFLICT (id) DO NOTHING;

-- Seed Products
INSERT INTO public.products (id, name, description, price, discount_price, category_id, brand_ids, stock, images, supported_models, is_featured, is_active) VALUES
('1', 'Liquid Silicone Protective Case', 'Soft-touch liquid silicone, microfiber lining, shockproof drop protection, wireless charging compatible.', 299, 199, '1', ARRAY['1','2','3','4','5'], 50, ARRAY['/categories/covers.svg'], ARRAY['iPhone 13','iPhone 14','iPhone 15','iPhone 15 Pro','Samsung S24 Ultra'], true, true),
('2', 'Crystal Clear Hard Armor Case', 'Crystal clear anti-yellowing PC back, reinforced TPU shock bumper corners.', 349, 249, '1', ARRAY['2','1'], 40, ARRAY['/categories/covers.svg'], ARRAY['iPhone 12','iPhone 13','iPhone 14 Pro','iPhone 15'], true, true),
('3', '65W Fast Charger (Type-C)', 'GaN technology, universal compatibility, foldable plug.', 899, 649, '2', ARRAY['1','3','4','5','6'], 30, ARRAY['/categories/chargers.svg'], '{}', true, true),
('4', 'Braided USB-C Cable 1.5m', 'Nylon braided, 60W charging, data transfer 480Mbps.', 249, 149, '3', ARRAY['1','3','4','5','6'], 100, ARRAY['/categories/cables.svg'], '{}', false, true),
('5', 'Wireless Earphones – Bass Pro', 'Bluetooth 5.3, 30hr battery, active noise cancellation.', 1299, 899, '4', ARRAY['1','2','3','4','5','6'], 25, ARRAY['/categories/earphones.svg'], '{}', true, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Orders
INSERT INTO public.orders (id, customer_name, customer_phone, customer_address, customer_email, items, total_amount, payment_status, order_status) VALUES
('FF-849201', 'Rahul Sharma', '+91 98765 43210', 'House #42, Model Town, Delhi - 110009', 'rahul.s@gmail.com', '[{"product_id":"1","product_name":"Silicone Matte Case (iPhone 15 Pro)","product_image":"/categories/covers.svg","price":199,"quantity":1}]'::jsonb, 248, 'paid', 'delivered'),
('FF-849202', 'Priya Verma', '+91 98123 45678', 'Flat 302, Green Valley Apt, Sector 14, Gurugram', 'priya.v@gmail.com', '[{"product_id":"3","product_name":"65W Fast Charger (Type-C)","product_image":"/categories/chargers.svg","price":649,"quantity":1}]'::jsonb, 649, 'paid', 'shipped'),
('FF-849203', 'Amit Patel', '+91 95419 74000', 'Shop No. 5, Main Market, Rohtak, Haryana', 'amit.patel@gmail.com', '[{"product_id":"2","product_name":"Crystal Clear Hard Armor Case","product_image":"/categories/covers.svg","price":249,"quantity":2}]'::jsonb, 498, 'pending', 'pending')
ON CONFLICT (id) DO NOTHING;
