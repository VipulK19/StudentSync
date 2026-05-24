/* ============================
   StudentSync Application Logic
   ============================ */

// ========================
// CONFIG & DATA
// ========================
const CONFIG = {
  campus: {
    lat: 18.5204,
    lng: 73.8567,
    radius: 500, // meters
    name: "KIT College of Engineering, Kolhapur"
  },
  roles: ['student', 'parent', 'admin'],
  demoUsers: {
    student: { email: 'student@demo.com', password: 'demo123', name: 'Rahul Sharma', id: 'STU2024001', department: 'CSBS', year: '3rd Year' },
    parent: { email: 'parent@demo.com', password: 'demo123', name: 'Suresh Sharma', childId: 'STU2024001', childName: 'Rahul Sharma' },
    admin: { email: 'admin@demo.com', password: 'demo123', name: 'Dr. Patil', department: 'CSBS' }
  }
};

const TIMETABLE = [
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

// Sample student data for admin
const STUDENTS_DATA = [
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

// ========================
// AUTH MODULE
// ========================
const Auth = {
  login(email, password, role) {
    const demoUser = CONFIG.demoUsers[role];
    if (demoUser && email === demoUser.email && password === demoUser.password) {
      const session = { ...demoUser, role, loggedIn: true, loginTime: new Date().toISOString() };
      localStorage.setItem('ss_session', JSON.stringify(session));
      this.addNotification(role, 'Login successful', `Welcome back, ${demoUser.name}!`);
      return { success: true, user: session };
    }
    return { success: false, message: 'Invalid email or password.' };
  },

  register(userData) {
    // In demo mode, just store and redirect to login
    localStorage.setItem('ss_registered_' + userData.email, JSON.stringify(userData));
    return { success: true, message: 'Registration successful! Please login.' };
  },

  logout() {
    localStorage.removeItem('ss_session');
    window.location.href = 'index.html';
  },

  getSession() {
    const data = localStorage.getItem('ss_session');
    return data ? JSON.parse(data) : null;
  },

  isLoggedIn() {
    const session = this.getSession();
    return session && session.loggedIn;
  },

  requireAuth(requiredRole) {
    const session = this.getSession();
    if (!session || !session.loggedIn) {
      window.location.href = 'login.html';
      return null;
    }
    if (requiredRole && session.role !== requiredRole) {
      window.location.href = session.role + '-dashboard.html';
      return null;
    }
    return session;
  },

  addNotification(role, title, message) {
    const notifications = JSON.parse(localStorage.getItem('ss_notifications') || '[]');
    notifications.unshift({
      id: Date.now(),
      role,
      title,
      message,
      time: new Date().toISOString(),
      read: false
    });
    // Keep only last 50
    if (notifications.length > 50) notifications.length = 50;
    localStorage.setItem('ss_notifications', JSON.stringify(notifications));
  }
};

// ========================
// GEOFENCE MODULE
// ========================
const Geofence = {
  isInsideCampus: null,
  watchId: null,

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  checkPosition(lat, lng) {
    const distance = this.calculateDistance(lat, lng, CONFIG.campus.lat, CONFIG.campus.lng);
    const wasInside = this.isInsideCampus;
    this.isInsideCampus = distance <= CONFIG.campus.radius;

    if (wasInside !== null && wasInside !== this.isInsideCampus) {
      if (this.isInsideCampus) {
        Auth.addNotification('parent', 'Campus Entry', `Student entered campus at ${new Date().toLocaleTimeString()}`);
        this.showToast('📍 You entered the campus area', 'green');
      } else {
        Auth.addNotification('parent', 'Campus Exit', `Student left campus at ${new Date().toLocaleTimeString()}`);
        this.showToast('📍 You left the campus area', 'orange');
      }
    }

    localStorage.setItem('ss_geofence', JSON.stringify({
      inside: this.isInsideCampus,
      distance: Math.round(distance),
      lastUpdate: new Date().toISOString(),
      lat, lng
    }));

    return { inside: this.isInsideCampus, distance: Math.round(distance) };
  },

  startTracking() {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      // Simulate being inside campus
      this.simulatePosition();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => this.checkPosition(pos.coords.latitude, pos.coords.longitude),
      () => this.simulatePosition(),
      { enableHighAccuracy: true }
    );

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.checkPosition(pos.coords.latitude, pos.coords.longitude);
        this.updateUI();
      },
      () => this.simulatePosition(),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    );
  },

  simulatePosition() {
    // Simulate being inside campus for demo
    this.isInsideCampus = true;
    localStorage.setItem('ss_geofence', JSON.stringify({
      inside: true,
      distance: 120,
      lastUpdate: new Date().toISOString(),
      lat: CONFIG.campus.lat + 0.001,
      lng: CONFIG.campus.lng + 0.001,
      simulated: true
    }));
    this.updateUI();
  },

  getStatus() {
    const data = localStorage.getItem('ss_geofence');
    return data ? JSON.parse(data) : { inside: true, distance: 120, simulated: true };
  },

  updateUI() {
    const statusEl = document.getElementById('geofence-status');
    if (!statusEl) return;
    const status = this.getStatus();
    statusEl.className = 'geofence-status ' + (status.inside ? 'inside' : 'outside');
    statusEl.innerHTML = `
      <div class="geofence-dot"></div>
      <div class="geofence-text">
        <h4>${status.inside ? '✅ Inside Campus' : '❌ Outside Campus'}</h4>
        <p>${status.distance}m from campus center • Updated ${new Date(status.lastUpdate || Date.now()).toLocaleTimeString()}</p>
      </div>
    `;
  },

  showToast(message, color) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-icon">${color === 'green' ? '✅' : '⚠️'}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }
};

// ========================
// TIMETABLE MODULE
// ========================
const Timetable = {
  getDayName() {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  },

  getTodaySchedule() {
    const day = this.getDayName();
    let schedule = TIMETABLE.filter(l => l.day === day);
    // If weekend or no lectures found, default to Monday
    if (schedule.length === 0) schedule = TIMETABLE.filter(l => l.day === 'Mon');
    return schedule;
  },

  getLectureStatus(lecture) {
    const now = new Date();
    const [startH, startM] = lecture.time.split(':').map(Number);
    const [endH, endM] = lecture.end.split(':').map(Number);
    const startTime = new Date(); startTime.setHours(startH, startM, 0);
    const endTime = new Date(); endTime.setHours(endH, endM, 0);

    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'ongoing';
    // Past lectures — mark based on geofence
    const geoStatus = Geofence.getStatus();
    return geoStatus.inside ? 'present' : 'absent';
  },

  renderTimetable(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const schedule = this.getTodaySchedule();

    container.innerHTML = schedule.map(lecture => {
      const status = this.getLectureStatus(lecture);
      const statusLabels = { present: 'Present', absent: 'Absent', upcoming: 'Upcoming', ongoing: 'Ongoing' };
      return `
        <li class="timetable-item">
          <div class="timetable-time">${lecture.time}</div>
          <div class="timetable-info">
            <h4>${lecture.subject}</h4>
            <p>${lecture.faculty} • ${lecture.room}</p>
          </div>
          <span class="timetable-status status-${status}">${statusLabels[status]}</span>
        </li>
      `;
    }).join('');
  }
};

// ========================
// ANALYTICS MODULE
// ========================
const Analytics = {
  getAttendanceData() {
    // Returns simulated attendance data
    const stored = localStorage.getItem('ss_attendance');
    if (stored) return JSON.parse(stored);

    const data = {
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
  },

  renderAttendanceRing(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const data = this.getAttendanceData();
    const circumference = 2 * Math.PI * 65;
    const offset = circumference - (data.percentage / 100) * circumference;

    let ringColor = 'var(--accent-green)';
    if (data.percentage < 75) ringColor = 'var(--accent-red)';
    else if (data.percentage < 85) ringColor = 'var(--accent-orange)';

    container.innerHTML = `
      <div class="attendance-ring">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle class="attendance-ring-bg" cx="80" cy="80" r="65" />
          <circle class="attendance-ring-fill" cx="80" cy="80" r="65"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"
            style="stroke: ${ringColor};" />
        </svg>
        <div class="attendance-ring-text">
          <span class="percentage">${data.percentage}%</span>
          <span class="label">Attendance</span>
        </div>
      </div>
    `;
  },

  renderWeeklyBars(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const data = this.getAttendanceData();

    container.innerHTML = data.weekly.map(w => {
      const pct = Math.round((w.attended / w.total) * 100);
      let barClass = 'green';
      if (pct < 75) barClass = 'red';
      else if (pct < 85) barClass = 'orange';
      return `
        <div style="margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.3rem;">
            <span>${w.day}</span>
            <span style="color: var(--text-muted);">${w.attended}/${w.total}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${barClass}" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  },

  getDepartmentStats() {
    const depts = {};
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
};

// ========================
// NOTIFICATION MODULE
// ========================
const Notifications = {
  getAll(role) {
    const all = JSON.parse(localStorage.getItem('ss_notifications') || '[]');
    return role ? all.filter(n => n.role === role || n.role === 'all') : all;
  },

  generateParentAlerts() {
    const existing = this.getAll('parent');
    if (existing.length > 3) return;

    const alerts = [
      { title: 'Campus Entry', message: 'Rahul entered campus at 8:45 AM', time: '08:45' },
      { title: 'Lecture Attended', message: 'Rahul attended Data Structures at 9:00 AM', time: '09:05' },
      { title: 'Lecture Attended', message: 'Rahul attended DBMS at 10:00 AM', time: '10:05' },
      { title: 'Absence Alert', message: 'Rahul missed Operating Systems at 11:15 AM', time: '11:20' },
      { title: 'Campus Exit', message: 'Rahul left campus at 3:15 PM', time: '15:15' }
    ];

    alerts.forEach(a => {
      const now = new Date();
      const [h, m] = a.time.split(':').map(Number);
      now.setHours(h, m, 0);
      Auth.addNotification('parent', a.title, a.message);
    });
  },

  renderAlerts(containerId, role) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const alerts = this.getAll(role).slice(0, 8);

    if (alerts.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No alerts yet</p>';
      return;
    }

    container.innerHTML = alerts.map(a => {
      const iconMap = {
        'Campus Entry': '🟢',
        'Campus Exit': '🔴',
        'Lecture Attended': '✅',
        'Absence Alert': '⚠️',
        'Login successful': '🔐',
        'System Alert': '🔔'
      };
      const icon = iconMap[a.title] || '📌';
      const timeStr = new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `
        <div class="alert-item">
          <div class="alert-icon" style="background: var(--bg-glass);">${icon}</div>
          <div class="alert-info">
            <h4>${a.title}</h4>
            <p>${a.message}</p>
          </div>
          <span class="alert-time">${timeStr}</span>
        </div>
      `;
    }).join('');
  }
};

// ========================
// DASHBOARD RENDERERS
// ========================
const Dashboard = {
  renderStudentDashboard() {
    const session = Auth.requireAuth('student');
    if (!session) return;

    // Set user info
    this.setUserInfo(session);

    // Start geofence tracking
    Geofence.startTracking();
    setTimeout(() => Geofence.updateUI(), 500);

    // Render timetable
    Timetable.renderTimetable('timetable-list');

    // Render attendance ring
    Analytics.renderAttendanceRing('attendance-ring');

    // Render weekly bars
    Analytics.renderWeeklyBars('weekly-bars');

    // Render activity feed
    this.renderActivityFeed('activity-feed');

    // Set stat values
    const data = Analytics.getAttendanceData();
    this.setStat('stat-attendance', data.percentage + '%');
    this.setStat('stat-lectures', data.attended);
    this.setStat('stat-absent', data.absent);
    this.setStat('stat-today', Timetable.getTodaySchedule().length);

    // Set date
    const dateEl = document.getElementById('header-date');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  },

  renderParentDashboard() {
    const session = Auth.requireAuth('parent');
    if (!session) return;

    this.setUserInfo(session);

    // Generate alerts for demo
    Notifications.generateParentAlerts();

    // Render alerts
    Notifications.renderAlerts('parent-alerts', 'parent');

    // Render child's timetable
    Timetable.renderTimetable('child-timetable');

    // Set stats
    const childData = STUDENTS_DATA.find(s => s.id === (session.childId || 'STU2024001'));
    const geoStatus = Geofence.getStatus();
    
    this.setStat('stat-campus-status', geoStatus.inside ? 'On Campus' : 'Off Campus');
    this.setStat('stat-child-attendance', childData ? childData.attendance + '%' : '85%');
    this.setStat('stat-today-lectures', Timetable.getTodaySchedule().length);
    this.setStat('stat-alerts-count', Notifications.getAll('parent').length);

    // Update campus status card styling
    const campusCard = document.getElementById('campus-status-card');
    if (campusCard) {
      campusCard.querySelector('.stat-icon').style.background = geoStatus.inside
        ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
      campusCard.querySelector('.stat-icon').style.color = geoStatus.inside
        ? 'var(--accent-green)' : 'var(--accent-red)';
    }

    // Set date
    const dateEl = document.getElementById('header-date');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Render attendance ring
    Analytics.renderAttendanceRing('child-attendance-ring');
  },

  renderAdminDashboard() {
    const session = Auth.requireAuth('admin');
    if (!session) return;

    this.setUserInfo(session);

    // Set stats
    const presentCount = STUDENTS_DATA.filter(s => s.status === 'present').length;
    const avgAttendance = Math.round(STUDENTS_DATA.reduce((a, s) => a + s.attendance, 0) / STUDENTS_DATA.length);

    this.setStat('stat-total-students', STUDENTS_DATA.length);
    this.setStat('stat-present-today', presentCount);
    this.setStat('stat-avg-attendance', avgAttendance + '%');
    this.setStat('stat-departments', Analytics.getDepartmentStats().length);

    // Render student table
    this.renderStudentTable('student-table-body');

    // Render timetable management
    Timetable.renderTimetable('admin-timetable');

    // Render dept stats
    this.renderDeptStats('dept-stats');

    // Set date
    const dateEl = document.getElementById('header-date');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Setup search
    const searchInput = document.getElementById('student-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderStudentTable('student-table-body', e.target.value);
      });
    }
  },

  setUserInfo(session) {
    const nameEl = document.getElementById('user-name');
    const emailEl = document.getElementById('user-email');
    const avatarEl = document.getElementById('user-avatar');
    const greetEl = document.getElementById('greeting-name');

    if (nameEl) nameEl.textContent = session.name;
    if (emailEl) emailEl.textContent = session.email;
    if (avatarEl) avatarEl.textContent = session.name.split(' ').map(n => n[0]).join('');
    if (greetEl) greetEl.textContent = session.name.split(' ')[0];
  },

  setStat(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  },

  renderActivityFeed(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const activities = [
      { text: 'Entered campus', time: '8:42 AM', color: 'green' },
      { text: 'Attended: Data Structures & Algorithms', time: '9:00 AM', color: 'blue' },
      { text: 'Attended: Database Management Systems', time: '10:00 AM', color: 'blue' },
      { text: 'Geofence: Inside campus area (128m)', time: '10:30 AM', color: 'green' },
      { text: 'Attended: Operating Systems', time: '11:15 AM', color: 'blue' },
      { text: 'Lunch break started', time: '12:15 PM', color: 'orange' },
    ];

    container.innerHTML = activities.map(a => `
      <li class="activity-item">
        <div class="activity-dot ${a.color}"></div>
        <div class="activity-content">
          <p>${a.text}</p>
          <span class="time">${a.time}</span>
        </div>
      </li>
    `).join('');
  },

  renderStudentTable(containerId, search = '') {
    const container = document.getElementById(containerId);
    if (!container) return;

    let students = STUDENTS_DATA;
    if (search) {
      const q = search.toLowerCase();
      students = students.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.dept.toLowerCase().includes(q)
      );
    }

    container.innerHTML = students.map(s => {
      const initials = s.name.split(' ').map(n => n[0]).join('');
      const attendClass = s.attendance >= 85 ? 'badge-green' : s.attendance >= 75 ? 'badge-orange' : 'badge-red';
      const statusClass = s.status === 'present' ? 'badge-green' : 'badge-red';

      return `
        <tr>
          <td>
            <div class="student-cell">
              <div class="student-avatar">${initials}</div>
              <div>
                <div style="font-weight: 600;">${s.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${s.id}</div>
              </div>
            </div>
          </td>
          <td>${s.dept}</td>
          <td>${s.year} Year</td>
          <td><span class="badge ${attendClass}">${s.attendance}%</span></td>
          <td><span class="badge ${statusClass}">${s.status === 'present' ? '● Present' : '● Absent'}</span></td>
        </tr>
      `;
    }).join('');
  },

  renderDeptStats(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const stats = Analytics.getDepartmentStats();

    container.innerHTML = stats.map(d => {
      let barClass = d.avgAttendance >= 85 ? '' : d.avgAttendance >= 75 ? 'orange' : 'red';
      return `
        <div style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.3rem;">
            <span style="font-weight: 600;">${d.name}</span>
            <span style="color: var(--text-muted);">${d.avgAttendance}% avg • ${d.presentToday}/${d.totalStudents} present</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${barClass}" style="width: ${d.avgAttendance}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }
};

// ========================
// PAGE CONTROLLERS
// ========================

// Login page
function initLoginPage() {
  const tabs = document.querySelectorAll('.role-tab');
  const demoCredsEl = document.getElementById('demo-creds');
  let selectedRole = 'student';

  function updateDemoCreds() {
    const user = CONFIG.demoUsers[selectedRole];
    if (demoCredsEl) {
      demoCredsEl.innerHTML = `<strong>Demo ${selectedRole} credentials:</strong> ${user.email} / ${user.password}`;
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      selectedRole = tab.dataset.role;
      updateDemoCreds();
    });
  });

  updateDemoCreds();

  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      const result = Auth.login(email, password, selectedRole);
      if (result.success) {
        window.location.href = selectedRole + '-dashboard.html';
      } else {
        const errorEl = document.getElementById('login-error');
        if (errorEl) {
          errorEl.textContent = result.message;
          errorEl.style.display = 'block';
        }
      }
    });
  }
}

// Register page
function initRegisterPage() {
  const roleTabs = document.querySelectorAll('.role-tab');
  const studentFields = document.getElementById('student-fields');
  const parentFields = document.getElementById('parent-fields');
  let selectedRole = 'student';

  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      selectedRole = tab.dataset.role;
      if (studentFields) studentFields.style.display = selectedRole === 'student' ? 'block' : 'none';
      if (parentFields) parentFields.style.display = selectedRole === 'parent' ? 'block' : 'none';
    });
  });

  const form = document.getElementById('register-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const password = document.getElementById('reg-password').value;
      const confirm = document.getElementById('reg-confirm').value;

      if (password !== confirm) {
        showFormError('reg-confirm', 'Passwords do not match');
        return;
      }

      if (password.length < 6) {
        showFormError('reg-password', 'Password must be at least 6 characters');
        return;
      }

      const userData = {
        role: selectedRole,
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        phone: document.getElementById('reg-phone').value,
        password: password
      };

      if (selectedRole === 'student') {
        userData.studentId = document.getElementById('reg-student-id')?.value || '';
        userData.department = document.getElementById('reg-department')?.value || '';
        userData.year = document.getElementById('reg-year')?.value || '';
      } else {
        userData.childStudentId = document.getElementById('reg-child-id')?.value || '';
      }

      const result = Auth.register(userData);
      if (result.success) {
        alert(result.message);
        window.location.href = 'login.html';
      }
    });
  }
}

function showFormError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorEl = input?.nextElementSibling;
  if (input) input.classList.add('error');
  if (errorEl && errorEl.classList.contains('form-error')) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
  setTimeout(() => {
    if (input) input.classList.remove('error');
    if (errorEl) errorEl.style.display = 'none';
  }, 3000);
}

// ========================
// NAVIGATION & UI HELPERS
// ========================
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

function logout() {
  Auth.logout();
}

// Navbar scroll effect
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar-ss');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// Mobile nav toggle
function toggleMobileNav() {
  const links = document.querySelector('.nav-links');
  if (links) links.classList.toggle('open');
}

// Scroll animations
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-in');
  if (elements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}

// Animated counter
function animateCounter(el, target) {
  let current = 0;
  const increment = target / 60;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.round(current);
    if (el.dataset.suffix) el.textContent += el.dataset.suffix;
  }, 20);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count);
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

// Create particles
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 10 + 8) + 's';
    particle.style.animationDelay = (Math.random() * 5) + 's';
    particle.style.opacity = Math.random() * 0.3;
    const colors = ['var(--accent-blue)', 'var(--accent-purple)', 'var(--accent-cyan)'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    container.appendChild(particle);
  }
}

// Geofence config for admin
function saveGeofenceConfig() {
  const lat = document.getElementById('geo-lat')?.value;
  const lng = document.getElementById('geo-lng')?.value;
  const radius = document.getElementById('geo-radius')?.value;

  if (lat && lng && radius) {
    CONFIG.campus.lat = parseFloat(lat);
    CONFIG.campus.lng = parseFloat(lng);
    CONFIG.campus.radius = parseInt(radius);
    localStorage.setItem('ss_campus_config', JSON.stringify(CONFIG.campus));
    Geofence.showToast('Geofence configuration saved!', 'green');
  }
}

function addLecture() {
  const subject = document.getElementById('new-subject')?.value;
  const faculty = document.getElementById('new-faculty')?.value;
  const time = document.getElementById('new-time')?.value;
  const room = document.getElementById('new-room')?.value;
  const day = document.getElementById('new-day')?.value;

  if (subject && faculty && time && room && day) {
    TIMETABLE.push({ time, end: '', subject, faculty, room, day });
    Geofence.showToast('Lecture added to timetable!', 'green');
    // Refresh timetable
    Timetable.renderTimetable('admin-timetable');
    // Clear fields
    ['new-subject', 'new-faculty', 'new-time', 'new-room'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }
}

// ========================
// INIT
// ========================
document.addEventListener('DOMContentLoaded', () => {
  // Load saved campus config
  const savedConfig = localStorage.getItem('ss_campus_config');
  if (savedConfig) {
    const c = JSON.parse(savedConfig);
    CONFIG.campus.lat = c.lat;
    CONFIG.campus.lng = c.lng;
    CONFIG.campus.radius = c.radius;
  }

  // Init common
  initNavbarScroll();
  initScrollAnimations();
  initCounters();
  createParticles();
});