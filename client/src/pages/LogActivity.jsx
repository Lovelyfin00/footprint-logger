import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "../hooks/useApi";

const SESSION_KEY = "fp_session_logs";

const PRESETS = {
  transport: [
    { label: "Car — short trip (< 10 km)", co2kg: 1.8 },
    { label: "Car — long trip (> 50 km)", co2kg: 8.5 },
    { label: "Motorbike", co2kg: 1.2 },
    { label: "Bus journey", co2kg: 0.4 },
    { label: "Train journey", co2kg: 0.2 },
    { label: "Domestic flight", co2kg: 90 },
    { label: "Long-haul flight", co2kg: 400 },
    { label: "Cycling or walking", co2kg: 0 },
  ],
  food: [
    { label: "Beef meal", co2kg: 6.6 },
    { label: "Lamb meal", co2kg: 5.0 },
    { label: "Pork meal", co2kg: 2.1 },
    { label: "Chicken meal", co2kg: 1.1 },
    { label: "Fish meal", co2kg: 1.2 },
    { label: "Dairy-heavy meal", co2kg: 1.8 },
    { label: "Plant-based meal", co2kg: 0.4 },
    { label: "Food waste — full meal", co2kg: 2.5 },
  ],
  energy: [
    { label: "Laundry cycle (60°C)", co2kg: 0.6 },
    { label: "Laundry cycle (30°C)", co2kg: 0.3 },
    { label: "Dishwasher cycle", co2kg: 0.7 },
    { label: "Hour of electric heating", co2kg: 1.2 },
    { label: "Hot shower (10 min)", co2kg: 0.5 },
    { label: "Streaming video (1 hr)", co2kg: 0.04 },
    { label: "Leaving PC on overnight", co2kg: 0.2 },
    { label: "Tumble dryer cycle", co2kg: 1.8 },
  ],
};

const CATEGORY_META = {
  transport: { label: "Transport", color: "text-ocean", border: "border-ocean", bg: "bg-ocean/[0.07]", dot: "bg-ocean", hex: "#099ec8" },
  food:      { label: "Food",      color: "text-leaf",  border: "border-leaf",  bg: "bg-leaf/[0.07]",  dot: "bg-leaf",  hex: "#84bc41" },
  energy:    { label: "Energy",    color: "text-sun",   border: "border-sun",   bg: "bg-sun/[0.07]",   dot: "bg-sun",   hex: "#f9c416" },
};

function getSessionLogs() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "[]");
  } catch {
    return [];
  }
}

function appendSessionLog(entry) {
  const logs = getSessionLogs();
  logs.push(entry);
  localStorage.setItem(SESSION_KEY, JSON.stringify(logs));
  return logs;
}

function CategoryTab({ id, active, onClick }) {
  const meta = CATEGORY_META[id];
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2.5 px-5 py-2.5 font-body text-xs uppercase tracking-[0.2em] border transition-all duration-200 ${
        active
          ? `${meta.border} ${meta.bg} ${meta.color}`
          : "border-white/[0.07] text-paper/30 hover:text-paper/60 hover:border-white/20"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${active ? "opacity-80" : "opacity-20"}`} />
      {meta.label}
    </button>
  );
}

function PresetCard({ preset, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(preset)}
      className={`text-left w-full px-4 py-3.5 border transition-all duration-200 ${
        selected
          ? "border-paper/30 bg-white/[0.05]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-body text-sm text-paper/70">{preset.label}</span>
        <span className="font-mono text-xs text-paper/30 shrink-0">{preset.co2kg} kg</span>
      </div>
    </button>
  );
}

function RunningTotal({ sessionLogs, justAdded }) {
  const total = sessionLogs.reduce((s, l) => s + l.co2kg, 0);

  const byCategory = sessionLogs.reduce((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + l.co2kg;
    return acc;
  }, {});

  return (
    <div className="border border-white/[0.07] bg-white/[0.02] p-6 mb-4">
      <p className="font-body text-[10px] uppercase tracking-[0.22em] text-paper/30 mb-4">
        Session total
      </p>

      <motion.p
        key={total}
        initial={{ scale: 1.08, color: "#84bc41" }}
        animate={{ scale: 1, color: "#f5f5f0" }}
        transition={{ duration: 0.4 }}
        className="font-display text-4xl mb-1"
      >
        {total.toFixed(2)} kg
      </motion.p>
      <p className="font-body text-[10px] text-paper/25 uppercase tracking-[0.18em] mb-5">
        CO₂ this session
      </p>

      {Object.entries(byCategory).length > 0 && (
        <div className="flex flex-col gap-2 pt-4 border-t border-white/[0.06]">
          {Object.entries(byCategory).map(([cat, val]) => {
            const meta = CATEGORY_META[cat];
            const pct = total > 0 ? ((val / total) * 100).toFixed(0) : 0;
            return (
              <div key={cat} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  <span className={`font-body text-xs capitalize ${meta.color}`}>{cat}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-body text-[11px] text-paper/20">{pct}%</span>
                  <span className="font-mono text-xs text-paper/40">{val.toFixed(2)} kg</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sessionLogs.length === 0 && (
        <p className="font-body text-xs text-paper/20">
          Activities you log this session appear here.
        </p>
      )}
    </div>
  );
}

export default function LogActivity() {
  const { request } = useApi();
  const navigate = useNavigate();

  const [category, setCategory] = useState("transport");
  const [selected, setSelected] = useState(null);
  const [customLabel, setCustomLabel] = useState("");
  const [customCo2, setCustomCo2] = useState("");
  const [note, setNote] = useState("");
  const [mode, setMode] = useState("preset");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionLogs, setSessionLogs] = useState(getSessionLogs);

  function handleCategoryChange(cat) {
    setCategory(cat);
    setSelected(null);
    setError("");
  }

  function handlePresetSelect(preset) {
    setSelected(preset);
    setError("");
  }

  function resetForm() {
    setSelected(null);
    setCustomLabel("");
    setCustomCo2("");
    setNote("");
    setError("");
  }

  async function handleSubmit() {
    setError("");

    let label, co2kg;

    if (mode === "preset") {
      if (!selected) return setError("Pick an activity first.");
      label = selected.label;
      co2kg = selected.co2kg;
    } else {
      if (!customLabel.trim()) return setError("Give the activity a name.");
      const parsed = parseFloat(customCo2);
      if (isNaN(parsed) || parsed < 0) return setError("Enter a valid CO₂ amount.");
      label = customLabel.trim();
      co2kg = parsed;
    }

    setLoading(true);
    try {
      await request("/activities", {
        method: "POST",
        body: { label, category, co2kg, note: note.trim() },
      });

      const entry = { label, category, co2kg, loggedAt: new Date().toISOString() };
      const updated = appendSessionLog(entry);
      setSessionLogs(updated);

      setSuccess(true);
      resetForm();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink pt-24 pb-20 px-6 md:px-12 lg:px-16">
      <div className="mx-auto">

        <div className="mb-12">
          <p className="font-body text-[11px] uppercase tracking-[0.3em] text-ocean/60 mb-3">
            Log activity
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-paper">
            What did you do today?
          </h1>
        </div>

        <div className="grid md:grid-cols-5 gap-6">

          <div className="md:col-span-3">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setMode("preset"); resetForm(); }}
                className={`font-body text-xs uppercase tracking-[0.2em] px-4 py-2 border transition-colors ${
                  mode === "preset" ? "border-paper/30 text-paper/80" : "border-white/[0.07] text-paper/25 hover:text-paper/50"
                }`}
              >
                Common activities
              </button>
              <button
                onClick={() => { setMode("custom"); resetForm(); }}
                className={`font-body text-xs uppercase tracking-[0.2em] px-4 py-2 border transition-colors ${
                  mode === "custom" ? "border-paper/30 text-paper/80" : "border-white/[0.07] text-paper/25 hover:text-paper/50"
                }`}
              >
                Custom
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode === "preset" ? (
                <motion.div
                  key="preset"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex gap-2 flex-wrap mb-5">
                    {Object.keys(PRESETS).map((cat) => (
                      <CategoryTab key={cat} id={cat} active={category === cat} onClick={handleCategoryChange} />
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    {PRESETS[category].map((preset) => (
                      <PresetCard
                        key={preset.label}
                        preset={preset}
                        selected={selected?.label === preset.label}
                        onSelect={handlePresetSelect}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="custom"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <p className="font-body text-[10px] uppercase tracking-[0.25em] text-paper/35 mb-2">
                      Category
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {Object.keys(PRESETS).map((cat) => (
                        <CategoryTab key={cat} id={cat} active={category === cat} onClick={handleCategoryChange} />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-body text-[10px] uppercase tracking-[0.25em] text-paper/35">
                      Activity name
                    </label>
                    <input
                      type="text"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      placeholder="e.g. Drove to supermarket"
                      className="bg-white/[0.03] border border-white/[0.08] focus:border-ocean px-4 py-3.5 font-body text-sm text-paper placeholder:text-paper/20 outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-body text-[10px] uppercase tracking-[0.25em] text-paper/35">
                      CO₂ amount (kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={customCo2}
                      onChange={(e) => setCustomCo2(e.target.value)}
                      placeholder="0.00"
                      className="bg-white/[0.03] border border-white/[0.08] focus:border-ocean px-4 py-3.5 font-body text-sm text-paper placeholder:text-paper/20 outline-none transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="md:col-span-2">
            <div className="sticky top-24">

              <RunningTotal sessionLogs={sessionLogs} justAdded={success} />

              <div className="border border-white/[0.07] bg-white/[0.02] p-6 mb-4">
                <p className="font-body text-[10px] uppercase tracking-[0.22em] text-paper/30 mb-5">
                  Activity to log
                </p>

                {selected || (mode === "custom" && customLabel) ? (
                  <div>
                    <p className="font-body text-sm text-paper/70 mb-1">
                      {mode === "preset" ? selected?.label : customLabel || "—"}
                    </p>
                    <p className={`font-display text-4xl mt-3 ${CATEGORY_META[category].color}`}>
                      {mode === "preset"
                        ? `${selected?.co2kg} kg`
                        : customCo2 ? `${parseFloat(customCo2).toFixed(2)} kg` : "— kg"}
                    </p>
                    <p className="font-body text-xs text-paper/25 mt-1 uppercase tracking-[0.18em]">
                      CO₂ equivalent
                    </p>
                  </div>
                ) : (
                  <p className="font-body text-sm text-paper/20">
                    {mode === "preset" ? "Select an activity to the left." : "Fill in the form."}
                  </p>
                )}

                <div className="mt-6 pt-5 border-t border-white/[0.06]">
                  <label className="font-body text-[10px] uppercase tracking-[0.22em] text-paper/30 block mb-2">
                    Note (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Any context worth adding..."
                    className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-ocean px-4 py-3 font-body text-sm text-paper/70 placeholder:text-paper/15 outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              {error && (
                <p className="font-body text-xs text-red-400/70 bg-red-400/[0.05] border border-red-400/20 px-4 py-3 mb-4">
                  {error}
                </p>
              )}

              <AnimatePresence>
                {success && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="font-body text-xs text-leaf/80 bg-leaf/[0.05] border border-leaf/20 px-4 py-3 mb-4"
                  >
                    Activity logged and saved.
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-ocean text-ink font-body text-xs uppercase tracking-[0.22em] py-4 hover:bg-sky transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "Save activity"}
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full border border-white/[0.07] text-paper/30 font-body text-xs uppercase tracking-[0.22em] py-3.5 hover:text-paper/60 hover:border-white/20 transition-colors"
                >
                  Back to dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
