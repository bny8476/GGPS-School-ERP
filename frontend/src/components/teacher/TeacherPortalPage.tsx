"use client";

import React, { useState, useEffect } from "react";
import TeacherWorkspace, { TeacherTab } from "@/components/teacher/TeacherWorkspace";
import { useAuthStore } from "@/stores/authStore";
import { authFetch } from "@/lib/apiClient";

interface TeacherPortalPageProps {
  initialTab?: TeacherTab;
}

export default function TeacherPortalPage({ initialTab = "HOME" }: TeacherPortalPageProps) {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const res = await authFetch(`${apiBase}/api/v1/dashboard/stats`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.status === 401) {
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.warn("Teacher stats load notice:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
      } catch (_) {}
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#000E28]">
      <TeacherWorkspace
        user={user}
        stats={stats}
        onRefresh={fetchStats}
        initialTab={initialTab}
      />
    </div>
  );
}
