import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AttendanceRing from '../components/AttendanceRing';
import { useAuth } from '../contexts/AuthContext';
import { Auth } from '../modules/auth';
import { Geofence } from '../modules/geofence';
import type { GeofenceStatus } from '../modules/geofence';
import { getTodaySchedule, getLectureStatus, getFullDayName } from '../modules/timetable';
import { getAttendanceData } from '../modules/analytics';
import { CheckInManager } from '../modules/checkin';
import type { CheckInRecord } from '../modules/checkin';
import type { LectureEntry } from '../config/constants';
import { LectureAttendanceManager } from '../modules/lectureAttendance';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { userProfile, loading: authLoading, logout } = useAuth();
  const [geoStatus, setGeoStatus] = useState<GeofenceStatus>({ inside: false, distance: 0, lastUpdate: new Date().toISOString(), state: 'loading' });
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [lastRecord, setLastRecord] = useState<CheckInRecord | null>(null);
  const [todayRecords, setTodayRecords] = useState<CheckInRecord[]>([]);
  const [checkinNote, setCheckinNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [animateBtn, setAnimateBtn] = useState('');
  const [, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!userProfile || userProfile.role !== 'student') { navigate('/login'); return; }
    Geofence.startTracking();
    setGeoStatus(Geofence.getStatus());
    const unsubscribe = Geofence.onStatusChange((status) => {
      setGeoStatus(status);
    });
    
    const studentId = userProfile.studentId || userProfile.id || 'STU2024001';
    
    const unsubscribeCheckins = CheckInManager.subscribeToStudentRecords(studentId, (records) => {
      const status = CheckInManager.calculateStudentStatus(records);
      setIsCheckedIn(status.checkedIn);
      setLastRecord(status.lastRecord);
      const todayStr = new Date().toDateString();
      setTodayRecords(records.filter(r => new Date(r.timestamp).toDateString() === todayStr));
    });

    const unsubscribeLecture = LectureAttendanceManager.subscribeToUpdates(() => {
      setRefreshTrigger(prev => prev + 1);
    });
    
    return () => { 
      unsubscribe(); 
      Geofence.stopTracking(); 
      unsubscribeCheckins(); 
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
  const studentId = session.studentId || session.id || 'STU2024001';
  const schedule = getTodaySchedule();
  const data = getAttendanceData();
  const statusLabels: Record<string, string> = { present: 'Present', absent: 'Absent', upcoming: 'Upcoming', ongoing: 'Ongoing' };

  const handleCheckIn = async () => {
    setAnimateBtn('checkin');
    await CheckInManager.addRecord(studentId, session.name, 'checkin', checkinNote || undefined);
    Auth.addNotification('student', 'Checked In', `You checked in at ${new Date().toLocaleTimeString()}`);
    Auth.addNotification('parent', 'Child Check-In', `${session.name} has checked in at ${new Date().toLocaleTimeString()}`);
    Auth.addNotification('admin', 'Student Check-In', `${session.name} (${studentId}) has manually checked in`);
    setCheckinNote('');
    setShowNoteInput(false);
    setTimeout(() => setAnimateBtn(''), 600);
  };

  const handleCheckOut = async () => {
    setAnimateBtn('checkout');
    await CheckInManager.addRecord(studentId, session.name, 'checkout', checkinNote || undefined);
    Auth.addNotification('student', 'Checked Out', `You checked out at ${new Date().toLocaleTimeString()}`);
    Auth.addNotification('parent', 'Child Check-Out', `${session.name} has checked out at ${new Date().toLocaleTimeString()}`);
    Auth.addNotification('admin', 'Student Check-Out', `${session.name} (${studentId}) has manually checked out`);
    setCheckinNote('');
    setShowNoteInput(false);
    setTimeout(() => setAnimateBtn(''), 600);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const activities = [
    { text: 'Entered campus', time: '8:42 AM', color: 'green' },
    { text: 'Attended: Data Structures & Algorithms', time: '9:00 AM', color: 'blue' },
    { text: 'Attended: Database Management Systems', time: '10:00 AM', color: 'blue' },
    { text: 'Geofence: Inside campus area (128m)', time: '10:30 AM', color: 'green' },
    { text: 'Attended: Operating Systems', time: '11:15 AM', color: 'blue' },
    { text: 'Lunch break started', time: '12:15 PM', color: 'orange' },
  ];

  return (
    <>
      <div className="toast-container" id="toast-container"></div>
      <div className="dashboard-layout">
        <Sidebar session={session} role="student" />
        <main className="dashboard-main">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1>Welcome, <span>{session.name.split(' ')[0]}</span> 👋</h1>
              <p className="header-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <button onClick={handleLogout} className="btn-primary-ss btn-sm" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              🚪 Logout
            </button>
          </div>

          {/* Geofence Status */}
          <div className={`geofence-status ${geoStatus.state === 'loading' ? 'loading' : geoStatus.state === 'unavailable' ? 'outside' : geoStatus.inside ? 'inside' : 'outside'}`}>
            <div className="geofence-dot"></div>
            <div className="geofence-text">
              <h4>
                {geoStatus.state === 'loading' && '⏳ Determining Location...'}
                {geoStatus.state === 'unavailable' && '📍 Location Unavailable'}
                {geoStatus.state === 'demo' && '🟢 Inside Campus (Demo)'}
                {geoStatus.state === 'tracking' && (geoStatus.inside ? '✅ Inside Campus' : '❌ Outside Campus')}
              </h4>
              <p>
                {geoStatus.state === 'loading' && 'Waiting for GPS signal...'}
                {geoStatus.state === 'unavailable' && 'Please enable location access in your browser'}
                {(geoStatus.state === 'tracking' || geoStatus.state === 'demo') && (
                  <>{geoStatus.distance}m from campus center{geoStatus.accuracy ? ` • ±${geoStatus.accuracy}m accuracy` : ''} • Updated {new Date(geoStatus.lastUpdate).toLocaleTimeString()}</>
                )}
              </p>
            </div>
            {geoStatus.state === 'unavailable' && (
              <button className="btn-primary-ss btn-sm" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }} onClick={() => Geofence.enableDemoMode()}>🎭 Use Demo Mode</button>
            )}
          </div>

          {/* ===== Manual Check-In / Check-Out Section ===== */}
          <div className="checkin-section">
            <div className={`checkin-card ${isCheckedIn ? 'checked-in' : 'checked-out'}`}>
              <div className="checkin-header">
                <div className="checkin-status-indicator">
                  <div className={`checkin-pulse ${isCheckedIn ? 'active' : ''}`}></div>
                  <span className="checkin-status-text">
                    {isCheckedIn ? '🟢 Currently Checked In' : '🔴 Not Checked In'}
                  </span>
                </div>
                {lastRecord && (
                  <span className="checkin-last-time">
                    Last: {lastRecord.type === 'checkin' ? '↗ In' : '↙ Out'} at {CheckInManager.formatTime(lastRecord.timestamp)}
                  </span>
                )}
              </div>

              <div className="checkin-actions">
                <button
                  className={`checkin-btn btn-check-in ${isCheckedIn ? 'disabled' : ''} ${animateBtn === 'checkin' ? 'animate-pop' : ''}`}
                  onClick={handleCheckIn}
                  disabled={isCheckedIn}
                  id="btn-checkin"
                >
                  <span className="checkin-btn-icon">📥</span>
                  <span className="checkin-btn-label">Check In</span>
                  <span className="checkin-btn-sub">Manual Entry</span>
                </button>

                <button
                  className={`checkin-btn btn-check-out ${!isCheckedIn ? 'disabled' : ''} ${animateBtn === 'checkout' ? 'animate-pop' : ''}`}
                  onClick={handleCheckOut}
                  disabled={!isCheckedIn}
                  id="btn-checkout"
                >
                  <span className="checkin-btn-icon">📤</span>
                  <span className="checkin-btn-label">Check Out</span>
                  <span className="checkin-btn-sub">Manual Exit</span>
                </button>
              </div>

              <div className="checkin-note-section">
                {!showNoteInput ? (
                  <button className="checkin-note-toggle" onClick={() => setShowNoteInput(true)}>
                    ＋ Add a note (optional)
                  </button>
                ) : (
                  <div className="checkin-note-input-wrap">
                    <input
                      type="text"
                      className="form-input checkin-note-input"
                      placeholder="e.g., Late arrival - bus delay, Early leave - doctor appointment..."
                      value={checkinNote}
                      onChange={e => setCheckinNote(e.target.value)}
                      maxLength={100}
                    />
                    <button className="checkin-note-close" onClick={() => { setShowNoteInput(false); setCheckinNote(''); }}>✕</button>
                  </div>
                )}
              </div>

              {/* Today's check-in history */}
              {todayRecords.length > 0 && (
                <div className="checkin-history">
                  <h4 className="checkin-history-title">📋 Today's Check-In Log</h4>
                  <div className="checkin-timeline">
                    {todayRecords.map((r) => (
                      <div key={r.id} className={`checkin-timeline-item ${r.type}`}>
                        <div className="checkin-timeline-dot"></div>
                        <div className="checkin-timeline-content">
                          <span className="checkin-timeline-type">{r.type === 'checkin' ? '📥 Checked In' : '📤 Checked Out'}</span>
                          <span className="checkin-timeline-time">{CheckInManager.formatTime(r.timestamp)}</span>
                        </div>
                        {r.note && <span className="checkin-timeline-note">💬 {r.note}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stat Cards */}
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)' }}>📊</div>
              <div className="stat-value">{data.percentage}%</div>
              <div className="stat-label">Overall Attendance</div>
              <span className="stat-change up">↑ 2.3% this week</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)' }}>📚</div>
              <div className="stat-value">{data.attended}</div>
              <div className="stat-label">Lectures Attended</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)' }}>❌</div>
              <div className="stat-value">{data.absent}</div>
              <div className="stat-label">Absences</div>
              <span className="stat-change down">↑ 3 this month</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-orange)' }}>📅</div>
              <div className="stat-value">{schedule.length}</div>
              <div className="stat-label">Today's Lectures</div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="dashboard-grid">
            {/* Timetable */}
            <div className="panel">
              <div className="panel-header">
                <h3>📅 Today's Schedule</h3>
                <span className="badge badge-blue">{getFullDayName()}</span>
              </div>
              <ul className="timetable-list">
                {schedule.map((lecture: LectureEntry, i: number) => {
                  const status = getLectureStatus(lecture, studentId);
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

            {/* Attendance Ring */}
            <div className="panel">
              <div className="panel-header">
                <h3>📊 Attendance Overview</h3>
              </div>
              <div className="attendance-ring-container">
                <AttendanceRing />
              </div>
              <div style={{ padding: '0 1rem' }}>
                {data.weekly.map((w, i) => {
                  const pct = Math.round((w.attended / w.total) * 100);
                  let barClass = 'green';
                  if (pct < 75) barClass = 'red';
                  else if (pct < 85) barClass = 'orange';
                  return (
                    <div key={i} style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                        <span>{w.day}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{w.attended}/{w.total}</span>
                      </div>
                      <div className="progress-bar">
                        <div className={`progress-fill ${barClass}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="panel mt-2">
            <div className="panel-header">
              <h3>📋 Today's Activity</h3>
              <span className="badge badge-green">Live</span>
            </div>
            <ul className="activity-feed">
              {activities.map((a, i) => (
                <li key={i} className="activity-item">
                  <div className={`activity-dot ${a.color}`}></div>
                  <div className="activity-content">
                    <p>{a.text}</p>
                    <span className="time">{a.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </>
  );
}
