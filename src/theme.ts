export type ThemeName = 'light' | 'dark';

/** The page theme follows the sky: dark once night has mostly fallen. */
export function applyTheme(t: ThemeName, phase: string) {
  const root = document.documentElement;
  if (root.dataset.theme !== t) root.dataset.theme = t;
  if (root.dataset.phase !== phase) root.dataset.phase = phase;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#0B0D22' : '#F6E3C8');
}
