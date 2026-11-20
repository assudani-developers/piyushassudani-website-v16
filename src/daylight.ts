// Time of day drives the whole site: sunrise, day, sunset, evening and night.
// Sunrise/sunset times follow the seasons at Balotra's latitude (approximate, visitor's local clock).

export type Phase = 'sunrise' | 'day' | 'sunset' | 'evening' | 'night';

export interface Daylight {
  /** 0 = full day, 1 = full night */
  night: number;
  /** 0..1 sunrise/sunset glow */
  warm: number;
  /** 0..1 how high the sun stands (day only) */
  elev: number;
  phase: Phase;
}

const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function sunTimes(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0);
  const day = Math.floor((d.getTime() - start.getTime()) / 864e5);
  const k = Math.cos((2 * Math.PI * (day - 172)) / 365); // 1 at midsummer, -1 at midwinter
  return { rise: 6.55 - 0.72 * k, set: 18.55 + 0.85 * k };
}

export function daylightAt(d = new Date()): Daylight {
  const h = d.getHours() + d.getMinutes() / 60;
  const { rise, set } = sunTimes(d);
  // night fades out from 50 min before sunrise to 20 min after; back in from sunset to 75 min after
  const night = h < 12 ? 1 - ss(rise - 0.85, rise + 0.35, h) : ss(set - 0.1, set + 1.25, h);
  const bell = (c: number, w: number) => 1 - ss(0, w, Math.abs(h - c));
  const warm = Math.max(bell(rise + 0.1, 1.1), bell(set - 0.05, 1.3));
  const elev = Math.max(0, Math.sin((Math.PI * (h - rise)) / (set - rise)));
  let phase: Phase = 'day';
  if (night > 0.92) phase = 'night';
  else if (h < 12 && warm > 0.35) phase = 'sunrise';
  else if (h >= 12 && warm > 0.35 && night < 0.45) phase = 'sunset';
  else if (h >= 12 && night >= 0.45) phase = 'evening';
  return { night, warm, elev, phase };
}

/** Fixed looks the visitor can pick instead of the live clock. */
export const PRESETS: Record<Phase, Daylight> = {
  sunrise: { night: 0.12, warm: 1, elev: 0.06, phase: 'sunrise' },
  day: { night: 0, warm: 0, elev: 0.7, phase: 'day' },
  sunset: { night: 0.18, warm: 1, elev: 0.04, phase: 'sunset' },
  evening: { night: 0.7, warm: 0.45, elev: 0, phase: 'evening' },
  night: { night: 1, warm: 0, elev: 0, phase: 'night' },
};

export const PHASE_LABEL: Record<Phase, string> = {
  sunrise: 'Sunrise',
  day: 'Day',
  sunset: 'Sunset',
  evening: 'Evening',
  night: 'Night',
};

export const GREETING: Record<Phase, string> = {
  sunrise: 'Good morning from Balotra',
  day: 'Hello from Balotra',
  sunset: 'Good evening from Balotra',
  evening: 'Good evening from Balotra',
  night: 'Under the stars in Balotra',
};

export function clockLabel(d = new Date()) {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
