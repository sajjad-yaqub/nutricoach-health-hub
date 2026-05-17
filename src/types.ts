// TypeScript Interfaces for NutriCoach

export interface UserProfile {
  id: string;
  name: string;
  sex: 'Male' | 'Female';
  age: number;
  height_cm: number;
  weight_kg: number;
  activity_level: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Athlete';
  goal: 'Lose Weight' | 'Maintain' | 'Build Muscle';
  dietary_preferences: string[];
  health_conditions: string[];
  onboarding_complete: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserGoal {
  id?: string;
  user_id: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  water_ml: number;
  vitamin_c_mg: number;
  iron_mg: number;
  calcium_mg: number;
  magnesium_mg: number;
  zinc_mg: number;
  potassium_mg: number;
  updated_at?: string;
}

export interface DailySummary {
  id?: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  calories_consumed: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  water_ml: number;
  goal_hit_percent: number;
  streak_day: number;
  ai_notes: string;
  created_at?: string;
}

export interface WeeklySummary {
  id?: string;
  user_id: string;
  week_start: string; // YYYY-MM-DD (Monday)
  avg_calories: number;
  avg_protein_g: number;
  avg_fiber_g: number;
  avg_goal_percent: number;
  best_day: string; // YYYY-MM-DD
  worst_day: string; // YYYY-MM-DD
  weight_start_kg: number;
  weight_end_kg: number;
  ai_notes: string;
}

export interface MonthlySummary {
  id?: string;
  user_id: string;
  month: string; // YYYY-MM-01
  avg_daily_calories: number;
  avg_protein_g: number;
  avg_goal_percent: number;
  weight_change_kg: number;
  best_week: string; // YYYY-MM-DD
  ai_notes: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  nutrition_data: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    water: number;
    messages?: Array<{
      id: string;
      sender: 'user' | 'ai';
      text: string;
      timestamp: string;
    }>;
  };
  started_at: string;
  ended_at?: string;
  created_at?: string;
}

export interface WeightLog {
  id?: string;
  user_id: string;
  weight_kg: number;
  logged_at: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

// Dummy runtime exports to satisfy ES module imports in browser
export const UserProfile = {};
export const UserGoal = {};
export const DailySummary = {};
export const WeeklySummary = {};
export const MonthlySummary = {};
export const ChatSession = {};
export const WeightLog = {};
export const Message = {};
