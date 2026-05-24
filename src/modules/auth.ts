import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, serverTimestamp,
  collection, query, getDocs, orderBy, limit,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { sendWelcomeEmail } from './emailService';

export interface UserSession {
  email: string;
  name: string;
  role: string;
  loggedIn: boolean;
  loginTime: string;
  uid?: string;
  id?: string;
  studentId?: string;
  phone?: string;
  department?: string;
  year?: string;
  childId?: string;
  childName?: string;
}

export interface Notification {
  id: number;
  role: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

/** Map Firebase auth error codes to user-friendly messages */
function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered. Please login instead.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
  };
  return messages[code] || 'An error occurred. Please try again.';
}

export const Auth = {
  /** Register a new user with Firebase Auth + Firestore profile */
  async register(userData: Record<string, string>): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Create Firebase Auth user
      const cred = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const uid = cred.user.uid;

      // 2. Build profile for Firestore
      const profile: Record<string, unknown> = {
        email: userData.email,
        name: userData.name,
        phone: userData.phone || '',
        role: userData.role,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };

      if (userData.role === 'student') {
        profile.studentId = userData.studentId || '';
        profile.department = userData.department || '';
        profile.year = userData.year || '';
      } else if (userData.role === 'parent') {
        profile.childStudentId = userData.childStudentId || '';
      }

      // 3. Save user profile to Firestore
      await setDoc(doc(db, 'users', uid), profile);

      // 4. If student, also create a student record
      if (userData.role === 'student' && userData.studentId) {
        await setDoc(doc(db, 'students', userData.studentId), {
          uid,
          name: userData.name,
          email: userData.email,
          department: userData.department || '',
          year: userData.year || '',
          phone: userData.phone || '',
          attendance: 0,
          status: 'absent',
          createdAt: serverTimestamp(),
        });
      }

      // 5. If parent, try to find child's name from students collection
      if (userData.role === 'parent' && userData.childStudentId) {
        const childDoc = await getDoc(doc(db, 'students', userData.childStudentId));
        if (childDoc.exists()) {
          await setDoc(doc(db, 'users', uid), {
            childName: childDoc.data().name,
          }, { merge: true });
        }
      }

      // 6. Send welcome email with credentials
      const emailResult = await sendWelcomeEmail({
        to: userData.email,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        studentId: userData.studentId,
        department: userData.department,
        year: userData.year,
      });

      // 7. Sign out so user goes to login page
      await signOut(auth);

      // 8. Build success message based on email delivery status
      let successMsg = 'Registration successful! ';
      if (emailResult.sent) {
        successMsg += 'A confirmation email with your login credentials has been sent. Please check your inbox and login.';
      } else {
        successMsg += `Your login credentials are: Email: ${userData.email}. Please login with the password you set during registration.`;
      }

      return { success: true, message: successMsg };
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      return {
        success: false,
        message: getAuthErrorMessage(firebaseError.code || '') || firebaseError.message || 'Registration failed.',
      };
    }
  },

  /** Login with Firebase Auth and verify role */
  async login(email: string, password: string, role: string): Promise<{ success: boolean; user?: UserSession; message?: string }> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      // Fetch user profile from Firestore
      const profileDoc = await getDoc(doc(db, 'users', uid));

      if (!profileDoc.exists()) {
        await signOut(auth);
        return { success: false, message: 'User profile not found. Please register first.' };
      }

      const profileData = profileDoc.data();

      // Verify role matches
      if (profileData.role !== role) {
        await signOut(auth);
        return { success: false, message: `This account is registered as a ${profileData.role}, not as a ${role}.` };
      }

      // Update last login
      await setDoc(doc(db, 'users', uid), { lastLogin: serverTimestamp() }, { merge: true });

      // Build session — use uid-based fallback for studentId so new users
      // without a student ID still get unique check-in records
      const session: UserSession = {
        uid,
        email: profileData.email,
        name: profileData.name,
        role: profileData.role,
        loggedIn: true,
        loginTime: new Date().toISOString(),
        id: profileData.studentId || `U-${uid.slice(0, 8)}`,
        phone: profileData.phone || '',
        department: profileData.department || '',
        year: profileData.year || '',
        childId: profileData.childStudentId || '',
        childName: profileData.childName || '',
      };

      // Cache session in localStorage
      localStorage.setItem('ss_session', JSON.stringify(session));
      this.addNotification(role, 'Login successful', `Welcome back, ${session.name}!`);

      return { success: true, user: session };
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      return {
        success: false,
        message: getAuthErrorMessage(firebaseError.code || '') || firebaseError.message || 'Login failed.',
      };
    }
  },

  /** Logout from Firebase and clear session */
  async logout(): Promise<void> {
    await signOut(auth);
    localStorage.removeItem('ss_session');
  },

  /** Get cached session (synchronous) */
  getSession(): UserSession | null {
    const data = localStorage.getItem('ss_session');
    return data ? JSON.parse(data) : null;
  },

  /** Check if user is logged in (synchronous, checks cache) */
  isLoggedIn(): boolean {
    const session = this.getSession();
    return !!(session && session.loggedIn);
  },

  /** Get user profile from Firestore by UID */
  async getUserProfile(uid: string): Promise<UserSession | null> {
    try {
      const profileDoc = await getDoc(doc(db, 'users', uid));
      if (!profileDoc.exists()) return null;

      const data = profileDoc.data();
      return {
        uid,
        email: data.email,
        name: data.name,
        role: data.role,
        loggedIn: true,
        loginTime: new Date().toISOString(),
        id: data.studentId || `U-${uid.slice(0, 8)}`,
        phone: data.phone || '',
        department: data.department || '',
        year: data.year || '',
        childId: data.childStudentId || '',
        childName: data.childName || '',
      };
    } catch {
      return null;
    }
  },

  /** Fetch all students from Firestore */
  async getStudents(): Promise<Array<{ id: string; name: string; dept: string; year: string; attendance: number; status: string; email: string }>> {
    try {
      const q = query(collection(db, 'students'), orderBy('name'), limit(100));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || '',
          dept: data.department || '',
          year: data.year || '',
          attendance: data.attendance || 0,
          status: data.status || 'absent',
          email: data.email || '',
        };
      });
    } catch {
      return [];
    }
  },

  /** Find student by ID (for parent linking) */
  async findStudent(studentId: string): Promise<{ name: string; email: string } | null> {
    try {
      const studentDoc = await getDoc(doc(db, 'students', studentId));
      if (!studentDoc.exists()) return null;
      const data = studentDoc.data();
      return { name: data.name, email: data.email };
    } catch {
      return null;
    }
  },

  /** Add notification (kept in localStorage for backward compatibility) */
  addNotification(role: string, title: string, message: string) {
    const notifications: Notification[] = JSON.parse(localStorage.getItem('ss_notifications') || '[]');
    notifications.unshift({
      id: Date.now(),
      role,
      title,
      message,
      time: new Date().toISOString(),
      read: false
    });
    if (notifications.length > 50) notifications.length = 50;
    localStorage.setItem('ss_notifications', JSON.stringify(notifications));
    
    // Dispatch custom event to notify listeners in the same window/tab
    window.dispatchEvent(new Event('ss_notification_updated'));
  },

  /** Check if Firestore has any students registered */
  async hasStudents(): Promise<boolean> {
    try {
      const q = query(collection(db, 'students'), limit(1));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch {
      return false;
    }
  },

  /** Search students in Firestore */
  async searchStudents(searchTerm: string): Promise<Array<{ id: string; name: string; dept: string; year: string; attendance: number; status: string; email: string }>> {
    const all = await this.getStudents();
    if (!searchTerm) return all;
    const q = searchTerm.toLowerCase();
    return all.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.dept.toLowerCase().includes(q)
    );
  }
};
