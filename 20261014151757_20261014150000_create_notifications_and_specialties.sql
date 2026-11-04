CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_cedula text NOT NULL REFERENCES users(cedula) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  message text NOT NULL,
  patient_name text NOT NULL,
  scheduled_date text,
  scheduled_time text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
CREATE POLICY "anon_select_notifications" ON notifications FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- specialties table
-- ============================================================
CREATE TABLE IF NOT EXISTS specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_specialties" ON specialties;
CREATE POLICY "anon_select_specialties" ON specialties FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_specialties" ON specialties;
CREATE POLICY "anon_insert_specialties" ON specialties FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_specialties" ON specialties;
CREATE POLICY "anon_update_specialties" ON specialties FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_specialties" ON specialties;
CREATE POLICY "anon_delete_specialties" ON specialties FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- Seed default specialties (idempotent)
-- ============================================================
INSERT INTO specialties (name) VALUES
  ('Médico General'),
  ('Médico Especialista'),
  ('Laboratorio - Ejecución'),
  ('Laboratorio - Entrega de Resultados')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- Index for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_notifications_doctor_cedula ON notifications(doctor_cedula);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(doctor_cedula, is_read);
