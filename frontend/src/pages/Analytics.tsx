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
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {category === 'PRACTICE' ? 'DSA Practice Analytics' : category === 'CP' ? 'CP Analytics' : 'Your Analytics'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Track your problem solving journey</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Total Solved</span>
            <Target className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-4xl font-black text-slate-900 dark:text-white mt-4">{totalSolved}</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Average Time</span>
            <Clock className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex items-end gap-2 mt-4">
            <p className="text-4xl font-black text-slate-900 dark:text-white">{avgTime}</p>
            <span className="text-slate-500 dark:text-slate-400 font-medium mb-1">mins / problem</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Hard Problems</span>
            <CheckCircle2 className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-4xl font-black text-slate-900 dark:text-white mt-4">{analytics?.hard || 0}</p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Difficulty Breakdown Pie Chart */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Difficulty Breakdown</h3>
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
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Start solving problems to see your breakdown!
              </div>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart - Just reusing pie data as bars for visualization */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Problems Solved</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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
      <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm overflow-hidden">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Activity Heatmap</h3>
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[800px] flex gap-1">
            {/* Split into 52 columns of up to 7 days */}
            {Array.from({ length: 53 }).map((_, weekIdx) => {
              const weekDays = heatmapGrid.slice(weekIdx * 7, (weekIdx + 1) * 7);
              if (weekDays.length === 0) return null;
              return (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {weekDays.map((day) => {
                    let bg = 'bg-slate-100 dark:bg-slate-700';
                    if (day.count > 0) bg = 'bg-green-200 dark:bg-green-700';
                    if (day.count > 1) bg = 'bg-green-300 dark:bg-green-600';
                    if (day.count > 2) bg = 'bg-green-400 dark:bg-green-500';
                    if (day.count > 3) bg = 'bg-green-500 dark:bg-green-400';
                    
                    return (
                      <div
                        key={day.date}
                        title={`${day.date}: ${day.count} problems solved`}
                        className={`w-3.5 h-3.5 rounded-sm ${bg} transition-colors cursor-pointer hover:ring-2 hover:ring-slate-400`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3.5 h-3.5 rounded-sm bg-slate-100 dark:bg-slate-700" />
            <div className="w-3.5 h-3.5 rounded-sm bg-green-200 dark:bg-green-700" />
            <div className="w-3.5 h-3.5 rounded-sm bg-green-300 dark:bg-green-600" />
            <div className="w-3.5 h-3.5 rounded-sm bg-green-400 dark:bg-green-500" />
            <div className="w-3.5 h-3.5 rounded-sm bg-green-500 dark:bg-green-400" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
