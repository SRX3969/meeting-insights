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
      <div className="notion-card text-center py-12">
        <Activity className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Complete some meetings to see analytics</p>
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
          <div className="notion-card space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Meetings Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={meetingsOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Productivity scores */}
        {productivityData.length > 0 && (
          <div className="notion-card space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Productivity Scores</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="title" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[0, 100]} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sentiment distribution */}
        {sentimentData.length > 0 && (
          <div className="notion-card space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Sentiment Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {sentimentData.map((entry) => (
                    <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name as keyof typeof SENTIMENT_COLORS] || "hsl(var(--muted))"} />
                  ))}
                </Pie>
                <Tooltip />
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
    <div className="notion-card flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-accent-foreground" />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground capitalize">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
