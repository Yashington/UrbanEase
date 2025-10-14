import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function PrivateRoute() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          if (!cancelled) {
            setAllowed(false);
            setLoading(false);
          }
          return;
        }
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!cancelled) {
          setAllowed(res.ok);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setAllowed(false);
          setLoading(false);
        }
      }
    }

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking access...
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />;
}