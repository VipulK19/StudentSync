import { getAttendanceData } from '../modules/analytics';

export default function AttendanceRing() {
  const data = getAttendanceData();
  const circumference = 2 * Math.PI * 65;
  const offset = circumference - (data.percentage / 100) * circumference;

  let ringColor = 'var(--accent-green)';
  if (data.percentage < 75) ringColor = 'var(--accent-red)';
  else if (data.percentage < 85) ringColor = 'var(--accent-orange)';

  return (
    <div className="attendance-ring">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle className="attendance-ring-bg" cx="80" cy="80" r="65" />
        <circle
          className="attendance-ring-fill"
          cx="80" cy="80" r="65"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ stroke: ringColor }}
        />
      </svg>
      <div className="attendance-ring-text">
        <span className="percentage">{data.percentage}%</span>
        <span className="label">Attendance</span>
      </div>
    </div>
  );
}
