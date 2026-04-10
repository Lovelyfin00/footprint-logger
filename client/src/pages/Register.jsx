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

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
    if (!form.name.trim()) errs.name = "What should we call you?";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "That doesn't look like a valid email.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 6) errs.password = "At least 6 characters please.";
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
      const res = await fetch(`${API}/auth/register`, {
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

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-white/[0.05]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 60%, rgba(9,158,200,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(132,188,65,0.06) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <span className="font-display text-sm tracking-tight text-paper/40">
            
          </span>

          <div>
            <p className="font-body text-[11px] uppercase tracking-[0.28em] text-ocean/60 mb-8">
              Start tracking today
            </p>
            <h2 className="font-display text-5xl text-paper leading-[0.9] mb-10 text-lime-500">
              Every gram counts
            </h2>

            <div className="space-y-4">
              {[
                { label: "Log daily activities", color: "text-ocean" },
                { label: "See your emissions breakdown", color: "text-leaf" },
                { label: "Get personalised tips", color: "text-sun" },
                { label: "Track weekly progress", color: "text-sky" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className={`font-mono text-xs ${item.color}`}>→</span>
                  <span className="font-body text-sm text-paper/45">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="font-body text-xs text-paper/15">
            
          </p>
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
            <h1 className="font-display text-3xl text-paper mb-2">Create your account</h1>
            <p className="font-body text-sm text-paper/35">
              Already have one?{" "}
              <Link to="/login" className="text-ocean hover:text-sky transition-colors text-amber-300">
                Log in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field
              label="Name"
              value={form.name}
              onChange={set("name")}
              error={errors.name}
              placeholder="Ada Lovelace"
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={set("email")}
              error={errors.email}
              placeholder="ada@example.com"
            />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              placeholder="At least 6 characters"
            />

            {serverError && (
              <p className="font-body text-xs text-red-400/80 bg-red-400/6 border border-red-400/20 px-4 py-3">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="hover:bg-lime-500 hover:text-white cursor-pointer mt-2 bg-ocean text-ink font-body text-xs uppercase tracking-[0.22em] py-4 hover:bg-sky transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="font-body text-[10px] text-paper/15 mt-8 leading-relaxed">
            By signing up you agree that this is a student capstone project and your data is stored for demonstration purposes only.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
