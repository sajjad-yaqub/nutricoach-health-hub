import React, { useState, useEffect } from 'react';
import { UserProfile, UserGoal, DailySummary } from '../types';
import { dbService } from '../services/db';
import { aiService } from '../services/ai';
import { 
  Calendar, 
  Sparkles, 
  Check, 
  ShoppingBag, 
  Clock, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Award,
  ChevronRight,
  UtensilsCrossed
} from 'lucide-react';

interface WeeklyPlannerProps {
  profile: UserProfile;
  goals: UserGoal;
  dailySummaries: DailySummary[];
  onRefreshData: () => Promise<void>;
  onAddToast: (msg: string, type: 'success' | 'error') => void;
}

interface PlannedMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface DayPlan {
  breakfast: PlannedMeal;
  lunch: PlannedMeal;
  snack: PlannedMeal;
  dinner: PlannedMeal;
}

interface WeeklyPlan {
  days: Record<string, DayPlan>; // 'Monday', 'Tuesday', ...
  groceryList: Array<{ item: string; category: string; checked: boolean }>;
  prepGuide: string[];
}

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  profile,
  goals,
  dailySummaries,
  onRefreshData,
  onAddToast,
}) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);

  // Load plan from local storage on mount
  useEffect(() => {
    const savedPlan = localStorage.getItem('nutricoach_weekly_plan');
    if (savedPlan) {
      try {
        setPlan(JSON.parse(savedPlan));
      } catch (e) {
        console.error('Failed to parse saved plan:', e);
      }
    } else {
      // Load premium default Indian Urban plan matching goal
      const defaultPlan = generateLocalDefaultPlan(profile.goal, goals);
      setPlan(defaultPlan);
      localStorage.setItem('nutricoach_weekly_plan', JSON.stringify(defaultPlan));
    }
  }, [profile.goal, goals]);

  // Save plan back when modified (e.g. toggling grocery items)
  const savePlanToStorage = (updatedPlan: WeeklyPlan) => {
    setPlan(updatedPlan);
    localStorage.setItem('nutricoach_weekly_plan', JSON.stringify(updatedPlan));
  };

  // Toggle grocery checkbox
  const handleToggleGrocery = (index: number) => {
    if (!plan) return;
    const updatedGroceries = [...plan.groceryList];
    updatedGroceries[index].checked = !updatedGroceries[index].checked;
    savePlanToStorage({
      ...plan,
      groceryList: updatedGroceries
    });
  };

  // Trigger Gemini AI generation for plan
  const handleGenerateAIPlan = async () => {
    setLoading(true);
    onAddToast('Curating your personal Indian urban meal plan... 🍛', 'success');
    
    try {
      if (aiService.isGeminiConfigured) {
        // Let's generate a highly customized prompt for Gemini
        const prompt = `Generate a comprehensive 7-day Indian urban weekly meal planner. 
User Profile: Goal is ${profile.goal}, Sex is ${profile.sex}, Age is ${profile.age}, Weight is ${profile.weight_kg}kg.
Target daily calories: ${goals.calories} kcal, Protein: ${goals.protein_g}g, Fiber: ${goals.fiber_g}g.
Dietary constraints: ${profile.dietary_preferences.join(', ') || 'None'}.
Health conditions: ${profile.health_conditions.join(', ') || 'None'}.

Instructions:
1. Propose realistic, high-quality Indian urban/semi-urban recipes (e.g. Paneer Bhurji with Wheat Roti, Moong Dal Khichdi, Besan Chilla, Sattu Buttermilk, Egg Bhurji, Oats Kheer, Chicken Tikka, Chana Salad).
2. Distribute daily target calories: Breakfast (25%), Lunch (35%), Snack (10%), Dinner (30%).
3. Calculate exact macros (calories, protein, carbs, fat, fiber) for each meal.
4. Output a highly organized JSON structure at the VERY end inside a block like:
:::WEEKLY_PLAN:::
{
  "days": {
    "Monday": {
      "breakfast": {"name": "...", "calories": 350, "protein": 18, "carbs": 40, "fat": 12, "fiber": 6},
      "lunch": {"name": "...", "calories": 500, "protein": 30, "carbs": 60, "fat": 14, "fiber": 8},
      "snack": {"name": "...", "calories": 150, "protein": 8, "carbs": 15, "fat": 5, "fiber": 3},
      "dinner": {"name": "...", "calories": 400, "protein": 24, "carbs": 45, "fat": 10, "fiber": 6}
    },
    ... [Repeat for Tuesday through Sunday]
  },
  "groceryList": [
    {"item": "Paneer", "category": "Proteins"},
    {"item": "Sprouts / Moong Dal", "category": "Proteins"},
    {"item": "Eggs / Chicken", "category": "Proteins"},
    {"item": "Whole Wheat Atta / Oats", "category": "Staples"},
    {"item": "Greek Yogurt / Curd", "category": "Dairy"},
    {"item": "Makhana / Roasted Chana", "category": "Snacks"},
    {"item": "Spinach, Broccoli, Tomato, Onion", "category": "Fresh Produce"}
  ],
  "prepGuide": [
    "Boil your sprouts on Sunday evening to make morning salads easy",
    "Marinate chicken breast/paneer cubes in low-fat dahi for juicy texture",
    "Chop vegetables (carrots, beans, capsicum) in batch and store in containers",
    "Prepare sattu mixture powder in a jar for instant protein drinks"
  ]
}
:::
Never output asterisks in your explanation text before the block. Make sure JSON is strictly valid.`;

        // Request AI answer via Gemini
        const result = await aiService.getResponse(prompt, profile, goals, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 }, []);
        const rawText = result.reply;
        
        const planMatch = rawText.match(/:::WEEKLY_PLAN:::([\s\S]*):::/);
        if (planMatch) {
          const parsed = JSON.parse(planMatch[1].trim());
          // Map grocery checked values
          const mappedGroceries = parsed.groceryList.map((g: any) => ({
            item: g.item,
            category: g.category || 'Other',
            checked: false
          }));
          const completedPlan: WeeklyPlan = {
            days: parsed.days,
            groceryList: mappedGroceries,
            prepGuide: parsed.prepGuide || []
          };
          savePlanToStorage(completedPlan);
          onAddToast('AI Weekly Planner generated successfully! ⚡', 'success');
        } else {
          throw new Error('AI responded, but failed to format the structured meal planner.');
        }
      } else {
        // Fallback to local default generation
        const localGenerated = generateLocalDefaultPlan(profile.goal, goals);
        savePlanToStorage(localGenerated);
        onAddToast('Curated Indian Urban plan loaded! 🥗', 'success');
      }
    } catch (err) {
      console.error('Plan generation failed, using optimized local presets:', err);
      const localGenerated = generateLocalDefaultPlan(profile.goal, goals);
      savePlanToStorage(localGenerated);
      onAddToast('Loaded local optimized meal targets.', 'success');
    } finally {
      setLoading(false);
    }
  };

  // One-click log day plan straight to daily tracker
  const handleLogDayPlan = async (dayName: string) => {
    if (!plan) return;
    const dayPlan = plan.days[dayName];
    if (!dayPlan) return;

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const existingSummary = dailySummaries.find(s => s.date === todayStr);

      const totalCal = dayPlan.breakfast.calories + dayPlan.lunch.calories + dayPlan.snack.calories + dayPlan.dinner.calories;
      const totalPro = dayPlan.breakfast.protein + dayPlan.lunch.protein + dayPlan.snack.protein + dayPlan.dinner.protein;
      const totalCar = dayPlan.breakfast.carbs + dayPlan.lunch.carbs + dayPlan.snack.carbs + dayPlan.dinner.fat;
      const totalFat = dayPlan.breakfast.fat + dayPlan.lunch.fat + dayPlan.snack.fat + dayPlan.dinner.fat;
      const totalFib = dayPlan.breakfast.fiber + dayPlan.lunch.fiber + dayPlan.snack.fiber + dayPlan.dinner.fiber;

      // Accumulate or overwrite summary
      const updatedSummary: DailySummary = {
        user_id: profile.id,
        date: todayStr,
        calories_consumed: (existingSummary?.calories_consumed || 0) + totalCal,
        protein_g: Number(((existingSummary?.protein_g || 0) + totalPro).toFixed(1)),
        carbs_g: Number(((existingSummary?.carbs_g || 0) + totalCar).toFixed(1)),
        fat_g: Number(((existingSummary?.fat_g || 0) + totalFat).toFixed(1)),
        fiber_g: Number(((existingSummary?.fiber_g || 0) + totalFib).toFixed(1)),
        water_ml: existingSummary?.water_ml || 0,
        goal_hit_percent: existingSummary?.goal_hit_percent || 0,
        streak_day: existingSummary?.streak_day || 0,
        ai_notes: existingSummary?.ai_notes 
          ? `${existingSummary.ai_notes}. Logged planner meals for ${dayName}.`
          : `Logged planned meals for ${dayName} via Weekly Planner.`,
      };

      // Calculate goal hit percentage
      const cPct = Math.min(100, (updatedSummary.calories_consumed / goals.calories) * 100);
      const pPct = Math.min(100, (updatedSummary.protein_g / goals.protein_g) * 100);
      const fPct = Math.min(100, (updatedSummary.fiber_g / goals.fiber_g) * 100);
      updatedSummary.goal_hit_percent = parseFloat(((cPct + pPct + fPct) / 3).toFixed(1));

      await dbService.upsertDailySummary(updatedSummary);
      await onRefreshData();
      onAddToast(`Logged ${dayName}'s planned meals (${totalCal} kcal) to today's dashboard! 🍽️`, 'success');
    } catch (err) {
      console.error('Failed to log day plan:', err);
      onAddToast('Could not log plan to database.', 'error');
    }
  };

  // Local rule-based weekly plans tailored specifically to Indian urban demographics
  const generateLocalDefaultPlan = (goal: string, goals: UserGoal): WeeklyPlan => {
    const isWeightLoss = goal === 'Lose Weight';
    const isMuscle = goal === 'Build Muscle';

    const bMeal = isWeightLoss 
      ? { name: '2 Egg Whites + 1 Whole Egg Bhurji with Multigrain Roti', calories: Math.round(goals.calories * 0.25), protein: Math.round(goals.protein_g * 0.3), carbs: 30, fat: 8, fiber: 5 }
      : isMuscle 
      ? { name: 'Sattu Milkshake (3 tbsp Sattu + Milk) + Besan Chilla with Paneer stuffing', calories: Math.round(goals.calories * 0.25), protein: Math.round(goals.protein_g * 0.35), carbs: 45, fat: 12, fiber: 7 }
      : { name: 'Oats Vegetable Upma with roasted peanuts + 1 glass Butter Milk', calories: Math.round(goals.calories * 0.25), protein: Math.round(goals.protein_g * 0.25), carbs: 40, fat: 10, fiber: 6 };

    const lMeal = isWeightLoss
      ? { name: 'Moong Dal (1 bowl) + Steamed Cauliflower Sabzi + 1 Multigrain Roti + Cucumber Raita', calories: Math.round(goals.calories * 0.35), protein: Math.round(goals.protein_g * 0.3), carbs: 40, fat: 8, fiber: 8 }
      : isMuscle
      ? { name: 'Grilled Chicken Breast (150g) OR Pan-seared Tofu with Brown Rice, Dal Tadka & Beetroot Salad', calories: Math.round(goals.calories * 0.35), protein: Math.round(goals.protein_g * 0.4), carbs: 60, fat: 12, fiber: 9 }
      : { name: 'Paneer Bhurji (100g Paneer) with 2 Wheat Rotis, Dal Tadka and green salad', calories: Math.round(goals.calories * 0.35), protein: Math.round(goals.protein_g * 0.3), carbs: 50, fat: 10, fiber: 7 };

    const sMeal = {
      name: 'Roasted Makhana (1 bowl) with Black tea OR Roasted Chana',
      calories: Math.round(goals.calories * 0.1),
      protein: Math.round(goals.protein_g * 0.1),
      carbs: 18,
      fat: 3,
      fiber: 4
    };

    const dMeal = isWeightLoss
      ? { name: 'Light Moong Dal Khichdi with Flaxseed Raita & Salad', calories: Math.round(goals.calories * 0.3), protein: Math.round(goals.protein_g * 0.25), carbs: 35, fat: 6, fiber: 7 }
      : isMuscle
      ? { name: 'Soya Chunks Curry (80g dry weight) with 2 Rotis OR Grilled Fish with Steamed Broccoli', calories: Math.round(goals.calories * 0.3), protein: Math.round(goals.protein_g * 0.35), carbs: 50, fat: 10, fiber: 8 }
      : { name: 'Mixed Veg Kadai with 2 Wheat Rotis and 1 Bowl Yellow Dal', calories: Math.round(goals.calories * 0.3), protein: Math.round(goals.protein_g * 0.25), carbs: 45, fat: 9, fiber: 6 };

    const days: Record<string, DayPlan> = {};
    daysOfWeek.forEach(day => {
      days[day] = {
        breakfast: { ...bMeal },
        lunch: { ...lMeal },
        snack: { ...sMeal },
        dinner: { ...dMeal }
      };
    });

    return {
      days,
      groceryList: [
        { item: 'Paneer (500g)', category: 'Proteins', checked: false },
        { item: 'Eggs (1 Dozen) / Soya chunks', category: 'Proteins', checked: false },
        { item: 'Moong Dal / Yellow Dal', category: 'Proteins', checked: false },
        { item: 'Whole Wheat Atta / Besan', category: 'Staples', checked: false },
        { item: 'Oats / Brown Rice', category: 'Staples', checked: false },
        { item: 'Curd / Double toned Milk', category: 'Dairy', checked: false },
        { item: 'Makhana / Roasted Chana', category: 'Snacks', checked: false },
        { item: 'Fresh Produce (Broccoli, Spinach, Beetroot, Onion, Tomato)', category: 'Fresh Produce', checked: false }
      ],
      prepGuide: [
        "Soak pulses and chana on Sunday morning to ease cooking during weekdays",
        "Keep chopped ginger-garlic-onion paste prepared for easy tempering/tadka",
        "Prepare home-cooked curd in batches of 2-3 days to preserve healthy gut flora",
        "Roast a large jar of Makhana with healthy spices (haldi, salt, pepper) for quick snacks"
      ]
    };
  };

  const activeDayPlan = plan?.days[selectedDay];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-0 overflow-y-auto no-scrollbar pb-24 md:pb-6">
      
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-8 text-white relative overflow-hidden shrink-0 shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full opacity-20 blur-xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-400 rounded-full opacity-10 blur-lg -ml-8 -mb-8" />
        
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-100 flex items-center gap-1.5 mb-1 bg-emerald-700/50 px-2.5 py-1 rounded-full w-fit">
              <Calendar size={10} /> WEEKLY KITCHEN ENGINE
            </span>
            <h1 className="text-2xl font-black font-sans tracking-tight">Plan My Week</h1>
            <p className="text-xs text-emerald-100/90 max-w-md mt-1">
              Curate and lock in custom Indian urban recipes matching your calorie targets.
            </p>
          </div>
          
          <button
            onClick={handleGenerateAIPlan}
            disabled={loading}
            className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 duration-150 font-bold px-4 py-2.5 rounded-2xl shadow-lg hover:shadow-xl text-xs disabled:opacity-70 disabled:cursor-wait"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} className="text-yellow-500 fill-yellow-500" />
            )}
            {loading ? 'Consulting Gemini AI...' : '⚡ Generate AI Plan'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* LEFT COLUMN: DAYS SELECTOR & MEAL LIST */}
        <div className="md:col-span-2 flex flex-col gap-5">
          
          {/* HORIZONTAL CALENDAR SELECTOR */}
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
            {daysOfWeek.map(day => {
              const isActive = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-[11px] shrink-0 active:scale-95 duration-100 ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>

          {/* ACTIVE DAY MEALS VIEW */}
          {activeDayPlan ? (
            <div className="flex flex-col gap-4">
              
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                    <UtensilsCrossed size={15} className="text-emerald-500" /> {selectedDay}'s Menu Target
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Calorie Budget: {goals.calories} kcal | Protein Target: {goals.protein_g}g
                  </p>
                </div>
                <button
                  onClick={() => handleLogDayPlan(selectedDay)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 font-extrabold text-[10px] px-3.5 py-2 rounded-xl active:scale-95 duration-150 flex items-center gap-1 shrink-0"
                >
                  <Plus size={12} /> Log to Today
                </button>
              </div>

              {/* MEALS LIST: BREAKFAST, LUNCH, SNACK, DINNER */}
              {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map(mealKey => {
                const meal = activeDayPlan[mealKey];
                const emoji = mealKey === 'breakfast' ? '🍳' : mealKey === 'lunch' ? '🍱' : mealKey === 'snack' ? '🍵' : '🍲';
                const label = mealKey.toUpperCase();
                
                return (
                  <div 
                    key={mealKey} 
                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-emerald-100 transition duration-200 group flex flex-col md:flex-row justify-between items-start md:items-center gap-3 relative overflow-hidden"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{emoji}</span>
                        <span className="text-[9px] font-black tracking-widest text-slate-400">{label}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 mt-1 leading-relaxed">
                        {meal.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 md:self-center shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-black text-emerald-600">{meal.calories} kcal</div>
                        <div className="text-[9px] text-slate-400 font-bold">Protein: {meal.protein}g</div>
                      </div>
                      <div className="w-1.5 h-8 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: '100%', height: `${Math.min(100, (meal.protein / (goals.protein_g * 0.25)) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-200 text-center shadow-inner">
              <Sparkles size={32} className="text-slate-300 mx-auto animate-pulse" />
              <h3 className="font-extrabold text-sm text-slate-700 mt-3">No Plan Active</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Tap the "⚡ Generate AI Plan" button at the top to draft your curated nutritional structure.
              </p>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: GROCERY LIST & MEAL PREP STRATEGIES */}
        <div className="flex flex-col gap-5">
          
          {/* GROCERY SHOPPING LIST */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                <ShoppingBag size={14} className="text-emerald-500" /> 🛒 Grocery Shopping List
              </h3>
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {plan?.groceryList.filter(g => !g.checked).length || 0} left
              </span>
            </div>

            <div className="flex flex-col gap-2.5 mt-4 max-h-[300px] overflow-y-auto no-scrollbar">
              {plan && plan.groceryList.length > 0 ? (
                plan.groceryList.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleToggleGrocery(idx)}
                    className="flex items-start gap-2.5 text-left group active:scale-98 duration-100"
                  >
                    <div className="shrink-0 mt-0.5">
                      {item.checked ? (
                        <div className="w-4.5 h-4.5 bg-emerald-500 rounded flex items-center justify-center text-white border border-emerald-500">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-4.5 h-4.5 rounded border border-slate-300 group-hover:border-emerald-500 transition" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium leading-tight ${
                        item.checked ? 'text-slate-400 line-through' : 'text-slate-700'
                      }`}>
                        {item.item}
                      </p>
                      <span className="text-[8px] font-extrabold uppercase tracking-wide text-slate-400">
                        {item.category}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Generate a plan to compile groceries.
                </div>
              )}
            </div>
          </div>

          {/* MEAL PREP & BATCH COOKING GUIDES */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5 pb-3 border-b border-slate-100">
              <Clock size={14} className="text-emerald-500" /> 🕒 Batch Meal Prep Guide
            </h3>

            <div className="flex flex-col gap-3 mt-4">
              {plan && plan.prepGuide.length > 0 ? (
                plan.prepGuide.map((step, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start">
                    <span className="w-4.5 h-4.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      {step}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Generate plan to load strategies.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
