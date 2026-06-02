-- 1. Buat Tabel Pengguna (Login)
CREATE TABLE IF NOT EXISTS public.auth_users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  wilayah TEXT NOT NULL,
  nama TEXT
);

-- 2. Hapus data lama (jika ada) agar tidak bentrok
TRUNCATE TABLE public.auth_users;

-- 3. Masukkan Daftar User Default beserta Password Hashed-nya
INSERT INTO public.auth_users (username, password_hash, wilayah, nama) VALUES
('superadmin', '8e453aad5ba9b463ed8987592e80c21d3965dd2532207c6baa3eec6ccc70e617', 'Super Admin', 'Administrator'),
('tembilahan', '5f52e9bad7609bff228caa9c29fdf3d6c51718835d1a969115a36e53aab769ef', 'Tembilahan Induk', 'Petugas Tembilahan'),
('kualagaung', 'b9446614fa0e2a5ebd963984f958b525a4bc03b0f2b6aff02d8fc5451c69d7c6', 'Kuala Gaung', 'Petugas Kuala Gaung'),
('sungaiguntung', '8b183e288c1aaca78290f977c7b38ab8ec42edad7f05900298ded59b430b50e9', 'Sungai Guntung', 'Petugas Sungai Guntung'),
('kualaenok', '25574794071255741424ce68dcc61fcfb2b0f80e813b8ad49c77aec5e7c96eb6', 'Kuala Enok', 'Petugas Kuala Enok'),
('pulaukijang', '4cba03282121dcd9fc843f0aee60f4c3fd9ac0a2ad0e4ac2f2a75ef5fa54ea9b', 'Pulau Kijang', 'Petugas Pulau Kijang'),
('rengat', 'a4e3bfb6466c42757e6486cfbb0276f540c278182b37b51ccd5af1235d6f1344', 'Rengat', 'Petugas Rengat');

-- 4. Buka Akses Tabel
ALTER TABLE public.auth_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to auth_users" ON public.auth_users;
CREATE POLICY "Allow public access to auth_users" ON public.auth_users FOR ALL USING (true) WITH CHECK (true);
