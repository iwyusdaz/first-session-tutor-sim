/**
 * Tutoring room: table, chairs, whiteboard, wall clock, window light (CC0 Poly Haven
 * HDRI for image-based lighting), worksheets with readable student work, and three
 * stylized procedural students. 1 unit = 1 meter. The learner sits at the near side
 * of the table (seated tutor view); preset looks frame each student, the board and
 * the clock.
 * Faces are deliberately subtle (no mouths, no lip sync): posture, gaze and hand
 * activity carry the cues (plan 07 §6.1; design/character-design.md).
 * @module scenes/tutoring-room
 */
import * as THREE from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { Student } from './student.js';

const BASE = import.meta.env.BASE_URL || './';
/** CC0 Poly Haven PBR sets (1k JPG; names content-hashed by scripts/fetch-assets.mjs). */
const TEX = {
  table: {
    color: 'assets/tex/wood_table_001_color-460dd08d24.jpg',
    normal: 'assets/tex/wood_table_001_normal-9bf7ddf572.jpg',
    rough: 'assets/tex/wood_table_001_rough-a2ca9ae89d.jpg',
  },
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
 * framed for the visible area left of the session side panel, which covers the
 * right edge of the canvas (visual review V1 / multimedia MP5). */
export const VIEWS = {
  group: { pos: [0.05, 1.22, 1.35], look: [0.5, 0.82, -0.3], label: 'The whole group' },
  A: { pos: [0.15, 1.2, 1.1], look: [-0.62, 0.95, -0.45], label: 'Jordan' },
  B: { pos: [0, 1.2, 1.1], look: [0, 0.95, -0.62], label: 'Talia' },
  C: { pos: [-0.15, 1.2, 1.1], look: [0.62, 0.95, -0.45], label: 'Sam' },
  'A-work': { pos: [-0.42, 1.08, 0.08], look: [-0.62, 0.76, -0.5], label: "Jordan's worksheet" },
  'B-work': { pos: [-0.2, 1.08, 0.08], look: [0, 0.76, -0.5], label: "Talia's worksheet" },
  'C-work': { pos: [0.02, 1.08, 0.08], look: [0.62, 0.76, -0.5], label: "Sam's worksheet" },
  board: { pos: [0, 1.25, 1.2], look: [0, 1.45, -2.4], label: 'Whiteboard' },
  clock: { pos: [0, 1.25, 1.2], look: [1.9, 1.95, -2.4], label: 'Wall clock' },
  overview: { pos: [0, 3.1, 2.6], look: [0.5, 0.7, -0.4], label: 'Overview' },
};

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
   */
  constructor(scene, { mixes, renderer }) {
    this.scene = scene;
    this.renderer = renderer;
    this.students = {};
    this.worksheets = {};
    this._buildRoom();
    this._buildStudents(mixes);
    this._loadEnvironment();
  }

  _box(w, h, d, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    this.scene.add(m);
    return m;
  }

  _buildRoom() {
    const s = this.scene;
    s.background = new THREE.Color(0xd9dde1);
    // PBR sets at real-world scale: repeat = surface size / texture's physical size
    // (laminate 1.7 m, plaster 2 m, table wood ~2 m per Poly Haven metadata).
    const loader = new THREE.TextureLoader();
    const pbr = (set, rx, ry, extra = {}) => {
      const t = (p, srgb) => {
        const tx = loader.load(BASE + p);
        tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
        tx.repeat.set(rx, ry);
        tx.anisotropy = 8;
        if (srgb) tx.colorSpace = THREE.SRGBColorSpace;
        return tx;
      };
      return new THREE.MeshStandardMaterial({ map: t(set.color, true), normalMap: t(set.normal), roughnessMap: t(set.rough), ...extra });
    };
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), pbr(TEX.floor, 7 / 1.7, 7 / 1.7));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    s.add(floor);

    // Back wall faces the camera (7 m × 3 m); side walls run 7 m deep.
    const backWallMat = pbr(TEX.wall, 3.5, 1.5, { color: 0xf1ede4 });
    const sideWallMat = pbr(TEX.wall, 3.5, 1.5, { color: 0xf1ede4 });
    this._box(7, 3, 0.1, backWallMat, 0, 1.5, -2.5);
    this._box(0.1, 3, 7, sideWallMat, -3.2, 1.5, 0);
    this._box(0.1, 3, 7, sideWallMat, 3.2, 1.5, 0);
    // Skirting board along the walls (painted MDF).
    const skirtMat = new THREE.MeshStandardMaterial({ color: 0xdcd8cf, roughness: 0.55 });
    this._box(6.3, 0.1, 0.02, skirtMat, 0, 0.05, -2.44);
    this._box(0.02, 0.1, 7, skirtMat, -3.14, 0.05, 0);
    this._box(0.02, 0.1, 7, skirtMat, 3.14, 0.05, 0);

    // Window on the left wall: glass panel over a simple exterior (sky and tree
    // line), so a gaze toward it reads as looking out (visual review V8).
    const exterior = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.7), new THREE.MeshBasicMaterial({ map: canvasTexture(256, 256, (g) => {
      const sky = g.createLinearGradient(0, 0, 0, 256);
      sky.addColorStop(0, '#9fc4dd');
      sky.addColorStop(0.65, '#d8e8f0');
      sky.addColorStop(0.7, '#7da05e');
      sky.addColorStop(1, '#5c7f47');
      g.fillStyle = sky;
      g.fillRect(0, 0, 256, 256);
      g.fillStyle = '#4e6f3d';
      for (const [x, y, r] of [[30, 150, 34], [95, 138, 40], [170, 152, 36], [235, 142, 30]]) {
        g.beginPath(); g.ellipse(x, y, r, r * 0.85, 0, 0, Math.PI * 2); g.fill();
      }
    }), fog: false }));
    exterior.position.set(-3.3, 1.65, -0.6);
    exterior.rotation.y = Math.PI / 2;
    s.add(exterior);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.3), new THREE.MeshStandardMaterial({ color: 0xdfeaf2, emissive: 0xcfe0ee, emissiveIntensity: 0.45, transparent: true, opacity: 0.55 }));
    glass.position.set(-3.14, 1.65, -0.6);
    glass.rotation.y = Math.PI / 2;
    s.add(glass);
    this.windowPos = new THREE.Vector3(-3.1, 1.6, -0.6);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xf2f2f0, roughness: 0.6 });
    this._box(0.06, 1.36, 0.06, frameMat, -3.12, 1.65, -0.6);
    this._box(0.06, 0.06, 2.26, frameMat, -3.12, 1.65, -0.6);

    // Whiteboard with the problem of the moment (canvas texture, updated per moment).
    this.boardCanvas = document.createElement('canvas');
    this.boardCanvas.width = 1024; this.boardCanvas.height = 512;
    this.boardTex = new THREE.CanvasTexture(this.boardCanvas);
    this.boardTex.colorSpace = THREE.SRGBColorSpace;
    this._box(2.3, 1.15, 0.04, new THREE.MeshStandardMaterial({ color: 0x9aa1a8, roughness: 0.5, metalness: 0.3 }), 0, 1.45, -2.43);
    const board = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.05), new THREE.MeshStandardMaterial({ map: this.boardTex, roughness: 0.35 }));
    board.position.set(0, 1.45, -2.4);
    s.add(board);
    this.setBoard('3x − 5 = 10');

    // Wall clock (canvas face, hands redrawn per moment).
    this.clockCanvas = document.createElement('canvas');
    this.clockCanvas.width = 256; this.clockCanvas.height = 256;
    this.clockTex = new THREE.CanvasTexture(this.clockCanvas);
    this.clockTex.colorSpace = THREE.SRGBColorSpace;
    const clock = new THREE.Mesh(new THREE.CircleGeometry(0.2, 40), new THREE.MeshStandardMaterial({ map: this.clockTex, roughness: 0.4 }));
    clock.position.set(1.9, 1.95, -2.44);
    s.add(clock);
    this.setClock('0:00');

    // Table (CC0 wood texture, tinted lighter/desaturated so it does not compete
    // with the figures, which carry the cues — visual V7) and chairs.
    const woodMat = pbr(TEX.table, 1, 0.5, { color: 0xcfc0b2 });
    this._box(1.9, 0.04, 1.0, woodMat, 0, 0.74, -0.25);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x3d4146, roughness: 0.5, metalness: 0.6 });
    for (const [x, z] of [[-0.88, -0.7], [0.88, -0.7], [-0.88, 0.2], [0.88, 0.2]]) this._box(0.04, 0.72, 0.04, legMat, x, 0.36, z);
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x2c5d8f, roughness: 0.6 });
    this.chairMat = chairMat;
    // Students' chairs only: the camera is the tutor, so a tutor chair would block the view.
    for (const x of [-0.62, 0, 0.62]) this._chair(x, -0.95, 0, chairMat, legMat);

    // Light: window-side key light (shadows by preset) + soft fill.
    s.add(new THREE.HemisphereLight(0xf4f1ea, 0x6d6a64, 0.55));
    const key = new THREE.DirectionalLight(0xfff6e8, 1.6);
    key.position.set(-3, 3.2, 0.6);
    key.target.position.set(0, 0.8, -0.4);
    s.add(key, key.target);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5, near: 0.5, far: 9 });
    key.shadow.bias = -0.0005;
    this.keyLight = key;
  }

  _chair(x, z, rot, seatMat, legMat) {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.4), seatMat);
    seat.position.y = 0.45;
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.03), seatMat);
    back.position.set(0, 0.68, -0.19);
    g.add(seat, back);
    for (const [lx, lz] of [[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.45, 0.025), legMat);
      leg.position.set(lx, 0.225, lz);
      g.add(leg);
    }
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    this.scene.add(g);
  }

  _buildStudents(mixes) {
    for (const [id, def] of Object.entries(mixes.students)) {
      const st = new Student(id, def);
      st.group.position.set(def.look.seat * 0.62, 0, -0.95);
      this.scene.add(st.group);
      this.students[id] = st;
      // Worksheet in front of each student: readable "handwriting" from a canvas.
      const sheetCanvas = document.createElement('canvas');
      sheetCanvas.width = 512; sheetCanvas.height = 680;
      const sheetTex = new THREE.CanvasTexture(sheetCanvas);
      sheetTex.colorSpace = THREE.SRGBColorSpace;
      sheetTex.anisotropy = 8;
      const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.28), new THREE.MeshStandardMaterial({ map: sheetTex, roughness: 0.9 }));
      sheet.rotation.x = -Math.PI / 2;
      sheet.rotation.z = Math.PI + (def.look.seat * 0.12);
      sheet.position.set(def.look.seat * 0.62, 0.762, -0.5);
      sheet.receiveShadow = true;
      this.scene.add(sheet);
      this.worksheets[id] = { canvas: sheetCanvas, tex: sheetTex, mesh: sheet };
      this.setWork(id, ['Name: ' + def.name, '', 'Warm-up', 'x + 4 = 9', 'x = 5']);
    }
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

  /** Redraw a student's worksheet with lines of their work (handwriting style). */
  setWork(id, lines, { mark = null } = {}) {
    const ws = this.worksheets[id];
    if (!ws) return;
    const g = ws.canvas.getContext('2d');
    g.fillStyle = '#fbfaf5';
    g.fillRect(0, 0, ws.canvas.width, ws.canvas.height);
    g.strokeStyle = '#c9d7e6';
    g.lineWidth = 2;
    for (let y = 90; y < ws.canvas.height; y += 56) { g.beginPath(); g.moveTo(24, y); g.lineTo(488, y); g.stroke(); }
    g.fillStyle = '#20324a';
    g.font = 'italic 38px "Comic Sans MS", "Segoe Print", "Bradley Hand", cursive';
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
    const g = this.boardCanvas.getContext('2d');
    g.fillStyle = '#f7f8f6';
    g.fillRect(0, 0, 1024, 512);
    g.fillStyle = '#1d3b6e';
    g.font = 'bold 110px "Marker Felt", "Comic Sans MS", system-ui, sans-serif';
    g.textAlign = 'center';
    g.fillText(text, 512, 290);
    this.boardTex.needsUpdate = true;
  }

  /** Draw the clock for a session time like "14:00" (session starts at 3:00 pm). */
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
    hand((minutes / 60) * Math.PI * 2, 92, 6);
    this.clockTex.needsUpdate = true;
  }

  /** Apply student state to body language (target pose; the animator eases toward it). */
  setStudentState(id, state, cues, { snap = false } = {}) {
    const look = { worksheet: new THREE.Vector3(this.students[id].group.position.x, 0.76, -0.5), tutor: new THREE.Vector3(0, 1.2, 1.1), window: this.windowPos };
    this.students[id].setTarget(cues, look[cues.gaze.target], snap);
  }

  update(dt, reduced) {
    for (const st of Object.values(this.students)) st.update(dt, reduced);
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
