import * as THREE from 'three';
import { mulberry32 } from './helpers';

/* ------------------------------------------------------------------
   The Thar: procedural dunes shared by GPU (shader) and CPU (placement).
   A flat-ish valley follows pathX(z) — the route the story travels.
------------------------------------------------------------------- */

export const pathX = (z: number) => Math.sin(z * 0.0065) * 34 + Math.sin(z * 0.017) * 6;

const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function duneH(x: number, z: number) {
  const a = x * 0.045 + Math.sin(z * 0.018) * 2.2 + z * 0.01;
  let r1 = 1 - Math.abs(Math.sin(a));
  r1 *= r1;
  const b = x * 0.11 - z * 0.05 + Math.sin(x * 0.02) * 1.3;
  let r2 = 1 - Math.abs(Math.sin(b));
  r2 *= r2;
  const h = r1 * 8 + r2 * 1.4 + Math.sin(x * 0.013 + z * 0.009) * 3.5 + Math.sin(z * 0.004) * 3;
  const flat = ss(10, 48, Math.abs(x - pathX(z)));
  return h * (0.12 + 0.88 * flat) + flat * flat * 7;
}

const GLSL_DUNES = /* glsl */ `
  float pathX(float z) { return sin(z * 0.0065) * 34.0 + sin(z * 0.017) * 6.0; }
  float duneH(float x, float z) {
    float a = x * 0.045 + sin(z * 0.018) * 2.2 + z * 0.01;
    float r1 = 1.0 - abs(sin(a)); r1 *= r1;
    float b = x * 0.11 - z * 0.05 + sin(x * 0.02) * 1.3;
    float r2 = 1.0 - abs(sin(b)); r2 *= r2;
    float h = r1 * 8.0 + r2 * 1.4 + sin(x * 0.013 + z * 0.009) * 3.5 + sin(z * 0.004) * 3.0;
    float fl = smoothstep(10.0, 48.0, abs(x - pathX(z)));
    return h * (0.12 + 0.88 * fl) + fl * fl * 7.0;
  }
`;

/* ------------------------------ themes ------------------------------ */

export interface ThemeColors {
  skyTop: string; horizon: string; fog: string;
  sun: string; sunI: number; hemiSky: string; hemiGround: string; hemiI: number;
  sandHigh: string; sandLow: string; spark: string;
  disc: number; glow: number; stars: number; dust: string; exposure: number; bloom: number;
}

export const THEMES: Record<'light' | 'dark' | 'warm', ThemeColors> = {
  light: {
    skyTop: '#6E9BD1', horizon: '#F7D2A6', fog: '#F2CDA2',
    sun: '#FFD9A3', sunI: 2.6, hemiSky: '#CFE0FF', hemiGround: '#E7B47A', hemiI: 1.05,
    sandHigh: '#F2C48A', sandLow: '#C7834A', spark: '#FFF4DA',
    disc: 1, glow: 1, stars: 0, dust: '#FFE7C2', exposure: 1.0, bloom: 0.18,
  },
  dark: {
    // moonlit, not pitch black: the dunes and their motion must stay readable at night
    skyTop: '#070A26', horizon: '#3A3474', fog: '#2C2A5E',
    sun: '#B9C8FF', sunI: 1.25, hemiSky: '#5560B0', hemiGround: '#1E1A3A', hemiI: 1.05,
    sandHigh: '#8C90C8', sandLow: '#3A3C76', spark: '#CFDCFF',
    disc: 0, glow: 0.5, stars: 1, dust: '#FFC67A', exposure: 1.3, bloom: 0.6,
  },
  // sunrise / sunset: blended over light or dark by the time of day
  warm: {
    skyTop: '#55609E', horizon: '#FF9B5E', fog: '#E8A07C',
    sun: '#FF8F45', sunI: 1.9, hemiSky: '#F5B38C', hemiGround: '#6E3E36', hemiI: 0.85,
    sandHigh: '#EFA071', sandLow: '#8A4A3C', spark: '#FFE2C2',
    disc: 1, glow: 1.5, stars: 0, dust: '#FFD2A6', exposure: 1.0, bloom: 0.3,
  },
};

const c1 = new THREE.Color(), c2 = new THREE.Color();
export function mixColor(out: THREE.Color, a: string, b: string, t: number) {
  return out.copy(c1.set(a)).lerp(c2.set(b), t);
}
const c3 = new THREE.Color();
/** mix(a, b, t), then towards w by wt */
export function mixWarm(out: THREE.Color, a: string, b: string, t: number, w: string, wt: number) {
  return mixColor(out, a, b, t).lerp(c3.set(w), wt);
}

/* ------------------------------ ripples ------------------------------ */

function rippleNormalMap() {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(S, S);
  const r = mulberry32(5);
  const off = Array.from({ length: S }, () => r() * 0.6);
  const h = (x: number, y: number) =>
    Math.sin(((x + Math.sin(y * 0.05) * 9 + off[y % S] * 3) / S) * Math.PI * 2 * 7) * 0.5 +
    Math.sin(((x * 0.7 + y * 0.3) / S) * Math.PI * 2 * 3) * 0.2;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = h(x + 1, y) - h(x - 1, y);
      const dy = h(x, y + 1) - h(x, y - 1);
      const n = new THREE.Vector3(-dx * 2.2, -dy * 2.2, 1).normalize();
      const i = (y * S + x) * 4;
      img.data[i] = (n.x * 0.5 + 0.5) * 255;
      img.data[i + 1] = (n.y * 0.5 + 0.5) * 255;
      img.data[i + 2] = (n.z * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/* ------------------------------ terrain ------------------------------ */

export class Terrain {
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  uniforms = {
    uSandHigh: { value: new THREE.Color() },
    uSandLow: { value: new THREE.Color() },
    uSpark: { value: new THREE.Color() },
  };
  private readonly snap = 4;

  constructor(mobile: boolean) {
    const W = 560, D = 400;
    const g = new THREE.PlaneGeometry(W, D, mobile ? 110 : 200, mobile ? 90 : 170);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -D / 2 + 50);
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (W / 4), uv.getY(i) * (D / 4));
    const normalMap = rippleNormalMap();
    this.material = new THREE.MeshStandardMaterial({
      color: '#ffffff', roughness: 0.92, metalness: 0, normalMap, normalScale: new THREE.Vector2(0.32, 0.32),
    });
    this.material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${GLSL_DUNES}\nvarying float vH;\nvarying vec3 vW;\nvarying float vSlope;`)
        .replace(
          '#include <beginnormal_vertex>',
          `vec3 wp0 = (modelMatrix * vec4(position, 1.0)).xyz;
           float e = 0.4;
           float hC = duneH(wp0.x, wp0.z);
           float hX = duneH(wp0.x + e, wp0.z);
           float hZ = duneH(wp0.x, wp0.z + e);
           vec3 objectNormal = normalize(vec3(-(hX - hC) / e, 1.0, -(hZ - hC) / e));
           vSlope = 1.0 - objectNormal.y;
           #ifdef USE_TANGENT
             vec3 objectTangent = vec3(1.0, 0.0, 0.0);
           #endif`,
        )
        .replace('#include <begin_vertex>', `vec3 transformed = vec3(position); transformed.y = hC; vH = hC; vW = wp0 + vec3(0.0, hC, 0.0);`);
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>\nuniform vec3 uSandHigh; uniform vec3 uSandLow; uniform vec3 uSpark;\nvarying float vH;\nvarying vec3 vW;\nvarying float vSlope;`,
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
           float hN = smoothstep(-0.5, 11.0, vH);
           vec3 sand = mix(uSandLow, uSandHigh, hN);
           // large-scale colour drift and wind streaks so the sand never looks flat or tiled
           float drift = sin(vW.x * 0.045 + sin(vW.z * 0.031) * 2.0) * sin(vW.z * 0.042 + vW.x * 0.012);
           float streak = sin(vW.x * 0.8 + vW.z * 0.33 + drift * 3.0) * 0.5 + 0.5;
           sand *= 0.94 + 0.08 * drift + 0.035 * streak;
           // steep slip faces a touch darker and redder, crests a touch brighter
           float steep = smoothstep(0.12, 0.5, vSlope);
           sand = mix(sand, uSandLow * vec3(0.95, 0.86, 0.8), steep * 0.32);
           sand *= 1.0 + (1.0 - steep) * hN * 0.06;
           diffuseColor.rgb = sand;`,
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
           vec2 cell = floor(vW.xz * 9.0);
           float hs = fract(sin(dot(cell + floor(cameraPosition.xz * 0.6), vec2(12.9898, 78.233))) * 43758.5453);
           float sp = step(0.9972, hs) * smoothstep(70.0, 6.0, length(vW - cameraPosition));
           totalEmissiveRadiance += uSpark * sp * 0.0;`,
        );
    };
    this.mesh = new THREE.Mesh(g, this.material);
    this.mesh.frustumCulled = false;
  }

  follow(cam: THREE.Vector3) {
    this.mesh.position.z = Math.round(cam.z / this.snap) * this.snap;
  }

  /** day/night blend k, then a sunrise/sunset tint w */
  setColors(a: ThemeColors, b: ThemeColors, k: number, warm: ThemeColors, w: number) {
    mixWarm(this.uniforms.uSandHigh.value, a.sandHigh, b.sandHigh, k, warm.sandHigh, w);
    mixWarm(this.uniforms.uSandLow.value, a.sandLow, b.sandLow, k, warm.sandLow, w);
    mixWarm(this.uniforms.uSpark.value, a.spark, b.spark, k, warm.spark, w);
  }
}

/* ------------------------------ sky ------------------------------ */

export class Sky {
  mesh: THREE.Mesh;
  stars: THREE.Points;
  uniforms = {
    uTop: { value: new THREE.Color() },
    uHorizon: { value: new THREE.Color() },
    uSunColor: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3(0, 0.1, -1).normalize() },
    uDisc: { value: 1 },
    uGlow: { value: 1 },
    uTime: { value: 0 },
  };

  constructor(mobile: boolean) {
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: this.uniforms,
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = position;
          vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_Position = p.xyww;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uSunColor; uniform vec3 uSunDir;
        uniform float uDisc; uniform float uGlow; uniform float uTime;
        varying vec3 vDir;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
        }
        float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
        void main() {
          vec3 d = normalize(vDir);
          float h = d.y;
          vec3 col = mix(uHorizon, uTop, pow(smoothstep(-0.03, 0.7, h), 0.75));
          float s = max(dot(d, normalize(uSunDir)), 0.0);
          // sun: big soft disc + halo. moon: crisp small disc, faint halo
          float sunDisc = smoothstep(0.9985, 0.9992, s);
          float moonDisc = smoothstep(0.99955, 0.9997, s);
          float disc = mix(moonDisc, sunDisc, uDisc);
          col += uSunColor * disc * mix(1.6, 4.5, uDisc);
          col += uSunColor * (pow(s, 14.0) * 0.45 + pow(s, 3.0) * 0.18) * uGlow;
          // thin desert clouds, stretched by the wind and lit by the sun
          if (h > 0.0) {
            vec2 cp = d.xz / (h + 0.18) * vec2(0.9, 2.2) + vec2(uTime * 0.012, 0.0);
            float cl = fbm(cp * 1.3);
            cl = smoothstep(0.52, 0.82, cl) * smoothstep(0.0, 0.1, h) * (1.0 - smoothstep(0.3, 0.75, h));
            vec3 cc = mix(uHorizon * 1.12, vec3(1.0, 0.98, 0.95), 0.4 * uDisc) + uSunColor * pow(s, 5.0) * 0.8;
            cc *= mix(0.42, 1.0, uDisc);
            col = mix(col, cc, cl * 0.6);
          }
          // haze band on the horizon
          col = mix(col, uHorizon * 1.06, smoothstep(0.12, 0.0, abs(h)) * 0.45);
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(480, 48, 24), mat);
    this.mesh.renderOrder = -10;
    this.mesh.frustumCulled = false;

    const n = mobile ? 900 : 1800;
    const r = mulberry32(31);
    const pos = new Float32Array(n * 3);
    const size = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const th = r() * Math.PI * 2;
      const y = Math.pow(r(), 0.8) * 0.95 + 0.03;
      const rad = Math.sqrt(1 - y * y);
      pos[i * 3] = Math.cos(th) * rad * 440;
      pos[i * 3 + 1] = y * 440;
      pos[i * 3 + 2] = Math.sin(th) * rad * 440;
      size[i] = 0.6 + Math.pow(r(), 6) * 2.4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    this.stars = new THREE.Points(
      g,
      new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending,
        uniforms: { uOpacity: { value: 0 }, uTime: { value: 0 }, uPR: { value: Math.min(2, window.devicePixelRatio) } },
        vertexShader: `attribute float aSize; uniform float uPR; varying float vS;
          void main(){ vS = aSize; vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; gl_PointSize = aSize * uPR * 1.6; }`,
        fragmentShader: `uniform float uOpacity; uniform float uTime; varying float vS;
          void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
            float tw = 0.7 + 0.3 * sin(uTime * 2.0 + vS * 40.0);
            gl_FragColor = vec4(vec3(0.9, 0.93, 1.0), smoothstep(0.5, 0.0, d) * uOpacity * tw); }`,
      }),
    );
    this.stars.frustumCulled = false;
    this.stars.renderOrder = -9;
  }

  follow(cam: THREE.Vector3) {
    this.mesh.position.copy(cam);
    this.stars.position.copy(cam);
  }
}

/* ------------------------------ drifting sand / fireflies ------------------------------ */

export class Dust {
  points: THREE.Points;
  uniforms = {
    uTime: { value: 0 },
    uCam: { value: new THREE.Vector3() },
    uColor: { value: new THREE.Color() },
    uOpacity: { value: 0.6 },
    uPR: { value: Math.min(2, window.devicePixelRatio) },
  };
  constructor(n: number) {
    const r = mulberry32(12);
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      p[i * 3] = r() * 60;
      p[i * 3 + 1] = r() * 24;
      p[i * 3 + 2] = r() * 60;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    this.points = new THREE.Points(
      g,
      new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: this.uniforms,
        vertexShader: /* glsl */ `
          uniform float uTime; uniform vec3 uCam; uniform float uPR; varying float vA;
          void main() {
            vec3 box = vec3(60.0, 24.0, 60.0);
            vec3 p = position + vec3(uTime * 1.6, sin(uTime * 0.3 + position.x) * 0.6, uTime * 0.4);
            p = mod(p - uCam + box * 0.5, box) - box * 0.5 + uCam;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uPR * (1.0 + fract(position.x * 7.13) * 2.4) * (14.0 / -mv.z);
            vA = smoothstep(30.0, 4.0, -mv.z) * (0.5 + 0.5 * sin(uTime * 1.7 + position.z * 3.0));
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor; uniform float uOpacity; varying float vA;
          void main() { float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
            gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, d) * vA * uOpacity); }`,
      }),
    );
    this.points.frustumCulled = false;
  }
}
