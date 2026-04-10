import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";

const CATEGORY_COLORS = {
  transport: { text: "text-ocean", bg: "bg-ocean", hex: "#099ec8" },
  food:      { text: "text-leaf",  bg: "bg-leaf",  hex: "#84bc41" },
  energy:    { text: "text-sun",   bg: "bg-sun",   hex: "#f9c416" },
};

function StatCard({ value, label, color = "text-paper", sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/[0.07] bg-white/[0.02] p-6"
    >
      <p className={`font-display text-3xl mb-1.5 ${color}`}>{value}</p>
      <p className="font-body text-[10px] uppercase tracking-[0.22em] text-paper/30">{label}</p>
      {sub && <p className="font-body text-xs text-paper/20 mt-2">{sub}</p>}
    </motion.div>
  );
}

function StreakBadge({ streak }) {
  if (!streak || streak < 2) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2.5 border border-sun/30 bg-sun/[0.06] px-4 py-2.5 self-start mb-6"
    >
      <span className="w-2 h-2 rounded-full bg-sun" />
      <span className="font-body text-xs text-sun">
        {streak} day streak, keep it going
      </span>
    </motion.div>
  );
}

function DonutChart({ byCategory, total, goal }) {
  const entries = Object.entries(byCategory).filter(([, v]) => v > 0);

  if (entries.length === 0) {
    return (
      <div className="border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col h-full">
        <p className="font-body text-[10px] uppercase tracking-[0.22em] text-paper/30 mb-4">
          This week's breakdown
        </p>
        <div className="flex-1 flex items-center justify-center py-10">
          <p className="font-body text-sm text-paper/20">Nothing logged yet this week.</p>
        </div>
      </div>
    );
  }

  const chartData = entries.map(([cat, val]) => ({
    name: cat,
    value: parseFloat(val.toFixed(2)),
    color: CATEGORY_COLORS[cat]?.hex || "#888",
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    return (
      <div className="bg-ink border border-white/[0.1] px-3 py-2">
        <p className="font-body text-xs text-paper/60 capitalize">{item.name}</p>
        <p className="font-mono text-sm text-paper">{item.value} kg</p>
      </div>
    );
  };

  const goalPercent = goal > 0 ? Math.min(100, Math.round((total / goal) * 100)) : null;

  return (
    <div className="border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col h-full">
      <p className="font-body text-[10px] uppercase tracking-[0.22em] text-paper/30 mb-5">
        This week's breakdown
      </p>

      <div className="relative h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="85%"
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="font-display text-2xl text-paper leading-none">{total.toFixed(1)}</p>
          <p className="font-body text-[10px] text-paper/30 uppercase tracking-[0.18em] mt-1">kg CO₂</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 mt-4">
        {chartData.map((item) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-body text-xs capitalize text-paper/50">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-body text-xs text-paper/25">{pct}%</span>
                <span className="font-mono text-xs text-paper/40">{item.value} kg</span>
              </div>
            </div>
          );
        })}
      </div>

      {goalPercent !== null && (
        <div className="mt-5 pt-4 border-t border-white/[0.06]">
          <div className="flex justify-between mb-2">
            <span className="font-body text-[10px] uppercase tracking-[0.2em] text-paper/30">
              Weekly goal
            </span>
            <span className="font-mono text-[11px] text-paper/30">
              {total.toFixed(1)} / {goal} kg
            </span>
          </div>
          <div className="h-1 bg-white/[0.05] w-full">
            <motion.div
              className={`h-full ${goalPercent >= 100 ? "bg-sun" : "bg-moss"}`}
              initial={{ width: 0 }}
              animate={{ width: `${goalPercent}%` }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
            />
          </div>
          <p className="font-body text-[10px] text-paper/20 mt-1.5">
            {goalPercent}% of weekly target used
          </p>
        </div>
      )}
    </div>
  );
}

function ActivityRow({ activity, onDelete }) {
  const colors = CATEGORY_COLORS[activity.category] || { text: "text-paper/40" };
  const date = new Date(activity.loggedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex items-center justify-between py-3.5 border-b border-white/[0.05] last:border-0 group">
      <div className="flex items-center gap-4 min-w-0">
        <span className={`font-body text-[10px] uppercase tracking-[0.18em] ${colors.text} w-16 shrink-0`}>
          {activity.category}
        </span>
        <div className="min-w-0">
          <p className="font-body text-sm text-paper/80 truncate">{activity.label}</p>
          {activity.note && (
            <p className="font-body text-xs text-paper/25 mt-0.5 truncate">{activity.note}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0 ml-4">
        <span className="font-body text-[10px] text-paper/20 hidden sm:block">{date}</span>
        <span className="font-mono text-sm text-paper/40">{activity.co2kg} kg</span>
        <button
          onClick={() => onDelete(activity._id)}
          className="font-body text-[10px] text-paper/15 hover:text-red-400/60 transition-colors opacity-0 group-hover:opacity-100"
        >
          remove
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { request } = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      const res = await request("/activities/dashboard");
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await request(`/activities/${id}`, { method: "DELETE" });
      setData((prev) => ({
        ...prev,
        recentLogs: prev.recentLogs.filter((a) => a._id !== id),
      }));
    } catch {
 
    }
  }

  useEffect(() => { loadDashboard(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="font-body text-xs uppercase tracking-[0.25em] text-paper/20 animate-pulse">
          Loading dashboard...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body text-sm text-red-400/60">{error}</p>
      </div>
    );
  }

  const { recentLogs, thisWeek, lastWeek, communityAvgThisWeek, streak } = data;
  const weekChange =
    lastWeek.total > 0
      ? (((thisWeek.total - lastWeek.total) / lastWeek.total) * 100).toFixed(1)
      : null;

  return (
    <main className="min-h-screen bg-ink pt-24 pb-20 px-6 md:px-12 lg:px-16">
      <div className="mx-auto">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 pt-10 pb-6">
          <div>

            <h1 className="font-display text-4xl md:text-5xl text-paper">
              Hey, {user.name.split(" ")[0]}.
            </h1>
          </div>
          <Link
            to="/log"
            className="inline-block font-body text-xs uppercase tracking-[0.2em] px-7 py-3.5 bg-leaf text-ink hover:bg-moss transition-colors duration-300 self-start md:self-auto"
          >
            Log activity
          </Link>
        </div>

        <StreakBadge streak={streak} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            value={`${thisWeek.total} kg`}
            label="This week"
            color="text-ocean"
            sub={weekChange !== null ? `${weekChange > 0 ? "+" : ""}${weekChange}% vs last week` : "No data last week"}
          />
          <StatCard
            value={`${lastWeek.total} kg`}
            label="Last week"
            color="text-paper/60"
          />
          <StatCard
            value={communityAvgThisWeek ? `${communityAvgThisWeek} kg` : "—"}
            label="Community avg"
            color="text-sky"
            sub="This week"
          />
          <StatCard
            value={streak ? `${streak} days` : "—"}
            label="Current streak"
            color="text-sun"
            sub={streak >= 1 ? "days logged in a row" : "Log today to start"}
          />
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <DonutChart
              byCategory={thisWeek.byCategory}
              total={thisWeek.total}
              goal={thisWeek.goal}
            />
          </div>

          <div className="md:col-span-3 border border-white/[0.07] bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="font-body text-[10px] uppercase tracking-[0.22em] text-paper/30">
                Recent activity
              </p>
              <Link to="/log" className="font-body text-[10px] uppercase tracking-[0.2em] text-ocean/60 hover:text-ocean transition-colors">
                Add new
              </Link>
            </div>

            {recentLogs.length === 0 ? (
              <div className="py-10 text-center">
                <p className="font-body text-sm text-paper/20 mb-4">Nothing logged yet.</p>
                <Link to="/log" className="font-body text-xs text-ocean/60 hover:text-ocean transition-colors">
                  Log your first activity →
                </Link>
              </div>
            ) : (
              recentLogs.map((activity) => (
                <ActivityRow key={activity._id} activity={activity} onDelete={handleDelete} />
              ))
            )}
          </div>
        </div>

        <div className="mt-4 border border-white/[0.07] bg-white/[0.02] px-6 py-5 flex items-center justify-between">
          <p className="font-body text-sm text-paper/50">
            See which habits are driving your footprint most.
          </p>
          <Link to="/insights" className="font-body text-xs uppercase tracking-[0.2em] text-ocean/60 hover:text-ocean transition-colors shrink-0 ml-4">
            View insights →
          </Link>
        </div>
      </div>
    </main>
  );
}
