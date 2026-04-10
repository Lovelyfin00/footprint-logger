import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import LogActivity from "../pages/LogActivity";
import Insights from "../pages/Insights";

export const routes = [
  {
    path: "/",
    label: "Home",
    element: Landing,
    protected: false,
    showInNav: true,
  },
  {
    path: "/login",
    label: "Sign In",
    element: Login,
    protected: false,
    showInNav: false,
    guestOnly: true,
  },
  {
    path: "/register",
    label: "Join Free",
    element: Register,
    protected: false,
    showInNav: false,
    guestOnly: true,
  },

  {
    path: "/dashboard",
    label: "Dashboard",
    element: Dashboard,
    protected: true,
    showInNav: true,
  },
  {
    path: "/log",
    label: "Log Activity",
    element: LogActivity,
    protected: true,
    showInNav: true,
  },
  {
    path: "/insights",
    label: "Insights",
    element: Insights,
    protected: true,
    showInNav: true,
  },
];

export const publicNavLinks = routes.filter(
  (r) => r.showInNav && !r.protected
);

export const privateNavLinks = routes.filter(
  (r) => r.showInNav && r.protected
);