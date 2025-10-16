import React, { useEffect, useState } from "react";

export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("https://urbanease-backend.onrender.com/api/auth/profile", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load profile");
        if (!cancelled) setProfile(data?.data?.user);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!profile) return <div className="p-6">No profile data.</div>;

  return (
    <div className="min-h-screen pt-[90px]">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6 mt-6 border">
        <h1 className="text-2xl font-bold text-[#1e3a8a] mb-4">Your Profile</h1>
        <div className="space-y-3">
          <div><span className="font-semibold">Name:</span> {profile.name}</div>
          <div><span className="font-semibold">Email:</span> {profile.email}</div>
          <div><span className="font-semibold">Role:</span> {profile.role}</div>
          <div><span className="font-semibold">Active:</span> {profile.isActive ? "Yes" : "No"}</div>
          <div><span className="font-semibold">Last Login:</span> {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : "-"}</div>
          <div><span className="font-semibold">Joined:</span> {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "-"}</div>
        </div>
      </div>
    </div>
  );
}