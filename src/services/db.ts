import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { UserProfile, UserGoal, DailySummary, WeeklySummary, MonthlySummary, ChatSession, WeightLog } from '../types';
import { MOCK_PROFILE, MOCK_GOALS, MOCK_DAILY_SUMMARIES, MOCK_WEIGHT_LOGS, MOCK_CHAT_SESSIONS } from '../mockData';

const today = new Date();

// Helper to get demo/local data or initialize it if not present
const getLocalData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultValue;
  }
};

const setLocalData = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const dbService = {
  // ==========================================
  // AUTHENTICATION & SESSION
  // ==========================================
  async getCurrentUser() {
    if (!isSupabaseConfigured) {
      return { id: 'demo-user-id', email: 'sajjad@demo.com', user_metadata: { name: 'Sajjad' } };
    }
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async signOut() {
    if (!isSupabaseConfigured) {
      console.log('Demo mode signed out.');
      return;
    }
    await supabase.auth.signOut();
  },

  // ==========================================
  // USER PROFILES
  // ==========================================
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) {
      return getLocalData<UserProfile>('nutricoach_profile', MOCK_PROFILE);
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  },

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    if (!isSupabaseConfigured) {
      setLocalData('nutricoach_profile', profile);
      return profile;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
    return data;
  },

  // ==========================================
  // USER GOALS
  // ==========================================
  async getGoals(userId: string): Promise<UserGoal | null> {
    if (!isSupabaseConfigured) {
      return getLocalData<UserGoal>('nutricoach_goals', MOCK_GOALS);
    }

    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching goals:', error);
      return null;
    }
    return data;
  },

  async saveGoals(goals: UserGoal): Promise<UserGoal> {
    if (!isSupabaseConfigured) {
      setLocalData('nutricoach_goals', goals);
      return goals;
    }

    const { data, error } = await supabase
      .from('user_goals')
      .upsert({
        ...goals,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving goals:', error);
      throw error;
    }
    return data;
  },

  // ==========================================
  // DAILY SUMMARIES
  // ==========================================
  async getDailySummary(userId: string, dateStr: string): Promise<DailySummary | null> {
    if (!isSupabaseConfigured) {
      const summaries = getLocalData<DailySummary[]>('nutricoach_daily_summaries', MOCK_DAILY_SUMMARIES);
      const match = summaries.find(s => s.date === dateStr);
      return match || null;
    }

    const { data, error } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', dateStr)
      .maybeSingle();

    if (error) {
      console.error('Error fetching daily summary:', error);
      return null;
    }
    return data;
  },

  async getAllDailySummaries(userId: string): Promise<DailySummary[]> {
    if (!isSupabaseConfigured) {
      const summaries = getLocalData<DailySummary[]>('nutricoach_daily_summaries', MOCK_DAILY_SUMMARIES);
      return summaries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    const { data, error } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching all daily summaries:', error);
      return [];
    }
    return data || [];
  },

  async upsertDailySummary(summary: DailySummary): Promise<DailySummary> {
    if (!isSupabaseConfigured) {
      const summaries = getLocalData<DailySummary[]>('nutricoach_daily_summaries', MOCK_DAILY_SUMMARIES);
      const index = summaries.findIndex(s => s.date === summary.date);
      
      if (index >= 0) {
        summaries[index] = { ...summaries[index], ...summary };
      } else {
        summaries.push(summary);
      }
      setLocalData('nutricoach_daily_summaries', summaries);
      return summary;
    }

    const { data, error } = await supabase
      .from('daily_summaries')
      .upsert(summary, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting daily summary:', error);
      throw error;
    }
    return data;
  },

  // ==========================================
  // CHAT SESSIONS
  // ==========================================
  async getChatSessions(userId: string): Promise<ChatSession[]> {
    if (!isSupabaseConfigured) {
      return getLocalData<ChatSession[]>('nutricoach_chat_sessions', MOCK_CHAT_SESSIONS)
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat sessions:', error);
      return [];
    }
    return data || [];
  },

  async saveChatSession(session: ChatSession): Promise<ChatSession> {
    if (!isSupabaseConfigured) {
      const sessions = getLocalData<ChatSession[]>('nutricoach_chat_sessions', MOCK_CHAT_SESSIONS);
      const index = sessions.findIndex(s => s.id === session.id);
      
      if (index >= 0) {
        sessions[index] = { ...sessions[index], ...session };
      } else {
        sessions.unshift(session);
      }

      // Auto delete oldest when more than 4
      if (sessions.length > 4) {
        sessions.splice(4);
      }

      setLocalData('nutricoach_chat_sessions', sessions);
      return session;
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .upsert(session)
      .select()
      .single();

    if (error) {
      console.error('Error saving chat session:', error);
      throw error;
    }
    return data;
  },

  async deleteOldestSessionsIfLimitExceeded(userId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      const sessions = getLocalData<ChatSession[]>('nutricoach_chat_sessions', MOCK_CHAT_SESSIONS);
      if (sessions.length > 4) {
        sessions.splice(4);
        setLocalData('nutricoach_chat_sessions', sessions);
      }
      return;
    }
    // Database trigger already handles this automatically on Supabase!
  },

  // ==========================================
  // WEIGHT LOGS
  // ==========================================
  async getWeightLogs(userId: string): Promise<WeightLog[]> {
    if (!isSupabaseConfigured) {
      return getLocalData<WeightLog[]>('nutricoach_weight_logs', MOCK_WEIGHT_LOGS)
        .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
    }

    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: true });

    if (error) {
      console.error('Error fetching weight logs:', error);
      return [];
    }
    return data || [];
  },

  async addWeightLog(weightLog: WeightLog): Promise<WeightLog> {
    if (!isSupabaseConfigured) {
      const logs = getLocalData<WeightLog[]>('nutricoach_weight_logs', MOCK_WEIGHT_LOGS);
      logs.push(weightLog);
      // Sort by date ascending
      logs.sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
      setLocalData('nutricoach_weight_logs', logs);

      // Also update weight in user_profiles
      const profile = getLocalData<UserProfile>('nutricoach_profile', MOCK_PROFILE);
      profile.weight_kg = weightLog.weight_kg;
      setLocalData('nutricoach_profile', profile);

      return weightLog;
    }

    const { data, error } = await supabase
      .from('weight_logs')
      .insert(weightLog)
      .select()
      .single();

    if (error) {
      console.error('Error adding weight log:', error);
      throw error;
    }

    // Also update weight in user_profiles
    await supabase
      .from('user_profiles')
      .update({ weight_kg: weightLog.weight_kg })
      .eq('id', weightLog.user_id);

    return data;
  },

  // ==========================================
  // WEEKLY & MONTHLY SUMMARIES (AUTO-GENERATE OR FETCH)
  // ==========================================
  async getWeeklySummaries(userId: string): Promise<WeeklySummary[]> {
    if (!isSupabaseConfigured) {
      // Generate some mock weekly summaries based on our daily data
      const summaries = getLocalData<DailySummary[]>('nutricoach_daily_summaries', MOCK_DAILY_SUMMARIES);
      const profile = getLocalData<UserProfile>('nutricoach_profile', MOCK_PROFILE);
      
      const sumCalories = summaries.reduce((acc, s) => acc + s.calories_consumed, 0);
      const sumProtein = summaries.reduce((acc, s) => acc + s.protein_g, 0);
      const sumFiber = summaries.reduce((acc, s) => acc + s.fiber_g, 0);
      const sumGoalPercent = summaries.reduce((acc, s) => acc + Number(s.goal_hit_percent), 0);
      const count = summaries.length || 1;

      return [
        {
          user_id: userId,
          week_start: formatDate(7),
          avg_calories: Math.round(sumCalories / count),
          avg_protein_g: Number((sumProtein / count).toFixed(1)),
          avg_fiber_g: Number((sumFiber / count).toFixed(1)),
          avg_goal_percent: Number((sumGoalPercent / count).toFixed(1)),
          best_day: formatDate(5),
          worst_day: formatDate(4),
          weight_start_kg: profile.weight_kg + 0.8,
          weight_end_kg: profile.weight_kg,
          ai_notes: 'Sensational consistency! Your protein hit 95% of target on average, and water was flawless. Keep up the high volume veggie intake as it was key to hitting fiber daily. Great work Sajjad!',
        }
      ];
    }

    const { data, error } = await supabase
      .from('weekly_summaries')
      .select('*')
      .eq('user_id', userId)
      .order('week_start', { ascending: false });

    if (error) {
      console.error('Error fetching weekly summaries:', error);
      return [];
    }
    return data || [];
  },

  async getMonthlySummaries(userId: string): Promise<MonthlySummary[]> {
    if (!isSupabaseConfigured) {
      const profile = getLocalData<UserProfile>('nutricoach_profile', MOCK_PROFILE);
      return [
        {
          user_id: userId,
          month: today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-01',
          avg_daily_calories: 2240,
          avg_protein_g: 138.5,
          avg_goal_percent: 92.4,
          weight_change_kg: -2.0,
          best_week: formatDate(7),
          ai_notes: 'An outstanding month! Sajjad, you have lost exactly 2.0kg which perfectly matches your target of ~0.5kg weekly safe fat loss. Daily nutrient grades are holding A- for Protein and B for Fiber. Let\'s continue this momentum.',
        }
      ];
    }

    const { data, error } = await supabase
      .from('monthly_summaries')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: false });

    if (error) {
      console.error('Error fetching monthly summaries:', error);
      return [];
    }
    return data || [];
  },

  // ==========================================
  // DELETE ACCOUNT
  // ==========================================
  async deleteAccount(userId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('nutricoach_profile');
      localStorage.removeItem('nutricoach_goals');
      localStorage.removeItem('nutricoach_daily_summaries');
      localStorage.removeItem('nutricoach_chat_sessions');
      localStorage.removeItem('nutricoach_weight_logs');
      return;
    }
    
    // RLS and cascades will delete all related records automatically!
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }
};

const formatDate = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(today.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};
