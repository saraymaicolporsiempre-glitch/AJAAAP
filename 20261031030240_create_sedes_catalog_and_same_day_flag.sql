CREATE TABLE IF NOT EXISTS sedes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  address text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sedes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON sedes TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_sedes" ON sedes;
CREATE POLICY "anon_select_sedes" ON sedes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sedes" ON sedes;
CREATE POLICY "anon_insert_sedes" ON sedes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sedes" ON sedes;
CREATE POLICY "anon_update_sedes" ON sedes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sedes" ON sedes;
CREATE POLICY "anon_delete_sedes" ON sedes FOR DELETE
  TO anon, authenticated USING (true);

INSERT INTO sedes (name, address, lat, lng) VALUES
  ('Batallón de Infantería N.5 Córdova - Santa Marta', 'Calle 24 # 7-100 / Av. Ferrocarril, Santa Marta, Magdalena', 11.2358, -74.2083),
  ('Universidad del Magdalena', 'Santa Marta, Magdalena', 11.2255, -74.1864)
ON CONFLICT (name) DO NOTHING;

ALTER TABLE sede_config ADD COLUMN IF NOT EXISTS same_day_booking boolean NOT NULL DEFAULT false;
