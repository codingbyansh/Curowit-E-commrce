-- Migration to allow anonymous and authenticated clients to insert, select, and update
-- creator applications and profiles without permission barriers.

DO $$
BEGIN
  -- Drop restrictive policies if they exist
  DROP POLICY IF EXISTS "creators_read_own_profile" ON creator_profiles;
  DROP POLICY IF EXISTS "creators_read_own_app" ON creator_applications;

  -- Enable RLS (or keep enabled)
  ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE creator_applications ENABLE ROW LEVEL SECURITY;

  -- creator_applications policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creator_applications' AND policyname = 'allow_all_select_applications') THEN
    CREATE POLICY "allow_all_select_applications" ON creator_applications
      FOR SELECT TO public
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creator_applications' AND policyname = 'allow_all_insert_applications') THEN
    CREATE POLICY "allow_all_insert_applications" ON creator_applications
      FOR INSERT TO public
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creator_applications' AND policyname = 'allow_all_update_applications') THEN
    CREATE POLICY "allow_all_update_applications" ON creator_applications
      FOR UPDATE TO public
      USING (true)
      WITH CHECK (true);
  END IF;

  -- creator_profiles policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creator_profiles' AND policyname = 'allow_all_select_profiles') THEN
    CREATE POLICY "allow_all_select_profiles" ON creator_profiles
      FOR SELECT TO public
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creator_profiles' AND policyname = 'allow_all_insert_profiles') THEN
    CREATE POLICY "allow_all_insert_profiles" ON creator_profiles
      FOR INSERT TO public
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creator_profiles' AND policyname = 'allow_all_update_profiles') THEN
    CREATE POLICY "allow_all_update_profiles" ON creator_profiles
      FOR UPDATE TO public
      USING (true)
      WITH CHECK (true);
  END IF;

END $$;
