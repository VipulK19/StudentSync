import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'student' | 'parent'>('student');
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    studentId: '', year: '3rd Year', department: 'CSBS',
    childId: '',
    password: '', confirm: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) newErrors.confirm = 'Passwords do not match';
    if (selectedRole === 'student' && !form.studentId.trim()) newErrors.studentId = 'Student ID is required';
    if (selectedRole === 'parent' && !form.childId.trim()) newErrors.childId = "Child's Student ID is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMsg('');

    const userData: Record<string, string> = {
      role: selectedRole, name: form.name, email: form.email,
      phone: form.phone, password: form.password
    };

    if (selectedRole === 'student') {
      userData.studentId = form.studentId;
      userData.department = form.department;
      userData.year = form.year;
    } else {
      userData.childStudentId = form.childId;
    }

    try {
      const result = await register(userData);
      if (result.success) {
        setSuccessMsg(result.message);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setErrors({ form: result.message });
      }
    } catch {
      setErrors({ form: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <span className="auth-logo">📡 StudentSync</span>

        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Register as a student or parent</p>
        </div>

        <div className="role-tabs">
          {(['student', 'parent'] as const).map(role => (
            <button
              key={role}
              className={`role-tab${selectedRole === role ? ' active' : ''}`}
              onClick={() => setSelectedRole(role)}
              disabled={loading}
            >
              {role === 'student' ? '🎓 Student' : '👨‍👩‍👧 Parent'}
            </button>
          ))}
        </div>

        {/* Success Message */}
        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            color: '#10b981',
            fontSize: '0.9rem',
            lineHeight: 1.5
          }}>
            ✅ {successMsg}
            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
              Redirecting to login page...
            </div>
          </div>
        )}

        {/* Form-level Error */}
        {errors.form && (
          <div className="form-error" style={{ display: 'block', marginBottom: '1rem' }}>
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input type="text" id="reg-name" className="form-input" placeholder="Enter your full name" required value={form.name} onChange={e => update('name', e.target.value)} disabled={loading} />
            {errors.name && <div className="form-error" style={{ display: 'block' }}>{errors.name}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <input type="email" id="reg-email" className="form-input" placeholder="you@email.com" required value={form.email} onChange={e => update('email', e.target.value)} disabled={loading} />
              {errors.email && <div className="form-error" style={{ display: 'block' }}>{errors.email}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="reg-phone">Phone Number</label>
              <input type="tel" id="reg-phone" className="form-input" placeholder="+91 XXXXX XXXXX" required value={form.phone} onChange={e => update('phone', e.target.value)} disabled={loading} />
            </div>
          </div>

          {/* Student-specific fields */}
          {selectedRole === 'student' && (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="reg-student-id">Student ID</label>
                  <input type="text" id="reg-student-id" className="form-input" placeholder="e.g. STU2024001" value={form.studentId} onChange={e => update('studentId', e.target.value)} disabled={loading} />
                  {errors.studentId && <div className="form-error" style={{ display: 'block' }}>{errors.studentId}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="reg-year">Year</label>
                  <select id="reg-year" className="form-select" value={form.year} onChange={e => update('year', e.target.value)} disabled={loading}>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="reg-department">Department</label>
                <select id="reg-department" className="form-select" value={form.department} onChange={e => update('department', e.target.value)} disabled={loading}>
                  <option value="CSBS">Computer Science & Business Systems (CSBS)</option>
                  <option value="CS">Computer Science & Engineering</option>
                  <option value="IT">Information Technology</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="Civil">Civil Engineering</option>
                  <option value="E&TC">Electronics & Telecommunication</option>
                </select>
              </div>
            </div>
          )}

          {/* Parent-specific fields */}
          {selectedRole === 'parent' && (
            <div className="form-group">
              <label htmlFor="reg-child-id">Child's Student ID</label>
              <input type="text" id="reg-child-id" className="form-input" placeholder="Enter your child's Student ID (e.g. STU2024001)" value={form.childId} onChange={e => update('childId', e.target.value)} disabled={loading} />
              {errors.childId && <div className="form-error" style={{ display: 'block' }}>{errors.childId}</div>}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input type="password" id="reg-password" className="form-input" placeholder="Min 6 characters" required value={form.password} onChange={e => update('password', e.target.value)} disabled={loading} />
              {errors.password && <div className="form-error" style={{ display: 'block' }}>{errors.password}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="reg-confirm">Confirm Password</label>
              <input type="password" id="reg-confirm" className="form-input" placeholder="Repeat password" required value={form.confirm} onChange={e => update('confirm', e.target.value)} disabled={loading} />
              {errors.confirm && <div className="form-error" style={{ display: 'block' }}>{errors.confirm}</div>}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary-ss mt-2"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite', display: 'inline-block'
                }} />
                Creating Account...
              </span>
            ) : 'Create Account →'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
          <br /><br />
          <Link to="/" style={{ fontSize: '0.8rem' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
