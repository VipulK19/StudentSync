export interface CheckInRecord {
  id: string;
  studentId: string;
  studentName: string;
  type: 'checkin' | 'checkout';
  timestamp: string;
  note?: string;
}

const STORAGE_KEY = 'ss_checkin_records';

// Custom event emitter for same-tab updates
const checkinEvents = new EventTarget();

function getRecords(): CheckInRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveRecords(records: CheckInRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  // Dispatch custom event for same-tab updates
  checkinEvents.dispatchEvent(new Event('checkin_updated'));
}

export const CheckInManager = {
  /** Add a check-in or check-out record */
  async addRecord(studentId: string, studentName: string, type: 'checkin' | 'checkout', note?: string): Promise<void> {
    const records = getRecords();
    const record: CheckInRecord = {
      id: `CHK-${Date.now()}`,
      studentId,
      studentName,
      type,
      timestamp: new Date().toISOString(),
      note: note || '',
    };
    records.unshift(record);
    // Keep max 200 records
    if (records.length > 200) records.length = 200;
    saveRecords(records);
  },

  /** Subscribe to real-time updates for a specific student's records */
  subscribeToStudentRecords(studentId: string, callback: (records: CheckInRecord[]) => void): () => void {
    const fetchAndCallback = () => {
      const records = getRecords().filter(r => r.studentId === studentId);
      callback(records);
    };

    // Initial fetch
    fetchAndCallback();

    // Listen for same-tab updates
    checkinEvents.addEventListener('checkin_updated', fetchAndCallback);
    // Listen for cross-tab updates
    const storageListener = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) fetchAndCallback();
    };
    window.addEventListener('storage', storageListener);

    return () => {
      checkinEvents.removeEventListener('checkin_updated', fetchAndCallback);
      window.removeEventListener('storage', storageListener);
    };
  },

  /** Subscribe to real-time updates for today's records (for admin) */
  subscribeToTodayRecords(callback: (records: CheckInRecord[]) => void): () => void {
    const fetchAndCallback = () => {
      const today = new Date().toDateString();
      const records = getRecords().filter(r => new Date(r.timestamp).toDateString() === today);
      callback(records);
    };

    // Initial fetch
    fetchAndCallback();

    // Listen for same-tab updates
    checkinEvents.addEventListener('checkin_updated', fetchAndCallback);
    // Listen for cross-tab updates
    const storageListener = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) fetchAndCallback();
    };
    window.addEventListener('storage', storageListener);

    return () => {
      checkinEvents.removeEventListener('checkin_updated', fetchAndCallback);
      window.removeEventListener('storage', storageListener);
    };
  },

  /** Calculate current status based on a list of records (newest first) */
  calculateStudentStatus(records: CheckInRecord[]): { checkedIn: boolean; lastRecord: CheckInRecord | null } {
    if (records.length === 0) return { checkedIn: false, lastRecord: null };
    const latest = records[0];
    return { checkedIn: latest.type === 'checkin', lastRecord: latest };
  },

  /** Calculate summary stats for today based on a list of today's records */
  calculateTodayStats(todayRecords: CheckInRecord[]): { totalCheckIns: number; totalCheckOuts: number; currentlyIn: number } {
    const totalCheckIns = todayRecords.filter(r => r.type === 'checkin').length;
    const totalCheckOuts = todayRecords.filter(r => r.type === 'checkout').length;

    const studentStatuses = new Map<string, string>();
    const chronological = [...todayRecords].reverse();
    for (const record of chronological) {
      studentStatuses.set(record.studentId, record.type);
    }
    
    let currentlyIn = 0;
    studentStatuses.forEach(status => { if (status === 'checkin') currentlyIn++; });

    return { totalCheckIns, totalCheckOuts, currentlyIn };
  },

  /** Format timestamp for display */
  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  },

  /** Format date for display */
  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  },

  /** Relative time (e.g., "2 min ago") */
  relativeTime(timestamp: string): string {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
};
