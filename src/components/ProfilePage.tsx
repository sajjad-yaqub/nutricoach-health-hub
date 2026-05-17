import React, { useState } from 'react';
import { UserProfile, UserGoal } from '../types';
import { dbService } from '../services/db';
import { Scale, Edit3, LogOut, Trash2, ShieldAlert, Check, X, ShieldAlert as WarningIcon, Save, Heart, ChevronDown } from 'lucide-react';

interface ProfilePageProps {
  profile: UserProfile;
  goals: UserGoal;
  onUpdateProfileAndGoals: (newProfile: UserProfile, newGoals: UserGoal) => Promise<void>;
  onSignOut: () => void;
  onAddToast: (msg: string, type: 'success' | 'error') => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  goals,
  onUpdateProfileAndGoals,
  onSignOut,
  onAddToast,
}) => {
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual goals override states
  const [overrideCal, setOverrideCal] = useState(String(goals.calories));
  const [overridePro, setOverridePro] = useState(String(goals.protein_g));
  const [overrideCar, setOverrideCar] = useState(String(goals.carbs_g));
  const [overrideFat, setOverrideFat] = useState(String(goals.fat_g));
  const [overrideFib, setOverrideFib] = useState(String(goals.fiber_g));
  const [overrideWat, setOverrideWat] = useState(String(goals.water_ml));

  // 1. Save Overridden Goals
  const handleSaveGoalOverrides = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updatedGoals: UserGoal = {
        ...goals,
        calories: parseInt(overrideCal, 10),
        protein_g: parseFloat(overridePro),
        carbs_g: parseFloat(overrideCar),
        fat_g: parseFloat(overrideFat),
        fiber_g: parseFloat(overrideFib),
        water_ml: parseFloat(overrideWat),
      };

      await onUpdateProfileAndGoals(profile, updatedGoals);
      onAddToast('Custom nutrient goals saved! 🎯', 'success');
      setIsEditingGoals(false);
    } catch (err) {
      console.error(err);
      onAddToast('Failed to save manual overrides.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Perform Account / Storage Wiping
  const handleDeleteAccount = async () => {
    setIsSubmitting(true);
    try {
      await dbService.deleteAccount(profile.id);
      onAddToast('Account and all secure logs deleted.', 'success');
      setShowDeleteModal(false);
      onSignOut(); // Trigger logout/landing redirect
    } catch (err) {
      console.error(err);
      onAddToast('Failed to delete account.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 fade-in no-scrollbar">
      
      {/* HEADER */}
      <div className="mb-6">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          Profile & Preferences
        </span>
        <h2 className="text-2xl font-bold text-slate-800 font-heading">
          Settings
        </h2>
      </div>

      {/* USER BIOMETRICS CARD */}
      <div className="p-5 bg-white border border-emerald-100 rounded-3xl shadow-sm mb-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-600/10 text-emerald-700 font-extrabold rounded-2xl flex items-center justify-center text-lg shadow-inner shrink-0">
            {profile.name ? profile.name[0].toUpperCase() : 'N'}
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 leading-tight">{profile.name}</h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {profile.sex} • {profile.age} yrs • {profile.height_cm} cm
            </span>
          </div>
        </div>

        {/* Dietary Tag Badges */}
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Dietary Filters</span>
          <div className="flex flex-wrap gap-1.5">
            {profile.dietary_preferences.map((pref, idx) => (
              <span 
                key={idx} 
                className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-100/40"
              >
                🥗 {pref}
              </span>
            ))}
          </div>
        </div>

        {/* Health Conditions Tag Badges */}
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Health Conditions</span>
          <div className="flex flex-wrap gap-1.5">
            {profile.health_conditions.map((cond, idx) => (
              <span 
                key={idx} 
                className="bg-rose-50 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-rose-100/40"
              >
                ⚠️ {cond}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* TARGETS CONFIG overrides */}
      <div className="bg-white border border-emerald-100 rounded-3xl shadow-sm mb-6 overflow-hidden">
        <button
          onClick={() => setIsEditingGoals(!isEditingGoals)}
          className="w-full p-5 flex justify-between items-center text-left hover:bg-slate-50/50 duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <Edit3 size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Manual Targets Override</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Customize your daily calories and macros manually.</p>
            </div>
          </div>
          <ChevronDown 
            size={18} 
            className={`text-slate-400 transition-transform duration-200 ${isEditingGoals ? 'rotate-180' : ''}`} 
          />
        </button>

        {isEditingGoals && (
          <form onSubmit={handleSaveGoalOverrides} className="px-5 pb-5 border-t border-slate-50 pt-4 flex flex-col gap-4 slide-up">
            
            {/* Calories input */}
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Calories (kcal)</label>
              <input
                type="number"
                value={overrideCal}
                onChange={e => setOverrideCal(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Grid of Macros */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Protein (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={overridePro}
                  onChange={e => setOverridePro(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Carbs (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={overrideCar}
                  onChange={e => setOverrideCar(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Fat (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={overrideFat}
                  onChange={e => setOverrideFat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Fiber (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={overrideFib}
                  onChange={e => setOverrideFib(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Water input */}
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Water Target (ml)</label>
              <input
                type="number"
                value={overrideWat}
                onChange={e => setOverrideWat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Submit buttons */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setIsEditingGoals(false)}
                className="flex-1 py-3 border border-slate-200 text-slate-500 font-bold rounded-xl text-xs active:scale-95 duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 duration-150"
              >
                <Save size={13} /> {isSubmitting ? 'Saving...' : 'Save Goals'}
              </button>
            </div>

          </form>
        )}
      </div>

      {/* ACCOUNT ADMIN CONTROL BUTTONS */}
      <div className="flex flex-col gap-3">
        {/* Sign Out / Clear local data */}
        <button
          onClick={onSignOut}
          className="w-full p-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm active:scale-98 transition duration-150 text-slate-700 hover:text-slate-800 font-bold text-xs"
        >
          <span className="flex items-center gap-2">
            <LogOut size={16} className="text-slate-500" />
            Sign Out & Reset Session
          </span>
          <Check size={16} className="text-slate-400" />
        </button>

        {/* Delete Account */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full p-4 bg-rose-50 hover:bg-rose-100/60 border border-rose-100 rounded-2xl flex items-center justify-between active:scale-98 transition duration-150 text-rose-700 hover:text-rose-800 font-bold text-xs"
        >
          <span className="flex items-center gap-2">
            <Trash2 size={16} className="text-rose-600 animate-pulse" />
            Delete Account & Secure Logs
          </span>
          <span className="text-[9px] uppercase tracking-wide px-2 py-0.5 rounded bg-rose-200 text-rose-800 font-extrabold">Danger</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* MODAL: DELETE ACCOUNT CONFIRMATION */}
      {/* ======================================================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-[250] flex items-center justify-center p-6 transition-opacity duration-300">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 border border-slate-100 slide-up">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
              <ShieldAlert size={26} />
            </div>
            
            <h3 className="text-base font-extrabold text-slate-800 font-heading mb-2">
              Are you absolutely sure?
            </h3>
            
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              This action is permanent and irreversibly deletes your profile settings, custom calorie/macro targets, weight logs, and all AI coaching chat histories. It cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs active:scale-95 duration-150"
              >
                No, Keep it
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-rose-600/10 active:scale-95 duration-150"
              >
                <Trash2 size={13} /> {isSubmitting ? 'Deleting...' : 'Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
