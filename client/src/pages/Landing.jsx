import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const tickerItems = [
  { label: "Carbon Logging", color: "text-sky" },
  { label: "Transport Tracking", color: "text-ocean" },
  { label: "Food Emissions", color: "text-leaf" },
  { label: "Energy Monitoring", color: "text-sun" },
  { label: "Weekly Goals", color: "text-moss" },
  { label: "Community Average", color: "text-sky" },
  { label: "Personalised Tips", color: "text-leaf" },
  { label: "Emission Insights", color: "text-ocean" },
];

function Ticker() {
  const doubled = [...tickerItems, ...tickerItems];
  return (
    <div className="overflow-hidden border-y border-white/6 py-3 bg-white/2">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-8">
            <span className={`font-body text-[11px] uppercase tracking-[0.25em] ${item.color}`}>
              {item.label}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-between pt-28 pb-16 px-6 md:px-12 lg:px-16 overflow-hidden">
      <div className="pointer-events-none absolute -top-25 right-[-100px] w-[700px] h-[700px] rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #099ec8 0%, transparent 65%)" }} />
      <div className="pointer-events-none absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, #84bc41 0%, transparent 65%)" }} />

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="font-body text-[11px] uppercase tracking-[0.3em] text-ocean"
      >
        Environmental Tracking Platform
      </motion.p>

      <div className="flex-1 flex flex-col justify-center my-12">
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="font-display leading-[0.88] text-[clamp(3.5rem,10vw,9rem)] text-paper"
          >
            Know your
          </motion.h1>
        </div>

        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-display leading-[0.88] text-[clamp(3.5rem,10vw,9rem)] text-ocean"
          >
            carbon footprint.
          </motion.h1>
        </div>

        <div className="overflow-hidden mt-2">
          <motion.h2
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-amber-300 leading-[0.88] text-[clamp(3rem,8vw,7rem)] text-leaf"
          >
            Live better,
          </motion.h2>
        </div>

        <div className="overflow-hidden pb-6">
          <motion.h2
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.78, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-amber-300 leading-[0.88] text-[clamp(3rem,8vw,7rem)] text-sun"
          >
            every single day.
          </motion.h2>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.1 }}
          className="font-body text-sm text-paper/40 max-w-xs leading-relaxed"
        >
          Log your daily activities, see where your emissions come from, and get
          practical steps to bring them down.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="flex items-center gap-6"
        >
          <Link
            to="/register"
            className=" outline-1 font-body text-xs uppercase tracking-[0.2em] px-8 py-4 bg-ocean text-ink hover:bg-sky transition-colors duration-300"
          >
            Start for Free
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-8 right-12 flex items-center gap-3"
      >
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="block w-px h-10 bg-paper/40"
        />
      </motion.div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Log an activity",
      body: "Pick from everyday activities like driving to work, eating a steak, running a laundry cycle. Each one carries a measured CO₂ value.",
      accentBorder: "border-t-ocean",
      accentText: "text-ocean",
    },
    {
      number: "02",
      title: "See your total",
      body: "Watch your running emission total update as you log. Filter by food, transport, or energy to see exactly where the weight sits.",
      accentBorder: "border-t-leaf",
      accentText: "text-leaf",
    },
    {
      number: "03",
      title: "Get better",
      body: "The insight engine finds your highest-emission habits and suggests simple swaps. Track progress against weekly goals.",
      accentBorder: "border-t-sun",
      accentText: "text-sun",
    },
  ];

  return (
    <section className="px-6 md:px-12 lg:px-16 py-28 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <p className="font-body text-[11px] uppercase tracking-[0.3em] text-ocean/70 mb-14">
            How it works
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-px bg-white/[0.06]">
          {steps.map((step, i) => (
            <Reveal key={i} delay={i * 0.15}>
              <div className={`bg-ink p-10 border-t-2 ${step.accentBorder} h-full`}>
                <span className={`font-mono text-xs ${step.accentText} mb-8 block`}>
                  {step.number}
                </span>
                <h3 className="font-display text-2xl text-paper mb-5 leading-tight">
                  {step.title}
                </h3>
                <p className="font-body text-sm text-paper/40 leading-relaxed">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Categories() {
  const [hovered, setHovered] = useState(null);

  const cats = [
    {
      id: "transport",
      name: "Transport",
      symbol: "↗",
      examples: ["Car & motorbike", "Bus & rail", "Flights", "Cycling"],
      borderActive: "border-sky/40",
      bgActive: "bg-sky/[0.07]",
      textActive: "text-sky",
      dot: "bg-sky",
      stat: "~2.4 kg CO₂ / day avg",
    },
    {
      id: "food",
      name: "Food",
      symbol: "◉",
      examples: ["Meat & fish", "Dairy", "Plant-based", "Processed food"],
      borderActive: "border-leaf/40",
      bgActive: "bg-leaf/[0.07]",
      textActive: "text-leaf",
      dot: "bg-leaf",
      stat: "~1.7 kg CO₂ / day avg",
    },
    {
      id: "energy",
      name: "Energy",
      symbol: "◈",
      examples: ["Electricity", "Heating & cooling", "Appliances", "Hot water"],
      borderActive: "border-sun/40",
      bgActive: "bg-sun/[0.07]",
      textActive: "text-sun",
      dot: "bg-sun",
      stat: "~1.2 kg CO₂ / day avg",
    },
  ];

  return (
    <section className="px-6 md:px-12 lg:px-16 py-28 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <Reveal>
            <p className="font-body text-[11px] uppercase tracking-[0.3em] text-ocean/70 mb-4">
              What you track
            </p>
            <h2 className="text-leaf font-display text-4xl md:text-5xl text-paper leading-tight">
              Three areas.{" "}
              <span className="text-paper/30">All of your footprint.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="font-body text-sm text-paper/35 max-w-xs leading-relaxed">
              Most household carbon sits in these three buckets. Track all of
              them, in one place, every day.
            </p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {cats.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 0.12}>
              <motion.div
                onMouseEnter={() => setHovered(cat.id)}
                onMouseLeave={() => setHovered(null)}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`border p-8 cursor-default transition-all duration-300 ${
                  hovered === cat.id
                    ? `${cat.borderActive} ${cat.bgActive}`
                    : "border-white/[0.07] bg-white/[0.02]"
                }`}
              >
                <div className="flex items-start justify-between mb-8">
                  <span className={`font-mono text-xl transition-colors duration-300 ${
                    hovered === cat.id ? cat.textActive : "text-paper/20"
                  }`}>{cat.symbol}</span>
                  <span className={`w-2 h-2 rounded-full transition-opacity duration-300 ${cat.dot} ${
                    hovered === cat.id ? "opacity-80" : "opacity-20"
                  }`} />
                </div>

                <h3 className={` text-ocean font-display text-4xl mb-6 transition-colors duration-300 ${
                  hovered === cat.id ? cat.textActive : "text-paper"
                }`}>
                  {cat.name}
                </h3>

                <ul className="space-y-2.5 mb-8">
                  {cat.examples.map((ex) => (
                    <li key={ex} className="font-body text-xs text-paper/35 flex items-center gap-3">
                      <span className={`w-1 h-1 rounded-full flex-shrink-0 ${cat.dot} opacity-50`} />
                      {ex}
                    </li>
                  ))}
                </ul>

                <p className={`font-mono text-[11px] transition-colors duration-300 ${
                  hovered === cat.id ? cat.textActive : "text-paper/20"
                }`}>
                  {cat.stat}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { value: "50+", label: "Tracked activities", color: "text-ocean" },
    { value: "3", label: "Emission categories", color: "text-leaf" },
    { value: "Weekly", label: "Goals & summaries", color: "text-sun" },
    { value: "Free", label: "No card needed", color: "text-sky" },
  ];

  return (
    <section className="border-y border-white/6 bg-white/1.5">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
          {stats.map((stat, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="px-8 py-14 text-center">
                <p className={`font-display text-4xl md:text-5xl mb-3 ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="font-body text-[10px] text-paper/25 uppercase tracking-[0.2em]">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}


function Footer() {
  return (
    <footer className="border-t border-white/6 px-6 md:px-12 lg:px-16 py-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <span className="font-display text-sm text-paper/30 tracking-tight">FOOT<span className="text-amber-300">PRINT</span></span>
        <p className="font-body text-xs text-paper/15 text-center">
          Built to reduce emissions, not just measure them.
        </p>
        <div className="flex items-center gap-6">
          {["Privacy", "GitHub", "Contact"].map((item) => (
            <span key={item} className="font-body text-[10px] text-paper/20 hover:text-paper/50 transition-colors cursor-pointer uppercase tracking-[0.2em]">
              {item}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <main className="bg-ink min-h-screen">
      <Hero />
      <Ticker />
      <HowItWorks />
      <Categories />
      <StatsBar />
      <Footer />
    </main>
  );
}
