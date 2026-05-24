import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar-ss${scrolled ? ' scrolled' : ''}`} id="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="brand-icon">📡</span> StudentSync
        </NavLink>
        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">☰</button>
        <ul className={`nav-links${mobileOpen ? ' open' : ''}`} id="nav-links">
          <li><NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMobileOpen(false)}>Home</NavLink></li>
          <li><NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMobileOpen(false)}>About</NavLink></li>
          <li><NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMobileOpen(false)}>Register</NavLink></li>
          <li><NavLink to="/login" className="btn-login" onClick={() => setMobileOpen(false)}>Login</NavLink></li>
        </ul>
      </div>
    </nav>
  );
}
