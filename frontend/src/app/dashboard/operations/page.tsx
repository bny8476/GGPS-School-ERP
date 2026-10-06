"use client";

import { useState, useEffect } from 'react';
import { Stethoscope, ShieldCheck, Plus, X, Search, Thermometer, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OperationsPage() {
  const [healthLogs, setHealthLogs] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [healthForm, setHealthForm] = useState({
    studentId: '',
    temperature: '',
    symptoms: [] as string[],
    allergiesAlert: false,
    notes: '',
  });

  const availableSymptoms = ['Cough', 'Runny Nose', 'Rash', 'Vomiting', 'Headache', 'Lethargy', 'Mild Fever'];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [healthRes, studentRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/operations/health`, { headers }).catch(() => null),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/students`, { headers }).catch(() => null),
      ]);

      if (healthRes && healthRes.ok) setHealthLogs(await healthRes.json());
      if (studentRes && studentRes.ok) setStudents(await studentRes.json());
    } catch (error) {
      console.error('Error fetching operations data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleSymptom = (symptom: string) => {
    setHealthForm((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const handleCreateHealth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/operations/health`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          studentId: healthForm.studentId,
          temperature: Number(healthForm.temperature),
          symptoms: healthForm.symptoms,
          allergiesAlert: healthForm.allergiesAlert,
          notes: healthForm.notes,
        }),
      });

      if (res.ok) {
        toast.success('Health & safety check logged!');
        setShowHealthModal(false);
        setHealthForm({ studentId: '', temperature: '', symptoms: [], allergiesAlert: false, notes: '' });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(`Error: ${err.message || 'Failed to save check'}`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error creating health log');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredLogs = healthLogs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const name = `${log.studentId?.firstName || ''} ${log.studentId?.lastName || ''}`.toLowerCase();
    const symptoms = (log.symptoms || []).join(' ').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || symptoms.includes(q);
  });

  const feverCount = healthLogs.filter((l) => (l.temperature || 0) >= 99).length;
  const allergyAlertCount = healthLogs.filter((l) => Boolean(l.allergiesAlert)).length;
  const normalCount = healthLogs.filter((l) => (l.temperature || 0) < 99 && !l.allergiesAlert).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Campus Health & Safety Operations</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Monitor daily infirmary records, triage temperatures, and review health safety logs.
          </p>
        </div>
        <button
          onClick={() => setShowHealthModal(true)}
          className="bg-[#0050CB] hover:bg-[#003da0] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" /> Log Health Check
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Normal Temperature</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{normalCount}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Recorded within normal vitals</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Elevated Temperature</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Thermometer className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600">{feverCount}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Temperature ≥ 99.0°F flagged</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Allergy Alerts</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-600">{allergyAlertCount}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Requires guardian attention</p>
        </div>
      </div>

      {/* Main Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#E5EEFF] text-[#0050CB] dark:bg-blue-950/40 dark:text-blue-400">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daily Health & Safety Check Registry</h2>
              <p className="text-xs text-slate-500">Real-time log of campus infirmary observations</p>
            </div>
          </div>

          <div className="relative min-w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student or symptom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {isLoading ? (
            <div className="flex justify-center py-12 col-span-2">
              <div className="animate-spin h-8 w-8 text-[#0050CB] border-4 border-blue-200 border-t-[#0050CB] rounded-full"></div>
            </div>
          ) : filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const isAlert = (log.temperature || 0) >= 99 || log.allergiesAlert;
              return (
                <div
                  key={log._id}
                  className={`p-5 border-2 ${
                    isAlert
                      ? 'border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-900/40'
                      : 'border-slate-100 bg-white hover:border-slate-200 dark:bg-slate-800/60 dark:border-slate-800'
                  } rounded-2xl transition-colors`}
                >
                  <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                        {log.studentId ? `${log.studentId.firstName} ${log.studentId.lastName}` : 'Student Record'}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 flex items-center mt-0.5">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        Logged at {new Date(log.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md border ${
                        (log.temperature || 0) >= 99
                          ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}
                    >
                      {(log.temperature || 0) >= 99 ? 'Feverish' : 'Normal'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Temperature</span>
                      <span className={`font-black ${(log.temperature || 0) >= 99 ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>
                        {log.temperature || '--'}°F
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Symptoms</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {log.symptoms?.length ? log.symptoms.join(', ') : 'None Reported'}
                      </span>
                    </div>

                    {log.allergiesAlert && (
                      <div className="bg-rose-600 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 animate-pulse">
                        <AlertCircle className="h-4 w-4" /> ALLERGY ALERT NOTIFIED
                      </div>
                    )}

                    {log.notes && (
                      <p className="text-xs text-slate-500 italic mt-2 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 col-span-2">
              <ShieldCheck className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No health & safety records logged for today.</p>
            </div>
          )}
        </div>
      </div>

      {/* HEALTH MODAL */}
      {showHealthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="px-6 py-5 border-b border-rose-100 dark:border-slate-800 flex justify-between items-center bg-rose-50 dark:bg-slate-800/60">
              <h3 className="font-bold text-xl text-rose-900 dark:text-white flex items-center">
                <Stethoscope className="h-5 w-5 mr-2 text-rose-600" /> Log Health Check
              </h3>
              <button onClick={() => setShowHealthModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateHealth} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Student</label>
                  <select
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2.5 px-3 focus:border-[#0050CB] focus:ring-[#0050CB] bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white"
                    value={healthForm.studentId}
                    onChange={(e) => setHealthForm({ ...healthForm, studentId: e.target.value })}
                  >
                    <option value="">-- Choose student --</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.firstName} {s.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Temperature (°F)</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    placeholder="e.g. 98.6"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2.5 px-3 focus:border-[#0050CB] focus:ring-[#0050CB] bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white"
                    value={healthForm.temperature}
                    onChange={(e) => setHealthForm({ ...healthForm, temperature: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Observed Symptoms</label>
                <div className="flex flex-wrap gap-2">
                  {availableSymptoms.map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        healthForm.symptoms.includes(sym)
                          ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-xl border border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-rose-900 dark:text-rose-300">Severe Allergy Alert</p>
                  <p className="text-xs font-medium text-rose-700 dark:text-rose-400 mt-0.5">Toggle if student exhibited allergy symptoms</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={healthForm.allergiesAlert}
                    onChange={(e) => setHealthForm({ ...healthForm, allergiesAlert: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Additional Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Advised rest, provided hydration"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2.5 px-3 focus:border-[#0050CB] focus:ring-[#0050CB] bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white"
                  value={healthForm.notes}
                  onChange={(e) => setHealthForm({ ...healthForm, notes: e.target.value })}
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-[#0050CB] hover:bg-[#003da0] disabled:opacity-70 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex justify-center items-center"
                >
                  {isSaving ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    'Save Health Record'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
