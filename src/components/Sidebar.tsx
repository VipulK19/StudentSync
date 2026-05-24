import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserSession } from '../modules/auth';

interface SidebarProps {
  session: UserSession;
  role: 'student' | 'parent' | 'admin';
}

interface NavItem {
  icon: string;
  label: string;
  section: string;
}

const navItems: Record<string, NavItem[]> = {
  student: [
    { icon: '📊', label: 'Dashboard', section: 'dashboard' },
    { icon: '📅', label: 'Timetable', section: 'timetable' },
    { icon: '📍', label: 'Geofence', section: 'geofence' },
    { icon: '📈', label: 'Analytics', section: 'analytics' },
    { icon: '🔔', label: 'Notifications', section: 'notifications' },
    { icon: '⚙️', label: 'Settings', section: 'settings' },
  ],
  parent: [
    { icon: '📊', label: 'Dashboard', section: 'dashboard' },
    { icon: '👦', label: 'Child Status', section: 'child-status' },
    { icon: '🔔', label: 'Alerts', section: 'alerts' },
    { icon: '📅', label: 'Timetable', section: 'timetable' },
    { icon: '📈', label: 'Attendance', section: 'attendance' },
    { icon: '📞', label: 'Contact', section: 'contact' },
    { icon: '⚙️', label: 'Settings', section: 'settings' },
  ],
  admin: [
    { icon: '📊', label: 'Dashboard', section: 'dashboard' },
    { icon: '👥', label: 'Students', section: 'students' },
    { icon: '📅', label: 'Timetable', section: 'timetable' },
    { icon: '📍', label: 'Geofence', section: 'geofence' },
    { icon: '📈', label: 'Analytics', section: 'analytics' },
    { icon: '🔔', label: 'Alerts', section: 'alerts' },
    { icon: '⚙️', label: 'Settings', section: 'settings' },
  ],
};

const roleLabels: Record<string, string> = {
  student: 'Student Portal',
  parent: 'Parent Portal',
  admin: 'Admin Panel',
};

const avatarGradients: Record<string, string> = {
  student: 'var(--gradient-blue)',
  parent: 'var(--gradient-green)',
  admin: 'var(--gradient-purple)',
};

export default function Sidebar({ session, role }: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');

  const initials = session.name.split(' ').map(n => n[0]).join('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = (section: string) => {
    setActiveItem(section);
    setIsOpen(false);

    // Scroll to relevant section on the same page
    if (section === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Try to find a matching element on the page to scroll to
    const sectionMap: Record<string, string[]> = {
      // Student Dashboard sections
      'timetable': ['.panel-header h3'],
      'geofence': ['.geofence-status'],
      'analytics': ['.stat-cards', '.attendance-ring-container'],
      'notifications': ['.activity-feed'],
      'settings': ['.dashboard-header'],
      // Parent Dashboard sections
      'child-status': ['.checkin-log-panel'],
      'alerts': ['.alert-item'],
      'attendance': ['.attendance-ring-container'],
      'contact': ['.card-icon.green'],
      // Admin Dashboard sections
      'students': ['.data-table'],
    };

    const selectors = sectionMap[section] || [];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle sidebar">☰</button>
      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        <div className="sidebar-brand">📡 StudentSync</div>
        <div className="sidebar-role">{roleLabels[role]}</div>

        <ul className="sidebar-nav">
          {navItems[role].map((item) => (
            <li key={item.section}>
              <a
                href="#"
                className={activeItem === item.section ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleNavClick(item.section); }}
              >
                <span className="nav-icon">{item.icon}</span> {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar" style={{ background: avatarGradients[role] }}>{initials}</div>
            <div className="sidebar-user-info">
              <div className="name">{session.name}</div>
              <div className="email">{session.email}</div>
            </div>
          </div>
          <button className="btn-secondary-ss btn-sm mt-1" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
