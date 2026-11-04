CREATE TABLE IF NOT EXISTS doctor_live_location (
  doctor_cedula text PRIMARY KEY REFERENCES users(cedula) ON DELETE CASCADE,
  lat double precision,
  lng double precision,
  is_sharing boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE doctor_live_location ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON doctor_live_location TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_doctor_live_location" ON doctor_live_location;
CREATE POLICY "anon_select_doctor_live_location" ON doctor_live_location FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_doctor_live_location" ON doctor_live_location;
CREATE POLICY "anon_insert_doctor_live_location" ON doctor_live_location FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_doctor_live_location" ON doctor_live_location;
CREATE POLICY "anon_update_doctor_live_location" ON doctor_live_location FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_doctor_live_location" ON doctor_live_location;
CREATE POLICY "anon_delete_doctor_live_location" ON doctor_live_location FOR DELETE
  TO anon, authenticated USING (true);
