import { UserProfile, UserGoal } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
export const isGeminiConfigured = !!(GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here');

// Database of standard foods and their typical nutrition profiles (per common serving)
const FOOD_DATABASE: Record<string, { name: string; calories: number; protein: number; carbs: number; fat: number; fiber: number; serving: string }> = {
  'chicken breast': { name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, serving: '100g' },
  'chicken': { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, serving: '100g' },
  'oatmeal': { name: 'Cooked Oatmeal', calories: 150, protein: 6, carbs: 27, fat: 2.5, fiber: 4, serving: '1 bowl' },
  'oats': { name: 'Oatmeal', calories: 150, protein: 6, carbs: 27, fat: 2.5, fiber: 4, serving: '1 bowl' },
  'banana': { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3.1, serving: '1 medium' },
  'egg': { name: 'Whole Egg (Boiled/Poached)', calories: 70, protein: 6, carbs: 0.6, fat: 5, fiber: 0, serving: '1 large' },
  'eggs': { name: 'Whole Eggs', calories: 140, protein: 12, carbs: 1.2, fat: 10, fiber: 0, serving: '2 large' },
  'egg white': { name: 'Egg Whites', calories: 34, protein: 7.2, carbs: 0.4, fat: 0.1, fiber: 0, serving: '2 egg whites' },
  'egg whites': { name: 'Egg Whites', calories: 34, protein: 7.2, carbs: 0.4, fat: 0.1, fiber: 0, serving: '2 egg whites' },
  'rice': { name: 'White Rice (Cooked)', calories: 205, protein: 4.2, carbs: 44.5, fat: 0.4, fiber: 0.6, serving: '1 cup' },
  'brown rice': { name: 'Brown Rice (Cooked)', calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, serving: '1 cup' },
  'salmon': { name: 'Baked Salmon Filet', calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0, serving: '100g' },
  'protein shake': { name: 'Whey Protein Shake', calories: 140, protein: 25, carbs: 3, fat: 1.5, fiber: 1, serving: '1 scoop' },
  'protein powder': { name: 'Whey Protein Shake', calories: 140, protein: 25, carbs: 3, fat: 1.5, fiber: 1, serving: '1 scoop' },
  'whey': { name: 'Whey Protein', calories: 140, protein: 25, carbs: 3, fat: 1.5, fiber: 1, serving: '1 scoop' },
  'greek yogurt': { name: 'Plain Greek Yogurt', calories: 130, protein: 15, carbs: 6, fat: 4, fiber: 0, serving: '150g' },
  'yogurt': { name: 'Greek Yogurt', calories: 130, protein: 15, carbs: 6, fat: 4, fiber: 0, serving: '150g' },
  'salad': { name: 'Mixed Garden Green Salad', calories: 45, protein: 1.5, carbs: 8, fat: 0.2, fiber: 2.8, serving: '1 large bowl' },
  'avocado': { name: 'Avocado', calories: 240, protein: 3, carbs: 12, fat: 22, fiber: 9, serving: '1 medium' },
  'almonds': { name: 'Almonds', calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, serving: '1 oz (28g)' },
  'nuts': { name: 'Mixed Nuts', calories: 170, protein: 5, carbs: 6, fat: 15, fiber: 3, serving: '1 oz' },
  'apple': { name: 'Apple with Skin', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, serving: '1 medium' },
  'broccoli': { name: 'Steamed Broccoli', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, fiber: 3.8, serving: '1 cup' },
  'sweet potato': { name: 'Baked Sweet Potato', calories: 112, protein: 2, carbs: 26, fat: 0.1, fiber: 4, serving: '1 medium' },
  'potato': { name: 'Baked Potato', calories: 160, protein: 4, carbs: 37, fat: 0.2, fiber: 4, serving: '1 medium' },
  'peanut butter': { name: 'Peanut Butter', calories: 190, protein: 7, carbs: 7, fat: 16, fiber: 1.5, serving: '2 tbsp' },
  'milk': { name: 'Whole Milk', calories: 150, protein: 8, carbs: 12, fat: 8, fiber: 0, serving: '1 cup (240ml)' },
  'almond milk': { name: 'Unsweetened Almond Milk', calories: 30, protein: 1, carbs: 1, fat: 2.5, fiber: 0.5, serving: '1 cup (240ml)' },
  'bread': { name: 'Whole Wheat Bread', calories: 160, protein: 7, carbs: 24, fat: 2, fiber: 4, serving: '2 slices' },
  'coffee': { name: 'Black Coffee', calories: 2, protein: 0, carbs: 0, fat: 0, fiber: 0, serving: '1 cup' },
  'burger': { name: 'Cheeseburger', calories: 535, protein: 30, carbs: 40, fat: 28, fiber: 2, serving: '1 burger' },
  'pizza': { name: 'Cheese Pizza', calories: 285, protein: 12, carbs: 32, fat: 10, fiber: 2.5, serving: '1 slice' },
  'spinach': { name: 'Baby Spinach', calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, fiber: 0.7, serving: '2 cups' },
  'tuna': { name: 'Canned Tuna in Water', calories: 120, protein: 26, carbs: 0, fat: 1, fiber: 0, serving: '1 can (100g)' },
};

// MET value mappings for exercise calculations
const EXERCISE_MET: Record<string, number> = {
  'running': 9.8,
  'run': 9.8,
  'jogging': 7.0,
  'jog': 7.0,
  'walking': 3.5,
  'walk': 3.5,
  'weightlifting': 6.0,
  'weights': 6.0,
  'lifting': 6.0,
  'gym': 5.5,
  'workout': 5.0,
  'cycling': 7.5,
  'cycle': 7.5,
  'swimming': 8.0,
  'swim': 8.0,
  'cardio': 6.5,
  'yoga': 2.5,
};

// Helper function to build progress bars
const makeProgressBar = (percent: number): string => {
  const filledCount = Math.min(10, Math.max(0, Math.round(percent / 10)));
  const emptyCount = 10 - filledCount;
  return '█'.repeat(filledCount) + '░'.repeat(emptyCount) + ` ${Math.round(percent)}%`;
};

export const aiService = {
  async getResponse(
    message: string,
    profile: UserProfile,
    goals: UserGoal,
    runningTotals: { calories: number; protein: number; carbs: number; fat: number; fiber: number; water: number },
    recentContext: string[] = [],
    imageParts?: { mimeType: string; data: string }[]
  ): Promise<{
    reply: string;
    extractedNutrition?: { calories: number; protein: number; carbs: number; fat: number; fiber: number; water: number };
    extractedWeight?: number;
  }> {
    
    // ----------------------------------------------------
    // LIVE GEMINI API MODE
    // ----------------------------------------------------
    if (isGeminiConfigured) {
      try {
        const systemPrompt = `You are NutriCoach, a friendly personal AI nutrition coach. Help users track nutrition through natural conversation.

CRITICAL FORMATTING & DEMOGRAPHIC INSTRUCTIONS:
1. NO ASTERISKS: Do not use any single (*) or double (**) asterisks in your response for markdown bolding or emphasis. For bold headers, simply use ALL CAPS or clear spacing, followed by plain text. No asterisks should appear in your output text under any circumstances.
2. INDIAN URBAN / SEMI-URBAN LOCAL CONTEXT: Keep your nutritional suggestions, meal logs, recipes, and dietary coaching highly relevant to the Indian urban and semi-urban demographic.
   - Recommend traditional, staple Indian foods (e.g. roti, steamed rice, cooked dals, chana, paneer, sprouts, besan chilla, idli, dosa, upma, poha, buttermilk/chaas, makhana, sattu, egg bhurji, chicken curry, local leafy greens/sabzis).
   - Steer clear of Western/exotic suggestions like avocado toast, quinoa, kale, berries, salmon, or expensive high-end protein supplements unless explicitly asked by the user.
   - Tailor protein suggestions to standard Indian vegetarian and non-vegetarian patterns (e.g., mixing cereals and pulses, sattu water, paneer, dahi, soya, egg whites, lean chicken breast).
   - Use standard local metrics when helpful (e.g., katori/bowl, cup, glass) alongside metric units.

When user mentions food eaten or uploads a food photo:
- Estimate nutritional values from your knowledge
- Show a formatted breakdown with emojis and emoji progress bars like ████░░░░░░ 40%
- Show running daily totals vs their goals
- Output the logged nutrition data at the VERY bottom inside a JSON block like:
  :::LOG_DATA:::{"calories": 350, "protein": 25, "carbs": 40, "fat": 8, "fiber": 5, "water": 0}:::

When user mentions water:
- Extract amount, confirm it is logged
- Output the logged water data at the VERY bottom inside a JSON block like:
  :::LOG_DATA:::{"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0, "water": 500}:::

When user mentions exercise:
- Estimate calories burned using MET values
- Tell them their updated calorie allowance
- Output the calories burned as a NEGATIVE value in calories at the bottom like:
  :::LOG_DATA:::{"calories": -250, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0, "water": 0}:::

When user mentions their weight:
- Confirm it is logged and show their trend
- Output the logged weight at the bottom like:
  :::WEIGHT_LOG:::78.2:::

When user asks for meal suggestions:
- Suggest meals that fit their remaining calories and respect their dietary preferences

When user asks what they are missing:
- Show remaining nutrients needed for the day with specific food suggestions to fill each gap

When user asks for a meal plan:
- Generate breakfast, lunch, snack, dinner split as: 25% / 35% / 10% / 30% of daily calories
- Respect dietary restrictions and health conditions

Be encouraging, concise, and never give medical advice.

User profile: Name is ${profile.name}, Goal is ${profile.goal}, Dietary preferences are [${profile.dietary_preferences.join(', ')}], Health conditions are [${profile.health_conditions.join(', ')}].
Daily targets: Calories ${goals.calories} kcal, Protein ${goals.protein_g}g, Carbs ${goals.carbs_g}g, Fat ${goals.fat_g}g, Fiber ${goals.fiber_g}g, Water ${goals.water_ml}ml.
Today's running totals: Calories ${runningTotals.calories} kcal, Protein ${runningTotals.protein}g, Carbs ${runningTotals.carbs}g, Fat ${runningTotals.fat}g, Fiber ${runningTotals.fiber}g, Water ${runningTotals.water}ml.
Recent context (AI notes from previous days):
${recentContext.length > 0 ? recentContext.map((note, idx) => `Day -${idx + 1}: ${note}`).join('\n') : 'No recent notes.'}`;

        const parts: any[] = [{ text: message }];
        if (imageParts && imageParts.length > 0) {
          imageParts.forEach(img => {
            parts.push({
              inlineData: {
                mime_type: img.mimeType,
                data: img.data
              }
            });
          });
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: parts }
              ],
              systemInstruction: {
                parts: [{ text: systemPrompt }]
              },
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 800,
              }
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Extract JSON log block if present
        let reply = rawText;
        let extractedNutrition;
        let extractedWeight;

        const logMatch = rawText.match(/:::LOG_DATA:::(.*):::/);
        if (logMatch) {
          try {
            extractedNutrition = JSON.parse(logMatch[1].trim());
            reply = reply.replace(/:::LOG_DATA:::.*:::/, '').trim();
          } catch (e) {
            console.error('Failed to parse nutrition log JSON from AI reply:', e);
          }
        }

        const weightMatch = rawText.match(/:::WEIGHT_LOG:::(.*):::/);
        if (weightMatch) {
          try {
            extractedWeight = parseFloat(weightMatch[1].trim());
            reply = reply.replace(/:::WEIGHT_LOG:::.*:::/, '').trim();
          } catch (e) {
            console.error('Failed to parse weight log from AI reply:', e);
          }
        }

        return { reply, extractedNutrition, extractedWeight };
      } catch (err) {
        console.error('Gemini API call failed, falling back to Local Engine:', err);
        // Continue to local fallback
      }
    }

    // ----------------------------------------------------
    // LOCAL SMART ENGINE MODE (FALLBACK / OFFLINE)
    // ----------------------------------------------------
    const msgLower = message.toLowerCase();
    
    let reply = '';
    let extractedNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 };
    let extractedWeight: number | undefined;

    // A. DETECT WEIGHT LOGGING
    const weightRegex = /(?:log|my|current)?\s*weight\s*(?:is|to)?\s*(\d+(?:\.\d+)?)\s*(?:kg|lbs|kilos)/i;
    const weightMatch = message.match(weightRegex) || message.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos)/i);
    if (weightMatch) {
      let weight = parseFloat(weightMatch[1]);
      if (msgLower.includes('lbs') || msgLower.includes('pound')) {
        weight = parseFloat((weight * 0.453592).toFixed(1)); // Convert to kg
      }
      extractedWeight = weight;
      
      const diff = weight - profile.weight_kg;
      const trend = diff < 0 
        ? `📉 That is a decrease of **${Math.abs(diff).toFixed(1)}kg**! Nice work moving towards your goal!`
        : diff > 0 
          ? `📈 That is an increase of **${diff.toFixed(1)}kg**. Don't worry about daily fluctuations, stay consistent!`
          : `⚖️ Holding steady! Consistency is key.`;

      reply = `⚖️ **Weight Logged Successfully!**
      
I've recorded your weight as **${weight} kg** in your log history.
${trend}

Is there anything else you'd like to log today, or would you like some meal ideas?`;
      return { reply, extractedWeight };
    }

    // B. DETECT WATER LOGGING
    const waterRegex = /(\d+)\s*(?:ml|milliliters|oz|ounces|cups?|glasses?)/i;
    const waterMatch = message.match(waterRegex) || msgLower.match(/(?:drank|log)\s*(?:some|a glass of|water)/);
    if (waterMatch && (msgLower.includes('water') || msgLower.includes('drank') || msgLower.includes('hydration') || msgLower.includes('ml') || msgLower.includes('cup'))) {
      let amount = 250; // default for glass
      if (waterMatch[1]) {
        amount = parseInt(waterMatch[1], 10);
        if (msgLower.includes('oz') || msgLower.includes('ounce')) {
          amount = Math.round(amount * 29.5735); // convert oz to ml
        } else if (msgLower.includes('cup')) {
          amount = amount * 240;
        } else if (msgLower.includes('glass')) {
          amount = amount * 250;
        } else if (amount < 10) { // e.g. "1 liter"
          amount = amount * 1000;
        }
      }
      extractedNutrition.water = amount;
      
      const totalWater = runningTotals.water + amount;
      const waterPct = (totalWater / goals.water_ml) * 100;
      
      reply = `💧 **Hydration Logged!**
      
I've added **${amount} ml** of water to your daily tracker. 

**Today's Hydration Progress:**
💧 Total Water: ${totalWater} ml / ${goals.water_ml} ml
📊 Progress: ${makeProgressBar(waterPct)}

Keep drinking! Staying hydrated speeds up your metabolism and aids recovery.`;
      return { reply, extractedNutrition };
    }

    // C. DETECT EXERCISE
    let matchedExercise = '';
    for (const exKey of Object.keys(EXERCISE_MET)) {
      if (msgLower.includes(exKey)) {
        matchedExercise = exKey;
        break;
      }
    }

    if (matchedExercise || msgLower.includes('burned') || msgLower.includes('workout') || msgLower.includes('exercise')) {
      const durationRegex = /(\d+)\s*(?:min|minute|hr|hour)/i;
      const durationMatch = message.match(durationRegex);
      let durationMinutes = 30; // default
      if (durationMatch) {
        durationMinutes = parseInt(durationMatch[1], 10);
        if (msgLower.includes('hr') || msgLower.includes('hour')) {
          durationMinutes = durationMinutes * 60;
        }
      }
      
      const met = EXERCISE_MET[matchedExercise] || 5.0; // default MET is 5.0
      // Calories burned formula = MET * 3.5 * weight_kg / 200 * duration_mins
      const caloriesBurned = Math.round(met * 3.5 * profile.weight_kg / 200 * durationMinutes);
      
      extractedNutrition.calories = -caloriesBurned; // Burned is negative calorie intake
      
      reply = `🏃‍♂️ **Workout Tracked!**
      
Great job active coaching! You did **${matchedExercise || 'exercise'}** for **${durationMinutes} minutes**.
🔥 Estimated Calories Burned: **${caloriesBurned} kcal** (using MET value of ${met})

This has been added to your daily balance. Your remaining calorie allowance for today has increased by **${caloriesBurned} kcal** to fuel your recovery!

Make sure to log a protein-rich snack to assist muscle repair! 💪`;
      return { reply, extractedNutrition };
    }

    // D. DETECT MEAL PLAN OR FOOD SUGGESTIONS
    if (msgLower.includes('meal plan') || msgLower.includes('diet plan') || msgLower.includes('what should i eat for the day')) {
      const bCalories = Math.round(goals.calories * 0.25);
      const lCalories = Math.round(goals.calories * 0.35);
      const sCalories = Math.round(goals.calories * 0.10);
      const dCalories = Math.round(goals.calories * 0.30);
      
      const prefText = profile.dietary_preferences.includes('None') ? '' : ` (${profile.dietary_preferences.join(', ')})`;
      const condText = profile.health_conditions.includes('None') ? '' : ` keeping in mind your ${profile.health_conditions.join(', ')}`;

      reply = `🥗 **Custom Daily Meal Plan**
Here is a high-performance meal plan tailored specifically for your goal of **${profile.goal}**${prefText}${condText}:

🌅 **Breakfast (25% - ~${bCalories} kcal):**
• **High-Protein Oatmeal Bowl:** 50g Rolled Oats, 1 scoop Whey Protein, 100g Mixed Berries, 10g Almonds.
• *Estimated macros:* ${Math.round(bCalories*0.9)} kcal | 35g Protein | 45g Carbs | 8g Fat | 8g Fiber.

☀️ **Lunch (35% - ~${lCalories} kcal):**
• **Zesty Grilled Chicken/Tofu Salad:** 150g Grilled Chicken Breast (or Baked Firm Tofu), 150g Brown Rice, 2 cups baby spinach/cucumber salad with 1 tsp olive oil and lemon dressing.
• *Estimated macros:* ${Math.round(lCalories*0.95)} kcal | 48g Protein | 55g Carbs | 12g Fat | 6g Fiber.

🍎 **Snack (10% - ~${sCalories} kcal):**
• **Greek Crunch:** 150g Low-fat Greek Yogurt topped with 100g sliced Apple and a sprinkle of cinnamon.
• *Estimated macros:* ${Math.round(sCalories*0.85)} kcal | 16g Protein | 20g Carbs | 2g Fat | 3g Fiber.

🌙 **Dinner (30% - ~${dCalories} kcal):**
• **Baked Salmon/Tempeh & Greens:** 120g Salmon fillet (or Baked Tempeh) with 1 medium Baked Sweet Potato and 1 cup of steamed broccoli.
• *Estimated macros:* ${Math.round(dCalories*0.95)} kcal | 32g Protein | 38g Carbs | 15g Fat | 7g Fiber.

*Would you like to log any of these meals, or adjust items based on your fridge?*`;
      return { reply };
    }

    // E. DETECT WHAT AM I MISSING / GAPS
    if (msgLower.includes('missing') || msgLower.includes('remaining') || msgLower.includes('what do i need') || msgLower.includes('what am i low on')) {
      const remCalories = Math.max(0, goals.calories - runningTotals.calories);
      const remProtein = Math.max(0, Number((goals.protein_g - runningTotals.protein).toFixed(1)));
      const remFiber = Math.max(0, Number((goals.fiber_g - runningTotals.fiber).toFixed(1)));
      const remWater = Math.max(0, Number((goals.water_ml - runningTotals.water).toFixed(0)));
      
      let suggestions = [];
      if (remProtein > 20) {
        suggestions.push(`🥩 **For Protein (${remProtein}g remaining):** Add 100g of grilled chicken breast (31g protein), a scoop of whey protein (25g), or 150g Greek yogurt (15g).`);
      }
      if (remFiber > 5) {
        suggestions.push(`🥦 **For Fiber (${remFiber}g remaining):** Try 1 cup of steamed broccoli (4g fiber), 1 cup of raspberries (8g), or 2 slices of whole wheat bread (4g).`);
      }
      if (remWater > 500) {
        suggestions.push(`💧 **For Hydration (${remWater}ml remaining):** Drink 2 full glasses of water or a large bottle during your next session.`);
      }

      if (suggestions.length === 0) {
        reply = `🎉 **Phenomenal job, ${profile.name}!**
You have practically hit all of your major macronutrient and hydration goals for today! 
No glaring gaps found. Sit back, rest well, and let's repeat this victory tomorrow! 🚀`;
      } else {
        reply = `🔍 **Your Nutrient Gaps & Quick Fixes**

Here is what you are currently missing to hit 100% of your daily goals:
• **Calories:** ${remCalories} kcal remaining
• **Protein:** ${remProtein}g remaining
• **Fiber:** ${remFiber}g remaining
• **Water:** ${remWater}ml remaining

💡 **Food suggestions to fill your gaps:**
${suggestions.join('\n\n')}

What would you like to log next?`;
      }
      return { reply };
    }

    // F. DETECT FOOD ENTRY LOGGING (DEFAULT CHAT FLOW)
    let foundFoods: Array<{ name: string; calories: number; protein: number; carbs: number; fat: number; fiber: number; serving: string; qty: number }> = [];
    
    // Simple natural language quantity extraction (e.g. "2 eggs" or "two apples")
    const numWords: Record<string, number> = { 'a': 1, 'an': 1, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
    
    // Check message against food database
    for (const foodKey of Object.keys(FOOD_DATABASE)) {
      const regex = new RegExp(`(\\b\\d+\\b|\\bone\\b|\\btwo\\b|\\bthree\\b|\\bfour\\b|\\bfive\\b|\\ba\\b|\\ban\\b)?\\s*${foodKey}`, 'i');
      const match = message.match(regex);
      
      if (match) {
        let qty = 1;
        if (match[1]) {
          const qtyStr = match[1].toLowerCase();
          qty = parseInt(qtyStr, 10) || numWords[qtyStr] || 1;
        }
        
        const dbFood = FOOD_DATABASE[foodKey];
        foundFoods.push({
          name: dbFood.name,
          calories: dbFood.calories * qty,
          protein: Number((dbFood.protein * qty).toFixed(1)),
          carbs: Number((dbFood.carbs * qty).toFixed(1)),
          fat: Number((dbFood.fat * qty).toFixed(1)),
          fiber: Number((dbFood.fiber * qty).toFixed(1)),
          serving: dbFood.serving,
          qty
        });
      }
    }

    if (foundFoods.length > 0) {
      // Accumulate totals of logged food
      foundFoods.forEach(f => {
        extractedNutrition.calories += f.calories;
        extractedNutrition.protein += f.protein;
        extractedNutrition.carbs += f.carbs;
        extractedNutrition.fat += f.fat;
        extractedNutrition.fiber += f.fiber;
      });

      // Calculate running values
      const currentCal = runningTotals.calories + extractedNutrition.calories;
      const currentPro = runningTotals.protein + extractedNutrition.protein;
      const currentFib = runningTotals.fiber + extractedNutrition.fiber;
      
      const calPct = (currentCal / goals.calories) * 100;
      const proPct = (currentPro / goals.protein_g) * 100;
      const fibPct = (currentFib / goals.fiber_g) * 100;

      const itemsLoggedList = foundFoods.map(f => `• **${f.qty}x ${f.name}** (${f.qty > 1 ? `${f.qty} servings` : f.serving})`).join('\n');
      const breakdownList = foundFoods.map(f => `🍽️ **${f.name}**\n  🔥 ${f.calories} kcal | 🥩 ${f.protein}g Protein | 🍞 ${f.carbs}g Carbs | 🥑 ${f.fat}g Fat | 🥦 ${f.fiber}g Fiber`).join('\n\n');

      reply = `🍽️ **Logged meals!**

I have estimated the nutritional values and added these to your log:
${itemsLoggedList}

📊 **Meal Breakdown:**
${breakdownList}

---

📈 **Updated Daily Running Totals:**
• **Calories:** ${currentCal} / ${goals.calories} kcal
  ${makeProgressBar(calPct)}
• **Protein:** ${currentPro} / ${goals.protein_g}g
  ${makeProgressBar(proPct)}
• **Fiber:** ${currentFib} / ${goals.fiber_g}g
  ${makeProgressBar(fibPct)}

*Amazing work logging! Let me know if you add water or anything else.*`;
      return { reply, extractedNutrition };
    }

    // G. DEFAULT CONVERSATION GREETINGS
    reply = `👋 **Hey ${profile.name}!** I'm NutriCoach, your AI nutrition assistant.

I can help you log meals, calculate calories, track hydration, record workouts, and hit your weight goal. Just tell me what you've eaten!

Try typing something like:
• *"I had 2 eggs and oatmeal for breakfast"*
• *"Log 500ml of water"*
• *"I went running for 45 minutes"*
• *"My weight is 78.2 kg"*
• *"What am I missing today?"*

What can I help you track right now? 🥗`;
    
    return { reply };
  }
};
