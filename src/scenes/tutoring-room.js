/**
 * Tutoring room (v2.0.0 living classroom): a warm after-school room with Poly Haven
 * CC0 desks, chairs, bookshelf, encyclopedia set, wall clock and plant, a full window
 * with blinds and a real 3D exterior (trees, playground, sky), a whiteboard and
 * worksheets with readable handwriting (Patrick Hand), posters, radiator, corridor
 * door, and three animated-movie-style students (createAnimatedCharacter) seated at
 * their desks. 1 unit = 1 meter; the camera is the tutor (seated tutor view).
 *
 * Ambient life (AmbientLifeManager): sun shafts through the blinds, floating dust,
 * clock pendulum + second hand, a classmate walking past the corridor door, and
 * character breathing/blinking/gaze. Calm mode during decision moments; reduced
 * motion stops all non-essential motion (poses still apply, snapped).
 * @module scenes/tutoring-room
 */
import * as THREE from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { AmbientLifeManager } from '../v2/ambient-life.js';
import { ModelLibrary } from '../v2/model-placer.js';
import { createAnimatedCharacter } from '../v2/stylized-character.js';
import { groundProp } from '../v2/cinematic-grade.js';

const BASE = import.meta.env.BASE_URL || './';
/** CC0 Poly Haven PBR sets (1k JPG; names content-hashed by scripts/fetch-assets.mjs). */
const TEX = {
  floor: {
    color: 'assets/tex/laminate_floor_02_color-c112a8fb10.jpg',
    normal: 'assets/tex/laminate_floor_02_normal-ec501e1c76.jpg',
    rough: 'assets/tex/laminate_floor_02_rough-1d48d21a84.jpg',
  },
  wall: {
    color: 'assets/tex/painted_plaster_wall_color-440310f05a.jpg',
    normal: 'assets/tex/painted_plaster_wall_normal-8eb01647d1.jpg',
    rough: 'assets/tex/painted_plaster_wall_rough-e0564c297b.jpg',
  },
};
const HDRI = 'assets/school_hall_1k-14dad2701a.hdr';

/** Seated tutor camera and preset looks (positions in meters). The group view is
 * framed for the visible area left of the floating HUD drawer. */
export const VIEWS = {
  group: { pos: [0.05, 1.3, 1.5], look: [0.4, 1.02, -0.6], label: 'The whole group' },
  A: { pos: [0.2, 1.32, 0.65], look: [-0.62, 1.14, -1.02], label: 'Jordan' },
  B: { pos: [0, 1.32, 0.65], look: [0, 1.14, -1.02], label: 'Talia' },
  C: { pos: [-0.34, 1.32, 0.65], look: [0.62, 1.14, -1.02], label: 'Sam' },
  'A-work': { pos: [-0.62, 1.22, 0.18], look: [-0.62, 0.79, -0.55], label: "Jordan's worksheet" },
  'B-work': { pos: [0, 1.22, 0.18], look: [0, 0.79, -0.55], label: "Talia's worksheet" },
  'C-work': { pos: [0.48, 1.22, 0.18], look: [0.62, 0.79, -0.55], label: "Sam's worksheet" },
  board: { pos: [0, 1.32, 1.25], look: [0, 1.5, -2.4], label: 'Whiteboard' },
  clock: { pos: [1.15, 1.42, -0.15], look: [1.9, 1.85, -2.4], label: 'Wall clock' },
  overview: { pos: [0, 3.2, 2.9], look: [0.3, 0.55, -0.7], label: 'Overview' },
};

/** Hotspot rings for the preset views (floor positions; click = glide to the view). */
const RINGS = [
  ['group', [0, 0, 1.0]],
  ['A', [-0.62, 0, -0.05]],
  ['B', [0, 0, -0.05]],
  ['C', [0.62, 0, -0.05]],
  ['board', [0, 0, -1.45]],
  ['clock', [1.9, 0, -1.55]],
  ['overview', [-1.9, 0, 1.4]],
];

const SEAT_X = { '-1': -0.62, '0': 0, '1': 0.62 };
const DESK_Z = -0.52;
const SEAT_Z = -1.04;
const DESK_TOP = 0.79; // SchoolDesk_01 normalized to 0.78 m high; props sit just above.

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export class TutoringRoom {
  /**
   * @param {THREE.Scene} scene
   * @param {object} opts
   * @param {object} opts.mixes content/student-mixes.json
   * @param {THREE.WebGLRenderer} opts.renderer
   * @param {boolean} [opts.reducedMotion=false]
   */
  constructor(scene, { mixes, renderer, reducedMotion = false }) {
    this.scene = scene;
    this.renderer = renderer;
    this.students = {};
    this.worksheets = {};
    this.chars = {};
    this._names = {};
    this.elapsed = 0;
    this.models = new ModelLibrary();
    this.life = new AmbientLifeManager(scene, { reducedMotion, seed: 412 });
    this.gaze = { tutor: new THREE.Vector3(0, 1.25, 1.4), window: new THREE.Vector3(-3.1, 1.6, -0.6) };
    this.windowPos = this.gaze.window;

    this._buildRoom();
    this._buildStudents(mixes);
    this._buildDressing();
    this._buildCorridor();
    this._initAmbientLife();
    this._loadEnvironment();
    this._placeModels();
    // Handwriting textures need the case fonts loaded; redraw once they arrive.
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        for (const id of Object.keys(this.worksheets)) this._redrawWork(id);
        this.setBoard(this._boardText || '3x − 5 = 10');
        for (const poster of this._posters || []) poster.redraw();
      }).catch(() => {});
    }
  }

  _box(w, h, d, mat, x, y, z, { shadow = true } = {}) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = shadow;
    m.receiveShadow = true;
    this.scene.add(m);
    return m;
  }

  _pbrMaterial(set, rx, ry, extra = {}) {
    const loader = new THREE.TextureLoader();
    const t = (p, srgb) => {
      const tx = loader.load(BASE + p);
      tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
      tx.repeat.set(rx, ry);
      tx.anisotropy = 8;
      if (srgb) tx.colorSpace = THREE.SRGBColorSpace;
      return tx;
    };
    return new THREE.MeshStandardMaterial({ map: t(set.color, true), normalMap: t(set.normal), roughnessMap: t(set.rough), ...extra });
  }

  _buildRoom() {
    const s = this.scene;
    // Floor (CC0 laminate at real-world scale: 1.7 m per tile repeat).
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), this._pbrMaterial(TEX.floor, 7 / 1.7, 7 / 1.7));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    s.add(floor);
    // Corridor floor beyond the right wall.
    const corridorFloor = floor.clone();
    corridorFloor.material = floor.material;
    corridorFloor.position.set(3.9, 0, 0);
    corridorFloor.scale.set(0.35, 1, 1);
    s.add(corridorFloor);

    // Walls (CC0 painted plaster, cream). The left wall is built around the window
    // opening (z -1.7..0.5, sill 0.95, head 2.35); the right wall has a door opening.
    const wallMat = () => this._pbrMaterial(TEX.wall, 3.5, 1.5, { color: 0xefe6d8 });
    this._box(7, 3, 0.1, wallMat(), 0, 1.5, -2.5); // back wall
    // Left wall segments around the window.
    this._box(0.1, 3, 1.85, wallMat(), -3.2, 1.5, -2.65); // z -3.575..-1.725
    this._box(0.1, 3, 3.05, wallMat(), -3.2, 1.5, 2.075); // z 0.55..3.6
    this._box(0.1, 0.95, 2.3, wallMat(), -3.2, 0.475, -0.6); // under sill
    this._box(0.1, 0.65, 2.3, wallMat(), -3.2, 2.675, -0.6); // above head
    // Right wall with a door opening at z -1.6..-0.7 (corridor door).
    this._box(0.1, 3, 1.9, wallMat(), 3.2, 1.5, -2.55); // z -3.5..-1.6
    this._box(0.1, 3, 4.2, wallMat(), 3.2, 1.5, 1.4); // z -0.7..3.5
    this._box(0.1, 0.95, 0.95, wallMat(), 3.2, 0.475, -1.15); // above door head

    // Skirting board.
    const skirtMat = new THREE.MeshStandardMaterial({ color: 0xdcd4c4, roughness: 0.55 });
    this._box(6.3, 0.1, 0.02, skirtMat, 0, 0.05, -2.44);
    this._box(0.02, 0.1, 1.75, skirtMat, -3.14, 0.05, -2.6);
    this._box(0.02, 0.1, 2.95, skirtMat, -3.14, 0.05, 2.05);
    this._box(0.02, 0.1, 1.8, skirtMat, -3.14, 0.05, -0.6);
    this._box(0.02, 0.1, 6.9, skirtMat, 3.14, 0.05, 0);

    // --- Window: frame, mullion, glass, blinds; real 3D exterior beyond. ---
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xf5f2ea, roughness: 0.5 });
    this._box(0.08, 1.5, 0.07, frameMat, -3.16, 1.65, -1.72);
    this._box(0.08, 1.5, 0.07, frameMat, -3.16, 1.65, 0.52);
    this._box(0.08, 0.07, 2.34, frameMat, -3.16, 0.93, -0.6);
    this._box(0.08, 0.07, 2.34, frameMat, -3.16, 2.37, -0.6);
    this._box(0.05, 1.4, 0.05, frameMat, -3.16, 1.65, -0.6); // center mullion
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.4), new THREE.MeshStandardMaterial({
      color: 0xdfeaf2, emissive: 0xcfe0ee, emissiveIntensity: 0.3, transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0.1,
    }));
    glass.position.set(-3.19, 1.65, -0.6);
    glass.rotation.y = Math.PI / 2;
    s.add(glass);
    // Blinds: headrail + tilted slats over the top of the window.
    const blindMat = new THREE.MeshStandardMaterial({ color: 0xf1ecdf, roughness: 0.75 });
    this._box(0.09, 0.07, 2.3, blindMat, -3.1, 2.36, -0.6);
    for (let i = 0; i < 6; i++) {
      const slat = this._box(0.02, 0.012, 2.24, blindMat, -3.06, 2.28 - i * 0.075, -0.6, { shadow: false });
      slat.rotation.x = 0.55;
    }

    // Exterior (anti-greenscreen): real geometry — lawn, trees, playground frame —
    // plus a painted distant treeline far behind for depth. The sky dome comes from
    // applyCaseGrade (HDRI stays lighting-only).
    const lawn = new THREE.Mesh(new THREE.PlaneGeometry(8, 10), new THREE.MeshStandardMaterial({ color: 0x6d9159, roughness: 1 }));
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.set(-7, 0, -0.6);
    s.add(lawn);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4a33, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4e7a3d, roughness: 0.95 });
    for (const [tx, tz, h] of [[-4.6, -1.6, 2.6], [-5.4, 0.4, 3.2], [-4.4, 1.6, 2.2], [-6.4, -1.0, 3.6], [-6.2, 1.9, 2.8]]) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, h, 8), trunkMat);
      trunk.position.set(tx, h / 2, tz);
      trunk.castShadow = true;
      s.add(trunk);
      for (const [oy, r] of [[h + 0.15, 0.85], [h + 0.7, 0.6]]) {
        const blob = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), leafMat);
        blob.position.set(tx, oy, tz);
        blob.scale.y = 0.85;
        blob.castShadow = true;
        s.add(blob);
      }
    }
    // Playground: swing frame + slide, seen through the window.
    const playMat = new THREE.MeshStandardMaterial({ color: 0xc24d3a, roughness: 0.6 });
    for (const px of [-4.9, -3.9]) {
      this._box(0.07, 1.7, 0.07, playMat, px, 0.85, -2.2);
      this._box(0.07, 1.7, 0.07, playMat, px, 0.85, -1.5);
    }
    this._box(0.07, 0.07, 0.85, playMat, -4.9, 1.72, -1.85);
    this._box(0.07, 0.07, 0.85, playMat, -3.9, 1.72, -1.85);
    this._box(0.07, 0.07, 1.1, playMat, -4.4, 1.72, -1.85);
    const slide = this._box(0.5, 0.04, 1.4, new THREE.MeshStandardMaterial({ color: 0x3a6ea5, roughness: 0.4, metalness: 0.2 }), -5.6, 0.65, 0.9);
    slide.rotation.set(-0.62, 0.35, 0);
    this._box(0.5, 0.9, 0.06, playMat, -6.05, 0.45, 0.35);
    // Painted distant treeline + horizon (canvas), far behind the real geometry.
    const treeline = new THREE.Mesh(new THREE.PlaneGeometry(11, 3), new THREE.MeshBasicMaterial({
      map: canvasTexture(512, 160, (g, w, h) => {
        const sky = g.createLinearGradient(0, 0, 0, h * 0.62);
        sky.addColorStop(0, '#8fb8d8');
        sky.addColorStop(1, '#e8d9b8');
        g.fillStyle = sky; g.fillRect(0, 0, w, h);
        g.fillStyle = '#3f6234';
        g.beginPath(); g.moveTo(0, h * 0.62);
        for (let x = 0; x <= w; x += 16) g.lineTo(x, h * 0.62 - 22 - Math.sin(x * 0.09) * 14 - (x % 48) * 0.3);
        g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill();
      }), fog: false,
    }));
    treeline.position.set(-7.6, 1.5, -0.6);
    treeline.rotation.y = Math.PI / 2;
    s.add(treeline);

    // --- Whiteboard with the problem of the moment (Patrick Hand handwriting). ---
    this.boardCanvas = document.createElement('canvas');
    this.boardCanvas.width = 1024; this.boardCanvas.height = 512;
    this.boardTex = new THREE.CanvasTexture(this.boardCanvas);
    this.boardTex.colorSpace = THREE.SRGBColorSpace;
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x2e4a3f, roughness: 0.55 });
    this._box(2.3, 1.15, 0.04, new THREE.MeshStandardMaterial({ color: 0x9aa1a8, roughness: 0.5, metalness: 0.3 }), 0, 1.45, -2.43);
    this._box(2.34, 0.05, 0.09, trayMat, 0, 0.855, -2.42);
    const board = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.05), new THREE.MeshStandardMaterial({ map: this.boardTex, roughness: 0.35 }));
    board.position.set(0, 1.45, -2.4);
    s.add(board);
    this.setBoard('3x − 5 = 10');

    // --- Wall clock: Poly Haven model (async) + readable canvas face + pendulum +
    // a live second hand. The session time stays readable at the clock look. ---
    this.clockCanvas = document.createElement('canvas');
    this.clockCanvas.width = 256; this.clockCanvas.height = 256;
    this.clockTex = new THREE.CanvasTexture(this.clockCanvas);
    this.clockTex.colorSpace = THREE.SRGBColorSpace;
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.155, 40), new THREE.MeshStandardMaterial({ map: this.clockTex, roughness: 0.4 }));
    face.position.set(1.9, 1.85, -2.36);
    s.add(face);
    this.setClock('0:00');
    const pendulum = new THREE.Group();
    pendulum.position.set(1.9, 1.66, -2.33);
    const rod = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.2, 0.01), new THREE.MeshStandardMaterial({ color: 0xb08d57, roughness: 0.4, metalness: 0.6 }));
    rod.position.y = -0.1;
    const bob = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 16), new THREE.MeshStandardMaterial({ color: 0xcfa96a, roughness: 0.35, metalness: 0.7 }));
    bob.rotation.x = Math.PI / 2;
    bob.position.y = -0.2;
    pendulum.add(rod, bob);
    s.add(pendulum);
    this.life.addOscillator(pendulum, { axis: 'z', mode: 'rotate', amplitude: 0.16, frequency: 0.5 });
    const secondHand = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.13, 0.004), new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.4 }));
    secondHand.geometry.translate(0, 0.055, 0);
    secondHand.position.set(1.9, 1.85, -2.355);
    s.add(secondHand);
    this.life.addOscillator(secondHand, { axis: 'z', mode: 'spin', amplitude: (Math.PI * 2) / 60 });

    // Posters (canvas, Patrick Hand / Sora), redrawn when fonts arrive.
    this._posters = [];
    const poster = (x, y, z, ry, w, h, draw) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = Math.round(256 * (h / w));
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ roughness: 0.85 }));
      mesh.position.set(x, y, z);
      mesh.rotation.y = ry;
      s.add(mesh);
      const rec = {
        canvas, mesh,
        redraw: () => {
          draw(canvas.getContext('2d'), canvas.width, canvas.height);
          mesh.material.map = new THREE.CanvasTexture(canvas);
          mesh.material.map.colorSpace = THREE.SRGBColorSpace;
          mesh.material.needsUpdate = true;
        },
      };
      rec.redraw();
      this._posters.push(rec);
      return rec;
    };
    poster(-1.55, 1.75, -2.44, 0, 0.55, 0.75, (g, w, h) => {
      g.fillStyle = '#3a6ea5'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#efe6d8'; g.fillRect(12, 12, w - 24, h - 24);
      g.fillStyle = '#2e4a3f'; g.font = '28px "Patrick Hand", cursive'; g.textAlign = 'center';
      g.fillText('Math is a door,', w / 2, 84);
      g.fillText('not a wall.', w / 2, 120);
      g.font = '22px "Patrick Hand", cursive';
      g.fillText('ask → wait → listen', w / 2, 190);
    });
    poster(1.05, 1.8, -2.44, 0, 0.5, 0.66, (g, w, h) => {
      g.fillStyle = '#f2b705'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#1c2621'; g.font = 'bold 30px "Sora", sans-serif'; g.textAlign = 'center';
      g.fillText('ROOM 12', w / 2, 56);
      g.font = '20px "Patrick Hand", cursive';
      g.fillText('Bridge Math', w / 2, 96);
      g.fillText('Tuesdays 3:30', w / 2, 126);
      g.fillStyle = '#2e4a3f';
      g.fillRect(30, 150, w - 60, 6);
      g.fillText('show your tries', w / 2, 205);
    });

    // Radiator under the window.
    const radMat = new THREE.MeshStandardMaterial({ color: 0xe8e2d4, roughness: 0.5, metalness: 0.3 });
    this._box(1.7, 0.08, 0.14, radMat, -3.02, 0.55, -0.6);
    this._box(1.7, 0.06, 0.14, radMat, -3.02, 0.1, -0.6);
    for (let i = 0; i < 12; i++) this._box(0.05, 0.42, 0.1, radMat, -3.02, 0.33, -1.38 + i * 0.145);

    // Light: window-side key light (warm afternoon sun, shadows by preset) + fill.
    s.add(new THREE.HemisphereLight(0xffe4b5, 0x4d4337, 0.6));
    const key = new THREE.DirectionalLight(0xf3c77a, 2.0);
    key.position.set(-3.4, 2.9, 0.3);
    key.target.position.set(0.4, 0.7, -0.5);
    s.add(key, key.target);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5, near: 0.5, far: 9 });
    key.shadow.bias = -0.0005;
    this.keyLight = key;
  }

  _buildCorridor() {
    const s = this.scene;
    // Corridor beyond the right-wall door (visible through the opening).
    const wallMat = this._pbrMaterial(TEX.wall, 2, 1.5, { color: 0xe7dfd0 });
    this._box(0.08, 2.6, 7, wallMat, 4.4, 1.3, 0);
    this._box(1.3, 0.08, 7, new THREE.MeshStandardMaterial({ color: 0xd9d2c2, roughness: 0.8 }), 3.85, 2.64, 0); // corridor ceiling
    this._box(1.2, 2.6, 0.08, wallMat, 3.85, 1.3, -3.5);
    // Door frame + a panel ajar so the doorway reads as a door, not a hole.
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x8a6f4d, roughness: 0.6 });
    this._box(0.06, 2.1, 0.06, frameMat, 3.17, 1.05, -1.63);
    this._box(0.06, 2.1, 0.06, frameMat, 3.17, 1.05, -0.67);
    this._box(0.06, 0.06, 1.0, frameMat, 3.17, 2.12, -1.15);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x9c7b52, roughness: 0.6 });
    const door = this._box(0.045, 2.04, 0.9, doorMat, 3.32, 1.02, -0.32);
    door.rotation.y = -1.9; // ajar, hinged at the far edge
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), new THREE.MeshStandardMaterial({ color: 0xb08d57, metalness: 0.7, roughness: 0.35 }));
    knob.position.set(3.36, 1.0, -0.85);
    s.add(knob);
  }

  _buildStudents(mixes) {
    for (const [id, def] of Object.entries(mixes.students)) {
      const seatX = SEAT_X[def.look.seat] ?? 0;
      // Animated-movie teen, seated. The v1 representation rules carry over:
      // Jordan she/her, dark skin, short hair; Talia medium skin, bun; Sam lightest
      // skin, nonbinary, short hair, no hood (never a withdrawal marker).
      const skin = new THREE.Color(def.look.skin || '#c68d64');
      const hair = new THREE.Color(def.look.hair || '#222');
      const shirt = new THREE.Color(def.look.shirt || '#2e6f95');
      const char = createAnimatedCharacter({
        id: `student-${id}`,
        name: def.name,
        height: 1.58,
        skinColor: skin.getHex(),
        hairColor: hair.getHex(),
        topColor: shirt.getHex(),
        accentColor: id === 'A' ? 0xefe6d8 : id === 'B' ? 0xf2b705 : 0x3a6ea5,
        bottomColor: id === 'B' ? 0x41506b : 0x2d3340,
        hairStyle: id === 'B' ? 'bun' : 'short',
        seated: true,
        prop: 'pencil',
      });
      char.root.position.set(seatX, 0, SEAT_Z);
      char.root.rotation.y = 0; // faces the tutor (+z)
      this.scene.add(char.root);
      // NOTE: not registered with AmbientLifeManager — room.update() drives the
      // students so gaze tracking (at the moving tutor camera) and reduced-motion
      // pose snapping stay under this module's control.
      this.chars[id] = char;
      this._names[id] = def.name;
      char.setAction('seated-idle', 'neutral');
      char.lookAtWorld(this.gaze.tutor);

      // Worksheet on the desk in front of them (readable handwriting canvas).
      const sheetCanvas = document.createElement('canvas');
      sheetCanvas.width = 512; sheetCanvas.height = 680;
      const sheetTex = new THREE.CanvasTexture(sheetCanvas);
      sheetTex.colorSpace = THREE.SRGBColorSpace;
      sheetTex.anisotropy = 8;
      const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.28), new THREE.MeshStandardMaterial({ map: sheetTex, roughness: 0.9 }));
      sheet.rotation.x = -Math.PI / 2;
      sheet.rotation.z = Math.PI + (def.look.seat * 0.12);
      sheet.position.set(seatX, DESK_TOP + 0.012, DESK_Z + 0.02);
      sheet.receiveShadow = true;
      this.scene.add(sheet);
      this.worksheets[id] = { canvas: sheetCanvas, tex: sheetTex, mesh: sheet };
      this.setWork(id, ['Name: ' + def.name, '', 'Warm-up', 'x + 4 = 9', 'x = 5']);

      // Gaze targets: their worksheet and the world.
      this.gaze[`${id}-work`] = new THREE.Vector3(seatX, DESK_TOP, DESK_Z + 0.02);
    }
  }

  /** Async dressing: the six Poly Haven CC0 models (desks, chairs, shelf, books, clock, plant). */
  async _placeModels() {
    // Student desks + chairs (one set per seat), tutor desk at the right rear.
    for (const x of Object.values(SEAT_X)) {
      await this.models.place(this.scene, 'SchoolDesk_01', { position: [x, 0, DESK_Z], targetHeight: 0.78 });
      await this.models.place(this.scene, 'SchoolChair_01', { position: [x, 0, SEAT_Z - 0.02], targetHeight: 0.85 });
    }
    await this.models.place(this.scene, 'SchoolDesk_01', { position: [2.25, 0, -1.75], rotationY: Math.PI / 2, targetHeight: 0.78 });
    await this.models.place(this.scene, 'SchoolChair_01', { position: [2.75, 0, -1.75], rotationY: -Math.PI / 2, targetHeight: 0.85 });
    // Bookshelf with the encyclopedia set on top, plant in the window corner.
    await this.models.place(this.scene, 'wooden_bookshelf_worn', { position: [-1.95, 0, -2.28], targetHeight: 1.85 });
    await this.models.place(this.scene, 'book_encyclopedia_set_01', { position: [-1.95, 1.84, -2.28], targetHeight: 0.26 });
    await this.models.place(this.scene, 'potted_plant_02', { position: [-2.72, 0, 1.05], targetHeight: 1.15 });
    // Wall clock model behind the readable canvas face.
    await this.models.place(this.scene, 'wall_clock', { position: [1.9, 1.66, -2.42], targetHeight: 0.42, contactShadow: false });
  }

  /** Procedural dressing that needs no assets: backpacks, bottle, tutor props. */
  _buildDressing() {
    const packs = [
      { x: -1.0, z: -0.7, color: 0x3a6ea5 },
      { x: 0.36, z: -0.72, color: 0xf2b705 },
      { x: 1.02, z: -0.68, color: 0x2e4a3f },
    ];
    for (const p of packs) {
      const pack = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.14), new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.8 }));
      body.position.y = 0.16;
      const flap = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.1, 0.15), new THREE.MeshStandardMaterial({ color: 0x2d3340, roughness: 0.75 }));
      flap.position.y = 0.3;
      pack.add(body, flap);
      pack.position.set(p.x, 0, p.z);
      pack.rotation.y = (p.x - 0) * 0.4;
      pack.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      groundProp(pack, { contactShadow: false });
      this.scene.add(pack);
    }
    // Water bottle by the middle desk.
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.035, 0.2, 12), new THREE.MeshStandardMaterial({ color: 0x9fc4dd, roughness: 0.25, transparent: true, opacity: 0.75 }));
    bottle.position.set(-0.28, DESK_TOP + 0.1, DESK_Z - 0.12);
    bottle.castShadow = true;
    this.scene.add(bottle);
    // Tutor desk props: notebook stack + mug (the tutor's seat is the camera, so keep it light).
    const notebook = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.035, 0.3), new THREE.MeshStandardMaterial({ color: 0x3a6ea5, roughness: 0.7 }));
    notebook.position.set(2.25, DESK_TOP + 0.02, -1.7);
    notebook.castShadow = true;
    this.scene.add(notebook);
  }

  _initAmbientLife() {
    // Sun shafts through the blinds + dust motes in the sun volume.
    this.life.addLightShafts({
      positions: [[-2.35, 1.55, -1.15], [-2.35, 1.55, -0.6], [-2.35, 1.55, -0.05]],
      rotation: [0, 0, -0.82],
      radiusTop: 0.3, radiusBottom: 1.05, height: 4.4,
      color: 0xffe2a8, opacity: 0.085,
    });
    this.life.addParticleVolume({
      center: [-1.9, 1.35, -0.55], extents: [3.0, 2.3, 3.2],
      count: 90, size: 0.042, opacity: 0.4, color: 0xfff0cc,
    });
    // A classmate walking past the corridor door now and then (ping-pong spline).
    this.classmate = createAnimatedCharacter({ id: 'classmate', name: 'Classmate', height: 1.62, hairStyle: 'curls', topColor: 0x7a4f9e, prop: 'none' });
    this.classmate.setAction('walk', 'neutral');
    this.scene.add(this.classmate.root);
    this.life.addSplineMover(this.classmate.root, [[3.85, 0, -2.4], [3.85, 0, 2.6]], {
      closed: false, speed: 1.05, character: this.classmate, startU: 0.15,
    });
  }

  _loadEnvironment() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    new HDRLoader().load(BASE + HDRI, (hdr) => {
      this.scene.environment = pmrem.fromEquirectangular(hdr).texture;
      this.scene.environmentIntensity = 0.55;
      hdr.dispose();
      pmrem.dispose();
    }, undefined, () => pmrem.dispose());
  }

  /** Register in-world interaction: hotspot rings for the views + clickable students. */
  registerInteraction(interact, onView) {
    this.interact = interact;
    for (const [view, pos] of RINGS) {
      const v = VIEWS[view];
      interact.addHotspotRing(pos, {
        id: `view-${view}`,
        label: v.label,
        hint: 'Click to look',
        color: view === 'group' ? 0xf2b705 : 0x3a6ea5,
        cameraPos: v.pos,
        cameraTarget: v.look,
        onClick: () => onView(view),
      });
    }
    for (const [id, char] of Object.entries(this.chars)) {
      const v = VIEWS[`${id}-work`];
      interact.registerInteractive(char.root, {
        id: `student-${id}`,
        label: this._names[id],
        hint: 'Click to read their worksheet up close',
        cameraPos: v.pos,
        cameraTarget: v.look,
        highlightColor: 0xf2b705,
        onClick: () => onView(`${id}-work`),
      });
    }
  }

  /** Redraw a worksheet from its stored lines (used when the case fonts arrive). */
  _redrawWork(id) {
    const ws = this.worksheets[id];
    if (!ws) return;
    this.setWork(id, ws._lines || ['Name: ', '', 'Warm-up', 'x + 4 = 9', 'x = 5'], { mark: ws._mark });
  }

  /** Redraw a student's worksheet with lines of their work (handwriting style). */
  setWork(id, lines, { mark = null } = {}) {
    const ws = this.worksheets[id];
    if (!ws) return;
    ws._lines = lines;
    ws._mark = mark;
    const g = ws.canvas.getContext('2d');
    g.fillStyle = '#fbfaf5';
    g.fillRect(0, 0, ws.canvas.width, ws.canvas.height);
    g.strokeStyle = '#c9d7e6';
    g.lineWidth = 2;
    for (let y = 90; y < ws.canvas.height; y += 56) { g.beginPath(); g.moveTo(24, y); g.lineTo(488, y); g.stroke(); }
    g.fillStyle = '#20324a';
    g.font = 'italic 38px "Patrick Hand", "Comic Sans MS", cursive';
    lines.forEach((t, i) => g.fillText(t, 36, 80 + i * 56));
    if (mark) {
      g.strokeStyle = mark === 'error' ? '#c0392b' : '#2e7d4f';
      g.lineWidth = 5;
      const y = 80 + (lines.length - 1) * 56 - 12;
      g.beginPath(); g.ellipse(250, y, 230, 30, 0, 0, Math.PI * 2); g.stroke();
      // Shape + text, not color alone (accessibility review A7).
      g.fillStyle = mark === 'error' ? '#c0392b' : '#2e7d4f';
      g.font = 'bold 52px system-ui, sans-serif';
      g.fillText(mark === 'error' ? '✗' : '✓', 16, y + 18);
    }
    ws.tex.needsUpdate = true;
  }

  setBoard(text) {
    this._boardText = text;
    const g = this.boardCanvas.getContext('2d');
    g.fillStyle = '#f7f8f6';
    g.fillRect(0, 0, 1024, 512);
    g.fillStyle = '#1d3b6e';
    g.font = '110px "Patrick Hand", "Comic Sans MS", system-ui, sans-serif';
    g.textAlign = 'center';
    g.fillText(text, 512, 290);
    this.boardTex.needsUpdate = true;
  }

  /** Draw the clock for a session time like "15:00" (session starts at 3:00 pm). */
  setClock(sessionTime) {
    const [m, s] = sessionTime.split(':').map(Number);
    const minutes = m + s / 60;
    const g = this.clockCanvas.getContext('2d');
    g.clearRect(0, 0, 256, 256);
    g.fillStyle = '#ffffff';
    g.beginPath(); g.arc(128, 128, 124, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#2a2a2a'; g.lineWidth = 8; g.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(128 + Math.sin(a) * 100, 128 - Math.cos(a) * 100);
      g.lineTo(128 + Math.sin(a) * 114, 128 - Math.cos(a) * 114);
      g.stroke();
    }
    const hand = (angle, len, width) => {
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.sin(angle) * len, 128 - Math.cos(angle) * len); g.stroke();
    };
    hand(((3 + minutes / 60) / 12) * Math.PI * 2, 58, 9);
    hand(((minutes / 60) % 1) * Math.PI * 2, 92, 6);
    this.clockTex.needsUpdate = true;
  }

  /** Cue states → character states (engaged / withdrawn / confused / waiting …). */
  _applyCueToChar(char, cues, { snap = false } = {}) {
    const action = cues.hands?.action || 'still';
    const map = {
      write: ['write', 'engaged'],
      raise: ['hand-up', 'engaged'],
      confused: ['confused', 'confused'],
      fold: ['withdrawn', 'withdrawn'],
      waiting: ['think', 'neutral'],
      still: ['seated-idle', 'neutral'],
    };
    const [act, expr] = map[action] || ['seated-idle', 'neutral'];
    char.setAction(act, expr);
    const target = cues.gaze?.target || 'tutor';
    char.lookAtWorld(this.gaze[target] || this.gaze.tutor);
    if (snap) {
      // Converge the pose immediately (reduced motion / first paint): no eases.
      const t = this.elapsed;
      for (let i = 0; i < 40; i++) char.update(1 / 60, t, 1);
    }
  }

  /** Apply student state to body language (target pose; the animator eases toward it). */
  setStudentState(id, state, cues, { snap = false } = {}) {
    const char = this.chars[id];
    if (!char) return;
    this._applyCueToChar(char, cues, { snap });
  }

  /** Lip-flap while a student answers/responds (the tutor's move landed on them). */
  setSpeaking(id, on) {
    this.chars[id]?.setSpeaking(Boolean(on));
  }

  setCalmMode(on) {
    this.life?.setCalmMode(on);
    this.interact?.setCalmMode(on);
  }

  update(dt, reduced, camera = null) {
    this.life?.setReducedMotion(reduced);
    this.elapsed += dt;
    // Gaze follows the tutor camera (you), so walking around keeps eye contact.
    if (camera) this.gaze.tutor.copy(camera.position);
    else this.gaze.tutor.set(0, 1.25, 1.4);
    // Ambient life first (its calmFactor eases toward 1 / ~0.3 / 0), then the
    // students follow the same calm factor, so the room slows as one.
    this.life?.update(dt, camera);
    const calm = reduced ? 0 : Math.max(0.25, this.life?.calmFactor ?? 1);
    for (const char of Object.values(this.chars)) {
      if (reduced) continue; // non-essential motion off; poses already snapped in setStudentState
      char.update(dt * calm, this.elapsed, 1);
    }
    if (this.classmate && !reduced) this.classmate.update(dt * Math.max(0.3, this.life?.calmFactor ?? 1), this.elapsed, 1);
  }

  /** Real-time shadows only when the preset has a shadow map. */
  applyPreset(def) {
    const on = def.shadowMapSize > 0;
    this.renderer.shadowMap.enabled = on;
    if (on && this.keyLight.shadow.mapSize.x !== def.shadowMapSize) {
      this.keyLight.shadow.mapSize.set(def.shadowMapSize, def.shadowMapSize);
      this.keyLight.shadow.map?.dispose();
      this.keyLight.shadow.map = null;
    }
    this.scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
  }
}
