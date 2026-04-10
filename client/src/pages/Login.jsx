import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth, API } from "../context/AuthContext";

function Field({ label, type = "text", value, onChange, error, placeholder }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-body text-[10px] uppercase tracking-[0.25em] text-paper/35">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`bg-white/[0.03] border px-4 py-3.5 font-body text-sm text-paper placeholder:text-paper/20 outline-none focus:border-ocean transition-colors duration-200 ${
          error ? "border-red-400/50" : "border-white/[0.08]"
        }`}
      />
      {error && (
        <p className="font-body text-[11px] text-red-400/80">{error}</p>
      )}
    </div>
  );
}

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  function set(field) {
    return (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  function validate() {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required.";
    if (!form.password) errs.password = "Password is required.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      saveSession(data);
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink flex">

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-white-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 70% 40%, rgba(249,196,22,0.06) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(156,216,233,0.05) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <span className="font-display text-sm tracking-tight text-paper/40">
            
          </span>

          <div>
            <p className="font-body text-[11px] uppercase tracking-[0.28em] text-sun/60 mb-8">
              Good to see you back
            </p>
            <h2 className="text-amber-300 font-display text-5xl text-paper leading-[0.9] mb-6">
              Your footprint
              <br />
              <span className="text-sun">awaits.</span>
            </h2>
            <p className="font-body text-sm text-paper/30 max-w-xs leading-relaxed">
              Pick up where you left off. Your logs, insights and weekly goals are all here.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-leaf opacity-60" />
            
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-sm"
        >
          <div className="mb-10">
            <h1 className="font-display text-3xl text-paper mb-2">Welcome back</h1>
            <p className="font-body text-sm text-paper/35">
              No account yet?{" "}
              <Link to="/register" className="text-lime-500 hover:text-sky transition-colors">
                Sign up free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={set("email")}
              error={errors.email}
              placeholder="you@example.com"
            />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              placeholder="Your password"
            />

            {serverError && (
              <p className="font-body text-xs text-red-400/80 bg-red-400/[0.06] border border-red-400/20 px-4 py-3">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer outline-lime-500 outline-1 mt-2 bg-ocean text-ink font-body text-xs uppercase tracking-[0.22em] py-4 hover:bg-sky transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
