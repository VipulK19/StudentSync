import { TIMETABLE } from '../config/constants';
import type { LectureEntry } from '../config/constants';
import { Geofence } from './geofence';

import { LectureAttendanceManager } from './lectureAttendance';

export type LectureStatus = 'present' | 'absent' | 'upcoming' | 'ongoing' | 'completed';

export function getDayName(): string {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
}

export function getFullDayName(): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
}

export function getTodaySchedule(): LectureEntry[] {
  const day = getDayName();
  let schedule = TIMETABLE.filter(l => l.day === day);
  if (schedule.length === 0) schedule = TIMETABLE.filter(l => l.day === 'Mon');
  return schedule;
}

export function getLectureStatus(lecture: LectureEntry, studentId?: string, dateStr?: string): LectureStatus {
  const now = new Date();
  const [startH, startM] = lecture.time.split(':').map(Number);
  const [endH, endM] = lecture.end.split(':').map(Number);
  const startTime = new Date(); startTime.setHours(startH, startM, 0);
  const endTime = new Date(); endTime.setHours(endH, endM, 0);

  if (studentId) {
    const dStr = dateStr || new Date().toDateString();
    const lectureId = LectureAttendanceManager.generateLectureId(dStr, lecture.time, lecture.subject);
    const manualStatus = LectureAttendanceManager.getStudentStatus(lectureId, studentId);
    if (manualStatus) return manualStatus; // 'present' or 'absent'
  }

  if (now < startTime) return 'upcoming';
  if (now >= startTime && now <= endTime) return 'ongoing';
  
  if (!studentId && now > endTime) return 'completed';

  const geoStatus = Geofence.getStatus();
  return geoStatus.inside ? 'present' : 'absent';
}
