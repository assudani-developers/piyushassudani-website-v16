import * as THREE from 'three';

export interface FrameCtx {
  time: number;
  dt: number;
  /** progress through this chapter's hold, 0..1 */
  u: number;
  /** presence, 0 (away) .. 1 (camera parked here) */
  vis: number;
  /** 0 = day (light theme), 1 = night (dark theme) */
  night: number;
  camera: THREE.PerspectiveCamera;
  mouse: THREE.Vector2;
  mobile: boolean;
}

export interface Piece {
  group: THREE.Group;
  /** bounding radius used to frame the camera */
  radius: number;
  /** 'side' = 3D beside the story text; 'center' = 3D is the whole frame */
  layout: 'side' | 'center';
  /** look target, local to the chapter anchor (may change per frame) */
  focus: THREE.Vector3;
  /** direction from focus towards the camera */
  view: THREE.Vector3;
  update(f: FrameCtx): void;
  hits?: THREE.Object3D[];
  /** focused item index (synced to the UI) */
  active?: number;
  /** item position set by a swipe carousel (mobile) instead of scroll */
  override?: number | null;
}

/** Fade every material under an object (keeps each material's base opacity). */
export function setOpacity(obj: THREE.Object3D, o: number) {
  obj.traverse((c) => {
    const m = (c as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    if (!m) return;
    (Array.isArray(m) ? m : [m]).forEach((mm) => {
      const base = (mm.userData.baseOpacity ??= mm.opacity);
      mm.transparent = o < 0.999 || base < 1;
      mm.opacity = base * o;
    });
  });
}
