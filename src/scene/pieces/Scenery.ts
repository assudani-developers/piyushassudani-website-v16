import * as THREE from 'three';
import type { FrameCtx, Piece } from './types';
import { setOpacity } from './types';
import { glowSprite, sandstone } from '../arch';
import { canvasTexture, makeCanvas, mulberry32, smooth } from '../helpers';
import { duneH } from '../env';

/* The 3D world is scenery: dunes, sky, kites, chhatris and lanterns.
   All portfolio content lives in crisp HTML on top of it. */

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export function chhatri(scale = 1, mat = sandstone()) {
  const g = new THREE.Group();
  const step = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.3, 5.0), mat);
  step.position.y = 0.15;
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.7, 4.4), mat);
  plinth.position.y = 0.35;
  g.add(step, plinth);
  const pillarGeo = new THREE.CylinderGeometry(0.17, 0.2, 3.0, 10);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const p = new THREE.Mesh(pillarGeo, mat);
    p.position.set(sx * 1.6, 2.2, sz * 1.6);
    g.add(p);
  }
  const ent = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.32, 4.2), mat);
  ent.position.y = 3.86;
  const eave = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.12, 4.9), mat);
  eave.position.y = 3.66;
  const prof = [[1.75, 0], [1.8, 0.18], [1.72, 0.7], [1.5, 1.2], [1.12, 1.62], [0.7, 1.95], [0.32, 2.2], [0.12, 2.42], [0.06, 2.62], [0, 2.7]]
    .map(([x, y]) => new THREE.Vector2(x, y));
  const dome = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), mat);
  dome.position.y = 4.02;
  const fin = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.7, 8), mat);
  fin.position.y = 7.0;
  g.add(ent, eave, dome, fin);
  g.scale.setScalar(scale);
  return g;
}

/** Places an object on the dunes, relative to a chapter anchor. */
function onDune(o: THREE.Object3D, anchor: THREE.Vector3, x: number, z: number, sink = 0.3) {
  o.position.set(x, duneH(anchor.x + x, anchor.z + z) - anchor.y - sink, z);
}

/** A chapter with only landscape: the camera frames dunes and sky (optionally a far chhatri). */
export class ScenicPiece implements Piece {
  group = new THREE.Group();
  layout: 'side' | 'center';
  constructor(
    anchor: THREE.Vector3,
    public radius: number,
    public focus: THREE.Vector3,
    public view: THREE.Vector3,
    layout: 'side' | 'center',
    chhatris: [number, number, number][] = [],
  ) {
    this.layout = layout;
    chhatris.forEach(([x, z, s], i) => {
      const c = chhatri(s);
      onDune(c, anchor, x, z);
      c.rotation.y = 0.3 + i;
      this.group.add(c);
    });
  }
  update(f: FrameCtx) {
    setOpacity(this.group, Math.max(0.0001, f.vis));
  }
}

/* ------------------------------ kites (no labels: just the Sankranti sky) ------------------------------ */

const KITE_COLORS: [string, string][] = [
  ['#E8473B', '#F7C843'], ['#2F6FDB', '#F4F1E8'], ['#F08A24', '#7A2E8E'], ['#14A38B', '#F6D365'],
  ['#D9346B', '#FFFFFF'], ['#3A3F9E', '#F28C28'], ['#F2C230', '#1E8F5A'], ['#B3262E', '#F4E3C1'],
];

function kiteTexture(i: number, renderer: THREE.WebGLRenderer) {
  const S = 256;
  const { c, ctx } = makeCanvas(S, S);
  const [a, b] = KITE_COLORS[i % KITE_COLORS.length];
  const T = [S / 2, 0], R = [S, S * 0.45], B = [S / 2, S], L = [0, S * 0.45], C = [S / 2, S * 0.45];
  const tri = (p: number[][], col: string) => {
    ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); p.slice(1).forEach((q) => ctx.lineTo(q[0], q[1])); ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
  };
  if (i % 3 === 0) { tri([T, R, C], a); tri([T, L, C], a); tri([L, B, C], b); tri([R, B, C], b); }
  else if (i % 3 === 1) { tri([T, R, C], a); tri([T, L, C], b); tri([L, B, C], a); tri([R, B, C], b); }
  else { tri([T, R, C], a); tri([T, L, C], a); tri([L, B, C], a); tri([R, B, C], a); ctx.fillStyle = b; ctx.beginPath(); ctx.arc(C[0], C[1], S * 0.15, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(T[0], T[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(L[0], L[1]); ctx.quadraticCurveTo(S / 2, S * 0.25, R[0], R[1]); ctx.stroke();
  return canvasTexture(c, renderer);
}

function kiteGeometry() {
  const v = [[0, 1.25, 0], [1.0, 0.0, 0.18], [0, -1.5, 0], [-1.0, 0.0, 0.18], [0, 0.0, 0.32]];
  const uv = [[0.5, 1], [1, 0.55], [0.5, 0], [0, 0.55], [0.5, 0.55]];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v.flat(), 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv.flat(), 2));
  g.setIndex([0, 4, 1, 0, 3, 4, 3, 2, 4, 4, 2, 1]);
  g.computeVertexNormals();
  return g;
}

export class KitesPiece implements Piece {
  group = new THREE.Group();
  radius: number;
  layout = 'side' as const;
  focus = V(0, 10, 0);
  view = V(0.1, -0.35, 1);
  private kites: { g: THREE.Group; base: THREE.Vector3; phase: number; tail: THREE.Line; string: THREE.Line; anchor: THREE.Vector3 }[] = [];

  constructor(renderer: THREE.WebGLRenderer, mobile: boolean) {
    this.radius = mobile ? 9 : 10;
    const geo = kiteGeometry();
    const r = mulberry32(21);
    const stringMat = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.28 });
    const tailMat = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6 });
    const n = mobile ? 9 : 13;
    for (let i = 0; i < n; i++) {
      const g = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ map: kiteTexture(i, renderer), side: THREE.DoubleSide, roughness: 0.8, emissive: '#ffffff', emissiveIntensity: 0 });
      mat.emissiveMap = mat.map;
      g.add(new THREE.Mesh(geo, mat));
      const tail = new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 10 }, (_, k) => V(0, -1.5 - k * 0.24, 0))), tailMat);
      g.add(tail);
      const base = V((r() - 0.5) * (mobile ? 16 : 30), 3 + r() * (mobile ? 13 : 14), (r() - 0.5) * 16 - 4);
      const s = 0.55 + r() * 0.7;
      g.scale.setScalar(s);
      g.position.copy(base);
      const anchor = V(base.x * 0.4 - 6 - r() * 10, -1, 22 + r() * 10);
      const string = new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 12 }, () => V(0, 0, 0))), stringMat);
      this.group.add(g, string);
      this.kites.push({ g, base, phase: r() * 10, tail, string, anchor });
    }
  }

  update(f: FrameCtx) {
    const { time, u, night } = f;
    this.kites.forEach((k, i) => {
      const lift = smooth(0, 0.4, u + 0.25 - (i % 4) * 0.04);
      k.g.position.set(
        k.base.x + Math.sin(time * 0.5 + k.phase) * 0.6,
        k.base.y - (1 - lift) * 7 + Math.sin(time * 0.8 + k.phase) * 0.4,
        k.base.z + Math.cos(time * 0.4 + k.phase) * 0.3,
      );
      k.g.lookAt(f.camera.position);
      k.g.rotateZ(Math.sin(time * 0.9 + k.phase) * 0.2);
      const tp = k.tail.geometry.attributes.position as THREE.BufferAttribute;
      for (let j = 0; j < tp.count; j++) tp.setX(j, Math.sin(time * 4 + j * 0.7 + k.phase) * 0.06 * j);
      tp.needsUpdate = true;
      const sp = k.string.geometry.attributes.position as THREE.BufferAttribute;
      const s = k.g.position;
      for (let j = 0; j < sp.count; j++) {
        const t = j / (sp.count - 1);
        sp.setXYZ(j, s.x + (k.anchor.x - s.x) * t, s.y + (k.anchor.y - s.y) * t - Math.sin(Math.PI * t) * 2.5, s.z + (k.anchor.z - s.z) * t);
      }
      sp.needsUpdate = true;
      ((k.g.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).emissiveIntensity = night * 0.3;
    });
    setOpacity(this.group, Math.max(0.0001, f.vis));
  }
}

/* ------------------------------ two chhatris: Assudani Developer + Studio ------------------------------ */

export class HousePiece implements Piece {
  group = new THREE.Group();
  radius: number;
  layout = 'side' as const;
  focus = V(0, 3.4, 0);
  view = V(-0.25, 0.14, 1);
  private glows: THREE.Sprite[] = [];
  private pav: THREE.Group[] = [];

  constructor(mobile: boolean) {
    this.radius = mobile ? 7 : 7.6;
    const mat = sandstone('#D8A06A');
    [-1, 1].forEach((side, i) => {
      const c = chhatri(1, mat);
      c.position.set(side * (mobile ? 3.3 : 4.0), 0, i === 0 ? 0 : -1.2);
      const glow = glowSprite('#FFB25A', 3.0);
      glow.position.set(0, 2.3, 0);
      c.add(glow);
      this.glows.push(glow);
      this.pav.push(c);
      this.group.add(c);
    });
  }

  update(f: FrameCtx) {
    const rise = smooth(0, 0.4, f.u + 0.15);
    this.pav.forEach((p, i) => {
      p.position.y = -(1 - rise) * 7.5 * (i === 0 ? 1 : 1.15);
      p.rotation.y = (i === 0 ? 0.18 : -0.22) + (f.mobile ? 0 : f.mouse.x * 0.06);
    });
    setOpacity(this.group, Math.max(0.0001, f.vis));
    this.glows.forEach((g) => (g.material.opacity = (0.05 + f.night * 0.8) * f.vis * rise));
  }
}

/* ------------------------------ sky lanterns ------------------------------ */

export class LanternsPiece implements Piece {
  group = new THREE.Group();
  radius = 10;
  layout = 'center' as const;
  focus = V(0, 9, -4);
  view = V(0, -0.22, 1);
  private items: { m: THREE.Group; glow: THREE.Sprite; x: number; z: number; y0: number; speed: number; ph: number }[] = [];
  private mat: THREE.MeshStandardMaterial;

  constructor(mobile: boolean) {
    const r = mulberry32(7);
    this.mat = new THREE.MeshStandardMaterial({ color: '#F6D7A6', emissive: '#FF8A2A', emissiveIntensity: 0.6, side: THREE.DoubleSide, roughness: 0.8 });
    const geo = new THREE.CylinderGeometry(0.36, 0.27, 0.7, 10, 1, true);
    const n = mobile ? 22 : 36;
    for (let i = 0; i < n; i++) {
      const g = new THREE.Group();
      const glow = glowSprite('#FFA44A', 1.0);
      glow.position.y = -0.15;
      g.add(new THREE.Mesh(geo, this.mat), glow);
      g.scale.setScalar(0.45 + r() * 0.5);
      this.group.add(g);
      this.items.push({ m: g, glow, x: (r() - 0.5) * (mobile ? 14 : 30), z: -14 - r() * 26, y0: r() * 26, speed: 0.5 + r() * 0.6, ph: r() * 6 });
    }
  }

  update(f: FrameCtx) {
    this.mat.emissiveIntensity = 0.5 + f.night * 1.5;
    setOpacity(this.group, Math.max(0.0001, f.vis));
    this.items.forEach((it) => {
      const y = ((it.y0 + f.time * it.speed + f.u * 10) % 26) - 2;
      it.m.position.set(it.x + Math.sin(f.time * 0.4 + it.ph) * 0.8, y, it.z);
      it.glow.material.opacity = (0.12 + f.night * 0.45) * f.vis;
    });
  }
}

export { onDune };
