import { useMemo } from "react";
import { DbMeeting } from "@/hooks/useMeetings";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, Activity, SmilePlus, ListChecks } from "lucide-react";

const SENTIMENT_COLORS = {
  positive: "hsl(142, 71%, 45%)",
  neutral: "hsl(45, 93%, 47%)",
  negative: "hsl(0, 72%, 51%)",
};

export function AnalyticsDashboard({ meetings }: { meetings: DbMeeting[] }) {
  const completed = useMemo(() => meetings.filter((m) => m.status === "completed"), [meetings]);

  const avgProductivity = useMemo(() => {
    const scored = completed.filter((m) => (m as any).productivity_score != null);
    if (!scored.length) return 0;
    return Math.round(scored.reduce((a, m) => a + ((m as any).productivity_score || 0), 0) / scored.length);
  }, [completed]);

  const sentimentData = useMemo(() => {
    const counts = { positive: 0, neutral: 0, negative: 0 };
    completed.forEach((m) => {
      const s = (m as any).sentiment as string;
      if (s && s in counts) counts[s as keyof typeof counts]++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [completed]);

  const meetingsOverTime = useMemo(() => {
    const byWeek: Record<string, number> = {};
    completed.forEach((m) => {
      const d = new Date(m.created_at);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      byWeek[key] = (byWeek[key] || 0) + 1;
    });
    return Object.entries(byWeek)
      .slice(-8)
      .map(([week, count]) => ({ week, count }));
  }, [completed]);

  const productivityData = useMemo(() => {
    return completed
      .filter((m) => (m as any).productivity_score != null)
      .slice(-10)
      .map((m) => ({
        title: m.title.slice(0, 15) + (m.title.length > 15 ? "…" : ""),
        score: (m as any).productivity_score,
      }));
  }, [completed]);

  const totalActionItems = useMemo(
    () => completed.reduce((a, m) => a + ((m.action_items as string[])?.length || 0), 0),
    [completed]
  );

  if (!completed.length) {
    return (
      <div className="p-6 rounded-2xl border border-black/5 bg-white shadow-sm text-center py-12">
        <Activity className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm font-semibold">Complete some meetings to see analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Completed" value={completed.length} />
        <StatCard icon={TrendingUp} label="Avg Productivity" value={`${avgProductivity}%`} />
        <StatCard icon={ListChecks} label="Action Items" value={totalActionItems} />
        <StatCard
          icon={SmilePlus}
          label="Top Sentiment"
          value={sentimentData.length ? sentimentData.sort((a, b) => b.value - a.value)[0].name : "—"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meetings over time */}
        {meetingsOverTime.length > 1 && (
          <div className="p-6 rounded-2xl border border-black/5 bg-white shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#0A0A0A] uppercase tracking-wider">Meetings Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={meetingsOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" className="text-xs font-semibold" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis className="text-xs font-semibold" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Productivity scores */}
        {productivityData.length > 0 && (
          <div className="p-6 rounded-2xl border border-black/5 bg-white shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#0A0A0A] uppercase tracking-wider">Productivity Scores</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="title" className="text-xs font-semibold" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[0, 100]} className="text-xs font-semibold" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sentiment distribution */}
        {sentimentData.length > 0 && (
          <div className="p-6 rounded-2xl border border-black/5 bg-white shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#0A0A0A] uppercase tracking-wider">Sentiment Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {sentimentData.map((entry) => (
                    <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name as keyof typeof SENTIMENT_COLORS] || "hsl(var(--muted))"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="p-6 rounded-2xl border border-black/5 bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
        <Icon className="h-6 w-6 text-accent-foreground" />
      </div>
      <div>
        <h3 className="text-2xl font-black text-[#0A0A0A] tracking-tighter capitalize">{value}</h3>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}
