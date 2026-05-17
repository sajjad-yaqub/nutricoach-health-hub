import { UserProfile, UserGoal, DailySummary, WeightLog, ChatSession } from './types';

export const MOCK_PROFILE: UserProfile = {
  id: 'demo-user-id',
  name: 'Sajjad',
  sex: 'Male',
  age: 28,
  height_cm: 180,
  weight_kg: 78.5,
  activity_level: 'Moderately Active',
  goal: 'Lose Weight',
  dietary_preferences: ['None'],
  health_conditions: ['None'],
  onboarding_complete: true,
};

// Calculated via the exact onboarding formulas:
// BMR = (10 * 78.5) + (6.25 * 180) - (5 * 28) + 5 = 785 + 1125 - 140 + 5 = 1775
// TDEE = 1775 * 1.55 (Moderately Active) = 2751
// Calories goal (Lose Weight) = 2751 - 500 = 2251
// Protein goal (Lose Weight) = 78.5 * 1.8 = 141.3 g
// Carbs goal = (2251 * 0.50) / 4 = 281.4 g
// Fat goal = (2251 * 0.27) / 9 = 67.5 g
// Fiber goal = 38 g (Male under 50)
// Water goal = 78.5 * 35 = 2747.5 ml
export const MOCK_GOALS: UserGoal = {
  user_id: 'demo-user-id',
  calories: 2251,
  protein_g: 141.3,
  carbs_g: 281.4,
  fat_g: 67.5,
  fiber_g: 38.0,
  water_ml: 2750.0,
  vitamin_c_mg: 90.0,
  iron_mg: 8.0,
  calcium_mg: 1000.0,
  magnesium_mg: 400.0,
  zinc_mg: 11.0,
  potassium_mg: 3400.0,
};

// Realistic daily logs for the past week to showcase high-fidelity charts and streak!
const today = new Date();
const formatDate = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(today.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

export const MOCK_DAILY_SUMMARIES: DailySummary[] = [
  {
    user_id: 'demo-user-id',
    date: formatDate(6),
    calories_consumed: 2150,
    protein_g: 135.0,
    carbs_g: 270.0,
    fat_g: 62.0,
    fiber_g: 36.0,
    water_ml: 2500,
    goal_hit_percent: 94.8,
    streak_day: 1,
    ai_notes: 'Excellent start! Calories were tightly controlled, and protein goal was nearly hit. Fiber intake was fantastic with oats and broccoli. Try adding 250ml water to hit the hydration mark tomorrow.',
  },
  {
    user_id: 'demo-user-id',
    date: formatDate(5),
    calories_consumed: 2310,
    protein_g: 145.2,
    carbs_g: 290.0,
    fat_g: 70.0,
    fiber_g: 39.5,
    water_ml: 2800,
    goal_hit_percent: 100.0, // hit both calories and macros perfectly
    streak_day: 2,
    ai_notes: 'A perfect day, Sajjad! Hit every single target. Protein was high at 145g, water reached 2.8L, and calories were spot on for weight loss. You hit a great balance between chicken breast and sweet potato.',
  },
  {
    user_id: 'demo-user-id',
    date: formatDate(4),
    calories_consumed: 2200,
    protein_g: 120.0, // a bit low on protein
    carbs_g: 300.0,
    fat_g: 60.0,
    fiber_g: 25.0, // low fiber
    water_ml: 2200, // low water
    goal_hit_percent: 78.5,
    streak_day: 3,
    ai_notes: 'Streak maintained! Although protein and fiber were slightly under 80%, you kept your calories within the deficit limit. Hydration dropped to 2.2L. Incorporate some chia seeds or berries for a quick fiber boost tomorrow.',
  },
  {
    user_id: 'demo-user-id',
    date: formatDate(3),
    calories_consumed: 2450, // slightly over calories
    protein_g: 148.0,
    carbs_g: 260.0,
    fat_g: 75.0,
    fiber_g: 42.0,
    water_ml: 3000,
    goal_hit_percent: 88.0,
    streak_day: 4,
    ai_notes: 'Solid recovery! Calories were slightly over by 200kcal, but the protein and fiber targets were smashed. The post-workout meal was dense in micronutrients. Your water intake was stellar today at 3.0L.',
  },
  {
    user_id: 'demo-user-id',
    date: formatDate(2),
    calories_consumed: 2180,
    protein_g: 139.5,
    carbs_g: 275.0,
    fat_g: 64.0,
    fiber_g: 38.0,
    water_ml: 2750,
    goal_hit_percent: 98.2,
    streak_day: 5,
    ai_notes: 'Excellent consistency, Sajjad. Calories were within 3%, and protein was right on the dot. Very clean eating today with greek yogurt, egg whites, and a colorful salad. Your streak is now 5 days! Keep pushing!',
  },
  {
    user_id: 'demo-user-id',
    date: formatDate(1),
    calories_consumed: 2220,
    protein_g: 142.0,
    carbs_g: 280.0,
    fat_g: 66.0,
    fiber_g: 39.0,
    water_ml: 2900,
    goal_hit_percent: 99.5,
    streak_day: 6,
    ai_notes: 'Awesome day yesterday! You managed to hit all major goals. Protein and fiber goals are locked in. The evening walk added a great calorie buffer. Ready to smash today and hit a 7-day streak?',
  },
];

export const MOCK_WEIGHT_LOGS: WeightLog[] = [
  { user_id: 'demo-user-id', weight_kg: 80.5, logged_at: formatDate(30) + 'T08:00:00Z' },
  { user_id: 'demo-user-id', weight_kg: 80.0, logged_at: formatDate(24) + 'T08:00:00Z' },
  { user_id: 'demo-user-id', weight_kg: 79.7, logged_at: formatDate(18) + 'T08:00:00Z' },
  { user_id: 'demo-user-id', weight_kg: 79.2, logged_at: formatDate(12) + 'T08:00:00Z' },
  { user_id: 'demo-user-id', weight_kg: 78.8, logged_at: formatDate(6) + 'T08:00:00Z' },
  { user_id: 'demo-user-id', weight_kg: 78.5, logged_at: formatDate(0) + 'T08:00:00Z' },
];

export const MOCK_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'session-1',
    user_id: 'demo-user-id',
    title: 'Protein-packed Lunch log',
    summary: 'Logged a grilled chicken breast salad and checked remaining goals.',
    nutrition_data: { calories: 450, protein: 48, carbs: 12, fat: 18, fiber: 6, water: 250 },
    started_at: formatDate(1) + 'T13:00:00Z',
    ended_at: formatDate(1) + 'T13:10:00Z',
    created_at: formatDate(1) + 'T13:00:00Z',
  },
  {
    id: 'session-2',
    user_id: 'demo-user-id',
    title: 'Morning Breakfast & Oats',
    summary: 'Logged oatmeal with banana, almond milk, and whey protein scoop.',
    nutrition_data: { calories: 380, protein: 32, carbs: 48, fat: 8, fiber: 9, water: 300 },
    started_at: formatDate(0) + 'T08:15:00Z',
    ended_at: formatDate(0) + 'T08:25:00Z',
    created_at: formatDate(0) + 'T08:15:00Z',
  },
];
