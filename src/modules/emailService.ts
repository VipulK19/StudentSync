/**
 * Email Service for StudentSync
 * 
 * Uses a dual approach:
 * 1. Primary: Firebase "Trigger Email from Firestore" extension
 *    (writes to `mail` collection, extension sends via SMTP)
 * 2. Fallback: EmailJS (free, no backend needed)
 *    To enable: set your EmailJS credentials in the constants below.
 * 
 * If neither is configured, emails are logged to console for demo purposes.
 */
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

interface EmailData {
  to: string;
  name: string;
  email: string;
  password: string;
  role: string;
  studentId?: string;
  department?: string;
  year?: string;
}

/**
 * EmailJS configuration — set these to enable EmailJS fallback.
 * Get free credentials at https://www.emailjs.com
 * Leave empty to disable EmailJS.
 */
const EMAILJS_CONFIG = {
  publicKey: '',      // e.g. 'abc123XYZ'
  serviceId: '',      // e.g. 'service_xxxxx'
  templateId: '',     // e.g. 'template_xxxxx'
};

/** Build the styled HTML email body */
function buildEmailHtml(data: EmailData): string {
  const loginUrl = `${window.location.origin}/login`;

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; color: #fff;">📡 StudentSync</h1>
        <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Smart Attendance Monitoring System</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #a78bfa; margin-top: 0;">Welcome, ${data.name}! 🎉</h2>
        <p>Your <strong>${data.role === 'student' ? 'Student' : 'Parent'}</strong> account has been created successfully.</p>
        
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #67e8f9; margin-top: 0;">🔐 Your Login Credentials</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #9ca3af; width: 120px;">Login Email:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #fff;">${data.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #9ca3af;">Password:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #fff;">${data.password}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #9ca3af;">Role:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #fff;">${data.role === 'student' ? '🎓 Student' : '👨‍👩‍👧 Parent'}</td>
            </tr>
            ${data.studentId ? `
            <tr>
              <td style="padding: 8px 0; color: #9ca3af;">Student ID:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #fff;">${data.studentId}</td>
            </tr>` : ''}
            ${data.department ? `
            <tr>
              <td style="padding: 8px 0; color: #9ca3af;">Department:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #fff;">${data.department}</td>
            </tr>` : ''}
            ${data.year ? `
            <tr>
              <td style="padding: 8px 0; color: #9ca3af;">Year:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #fff;">${data.year}</td>
            </tr>` : ''}
          </table>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${loginUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
            Login to StudentSync →
          </a>
        </div>

        <p style="color: #9ca3af; font-size: 13px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; margin-bottom: 0;">
          ⚠️ Please change your password after first login for security.<br>
          If you did not create this account, please ignore this email.
        </p>
      </div>
    </div>
  `;
}

/**
 * Try sending via Firebase "Trigger Email" extension (Firestore `mail` collection).
 */
async function sendViaFirestore(data: EmailData, htmlContent: string): Promise<boolean> {
  try {
    await addDoc(collection(db, 'mail'), {
      to: data.to,
      message: {
        subject: `Welcome to StudentSync - Your ${data.role === 'student' ? 'Student' : 'Parent'} Account`,
        html: htmlContent,
      },
      createdAt: serverTimestamp(),
    });
    console.log('[Email] Queued via Firestore for:', data.to);
    return true;
  } catch (error) {
    console.warn('[Email] Firestore mail queue failed:', error);
    return false;
  }
}

/**
 * Try sending via EmailJS (free, no backend).
 * Only works if EMAILJS_CONFIG is properly filled in.
 */
async function sendViaEmailJS(data: EmailData, htmlContent: string): Promise<boolean> {
  if (!EMAILJS_CONFIG.publicKey || !EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId) {
    return false; // EmailJS not configured
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: EMAILJS_CONFIG.templateId,
        user_id: EMAILJS_CONFIG.publicKey,
        template_params: {
          to_email: data.to,
          to_name: data.name,
          subject: `Welcome to StudentSync - Your ${data.role === 'student' ? 'Student' : 'Parent'} Account`,
          html_content: htmlContent,
          message: `Welcome ${data.name}! Your ${data.role} account has been created. Email: ${data.email}, Password: ${data.password}`,
        },
      }),
    });

    if (response.ok) {
      console.log('[Email] Sent via EmailJS to:', data.to);
      return true;
    } else {
      console.warn('[Email] EmailJS returned:', response.status);
      return false;
    }
  } catch (error) {
    console.warn('[Email] EmailJS failed:', error);
    return false;
  }
}

/**
 * Send a welcome email with login credentials after registration.
 * 
 * Strategy:
 * 1. Try Firestore (for Firebase "Trigger Email" extension)
 * 2. If that fails, try EmailJS
 * 3. If both fail, log credentials to console (demo mode)
 * 
 * Returns { sent: boolean, method: string } for the caller to show appropriate UI.
 */
export async function sendWelcomeEmail(data: EmailData): Promise<{ sent: boolean; method: string }> {
  const htmlContent = buildEmailHtml(data);

  // Strategy 1: Firestore
  const firestoreOk = await sendViaFirestore(data, htmlContent);
  if (firestoreOk) {
    return { sent: true, method: 'firestore' };
  }

  // Strategy 2: EmailJS
  const emailjsOk = await sendViaEmailJS(data, htmlContent);
  if (emailjsOk) {
    return { sent: true, method: 'emailjs' };
  }

  // Fallback: Log to console for demo
  console.log('[Email] ====== WELCOME EMAIL (DEMO MODE) ======');
  console.log(`[Email] To: ${data.to}`);
  console.log(`[Email] Name: ${data.name}`);
  console.log(`[Email] Role: ${data.role}`);
  console.log(`[Email] Email: ${data.email}`);
  console.log(`[Email] Password: ${data.password}`);
  if (data.studentId) console.log(`[Email] Student ID: ${data.studentId}`);
  console.log('[Email] ==========================================');

  return { sent: false, method: 'console' };
}
