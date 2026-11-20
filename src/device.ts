// Mobile and desktop are two different experiences, decided once at boot.
// Crossing the breakpoint on resize reloads into the other experience.
const MQ = '(max-width: 820px), (pointer: coarse) and (max-width: 1100px)';

export const isMobile = window.matchMedia(MQ).matches;
export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const DEVICE = isMobile
  ? { mode: 'mobile' as const, particles: 6500, dpr: Math.min(window.devicePixelRatio, 1.6), bloom: false, pointSize: 1.9 }
  : { mode: 'desktop' as const, particles: 16000, dpr: Math.min(window.devicePixelRatio, 2), bloom: true, pointSize: 1.6 };

export function watchModeChange() {
  const mq = window.matchMedia(MQ);
  mq.addEventListener('change', () => window.location.reload());
}
