import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useApi } from "../hooks/useApi";

const CATEGORY_META = {
  transport: {
    label: "Transport",
    color: "text-ocean",
    bg: "bg-ocean",
    border: "border-ocean/30",
    soft: "bg-ocean/[0.06]",
    desc: "Getting around",
  },
  food: {
    label: "Food",
    color: "text-leaf",
    bg: "bg-leaf",
    border: "border-leaf/30",
    soft: "bg-leaf/[0.06]",
    desc: "What you eat",
  },
  energy: {
    label: "Energy",
    color: "text-sun",
    bg: "bg-sun",
    border: "border-sun/30",
    soft: "bg-sun/[0.06]",
    desc: "Energy usage",
  },
};

function TipCard({ tip, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.5 }}
      className="border border-white/[0.07] bg-white/[0.02] px-6 py-5"
    >
      <div className="flex gap-4">
        <span className="font-mono text-xs text-paper/20 mt-0.5 shrink-0">
          {String(index + 1).padStart(2, "0")}
        </span>
        <p className="font-body text-sm text-paper/60 leading-relaxed">{tip}</p>
      </div>
    </motion.div>
  );
}

function CategoryBreakdown({ byCategory, totalLast28Days }) {
  const sorted = Object.entries(byCategory).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="border border-white/[0.07] bg-white/[0.02] p-6">
      <p className="font-body text-[10px] uppercase tracking-[0.22em] text-paper/30 mb-6">
        Last 28 days by category
      </p>
      <div className="space-y-5">
        {sorted.map(([cat, data]) => {
          const meta = CATEGORY_META[cat];
          if (!meta) return null;
          const pct = totalLast28Days > 0 ? (data.total / totalLast28Days) * 100 : 0;
          return (
            <div key={cat}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className={`font-body text-sm ${meta.color}`}>{meta.label}</span>
                  <span className="font-body text-xs text-paper/25 ml-2">{data.count} logs</span>
                </div>
                <span className="font-mono text-sm text-paper/50">{data.total.toFixed(2)} kg</span>
              </div>
              <div className="h-1.5 bg-white/[0.05] w-full">
                <motion.div
                  className={`h-full ${meta.bg}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </div>
              <p className="font-body text-[11px] text-paper/20 mt-1">
                {pct.toFixed(0)}% of total
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyGoalSetter({ currentGoal, onSave }) {
  const [val, setVal] = useState(currentGoal ?? 20);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(Number(val));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="border border-white/[0.07] bg-white/[0.02] p-6">
      <p className="font-body text-[10px] uppercase tracking-[0.22em] text-paper/30 mb-5">
        Weekly reduction goal
      </p>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min="1"
          max="200"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-24 bg-white/[0.04] border border-white/[0.08] focus:border-ocean px-3 py-2.5 font-mono text-sm text-paper outline-none transition-colors text-center"
        />
        <span className="font-body text-sm text-paper/30">kg CO₂ per week</span>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className={`mt-4 font-body text-xs uppercase tracking-[0.2em] px-5 py-2.5 ${saved ? "text-lime-300" : "bg-ocean text-ink hover:bg-sky "}  transition-colors disabled:opacity-40`}
      >
        {saving ? "Saving..." : saved ? "✔ Saved" : "Update goal"}
      </button>
    </div>
  );
}

export default function Insights() {
  const { request } = useApi();
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [insightsRes, meRes] = await Promise.all([
        request("/activities/insights"),
        request("/auth/me"),
      ]);
      setData(insightsRes);
      setUser(meRes.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoalUpdate(goal) {
    try {
      const res = await request("/auth/goal", {
        method: "PATCH",
        body: { weeklyGoal: goal },
      });
      setUser(res.user);
    } catch {
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="font-body text-xs uppercase tracking-[0.25em] text-paper/20 animate-pulse">
          Analysing your habits...
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

  const hasData = data && Object.keys(data.byCategory || {}).length > 0;
  const topMeta = data?.topCategory ? CATEGORY_META[data.topCategory] : null;

  return (
    <main className="min-h-screen bg-ink pt-24 pb-20 px-6 md:px-12 lg:px-16">
      <div className="mx-auto">

        <div className="mb-12">
          <p className="font-body text-[11px] uppercase tracking-[0.3em] text-ocean/60 mb-3">
            Insights
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-paper">
            Where your footprint comes from.
          </h1>
        </div>

        {!hasData ? (
          <div className="border border-white/[0.07] bg-white/[0.02] p-12 text-center">
            <p className="font-body text-sm text-paper/30 mb-6">
              No data yet. Log some activities and come back here.
            </p>
            <Link
              to="/log"
              className="font-body text-xs uppercase tracking-[0.22em] px-7 py-3.5 bg-ocean text-ink hover:bg-sky transition-colors"
            >
              Log first activity
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-5 gap-4">

            <div className="md:col-span-3 flex flex-col gap-4">

              {topMeta && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border ${topMeta.border} ${topMeta.soft} p-6`}
                >
                  <p className="font-body text-[10px] uppercase tracking-[0.25em] text-paper/30 mb-4">
                    Highest impact area
                  </p>
                  <p className={`font-display text-5xl mb-2 ${topMeta.color}`}>
                    {topMeta.label}
                  </p>
                  <p className="font-body text-sm text-paper/40">
                    {topMeta.desc} is generating the most emissions in your logs over the past 28 days.
                  </p>
                </motion.div>
              )}

              {data.tips?.length > 0 && (
                <div>
                  <p className="font-body text-[10px] uppercase tracking-[0.22em] text-paper/30 mb-3">
                    Practical swaps
                  </p>
                  <div className="flex flex-col gap-2">
                    {data.tips.map((tip, i) => (
                      <TipCard key={i} tip={tip} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex flex-col gap-4">

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border border-white/[0.07] bg-white/[0.02] p-6"
              >
                <p className="font-body text-[10px] uppercase tracking-[0.22em] text-paper/30 mb-3">
                  Total for last 28 days
                </p>
                <p className="font-display text-5xl text-paper mb-1">
                  {data.totalLast28Days} <span className="text-2xl text-paper/30">kg</span>
                </p>
                <p className="font-body text-xs text-paper/25">CO₂ equivalent</p>
              </motion.div>

              {hasData && (
                <CategoryBreakdown
                  byCategory={data.byCategory}
                  totalLast28Days={data.totalLast28Days}
                />
              )}

              {user && (
                <WeeklyGoalSetter
                  currentGoal={user.weeklyGoal}
                  onSave={handleGoalUpdate}
                />
              )}

            </div>
          </div>
        )}
      </div>
    </main>
  );
}
