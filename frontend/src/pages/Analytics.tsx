import { useQuery } from '@tanstack/react-query';
import { progressApi } from '../api/progress';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Activity, Clock, Target, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Easy(Green), Medium(Yellow), Hard(Red)

export default function Analytics({ category }: { category?: string }) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', category],
    queryFn: () => progressApi.getMyAnalytics(category),
  });

  const { data: heatmapData, isLoading: isHeatmapLoading } = useQuery({
    queryKey: ['heatmap', category],
    queryFn: () => progressApi.getHeatmap(category),
  });

  if (isLoading || isHeatmapLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Easy', value: analytics?.easy || 0 },
    { name: 'Medium', value: analytics?.medium || 0 },
    { name: 'Hard', value: analytics?.hard || 0 },
  ];

  const totalSolved = (analytics?.easy || 0) + (analytics?.medium || 0) + (analytics?.hard || 0);
  const avgTime = analytics?.averageTime ? Math.round(analytics.averageTime) : 0;

  // Heatmap generation
  const today = new Date();
  const daysInYear = 365;
  const heatmapGrid: { date: string; count: number }[] = [];
  for (let i = daysInYear - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    heatmapGrid.push({
      date: dateStr,
      count: heatmapData?.[dateStr] || 0
    });
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-6 mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400/20 to-primary-600/20 flex items-center justify-center text-primary-500 border border-primary-500/20 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
          <Activity className="w-8 h-8 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter mb-1">
            {category === 'PRACTICE' ? 'DSA Practice ' : category === 'CP' ? 'CP ' : 'Your '}<span className="glow-text">Analytics</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Track your problem solving journey</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-3xl shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Total Solved</span>
            <Target className="w-6 h-6 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          </div>
          <p className="text-5xl font-black text-blue-600 dark:text-blue-400 mt-6 relative z-10 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">{totalSolved}</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-3xl shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Average Time</span>
            <Clock className="w-6 h-6 text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
          </div>
          <div className="flex items-end gap-2 mt-6 relative z-10">
            <p className="text-5xl font-black text-purple-600 dark:text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">{avgTime}</p>
            <span className="text-slate-500 dark:text-slate-400 font-bold mb-2">mins</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-3xl shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Hard Problems</span>
            <CheckCircle2 className="w-6 h-6 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          </div>
          <p className="text-5xl font-black text-red-600 dark:text-red-400 mt-6 relative z-10 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">{analytics?.hard || 0}</p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Difficulty Breakdown Pie Chart */}
        <div className="glass-card p-6 rounded-3xl shadow-lg">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">Difficulty Breakdown</h3>
          <div className="h-64">
            {totalSolved > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', backdropFilter: 'blur(8px)' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                Start solving problems to see your breakdown!
              </div>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: COLORS[index], color: COLORS[index] }} />
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart - Just reusing pie data as bars for visualization */}
        <div className="glass-card p-6 rounded-3xl shadow-lg">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">Problems Solved</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontWeight: 'bold' }} />
                <YAxis stroke="#64748b" tick={{ fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="glass-card p-6 rounded-3xl shadow-lg overflow-hidden relative">
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">Activity Heatmap</h3>
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="min-w-[800px] flex gap-1.5">
            {/* Split into 52 columns of up to 7 days */}
            {Array.from({ length: 53 }).map((_, weekIdx) => {
              const weekDays = heatmapGrid.slice(weekIdx * 7, (weekIdx + 1) * 7);
              if (weekDays.length === 0) return null;
              return (
                <div key={weekIdx} className="flex flex-col gap-1.5">
                  {weekDays.map((day) => {
                    let bg = 'bg-slate-200 dark:bg-white/5';
                    if (day.count > 0) bg = 'bg-primary-300 dark:bg-primary-900/50 shadow-[0_0_8px_rgba(139,92,246,0.3)]';
                    if (day.count > 1) bg = 'bg-primary-400 dark:bg-primary-700 shadow-[0_0_10px_rgba(139,92,246,0.5)]';
                    if (day.count > 2) bg = 'bg-primary-500 dark:bg-primary-500 shadow-[0_0_12px_rgba(139,92,246,0.7)]';
                    if (day.count > 3) bg = 'bg-primary-600 dark:bg-primary-400 shadow-[0_0_15px_rgba(139,92,246,0.9)]';
                    
                    return (
                      <div
                        key={day.date}
                        title={`${day.date}: ${day.count} problems solved`}
                        className={`w-3.5 h-3.5 rounded-sm ${bg} transition-all duration-300 cursor-pointer hover:scale-125 hover:z-10`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mt-4">
          <span>Less</span>
          <div className="flex gap-1.5">
            <div className="w-3.5 h-3.5 rounded-sm bg-slate-200 dark:bg-white/5" />
            <div className="w-3.5 h-3.5 rounded-sm bg-primary-300 dark:bg-primary-900/50" />
            <div className="w-3.5 h-3.5 rounded-sm bg-primary-400 dark:bg-primary-700" />
            <div className="w-3.5 h-3.5 rounded-sm bg-primary-500 dark:bg-primary-500" />
            <div className="w-3.5 h-3.5 rounded-sm bg-primary-600 dark:bg-primary-400" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
