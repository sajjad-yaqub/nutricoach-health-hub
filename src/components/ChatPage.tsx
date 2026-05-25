import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, UserGoal, DailySummary, ChatSession, Message, WeightLog } from '../types';
import { dbService } from '../services/db';
import { aiService } from '../services/ai';
import { ArrowLeft, MessageSquare, Plus, Send, Zap, ChevronRight, Activity, Camera } from 'lucide-react';

interface ChatPageProps {
  profile: UserProfile;
  goals: UserGoal;
  dailySummaries: DailySummary[];
  chatSessions: ChatSession[];
  activeSessionId?: string; // Optional passed session to load
  onNavigateToTab: (tab: 'dashboard' | 'chat' | 'planner' | 'reports' | 'profile') => void;
  onRefreshData: () => Promise<void>;
  onAddToast: (msg: string, type: 'success' | 'error') => void;
  onSessionUpdate?: (session: ChatSession) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  profile,
  goals,
  dailySummaries,
  chatSessions,
  activeSessionId,
  onNavigateToTab,
  onRefreshData,
  onAddToast,
  onSessionUpdate,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  
  // Photo food logging states
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setSelectedImage({
        base64: base64String,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };
  
  // Running daily summary counts accumulated in current session
  const [sessionNutrition, setSessionNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    water: 0,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load: Retrieve active session or start a new one
  useEffect(() => {
    const initializeChat = async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      
      // A. If an active session ID was passed (from "Continue" button)
      if (activeSessionId) {
        if (currentSession?.id === activeSessionId) return; // Prevent re-initializing if already loaded
        
        const pastSession = chatSessions.find(s => s.id === activeSessionId);
        if (pastSession) {
          setCurrentSession(pastSession);
          setSessionNutrition({
            calories: pastSession.nutrition_data.calories || 0,
            protein: pastSession.nutrition_data.protein || 0,
            carbs: pastSession.nutrition_data.carbs || 0,
            fat: pastSession.nutrition_data.fat || 0,
            fiber: pastSession.nutrition_data.fiber || 0,
            water: pastSession.nutrition_data.water || 0,
          });

          // Re-load message history or greet
          if (pastSession.nutrition_data.messages && pastSession.nutrition_data.messages.length > 0) {
            setMessages(pastSession.nutrition_data.messages);
          } else {
            // Acknowledge context greeting
            const d = new Date(pastSession.created_at || pastSession.started_at);
            const weekdayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            setMessages([
              {
                id: 'welcome-back-msg',
                sender: 'ai',
                text: `Welcome back, ${profile.name}! Last time we covered your ${weekdayName} meals. Continue or start fresh?`,
                timestamp: new Date().toISOString(),
              }
            ]);
          }
          return;
        }
      }

      // B. Check if there's already an active session created today
      const dNow = new Date();
      const localTodayStr = `${dNow.getFullYear()}-${String(dNow.getMonth()+1).padStart(2,'0')}-${String(dNow.getDate()).padStart(2,'0')}`;
      
      const todaySession = chatSessions.find(s => {
        const sD = new Date(s.created_at || s.started_at);
        const localSDate = `${sD.getFullYear()}-${String(sD.getMonth()+1).padStart(2,'0')}-${String(sD.getDate()).padStart(2,'0')}`;
        return localSDate === localTodayStr;
      });

      if (todaySession) {
        if (currentSession?.id === todaySession.id) return; // Prevent re-initializing if already loaded
        
        setCurrentSession(todaySession);
        setSessionNutrition({
          calories: todaySession.nutrition_data.calories || 0,
          protein: todaySession.nutrition_data.protein || 0,
          carbs: todaySession.nutrition_data.carbs || 0,
          fat: todaySession.nutrition_data.fat || 0,
          fiber: todaySession.nutrition_data.fiber || 0,
          water: todaySession.nutrition_data.water || 0,
        });

        if (todaySession.nutrition_data.messages && todaySession.nutrition_data.messages.length > 0) {
          setMessages(todaySession.nutrition_data.messages);
        } else {
          setMessages([
            {
              id: 'greet-today',
              sender: 'ai',
              text: `Good morning, ${profile.name}! I'm loaded with your goals. What did you have for breakfast today? 🍳`,
              timestamp: new Date().toISOString(),
            }
          ]);
        }
      } else {
        // C. Start a completely brand new session!
        startNewSession();
      }
    };

    initializeChat();
  }, [activeSessionId, chatSessions]);

  // Scroll to bottom on message updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  // 2. Start a New Chat Session
  const startNewSession = async () => {
    // If we have an existing session, save it first before wiping state!
    if (currentSession) {
      await autoSaveSession(currentSession, messages, sessionNutrition);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    
    // Greet with context from yesterday's daily summary percentage if available
    let yesterdayPercent = 0;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdaySummary = dailySummaries.find(s => s.date === yesterdayStr);
    
    if (yesterdaySummary) {
      yesterdayPercent = Math.round(Number(yesterdaySummary.goal_hit_percent));
    }

    const greetingText = yesterdayPercent > 0
      ? `Good morning ${profile.name}! Yesterday you hit **${yesterdayPercent}%** of your goals. What did you have for breakfast today? 🍳`
      : `Good morning ${profile.name}! I'm NutriCoach, your personal AI. Tell me what you've had to eat or drink today! 🥗`;

    const newSessionId = crypto.randomUUID();
    const newSession: ChatSession = {
      id: newSessionId,
      user_id: profile.id,
      title: 'New Chat Session',
      summary: 'Started conversation log.',
      nutrition_data: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 },
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    setCurrentSession(newSession);
    setSessionNutrition({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 });
    
    setMessages([
      {
        id: 'init-greet',
        sender: 'ai',
        text: greetingText,
        timestamp: new Date().toISOString(),
      }
    ]);
  };

  // 3. Save current chat session and upsert today's daily_summary
  const autoSaveSession = async (
    sessionToSave: ChatSession, 
    msgsToSave: Message[], 
    nutritionToSave: typeof sessionNutrition
  ) => {
    if (msgsToSave.length <= 1) return; // Don't save empty/initial greeting sessions

    try {
      // 1. Generate 2-sentence summary and title based on foods logged
      const foodMessages = msgsToSave.filter(m => m.sender === 'user').map(m => m.text).join(', ');
      let title = 'Nutrition logging';
      let summary = 'Logged daily food items.';
      
      if (nutritionToSave.calories > 0) {
        title = `Logged ${nutritionToSave.calories} kcal meal`;
        summary = `Estimated running totals: ${nutritionToSave.calories} kcal, ${nutritionToSave.protein}g protein, ${nutritionToSave.fiber}g fiber.`;
      }

      const updatedSession: ChatSession = {
        ...sessionToSave,
        title,
        summary,
        nutrition_data: {
          ...nutritionToSave,
          messages: msgsToSave, // Save full message logs inside JSONB nutrition_data
        },
        ended_at: new Date().toISOString(),
      };

      // Optimistically push to App.tsx state!
      if (onSessionUpdate) {
        onSessionUpdate(updatedSession);
      }

      // 2. Save Session to DB
      await dbService.saveChatSession(updatedSession).catch(err => {
        console.error('Background chat save failed:', err);
      });

      // 3. Upsert today's daily summary
      const todayStr = new Date().toISOString().split('T')[0];
      const existingSummary = dailySummaries.find(s => s.date === todayStr);

      // Retrieve yesterday's streak day
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const yesterdaySummary = dailySummaries.find(s => s.date === yesterdayStr);
      const yesterdayStreak = yesterdaySummary?.streak_day || 0;

      // Accumulate totals: If an existing summary exists, we overwrite/upsert the values!
      // In a real database, we would pull accumulated sums across sessions of the day.
      // For this app, let's treat the chat session's running totals as today's cumulative totals.
      const currentCal = Math.max(0, nutritionToSave.calories);
      const currentPro = Math.max(0, nutritionToSave.protein);
      const currentCar = Math.max(0, nutritionToSave.carbs);
      const currentFat = Math.max(0, nutritionToSave.fat);
      const currentFib = Math.max(0, nutritionToSave.fiber);
      const currentWat = Math.max(0, nutritionToSave.water + (existingSummary?.water_ml || 0)); // water logs accumulate

      // Calculate goal hit percentage (average of calorie%, protein%, fiber% vs goals)
      const cPct = Math.min(100, (currentCal / goals.calories) * 100);
      const pPct = Math.min(100, (currentPro / goals.protein_g) * 100);
      const fPct = Math.min(100, (currentFib / goals.fiber_g) * 100);
      const hitPercent = parseFloat(((cPct + pPct + fPct) / 3).toFixed(1));

      // Calculate streak: if goal_hit_percent >= 70%, streak = yesterday streak + 1, else reset to 0
      const currentStreak = hitPercent >= 70 ? yesterdayStreak + 1 : 0;

      const dailySummaryObj: DailySummary = {
        user_id: profile.id,
        date: todayStr,
        calories_consumed: currentCal,
        protein_g: currentPro,
        carbs_g: currentCar,
        fat_g: currentFat,
        fiber_g: currentFib,
        water_ml: currentWat,
        goal_hit_percent: hitPercent,
        streak_day: currentStreak,
        ai_notes: `Logged via Chat: ${title}. ${summary}`,
      };

      await dbService.upsertDailySummary(dailySummaryObj);
      await onRefreshData();
    } catch (err) {
      console.error('Auto save failed:', err);
    }
  };

  // Trigger auto-save when navigating away
  useEffect(() => {
    return () => {
      // Runs on unmount!
      if (currentSession && messages.length > 1) {
        autoSaveSession(currentSession, messages, sessionNutrition);
      }
    };
  }, [currentSession, messages, sessionNutrition]);

  // 4. Send Message Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;
    if (!currentSession) return;

    const userText = inputText.trim() || 'Analyze this meal photo';
    setInputText('');

    // Append user message immediately
    const userMessage: Message & { image?: string } = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toISOString(),
      image: selectedImage ? `data:${selectedImage.mimeType};base64,${selectedImage.base64}` : undefined
    };

    // Capture the photo parts before resetting state
    const imgParts = selectedImage ? [{ mimeType: selectedImage.mimeType, data: selectedImage.base64 }] : undefined;
    setSelectedImage(null);

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsAiTyping(true);

    try {
      const historyForAI = messages.slice(-10).map(m => ({
        role: m.sender,
        text: m.text
      }));

      // Call AI coaching response builder
      const aiResponse = await aiService.getResponse(
        userText,
        profile,
        goals,
        sessionNutrition,
        dailySummaries.slice(-3).map(s => s.ai_notes || ''),
        imgParts,
        historyForAI
      );

      // Append AI message
      const aiMessage: Message = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        text: aiResponse.reply,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      let finalNutrition = sessionNutrition;

      // If nutrition totals were extracted by the AI
      if (aiResponse.extractedNutrition) {
        const extraNutr = aiResponse.extractedNutrition;
        
        // Update session tracking totals
        finalNutrition = {
          calories: Math.max(0, sessionNutrition.calories + extraNutr.calories),
          protein: Number((sessionNutrition.protein + extraNutr.protein).toFixed(1)),
          carbs: Number((sessionNutrition.carbs + extraNutr.carbs).toFixed(1)),
          fat: Number((sessionNutrition.fat + extraNutr.fat).toFixed(1)),
          fiber: Number((sessionNutrition.fiber + extraNutr.fiber).toFixed(1)),
          water: Math.max(0, sessionNutrition.water + extraNutr.water),
        };
        
        setSessionNutrition(finalNutrition);

        // Success toast if anything meaningful was logged
        if (extraNutr.calories > 0 || extraNutr.protein > 0 || extraNutr.water > 0) {
          onAddToast('Food / Drink tracked! 🍽️', 'success');
        } else if (extraNutr.calories < 0) {
          onAddToast('Activity / Calorie burn tracked! 🏃‍♂️', 'success');
        }
      }

      // If weight log was extracted
      if (aiResponse.extractedWeight) {
        const weightObj: WeightLog = {
          user_id: profile.id,
          weight_kg: aiResponse.extractedWeight,
          logged_at: new Date().toISOString(),
        };
        await dbService.addWeightLog(weightObj);
        onAddToast(`Logged weight: ${aiResponse.extractedWeight} kg! ⚖️`, 'success');
      }

      // Sync and background save!
      autoSaveSession(currentSession, finalMessages, finalNutrition);

    } catch (err) {
      console.error(err);
      onAddToast('Failed to reach AI Coach.', 'error');
    } finally {
      setIsAiTyping(false);
    }
  };

  // Handle Quick Suggestions
  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden fade-in bg-slate-50 relative">
      
      {/* 1. RUNNING SUMMARY BAR (TOP) */}
      <div className="bg-emerald-800 text-white text-[11px] font-bold py-2.5 px-4 shadow-sm flex justify-between items-center z-10 select-none font-heading tracking-wide border-b border-emerald-900/10">
        <div className="flex items-center gap-1">
          <Activity size={13} className="text-emerald-300 animate-pulse" />
          <span>Today: {sessionNutrition.calories} kcal</span>
        </div>
        <span>|</span>
        <span>🥩 {sessionNutrition.protein}g protein</span>
        <span>|</span>
        <span>🥦 {sessionNutrition.fiber}g fiber</span>
      </div>

      {/* 2. CHAT HEADER */}
      <div className="bg-white px-4 py-3 flex justify-between items-center border-b border-emerald-100 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigateToTab('dashboard')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 active:scale-95 duration-150"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 font-heading">
              NutriCoach Chat 🥗
            </h3>
            <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">
              Natural Tracker Active
            </p>
          </div>
        </div>

        <button
          onClick={startNewSession}
          className="flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-full shadow active:scale-95 duration-150"
        >
          <Plus size={12} /> New Chat
        </button>
      </div>

      {/* 3. MESSAGES HISTORY VIEWPORT */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4 no-scrollbar">
        {messages.map((msg, i) => {
          const isUser = msg.sender === 'user';
          return (
            <div 
              key={msg.id || i}
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm transition duration-200 ${
                isUser 
                  ? 'bg-emerald-600 text-white font-medium self-end rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-100 self-start rounded-bl-none'
              }`}
            >
              {/* Formatted photo thumbnail for food logs */}
              {(msg as any).image && (
                <div className="mb-2.5 max-w-full rounded-xl overflow-hidden border border-white/20 shadow-inner">
                  <img src={(msg as any).image} className="w-full max-h-48 object-cover" alt="Meal Log Photo" />
                </div>
              )}
              {/* Formatted body text (handles simple markdown-like newlines and list items) */}
              <div className="whitespace-pre-line font-sans">
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isAiTyping && (
          <div className="bg-white border border-slate-100 self-start rounded-2xl rounded-bl-none p-4 max-w-[80px] shadow-sm flex items-center justify-center gap-1 select-none animate-pulse">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* 4. CHAT INPUT / FOOTER CONTROLS */}
      <div className="bg-white border-t border-slate-100 p-4 shrink-0 flex flex-col gap-3">
        
        {/* Suggestion Chips (only show when conversation is brief or starter) */}
        {messages.length <= 3 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              '🍳 I had 2 boiled eggs and black coffee',
              '🥩 Log 150g grilled chicken breast',
              '💧 Logged 500ml water',
              '⚖️ My weight is 78 kg',
              '🔍 What am I missing?',
              '🥗 Suggest a dinner meal plan'
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(chip.replace(/^[^\s]+\s*/, ''))}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-3 py-1.5 rounded-full border border-emerald-100 shrink-0 whitespace-nowrap active:scale-95 duration-150"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {selectedImage && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 animate-fade-in relative shadow-inner">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200">
              <img src={`data:${selectedImage.mimeType};base64,${selectedImage.base64}`} className="w-full h-full object-cover" alt="Preview" />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-slate-800 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-slate-900 border border-white shadow active:scale-95 duration-100"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-slate-700">📸 Food photo attached</div>
              <div className="text-[9px] text-slate-400 truncate">Tap send to estimate calories & nutrients.</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2.5 items-end">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-11 h-11 border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-2xl flex items-center justify-center transition active:scale-95 duration-100 shrink-0"
            title="Attach a photo of your meal"
          >
            <Camera size={18} />
          </button>

          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Log meal, water, weight or attach photo..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 outline-none resize-none focus:border-emerald-500 transition duration-150 min-h-[44px] max-h-[100px] leading-relaxed"
            rows={1}
          />
          <button
            type="submit"
            className="w-11 h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/10 active:scale-95 duration-150 shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

    </div>
  );
};
