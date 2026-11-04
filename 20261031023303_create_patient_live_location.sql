CREATE TABLE IF NOT EXISTS patient_live_location (
  patient_cedula text PRIMARY KEY REFERENCES users(cedula) ON DELETE CASCADE,
  doctor_cedula text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE patient_live_location ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON patient_live_location TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_patient_live_location" ON patient_live_location;
CREATE POLICY "anon_select_patient_live_location" ON patient_live_location FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_patient_live_location" ON patient_live_location;
CREATE POLICY "anon_insert_patient_live_location" ON patient_live_location FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_patient_live_location" ON patient_live_location;
CREATE POLICY "anon_update_patient_live_location" ON patient_live_location FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_patient_live_location" ON patient_live_location;
CREATE POLICY "anon_delete_patient_live_location" ON patient_live_location FOR DELETE
  TO anon, authenticated USING (true);
