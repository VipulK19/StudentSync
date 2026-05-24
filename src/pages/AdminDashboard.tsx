import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { Auth } from '../modules/auth';
import { STUDENTS_DATA, TIMETABLE } from '../config/constants';
import type { StudentRecord, LectureEntry } from '../config/constants';
import { getTodaySchedule, getLectureStatus } from '../modules/timetable';
import { getDepartmentStats } from '../modules/analytics';
import { CONFIG } from '../config/constants';
import { useToast } from '../components/Toast';
import { CheckInManager } from '../modules/checkin';
import type { CheckInRecord } from '../modules/checkin';
import { Geofence } from '../modules/geofence';
import { getAlertIcon, subscribeToNotifications } from '../modules/notifications';
import type { Notification } from '../modules/auth';
import { LectureAttendanceManager } from '../modules/lectureAttendance';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { userProfile, loading: authLoading, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [, setTimetableData] = useState<LectureEntry[]>([]);
  const [newLecture, setNewLecture] = useState({ subject: '', faculty: '', time: '', room: '', day: 'Mon' });
  const [geoConfig, setGeoConfig] = useState({ lat: CONFIG.campus.lat, lng: CONFIG.campus.lng, radius: CONFIG.campus.radius });
  const [checkinRecords, setCheckinRecords] = useState<CheckInRecord[]>([]);
  const [checkinFilter, setCheckinFilter] = useState<'all' | 'checkin' | 'checkout'>('all');
  const [firebaseStudents, setFirebaseStudents] = useState<StudentRecord[]>([]);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [adminAlerts, setAdminAlerts] = useState<Notification[]>([]);
  const [, setRefreshTrigger] = useState(0);
  const [selectedLectureIndex, setSelectedLectureIndex] = useState<number | ''>('');

  useEffect(() => {
    if (authLoading) return;
    if (!userProfile || userProfile.role !== 'admin') { navigate('/login'); return; }
    setTimetableData([...TIMETABLE]);
    const saved = localStorage.getItem('ss_campus_config');
    if (saved) {
      const c = JSON.parse(saved);
      setGeoConfig({ lat: c.lat, lng: c.lng, radius: c.radius });
    }

    // Fetch students from Firebase
    Auth.getStudents().then(students => {
      if (students.length > 0) {
        setFirebaseStudents(students as unknown as StudentRecord[]);
      }
      setStudentsLoaded(true);
    });
    
    // Subscribe to today's check-in records
    const unsubscribeCheckins = CheckInManager.subscribeToTodayRecords((records) => {
      setCheckinRecords(records);
    });

    const unsubscribeNotifications = subscribeToNotifications('admin', (notifs) => {
      setAdminAlerts(notifs);
    });

    const unsubscribeLecture = LectureAttendanceManager.subscribeToUpdates(() => {
      setRefreshTrigger(prev => prev + 1);
    });

    return () => {
      unsubscribeCheckins();
      unsubscribeNotifications();
      unsubscribeLecture();
    };
  }, [navigate, userProfile, authLoading]);

  if (authLoading) return (
    <div className="auth-page">
      <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Loading...</div>
    </div>
  );
  if (!userProfile) return null;

  const session = userProfile;

  // Use Firebase students if available, otherwise fallback to demo data
  const allStudents: StudentRecord[] = firebaseStudents.length > 0 ? firebaseStudents : STUDENTS_DATA;
  const presentCount = allStudents.filter(s => s.status === 'present').length;
  const avgAttendance = allStudents.length > 0
    ? Math.round(allStudents.reduce((a, s) => a + s.attendance, 0) / allStudents.length)
    : 0;
  const deptStats = getDepartmentStats();
  const schedule = getTodaySchedule();
  const statusLabels: Record<string, string> = { present: 'Present', absent: 'Absent', upcoming: 'Upcoming', ongoing: 'Ongoing' };
  const checkinStats = CheckInManager.calculateTodayStats(checkinRecords);

  let filteredStudents: StudentRecord[] = allStudents;
  if (search) {
    const q = search.toLowerCase();
    filteredStudents = allStudents.filter(s =>
      s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.dept.toLowerCase().includes(q)
    );
  }

  const filteredCheckinRecords = checkinFilter === 'all'
    ? checkinRecords
    : checkinRecords.filter(r => r.type === checkinFilter);

  const handleAddLecture = () => {
    if (newLecture.subject && newLecture.faculty && newLecture.time && newLecture.room) {
      TIMETABLE.push({ ...newLecture, end: '' });
      setTimetableData([...TIMETABLE]);
      showToast('Lecture added to timetable!', 'green');
      setNewLecture({ subject: '', faculty: '', time: '', room: '', day: 'Mon' });
    }
  };

  const handleSaveGeoConfig = () => {
    CONFIG.campus.lat = geoConfig.lat;
    CONFIG.campus.lng = geoConfig.lng;
    CONFIG.campus.radius = geoConfig.radius;
    localStorage.setItem('ss_campus_config', JSON.stringify(CONFIG.campus));
    // Immediately apply the new config to the live geofence module
    Geofence.reloadConfig();
    showToast('Geofence configuration saved & applied!', 'green');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleManualAttendance = async (student: StudentRecord, type: 'checkin' | 'checkout') => {
    await CheckInManager.addRecord(student.id, student.name, type, 'Manual override by Admin');
    
    const actionText = type === 'checkin' ? 'checked in' : 'checked out';
    const titleText = type === 'checkin' ? 'Check-In' : 'Check-Out';
    
    Auth.addNotification('student', `Manual ${titleText}`, `You have been manually ${actionText} by Admin`);
    Auth.addNotification('parent', `Child ${titleText}`, `${student.name} has been manually ${actionText} by Admin`);
    
    showToast(`Marked ${student.name} as ${type === 'checkin' ? 'Present' : 'Absent'}`, 'green');
    
    if (firebaseStudents.length > 0) {
      setFirebaseStudents(prev => prev.map(st => st.id === student.id ? { ...st, status: type === 'checkin' ? 'present' : 'absent' } : st));
    } else {
      const demoStudent = STUDENTS_DATA.find(st => st.id === student.id);
      if (demoStudent) {
        demoStudent.status = type === 'checkin' ? 'present' : 'absent';
      }
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleLectureAttendance = (student: StudentRecord, status: 'present' | 'absent') => {
    if (selectedLectureIndex === '') return;
    const lecture = schedule[selectedLectureIndex as number];
    const lectureId = LectureAttendanceManager.generateLectureId(new Date().toDateString(), lecture.time, lecture.subject);
    LectureAttendanceManager.markStudent(lectureId, lecture.subject, student.id, student.name, status);

    const actionText = status === 'present' ? 'present' : 'absent';
    Auth.addNotification('student', `Lecture Attendance`, `You were marked ${actionText} for ${lecture.subject}`);
    Auth.addNotification('parent', `Child Lecture Attendance`, `${student.name} was marked ${actionText} for ${lecture.subject}`);
    
    showToast(`Marked ${student.name} ${actionText} for ${lecture.subject}`, 'green');
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <div className="toast-container" id="toast-container"></div>
      <div className="dashboard-layout">
        <Sidebar session={session} role="admin" />
        <main className="dashboard-main">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1>Admin Dashboard ⚙️</h1>
              <p className="header-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <button onClick={handleLogout} className="btn-primary-ss btn-sm" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              🚪 Logout
            </button>
          </div>

          {/* Stat Cards */}
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)' }}>👥</div>
              <div className="stat-value">{allStudents.length}</div>
              <div className="stat-label">Total Students</div>
              {!studentsLoaded && <span className="stat-change" style={{ color: 'var(--text-muted)' }}>Loading...</span>}
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)' }}>✅</div>
              <div className="stat-value">{presentCount}</div>
              <div className="stat-label">Present Today</div>
              <span className="stat-change up">↑ On campus now</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>📊</div>
              <div className="stat-value">{avgAttendance}%</div>
              <div className="stat-label">Avg Attendance</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-orange)' }}>🏛️</div>
              <div className="stat-value">{deptStats.length}</div>
              <div className="stat-label">Departments</div>
            </div>
          </div>

          {/* ===== Manual Check-In/Out Log Panel ===== */}
          <div className="panel mt-2 checkin-log-panel">
            <div className="panel-header">
              <h3>📥 Manual Check-In / Check-Out Log</h3>
              <span className="badge badge-green">Live</span>
            </div>

            {/* Quick Stats Row */}
            <div className="checkin-log-stats">
              <div className="checkin-log-stat">
                <span className="checkin-log-stat-value green">{checkinStats.totalCheckIns}</span>
                <span className="checkin-log-stat-label">Check-Ins Today</span>
              </div>
              <div className="checkin-log-stat">
                <span className="checkin-log-stat-value orange">{checkinStats.totalCheckOuts}</span>
                <span className="checkin-log-stat-label">Check-Outs Today</span>
              </div>
              <div className="checkin-log-stat">
                <span className="checkin-log-stat-value blue">{checkinStats.currentlyIn}</span>
                <span className="checkin-log-stat-label">Currently On Campus</span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="checkin-log-filters">
              <button className={`checkin-filter-btn ${checkinFilter === 'all' ? 'active' : ''}`} onClick={() => setCheckinFilter('all')}>All</button>
              <button className={`checkin-filter-btn ${checkinFilter === 'checkin' ? 'active' : ''}`} onClick={() => setCheckinFilter('checkin')}>Check-Ins</button>
              <button className={`checkin-filter-btn ${checkinFilter === 'checkout' ? 'active' : ''}`} onClick={() => setCheckinFilter('checkout')}>Check-Outs</button>
            </div>

            {/* Records Table */}
            {filteredCheckinRecords.length === 0 ? (
              <div className="checkin-log-empty">
                <span className="checkin-log-empty-icon">📋</span>
                <p>No manual check-in/check-out records for today yet.</p>
                <p className="checkin-log-empty-sub">Records will appear here when students use the manual check-in feature.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table checkin-log-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Type</th>
                      <th>Time</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCheckinRecords.map((r) => (
                      <tr key={r.id} className={`checkin-row-${r.type}`}>
                        <td>
                          <div className="student-cell">
                            <div className="student-avatar">{r.studentName.split(' ').map(n => n[0]).join('')}</div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{r.studentName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.studentId}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${r.type === 'checkin' ? 'badge-green' : 'badge-orange'}`}>
                            {r.type === 'checkin' ? '📥 Check-In' : '📤 Check-Out'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500 }}>{CheckInManager.formatTime(r.timestamp)}</span>
                          <br />
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{CheckInManager.relativeTime(r.timestamp)}</span>
                        </td>
                        <td>
                          {r.note ? (
                            <span className="checkin-note-badge">💬 {r.note}</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ===== Admin Alerts & Notifications ===== */}
          {adminAlerts.length > 0 && (
            <div className="panel mt-2">
              <div className="panel-header">
                <h3>🔔 Recent Alerts</h3>
                <span className="badge badge-orange">{adminAlerts.length}</span>
              </div>
              <div>
                {adminAlerts.slice(0, 10).map((a, i) => (
                  <div key={i} className="alert-item">
                    <div className="alert-icon" style={{ background: 'var(--bg-glass)' }}>{getAlertIcon(a.title)}</div>
                    <div className="alert-info">
                      <h4>{a.title}</h4>
                      <p>{a.message}</p>
                    </div>
                    <span className="alert-time">{new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Records & Dept Stats */}
          <div className="dashboard-grid mt-2">
            <div className="panel">
              <div className="panel-header">
                <h3>👥 Student Records</h3>
                <div className="search-bar">
                  <span className="search-icon">🔍</span>
                  <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Student</th><th>Department</th><th>Year</th><th>Attendance</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s: StudentRecord) => {
                      const initials = s.name.split(' ').map(n => n[0]).join('');
                      const attendClass = s.attendance >= 85 ? 'badge-green' : s.attendance >= 75 ? 'badge-orange' : 'badge-red';
                      const statusClass = s.status === 'present' ? 'badge-green' : 'badge-red';
                      return (
                        <tr key={s.id}>
                          <td>
                            <div className="student-cell">
                              <div className="student-avatar">{initials}</div>
                              <div>
                                <div style={{ fontWeight: 600 }}>{s.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.id}</div>
                              </div>
                            </div>
                          </td>
                          <td>{s.dept}</td>
                          <td>{s.year} Year</td>
                          <td><span className={`badge ${attendClass}`}>{s.attendance}%</span></td>
                          <td><span className={`badge ${statusClass}`}>{s.status === 'present' ? '● Present' : '● Absent'}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                className="btn-primary-ss btn-sm"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                                onClick={() => handleManualAttendance(s, 'checkin')}
                                disabled={s.status === 'present'}
                              >
                                Mark Present
                              </button>
                              <button
                                className="btn-primary-ss btn-sm"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                                onClick={() => handleManualAttendance(s, 'checkout')}
                                disabled={s.status === 'absent'}
                              >
                                Mark Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Department Stats */}
            <div className="panel">
              <div className="panel-header">
                <h3>📈 Department Analytics</h3>
              </div>
              <div>
                {deptStats.map((d, i) => {
                  const barClass = d.avgAttendance >= 85 ? '' : d.avgAttendance >= 75 ? 'orange' : 'red';
                  return (
                    <div key={i} style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: 600 }}>{d.name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{d.avgAttendance}% avg • {d.presentToday}/{d.totalStudents} present</span>
                      </div>
                      <div className="progress-bar">
                        <div className={`progress-fill ${barClass}`} style={{ width: `${d.avgAttendance}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Timetable & Geofence Config */}
          <div className="dashboard-grid equal mt-2">
            {/* Timetable Management */}
            <div className="panel">
              <div className="panel-header">
                <h3>📅 Timetable Management</h3>
                <span className="badge badge-blue">Today</span>
              </div>

              {/* Add Lecture Form */}
              <div className="glass-card mb-2" style={{ padding: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>➕ Add New Lecture</h4>
                <div className="config-row mb-1">
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <input type="text" className="form-input" placeholder="Subject Name" value={newLecture.subject} onChange={e => setNewLecture(p => ({ ...p, subject: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <input type="text" className="form-input" placeholder="Faculty Name" value={newLecture.faculty} onChange={e => setNewLecture(p => ({ ...p, faculty: e.target.value }))} />
                  </div>
                </div>
                <div className="config-row mb-1">
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <input type="time" className="form-input" value={newLecture.time} onChange={e => setNewLecture(p => ({ ...p, time: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <input type="text" className="form-input" placeholder="Room" value={newLecture.room} onChange={e => setNewLecture(p => ({ ...p, room: e.target.value }))} />
                  </div>
                </div>
                <div className="config-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <select className="form-select" value={newLecture.day} onChange={e => setNewLecture(p => ({ ...p, day: e.target.value }))}>
                      <option value="Mon">Monday</option>
                      <option value="Tue">Tuesday</option>
                      <option value="Wed">Wednesday</option>
                      <option value="Thu">Thursday</option>
                      <option value="Fri">Friday</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <button className="btn-primary-ss btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAddLecture}>
                      Add Lecture
                    </button>
                  </div>
                </div>
              </div>

              {/* Today's Timetable */}
              <ul className="timetable-list">
                {schedule.map((lecture: LectureEntry, i: number) => {
                  const status = getLectureStatus(lecture);
                  return (
                    <li key={i} className="timetable-item">
                      <div className="timetable-time">{lecture.time}</div>
                      <div className="timetable-info">
                        <h4>{lecture.subject}</h4>
                        <p>{lecture.faculty} • {lecture.room}</p>
                      </div>
                      <span className={`timetable-status status-${status === 'completed' ? 'present' : status}`}>
                        {status === 'completed' ? 'Completed' : statusLabels[status] || status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Lecture Attendance Management */}
            <div className="panel">
              <div className="panel-header">
                <h3>📝 Lecture Attendance</h3>
                <span className="badge badge-purple">Per Lecture</span>
              </div>

              <div className="glass-card mb-2" style={{ padding: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Select Lecture</h4>
                <select className="form-select" value={selectedLectureIndex} onChange={(e) => setSelectedLectureIndex(e.target.value === '' ? '' : Number(e.target.value))}>
                  <option value="">-- Select a lecture --</option>
                  {schedule.map((l, i) => (
                    <option key={i} value={i}>{l.time} - {l.subject} ({l.room})</option>
                  ))}
                </select>
              </div>

              {selectedLectureIndex !== '' && (
                <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr><th>Student</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s: StudentRecord) => {
                        const lecture = schedule[selectedLectureIndex as number];
                        const lectureId = LectureAttendanceManager.generateLectureId(new Date().toDateString(), lecture.time, lecture.subject);
                        const currentStatus = LectureAttendanceManager.getStudentStatus(lectureId, s.id);
                        
                        return (
                          <tr key={s.id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{s.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.id}</div>
                            </td>
                            <td>
                              {currentStatus === 'present' && <span className="badge badge-green">Present</span>}
                              {currentStatus === 'absent' && <span className="badge badge-red">Absent</span>}
                              {!currentStatus && <span className="badge" style={{ background: 'var(--bg-glass)', color: 'var(--text-muted)' }}>Not Marked</span>}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  className="btn-primary-ss btn-sm"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                                  onClick={() => handleLectureAttendance(s, 'present')}
                                >
                                  P
                                </button>
                                <button
                                  className="btn-primary-ss btn-sm"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                                  onClick={() => handleLectureAttendance(s, 'absent')}
                                >
                                  A
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          <div className="dashboard-grid mt-2">
            {/* Geofence Configuration */}
            <div className="panel">
              <div className="panel-header">
                <h3>📍 Geofence Configuration</h3>
                <span className="badge badge-green">Active</span>
              </div>

              <div className="glass-card mb-2" style={{ padding: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Campus Boundary Settings</h4>

                <div className="config-group">
                  <label>Campus Name</label>
                  <input type="text" className="form-input" value="KIT College of Engineering, Kolhapur" readOnly />
                </div>

                <div className="config-row">
                  <div className="config-group">
                    <label>Latitude</label>
                    <input type="number" step="0.0001" className="form-input" value={geoConfig.lat} onChange={e => setGeoConfig(p => ({ ...p, lat: parseFloat(e.target.value) }))} />
                  </div>
                  <div className="config-group">
                    <label>Longitude</label>
                    <input type="number" step="0.0001" className="form-input" value={geoConfig.lng} onChange={e => setGeoConfig(p => ({ ...p, lng: parseFloat(e.target.value) }))} />
                  </div>
                </div>

                <div className="config-group">
                  <label>Geofence Radius (meters)</label>
                  <input type="number" className="form-input" value={geoConfig.radius} onChange={e => setGeoConfig(p => ({ ...p, radius: parseInt(e.target.value) }))} />
                </div>

                <button className="btn-primary-ss btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSaveGeoConfig}>
                  💾 Save Configuration
                </button>
              </div>

              {/* Geofence Info */}
              <div style={{ padding: '0 0.5rem' }}>
                <div className="alert-item">
                  <div className="alert-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)' }}>🟢</div>
                  <div className="alert-info">
                    <h4>Geofence Active</h4>
                    <p>Monitoring student positions in real-time</p>
                  </div>
                </div>
                <div className="alert-item">
                  <div className="alert-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)' }}>📊</div>
                  <div className="alert-info">
                    <h4>Tracking Mode</h4>
                    <p>GPS-based boundary detection with {geoConfig.radius}m radius</p>
                  </div>
                </div>
                <div className="alert-item">
                  <div className="alert-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>🛡️</div>
                  <div className="alert-info">
                    <h4>Privacy Mode</h4>
                    <p>Consent-based, academic hours only (8 AM - 5 PM)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
