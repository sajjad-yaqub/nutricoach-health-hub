import React, { useState, useEffect } from 'react';
import { UserProfile, UserGoal, DailySummary, ChatSession, WeightLog } from '../types';
import { dbService } from '../services/db';
import { Flame, Plus, Droplet, Scale, ChevronRight, MessageSquare, AlertCircle, TrendingUp, Sparkles, X, PlusCircle } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  goals: UserGoal;
  dailySummaries: DailySummary[];
  chatSessions: ChatSession[];
  weightLogs: WeightLog[];
  onNavigateToTab: (tab: 'dashboard' | 'chat' | 'reports' | 'profile', activeChatId?: string) => void;
  onRefreshData: () => Promise<void>;
  onAddToast: (msg: string, type: 'success' | 'error') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  goals,
  dailySummaries,
  chatSessions,
  weightLogs,
  onNavigateToTab,
  onRefreshData,
  onAddToast,
}) => {
  // Modal states
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [waterInput, setWaterInput] = useState('250');
  const [weightInput, setWeightInput] = useState(String(profile.weight_kg));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeBanner, setActiveBanner] = useState<string | null>(null);

  // Load today's logs
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySummary = dailySummaries.find(s => s.date === todayStr);

  const calConsumed = todaySummary?.calories_consumed || 0;
  const proConsumed = todaySummary?.protein_g || 0;
  const fibConsumed = todaySummary?.fiber_g || 0;
  const watConsumed = todaySummary?.water_ml || 0;

  const calPct = goals.calories > 0 ? (calConsumed / goals.calories) * 100 : 0;
  const proPct = goals.protein_g > 0 ? (proConsumed / goals.protein_g) * 100 : 0;
  const fibPct = goals.fiber_g > 0 ? (fibConsumed / goals.fiber_g) * 100 : 0;
  const watPct = goals.water_ml > 0 ? (watConsumed / goals.water_ml) * 100 : 0;

  // Streak calculation
  const currentStreak = todaySummary?.streak_day || (dailySummaries.length > 0 ? dailySummaries[dailySummaries.length - 1].streak_day : 0);

  // 1. Process Smart Banners & Alerts
  useEffect(() => {
    const hours = new Date().getHours();
    
    // Banner 1: No food logged by 2pm local time
    if (calConsumed === 0 && hours >= 14) {
      setActiveBanner('log_reminder');
      return;
    }

    // Banner 2: 7-day streak celebration
    if (currentStreak >= 7) {
      setActiveBanner('streak_celebration');
      return;
    }

    // Banner 3: Nutrient below 50% for 5+ consecutive days
    const recent5 = dailySummaries.slice(-5);
    if (recent5.length >= 5) {
      const lowPro = recent5.every(s => (s.protein_g / goals.protein_g) < 0.5);
      if (lowPro) {
        setActiveBanner('low_protein_warning');
        return;
      }
      const lowFib = recent5.every(s => (s.fiber_g / goals.fiber_g) < 0.5);
      if (lowFib) {
        setActiveBanner('low_fiber_warning');
        return;
      }
    }
  }, [calConsumed, currentStreak, dailySummaries, goals]);

  // 2. Fetch or Generate Smart Insights
  const getSmartInsight = () => {
    if (dailySummaries.length === 0) {
      return "Start chatting with your AI Coach to log your breakfast and kick off your tracking! 🍳";
    }
    
    const recent = dailySummaries.slice(-3);
    const avgGoalPercent = recent.reduce((sum, s) => sum + Number(s.goal_hit_percent), 0) / recent.length;
    
    if (avgGoalPercent >= 90) {
      return "Sensational week! Your daily goal hit rate is averaging over 90% 💪 Keep logging through chat to lock in this streak!";
    }

    // Check if protein is low
    const lowProteinDays = recent.filter(s => (s.protein_g / goals.protein_g) < 0.75).length;
    if (lowProteinDays >= 2) {
      return "💡 Coaching Tip: You've been slightly low on protein in 2 of the past 3 days. Try logging some Greek yogurt or egg whites to boost recovery!";
    }

    // Check if fiber is high
    const highFiberDays = recent.filter(s => s.fiber_g >= goals.fiber_g).length;
    if (highFiberDays >= 2) {
      return "🥦 Incredible work! Your fiber targets have been fully locked in. This digest stability greatly supports fat loss!";
    }

    return "Stay consistent! Logging meals through chat takes less than 10 seconds. You are making great progress towards your weight loss goals.";
  };

  // 3. Quick Action: Log Water
  const handleLogWater = async (e: React.FormEvent) => {
    e.preventDefault();
    const ml = parseInt(waterInput, 10);
    if (isNaN(ml) || ml <= 0) return;

    setIsSubmitting(true);
    try {
      // Fetch current summary or create new
      const existing = dailySummaries.find(s => s.date === todayStr);
      const updatedSummary: DailySummary = existing 
        ? {
            ...existing,
            water_ml: Number(existing.water_ml) + ml,
          }
        : {
            user_id: profile.id,
            date: todayStr,
            calories_consumed: 0,
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
            fiber_g: 0,
            water_ml: ml,
            goal_hit_percent: 0,
            streak_day: 0,
            ai_notes: 'Logged water intake.',
          };

      // Recalculate hit percent
      const cPct = Math.min(100, (updatedSummary.calories_consumed / goals.calories) * 100);
      const pPct = Math.min(100, (updatedSummary.protein_g / goals.protein_g) * 100);
      const fPct = Math.min(100, (updatedSummary.fiber_g / goals.fiber_g) * 100);
      updatedSummary.goal_hit_percent = parseFloat(((cPct + pPct + fPct) / 3).toFixed(1));

      await dbService.upsertDailySummary(updatedSummary);
      await onRefreshData();
      onAddToast(`Logged ${ml}ml water! 💧`, 'success');
      setShowWaterModal(false);
    } catch (err) {
      console.error(err);
      onAddToast('Failed to log water.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Quick Action: Log Weight
  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const kg = parseFloat(weightInput);
    if (isNaN(kg) || kg <= 0) return;

    setIsSubmitting(true);
    try {
      const logObj: WeightLog = {
        user_id: profile.id,
        weight_kg: kg,
        logged_at: new Date().toISOString(),
      };

      await dbService.addWeightLog(logObj);
      await onRefreshData();
      onAddToast(`Logged weight: ${kg} kg! ⚖️`, 'success');
      setShowWeightModal(false);
    } catch (err) {
      console.error(err);
      onAddToast('Failed to log weight.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Generate Last 7 Days SVG Chart Data
  const getChartData = () => {
    const last7 = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const match = dailySummaries.find(s => s.date === dStr);
      
      last7.push({
        label: weekdays[d.getDay()],
        value: match ? Math.min(100, Number(match.goal_hit_percent)) : 0,
        date: dStr,
      });
    }
    return last7;
  };

  const chartData = getChartData();
  
  // Progress bar color generator
  const getProgressBarColor = (pct: number) => {
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-yellow-500';
    return 'bg-rose-500';
  };

  const getProgressBarBgColor = (pct: number) => {
    if (pct >= 80) return 'bg-emerald-100';
    if (pct >= 50) return 'bg-yellow-100';
    return 'bg-rose-100';
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 fade-in no-scrollbar">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <h2 className="text-2xl font-bold text-slate-800 font-heading">
            Hey {profile.name} 👋
          </h2>
        </div>
        
        {/* Streak Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-extrabold text-xs shadow-md shadow-orange-500/15 select-none hover:scale-105 duration-200">
          <Flame size={14} className="fill-white" />
          <span>{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</span>
        </div>
      </div>

      {/* SMART BANNER */}
      {activeBanner && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white relative shadow-lg shadow-emerald-600/15 slide-up">
          <button 
            onClick={() => setActiveBanner(null)}
            className="absolute top-3 right-3 text-white/80 hover:text-white"
          >
            <X size={15} />
          </button>
          
          {activeBanner === 'log_reminder' && (
            <div className="flex gap-3">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm font-heading">Hungry? 🥗</h4>
                <p className="text-xs text-white/90 leading-relaxed mt-0.5">
                  It's past 2:00 PM and you haven't logged any food yet. Don't forget to track your lunch with your AI Coach!
                </p>
              </div>
            </div>
          )}

          {activeBanner === 'streak_celebration' && (
            <div className="flex gap-3">
              <Sparkles size={20} className="shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm font-heading">You are on fire! 🔥</h4>
                <p className="text-xs text-white/90 leading-relaxed mt-0.5">
                  Congratulations on hitting a **7-day streak**! Your consistency is outstanding. Let's make today number 8!
                </p>
              </div>
            </div>
          )}

          {activeBanner === 'low_protein_warning' && (
            <div className="flex gap-3">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm font-heading">Protein Support Required ⚠️</h4>
                <p className="text-xs text-white/90 leading-relaxed mt-0.5">
                  You have been below 50% of your protein targets for 5 days. Ask NutriCoach for "high protein lunch ideas"!
                </p>
              </div>
            </div>
          )}

          {activeBanner === 'low_fiber_warning' && (
            <div className="flex gap-3">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm font-heading">Fiber Intake Alert 🥦</h4>
                <p className="text-xs text-white/90 leading-relaxed mt-0.5">
                  You have been low on fiber lately. Want some quick fiber recommendations? Tap "Log a meal" to ask.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TODAY'S PROGRESS CARD */}
      <div className="p-5 rounded-3xl bg-white border border-emerald-100 shadow-sm mb-6">
        <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-1.5 font-heading">
          <Sparkles size={16} className="text-emerald-500" />
          Today's Nutrition Summary
        </h3>

        {calConsumed === 0 && watConsumed === 0 && proConsumed === 0 ? (
          <div className="py-6 text-center">
            <p className="text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed mb-4">
              Start chatting to log today's food, water, or workouts and watch your trackers fill up!
            </p>
            <button
              onClick={() => onNavigateToTab('chat')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-full shadow-md shadow-emerald-600/10 active:scale-95 duration-150"
            >
              <MessageSquare size={13} /> Log First Meal
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            
            {/* Calories */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">🔥 Calories</span>
                <span className="text-slate-800">{calConsumed} / {goals.calories} kcal <span className="text-slate-400">({Math.round(calPct)}%)</span></span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(calPct)}`} 
                  style={{ width: `${Math.min(100, calPct)}%` }}
                />
              </div>
            </div>

            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">🥩 Protein</span>
                <span className="text-slate-800">{proConsumed.toFixed(1)} / {goals.protein_g}g <span className="text-slate-400">({Math.round(proPct)}%)</span></span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(proPct)}`} 
                  style={{ width: `${Math.min(100, proPct)}%` }}
                />
              </div>
            </div>

            {/* Fiber */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">🥦 Fiber</span>
                <span className="text-slate-800">{fibConsumed.toFixed(1)} / {goals.fiber_g}g <span className="text-slate-400">({Math.round(fibPct)}%)</span></span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(fibPct)}`} 
                  style={{ width: `${Math.min(100, fibPct)}%` }}
                />
              </div>
            </div>

            {/* Water */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">💧 Water</span>
                <span className="text-slate-800">{watConsumed} / {goals.water_ml} ml <span className="text-slate-400">({Math.round(watPct)}%)</span></span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 bg-blue-500`} 
                  style={{ width: `${Math.min(100, watPct)}%` }}
                />
              </div>
            </div>

          </div>
        )}
      </div>

      {/* QUICK ACTIONS BUTTONS */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => onNavigateToTab('chat')}
          className="flex flex-col items-center justify-center gap-2 p-3 bg-white hover:bg-emerald-50/50 border border-emerald-100 rounded-2xl shadow-sm text-slate-800 hover:text-emerald-700 active:scale-95 duration-150"
        >
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <PlusCircle size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider font-heading">Log Meal</span>
        </button>

        <button
          onClick={() => setShowWaterModal(true)}
          className="flex flex-col items-center justify-center gap-2 p-3 bg-white hover:bg-blue-50/50 border border-blue-50 rounded-2xl shadow-sm text-slate-800 hover:text-blue-700 active:scale-95 duration-150"
        >
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
            <Droplet size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider font-heading">Log Water</span>
        </button>

        <button
          onClick={() => {
            setWeightInput(String(weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight_kg : profile.weight_kg));
            setShowWeightModal(true);
          }}
          className="flex flex-col items-center justify-center gap-2 p-3 bg-white hover:bg-indigo-50/50 border border-indigo-50 rounded-2xl shadow-sm text-slate-800 hover:text-indigo-700 active:scale-95 duration-150"
        >
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
            <Scale size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider font-heading">Log Weight</span>
        </button>
      </div>

      {/* SMART INSIGHT CARD */}
      <div className="p-4 rounded-3xl bg-emerald-50/40 border border-emerald-100 flex gap-3.5 mb-6">
        <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0">
          <Sparkles size={16} />
        </div>
        <div>
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-800 font-heading">AI Coach Insight</h4>
          <p className="text-xs text-emerald-900/90 leading-relaxed mt-1">
            {getSmartInsight()}
          </p>
        </div>
      </div>

      {/* WEEK MINI CHART */}
      <div className="p-5 rounded-3xl bg-white border border-emerald-100 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5 font-heading">
            <TrendingUp size={16} className="text-emerald-500" />
            Consistency (Last 7 Days)
          </h3>
          <button 
            onClick={() => onNavigateToTab('reports')}
            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wide flex items-center gap-0.5"
          >
            Full Reports <ChevronRight size={12} />
          </button>
        </div>

        {/* Custom Pure SVG Bar Chart (Extremely premium, lightweight & robust) */}
        <div className="w-full h-32 flex items-end justify-between px-2 pt-2">
          {chartData.map((d, i) => {
            const barHeight = Math.max(8, (d.value / 100) * 80); // max height of bar is 80px
            return (
              <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                {/* Tooltip value */}
                <span className="text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 duration-150 transition-opacity transform -translate-y-1">
                  {Math.round(d.value)}%
                </span>
                
                {/* SVG Bar */}
                <svg width="24" height="84" className="overflow-visible">
                  <rect
                    x="2"
                    y={80 - barHeight}
                    width="20"
                    height={barHeight}
                    rx="6"
                    className={`${d.value >= 70 ? 'fill-emerald-500' : d.value >= 40 ? 'fill-yellow-500' : 'fill-rose-400'} transition-all duration-500 hover:brightness-95`}
                  />
                  {/* Goal mark line (70% line) */}
                  <line
                    x1="0"
                    y1="24" // 70% of 80 height
                    x2="24"
                    y2="24"
                    stroke="#cbd5e1"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                    className="opacity-50"
                  />
                </svg>
                
                {/* Weekday Label */}
                <span className="text-[10px] font-bold text-slate-400 mt-1">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT CHATS (LAST 4) */}
      <div className="mb-6">
        <h3 className="font-bold text-slate-800 text-base mb-3 flex items-center gap-1.5 font-heading">
          <MessageSquare size={16} className="text-emerald-500" />
          Recent Conversations
        </h3>

        {chatSessions.length === 0 ? (
          <div className="p-6 rounded-3xl border border-slate-100 bg-white text-center">
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              No chats yet. Start your first conversation with your coach!
            </p>
            <button
              onClick={() => onNavigateToTab('chat')}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-full active:scale-95 duration-150"
            >
              Start First Chat
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {chatSessions.slice(0, 4).map(session => {
              const d = new Date(session.created_at || session.started_at);
              const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              
              return (
                <div 
                  key={session.id}
                  className="p-4 bg-white border border-emerald-50/50 rounded-2xl flex justify-between items-center shadow-sm hover:shadow hover:border-emerald-100 transition duration-200"
                >
                  <div className="flex-1 mr-4">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{dateStr}</span>
                    <h4 className="font-extrabold text-xs text-slate-800 truncate leading-tight mt-0.5">
                      {session.title || 'Conversation log'}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                      {session.summary || 'Logged foods and targets.'}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => onNavigateToTab('chat', session.id)}
                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-[10px] uppercase rounded-full shrink-0 active:scale-95 duration-150"
                  >
                    Continue
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: WATER LOG */}
      {/* ======================================================== */}
      {showWaterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-end justify-center transition-opacity duration-300">
          <div className="bg-white rounded-t-[32px] w-full max-w-md p-6 pb-8 border-t border-slate-100 slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 font-heading flex items-center gap-2">
                <Droplet className="text-blue-500" />
                Track Water Hydration
              </h3>
              <button 
                onClick={() => setShowWaterModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleLogWater}>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Amount in Milliliters (ml)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {['100', '250', '500', '750'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setWaterInput(val)}
                      className={`py-2 text-xs font-bold rounded-xl border ${waterInput === val ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                    >
                      {val}ml
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={waterInput}
                  onChange={e => setWaterInput(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/10 transition active:scale-98"
              >
                {isSubmitting ? 'Saving...' : 'Confirm Log'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: WEIGHT LOG */}
      {/* ======================================================== */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-end justify-center transition-opacity duration-300">
          <div className="bg-white rounded-t-[32px] w-full max-w-md p-6 pb-8 border-t border-slate-100 slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 font-heading flex items-center gap-2">
                <Scale className="text-indigo-500" />
                Record Body Weight
              </h3>
              <button 
                onClick={() => setShowWeightModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleLogWeight}>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Body Weight in Kilograms (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightInput}
                  onChange={e => setWeightInput(e.target.value)}
                  placeholder="e.g. 78.5"
                  className="w-full text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500"
                  required
                  autoFocus
                />
                <p className="text-[10px] text-slate-400 mt-2">
                  Your profile and daily targets will automatically update to adapt to this current weight!
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-500/10 transition active:scale-98"
              >
                {isSubmitting ? 'Saving...' : 'Confirm Log'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
