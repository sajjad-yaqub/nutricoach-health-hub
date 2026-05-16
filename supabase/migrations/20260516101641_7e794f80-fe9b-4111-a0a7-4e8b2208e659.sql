-- user_profiles
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  sex text,
  age integer,
  height_cm numeric,
  weight_kg numeric,
  activity_level text,
  goal text,
  dietary_preferences text[] DEFAULT '{}',
  health_conditions text[] DEFAULT '{}',
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own insert" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own update" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "own delete" ON public.user_profiles FOR DELETE USING (auth.uid() = id);

-- user_goals
CREATE TABLE public.user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  water_ml numeric,
  vitamin_c_mg numeric,
  iron_mg numeric,
  calcium_mg numeric,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.user_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.user_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.user_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.user_goals FOR DELETE USING (auth.uid() = user_id);

-- daily_summaries
CREATE TABLE public.daily_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  calories_consumed numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  water_ml numeric,
  goal_hit_percent numeric,
  streak_day integer,
  ai_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.daily_summaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.daily_summaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.daily_summaries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.daily_summaries FOR DELETE USING (auth.uid() = user_id);

-- weekly_summaries
CREATE TABLE public.weekly_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  avg_calories numeric,
  avg_protein_g numeric,
  avg_fiber_g numeric,
  avg_goal_percent numeric,
  best_day date,
  worst_day date,
  weight_start_kg numeric,
  weight_end_kg numeric,
  ai_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);
ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.weekly_summaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.weekly_summaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.weekly_summaries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.weekly_summaries FOR DELETE USING (auth.uid() = user_id);

-- monthly_summaries
CREATE TABLE public.monthly_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month date NOT NULL,
  avg_daily_calories numeric,
  avg_protein_g numeric,
  avg_goal_percent numeric,
  weight_change_kg numeric,
  best_week date,
  ai_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, month)
);
ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.monthly_summaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.monthly_summaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.monthly_summaries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.monthly_summaries FOR DELETE USING (auth.uid() = user_id);

-- chat_sessions
CREATE TABLE public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  summary text,
  nutrition_data jsonb,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- weight_logs
CREATE TABLE public.weight_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg numeric NOT NULL,
  logged_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.weight_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.weight_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.weight_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.weight_logs FOR DELETE USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_user_profiles_updated BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_user_goals_updated BEFORE UPDATE ON public.user_goals
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_daily_user_date ON public.daily_summaries(user_id, date DESC);
CREATE INDEX idx_weekly_user ON public.weekly_summaries(user_id, week_start DESC);
CREATE INDEX idx_monthly_user ON public.monthly_summaries(user_id, month DESC);
CREATE INDEX idx_chat_user ON public.chat_sessions(user_id, created_at DESC);
CREATE INDEX idx_weight_user ON public.weight_logs(user_id, logged_at DESC);
CREATE INDEX idx_user_goals_user ON public.user_goals(user_id);