CREATE TABLE IF NOT EXISTS doctor_disabled_days (
  doctor_cedula text NOT NULL REFERENCES users(cedula) ON DELETE CASCADE,
  disabled_date text NOT NULL,
  PRIMARY KEY (doctor_cedula, disabled_date)
);

ALTER TABLE doctor_disabled_days ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON doctor_disabled_days TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_doctor_disabled_days" ON doctor_disabled_days;
CREATE POLICY "anon_select_doctor_disabled_days" ON doctor_disabled_days FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_doctor_disabled_days" ON doctor_disabled_days;
CREATE POLICY "anon_insert_doctor_disabled_days" ON doctor_disabled_days FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_doctor_disabled_days" ON doctor_disabled_days;
CREATE POLICY "anon_update_doctor_disabled_days" ON doctor_disabled_days FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_doctor_disabled_days" ON doctor_disabled_days;
CREATE POLICY "anon_delete_doctor_disabled_days" ON doctor_disabled_days FOR DELETE
  TO anon, authenticated USING (true);
