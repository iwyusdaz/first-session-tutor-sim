/**
 * Stylized procedural student (MakeHuman was not used; see DECISIONS.md).
 * Built from primitives with simple joints so posture, gaze and hand activity can
 * be animated by blending toward a target pose. Faces are subtle: eyes that blink,
 * no mouth and no lip sync, so attention stays on body language.
 * @module scenes/student
 */
import * as THREE from 'three';

const lerp = (a, b, k) => a + (b - a) * k;

/** Seeded generator (mulberry32) so blink timing is reproducible per student. */
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Student {
  /**
   * @param {string} id 'A' | 'B' | 'C'
   * @param {object} def entry from content/student-mixes.json students
   */
  constructor(id, def) {
    this.id = id;
    this.def = def;
    this.group = new THREE.Group();
    this.group.name = `student-${id}`;
    const L = def.look;
    const skin = new THREE.MeshStandardMaterial({ color: L.skin, roughness: 0.7 });
    const hair = new THREE.MeshStandardMaterial({ color: L.hair, roughness: 0.85 });
    const shirt = new THREE.MeshStandardMaterial({ color: L.shirt, roughness: 0.9 });
    const pants = new THREE.MeshStandardMaterial({ color: 0x2d3340, roughness: 0.9 });

    // Hips sit on the chair seat (0.47 m); the spine pivots at the hips to lean.
    this.hips = new THREE.Group();
    this.hips.position.y = 0.47;
    this.group.add(this.hips);
    const thighs = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.38), pants);
    thighs.position.set(0, 0.04, 0.17);
    const shins = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 0.12), pants);
    shins.position.set(0, -0.2, 0.34);
    this.hips.add(thighs, shins);

    this.spine = new THREE.Group();
    this.hips.add(this.spine);
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.3, 4, 12), shirt);
    torso.position.y = 0.27;
    torso.scale.set(1, 1, 0.68);
    this.spine.add(torso);

    // Head with eyes; neck pivot for gaze.
    this.neck = new THREE.Group();
    this.neck.position.y = 0.55;
    this.spine.add(this.neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.105, 24, 18), skin);
    head.position.y = 0.12;
    head.scale.set(0.92, 1.05, 1);
    this.neck.add(head);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.4 });
    this.eyes = [];
    for (const x of [-0.035, 0.035]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 8), eyeMat);
      eye.position.set(x, 0.135, 0.095);
      this.neck.add(eye);
      this.eyes.push(eye);
    }
    // Hair: a cap; long hair adds a back panel. The hood was removed as a
    // withdrawal marker (representation review: see design/character-design.md).
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.112, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), hair);
    cap.position.y = 0.135;
    this.neck.add(cap);
    if (L.hairStyle === 'long') {
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.06), hair);
      back.position.set(0, 0.03, -0.08);
      this.neck.add(back);
    }

    // Arms: shoulder → elbow joints; a pencil in the right hand.
    this.arms = {};
    for (const side of [-1, 1]) {
      const shoulder = new THREE.Group();
      shoulder.position.set(0.18 * side, 0.47, 0);
      this.spine.add(shoulder);
      const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.2, 4, 8), shirt);
      upper.position.y = -0.13;
      shoulder.add(upper);
      const elbow = new THREE.Group();
      elbow.position.y = -0.26;
      shoulder.add(elbow);
      const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.036, 0.19, 4, 8), skin);
      fore.position.y = -0.12;
      elbow.add(fore);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), skin);
      hand.position.y = -0.25;
      elbow.add(hand);
      this.arms[side] = { shoulder, elbow, hand };
    }
    const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.16, 8), new THREE.MeshStandardMaterial({ color: 0xe8b630, roughness: 0.6 }));
    pencil.position.set(0, -0.27, 0.04);
    pencil.rotation.x = Math.PI / 3;
    this.arms[1].elbow.add(pencil);
    this.pencil = pencil;

    this.group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

    // Pose state: current values ease toward targets.
    this.pose = { lean: 0, headPitch: 0, yaw: 0, action: 'still' };
    this.target = { lean: 0, headPitch: 0, yaw: 0, action: 'still' };
    this.rand = seeded(id.charCodeAt(0) * 2654435761);
    this.t = this.rand() * 10;
    this.blinkIn = 2 + this.rand() * 3;
  }

  /** Set the target pose from cue descriptions and a world-space gaze target. */
  setTarget(cues, gazeWorld, snap = false) {
    this.group.updateMatrixWorld(true);
    const local = this.group.worldToLocal(gazeWorld.clone());
    const yaw = Math.atan2(local.x, local.z);
    // Head pitch aims at the gaze point from the head, so "looking down at the
    // worksheet" and "looking at you" differ visibly at session distance (V9).
    const neckLocal = this.group.worldToLocal(this.neck.getWorldPosition(new THREE.Vector3()));
    const pitch = Math.atan2(local.y - neckLocal.y, Math.hypot(local.x - neckLocal.x, local.z - neckLocal.z));
    this.target = { lean: cues.posture.lean, headPitch: THREE.MathUtils.clamp(pitch, -0.45, 0.35), yaw: THREE.MathUtils.clamp(yaw, -1.0, 1.0), action: cues.hands.action };
    if (snap) this.pose = { ...this.target };
  }

  /** Arm angles for each hand action: [shoulderX, shoulderZ, elbowX] per side. */
  static armPose(action, side, t) {
    switch (action) {
      // Upper arm forward-down (~-0.95) plus elbow ~-0.62 puts the forearm level on the table.
      case 'raise': return side === 1 ? [-2.8, -0.15, -0.2] : [-0.95, -0.08, -0.62];
      case 'write': return side === 1 ? [-1.0, 0.05, -0.6 + Math.sin(t * 9) * 0.06] : [-1.05, -0.05, -0.55];
      // Confused: pencil hovering over the line, slight tremble, other arm resting.
      case 'confused': return side === 1 ? [-1.15, 0.08, -1.0 + Math.sin(t * 2.2) * 0.05] : [-0.95, -0.08, -0.62];
      // Waiting: pencil held still in the lap-side hand, no writing motion.
      case 'waiting': return side === 1 ? [-0.95, 0.08, -0.75] : [-0.95, -0.08, -0.62];
      // Arms folded: shoulder pulls the upper arm inward and slightly forward
      // (X ~ -0.3, Z toward the midline) and the elbow folds the forearm across
      // the chest, so the hands rest on the opposite upper arm — read as crossed
      // arms from the tutor seat, not raised fists.
      case 'fold': return side === 1 ? [-0.3, -0.5, -1.5] : [-0.3, 0.5, -1.5];
      default: return side === 1 ? [-0.95, 0.08, -0.62] : [-0.95, -0.08, -0.62];
    }
  }

  update(dt, reduced) {
    this.t += dt;
    const k = reduced ? 1 : 1 - Math.exp(-dt * 3.2); // ease toward targets; snap under reduced motion
    this.pose.lean = lerp(this.pose.lean, this.target.lean, k);
    this.pose.headPitch = lerp(this.pose.headPitch, this.target.headPitch, k);
    this.pose.yaw = lerp(this.pose.yaw, this.target.yaw, k);
    this.pose.action = this.target.action;

    const breathe = reduced ? 0 : Math.sin(this.t * 1.6) * 0.006;
    this.spine.rotation.x = this.pose.lean;
    // A slight torso yaw toward the gaze target makes head direction readable (V9).
    this.spine.rotation.y = 0.3 * this.pose.yaw;
    this.spine.position.y = breathe;
    this.neck.rotation.set(this.pose.headPitch + (this.pose.action === 'write' ? 0.2 : 0), this.pose.yaw, 0);
    for (const side of [-1, 1]) {
      const [sx, sz, ex] = Student.armPose(this.pose.action, side, reduced ? 0 : this.t);
      const arm = this.arms[side];
      arm.shoulder.rotation.x = lerp(arm.shoulder.rotation.x, sx, k);
      arm.shoulder.rotation.z = lerp(arm.shoulder.rotation.z, sz, k);
      arm.elbow.rotation.x = lerp(arm.elbow.rotation.x, ex, k);
    }
    this.pencil.visible = this.pose.action !== 'fold';

    // Blink: eyes close for ~120 ms every few seconds (kept even with reduced motion; it is not camera motion).
    this.blinkIn -= dt;
    const closed = this.blinkIn < 0 && this.blinkIn > -0.12;
    for (const e of this.eyes) e.scale.y = closed ? 0.15 : 1;
    if (this.blinkIn <= -0.12) this.blinkIn = 2.5 + this.rand() * 3.5;
  }
}
