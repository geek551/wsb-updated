// ─────────────────────────────────────────────────────────────────
// src/context/AppContext.tsx  –  Global state + localStorage sync
// ─────────────────────────────────────────────────────────────────
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import type { Report, Robot, ToastMessage, ReportStatus, RobotId } from '../types';
import { calculatePriorityScore } from '../types';
import { SEED_REPORTS, SEED_ROBOTS } from '../data/mockData';

// ── Context shape ────────────────────────────────────────────────
interface AppContextType {
  reports: Report[];
  robots: Robot[];
  isOpsMode: boolean;
  toasts: ToastMessage[];
  // Report CRUD
  addReport: (
    data: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'priorityScore' | 'activityLog' | 'internalNotes' | 'publicNotes'>
  ) => string;
  updateReport: (id: string, updates: Partial<Report>) => void;
  deleteReport: (id: string) => void;
  addPublicNote: (reportId: string, note: string) => void;
  addInternalNote: (reportId: string, note: string) => void;
  // Ops actions
  changeStatus: (reportId: string, status: ReportStatus) => void;
  assignRobot: (reportId: string, robotId: RobotId | undefined) => void;
  updateRobot: (robotId: RobotId, updates: Partial<Robot>) => void;
  // UI
  setOpsMode: (val: boolean) => void;
  showToast: (type: ToastMessage['type'], message: string) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

// ── localStorage helpers ─────────────────────────────────────────
const REPORTS_KEY = 'wsr_reports';
const ROBOTS_KEY  = 'wsr_robots';
const OPS_KEY     = 'wsr_ops_mode';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded – silently ignore
  }
}

// ── Provider ─────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [reports,    setReports]    = useState<Report[]>(() => load(REPORTS_KEY, SEED_REPORTS));
  const [robots,     setRobots]     = useState<Robot[]>(() => load(ROBOTS_KEY, SEED_ROBOTS));
  const [isOpsMode,  setIsOpsMode]  = useState<boolean>(() => load(OPS_KEY, false));
  const [toasts,     setToasts]     = useState<ToastMessage[]>([]);

  // Persist to localStorage on every change
  useEffect(() => { save(REPORTS_KEY, reports); }, [reports]);
  useEffect(() => { save(ROBOTS_KEY,  robots);  }, [robots]);
  useEffect(() => { save(OPS_KEY,     isOpsMode); }, [isOpsMode]);

  // ── Toast helpers ──────────────────────────────────────────────
  const showToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Report CRUD ────────────────────────────────────────────────
  const addReport = useCallback((
    data: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'priorityScore' | 'activityLog' | 'internalNotes' | 'publicNotes'>
  ): string => {
    const id  = `rpt_${Date.now()}`;
    const now = new Date().toISOString();
    const actorLabel =
      data.reporterType === 'anonymous' ? 'Anonymous'
      : data.reporterType === 'student' ? 'Student'
      : 'Staff Member';

    const newReport: Report = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      priorityScore: calculatePriorityScore(data),
      internalNotes: [],
      publicNotes:   [],
      activityLog:   [{ id: `a_${Date.now()}`, timestamp: now, action: 'Report Created', actor: actorLabel }],
    };
    setReports(prev => [newReport, ...prev]);
    return id;
  }, []);

  const updateReport = useCallback((id: string, updates: Partial<Report>) => {
    setReports(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, ...updates, updatedAt: new Date().toISOString() };
      updated.priorityScore = calculatePriorityScore(updated);
      return updated;
    }));
  }, []);

  const deleteReport = useCallback((id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  }, []);

  const addPublicNote = useCallback((reportId: string, note: string) => {
    const now = new Date().toISOString();
    setReports(prev => prev.map(r => {
      if (r.id !== reportId) return r;
      return {
        ...r,
        publicNotes: [...r.publicNotes, note],
        updatedAt:   now,
        activityLog: [...r.activityLog, {
          id: `a_${Date.now()}`, timestamp: now, action: 'Public Note Added', note, actor: 'User',
        }],
      };
    }));
  }, []);

  const addInternalNote = useCallback((reportId: string, note: string) => {
    const now = new Date().toISOString();
    setReports(prev => prev.map(r => {
      if (r.id !== reportId) return r;
      return {
        ...r,
        internalNotes: [...r.internalNotes, note],
        updatedAt:     now,
        activityLog:   [...r.activityLog, {
          id: `a_${Date.now()}`, timestamp: now, action: 'Internal Note Added', note, actor: 'Ops Team',
        }],
      };
    }));
  }, []);

  // ── Ops actions ────────────────────────────────────────────────
  const changeStatus = useCallback((reportId: string, status: ReportStatus) => {
    const now = new Date().toISOString();
    const label: Record<ReportStatus, string> = {
      new: 'New', triaged: 'Triaged', in_progress: 'In Progress', resolved: 'Resolved',
    };
    setReports(prev => prev.map(r => {
      if (r.id !== reportId) return r;
      return {
        ...r,
        status,
        updatedAt:   now,
        activityLog: [...r.activityLog, {
          id: `a_${Date.now()}`, timestamp: now,
          action: `Status → ${label[status]}`, actor: 'Ops Team',
        }],
      };
    }));
  }, []);

  const assignRobot = useCallback((reportId: string, robotId: RobotId | undefined) => {
    const now = new Date().toISOString();
    const robotName = robotId === 'robot_a' ? 'SnowBot Alpha'
      : robotId === 'robot_b' ? 'SnowBot Beta' : 'None';
    setReports(prev => prev.map(r => {
      if (r.id !== reportId) return r;
      return {
        ...r,
        assignedRobot: robotId,
        updatedAt:     now,
        activityLog:   [...r.activityLog, {
          id: `a_${Date.now()}`, timestamp: now,
          action: `Robot Assigned: ${robotName}`, actor: 'Ops Team',
        }],
      };
    }));
  }, []);

  const updateRobot = useCallback((robotId: RobotId, updates: Partial<Robot>) => {
    setRobots(prev => prev.map(r =>
      r.id === robotId ? { ...r, ...updates, lastUpdated: new Date().toISOString() } : r
    ));
  }, []);

  const setOpsMode = useCallback((val: boolean) => setIsOpsMode(val), []);

  // ── Context value ──────────────────────────────────────────────
  return (
    <AppContext.Provider value={{
      reports, robots, isOpsMode, toasts,
      addReport, updateReport, deleteReport,
      addPublicNote, addInternalNote,
      changeStatus, assignRobot, updateRobot,
      setOpsMode, showToast, dismissToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}
