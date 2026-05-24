import { Auth } from './auth';
import type { Notification } from './auth';

export function getAllNotifications(role?: string): Notification[] {
  const all: Notification[] = JSON.parse(localStorage.getItem('ss_notifications') || '[]');
  return role ? all.filter(n => n.role === role || n.role === 'all') : all;
}

export function subscribeToNotifications(role: string | undefined, callback: (notifications: Notification[]) => void): () => void {
  const fetchAndCallback = () => {
    callback(getAllNotifications(role));
  };

  // Initial fetch
  fetchAndCallback();

  // Same-tab updates
  window.addEventListener('ss_notification_updated', fetchAndCallback);
  
  // Cross-tab updates
  const storageListener = (e: StorageEvent) => {
    if (e.key === 'ss_notifications') fetchAndCallback();
  };
  window.addEventListener('storage', storageListener);

  return () => {
    window.removeEventListener('ss_notification_updated', fetchAndCallback);
    window.removeEventListener('storage', storageListener);
  };
}

export function generateParentAlerts(childName?: string): void {
  const existing = getAllNotifications('parent');
  // Only generate demo alerts if no real alerts exist yet
  if (existing.length > 3) return;

  const name = childName || 'Your child';
  const alerts = [
    { title: 'Campus Entry', message: `${name} entered campus at 8:45 AM` },
    { title: 'Lecture Attended', message: `${name} attended Data Structures at 9:00 AM` },
    { title: 'Lecture Attended', message: `${name} attended DBMS at 10:00 AM` },
    { title: 'Absence Alert', message: `${name} missed Operating Systems at 11:15 AM` },
    { title: 'Campus Exit', message: `${name} left campus at 3:15 PM` }
  ];

  alerts.forEach(a => {
    Auth.addNotification('parent', a.title, a.message);
  });
}

export function getAlertIcon(title: string): string {
  const iconMap: Record<string, string> = {
    'Campus Entry': '🟢',
    'Campus Exit': '🔴',
    'Lecture Attended': '✅',
    'Absence Alert': '⚠️',
    'Login successful': '🔐',
    'System Alert': '🔔',
    'Child Check-In': '📥',
    'Child Check-Out': '📤',
    'Checked In': '📥',
    'Checked Out': '📤',
    'Student Check-In': '📥',
    'Student Check-Out': '📤',
  };
  return iconMap[title] || '📌';
}
