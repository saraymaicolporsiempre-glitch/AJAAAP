ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('doctor', 'patient', 'admin', 'secretary'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'scheduled_date'
  ) THEN
    ALTER TABLE appointments ADD COLUMN scheduled_date date;
  END IF;
END $$;

DROP POLICY IF EXISTS "anon_delete_users" ON users;

DROP FUNCTION IF EXISTS delete_user_as_admin(text, text);
CREATE OR REPLACE FUNCTION delete_user_as_admin(p_cedula text, p_admin_cedula text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_admin_cedula = '1082917595' THEN
    DELETE FROM users WHERE cedula = p_cedula;
    RETURN true;
  ELSE
    RAISE EXCEPTION 'No autorizado: solo el Administrador Global puede eliminar usuarios';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_user_as_admin(text, text) TO anon, authenticated;

INSERT INTO users (cedula, name, role, sede_name) VALUES
  ('1082917595', 'Maicol Benavides', 'admin', NULL),
  ('1001', 'Secretaría', 'secretary', 'Batallón de Infantería N.5 Córdova - Santa Marta')
ON CONFLICT (cedula) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  sede_name = EXCLUDED.sede_name;