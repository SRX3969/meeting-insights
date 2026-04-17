import { useMemo } from "react";
import { DbMeeting } from "@/hooks/useMeetings";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { TrendingUp, Activity, SmilePlus, ListChecks, Zap, Users, Brain } from "lucide-react";

const SENTIMENT_COLORS = {
  positive: "hsl(142, 71%, 45%)",
  neutral: "hsl(45, 93%, 47%)",
  negative: "hsl(0, 72%, 51%)",
};

export function AnalyticsDashboard({ meetings }: { meetings: DbMeeting[] }) {
  const completed = useMemo(() => meetings.filter((m) => m.status === "completed"), [meetings]);

  const avgProductivity = useMemo(() => {
    const scored = completed.filter((m) => m.productivity_score != null);
    if (!scored.length) return 0;
    return Math.round(scored.reduce((a, m) => a + (m.productivity_score || 0), 0) / scored.length);
  }, [completed]);

  const sentimentData = useMemo(() => {
    const counts = { positive: 0, neutral: 0, negative: 0 };
    completed.forEach((m) => {
      const s = m.sentiment as string;
      if (s && s in counts) counts[s as keyof typeof counts]++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [completed]);

  const productivityTrends = useMemo(() => {
    return completed
      .slice(-10)
      .map((m) => ({
        name: new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: m.productivity_score || 0,
      }));
  }, [completed]);

  const totalActionItems = useMemo(
    () => completed.reduce((a, m) => a + ((m.action_items as string[])?.length || 0), 0),
    [completed]
  );

  if (!completed.length) {
    return (
      <div className="p-12 rounded-[2.5rem] border border-black/5 bg-white/50 backdrop-blur-xl shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4 border border-primary/10">
          <Brain className="h-10 w-10 text-primary/40 animate-pulse" />
        </div>
        <h3 className="text-xl font-black text-[#0A0A0A] tracking-tight">AI Insights Standby</h3>
        <p className="text-muted-foreground text-sm font-medium max-w-xs mx-auto">Complete your first sync to unlock deep productivity insights and sentiment mapping.</p>
      </div>
    );
  }

  const sentimentSummary = sentimentData.length 
    ? sentimentData.sort((a, b) => b.value - a.value)[0].name 
    : "Neutral";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Activity} 
          label="Syncs Completed" 
          value={completed.length} 
          gradient="from-blue-500/10 to-indigo-500/5"
          iconColor="text-blue-500"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Avg Efficiency" 
          value={`${avgProductivity}%`} 
          gradient="from-emerald-500/10 to-teal-500/5"
          iconColor="text-emerald-500"
          subtitle={avgProductivity > 80 ? "Peak performance" : "Steady growth"}
        />
        <StatCard 
          icon={ListChecks} 
          label="Items Resolved" 
          value={totalActionItems} 
          gradient="from-amber-500/10 to-orange-500/5"
          iconColor="text-amber-500"
        />
        <StatCard 
          icon={SmilePlus} 
          label="Lead Sentiment" 
          value={sentimentSummary} 
          gradient="from-rose-500/10 to-pink-500/5"
          iconColor="text-rose-500"
        />
      </div>

      {/* Main Insights Glass Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Productivity Area Chart */}
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] border border-black/5 bg-white shadow-2xl space-y-6 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="h-24 w-24 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-[#0A0A0A] tracking-tight flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Efficiency Velocity
            </h3>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Historical productivity mapping</p>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 600 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                    padding: '12px 16px'
                  }} 
                  itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Distribution Pie */}
        <div className="p-8 rounded-[2.5rem] border border-black/5 bg-white shadow-2xl space-y-6 flex flex-col items-center justify-center text-center">
          <div className="space-y-1 w-full text-left">
            <h3 className="text-lg font-black text-[#0A0A0A] tracking-tight flex items-center gap-2">
              <SmilePlus className="h-5 w-5 text-rose-500" />
              Pulse Sync
            </h3>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Overall team sentiment</p>
          </div>
          
          <div className="h-[220px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={sentimentData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={65} 
                  outerRadius={85} 
                  paddingAngle={8} 
                  dataKey="value"
                  animationBegin={500}
                  animationDuration={1500}
                >
                  {sentimentData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={SENTIMENT_COLORS[entry.name as keyof typeof SENTIMENT_COLORS] || "hsl(var(--muted))"} 
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-[#0A0A0A] tracking-tighter capitalize">
                {sentimentSummary}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dominant</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full pt-4">
            {Object.entries(SENTIMENT_COLORS).map(([name, color]) => (
              <div key={name} className="space-y-1">
                <div className="h-1 w-full rounded-full bg-black/5 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ 
                      backgroundColor: color, 
                      width: `${(sentimentData.find(d => d.name === name)?.value || 0) / completed.length * 100}%` 
                    }} 
                  />
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">{name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, gradient, iconColor, subtitle }: { 
  icon: any; 
  label: string; 
  value: string | number; 
  gradient: string; 
  iconColor: string;
  subtitle?: string;
}) {
  return (
    <div className={`p-6 rounded-3xl border border-black/5 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden relative group`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative flex flex-col gap-4">
        <div className={`h-12 w-12 rounded-2xl bg-white border border-black/5 shadow-sm flex items-center justify-center transition-transform duration-500 group-hover:scale-110`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-3xl font-black text-[#0A0A0A] tracking-tighter capitalize leading-none">{value}</h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
          {subtitle && (
            <p className="text-[9px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
