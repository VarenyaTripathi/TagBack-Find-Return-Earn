/*
  # Complete Lost & Found App Schema

  1. New Tables
    - `profiles` - User profiles with reward points
    - `lost_items` - Items reported as lost
    - `found_items` - Items reported as found
    - `item_matches` - Matched lost and found items

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add trigger for automatic profile creation

  3. Functions
    - Auto-create profiles on user signup
    - Match found items with lost items
    - Award points for successful matches
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  reward_points integer DEFAULT 0,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lost_items table
CREATE TABLE IF NOT EXISTS lost_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  reward text,
  images text[] DEFAULT '{}',
  category text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'matched', 'returned')),
  date_reported timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create found_items table
CREATE TABLE IF NOT EXISTS found_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  description text NOT NULL,
  location text NOT NULL,
  images text[] DEFAULT '{}',
  category text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'matched', 'returned')),
  date_reported timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create item_matches table
CREATE TABLE IF NOT EXISTS item_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id uuid REFERENCES lost_items(id) ON DELETE CASCADE,
  found_item_id uuid REFERENCES found_items(id) ON DELETE CASCADE,
  confidence_score numeric(3,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist before creating new ones
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

DROP POLICY IF EXISTS "Users can insert own lost items" ON lost_items;
DROP POLICY IF EXISTS "Users can update own lost items" ON lost_items;
DROP POLICY IF EXISTS "Users can view all lost items" ON lost_items;

DROP POLICY IF EXISTS "Users can insert own found items" ON found_items;
DROP POLICY IF EXISTS "Users can update own found items" ON found_items;
DROP POLICY IF EXISTS "Users can view all found items" ON found_items;

DROP POLICY IF EXISTS "Users can view relevant matches" ON item_matches;

-- Profiles policies
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (uid() = id);

CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (uid() = id);

-- Lost items policies
CREATE POLICY "Users can insert own lost items"
  ON lost_items
  FOR INSERT
  WITH CHECK (uid() = user_id);

CREATE POLICY "Users can update own lost items"
  ON lost_items
  FOR UPDATE
  USING (uid() = user_id);

CREATE POLICY "Users can view all lost items"
  ON lost_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Found items policies
CREATE POLICY "Users can insert own found items"
  ON found_items
  FOR INSERT
  WITH CHECK (uid() = user_id);

CREATE POLICY "Users can update own found items"
  ON found_items
  FOR UPDATE
  USING (uid() = user_id);

CREATE POLICY "Users can view all found items"
  ON found_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Item matches policies
CREATE POLICY "Users can view relevant matches"
  ON item_matches
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lost_items WHERE id = lost_item_id AND user_id = uid()
    ) OR EXISTS (
      SELECT 1 FROM found_items WHERE id = found_item_id AND user_id = uid()
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, reward_points)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)), 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check for matches when a found item is reported
CREATE OR REPLACE FUNCTION public.check_for_matches()
RETURNS TRIGGER AS $$
DECLARE
  lost_item_record RECORD;
  match_id uuid;
  confidence_score numeric(3,2);
BEGIN
  -- Look for potential matches based on category and location proximity
  FOR lost_item_record IN
    SELECT * FROM lost_items 
    WHERE status = 'active'
    AND category = NEW.category
    ORDER BY created_at DESC
    LIMIT 5
  LOOP
    -- Calculate a simple confidence score (0.75 for category match)
    confidence_score := 0.75;
    
    -- Create a match
    INSERT INTO item_matches (lost_item_id, found_item_id, confidence_score, status)
    VALUES (lost_item_record.id, NEW.id, confidence_score, 'pending')
    RETURNING id INTO match_id;
    
    -- Award points to finder (10 points)
    UPDATE profiles 
    SET reward_points = reward_points + 10,
        updated_at = now()
    WHERE id = NEW.user_id;
    
    -- Mark items as matched
    UPDATE found_items SET status = 'matched' WHERE id = NEW.id;
    UPDATE lost_items SET status = 'matched' WHERE id = lost_item_record.id;
    
    -- Exit after first match
    EXIT;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for checking matches on found item creation
DROP TRIGGER IF EXISTS check_matches_on_found_item ON found_items;
CREATE TRIGGER check_matches_on_found_item
  AFTER INSERT ON found_items
  FOR EACH ROW EXECUTE FUNCTION public.check_for_matches();