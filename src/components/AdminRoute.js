import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AdminRoute() {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
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
        if (!res.ok) {
          if (!cancelled) {
            setAllowed(false);
            setLoading(false);
          }
          return;
        }
        const data = await res.json();
        const role = data?.data?.user?.role;
        if (!cancelled) {
          setAllowed(role === "admin" || role === "moderator");
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setAllowed(false);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking admin access...
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />;
}