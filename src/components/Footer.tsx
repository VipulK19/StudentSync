import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-ss">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="navbar-brand" style={{ marginBottom: '0.5rem' }}>
            <span className="brand-icon">📡</span> StudentSync
          </div>
          <p>Smart Student Attendance Monitoring System. Automated attendance verification using geofencing and proximity-based technologies.</p>
          <p style={{ marginTop: '0.5rem' }}>Department of CSBS, KITCoEK</p>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Dashboards</h4>
          <ul>
            <li><Link to="/student-dashboard">Student</Link></li>
            <li><Link to="/parent-dashboard">Parent</Link></li>
            <li><Link to="/admin-dashboard">Admin</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Technology</h4>
          <ul>
            <li><a href="#">GPS Geofencing</a></li>
            <li><a href="#">Real-time Alerts</a></li>
            <li><a href="#">Cloud Platform</a></li>
            <li><a href="#">Analytics Engine</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 StudentSync — KIT College of Engineering, Kolhapur</span>
        <span>Department of CSBS</span>
      </div>
    </footer>
  );
}
