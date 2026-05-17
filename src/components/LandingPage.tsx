import React from 'react';
import { Sparkles, MessageSquare, Apple, Flame, ChevronRight, Activity, TrendingUp, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
  isLoading: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, isLoading }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/50 flex flex-col justify-between fade-in">
      
      {/* Header */}
      <header className="px-6 py-5 max-w-5xl mx-auto w-full flex justify-between items-center border-b border-emerald-100/50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/20">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <span className="font-semibold text-emerald-800 tracking-tight text-xl font-heading">
            Nutri<span className="text-emerald-500 font-normal">Coach</span>
          </span>
        </div>
        
        <button
          onClick={onSignIn}
          disabled={isLoading}
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors px-4 py-2 rounded-full border border-emerald-200/80 bg-white shadow-sm hover:shadow active:scale-95 duration-200"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto w-full px-6 py-12 flex-1 flex flex-col items-center justify-center text-center">
        
        {/* Animated Badge */}
        <div className="mb-6 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200/30 text-emerald-800 text-xs font-semibold tracking-wide uppercase hover:scale-105 duration-300 shadow-sm cursor-default">
          <Sparkles size={13} className="text-emerald-600 animate-pulse" />
          Meet Your Personal AI Nutrition Coach
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-800 max-w-2xl leading-[1.15] mb-5 font-heading">
          Log meals through <br />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            natural conversation.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base md:text-lg text-slate-500 max-w-lg mb-10 leading-relaxed">
          No manual forms. No tedious ingredient searches. Just tell NutriCoach what you ate, and let our AI calculate your macros, track your streaks, and guide your fitness journey.
        </p>

        {/* Google SSO Button */}
        <div className="w-full max-w-xs mb-14">
          <button
            onClick={onSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-semibold shadow-xl shadow-emerald-950/10 hover:shadow-emerald-950/20 active:scale-98 transition duration-200 group relative overflow-hidden"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:scale-110 duration-200" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
                <ChevronRight size={16} className="text-white/70 ml-1 group-hover:translate-x-1 duration-200" />
              </>
            )}
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-left">
          
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1 font-heading">Natural Food Logging</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                "I had 2 eggs and oatmeal for breakfast" is all it takes. The AI estimates everything instantly.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Flame size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1 font-heading">Streak & Habit Incentives</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Earn daily consistency badges. Hit 70%+ of calorie and macro targets to grow your motivational streak!
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1 font-heading">Weekly & Monthly Audits</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Enjoy automated nutrient audits, custom line charts of weight, and grades (A-F) based on consistency.
              </p>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-emerald-100/50 bg-emerald-50/20 text-center text-xs text-slate-400 max-w-5xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-3">
        <p>© 2026 NutriCoach. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-emerald-600" /> Supabase RLS Secure</span>
          <span className="flex items-center gap-1"><Activity size={13} className="text-emerald-600" /> Apple Silicon Optimized</span>
        </div>
      </footer>

    </div>
  );
};
