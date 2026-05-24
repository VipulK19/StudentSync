import { STUDENTS_DATA } from '../config/constants';

export interface WeeklyData {
  day: string;
  attended: number;
  total: number;
}

export interface MonthlyData {
  month: string;
  percentage: number;
}

export interface AttendanceData {
  percentage: number;
  totalLectures: number;
  attended: number;
  absent: number;
  weekly: WeeklyData[];
  monthly: MonthlyData[];
}

export interface DepartmentStats {
  name: string;
  avgAttendance: number;
  presentToday: number;
  totalStudents: number;
}

export function getAttendanceData(): AttendanceData {
  const stored = localStorage.getItem('ss_attendance');
  if (stored) return JSON.parse(stored);

  const data: AttendanceData = {
    percentage: 85,
    totalLectures: 120,
    attended: 102,
    absent: 18,
    weekly: [
      { day: 'Mon', attended: 5, total: 5 },
      { day: 'Tue', attended: 4, total: 5 },
      { day: 'Wed', attended: 5, total: 5 },
      { day: 'Thu', attended: 3, total: 5 },
      { day: 'Fri', attended: 4, total: 4 }
    ],
    monthly: [
      { month: 'Jan', percentage: 88 },
      { month: 'Feb', percentage: 82 },
      { month: 'Mar', percentage: 85 }
    ]
  };
  localStorage.setItem('ss_attendance', JSON.stringify(data));
  return data;
}

export function getDepartmentStats(): DepartmentStats[] {
  const depts: Record<string, { total: number; sum: number; present: number }> = {};
  STUDENTS_DATA.forEach(s => {
    if (!depts[s.dept]) depts[s.dept] = { total: 0, sum: 0, present: 0 };
    depts[s.dept].total++;
    depts[s.dept].sum += s.attendance;
    if (s.status === 'present') depts[s.dept].present++;
  });
  return Object.entries(depts).map(([name, d]) => ({
    name,
    avgAttendance: Math.round(d.sum / d.total),
    presentToday: d.present,
    totalStudents: d.total
  }));
}
