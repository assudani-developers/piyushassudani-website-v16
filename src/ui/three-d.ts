// Real 3D for the showcase chapters, built with CSS 3D transforms so screenshots stay pixel-sharp.
// Each component only animates while it is on screen.

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt));

function watchVisible(el: Element, cb: (v: boolean) => void) {
  new IntersectionObserver((e) => cb(e[0].isIntersecting), { rootMargin: '20% 0px' }).observe(el);
}

/** Swipe / drag support: moves `target` by whole items and snaps on release. */
function draggable(stage: HTMLElement, getStep: () => number, ctl: { target: number; n: number; onDragStart?: () => void }) {
  let x0 = 0, t0 = 0, id = -1, moved = false;
  stage.addEventListener('pointerdown', (e) => {
    id = e.pointerId; x0 = e.clientX; t0 = ctl.target; moved = false;
    ctl.onDragStart?.();
  });
  window.addEventListener('pointermove', (e) => {
    if (e.pointerId !== id) return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 6) moved = true;
    ctl.target = clamp(t0 - dx / getStep(), -0.4, ctl.n - 0.6);
  }, { passive: true });
  const end = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    id = -1;
    const v = ctl.target - t0;
    ctl.target = clamp(Math.round(ctl.target + Math.sign(v) * 0.25), 0, ctl.n - 1);
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
  // a click right after a drag shouldn't open anything
  stage.addEventListener('click', (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
}

/* ------------------------------------------------------------------ */
/* Coverflow: app posters fanned out in depth, the active one faces you */
/* ------------------------------------------------------------------ */

export class Coverflow {
  pos = 0;
  target = 0;
  n: number;
  active = 0;
  private visible = false;
  private tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  onActive?: (i: number) => void;

  constructor(private stage: HTMLElement, private items: HTMLElement[], drag: boolean) {
    this.n = items.length;
    watchVisible(stage, (v) => (this.visible = v));
    if (drag) draggable(stage, () => this.items[0].offsetWidth * 0.95, this);
    stage.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = stage.getBoundingClientRect();
      this.tilt.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      this.tilt.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    stage.addEventListener('pointerleave', () => { this.tilt.tx = 0; this.tilt.ty = 0; });
  }

  update(dt: number) {
    if (!this.visible) return;
    this.pos = damp(this.pos, this.target, 7, dt);
    this.tilt.x = damp(this.tilt.x, this.tilt.tx, 5, dt);
    this.tilt.y = damp(this.tilt.y, this.tilt.ty, 5, dt);
    const w = this.items[0].offsetWidth;
    const near = w * 0.78, far = w * 0.36, depth = w * 0.7;
    this.items.forEach((el, i) => {
      const d = i - this.pos, ad = Math.abs(d), s = Math.sign(d);
      const x = s * (Math.min(ad, 1) * near + Math.max(0, ad - 1) * far);
      const z = -Math.min(ad, 3) * depth;
      const ry = -clamp(d, -1, 1) * 42;
      const front = Math.max(0, 1 - ad);
      const tx = this.tilt.y * -7 * front, ty = this.tilt.x * 9 * front;
      const op = clamp(2.8 - ad, 0, 1);
      el.style.transform = `translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${(ry + ty).toFixed(2)}deg) rotateX(${tx.toFixed(2)}deg)`;
      el.style.opacity = op.toFixed(3);
      el.style.zIndex = String(100 - Math.round(ad * 10));
      el.style.setProperty('--shade', Math.min(1, ad * 0.85).toFixed(3));
      el.style.visibility = op < 0.01 ? 'hidden' : 'visible';
    });
    const a = clamp(Math.round(this.pos), 0, this.n - 1);
    if (a !== this.active) {
      this.items[this.active].classList.remove('on');
      this.items[a].classList.add('on');
      this.active = a;
      this.onActive?.(a);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Arc gallery: site windows mounted on a slowly turning 3D cylinder    */
/* ------------------------------------------------------------------ */

export class ArcGallery {
  pos = 0;
  target = 0;
  n: number;
  active = 0;
  private visible = false;
  onActive?: (i: number) => void;

  constructor(private stage: HTMLElement, private ring: HTMLElement, private items: HTMLElement[], private step: number, drag: boolean) {
    this.n = items.length;
    watchVisible(stage, (v) => (this.visible = v));
    if (drag) draggable(stage, () => this.items[0].offsetWidth * 0.75, this);
    items[0].classList.add('on');
  }

  update(dt: number) {
    if (!this.visible) return;
    this.pos = damp(this.pos, this.target, 6, dt);
    const w = this.items[0].offsetWidth;
    const R = (w * 0.5) / Math.tan(((this.step / 2) * Math.PI) / 180) + w * 0.06;
    this.ring.style.transform = `translateZ(${(-R).toFixed(1)}px)`;
    this.items.forEach((el, i) => {
      const d = i - this.pos;
      const a = d * this.step;
      const vis = Math.abs(a) < 88;
      el.style.visibility = vis ? 'visible' : 'hidden';
      if (!vis) return;
      const lift = Math.max(0, 1 - Math.abs(d)) * w * 0.08;
      el.style.transform = `rotateY(${a.toFixed(2)}deg) translateZ(${(R + lift).toFixed(1)}px)`;
      el.style.opacity = clamp(1 - (Math.abs(a) - 45) / 40, 0, 1).toFixed(3);
      el.style.setProperty('--shade', Math.min(1, Math.abs(d) * 0.7).toFixed(3));
    });
    const act = clamp(Math.round(this.pos), 0, this.n - 1);
    if (act !== this.active) {
      this.items[this.active].classList.remove('on');
      this.items[act].classList.add('on');
      this.active = act;
      this.onActive?.(act);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Skill orbit: the toolkit as a slowly spinning 3D sphere of chips     */
/* ------------------------------------------------------------------ */

export class SkillOrbit {
  private pts: { x: number; y: number; z: number }[];
  private rx = -0.25;
  private ry = 0;
  private vx = 0;
  private vy = 0.22;
  private visible = false;
  private dragging = false;

  constructor(private stage: HTMLElement, private chips: HTMLElement[]) {
    const n = chips.length;
    // Fibonacci sphere: even spread
    this.pts = chips.map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = i * Math.PI * (3 - Math.sqrt(5));
      return { x: Math.cos(t) * r, y, z: Math.sin(t) * r };
    });
    watchVisible(stage, (v) => (this.visible = v));
    let px = 0, py = 0, id = -1;
    stage.addEventListener('pointerdown', (e) => { id = e.pointerId; px = e.clientX; py = e.clientY; this.dragging = true; });
    window.addEventListener('pointermove', (e) => {
      if (e.pointerId === id) {
        this.vy = (e.clientX - px) * 0.25; this.vx = -(e.clientY - py) * 0.25;
        px = e.clientX; py = e.clientY;
      } else if (e.pointerType === 'mouse' && !this.dragging) {
        const r = stage.getBoundingClientRect();
        if (e.clientY > r.top && e.clientY < r.bottom) this.vx = ((e.clientY - r.top) / r.height - 0.5) * -0.5;
      }
    }, { passive: true });
    const up = (e: PointerEvent) => { if (e.pointerId === id) { id = -1; this.dragging = false; } };
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  update(dt: number) {
    if (!this.visible) return;
    if (!this.dragging) { this.vy = damp(this.vy, 0.22, 1.2, dt); this.vx = damp(this.vx, 0, 1.2, dt); }
    this.ry += this.vy * dt;
    this.rx = clamp(this.rx + this.vx * dt, -0.9, 0.9);
    const R = this.stage.offsetWidth * 0.38;
    const cy = Math.cos(this.ry), sy = Math.sin(this.ry), cx = Math.cos(this.rx), sx = Math.sin(this.rx);
    this.chips.forEach((el, i) => {
      const p = this.pts[i];
      const x1 = p.x * cy + p.z * sy, z1 = -p.x * sy + p.z * cy;
      const y2 = p.y * cx - z1 * sx, z2 = p.y * sx + z1 * cx;
      const k = (z2 + 1) / 2; // 0 back .. 1 front
      const s = 0.62 + k * 0.5;
      el.style.transform = `translate3d(${(x1 * R).toFixed(1)}px,${(y2 * R).toFixed(1)}px,0) translate(-50%,-50%) scale(${s.toFixed(3)})`;
      el.style.opacity = (0.28 + k * 0.72).toFixed(3);
      el.style.zIndex = String(Math.round(k * 100));
    });
  }
}

/* ------------------------------------------------------------------ */
/* Company structure: layers in depth that turn with the pointer        */
/* ------------------------------------------------------------------ */

export class DepthTilt {
  private visible = false;
  private t = 0;
  private cur = { x: 0, y: 0 };
  private tgt = { x: 0, y: 0 };
  private hover = false;

  constructor(private stage: HTMLElement, private scene: HTMLElement) {
    watchVisible(stage, (v) => (this.visible = v));
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      this.tgt.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      this.tgt.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      this.hover = true;
    });
    stage.addEventListener('pointerleave', () => { this.hover = false; });
  }

  update(dt: number) {
    if (!this.visible) return;
    this.t += dt;
    // idle: a slow orbit so the depth always reads; pointer takes over on hover
    const ix = this.hover ? this.tgt.x : Math.sin(this.t * 0.45) * 0.7;
    const iy = this.hover ? this.tgt.y : Math.cos(this.t * 0.35) * 0.35;
    this.cur.x = damp(this.cur.x, ix, 4, dt);
    this.cur.y = damp(this.cur.y, iy, 4, dt);
    this.scene.style.setProperty('--ry', `${(-10 + this.cur.x * 9).toFixed(2)}deg`);
    this.scene.style.setProperty('--rx', `${(8 - this.cur.y * 6).toFixed(2)}deg`);
  }
}
