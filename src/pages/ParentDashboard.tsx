import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AttendanceRing from '../components/AttendanceRing';
import { useAuth } from '../contexts/AuthContext';
import { Auth } from '../modules/auth';
import { Geofence } from '../modules/geofence';
import type { GeofenceStatus } from '../modules/geofence';
import { getTodaySchedule, getLectureStatus, getFullDayName } from '../modules/timetable';
import { STUDENTS_DATA } from '../config/constants';
import type { LectureEntry } from '../config/constants';
import { getAllNotifications, generateParentAlerts, getAlertIcon, subscribeToNotifications } from '../modules/notifications';
import { CheckInManager } from '../modules/checkin';
import type { CheckInRecord } from '../modules/checkin';
import type { Notification } from '../modules/auth';
import { LectureAttendanceManager } from '../modules/lectureAttendance';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { userProfile, loading: authLoading, logout } = useAuth();
  const [childRecords, setChildRecords] = useState<CheckInRecord[]>([]);
  const [, setRefreshTrigger] = useState(0);
  const [geoStatus, setGeoStatus] = useState<GeofenceStatus>(Geofence.getStatus());
  const [childInfo, setChildInfo] = useState<{ name: string; email: string } | null>(null);

  const [alerts, setAlerts] = useState<Notification[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!userProfile || userProfile.role !== 'parent') { navigate('/login'); return; }

    const childId = userProfile.childId || 'STU2024001';

    // Fetch child info from Firebase, then generate alerts with actual child name
    Auth.findStudent(childId).then(info => {
      if (info) {
        setChildInfo(info);
        generateParentAlerts(info.name);
      } else {
        // Use session childName or default
        generateParentAlerts(userProfile.childName || undefined);
      }
    }).catch(() => {
      generateParentAlerts(userProfile.childName || undefined);
    });

    // Start geofence tracking so parent can see child's campus status
    Geofence.startTracking();
    setGeoStatus(Geofence.getStatus());

    const unsubscribeGeo = Geofence.onStatusChange((status) => {
      setGeoStatus(status);
    });

    // Subscribe to student's check-in records
    const unsubscribeCheckins = CheckInManager.subscribeToStudentRecords(childId, (records) => {
      setChildRecords(records);
    });

    const unsubscribeNotifications = subscribeToNotifications('parent', (notifs) => {
      setAlerts(notifs.slice(0, 8));
    });

    const unsubscribeLecture = LectureAttendanceManager.subscribeToUpdates(() => {
      setRefreshTrigger(prev => prev + 1);
    });

    return () => { 
      unsubscribeGeo(); 
      Geofence.stopTracking(); 
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
  const childId = session.childId || 'STU2024001';
  const childData = STUDENTS_DATA.find(s => s.id === childId);
  const childName = childInfo?.name || session.childName || childData?.name || 'Student';
  const childInitials = childName.split(' ').map(n => n[0]).join('');
  const schedule = getTodaySchedule();
  const statusLabels: Record<string, string> = { present: 'Present', absent: 'Absent', upcoming: 'Upcoming', ongoing: 'Ongoing' };

  const childCheckinStatus = CheckInManager.calculateStudentStatus(childRecords);
  const todayChildRecords = childRecords.filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString());

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <div className="toast-container" id="toast-container"></div>
      <div className="dashboard-layout">
        <Sidebar session={session} role="parent" />
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

          {/* Child Info Banner */}
          <div className="glass-card mb-2" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', flexWrap: 'wrap' }}>
            <div className="sidebar-avatar" style={{ width: '56px', height: '56px', fontSize: '1.2rem' }}>{childInitials}</div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{childName}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{childId} • {session.department || 'CSBS'} • {session.year || '3rd Year'}</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={`badge ${geoStatus.state === 'tracking' ? (geoStatus.inside ? 'badge-green' : 'badge-red') : geoStatus.state === 'demo' ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
                ● {geoStatus.state === 'loading' ? 'Locating...' : geoStatus.state === 'unavailable' ? 'Location N/A' : geoStatus.state === 'demo' ? 'On Campus (Demo)' : geoStatus.inside ? 'On Campus' : 'Off Campus'}
              </span>
              <span className={`badge ${childCheckinStatus.checkedIn ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
                {childCheckinStatus.checkedIn ? '📥 Checked In' : '📤 Not Checked In'}
              </span>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: (geoStatus.state === 'tracking' && geoStatus.inside) || geoStatus.state === 'demo' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: (geoStatus.state === 'tracking' && geoStatus.inside) || geoStatus.state === 'demo' ? 'var(--accent-green)' : 'var(--accent-red)' }}>📍</div>
              <div className="stat-value" style={{ fontSize: '1.4rem' }}>{geoStatus.state === 'loading' ? 'Locating...' : geoStatus.state === 'unavailable' ? 'N/A' : geoStatus.state === 'demo' ? 'On Campus' : geoStatus.inside ? 'On Campus' : 'Off Campus'}</div>
              <div className="stat-label">Campus Status</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)' }}>📊</div>
              <div className="stat-value">{childData ? childData.attendance + '%' : '85%'}</div>
              <div className="stat-label">Attendance Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>📅</div>
              <div className="stat-value">{schedule.length}</div>
              <div className="stat-label">Today's Lectures</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-orange)' }}>🔔</div>
              <div className="stat-value">{getAllNotifications('parent').length}</div>
              <div className="stat-label">Total Alerts</div>
            </div>
          </div>

          {/* ===== Child's Check-In / Check-Out Log ===== */}
          <div className="panel mt-2 checkin-log-panel parent-checkin-panel">
            <div className="panel-header">
              <h3>📥 Child's Check-In / Check-Out Activity</h3>
              <span className={`badge ${childCheckinStatus.checkedIn ? 'badge-green' : 'badge-orange'}`}>
                {childCheckinStatus.checkedIn ? 'On Campus' : 'Off Campus'}
              </span>
            </div>

            {/* Current Status Banner */}
            <div className={`checkin-parent-status ${childCheckinStatus.checkedIn ? 'in' : 'out'}`}>
              <div className="checkin-parent-status-icon">
                {childCheckinStatus.checkedIn ? '🟢' : '🔴'}
              </div>
              <div className="checkin-parent-status-info">
                <h4>{childCheckinStatus.checkedIn ? 'Your child is currently checked in' : 'Your child is not checked in'}</h4>
                {childCheckinStatus.lastRecord && (
                  <p>Last activity: {childCheckinStatus.lastRecord.type === 'checkin' ? 'Checked in' : 'Checked out'} at {CheckInManager.formatTime(childCheckinStatus.lastRecord.timestamp)} — {CheckInManager.relativeTime(childCheckinStatus.lastRecord.timestamp)}</p>
                )}
                {!childCheckinStatus.lastRecord && (
                  <p>No check-in/check-out activity recorded yet today.</p>
                )}
              </div>
            </div>

            {/* Today's Timeline */}
            {todayChildRecords.length > 0 ? (
              <div className="checkin-parent-timeline">
                <h4 className="checkin-history-title">📋 Today's Activity Timeline</h4>
                <div className="checkin-timeline">
                  {todayChildRecords.map((r) => (
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
            ) : (
              <div className="checkin-log-empty" style={{ padding: '1.5rem' }}>
                <span className="checkin-log-empty-icon">📋</span>
                <p>No manual check-in/check-out records for today.</p>
                <p className="checkin-log-empty-sub">Activity will appear here when your child manually checks in or out.</p>
              </div>
            )}
          </div>

          {/* Main Grid */}
          <div className="dashboard-grid mt-2">
            {/* Alerts Panel */}
            <div className="panel">
              <div className="panel-header">
                <h3>🔔 Alerts & Notifications</h3>
                <span className="badge badge-orange">Today</span>
              </div>
              <div>
                {alerts.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No alerts yet</p>
                ) : alerts.map((a, i) => (
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

            {/* Attendance Overview */}
            <div className="panel">
              <div className="panel-header">
                <h3>📊 Attendance Overview</h3>
              </div>
              <div className="attendance-ring-container">
                <AttendanceRing />
              </div>
              <div style={{ textAlign: 'center', padding: '0 1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Your child has attended <strong style={{ color: 'var(--accent-blue)' }}>102</strong> out of <strong>120</strong> lectures this semester.
                </p>
              </div>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="panel mt-2">
            <div className="panel-header">
              <h3>📅 Today's Lecture Schedule</h3>
              <span className="badge badge-blue">{getFullDayName()}</span>
            </div>
            <ul className="timetable-list">
              {schedule.map((lecture: LectureEntry, i: number) => {
                const status = getLectureStatus(lecture, childId);
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

          {/* Contact Card */}
          <div className="glass-card mt-2" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="card-icon green" style={{ width: '48px', height: '48px', fontSize: '1.3rem' }}>📞</div>
            <div>
              <h3 style={{ fontSize: '1rem' }}>Need to contact the institution?</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reach out to KIT College of Engineering for any queries regarding your child's attendance or campus status.</p>
            </div>
            <button className="btn-primary-ss btn-sm btn-success-ss" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>Contact Now</button>
          </div>
        </main>
      </div>
    </>
  );
}
