-- Supabase Schema for NutriCoach
-- Enable UUID generation extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sex TEXT CHECK (sex IN ('Male', 'Female')),
    age INTEGER,
    height_cm NUMERIC(5, 2),
    weight_kg NUMERIC(5, 2),
    activity_level TEXT CHECK (activity_level IN ('Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Athlete')),
    goal TEXT CHECK (goal IN ('Lose Weight', 'Maintain', 'Build Muscle')),
    dietary_preferences TEXT[] DEFAULT '{}',
    health_conditions TEXT[] DEFAULT '{}',
    onboarding_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. USER GOALS TABLE
CREATE TABLE IF NOT EXISTS user_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    calories INTEGER NOT NULL,
    protein_g NUMERIC(5, 1) NOT NULL,
    carbs_g NUMERIC(5, 1) NOT NULL,
    fat_g NUMERIC(5, 1) NOT NULL,
    fiber_g NUMERIC(5, 1) NOT NULL,
    water_ml NUMERIC(6, 1) NOT NULL,
    vitamin_c_mg NUMERIC(5, 1) NOT NULL,
    iron_mg NUMERIC(5, 1) NOT NULL,
    calcium_mg NUMERIC(5, 1) NOT NULL,
    magnesium_mg NUMERIC(5, 1) NOT NULL,
    zinc_mg NUMERIC(5, 1) NOT NULL,
    potassium_mg NUMERIC(5, 1) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_goals
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- 3. DAILY SUMMARIES TABLE
CREATE TABLE IF NOT EXISTS daily_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    calories_consumed INTEGER DEFAULT 0,
    protein_g NUMERIC(5, 1) DEFAULT 0.0,
    carbs_g NUMERIC(5, 1) DEFAULT 0.0,
    fat_g NUMERIC(5, 1) DEFAULT 0.0,
    fiber_g NUMERIC(5, 1) DEFAULT 0.0,
    water_ml NUMERIC(6, 1) DEFAULT 0.0,
    goal_hit_percent NUMERIC(5, 2) DEFAULT 0.0,
    streak_day INTEGER DEFAULT 0,
    ai_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, date)
);

-- Enable RLS for daily_summaries
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- 4. WEEKLY SUMMARIES TABLE
CREATE TABLE IF NOT EXISTS weekly_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    avg_calories INTEGER DEFAULT 0,
    avg_protein_g NUMERIC(5, 1) DEFAULT 0.0,
    avg_fiber_g NUMERIC(5, 1) DEFAULT 0.0,
    avg_goal_percent NUMERIC(5, 2) DEFAULT 0.0,
    best_day DATE,
    worst_day DATE,
    weight_start_kg NUMERIC(5, 2),
    weight_end_kg NUMERIC(5, 2),
    ai_notes TEXT,
    UNIQUE (user_id, week_start)
);

-- Enable RLS for weekly_summaries
ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;

-- 5. MONTHLY SUMMARIES TABLE
CREATE TABLE IF NOT EXISTS monthly_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month DATE NOT NULL, -- Stored as YYYY-MM-01
    avg_daily_calories INTEGER DEFAULT 0,
    avg_protein_g NUMERIC(5, 1) DEFAULT 0.0,
    avg_goal_percent NUMERIC(5, 2) DEFAULT 0.0,
    weight_change_kg NUMERIC(5, 2) DEFAULT 0.0,
    best_week DATE,
    ai_notes TEXT,
    UNIQUE (user_id, month)
);

-- Enable RLS for monthly_summaries
ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;

-- 6. CHAT SESSIONS TABLE
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT,
    nutrition_data JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- 7. WEIGHT LOGS TABLE
CREATE TABLE IF NOT EXISTS weight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    weight_kg NUMERIC(5, 2) NOT NULL,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for weight_logs
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;


-- ========================================================
-- ROW LEVEL SECURITY POLICIES (Users can only access their own data)
-- ========================================================

-- Policies for user_profiles
CREATE POLICY "Users can manage own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- Policies for user_goals
CREATE POLICY "Users can manage own goals" ON user_goals
    FOR ALL USING (auth.uid() = user_id);

-- Policies for daily_summaries
CREATE POLICY "Users can manage own daily summaries" ON daily_summaries
    FOR ALL USING (auth.uid() = user_id);

-- Policies for weekly_summaries
CREATE POLICY "Users can manage own weekly summaries" ON weekly_summaries
    FOR ALL USING (auth.uid() = user_id);

-- Policies for monthly_summaries
CREATE POLICY "Users can manage own monthly summaries" ON monthly_summaries
    FOR ALL USING (auth.uid() = user_id);

-- Policies for chat_sessions
CREATE POLICY "Users can manage own chat sessions" ON chat_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Policies for weight_logs
CREATE POLICY "Users can manage own weight logs" ON weight_logs
    FOR ALL USING (auth.uid() = user_id);


-- ========================================================
-- TRIGGER: Enforce Max 4 Chat Sessions per User
-- ========================================================

CREATE OR REPLACE FUNCTION limit_chat_sessions()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM chat_sessions
    WHERE id IN (
        SELECT id FROM chat_sessions
        WHERE user_id = NEW.user_id
        ORDER BY created_at DESC
        OFFSET 4
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER limit_chat_sessions_trigger
AFTER INSERT ON chat_sessions
FOR EACH ROW
EXECUTE FUNCTION limit_chat_sessions();


-- ========================================================
-- AUTOMATIC PROFILE CREATION TRIGGER (Optional but helpful helper)
-- ========================================================

-- Recalculate updated_at trigger helper
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_modtime
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_goals_modtime
BEFORE UPDATE ON user_goals
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
