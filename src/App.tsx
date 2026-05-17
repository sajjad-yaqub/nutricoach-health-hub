import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UserProfile, UserGoal, DailySummary, ChatSession, WeightLog, WeeklySummary, MonthlySummary } from './types';
import { dbService } from './services/db';

// Component Imports
import { LandingPage } from './components/LandingPage';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Dashboard } from './components/Dashboard';
import { ChatPage } from './components/ChatPage';
import { ReportsPage } from './components/ReportsPage';
import { ProfilePage } from './components/ProfilePage';
import { WeeklyPlanner } from './components/WeeklyPlanner';

// Icon Imports
import { LayoutDashboard, MessageSquare, LineChart, User, Flame, Sparkles, CalendarRange } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<UserGoal | null>(null);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);

  // Navigation & Routing States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'planner' | 'reports' | 'profile'>('dashboard');
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);
  const [appLoading, setAppLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ==========================================
  // TOAST ALERTS MANAGER
  // ==========================================
  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = 'toast-' + Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // ==========================================
  // SUPABASE AUTHENTICATION LIFECYCLE
  // ==========================================
  useEffect(() => {
    const handleAuthInit = async () => {
      if (isSupabaseConfigured) {
        // Real Supabase flow
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await loadUserData(session.user.id);
        } else {
          setAppLoading(false);
        }

        // Live Auth State Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
          if (session?.user) {
            setUser(session.user);
            await loadUserData(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
            setGoals(null);
            setDailySummaries([]);
            setChatSessions([]);
            setWeightLogs([]);
            setWeeklySummaries([]);
            setMonthlySummaries([]);
            setAppLoading(false);
          }
        });

        return () => subscription.unsubscribe();
      } else {
        // Fallback Demo Auth Flow: Check if a local session exists
        const localSession = localStorage.getItem('nutricoach_demo_session');
        if (localSession) {
          const demoUser = JSON.parse(localSession);
          setUser(demoUser);
          await loadUserData(demoUser.id);
        } else {
          setAppLoading(false);
        }
      }
    };

    handleAuthInit();
  }, []);

  // ==========================================
  // DATA PREFETCH SYNCHRONIZATION
  // ==========================================
  const loadUserData = async (userId: string) => {
    try {
      const userProfile = await dbService.getProfile(userId);
      setProfile(userProfile);

      if (userProfile && userProfile.onboarding_complete) {
        const userGoals = await dbService.getGoals(userId);
        setGoals(userGoals);

        // Fetch logs
        const [summaries, sessions, wLogs, wSummaries, mSummaries] = await Promise.all([
          dbService.getAllDailySummaries(userId),
          dbService.getChatSessions(userId),
          dbService.getWeightLogs(userId),
          dbService.getWeeklySummaries(userId),
          dbService.getMonthlySummaries(userId)
        ]);

        setDailySummaries(summaries);
        setChatSessions(sessions);
        setWeightLogs(wLogs);
        setWeeklySummaries(wSummaries);
        setMonthlySummaries(mSummaries);
      }
    } catch (e) {
      console.error('Error synchronizing profile data:', e);
      addToast('Failed to sync profile data from backend.', 'error');
    } finally {
      setAppLoading(false);
    }
  };

  const refreshData = async () => {
    if (user) {
      await loadUserData(user.id);
    }
  };

  // ==========================================
  // AUTH SIGN IN & SIGN OUT TRIGGER ACTIONS
  // ==========================================
  const handleSignIn = async () => {
    setBtnLoading(true);
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
      } catch (err) {
        console.error(err);
        addToast('Failed to initialize Google Login.', 'error');
        setBtnLoading(false);
      }
    } else {
      // Simulate OAuth login latency for premium presentation
      setTimeout(async () => {
        const mockUserObj = { id: 'demo-user-sajjad', email: 'sajjad@demo.com', name: 'Sajjad' };
        localStorage.setItem('nutricoach_demo_session', JSON.stringify(mockUserObj));
        setUser(mockUserObj);
        addToast('Signed in in Demo Mode!', 'success');
        await loadUserData(mockUserObj.id);
        setBtnLoading(false);
      }, 700);
    }
  };

  const handleSignOut = async () => {
    setAppLoading(true);
    try {
      await dbService.signOut();
      if (!isSupabaseConfigured) {
        localStorage.removeItem('nutricoach_demo_session');
      }
      setUser(null);
      setProfile(null);
      setGoals(null);
      setDailySummaries([]);
      setChatSessions([]);
      setWeightLogs([]);
      setWeeklySummaries([]);
      setMonthlySummaries([]);
      setActiveTab('dashboard');
      addToast('Signed out successfully.', 'success');
    } catch (e) {
      console.error(e);
      addToast('Failed to sign out.', 'error');
    } finally {
      setAppLoading(false);
    }
  };

  // ==========================================
  // WIZARD REGISTRATION COMPLETED
  // ==========================================
  const handleOnboardingComplete = async (newProfile: UserProfile, newGoals: UserGoal) => {
    try {
      const savedProfile = await dbService.saveProfile(newProfile);
      const savedGoals = await dbService.saveGoals(newGoals);
      setProfile(savedProfile);
      setGoals(savedGoals);
      addToast('Onboarding complete! Plan activated. 🎯', 'success');
      await refreshData();
    } catch (err) {
      console.error(err);
      addToast('Failed to complete onboarding setups.', 'error');
      throw err;
    }
  };

  // ==========================================
  // MANUALLY ADJUST PREFERENCES & TARGETS
  // ==========================================
  const handleUpdateProfileAndGoals = async (newProfile: UserProfile, newGoals: UserGoal) => {
    const savedProfile = await dbService.saveProfile(newProfile);
    const savedGoals = await dbService.saveGoals(newGoals);
    setProfile(savedProfile);
    setGoals(savedGoals);
    await refreshData();
  };

  // Navigation tab handler
  const handleTabNavigation = (tab: 'dashboard' | 'chat' | 'reports' | 'profile', activeId?: string) => {
    setActiveChatId(activeId);
    setActiveTab(tab);
  };

  // Render full screen loading spinner
  if (appLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-emerald-500/25 border-t-emerald-400 rounded-full animate-spin mb-4" />
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse font-heading">
          Loading NutriCoach...
        </span>
      </div>
    );
  }

  // A. IF USER NOT LOGGED IN → SHOW LANDING PAGE
  if (!user) {
    return <LandingPage onSignIn={handleSignIn} isLoading={btnLoading} />;
  }

  // B. IF LOGGED IN BUT ONBOARDING NOT DONE → SHOW WIZARD
  if (!profile || !profile.onboarding_complete || !goals) {
    return (
      <OnboardingWizard 
        userId={user.id} 
        onComplete={handleOnboardingComplete} 
      />
    );
  }

  // C. CHOOSE SUB VIEWPORT SCREEN COMPONENT
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            profile={profile}
            goals={goals}
            dailySummaries={dailySummaries}
            chatSessions={chatSessions}
            weightLogs={weightLogs}
            onNavigateToTab={handleTabNavigation}
            onRefreshData={refreshData}
            onAddToast={addToast}
          />
        );
      case 'chat':
        return (
          <ChatPage
            profile={profile}
            goals={goals}
            dailySummaries={dailySummaries}
            chatSessions={chatSessions}
            activeSessionId={activeChatId}
            onNavigateToTab={handleTabNavigation}
            onRefreshData={refreshData}
            onAddToast={addToast}
          />
        );
      case 'reports':
        return (
          <ReportsPage
            profile={profile}
            goals={goals}
            dailySummaries={dailySummaries}
            weeklySummaries={weeklySummaries}
            monthlySummaries={monthlySummaries}
            weightLogs={weightLogs}
          />
        );
      case 'planner':
        return (
          <WeeklyPlanner
            profile={profile}
            goals={goals}
            dailySummaries={dailySummaries}
            onRefreshData={refreshData}
            onAddToast={addToast}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            profile={profile}
            goals={goals}
            onUpdateProfileAndGoals={handleUpdateProfileAndGoals}
            onSignOut={handleSignOut}
            onAddToast={addToast}
          />
        );
      default:
        return null;
    }
  };

  // D. LOGGED IN + ONBOARDING COMPLETE → RENDER EXPANSIVE PREMIUM RESPONSIVE SHELL
  return (
    <div className="h-[100dvh] bg-slate-50 flex flex-col md:flex-row overflow-hidden select-none">
      
      {/* TOAST SYSTEM ALERTS FEED */}
      <div className="absolute top-4 right-4 z-[300] flex flex-col gap-2 pointer-events-none w-full max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`p-3.5 rounded-2xl text-[11px] font-bold shadow-xl shadow-slate-900/10 flex items-center gap-2 slide-up pointer-events-auto border ${
              t.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${t.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* 
        ========================================================
        1. DESKTOP SIDEBAR NAVIGATION (Show only on md+)
        ========================================================
      */}
      <aside className="hidden md:flex md:w-64 flex-col bg-gradient-to-b from-emerald-900 to-teal-950 text-white border-r border-emerald-950 shrink-0 select-none shadow-xl z-20">
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-emerald-800/40 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-300 font-extrabold text-xl shadow-inner border border-emerald-500/30">
            🥗
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight font-heading leading-tight bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
              NutriCoach
            </h1>
            <span className="text-[10px] text-emerald-400/95 font-bold uppercase tracking-widest">
              AI NUTRITION
            </span>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          {/* Home Tab */}
          <button
            onClick={() => handleTabNavigation('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-150 ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                : 'text-emerald-100/70 hover:text-white hover:bg-emerald-850/50'
            }`}
          >
            <LayoutDashboard size={18} className={activeTab === 'dashboard' ? 'stroke-[2.5px]' : ''} />
            <span>Dashboard</span>
          </button>

          {/* Coach Tab */}
          <button
            onClick={() => handleTabNavigation('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-150 ${
              activeTab === 'chat'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                : 'text-emerald-100/70 hover:text-white hover:bg-emerald-850/50'
            }`}
          >
            <MessageSquare size={18} className={activeTab === 'chat' ? 'stroke-[2.5px]' : ''} />
            <span>AI Coach</span>
          </button>

          {/* Planner Tab */}
          <button
            onClick={() => handleTabNavigation('planner')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-150 ${
              activeTab === 'planner'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                : 'text-emerald-100/70 hover:text-white hover:bg-emerald-850/50'
            }`}
          >
            <CalendarRange size={18} className={activeTab === 'planner' ? 'stroke-[2.5px]' : ''} />
            <span>Plan My Week</span>
          </button>

          {/* Reports Tab */}
          <button
            onClick={() => handleTabNavigation('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-150 ${
              activeTab === 'reports'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                : 'text-emerald-100/70 hover:text-white hover:bg-emerald-850/50'
            }`}
          >
            <LineChart size={18} className={activeTab === 'reports' ? 'stroke-[2.5px]' : ''} />
            <span>Consistency Audits</span>
          </button>

          {/* Profile Tab */}
          <button
            onClick={() => handleTabNavigation('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-150 ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                : 'text-emerald-100/70 hover:text-white hover:bg-emerald-850/50'
            }`}
          >
            <User size={18} className={activeTab === 'profile' ? 'stroke-[2.5px]' : ''} />
            <span>Settings</span>
          </button>
        </nav>

        {/* User Card at the bottom of Sidebar */}
        <div className="p-4 border-t border-emerald-800/40 bg-emerald-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {profile.name[0]}
            </div>
            <div className="max-w-[120px]">
              <div className="text-[11px] font-bold text-white truncate leading-tight">{profile.name}</div>
              <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">Active Plan</div>
            </div>
          </div>
        </div>
      </aside>

      {/* 
        ========================================================
        2. MOBILE HEADER (Show only on mobile)
        ========================================================
      */}
      <header className="flex md:hidden bg-gradient-to-r from-emerald-850 to-teal-900 text-white px-4 py-3.5 justify-between items-center shadow-md shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="text-lg">🥗</span>
          <span className="font-extrabold text-sm tracking-wide font-heading">NutriCoach</span>
        </div>
        <div className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-[10px] uppercase">
          {profile.name[0]}
        </div>
      </header>

      {/* 
        ========================================================
        3. MAIN WORKSPACE VIEWPORT PANEL (Flexible card canvas)
        ========================================================
      */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative pb-20 md:pb-0">
        {/* Max content centering box on desktop for clean visual hierarchy */}
        <div className="flex-1 flex flex-col overflow-hidden w-full max-w-5xl mx-auto md:px-6 md:py-4">
          <div className="flex-1 flex flex-col overflow-hidden bg-white md:rounded-3xl md:border md:border-slate-100 md:shadow-sm">
            {renderTabContent()}
          </div>
        </div>
      </main>

      {/* 
        ========================================================
        4. MOBILE STYLE BOTTOM TAB NAVIGATION BAR (Show only on mobile)
        ========================================================
      */}
      <nav className="fixed bottom-0 left-0 right-0 flex md:hidden bg-white/95 backdrop-blur-md border-t border-slate-100/80 px-5 py-3.5 pb-5 justify-between items-center z-50 select-none shadow-[0_-8px_30px_rgb(0,0,0,0.06)]">
        
        {/* Dashboard Icon */}
        <button
          onClick={() => handleTabNavigation('dashboard')}
          className={`flex flex-col items-center gap-1 group active:scale-95 duration-100 ${activeTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <LayoutDashboard size={20} className={activeTab === 'dashboard' ? 'stroke-[2.5px]' : ''} />
          <span className="text-[9px] font-bold tracking-wider font-heading">Home</span>
        </button>

        {/* Chat Icon */}
        <button
          onClick={() => handleTabNavigation('chat')}
          className={`flex flex-col items-center gap-1 group active:scale-95 duration-100 ${activeTab === 'chat' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <MessageSquare size={20} className={activeTab === 'chat' ? 'stroke-[2.5px]' : ''} />
          <span className="text-[9px] font-bold tracking-wider font-heading">Coach</span>
        </button>

        {/* Planner Icon */}
        <button
          onClick={() => handleTabNavigation('planner')}
          className={`flex flex-col items-center gap-1 group active:scale-95 duration-100 ${activeTab === 'planner' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <CalendarRange size={20} className={activeTab === 'planner' ? 'stroke-[2.5px]' : ''} />
          <span className="text-[9px] font-bold tracking-wider font-heading">Plan Week</span>
        </button>

        {/* Reports Icon */}
        <button
          onClick={() => handleTabNavigation('reports')}
          className={`flex flex-col items-center gap-1 group active:scale-95 duration-100 ${activeTab === 'reports' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <LineChart size={20} className={activeTab === 'reports' ? 'stroke-[2.5px]' : ''} />
          <span className="text-[9px] font-bold tracking-wider font-heading">Audits</span>
        </button>

        {/* Profile Settings Icon */}
        <button
          onClick={() => handleTabNavigation('profile')}
          className={`flex flex-col items-center gap-1 group active:scale-95 duration-100 ${activeTab === 'profile' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <User size={20} className={activeTab === 'profile' ? 'stroke-[2.5px]' : ''} />
          <span className="text-[9px] font-bold tracking-wider font-heading">Settings</span>
        </button>

      </nav>

    </div>
  );
}
