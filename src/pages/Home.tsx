import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function useScrollAnimations() {
  useEffect(() => {
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
    return () => observer.disconnect();
  }, []);
}

function useCounters() {
  useEffect(() => {
    const counters = document.querySelectorAll<HTMLElement>('[data-count]');
    if (counters.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const target = parseInt(el.dataset.count || '0');
          let current = 0;
          const increment = target / 60;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = Math.round(current).toString();
            if (el.dataset.suffix) el.textContent += el.dataset.suffix;
          }, 20);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function Home() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useScrollAnimations();
  useCounters();

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 10 + 8) + 's';
      particle.style.animationDelay = (Math.random() * 5) + 's';
      particle.style.opacity = String(Math.random() * 0.3);
      const colors = ['var(--accent-blue)', 'var(--accent-purple)', 'var(--accent-cyan)'];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      container.appendChild(particle);
    }
    return () => { container.innerHTML = ''; };
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="particles" ref={particlesRef}></div>
        <div className="hero-content">
          <span className="hero-badge">🎓 Next-Gen Attendance System</span>
          <h1>Smart Student <span className="gradient-text">Attendance</span> Monitoring</h1>
          <p>Automated attendance verification using geofencing and proximity-based technologies. Real-time tracking, instant alerts, and comprehensive analytics.</p>
          <div className="hero-buttons">
            <Link to="/login" className="btn-primary-ss">Get Started →</Link>
            <Link to="/about" className="btn-secondary-ss">Learn More</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="section-header animate-in">
          <span className="section-tag">Features</span>
          <h2>Everything You Need</h2>
          <p>A comprehensive solution for automated attendance management with real-time monitoring capabilities.</p>
        </div>
        <div className="features-grid">
          <div className="glass-card animate-in">
            <div className="card-icon blue">📍</div>
            <h3>GPS Geofencing</h3>
            <p>Automatic campus boundary detection using GPS to verify student presence on campus grounds.</p>
          </div>
          <div className="glass-card animate-in">
            <div className="card-icon green">🔔</div>
            <h3>Parent Alerts</h3>
            <p>Real-time entry/exit notifications and absence alerts delivered instantly to parents.</p>
          </div>
          <div className="glass-card animate-in">
            <div className="card-icon purple">🔐</div>
            <h3>Multi-Factor Verification</h3>
            <p>Combines location, time, and schedule data for accurate, tamper-proof attendance records.</p>
          </div>
          <div className="glass-card animate-in">
            <div className="card-icon orange">📊</div>
            <h3>Analytics Dashboard</h3>
            <p>Department-wise and individual attendance analytics with trend visualization and reports.</p>
          </div>
          <div className="glass-card animate-in">
            <div className="card-icon red">🚫</div>
            <h3>Anti-Proxy System</h3>
            <p>Eliminates proxy attendance through location-aware verification that cannot be spoofed.</p>
          </div>
          <div className="glass-card animate-in">
            <div className="card-icon cyan">🛡️</div>
            <h3>Ethical Tracking</h3>
            <p>Consent-based access with time-restricted monitoring that respects student privacy.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="section-header animate-in">
          <span className="section-tag">How It Works</span>
          <h2>Simple &amp; Automated</h2>
          <p>Four simple steps to transform attendance management at your institution.</p>
        </div>
        <div className="steps-container animate-in">
          <div className="step-card">
            <div className="step-number">1</div>
            <h4>Student Registers</h4>
            <p>Student creates an account and enables location services on their device.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h4>Geofence Activates</h4>
            <p>The system detects campus entry/exit automatically using GPS boundaries.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h4>Attendance Logged</h4>
            <p>Lecture attendance is verified by matching location data with the timetable schedule.</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h4>Alerts &amp; Reports</h4>
            <p>Parents receive real-time updates and institutions get comprehensive analytics.</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section">
        <div className="stats-section animate-in">
          <div className="stat-item">
            <h3 data-count="98" data-suffix="%">0</h3>
            <p>Accuracy Rate</p>
          </div>
          <div className="stat-item">
            <h3 data-count="500" data-suffix="+">0</h3>
            <p>Students Tracked</p>
          </div>
          <div className="stat-item">
            <h3 data-count="50" data-suffix="ms">0</h3>
            <p>Alert Latency</p>
          </div>
          <div className="stat-item">
            <h3 data-count="0">0</h3>
            <p>Proxy Incidents</p>
          </div>
        </div>
      </section>

      {/* Three Interfaces */}
      <section className="section">
        <div className="section-header animate-in">
          <span className="section-tag">Interfaces</span>
          <h2>Built for Everyone</h2>
          <p>Three dedicated interfaces designed for students, parents, and administrators.</p>
        </div>
        <div className="features-grid">
          <div className="glass-card animate-in" style={{ borderTop: '3px solid var(--accent-blue)' }}>
            <div className="card-icon blue">🎓</div>
            <h3>Student App</h3>
            <p>Background GPS tracking, timetable view, geofence status, and personal attendance analytics in one dashboard.</p>
            <Link to="/login" className="btn-primary-ss btn-sm mt-2">Student Login →</Link>
          </div>
          <div className="glass-card animate-in" style={{ borderTop: '3px solid var(--accent-green)' }}>
            <div className="card-icon green">👨‍👩‍👧</div>
            <h3>Parent Dashboard</h3>
            <p>Real-time campus status, entry/exit alerts, lecture attendance breakdown, and direct contact with the institution.</p>
            <Link to="/login" className="btn-success-ss btn-primary-ss btn-sm mt-2">Parent Login →</Link>
          </div>
          <div className="glass-card animate-in" style={{ borderTop: '3px solid var(--accent-purple)' }}>
            <div className="card-icon purple">⚙️</div>
            <h3>Admin Panel</h3>
            <p>Timetable management, geofence configuration, student records, department analytics, and alert management.</p>
            <Link to="/login" className="btn-primary-ss btn-sm mt-2" style={{ background: 'var(--gradient-purple)' }}>Admin Login →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="animate-in">Ready to Transform <span className="gradient-text">Attendance?</span></h2>
        <p className="animate-in">Join the future of smart campus management with StudentSync.</p>
        <div className="cta-buttons animate-in">
          <Link to="/register" className="btn-primary-ss">Create Account →</Link>
          <Link to="/about" className="btn-secondary-ss">Read Documentation</Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
