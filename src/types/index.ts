// ─────────────────────────────────────────────────────────────────
// src/types/index.ts  –  All shared TypeScript types for the app
// ─────────────────────────────────────────────────────────────────

export type IssueType =
  | 'windrow_curb'
  | 'windrow_crossing'
  | 'icy_patch'
  | 'slush_buildup'
  | 'staircase_blocked'
  | 'entrance_blocked';

export type ReportStatus = 'new' | 'triaged' | 'in_progress' | 'resolved';

export type ReporterType = 'student' | 'staff' | 'anonymous';

export type RobotId = 'robot_a' | 'robot_b';

/** One entry in a report's activity timeline */
export interface ActivityEntry {
  id: string;
  timestamp: string; // ISO
  action: string;
  note?: string;
  actor: string;
}

/** The main Report document */
export interface Report {
  id: string;
  locationId: string;
  locationName: string;
  issueType: IssueType;
  severity: number;           // 1-5
  accessibilityImpact: boolean;
  description: string;
  photoName?: string;
  reporterType: ReporterType;
  contact?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  priorityScore: number;
  assignedRobot?: RobotId;
  internalNotes: string[];
  publicNotes: string[];
  activityLog: ActivityEntry[];
}

/** A named campus location with real GPS coordinates */
export interface CampusLocation {
  id: string;
  name: string;
  shortName: string;
  lat: number;  // WGS-84 latitude
  lng: number;  // WGS-84 longitude
  zone: 'north' | 'central' | 'east' | 'west' | 'south';
  type: 'building' | 'crossing' | 'road' | 'entrance';
}

/** Robot telemetry (mocked) */
export interface Robot {
  id: RobotId;
  name: string;
  status: 'available' | 'busy' | 'charging' | 'offline';
  battery: number; // 0–100
  currentTask?: string;
  eta?: string;
  location?: string;
  lastUpdated: string;
}

/** A single toast notification */
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

// ── Label maps ──────────────────────────────────────────────────

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  windrow_curb:       'Windrow Blocking Curb Cut',
  windrow_crossing:   'Windrow Blocking Crossing',
  icy_patch:          'Icy Patch',
  slush_buildup:      'Slush Buildup',
  staircase_blocked:  'Staircase Blocked',
  entrance_blocked:   'Entrance Blocked',
};

export const ISSUE_TYPE_ICONS: Record<IssueType, string> = {
  windrow_curb:       '🚧',
  windrow_crossing:   '🚶',
  icy_patch:          '🧊',
  slush_buildup:      '💧',
  staircase_blocked:  '🪜',
  entrance_blocked:   '🚪',
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  new:         'New',
  triaged:     'Triaged',
  in_progress: 'In Progress',
  resolved:    'Resolved',
};

export const ROBOT_LABELS: Record<RobotId, string> = {
  robot_a: 'SnowBot Alpha',
  robot_b: 'SnowBot Beta',
};

// ── Priority score formula ───────────────────────────────────────
// severity (1-5) × 10 + accessibility bonus (20) + age bonus (max 15)
export function calculatePriorityScore(
  report: Partial<Report>,
  duplicateCount = 0
): number {
  const severity      = report.severity ?? 1;
  const accessibility = report.accessibilityImpact ? 20 : 0;
  const dupes         = duplicateCount * 5;
  const ageHours      = report.createdAt
    ? (Date.now() - new Date(report.createdAt).getTime()) / 3_600_000
    : 0;
  const ageBonus = Math.min(ageHours * 0.5, 15);
  return Math.round(severity * 10 + accessibility + dupes + ageBonus);
}

// ── Severity colour helpers ──────────────────────────────────────
export function severityColor(s: number): string {
  if (s >= 5) return '#dc2626'; // red-600
  if (s >= 4) return '#ea580c'; // orange-600
  if (s >= 3) return '#ca8a04'; // yellow-600
  if (s >= 2) return '#16a34a'; // green-600
  return '#6b7280';             // gray-500
}

export function severityLabel(s: number): string {
  if (s >= 5) return 'Critical';
  if (s >= 4) return 'High';
  if (s >= 3) return 'Moderate';
  if (s >= 2) return 'Low';
  return 'Minimal';
}
