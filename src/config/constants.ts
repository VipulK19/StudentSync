/* ============================
   StudentSync Config & Data
   ============================ */

export interface CampusConfig {
  lat: number;
  lng: number;
  radius: number;
  name: string;
}

export interface DemoUser {
  email: string;
  password: string;
  name: string;
  id?: string;
  department?: string;
  year?: string;
  childId?: string;
  childName?: string;
}

export interface LectureEntry {
  time: string;
  end: string;
  subject: string;
  faculty: string;
  room: string;
  day: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  dept: string;
  year: string;
  attendance: number;
  status: 'present' | 'absent';
  email: string;
}

export const CONFIG = {
  campus: {
    lat: 16.6960,
    lng: 74.2476,
    radius: 500,
    name: "KIT College of Engineering, Kolhapur"
  } as CampusConfig,
  roles: ['student', 'parent', 'admin'] as const,
  demoUsers: {
    student: { email: 'student@demo.com', password: 'demo123', name: 'Rahul Sharma', id: 'STU2024001', department: 'CSBS', year: '3rd Year' },
    parent: { email: 'parent@demo.com', password: 'demo123', name: 'Suresh Sharma', childId: 'STU2024001', childName: 'Rahul Sharma' },
    admin: { email: 'admin@demo.com', password: 'demo123', name: 'Dr. Patil', department: 'CSBS' }
  } as Record<string, DemoUser>
};

export const TIMETABLE: LectureEntry[] = [
  { time: '09:00', end: '10:00', subject: 'Data Structures & Algorithms', faculty: 'Prof. Kulkarni', room: 'Room 301', day: 'Mon' },
  { time: '10:00', end: '11:00', subject: 'Database Management Systems', faculty: 'Prof. Joshi', room: 'Room 302', day: 'Mon' },
  { time: '11:15', end: '12:15', subject: 'Operating Systems', faculty: 'Prof. Deshmukh', room: 'Lab 201', day: 'Mon' },
  { time: '13:00', end: '14:00', subject: 'Computer Networks', faculty: 'Prof. More', room: 'Room 305', day: 'Mon' },
  { time: '14:00', end: '15:00', subject: 'Software Engineering', faculty: 'Prof. Jadhav', room: 'Room 303', day: 'Mon' },
  { time: '09:00', end: '10:00', subject: 'Web Technologies', faculty: 'Prof. Pawar', room: 'Lab 101', day: 'Tue' },
  { time: '10:00', end: '11:00', subject: 'Data Structures & Algorithms', faculty: 'Prof. Kulkarni', room: 'Room 301', day: 'Tue' },
  { time: '11:15', end: '12:15', subject: 'Artificial Intelligence', faculty: 'Prof. Shinde', room: 'Room 304', day: 'Tue' },
  { time: '13:00', end: '14:00', subject: 'Database Management Systems', faculty: 'Prof. Joshi', room: 'Lab 202', day: 'Tue' },
  { time: '14:00', end: '15:00', subject: 'Operating Systems', faculty: 'Prof. Deshmukh', room: 'Room 302', day: 'Tue' },
  { time: '09:00', end: '10:00', subject: 'Computer Networks', faculty: 'Prof. More', room: 'Room 305', day: 'Wed' },
  { time: '10:00', end: '11:00', subject: 'Software Engineering', faculty: 'Prof. Jadhav', room: 'Room 303', day: 'Wed' },
  { time: '11:15', end: '12:15', subject: 'Web Technologies', faculty: 'Prof. Pawar', room: 'Lab 101', day: 'Wed' },
  { time: '13:00', end: '14:00', subject: 'Artificial Intelligence', faculty: 'Prof. Shinde', room: 'Room 304', day: 'Wed' },
  { time: '14:00', end: '15:00', subject: 'Data Structures & Algorithms', faculty: 'Prof. Kulkarni', room: 'Room 301', day: 'Wed' },
  { time: '09:00', end: '10:00', subject: 'Database Management Systems', faculty: 'Prof. Joshi', room: 'Room 302', day: 'Thu' },
  { time: '10:00', end: '11:00', subject: 'Operating Systems', faculty: 'Prof. Deshmukh', room: 'Lab 201', day: 'Thu' },
  { time: '11:15', end: '12:15', subject: 'Computer Networks', faculty: 'Prof. More', room: 'Room 305', day: 'Thu' },
  { time: '13:00', end: '14:00', subject: 'Web Technologies', faculty: 'Prof. Pawar', room: 'Lab 101', day: 'Thu' },
  { time: '14:00', end: '15:00', subject: 'Software Engineering', faculty: 'Prof. Jadhav', room: 'Room 303', day: 'Thu' },
  { time: '09:00', end: '10:00', subject: 'Artificial Intelligence', faculty: 'Prof. Shinde', room: 'Room 304', day: 'Fri' },
  { time: '10:00', end: '11:00', subject: 'Web Technologies', faculty: 'Prof. Pawar', room: 'Lab 101', day: 'Fri' },
  { time: '11:15', end: '12:15', subject: 'Data Structures & Algorithms', faculty: 'Prof. Kulkarni', room: 'Room 301', day: 'Fri' },
  { time: '13:00', end: '14:00', subject: 'Database Management Systems', faculty: 'Prof. Joshi', room: 'Room 302', day: 'Fri' },
];

export const STUDENTS_DATA: StudentRecord[] = [
  { id: 'STU2024001', name: 'Rahul Sharma', dept: 'CSBS', year: '3rd', attendance: 85, status: 'present', email: 'rahul@student.kit.edu' },
  { id: 'STU2024002', name: 'Priya Patil', dept: 'CSBS', year: '3rd', attendance: 92, status: 'present', email: 'priya@student.kit.edu' },
  { id: 'STU2024003', name: 'Amit Desai', dept: 'CSBS', year: '3rd', attendance: 68, status: 'absent', email: 'amit@student.kit.edu' },
  { id: 'STU2024004', name: 'Sneha Kulkarni', dept: 'CSBS', year: '3rd', attendance: 78, status: 'present', email: 'sneha@student.kit.edu' },
  { id: 'STU2024005', name: 'Vikram Joshi', dept: 'IT', year: '2nd', attendance: 95, status: 'present', email: 'vikram@student.kit.edu' },
  { id: 'STU2024006', name: 'Ananya More', dept: 'IT', year: '2nd', attendance: 55, status: 'absent', email: 'ananya@student.kit.edu' },
  { id: 'STU2024007', name: 'Rohan Shinde', dept: 'CSBS', year: '3rd', attendance: 89, status: 'present', email: 'rohan@student.kit.edu' },
  { id: 'STU2024008', name: 'Kavita Pawar', dept: 'Mechanical', year: '4th', attendance: 72, status: 'absent', email: 'kavita@student.kit.edu' },
  { id: 'STU2024009', name: 'Nikhil Jadhav', dept: 'Civil', year: '2nd', attendance: 81, status: 'present', email: 'nikhil@student.kit.edu' },
  { id: 'STU2024010', name: 'Pooja Gaikwad', dept: 'CSBS', year: '3rd', attendance: 90, status: 'present', email: 'pooja@student.kit.edu' },
];
