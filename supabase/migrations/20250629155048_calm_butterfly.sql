/*
  # Complete Lost & Found App Schema

  1. New Tables
    - `profiles` - User profiles with reward points
    - `lost_items` - Items reported as lost
    - `found_items` - Items reported as found
    - `item_matches` - Matched lost and found items
    - `rewards` - Reward transactions

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
  email text NOT NULL,
  username text,
  reward_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lost_items table
CREATE TABLE IF NOT EXISTS lost_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  location_lat double precision,
  location_lng double precision,
  location_address text,
  date_lost date,
  image_url text,
  is_found boolean DEFAULT false,
  reward_offered integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create found_items table
CREATE TABLE IF NOT EXISTS found_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  location_lat double precision,
  location_lng double precision,
  location_address text,
  date_found date,
  image_url text,
  is_matched boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create item_matches table
CREATE TABLE IF NOT EXISTS item_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id uuid REFERENCES lost_items(id) ON DELETE CASCADE NOT NULL,
  found_item_id uuid REFERENCES found_items(id) ON DELETE CASCADE NOT NULL,
  finder_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points_awarded integer DEFAULT 10,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points integer NOT NULL,
  reason text NOT NULL,
  match_id uuid REFERENCES item_matches(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Lost items policies
CREATE POLICY "Users can read all lost items"
  ON lost_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own lost items"
  ON lost_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lost items"
  ON lost_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Found items policies
CREATE POLICY "Users can read all found items"
  ON found_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own found items"
  ON found_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own found items"
  ON found_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Item matches policies
CREATE POLICY "Users can read item_matches they're involved in"
  ON item_matches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = finder_id OR auth.uid() = owner_id);

CREATE POLICY "System can create item_matches"
  ON item_matches
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update item_matches they're involved in"
  ON item_matches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = finder_id OR auth.uid() = owner_id);

-- Rewards policies
CREATE POLICY "Users can read own rewards"
  ON rewards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create rewards"
  ON rewards
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, reward_points)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'username', ''), 0);
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
BEGIN
  -- Look for potential matches based on category and location proximity
  FOR lost_item_record IN
    SELECT * FROM lost_items 
    WHERE is_found = false 
    AND category = NEW.category
    AND (
      -- Within 5km radius (approximate)
      ABS(location_lat - NEW.location_lat) < 0.045 
      AND ABS(location_lng - NEW.location_lng) < 0.045
    )
    ORDER BY created_at DESC
    LIMIT 5
  LOOP
    -- Create a match
    INSERT INTO item_matches (lost_item_id, found_item_id, finder_id, owner_id, points_awarded)
    VALUES (lost_item_record.id, NEW.id, NEW.user_id, lost_item_record.user_id, 10)
    RETURNING id INTO match_id;
    
    -- Award points to finder
    INSERT INTO rewards (user_id, points, reason, match_id)
    VALUES (NEW.user_id, 10, 'Found matching item', match_id);
    
    -- Update finder's total points
    UPDATE profiles 
    SET reward_points = reward_points + 10,
        updated_at = now()
    WHERE id = NEW.user_id;
    
    -- Mark items as matched/found
    UPDATE found_items SET is_matched = true WHERE id = NEW.id;
    UPDATE lost_items SET is_found = true WHERE id = lost_item_record.id;
    
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