'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, Plus, Clock, Phone, FileText, CheckCircle, LogOut } from 'lucide-react';
import { EmergencyBanner } from '@/components/ui/EmergencyBanner';
import { getApiBaseUrl } from '@/lib/utils';

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [newVisitor, setNewVisitor] = useState({
    visitorName: '',
    phone: '',
    purpose: 'Parent Meeting',
    personToMeet: '',
    idProofNumber: '',
  });

  const API_BASE = getApiBaseUrl();

  const getAuthHeaders = (extra: Record<string, string> = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  };

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/visitors`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) setVisitors(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleCreatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/visitors`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(newVisitor),
      });
      if (res.ok) {
        setShowModal(false);
        fetchVisitors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/visitors/${id}/checkout`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (res.ok) fetchVisitors();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <EmergencyBanner />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Security Checkpoint & Gate Pass Log
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            GGPS School • Campus Entry Verification & Visitor Management
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md"
        >
          <Plus className="w-5 h-5" /> Generate Gate Pass
        </button>
      </div>

      {/* Visitor Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
              <th className="p-4">Pass #</th>
              <th className="p-4">Visitor Name</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Purpose</th>
              <th className="p-4">Host / Staff</th>
              <th className="p-4">Check-In Time</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {visitors.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  No visitors checked in today.
                </td>
              </tr>
            ) : (
              visitors.map((v) => (
                <tr key={v._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400">{v.passNumber}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{v.visitorName}</td>
                  <td className="p-4 text-xs font-mono">{v.phone}</td>
                  <td className="p-4">{v.purpose}</td>
                  <td className="p-4">{v.personToMeet}</td>
                  <td className="p-4 text-xs">{new Date(v.checkInTime).toLocaleTimeString()}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        v.status === 'Checked In'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {v.status === 'Checked In' && (
                      <button
                        onClick={() => handleCheckout(v._id)}
                        className="flex items-center gap-1 ml-auto text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Check Out
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: CREATE GATE PASS */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Issue Visitor Gate Pass</h3>
            <form onSubmit={handleCreatePass} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Visitor Full Name</label>
                <input
                  type="text"
                  required
                  value={newVisitor.visitorName}
                  onChange={(e) => setNewVisitor({ ...newVisitor, visitorName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                  placeholder="Robert Langdon"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newVisitor.phone}
                    onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">ID Proof Number</label>
                  <input
                    type="text"
                    value={newVisitor.idProofNumber}
                    onChange={(e) => setNewVisitor({ ...newVisitor, idProofNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                    placeholder="DL-9840294"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Person / Host to Meet</label>
                <input
                  type="text"
                  required
                  value={newVisitor.personToMeet}
                  onChange={(e) => setNewVisitor({ ...newVisitor, personToMeet: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                  placeholder="Principal / Mr. David Miller"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  required
                  value={newVisitor.purpose}
                  onChange={(e) => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
                  Issue Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
