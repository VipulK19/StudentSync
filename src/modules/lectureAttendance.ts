export interface LectureAttendanceRecord {
  id: string; // lectureId_studentId
  lectureId: string; // generated: date_time_subject
  studentId: string;
  studentName: string;
  lectureName: string;
  status: 'present' | 'absent';
  timestamp: string;
}

const STORAGE_KEY = 'ss_lecture_attendance';

const lectureEvents = new EventTarget();

function getRecords(): LectureAttendanceRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveRecords(records: LectureAttendanceRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  lectureEvents.dispatchEvent(new Event('lecture_attendance_updated'));
}

export const LectureAttendanceManager = {
  generateLectureId(dateStr: string, time: string, subject: string): string {
    return `${dateStr}_${time}_${subject}`.replace(/\s+/g, '_');
  },

  markStudent(lectureId: string, lectureName: string, studentId: string, studentName: string, status: 'present' | 'absent'): void {
    const records = getRecords();
    const existingIndex = records.findIndex(r => r.lectureId === lectureId && r.studentId === studentId);
    
    const record: LectureAttendanceRecord = {
      id: `${lectureId}_${studentId}`,
      lectureId,
      studentId,
      studentName,
      lectureName,
      status,
      timestamp: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    
    saveRecords(records);
  },

  getStudentStatus(lectureId: string, studentId: string): 'present' | 'absent' | null {
    const records = getRecords();
    const record = records.find(r => r.lectureId === lectureId && r.studentId === studentId);
    return record ? record.status : null;
  },

  getLectureAttendance(lectureId: string): LectureAttendanceRecord[] {
    return getRecords().filter(r => r.lectureId === lectureId);
  },

  subscribeToUpdates(callback: () => void): () => void {
    lectureEvents.addEventListener('lecture_attendance_updated', callback);
    const storageListener = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) callback();
    };
    window.addEventListener('storage', storageListener);

    return () => {
      lectureEvents.removeEventListener('lecture_attendance_updated', callback);
      window.removeEventListener('storage', storageListener);
    };
  }
};
