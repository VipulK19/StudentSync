import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function About() {
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-in');
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

  return (
    <>
      <Navbar />

      <section className="about-hero">
        <h1 className="animate-in">About <span className="gradient-text">StudentSync</span></h1>
        <p className="animate-in">An integrated digital solution combining location-aware technologies with academic scheduling to automate attendance verification.</p>
      </section>

      {/* Introduction */}
      <section className="section">
        <div className="section-header animate-in">
          <span className="section-tag">Introduction</span>
          <h2>Why StudentSync?</h2>
        </div>
        <div className="glass-card animate-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            With the increasing autonomy granted to students in higher education, institutions face growing challenges in maintaining consistent attendance and academic engagement. Traditional attendance systems such as manual roll calls and biometric scanners are inefficient, time-consuming, and prone to manipulation.
          </p>
          <br />
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            StudentSync introduces an integrated digital solution that combines location-aware technologies with academic scheduling to automate attendance verification. The system consists of three interfaces: a <strong style={{ color: 'var(--accent-blue)' }}>student application</strong> for background tracking, a <strong style={{ color: 'var(--accent-green)' }}>parent dashboard</strong> for monitoring and alerts, and an <strong style={{ color: 'var(--accent-purple)' }}>admin panel</strong> for timetable and system management.
          </p>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="section">
        <div className="section-header animate-in">
          <span className="section-tag">Problem Statement</span>
          <h2>Challenges We Address</h2>
          <p>Existing attendance systems are plagued by inefficiency, inaccuracy, and lack of real-time reporting.</p>
        </div>
        <div className="problems-grid">
          <div className="glass-card animate-in">
            <div className="card-icon orange">⏱️</div>
            <h3>Inefficient Manual Systems</h3>
            <p>Manual roll calls consume valuable lecture time. Faculty spend significant effort maintaining attendance registers. Biometric systems cause long queues.</p>
          </div>
          <div className="glass-card animate-in">
            <div className="card-icon red">🎭</div>
            <h3>Proxy Attendance</h3>
            <p>Students mark attendance for absent classmates. Biometric systems can be misused. Lack of multi-factor verification reduces reliability of records.</p>
          </div>
          <div className="glass-card animate-in">
            <div className="card-icon purple">📵</div>
            <h3>No Real-Time Reporting</h3>
            <p>Parents depend on indirect communication for updates. Institutions lack instant visibility into campus presence and lecture participation patterns.</p>
          </div>
          <div className="glass-card animate-in">
            <div className="card-icon blue">📋</div>
            <h3>Administrative Overhead</h3>
            <p>Institutions struggle with the administrative burden of accurate record-keeping. Data reconciliation between manual and digital systems creates errors.</p>
          </div>
        </div>
      </section>

      {/* Motivation */}
      <section className="section">
        <div className="section-header animate-in">
          <span className="section-tag">Motivation</span>
          <h2>What Drives Us</h2>
        </div>
        <div className="glass-card animate-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            The motivation behind StudentSync stems from increasing concerns related to student absenteeism, lack of accountability, and parental anxiety regarding student safety and academic performance.
          </p>
          <br />
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            Advances in mobile sensors, cloud platforms, and real-time notification systems make it possible to automate attendance monitoring efficiently. StudentSync is motivated by the need for a <strong style={{ color: 'var(--accent-green)' }}>non-intrusive, ethical, and reliable solution</strong> that promotes student responsibility, reduces conflicts between parents and students, and provides institutions with accurate attendance data without increasing workload.
          </p>
        </div>
      </section>

      {/* Objectives */}
      <section className="section">
        <div className="section-header animate-in">
          <span className="section-tag">Objectives</span>
          <h2>Our Goals</h2>
        </div>
        <div className="glass-card animate-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <ul className="objectives-list">
            {[
              { icon: '📍', title: 'Automate Attendance Verification', desc: 'Use geofencing and proximity-based technologies to automatically detect and record student attendance.' },
              { icon: '🔔', title: 'Real-Time Parent Notifications', desc: 'Provide real-time campus entry and exit notifications to parents via the dedicated dashboard.' },
              { icon: '🔐', title: 'Multi-Factor Lecture Detection', desc: 'Detect lecture attendance using multi-factor verification logic combining location, time, and schedule data.' },
              { icon: '⚠️', title: 'Instant Absence Alerts', desc: 'Generate instant alerts in case of absenteeism to both parents and institutional administrators.' },
              { icon: '🚫', title: 'Eliminate Proxy Attendance', desc: 'Completely remove proxy attendance and manual roll-call systems through automated verification.' },
              { icon: '🛡️', title: 'Ethical & Consent-Based Tracking', desc: 'Ensure ethical tracking through consent-based access and time-restricted monitoring during academic hours only.' },
              { icon: '📊', title: 'Accurate Attendance Analytics', desc: 'Provide accurate attendance analytics to institutions for data-driven decision-making and policy enforcement.' },
            ].map((obj, i) => (
              <li key={i}>
                <div className="objective-icon">{obj.icon}</div>
                <div className="objective-text">
                  <h4>{obj.title}</h4>
                  <p>{obj.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Architecture */}
      <section className="section">
        <div className="section-header animate-in">
          <span className="section-tag">Architecture</span>
          <h2>System Design</h2>
          <p>A three-layer architecture designed for scalability, reliability, and real-time performance.</p>
        </div>
        <div className="arch-diagram animate-in">
          <div className="arch-layer">
            <div className="arch-icon">📱</div>
            <h3>Presentation Layer</h3>
            <p>Student App, Parent Dashboard, Admin Panel — responsive web interfaces optimized for all devices.</p>
          </div>
          <div className="arch-layer">
            <div className="arch-icon">⚡</div>
            <h3>Logic Layer</h3>
            <p>Geofencing engine, attendance verification, notification dispatch, and analytics computation modules.</p>
          </div>
          <div className="arch-layer">
            <div className="arch-icon">☁️</div>
            <h3>Data Layer</h3>
            <p>Cloud-based storage for user data, attendance records, geofence configurations, and notification logs.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="animate-in">Experience <span className="gradient-text">StudentSync</span></h2>
        <p className="animate-in">Department of CSBS, KIT College of Engineering, Kolhapur</p>
        <div className="cta-buttons animate-in">
          <Link to="/login" className="btn-primary-ss">Try Demo →</Link>
          <Link to="/" className="btn-secondary-ss">← Back to Home</Link>
        </div>
      </section>

      <footer className="footer-ss">
        <div className="footer-bottom" style={{ paddingTop: 0, border: 'none' }}>
          <span>© 2026 StudentSync — KIT College of Engineering, Kolhapur</span>
          <span>Department of CSBS</span>
        </div>
      </footer>
    </>
  );
}
