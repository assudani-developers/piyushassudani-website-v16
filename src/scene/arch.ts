import * as THREE from 'three';
import { mulberry32 } from './helpers';

/** Pointed (Mughal / Rajput) arch outline: rectangle of height hR topped by two arcs meeting in a peak. */
export function archOutline(p: THREE.Path, w: number, hR: number, y0 = 0, x0 = 0) {
  const k = 0.16 * w;
  const r = w / 2 + k;
  const peak = Math.sqrt(r * r - k * k);
  const aL = Math.atan2(peak, -k);
  const aR = Math.atan2(peak, k);
  p.moveTo(x0 - w / 2, y0);
  p.lineTo(x0 - w / 2, y0 + hR);
  p.absarc(x0 + k, y0 + hR, r, Math.PI, aL, true);
  p.absarc(x0 - k, y0 + hR, r, aR, 0, true);
  p.lineTo(x0 + w / 2, y0);
  p.lineTo(x0 - w / 2, y0);
  return { top: y0 + hR + peak };
}

export function archHeight(w: number, hR: number) {
  const k = 0.16 * w;
  const r = w / 2 + k;
  return hR + Math.sqrt(r * r - k * k);
}

/** Flat arch-shaped surface (for photos / glow) with UVs normalised to its bounds. */
export function archPlane(w: number, hR: number) {
  const s = new THREE.Shape();
  archOutline(s, w, hR);
  const g = new THREE.ShapeGeometry(s, 24);
  const H = archHeight(w, hR);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, pos.getY(i) / H);
  uv.needsUpdate = true;
  return g;
}

/** A carved sandstone frame around an arch opening. */
export function archFrame(w: number, hR: number, border: number, depth: number, base = 0) {
  const H = archHeight(w, hR);
  const outer = new THREE.Shape();
  const ow = w + border * 2;
  outer.moveTo(-ow / 2, -base);
  outer.lineTo(ow / 2, -base);
  outer.lineTo(ow / 2, H + border * 1.2);
  outer.lineTo(-ow / 2, H + border * 1.2);
  outer.lineTo(-ow / 2, -base);
  const hole = new THREE.Path();
  archOutline(hole, w, hR);
  outer.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(outer, {
    depth, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 2, curveSegments: 28,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

let stoneTex: THREE.Texture | null = null;
/** Soft mottled stone texture so sandstone isn't flat plastic. */
export function stoneTexture() {
  if (stoneTex) return stoneTex;
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, S, S);
  const r = mulberry32(3);
  for (let i = 0; i < 2200; i++) {
    const v = 200 + Math.floor(r() * 55);
    ctx.fillStyle = `rgba(${v},${v - 8},${v - 18},${0.25 + r() * 0.35})`;
    const s = 1 + r() * 6;
    ctx.fillRect(r() * S, r() * S, s, s * (0.3 + r()));
  }
  for (let y = 0; y < S; y += 3) {
    ctx.fillStyle = `rgba(150,120,90,${0.04 + r() * 0.05})`;
    ctx.fillRect(0, y, S, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  stoneTex = t;
  return t;
}

export function sandstone(color = '#D9A066') {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.86, metalness: 0, map: stoneTexture() });
}

/** Soft contact shadow under objects. */
export function contactShadow(w: number, d: number, opacity = 0.35) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, 'rgba(40,20,10,1)');
  g.addColorStop(1, 'rgba(40,20,10,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, opacity, depthWrite: false }),
  );
  m.rotation.x = -Math.PI / 2;
  m.renderOrder = 1;
  return m;
}

/** Warm glow sprite (lanterns, lamps). */
let glowTex: THREE.Texture | null = null;
export function glowSprite(color: string, size: number) {
  if (!glowTex) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.45)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    glowTex = new THREE.CanvasTexture(c);
  }
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  s.scale.setScalar(size);
  return s;
}
