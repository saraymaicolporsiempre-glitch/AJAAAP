DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'specialty'
  ) THEN
    ALTER TABLE users ADD COLUMN specialty text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'reason'
  ) THEN
    ALTER TABLE appointments ADD COLUMN reason text;
  END IF;
END $$;


CREATE TABLE IF NOT EXISTS doctor_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_cedula text NOT NULL REFERENCES users(cedula) ON DELETE CASCADE,
  schedule_date date NOT NULL,
  start_hour text NOT NULL DEFAULT '08:00',
  end_hour text NOT NULL DEFAULT '12:00',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(doctor_cedula, schedule_date)
);

ALTER TABLE doctor_schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_doctor_schedule" ON doctor_schedule;
CREATE POLICY "anon_select_doctor_schedule" ON doctor_schedule FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_doctor_schedule" ON doctor_schedule;
CREATE POLICY "anon_insert_doctor_schedule" ON doctor_schedule FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_doctor_schedule" ON doctor_schedule;
CREATE POLICY "anon_update_doctor_schedule" ON doctor_schedule FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_doctor_schedule" ON doctor_schedule;
CREATE POLICY "anon_delete_doctor_schedule" ON doctor_schedule FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_doctor_schedule_cedula ON doctor_schedule(doctor_cedula);
CREATE INDEX IF NOT EXISTS idx_doctor_schedule_date ON doctor_schedule(schedule_date);


UPDATE users SET specialty = 'Medicina General' WHERE role = 'doctor' AND specialty IS NULL;