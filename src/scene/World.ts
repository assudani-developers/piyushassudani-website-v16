import * as THREE from 'three';
import { isMobile, reducedMotion } from '../device';
import { clamp, damp, easeInOut } from './helpers';
import { Terrain, Sky, Dust, THEMES, mixWarm, duneH, pathX } from './env';
import type { Piece, FrameCtx } from './pieces/types';
import { ScenicPiece, KitesPiece, LanternsPiece } from './pieces/Scenery';

// Chapter stops along the desert route (z). x and y follow the valley floor.
const STOPS = [0, -140, -265, -385, -500, -640, -760, -870, -980];

// Sun/moon azimuth per chapter (x, z). Elevation comes from the time of day.
const SUN_AZ: [number, number][] = [
  [-0.2, -1], [-0.85, -0.5], [-0.5, -0.85], [0.6, -0.8], [-0.7, -0.7], [-0.6, -0.75], [0.25, -1], [-0.5, -0.9], [0, -1],
];

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);

export class World {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  private terrain: Terrain;
  private sky: Sky;
  private dust: Dust;
  private sun: THREE.DirectionalLight;
  private hemi: THREE.HemisphereLight;
  pieces: Piece[];
  private anchors: THREE.Vector3[];
  private dist: number[] = [];

  target = { c: 0, u: [] as number[] };
  c = 0;
  private u: number[] = [];
  /** time of day, set from main */
  light = { night: 0, warm: 0, elev: 0.6 };
  /** 0..1 boot sunrise */
  intro = 0;
  mouse = new THREE.Vector2();
  private mouseS = new THREE.Vector2();
  private clock = new THREE.Clock();
  private camPos = new THREE.Vector3();
  private camLook = new THREE.Vector3();
  private first = true;
  private sunDir = new THREE.Vector3();
  // scratch vectors (no per-frame allocation)
  private p0 = new THREE.Vector3(); private l0 = new THREE.Vector3();
  private p1 = new THREE.Vector3(); private l1 = new THREE.Vector3();
  private t0 = new THREE.Vector3(); private t1 = new THREE.Vector3(); private t2 = new THREE.Vector3();
  // adaptive resolution
  private dpr: number;
  private readonly maxDpr: number;
  private slow = 0;
  private fast = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.maxDpr = Math.min(window.devicePixelRatio, 1.5);
    this.dpr = this.maxDpr;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, powerPreference: 'high-performance', stencil: false });
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene.fog = new THREE.Fog('#F2CDA2', 70, 330);
    this.camera = new THREE.PerspectiveCamera(isMobile ? 50 : 36, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.sun = new THREE.DirectionalLight('#FFD9A3', 2.6);
    this.hemi = new THREE.HemisphereLight('#CFE0FF', '#E7B47A', 1);
    this.scene.add(this.sun, this.sun.target, this.hemi);

    this.terrain = new Terrain(isMobile);
    this.sky = new Sky(isMobile);
    this.dust = new Dust(isMobile ? 160 : 380);
    this.scene.add(this.sky.mesh, this.sky.stars, this.terrain.mesh, this.dust.points);

    this.anchors = STOPS.map((z) => { const x = pathX(z); return V(x, duneH(x, z), z); });
    const A = this.anchors, m = isMobile;
    const r = this.renderer;
    this.pieces = [
      new ScenicPiece(A[0], 10, V(0, 6, -40), V(0, 0.02, 1), 'center', [[m ? 24 : 26, m ? -85 : -95, 1.4]]),
      new ScenicPiece(A[1], 10, V(0, 4.5, -30), V(0.35, 0.06, 1), 'center', [[m ? -8 : -20, -75, 1.2]]),
      new KitesPiece(r, m),
      new ScenicPiece(A[3], 10, V(0, 5, -40), V(-0.25, 0.04, 1), 'center', [[m ? 10 : 22, -85, 1.1], [-30, -125, 1.3]]),
      new ScenicPiece(A[4], 10, V(0, 4, -35), V(0.45, 0.08, 1), 'center'),
      new ScenicPiece(A[5], 10, V(0, 5, -40), V(-0.3, 0.06, 1), 'center'),
      new LanternsPiece(m),
      new ScenicPiece(A[7], 10, V(0, 5, -45), V(-0.35, 0.05, 1), 'center', [[m ? -12 : -26, -95, 1.3]]),
      new ScenicPiece(A[8], 10, V(0, 6, -60), V(0, 0.03, 1), 'center', [[0, -150, 1.8]]),
    ];
    this.pieces.forEach((p, i) => {
      p.group.position.copy(A[i]);
      this.scene.add(p.group);
      this.u[i] = 0;
      this.target.u[i] = 0;
    });
    this.resize();
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const aspect = this.camera.aspect;
    this.dist = this.pieces.map((p) => {
      const R = p.radius;
      if (p.layout === 'side') {
        return isMobile
          ? Math.max(R / (0.92 * tanHalf * aspect), R / (0.6 * tanHalf))
          : Math.max(R / (0.55 * tanHalf * aspect), R / (0.85 * tanHalf));
      }
      return Math.max(R / (0.95 * tanHalf * aspect), R / (0.85 * tanHalf));
    });
  }

  private keyframe(i: number, u: number, outPos: THREE.Vector3, outLook: THREE.Vector3) {
    const p = this.pieces[i];
    const d = this.dist[i] * (1.05 - 0.1 * u);
    const dir = this.t0.copy(p.view).normalize().applyAxisAngle(UP, (u - 0.5) * (reducedMotion ? 0 : 0.16));
    outLook.copy(this.anchors[i]).add(p.focus);
    outPos.copy(outLook).addScaledVector(dir, d);
    if (p.layout === 'side') {
      const tanHalf = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
      const halfH = d * tanHalf, halfW = halfH * this.camera.aspect;
      const fwd = this.t1.subVectors(outLook, outPos).normalize();
      const right = this.t2.crossVectors(fwd, UP).normalize();
      if (isMobile) {
        const up = fwd.crossVectors(right, fwd).normalize();
        const k = -halfH * 0.3;
        outLook.addScaledVector(up, k); outPos.addScaledVector(up, k);
      } else {
        const k = -halfW * 0.38;
        outLook.addScaledVector(right, k); outPos.addScaledVector(right, k);
      }
    }
  }

  setPointer(x: number, y: number) {
    this.mouse.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
  }

  private applyLight(time: number) {
    const L = THEMES.light, D = THEMES.dark, W = THEMES.warm;
    const n = this.light.night;
    // the warm tint is strongest in twilight, fading as full night arrives
    const w = this.light.warm * (1 - n * 0.55);
    const u = this.sky.uniforms;
    mixWarm(u.uTop.value, L.skyTop, D.skyTop, n, W.skyTop, w * 0.6);
    mixWarm(u.uHorizon.value, L.horizon, D.horizon, n, W.horizon, w);
    mixWarm(u.uSunColor.value, L.sun, D.sun, n, W.sun, w);
    u.uDisc.value = 1 - n;
    u.uGlow.value = (L.glow + (D.glow - L.glow) * n) * (1 - w) + W.glow * w;
    const stars = this.sky.stars.material as THREE.ShaderMaterial;
    stars.uniforms.uOpacity.value = clamp((n - 0.35) / 0.65);
    stars.uniforms.uTime.value = time;
    mixWarm((this.scene.fog as THREE.Fog).color, L.fog, D.fog, n, W.fog, w);
    mixWarm(this.sun.color, L.sun, D.sun, n, W.sun, w);
    this.sun.intensity = (L.sunI + (D.sunI - L.sunI) * n) * (1 - w) + W.sunI * w;
    mixWarm(this.hemi.color, L.hemiSky, D.hemiSky, n, W.hemiSky, w);
    mixWarm(this.hemi.groundColor, L.hemiGround, D.hemiGround, n, W.hemiGround, w);
    this.hemi.intensity = (L.hemiI + (D.hemiI - L.hemiI) * n) * (1 - w) + W.hemiI * w;
    this.terrain.setColors(L, D, n, W, w);
    mixWarm(this.dust.uniforms.uColor.value, L.dust, D.dust, n, W.dust, w);
    this.dust.uniforms.uOpacity.value = 0.22 + n * 0.3;
    this.renderer.toneMappingExposure = L.exposure + (D.exposure - L.exposure) * n;
  }

  /** Lower the render resolution when frames run slow, raise it back when there is headroom. */
  private adapt(dt: number) {
    if (dt > 1 / 45) { this.slow++; this.fast = 0; } else if (dt < 1 / 58) { this.fast++; this.slow = Math.max(0, this.slow - 1); }
    if (this.slow > 20 && this.dpr > 0.75) {
      this.dpr = Math.max(0.75, this.dpr - 0.25);
      this.renderer.setPixelRatio(this.dpr);
      this.slow = 0;
    } else if (this.fast > 240 && this.dpr < this.maxDpr) {
      this.dpr = Math.min(this.maxDpr, this.dpr + 0.25);
      this.renderer.setPixelRatio(this.dpr);
      this.fast = 0;
    }
  }

  frame() {
    const raw = this.clock.getDelta();
    const dt = Math.min(0.05, raw);
    const time = this.clock.elapsedTime;
    const last = this.pieces.length - 1;
    if (!this.first && raw < 0.5) this.adapt(raw);

    this.c = this.first ? this.target.c : damp(this.c, this.target.c, 4.5, dt);
    for (let i = 0; i <= last; i++) this.u[i] = this.first ? this.target.u[i] : damp(this.u[i], this.target.u[i], 5, dt);
    this.mouseS.x = damp(this.mouseS.x, this.mouse.x, 2.5, dt);
    this.mouseS.y = damp(this.mouseS.y, this.mouse.y, 2.5, dt);

    const c = clamp(this.c, 0, last);
    const i0 = Math.floor(c);
    const i1 = Math.min(last, i0 + 1);
    const t = easeInOut(c - i0);
    const night = this.light.night;

    for (let i = 0; i <= last; i++) {
      const p = this.pieces[i];
      const vis = clamp(1 - Math.abs(c - i) * 1.15);
      p.group.visible = vis > 0.002;
      if (!p.group.visible) continue;
      const f: FrameCtx = { time, dt, u: this.u[i], vis, night, camera: this.camera, mouse: this.mouseS, mobile: isMobile };
      p.update(f);
    }

    this.keyframe(i0, this.u[i0], this.p0, this.l0);
    this.keyframe(i1, this.u[i1], this.p1, this.l1);
    const pos = this.p0.lerp(this.p1, t);
    const look = this.l0.lerp(this.l1, t);
    const arc = Math.sin(Math.PI * t);
    pos.y += arc * 8;
    look.y += arc * 3;
    if (i0 === 0) pos.y += (1 - this.intro) * -2 * (1 - t);
    const fwd = this.t1.subVectors(look, pos).normalize();
    const right = this.t2.crossVectors(fwd, UP).normalize();
    pos.addScaledVector(right, this.mouseS.x * 0.7).y += this.mouseS.y * 0.4;
    const ground = duneH(pos.x, pos.z) + 1.6;
    if (pos.y < ground) pos.y = ground;

    if (this.first) { this.camPos.copy(pos); this.camLook.copy(look); this.first = false; }
    else {
      const k = 1 - Math.exp(-7 * dt);
      this.camPos.lerp(pos, k);
      this.camLook.lerp(look, k);
    }
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);

    // the sun sits as high as the clock says; the moon at night hangs higher
    const az0 = SUN_AZ[i0], az1 = SUN_AZ[i1];
    const ax = az0[0] + (az1[0] - az0[0]) * t, az = az0[1] + (az1[1] - az0[1]) * t;
    const dayY = 0.035 + this.light.elev * 0.42;
    let y = dayY + (0.32 - dayY) * night;
    y -= (1 - this.intro) * 0.08 * (i0 === 0 ? 1 - t : 0);
    this.sunDir.set(ax, y, az).normalize();
    this.sky.uniforms.uSunDir.value.copy(this.sunDir);
    this.sun.target.position.copy(this.camLook);
    this.sun.position.copy(this.camLook).addScaledVector(this.sunDir, 100);
    this.applyLight(time);

    this.sky.uniforms.uTime.value = time;
    this.sky.follow(this.camera.position);
    this.terrain.follow(this.camera.position);
    this.dust.uniforms.uTime.value = time;
    this.dust.uniforms.uCam.value.copy(this.camera.position);

    this.renderer.render(this.scene, this.camera);
  }
}
