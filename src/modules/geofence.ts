import { CONFIG } from '../config/constants';
import { Auth } from './auth';

export interface GeofenceStatus {
  inside: boolean;
  distance: number;
  lastUpdate: string;
  lat?: number;
  lng?: number;
  accuracy?: number;
  simulated?: boolean;
  state: 'tracking' | 'loading' | 'unavailable' | 'demo';
}

let currentStatus: GeofenceStatus = {
  inside: false,
  distance: 0,
  lastUpdate: new Date().toISOString(),
  state: 'loading',
};
let watchId: number | null = null;
let pollingId: ReturnType<typeof setInterval> | null = null;

// Event listeners for status changes
type GeofenceListener = (status: GeofenceStatus) => void;
const listeners: Set<GeofenceListener> = new Set();

/**
 * Load admin-saved campus config from localStorage.
 * This fixes the bug where admin config changes were not applied to the geofence module.
 */
function loadCampusConfig(): { lat: number; lng: number; radius: number } {
  try {
    const saved = localStorage.getItem('ss_campus_config');
    if (saved) {
      const c = JSON.parse(saved);
      // Also update the in-memory CONFIG so all modules stay in sync
      if (c.lat && c.lng && c.radius) {
        CONFIG.campus.lat = c.lat;
        CONFIG.campus.lng = c.lng;
        CONFIG.campus.radius = c.radius;
      }
      return { lat: c.lat, lng: c.lng, radius: c.radius };
    }
  } catch { /* ignore parse errors */ }
  return { lat: CONFIG.campus.lat, lng: CONFIG.campus.lng, radius: CONFIG.campus.radius };
}

/**
 * Vincenty formula for geodesic distance on WGS-84 ellipsoid.
 * More accurate than Haversine at short distances (campus-scale).
 * Returns distance in meters.
 */
function vincentyDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const a = 6378137.0;            // WGS-84 semi-major axis (meters)
  const f = 1 / 298.257223563;    // WGS-84 flattening
  const b = a * (1 - f);          // semi-minor axis

  const toRad = (deg: number) => deg * Math.PI / 180;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const L = toRad(lng2 - lng1);

  const U1 = Math.atan((1 - f) * Math.tan(phi1));
  const U2 = Math.atan((1 - f) * Math.tan(phi2));

  const sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
  const sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);

  let lambda = L;
  let prevLambda: number;
  let iterLimit = 100;

  let sinSigma: number, cosSigma: number, sigma: number;
  let sinAlpha: number, cos2Alpha: number, cos2SigmaM: number;
  let C: number;

  do {
    const sinLambda = Math.sin(lambda);
    const cosLambda = Math.cos(lambda);

    sinSigma = Math.sqrt(
      (cosU2 * sinLambda) ** 2 +
      (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) ** 2
    );

    if (sinSigma === 0) return 0; // co-incident points

    cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
    sigma = Math.atan2(sinSigma, cosSigma);
    sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
    cos2Alpha = 1 - sinAlpha ** 2;
    cos2SigmaM = cos2Alpha !== 0
      ? cosSigma - 2 * sinU1 * sinU2 / cos2Alpha
      : 0;
    C = f / 16 * cos2Alpha * (4 + f * (4 - 3 * cos2Alpha));

    prevLambda = lambda;
    lambda = L + (1 - C) * f * sinAlpha *
      (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM ** 2)));
  } while (Math.abs(lambda - prevLambda) > 1e-12 && --iterLimit > 0);

  if (iterLimit === 0) {
    // Fallback to Haversine if Vincenty doesn't converge (antipodal points)
    return haversineDistance(lat1, lng1, lat2, lng2);
  }

  const uSq = cos2Alpha! * (a ** 2 - b ** 2) / (b ** 2);
  const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
  const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

  const deltaSigma = B * sinSigma! * (cos2SigmaM! + B / 4 * (
    cosSigma! * (-1 + 2 * cos2SigmaM! ** 2) -
    B / 6 * cos2SigmaM! * (-3 + 4 * sinSigma! ** 2) * (-3 + 4 * cos2SigmaM! ** 2)
  ));

  return b * A * (sigma! - deltaSigma);
}

/** Haversine fallback for antipodal points */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function notifyListeners(status: GeofenceStatus) {
  listeners.forEach(fn => {
    try { fn(status); } catch { /* ignore */ }
  });
}

/** Minimum GPS accuracy we consider usable (meters). Readings worse than this are ignored. */
const MAX_ACCEPTABLE_ACCURACY = 150;

function processPosition(lat: number, lng: number, accuracy?: number) {
  // Reject inaccurate readings
  if (accuracy !== undefined && accuracy > MAX_ACCEPTABLE_ACCURACY) {
    console.warn(`[Geofence] GPS accuracy ${Math.round(accuracy)}m exceeds ${MAX_ACCEPTABLE_ACCURACY}m threshold — ignoring reading`);
    return;
  }

  const campus = loadCampusConfig();
  const distance = vincentyDistance(lat, lng, campus.lat, campus.lng);
  const wasInside = currentStatus.state === 'tracking' ? currentStatus.inside : null;
  const inside = distance <= campus.radius;

  // Send notifications on boundary transitions
  if (wasInside !== null && wasInside !== inside) {
    if (inside) {
      Auth.addNotification('parent', 'Campus Entry', `Student entered campus at ${new Date().toLocaleTimeString()}`);
    } else {
      Auth.addNotification('parent', 'Campus Exit', `Student left campus at ${new Date().toLocaleTimeString()}`);
    }
  }

  currentStatus = {
    inside,
    distance: Math.round(distance),
    lastUpdate: new Date().toISOString(),
    lat,
    lng,
    accuracy: accuracy ? Math.round(accuracy) : undefined,
    state: 'tracking',
  };

  localStorage.setItem('ss_geofence', JSON.stringify(currentStatus));
  notifyListeners(currentStatus);
}

function handleGeoError(error: GeolocationPositionError) {
  console.warn('[Geofence] Geolocation error:', error.message);

  // Only update to unavailable if we haven't gotten a good reading yet
  if (currentStatus.state === 'loading') {
    currentStatus = {
      inside: false,
      distance: 0,
      lastUpdate: new Date().toISOString(),
      state: 'unavailable',
    };
    localStorage.setItem('ss_geofence', JSON.stringify(currentStatus));
    notifyListeners(currentStatus);
  }
}

export const Geofence = {
  startTracking() {
    // Load any previously saved status so UI isn't blank
    const saved = localStorage.getItem('ss_geofence');
    if (saved) {
      try {
        currentStatus = JSON.parse(saved);
      } catch { /* ignore */ }
    } else {
      // Initial loading state
      currentStatus = {
        inside: false,
        distance: 0,
        lastUpdate: new Date().toISOString(),
        state: 'loading',
      };
    }
    notifyListeners(currentStatus);

    if (!navigator.geolocation) {
      currentStatus = {
        inside: false,
        distance: 0,
        lastUpdate: new Date().toISOString(),
        state: 'unavailable',
      };
      localStorage.setItem('ss_geofence', JSON.stringify(currentStatus));
      notifyListeners(currentStatus);
      return;
    }

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => processPosition(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
      handleGeoError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Continuous tracking
    watchId = navigator.geolocation.watchPosition(
      (pos) => processPosition(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
      handleGeoError,
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 15000 }
    );

    // Poll localStorage every 5s for cross-tab sync
    pollingId = setInterval(() => {
      const data = localStorage.getItem('ss_geofence');
      if (data) {
        try {
          const parsed = JSON.parse(data);
          currentStatus = parsed;
          notifyListeners(currentStatus);
        } catch { /* ignore */ }
      }
    }, 5000);
  },

  stopTracking() {
    if (watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    if (pollingId !== null) {
      clearInterval(pollingId);
      pollingId = null;
    }
  },

  getStatus(): GeofenceStatus {
    const data = localStorage.getItem('ss_geofence');
    if (data) {
      try { return JSON.parse(data); } catch { /* ignore */ }
    }
    return { inside: false, distance: 0, lastUpdate: new Date().toISOString(), state: 'loading' };
  },

  /** Subscribe to geofence status changes. Returns an unsubscribe function. */
  onStatusChange(listener: GeofenceListener): () => void {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },

  /** Explicitly enable demo/simulation mode — shows as "Inside Campus" */
  enableDemoMode() {
    const campus = loadCampusConfig();
    currentStatus = {
      inside: true,
      distance: Math.round(campus.radius * 0.24),
      lastUpdate: new Date().toISOString(),
      lat: campus.lat + 0.0005,
      lng: campus.lng + 0.0005,
      simulated: true,
      state: 'demo',
    };
    localStorage.setItem('ss_geofence', JSON.stringify(currentStatus));
    notifyListeners(currentStatus);
  },

  /** Reload campus config from localStorage and re-evaluate current position */
  reloadConfig() {
    loadCampusConfig();
    // If we have a last known real position, re-evaluate it
    if (currentStatus.lat && currentStatus.lng && !currentStatus.simulated) {
      processPosition(currentStatus.lat, currentStatus.lng, currentStatus.accuracy);
    }
  },

  /** Vincenty distance calculation (exposed for testing) */
  calculateDistance: vincentyDistance,
};
