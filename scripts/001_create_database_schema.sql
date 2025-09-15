-- VasuAi Climate Platform Database Schema
-- Create all tables with proper RLS policies

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  carbon_footprint DECIMAL DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE USING (auth.uid() = id);

-- Missions table
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('energy', 'transport', 'waste', 'water', 'food')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER DEFAULT 0,
  duration_days INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS for missions (public read access)
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "missions_select_all" ON missions FOR SELECT TO authenticated USING (true);

-- User mission progress
CREATE TABLE IF NOT EXISTS user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  progress INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  photo_url TEXT
);

-- Enable RLS for user_missions
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_missions_select_own" ON user_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_missions_insert_own" ON user_missions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_missions_update_own" ON user_missions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_missions_delete_own" ON user_missions FOR DELETE USING (auth.uid() = user_id);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  badge_type TEXT CHECK (badge_type IN ('bronze', 'silver', 'gold', 'platinum')),
  earned_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS for achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements_select_own" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "achievements_insert_own" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Environmental data tracking
CREATE TABLE IF NOT EXISTS environmental_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  data_type TEXT CHECK (data_type IN ('carbon_footprint', 'energy_usage', 'water_usage')),
  value DECIMAL,
  unit TEXT,
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS for environmental_data
ALTER TABLE environmental_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "environmental_data_select_own" ON environmental_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "environmental_data_insert_own" ON environmental_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "environmental_data_update_own" ON environmental_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "environmental_data_delete_own" ON environmental_data FOR DELETE USING (auth.uid() = user_id);

-- Community posts/stories
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS for community_posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "community_posts_select_all" ON community_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "community_posts_insert_own" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_posts_update_own" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "community_posts_delete_own" ON community_posts FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', null),
    COALESCE(new.raw_user_meta_data ->> 'username', null)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for auto-profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
