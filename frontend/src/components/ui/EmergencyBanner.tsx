'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, ShieldAlert, BellRing } from 'lucide-react';
import { getApiBaseUrl } from '@/lib/utils';
import { authFetch } from '@/lib/apiClient';

interface IBroadcast {
  _id: string;
  title: string;
  message: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  targetAudience: string;
  createdAt: string;
}

export function EmergencyBanner() {
  const [broadcasts, setBroadcasts] = useState<IBroadcast[]>([]);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  const fetchActiveBroadcasts = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = getApiBaseUrl();
      const res = await authFetch(`${apiBase}/api/broadcasts/active`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBroadcasts(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch emergency broadcasts', err);
    }
  };

  useEffect(() => {
    fetchActiveBroadcasts();
  }, []);

  const activeBroadcasts = broadcasts.filter((b) => !dismissed[b._id]);

  if (activeBroadcasts.length === 0) return null;

  return (
    <div className="w-full space-y-2 mb-4">
      {activeBroadcasts.map((broadcast) => {
        const isCritical = broadcast.severity === 'Critical' || broadcast.severity === 'High';
        return (
          <div
            key={broadcast._id}
            className={`flex items-center justify-between p-4 rounded-xl shadow-lg border animate-pulse ${
              isCritical
                ? 'bg-rose-600 text-white border-rose-700 dark:bg-rose-900 dark:border-rose-800'
                : 'bg-amber-500 text-slate-950 border-amber-600 dark:bg-amber-600 dark:text-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm shrink-0">
                {isCritical ? <ShieldAlert className="w-6 h-6" /> : <BellRing className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider text-xs px-2 py-0.5 rounded-full bg-white/20">
                    {broadcast.severity} Alert
                  </span>
                  <h4 className="font-bold text-base">{broadcast.title}</h4>
                </div>
                <p className="text-sm mt-1 opacity-90">{broadcast.message}</p>
              </div>
            </div>
            <button
              onClick={() => setDismissed((prev) => ({ ...prev, [broadcast._id]: true }))}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors shrink-0"
              title="Dismiss banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default EmergencyBanner;
