import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { routes } from "./route"; 

import Navbar from "../components/layout/Navbar";
import ProtectedRoute from "../components/layout/ProtectedRoute";

function GuestOnly({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return children;
}

export default function AppRouter() {
  return (
    <>
      <Navbar />

      <Routes>
        {routes.map((route) => {
          const Element = route.element;

          if (route.protected) {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <ProtectedRoute>
                    <Element />
                  </ProtectedRoute>
                }
              />
            );
          }

          if (route.guestOnly) {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <GuestOnly>
                    <Element />
                  </GuestOnly>
                }
              />
            );
          }

          return (
            <Route
              key={route.path}
              path={route.path}
              element={<Element />}
            />
          );
        })}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}