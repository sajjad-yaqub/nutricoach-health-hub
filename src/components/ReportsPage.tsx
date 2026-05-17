import React, { useState } from 'react';
import { UserProfile, UserGoal, DailySummary, WeeklySummary, MonthlySummary, WeightLog } from '../types';
import { dbService } from '../services/db';
import { Sparkles, Printer, Calendar, TrendingDown, Scale, CheckCircle2, ChevronRight, Activity, Award } from 'lucide-react';

interface ReportsPageProps {
  profile: UserProfile;
  goals: UserGoal;
  dailySummaries: DailySummary[];
  weeklySummaries: WeeklySummary[];
  monthlySummaries: MonthlySummary[];
  weightLogs: WeightLog[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  profile,
  goals,
  dailySummaries,
  weeklySummaries,
  monthlySummaries,
  weightLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');

  // 1. Calculate Grade based on last 7 days daily summaries
  const getConsistencyGrade = () => {
    const recent7 = dailySummaries.slice(-7);
    if (recent7.length === 0) return { grade: 'N/A', label: 'No Data Yet', color: 'text-slate-400 border-slate-300 bg-slate-50' };

    const avgHit = recent7.reduce((sum, s) => sum + Number(s.goal_hit_percent), 0) / recent7.length;

    if (avgHit >= 90) return { grade: 'A', label: 'Excellent Consistency! 🏆', color: 'text-emerald-600 border-emerald-500 bg-emerald-50' };
    if (avgHit >= 80) return { grade: 'B', label: 'Very Good Progress! ⭐', color: 'text-teal-600 border-teal-500 bg-teal-50' };
    if (avgHit >= 70) return { grade: 'C', label: 'Good Base. Keep building! 👍', color: 'text-yellow-600 border-yellow-500 bg-yellow-50' };
    if (avgHit >= 60) return { grade: 'D', label: 'Needs Focus ⚠️', color: 'text-orange-600 border-orange-500 bg-orange-50' };
    return { grade: 'F', label: 'Let\'s commit to logging daily! 💪', color: 'text-rose-600 border-rose-500 bg-rose-50' };
  };

  const gradeInfo = getConsistencyGrade();

  // 2. Generate SVG Line Chart for Weight Logs
  const renderWeightChart = () => {
    if (weightLogs.length < 2) {
      return (
        <div className="py-10 text-center text-xs text-slate-400 bg-slate-50/40 rounded-2xl border border-dashed border-slate-200">
          <Scale size={28} className="mx-auto mb-2 text-slate-300" />
          Log weight on 2 separate days to chart your trend.
        </div>
      );
    }

    const margin = 20;
    const width = 340;
    const height = 120;
    const chartWidth = width - margin * 2;
    const chartHeight = height - margin * 2;

    const weights = weightLogs.map(w => w.weight_kg);
    const maxW = Math.max(...weights) + 1;
    const minW = Math.min(...weights) - 1;
    const weightRange = maxW - minW || 1;

    // Calculate coordinates for lines
    const points = weightLogs.map((log, index) => {
      const x = margin + (index / (weightLogs.length - 1)) * chartWidth;
      const y = margin + (1 - (log.weight_kg - minW) / weightRange) * chartHeight;
      return { x, y, weight: log.weight_kg, date: new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
    });

    const pathData = points.reduce((path, pt, index) => {
      return index === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`;
    }, '');

    // Area polyline filled under the curve
    const areaPathData = points.length > 0 
      ? `${pathData} L ${points[points.length - 1].x} ${height - margin} L ${points[0].x} ${height - margin} Z`
      : '';

    return (
      <div className="w-full bg-white p-4 rounded-3xl border border-emerald-100/50 shadow-sm">
        <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider mb-3 flex justify-between items-center">
          <span>Weight Loss Journey</span>
          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
            Target: {profile.goal}
          </span>
        </h4>
        
        <div className="overflow-x-auto no-scrollbar">
          <svg width={width} height={height} className="overflow-visible mx-auto">
            {/* Gradients */}
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid line (average mark) */}
            <line
              x1={margin}
              y1={height / 2}
              x2={width - margin}
              y2={height / 2}
              stroke="#cbd5e1"
              strokeDasharray="2 2"
              strokeWidth="0.75"
              className="opacity-50"
            />

            {/* Area under line */}
            <path d={areaPathData} fill="url(#weightGrad)" />

            {/* Main Trend Line */}
            <path d={pathData} fill="none" stroke="#059669" strokeWidth="2.5" />

            {/* Custom Dots */}
            {points.map((pt, i) => (
              <g key={i} className="group cursor-pointer">
                <circle cx={pt.x} cy={pt.y} r="4.5" fill="#ffffff" stroke="#059669" strokeWidth="2" />
                
                {/* Tooltip value */}
                <text 
                  x={pt.x} 
                  y={pt.y - 8} 
                  textAnchor="middle" 
                  fontSize="8" 
                  fontWeight="bold" 
                  fill="#1f2937" 
                  className="opacity-100"
                >
                  {pt.weight}kg
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-bold uppercase px-2">
          <span>Start ({points[0]?.weight}kg)</span>
          <span>Latest ({points[points.length - 1]?.weight}kg)</span>
        </div>
      </div>
    );
  };

  // 3. Print triggering
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 fade-in no-scrollbar printable-area">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-6 no-print">
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Audits & Analytics
          </span>
          <h2 className="text-2xl font-bold text-slate-800 font-heading">
            Nutrition Audits
          </h2>
        </div>

        {/* Print Button */}
        <button
          onClick={handlePrintReport}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-800 bg-white border border-slate-200 rounded-full hover:shadow active:scale-95 duration-150"
        >
          <Printer size={14} /> Print
        </button>
      </div>

      {/* TABS TABS (no print) */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 no-print">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition duration-150 ${activeTab === 'weekly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Weekly Audits
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition duration-150 ${activeTab === 'monthly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Monthly Summary
        </button>
      </div>

      {/* CONSISTENCY GRADE CARD */}
      <div className={`p-4 rounded-3xl border ${gradeInfo.color} mb-6 flex gap-4 items-center transition duration-200 shadow-sm`}>
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-sm border shrink-0">
          {gradeInfo.grade}
        </div>
        <div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Consistency Grade</div>
          <h4 className="font-bold text-slate-800 text-sm mt-0.5">{gradeInfo.label}</h4>
          <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
            Evaluated on logging and target achievement over the last 7 days.
          </p>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="mb-6">
        {renderWeightChart()}
      </div>

      {/* DYNAMIC AUDIT REPORTS CONTAINER */}
      <div>
        <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-1.5 font-heading">
          <Calendar size={15} className="text-emerald-500" />
          Performance History
        </h3>

        {/* WEEKLY AUDITS TAB VIEW */}
        {activeTab === 'weekly' && (
          <div className="flex flex-col gap-4">
            {weeklySummaries.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-white rounded-3xl border border-emerald-50">
                Log food over several days to generate your first Weekly Audit.
              </div>
            ) : (
              weeklySummaries.map((summary, idx) => {
                const wDate = new Date(summary.week_start);
                const wFormatted = wDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const weightDiff = summary.weight_end_kg - summary.weight_start_kg;

                return (
                  <div 
                    key={idx} 
                    className="bg-white p-5 rounded-3xl border border-emerald-50 shadow-sm hover:shadow transition duration-200 flex flex-col gap-4 relative overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-slate-50 pb-3">
                      <div>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Weekly Audit</span>
                        <h4 className="font-extrabold text-xs text-slate-800 mt-0.5">Week of {wFormatted}</h4>
                      </div>
                      <div className="text-[11px] font-bold text-slate-700 bg-slate-50 border px-3 py-1 rounded-full shadow-sm">
                        🔥 {summary.avg_goal_percent}% Hit
                      </div>
                    </div>

                    {/* Stats Metrics */}
                    <div className="grid grid-cols-3 gap-2 py-1 text-center bg-emerald-50/20 rounded-2xl p-3">
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Avg Calories</div>
                        <div className="font-extrabold text-sm text-slate-800 mt-0.5">{summary.avg_calories} kcal</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Avg Protein</div>
                        <div className="font-extrabold text-sm text-slate-800 mt-0.5">{summary.avg_protein_g}g</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Weight Change</div>
                        <div className="font-extrabold text-sm text-slate-800 mt-0.5 flex items-center justify-center gap-0.5">
                          {weightDiff < 0 ? (
                            <span className="text-emerald-600 font-extrabold">📉 {weightDiff.toFixed(1)}kg</span>
                          ) : weightDiff > 0 ? (
                            <span className="text-slate-600">📈 +{weightDiff.toFixed(1)}kg</span>
                          ) : (
                            <span className="text-slate-500">⚖️ Flat</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* AI Coach Insights */}
                    <div className="p-3.5 bg-emerald-50/40 border border-emerald-100/30 rounded-2xl text-[11px] leading-relaxed text-emerald-950">
                      <div className="font-bold flex items-center gap-1 text-[10px] text-emerald-800 uppercase tracking-wider mb-1">
                        <Sparkles size={12} /> AI Coaching Feedback
                      </div>
                      {summary.ai_notes}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

        {/* MONTHLY AUDITS TAB VIEW */}
        {activeTab === 'monthly' && (
          <div className="flex flex-col gap-4">
            {monthlySummaries.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-white rounded-3xl border border-emerald-50">
                Log details across at least 15 days to generate your first Monthly Audit.
              </div>
            ) : (
              monthlySummaries.map((summary, idx) => {
                const mDate = new Date(summary.month + '-02'); // Add buffer for timezone offsets
                const mFormatted = mDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

                return (
                  <div 
                    key={idx} 
                    className="bg-white p-5 rounded-3xl border border-emerald-50 shadow-sm hover:shadow transition duration-200 flex flex-col gap-4 relative overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-slate-50 pb-3">
                      <div>
                        <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Monthly Summary</span>
                        <h4 className="font-extrabold text-xs text-slate-800 mt-0.5">{mFormatted} Audit</h4>
                      </div>
                      <div className="text-[11px] font-bold text-slate-700 bg-slate-50 border px-3 py-1 rounded-full shadow-sm">
                        ⭐ {summary.avg_goal_percent}% Avg Goal
                      </div>
                    </div>

                    {/* Stats Metrics */}
                    <div className="grid grid-cols-3 gap-2 py-1 text-center bg-teal-50/20 rounded-2xl p-3">
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Avg Calories</div>
                        <div className="font-extrabold text-sm text-slate-800 mt-0.5">{summary.avg_daily_calories} kcal</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Avg Protein</div>
                        <div className="font-extrabold text-sm text-slate-800 mt-0.5">{summary.avg_protein_g}g</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Weight Diff</div>
                        <div className="font-extrabold text-sm text-slate-800 mt-0.5 text-emerald-600">
                          {summary.weight_change_kg < 0 
                            ? `📉 ${summary.weight_change_kg.toFixed(1)}kg`
                            : summary.weight_change_kg > 0 
                              ? `📈 +${summary.weight_change_kg.toFixed(1)}kg`
                              : `⚖️ Flat`
                          }
                        </div>
                      </div>
                    </div>

                    {/* AI Coach Insights */}
                    <div className="p-3.5 bg-teal-50/40 border border-teal-100/30 rounded-2xl text-[11px] leading-relaxed text-teal-950">
                      <div className="font-bold flex items-center gap-1 text-[10px] text-teal-800 uppercase tracking-wider mb-1">
                        <Sparkles size={12} /> Monthly AI Coaching feedback
                      </div>
                      {summary.ai_notes}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* PRINT-SPECIFIC CSS STYLES (INJECTED IN PAGE) */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .printable-area {
            padding: 0 !important;
            margin: 0 !important;
          }
          .nav-bar-container {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
};
