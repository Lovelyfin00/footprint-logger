import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { publicNavLinks, privateNavLinks } from "../../routes/route";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  function handleLogout() {
    logout();
    navigate("/");
  }

  const links = user ? privateNavLinks : publicNavLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/6 bg-ink/80 backdrop-blur-md">
      <div className="px-6 md:px-16 flex items-center justify-between h-14">
        <Link
          to="/"
          className="font-display text-sm tracking-tight text-paper/80 hover:text-paper transition-colors"
        >
          FOOT<span className="text-amber-300">PRINT</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`font-body text-xs uppercase tracking-[0.18em] transition-colors ${
                isActive(l.path)
                  ? "text-ocean"
                  : "text-paper/40 hover:text-paper/70"
              }`}
            >
              {l.label}
            </Link>
          ))}

          {user ? (
            <>
              <span className="font-body text-xs text-paper/25 px-2">
                {user.name.split(" ")[0]}
              </span>

              <button
                onClick={handleLogout}
                className="font-body text-xs uppercase tracking-[0.18em] text-paper/30 hover:text-paper/60 transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`font-body text-xs uppercase tracking-[0.18em] transition-colors ${
                  isActive("/login")
                    ? "text-ocean"
                    : "text-paper/40 hover:text-paper/70"
                }`}
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="font-body text-xs uppercase tracking-[0.18em] px-5 py-2.5 bg-ocean text-ink hover:bg-sky transition-colors duration-300"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((p) => !p)}
          className="md:hidden flex flex-col gap-1.5 p-1"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              open ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              open ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/[0.06] bg-ink px-6 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              onClick={() => setOpen(false)}
              className="font-body text-xs uppercase tracking-[0.2em] text-paper/50"
            >
              {l.label}
            </Link>
          ))}

          {user ? (
            <button
              onClick={handleLogout}
              className="font-body text-xs uppercase tracking-[0.2em] text-paper/30 text-left"
            >
              Log out
            </button>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="font-body text-xs uppercase tracking-[0.2em] text-paper/50"
              >
                Log in
              </Link>

              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="font-body text-xs uppercase tracking-[0.2em] text-ocean"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}