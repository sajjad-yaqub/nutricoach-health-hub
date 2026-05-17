import React, { useState } from 'react';
import { UserProfile, UserGoal } from '../types';
import { ArrowRight, ArrowLeft, Check, Sparkles, Flame, Droplet, Apple, ShieldAlert, Award } from 'lucide-react';

interface OnboardingWizardProps {
  userId: string;
  onComplete: (profile: UserProfile, goals: UserGoal) => Promise<void>;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ userId, onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [sex, setSex] = useState<'Male' | 'Female'>('Male');
  const [age, setAge] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [activityLevel, setActivityLevel] = useState<UserProfile['activity_level']>('Moderately Active');
  const [goal, setGoal] = useState<UserProfile['goal']>('Lose Weight');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(['None']);
  const [healthConditions, setHealthConditions] = useState<string[]>(['None']);
  
  // State for storing the calculated targets on the final confirmation step
  const [calculatedGoals, setCalculatedGoals] = useState<UserGoal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const totalSteps = 11; // 10 questions + 1 confirmation page
  const progressPercent = Math.round(((step - 1) / (totalSteps - 1)) * 100);

  // Toggle multi-select item for dietary preferences
  const handleTogglePref = (pref: string) => {
    if (pref === 'None') {
      setDietaryPreferences(['None']);
      return;
    }
    const copy = dietaryPreferences.filter(x => x !== 'None');
    if (copy.includes(pref)) {
      const updated = copy.filter(x => x !== pref);
      setDietaryPreferences(updated.length === 0 ? ['None'] : updated);
    } else {
      setDietaryPreferences([...copy, pref]);
    }
  };

  // Toggle multi-select item for health conditions
  const handleToggleCondition = (cond: string) => {
    if (cond === 'None') {
      setHealthConditions(['None']);
      return;
    }
    const copy = healthConditions.filter(x => x !== 'None');
    if (copy.includes(cond)) {
      const updated = copy.filter(x => x !== cond);
      setHealthConditions(updated.length === 0 ? ['None'] : updated);
    } else {
      setHealthConditions([...copy, cond]);
    }
  };

  // Validate the current step
  const validateAndProceed = () => {
    setErrorMsg('');
    if (step === 2 && !name.trim()) {
      setErrorMsg('Please tell me your name!');
      return;
    }
    if (step === 4) {
      const numAge = parseInt(age, 10);
      if (isNaN(numAge) || numAge <= 0 || numAge > 120) {
        setErrorMsg('Please enter a valid age (1 - 120).');
        return;
      }
    }
    if (step === 5) {
      const numHeight = parseFloat(height);
      if (isNaN(numHeight) || numHeight < 50 || numHeight > 250) {
        setErrorMsg('Please enter a valid height in cm (50 - 250).');
        return;
      }
    }
    if (step === 6) {
      const numWeight = parseFloat(weight);
      if (isNaN(numWeight) || numWeight < 20 || numWeight > 300) {
        setErrorMsg('Please enter a valid weight in kg (20 - 300).');
        return;
      }
    }

    if (step === 10) {
      // Calculate everything and proceed to confirmation step
      calculateTargets();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setErrorMsg('');
    setStep(prev => prev - 1);
  };

  // The exact formulas required by the prompt
  const calculateTargets = () => {
    const numWeight = parseFloat(weight);
    const numHeight = parseFloat(height);
    const numAge = parseInt(age, 10);

    // 1. BMR
    let bmr = 0;
    if (sex === 'Male') {
      bmr = (10 * numWeight) + (6.25 * numHeight) - (5 * numAge) + 5;
    } else {
      bmr = (10 * numWeight) + (6.25 * numHeight) - (5 * numAge) - 161;
    }

    // 2. Activity Multiplier
    let multiplier = 1.2;
    if (activityLevel === 'Sedentary') multiplier = 1.2;
    else if (activityLevel === 'Lightly Active') multiplier = 1.375;
    else if (activityLevel === 'Moderately Active') multiplier = 1.55;
    else if (activityLevel === 'Very Active') multiplier = 1.725;
    else if (activityLevel === 'Athlete') multiplier = 1.9;

    // TDEE
    const tdee = bmr * multiplier;

    // 3. Calorie Goal
    let calories = Math.round(tdee);
    if (goal === 'Lose Weight') calories = Math.round(tdee - 500);
    else if (goal === 'Build Muscle') calories = Math.round(tdee + 300);

    // 4. Protein (g)
    let protein = numWeight * 0.8;
    if (goal === 'Lose Weight') protein = numWeight * 1.8;
    else if (goal === 'Build Muscle') protein = numWeight * 2.0;
    protein = parseFloat(protein.toFixed(1));

    // 5. Carbs (g) & Fat (g)
    const carbs = parseFloat(((calories * 0.50) / 4).toFixed(1));
    const fat = parseFloat(((calories * 0.27) / 9).toFixed(1));

    // 6. Fiber (g)
    let fiber = 25;
    if (sex === 'Male') {
      fiber = numAge < 50 ? 38 : 30;
    } else {
      fiber = numAge < 50 ? 25 : 21;
    }

    // 7. Water (ml)
    const water = parseFloat((numWeight * 35).toFixed(0));

    // 8. Micronutrients (standard RDA based on sex)
    const vitamin_c = sex === 'Male' ? 90.0 : 75.0;
    const iron = sex === 'Male' ? 8.0 : 18.0;
    const magnesium = sex === 'Male' ? 400.0 : 310.0;
    const zinc = sex === 'Male' ? 11.0 : 8.0;
    const potassium = sex === 'Male' ? 3400.0 : 2600.0;
    const calcium = 1000.0; // Standard

    const goalsObj: UserGoal = {
      user_id: userId,
      calories,
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
      fiber_g: fiber,
      water_ml: water,
      vitamin_c_mg: vitamin_c,
      iron_mg: iron,
      calcium_mg: calcium,
      magnesium_mg: magnesium,
      zinc_mg: zinc,
      potassium_mg: potassium,
    };

    setCalculatedGoals(goalsObj);
    setStep(11); // Proceed to confirmation
  };

  const handleFinish = async () => {
    if (!calculatedGoals) return;
    setIsSubmitting(true);
    try {
      const profileObj: UserProfile = {
        id: userId,
        name,
        sex,
        age: parseInt(age, 10),
        height_cm: parseFloat(height),
        weight_kg: parseFloat(weight),
        activity_level: activityLevel,
        goal,
        dietary_preferences: dietaryPreferences,
        health_conditions: healthConditions,
        onboarding_complete: true,
      };

      await onComplete(profileObj, calculatedGoals);
    } catch (e) {
      console.error(e);
      setErrorMsg('Something went wrong saving your settings. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between px-6 py-8 slide-up">
      
      {/* Top Header & Progress Bar */}
      {step > 1 && (
        <div className="max-w-md mx-auto w-full mb-6">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2 font-medium">
            <span>Progress: {progressPercent}%</span>
            <span>Step {step - 1} of {totalSteps - 1}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Wizard Content Area */}
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center py-4">
        
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-900/40 text-red-200 text-sm flex items-start gap-2.5 shadow-lg">
            <ShieldAlert size={18} className="text-red-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: WELCOME SCREEN */}
        {step === 1 && (
          <div className="text-center flex flex-col items-center gap-6">
            <div className="w-18 h-18 bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/5 mb-2 animate-bounce">
              <Sparkles size={36} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight font-heading leading-tight">
              Let's build your <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                perfect nutrition plan.
              </span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Answer a few questions so we can calculate your personalized calories, protein, and micronutrient targets down to the exact gram.
            </p>
            <button
              onClick={() => setStep(2)}
              className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-2xl shadow-lg shadow-emerald-500/10 active:scale-98 transition duration-200"
            >
              Get Started <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: NAME INPUT */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold font-heading">What should I call you?</h2>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && validateAndProceed()}
              placeholder="e.g. Sajjad"
              className="w-full bg-slate-800/80 border border-slate-700/50 rounded-2xl px-5 py-4 text-white text-lg placeholder-slate-500 outline-none focus:border-emerald-500 transition duration-150"
              autoFocus
            />
          </div>
        )}

        {/* STEP 3: SEX BUTTONS */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold font-heading">Biological sex?</h2>
            <p className="text-xs text-slate-500 -mt-3">Needed for precise metabolic rate equations.</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setSex('Male'); setStep(4); }}
                className={`py-6 rounded-2xl font-bold border transition duration-200 text-lg ${sex === 'Male' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'}`}
              >
                Male
              </button>
              <button
                onClick={() => { setSex('Female'); setStep(4); }}
                className={`py-6 rounded-2xl font-bold border transition duration-200 text-lg ${sex === 'Female' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'}`}
              >
                Female
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: AGE INPUT */}
        {step === 4 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold font-heading">How old are you?</h2>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && validateAndProceed()}
              placeholder="Age in years"
              className="w-full bg-slate-800/80 border border-slate-700/50 rounded-2xl px-5 py-4 text-white text-lg placeholder-slate-500 outline-none focus:border-emerald-500 transition duration-150"
              autoFocus
            />
          </div>
        )}

        {/* STEP 5: HEIGHT INPUT */}
        {step === 5 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold font-heading">Height in cm?</h2>
            <input
              type="number"
              value={height}
              onChange={e => setHeight(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && validateAndProceed()}
              placeholder="e.g. 180"
              className="w-full bg-slate-800/80 border border-slate-700/50 rounded-2xl px-5 py-4 text-white text-lg placeholder-slate-500 outline-none focus:border-emerald-500 transition duration-150"
              autoFocus
            />
          </div>
        )}

        {/* STEP 6: WEIGHT INPUT */}
        {step === 6 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold font-heading">Current weight in kg?</h2>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && validateAndProceed()}
              placeholder="e.g. 78.5"
              className="w-full bg-slate-800/80 border border-slate-700/50 rounded-2xl px-5 py-4 text-white text-lg placeholder-slate-500 outline-none focus:border-emerald-500 transition duration-150"
              autoFocus
            />
          </div>
        )}

        {/* STEP 7: ACTIVITY LEVEL */}
        {step === 7 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold font-heading">Activity level?</h2>
            <div className="flex flex-col gap-3">
              {(['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Athlete'] as const).map(level => {
                const desc = level === 'Sedentary' ? 'Desk job, minimal exercise'
                  : level === 'Lightly Active' ? '1-3 days/week light workout'
                  : level === 'Moderately Active' ? '3-5 days/week moderate exercise'
                  : level === 'Very Active' ? '6-7 days/week intense training'
                  : 'Daily heavy athletics or physical labor';
                return (
                  <button
                    key={level}
                    onClick={() => { setActivityLevel(level); setStep(8); }}
                    className={`p-4 rounded-xl text-left border transition duration-200 flex flex-col gap-1 ${activityLevel === level ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'}`}
                  >
                    <span className="font-bold text-sm">{level}</span>
                    <span className="text-xs text-slate-500">{desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 8: MAIN GOAL */}
        {step === 8 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold font-heading">Main goal?</h2>
            <div className="flex flex-col gap-3">
              {(['Lose Weight', 'Maintain', 'Build Muscle'] as const).map(g => {
                const desc = g === 'Lose Weight' ? 'Calorie deficit (TDEE - 500 kcal)'
                  : g === 'Maintain' ? 'Calorie balance (TDEE kcal)'
                  : 'Calorie surplus (TDEE + 300 kcal)';
                return (
                  <button
                    key={g}
                    onClick={() => { setGoal(g); setStep(9); }}
                    className={`p-5 rounded-xl text-left border transition duration-200 flex flex-col gap-1 ${goal === g ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'}`}
                  >
                    <span className="font-bold text-sm">{g}</span>
                    <span className="text-xs text-slate-500">{desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 9: DIETARY PREFERENCES */}
        {step === 9 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold font-heading">Dietary preferences?</h2>
            <p className="text-xs text-slate-500 -mt-3">Multi-select. Select "None" if you eat everything.</p>
            <div className="grid grid-cols-2 gap-3">
              {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'None'].map(pref => {
                const isSelected = dietaryPreferences.includes(pref);
                return (
                  <button
                    key={pref}
                    onClick={() => handleTogglePref(pref)}
                    className={`p-4 rounded-xl font-semibold border transition duration-150 text-sm flex items-center justify-between ${isSelected ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'}`}
                  >
                    <span>{pref}</span>
                    {isSelected && <Check size={16} className="text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 10: HEALTH CONDITIONS */}
        {step === 10 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold font-heading">Health conditions?</h2>
            <p className="text-xs text-slate-500 -mt-3">Multi-select. Used to customize AI safety guidelines.</p>
            <div className="grid grid-cols-2 gap-3">
              {['Diabetes', 'PCOS', 'High Blood Pressure', 'High Cholesterol', 'None'].map(cond => {
                const isSelected = healthConditions.includes(cond);
                return (
                  <button
                    key={cond}
                    onClick={() => handleToggleCondition(cond)}
                    className={`p-4 rounded-xl font-semibold border transition duration-150 text-sm flex items-center justify-between ${isSelected ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'}`}
                  >
                    <span>{cond}</span>
                    {isSelected && <Check size={16} className="text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 11: FINAL TARGET CONFIRMATION SCREEN */}
        {step === 11 && calculatedGoals && (
          <div className="flex flex-col gap-6 max-h-[75vh] overflow-y-auto pr-1 no-scrollbar fade-in">
            <div className="text-center flex flex-col items-center gap-1">
              <Award size={36} className="text-emerald-400 mb-1" />
              <h2 className="text-2xl font-bold font-heading">Your Personalized Plan is Ready!</h2>
              <p className="text-slate-400 text-xs">Based on BMR, TDEE, activity level and health filters.</p>
            </div>

            {/* Core Target Cards Grid */}
            <div className="grid grid-cols-2 gap-3.5">
              
              {/* Calories */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center shrink-0">
                  <Flame size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Calories</div>
                  <div className="font-extrabold text-lg text-slate-100">{calculatedGoals.calories} <span className="text-xs font-normal text-slate-400">kcal</span></div>
                </div>
              </div>

              {/* Protein */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                  <Apple size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Protein</div>
                  <div className="font-extrabold text-lg text-slate-100">{calculatedGoals.protein_g} <span className="text-xs font-normal text-slate-400">g</span></div>
                </div>
              </div>

              {/* Carbs */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                  <span className="font-bold text-lg">🍞</span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Carbs</div>
                  <div className="font-extrabold text-lg text-slate-100">{calculatedGoals.carbs_g} <span className="text-xs font-normal text-slate-400">g</span></div>
                </div>
              </div>

              {/* Fat */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/10 text-yellow-400 rounded-xl flex items-center justify-center shrink-0">
                  <span className="font-bold text-lg">🥑</span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fats</div>
                  <div className="font-extrabold text-lg text-slate-100">{calculatedGoals.fat_g} <span className="text-xs font-normal text-slate-400">g</span></div>
                </div>
              </div>

              {/* Fiber */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center shrink-0">
                  <span className="font-bold text-lg">🥦</span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fiber</div>
                  <div className="font-extrabold text-lg text-slate-100">{calculatedGoals.fiber_g} <span className="text-xs font-normal text-slate-400">g</span></div>
                </div>
              </div>

              {/* Water */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                  <Droplet size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Water</div>
                  <div className="font-extrabold text-lg text-slate-100">{calculatedGoals.water_ml} <span className="text-xs font-normal text-slate-400">ml</span></div>
                </div>
              </div>

            </div>

            {/* Micronutrients Box */}
            <div className="p-4 rounded-2xl bg-slate-800/20 border border-slate-800 flex flex-col gap-3">
              <span className="font-bold text-xs text-slate-400 uppercase tracking-wider">Daily RDA Micronutrients</span>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Vitamin C:</span> <span className="font-bold text-emerald-400">{calculatedGoals.vitamin_c_mg} mg</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Iron:</span> <span className="font-bold text-emerald-400">{calculatedGoals.iron_mg} mg</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Calcium:</span> <span className="font-bold text-emerald-400">{calculatedGoals.calcium_mg} mg</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Magnesium:</span> <span className="font-bold text-emerald-400">{calculatedGoals.magnesium_mg} mg</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Zinc:</span> <span className="font-bold text-emerald-400">{calculatedGoals.zinc_mg} mg</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Potassium:</span> <span className="font-bold text-emerald-400">{calculatedGoals.potassium_mg} mg</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Bottom Button Panel */}
      {step > 1 && (
        <div className="max-w-md mx-auto w-full mt-6 flex gap-4">
          {step < 11 && (
            <button
              onClick={handlePrev}
              className="px-5 py-4 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold rounded-2xl transition duration-150 active:scale-95 shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          {step < 11 ? (
            <button
              onClick={validateAndProceed}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-2xl shadow-lg active:scale-98 transition duration-200"
            >
              Next Step <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-extrabold rounded-2xl shadow-lg active:scale-98 transition duration-200"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <>
                  Confirm Targets & Proceed <Check size={18} />
                </>
              )}
            </button>
          )}
        </div>
      )}
      
    </div>
  );
};
