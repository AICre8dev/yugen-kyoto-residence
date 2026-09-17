import * as THREE from 'three';
import * as T from './textures';
import { makeWater, makeKoi, updateKoi, type Koi } from './water';
import type { Palette } from './season';

export interface World {
  group: THREE.Group;
  sun: THREE.DirectionalLight; hemi: THREE.HemisphereLight; ambient: THREE.AmbientLight;
  sky: THREE.Mesh; skyMat: THREE.MeshBasicMaterial;
  foliageMats: THREE.MeshStandardMaterial[]; shrubMat: THREE.MeshStandardMaterial; grassMat: THREE.MeshStandardMaterial;
  snowMeshes: THREE.Mesh[]; particles: THREE.Points; particleMat: THREE.PointsMaterial; rays: THREE.Mesh[];
  water: THREE.ShaderMaterial; koi: Koi[]; steam: THREE.Points;
  update: (t: number, dt: number) => void;
}

const FLOOR = 0.6, WALL_H = 2.8, TOP = FLOOR + WALL_H;

export function buildWorld(): World {
  const group = new THREE.Group();
  const add = (m: THREE.Object3D) => group.add(m);

  // ---------- materials ----------
  const plasterTex = T.plasterTexture();
  const plaster = new THREE.MeshStandardMaterial({ map: plasterTex, color: '#cbb08a', roughness: 0.95 });
  const plasterDark = new THREE.MeshStandardMaterial({ map: T.plasterTexture('#a8886a'), color: '#c9b49a', roughness: 0.95 });
  const woodTex = T.woodTexture();
  const wood = new THREE.MeshStandardMaterial({ map: woodTex, color: '#a5764b', roughness: 0.7 });
  const woodDark = new THREE.MeshStandardMaterial({ map: T.woodTexture('#5a3a20', '#2e1c0d'), color: '#5e3f25', roughness: 0.75 });
  const hinoki = new THREE.MeshStandardMaterial({ map: T.woodTexture('#d3b27f', '#a8814f'), color: '#dcb98a', roughness: 0.6 });
  const floorWood = new THREE.MeshStandardMaterial({ map: T.woodTexture('#c8a072', '#a07a50'), color: '#cfa87a', roughness: 0.6 });
  floorWood.map!.repeat.set(6, 1); floorWood.map!.rotation = Math.PI / 2; floorWood.map!.center.set(0.5, 0.5);
  const tatamiTex = T.tatamiTexture();
  const tatami = new THREE.MeshStandardMaterial({ map: tatamiTex, color: '#d7c98a', roughness: 0.9 });
  const tileTex = T.roofTileTexture(); tileTex.repeat.set(40, 14);
  const tile = new THREE.MeshStandardMaterial({ map: tileTex, color: '#cfc8c0', roughness: 1, side: THREE.DoubleSide });
  const gravelTex = T.gravelTexture(); gravelTex.repeat.set(2, 6);
  const gravel = new THREE.MeshStandardMaterial({ map: gravelTex, color: '#e2dccd', roughness: 1 });
  const mossTex = T.mossTexture(); mossTex.repeat.set(30, 30);
  const grassMat = new THREE.MeshStandardMaterial({ map: mossTex, color: '#5c7238', roughness: 1 });
  const stoneTex = T.stoneTexture();
  const stone = new THREE.MeshStandardMaterial({ map: stoneTex, color: '#8b8375', roughness: 0.9 });
  const slate = new THREE.MeshStandardMaterial({ color: '#3b3d40', roughness: 0.6, metalness: 0.05 });
  const shojiTex = T.shojiTexture();
  const shoji = new THREE.MeshStandardMaterial({ map: shojiTex, emissive: '#f3e3c6', emissiveMap: shojiTex, emissiveIntensity: 0.45, roughness: 0.9, side: THREE.DoubleSide });
  const fusumaTex = T.fusumaTexture(true);
  const fusuma = new THREE.MeshStandardMaterial({ map: fusumaTex, roughness: 0.85, side: THREE.DoubleSide });
  const fusumaPlain = new THREE.MeshStandardMaterial({ map: T.fusumaTexture(false), roughness: 0.85, side: THREE.DoubleSide });
  const paper = new THREE.MeshStandardMaterial({ color: '#f6ead2', emissive: '#ffd9a0', emissiveIntensity: 0.9, roughness: 1 });
  const black = new THREE.MeshStandardMaterial({ color: '#17140f', roughness: 0.4 });
  const brass = new THREE.MeshStandardMaterial({ color: '#c9a45c', roughness: 0.35, metalness: 0.9 });
  const ceramic = new THREE.MeshStandardMaterial({ color: '#3d4a4a', roughness: 0.35 });
  const linen = new THREE.MeshStandardMaterial({ color: '#efe7d6', roughness: 1 });
  const indigo = new THREE.MeshStandardMaterial({ map: T.indigoTexture(), roughness: 1 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#ffffff', transmission: 0.9, roughness: 0.05, thickness: 0.02, transparent: true, opacity: 0.35 });
  const trunkMat = new THREE.MeshStandardMaterial({ map: T.woodTexture('#6b4a2e', '#3d2816'), color: '#7a5a3c', roughness: 0.95 });
  const foliageMats = [0, 1, 2].map(() => new THREE.MeshStandardMaterial({ color: '#c8532a', roughness: 0.9, alphaMap: T.leafTexture(), alphaTest: 0.5, side: THREE.DoubleSide }));
  const shrubMat = new THREE.MeshStandardMaterial({ color: '#6e7b34', roughness: 1, flatShading: true });
  const snowMat = new THREE.MeshStandardMaterial({ color: '#f4f6f8', roughness: 1, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const snowMeshes: THREE.Mesh[] = [];

  const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, shadow = true) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); mesh.position.set(x, y, z);
    mesh.castShadow = shadow; mesh.receiveShadow = true; add(mesh); return mesh;
  };

  // ---------- sky + ground ----------
  const skyMat = new THREE.MeshBasicMaterial({ map: T.skyTexture('#c9a98a', '#f0c9a0', '#ffb877'), side: THREE.BackSide, fog: false, depthWrite: false });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(180, 32, 16), skyMat); add(sky);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), grassMat); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; add(ground);
  const snowGround = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), snowMat); snowGround.rotation.x = -Math.PI / 2; snowGround.position.y = 0.01; add(snowGround); snowMeshes.push(snowGround);
  // distant hills
  const hillMat = new THREE.MeshStandardMaterial({ color: '#6e7c5a', roughness: 1 });
  for (let i = 0; i < 9; i++) { const h = new THREE.Mesh(new THREE.SphereGeometry(28 + Math.random() * 30, 24, 12), hillMat); h.position.set(-90 + i * 24 + Math.random() * 10, -18, -95 - Math.random() * 30); h.scale.y = 0.55; add(h); }

  // ---------- boundary wall + gate ----------
  const wallCap = (w: number, d: number, x: number, z: number) => { box(w, 0.22, d, tile, x, 1.95, z); };
  box(15.6, 1.9, 0.5, plasterDark, -9.4, 0.95, 20); box(15.6, 1.9, 0.5, plasterDark, 9.4, 0.95, 20); wallCap(15.9, 0.8, -9.4, 20); wallCap(15.9, 0.8, 9.4, 20);
  box(0.5, 1.9, 58, plasterDark, -17.5, 0.95, -9); box(0.5, 1.9, 58, plasterDark, 17.5, 0.95, -9); wallCap(0.8, 58.3, -17.5, -9); wallCap(0.8, 58.3, 17.5, -9);
  box(35.5, 1.9, 0.5, plasterDark, 0, 0.95, -38); wallCap(35.8, 0.8, 0, -38);
  // gate
  box(0.36, 3.2, 0.36, woodDark, -1.7, 1.6, 20); box(0.36, 3.2, 0.36, woodDark, 1.7, 1.6, 20);
  box(4.6, 0.22, 0.5, woodDark, 0, 3.15, 20);
  const gateRoof = new THREE.Mesh(hipRoof(5.4, 2.4, 0.9, 1.4), tile); gateRoof.position.set(0, 3.3, 20); gateRoof.castShadow = true; add(gateRoof);
  box(2.8, 0.14, 0.9, stone, 0, 0.07, 20);

  // ---------- path ----------
  const path = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 10.5), gravel); path.rotation.x = -Math.PI / 2; path.position.set(0, 0.02, 14.6); path.receiveShadow = true; add(path);
  const stepGeo = new THREE.DodecahedronGeometry(0.6, 0);
  for (let i = 0; i < 9; i++) { const s = new THREE.Mesh(stepGeo, stone); s.position.set(Math.sin(i * 1.7) * 0.35, 0.06, 19 - i * 1.15); s.scale.set(1 + Math.random() * 0.3, 0.16, 0.9 + Math.random() * 0.3); s.rotation.y = Math.random() * Math.PI; s.receiveShadow = true; s.castShadow = true; add(s); }

  // ---------- house platform ----------
  box(24.4, 0.5, 29.6, woodDark, 0, FLOOR - 0.25, -6); // platform slab (interior floors sit on top)
  for (let x = -12; x <= 12; x += 3) for (const z of [-20.4, 9.2]) box(0.3, 0.4, 0.3, stone, x, 0.2, z);
  // engawa decks front + rear
  const deckMat = floorWood.clone(); (deckMat.map = floorWood.map!.clone()); deckMat.map!.rotation = 0; deckMat.map!.repeat.set(1, 12); deckMat.map!.needsUpdate = true;
  box(24.4, 0.12, 1.6, deckMat, 0, FLOOR + 0.06, 8.8); box(24.4, 0.12, 2.0, deckMat, 0, FLOOR + 0.06, -21);
  // step to front door
  box(3.2, 0.22, 1.0, stone, 0, 0.3, 9.9);

  // ---------- roof (hipped, with eaves) ----------
  const roof = new THREE.Mesh(hipRoof(27.6, 33.6, 3.4, 12), tile); roof.position.set(0, TOP - 0.05, -6); roof.castShadow = true; roof.receiveShadow = true; add(roof);
  const roofSnow = new THREE.Mesh(hipRoof(27.8, 33.8, 3.45, 12), snowMat); roofSnow.position.set(0, TOP + 0.02, -6); add(roofSnow); snowMeshes.push(roofSnow);
  box(0.5, 0.36, 21.5, woodDark, 0, TOP + 3.45, -6); // ridge beam
  // eave fascia + rafters
  box(27.6, 0.3, 0.2, woodDark, 0, TOP - 0.1, 10.8); box(27.6, 0.3, 0.2, woodDark, 0, TOP - 0.1, -22.8);
  box(0.2, 0.3, 33.6, woodDark, -13.8, TOP - 0.1, -6); box(0.2, 0.3, 33.6, woodDark, 13.8, TOP - 0.1, -6);
  for (let x = -13; x <= 13; x += 1.3) { box(0.12, 0.16, 2.4, woodDark, x, TOP - 0.16, 9.6, false); box(0.12, 0.16, 2.4, woodDark, x, TOP - 0.16, -21.6, false); }

  // ---------- helpers for walls ----------
  // outer wall run along X (fixed z) or Z (fixed x). `openings` = list of [from, to] along the run left transparent.
  function wallRun(axis: 'x' | 'z', fixed: number, from: number, to: number, mat: THREE.Material, openings: [number, number][] = [], thickness = 0.16) {
    const segs: [number, number][] = []; let cur = from;
    const ops = [...openings].sort((a, b) => a[0] - b[0]);
    for (const [a, b] of ops) { if (a > cur) segs.push([cur, a]); cur = Math.max(cur, b); }
    if (cur < to) segs.push([cur, to]);
    for (const [a, b] of segs) {
      const len = b - a, mid = (a + b) / 2;
      if (axis === 'x') box(len, WALL_H, thickness, mat, mid, FLOOR + WALL_H / 2, fixed); else box(thickness, WALL_H, len, mat, fixed, FLOOR + WALL_H / 2, mid);
    }
    // lintel over openings + posts at edges
    for (const [a, b] of ops) {
      const len = b - a, mid = (a + b) / 2;
      if (axis === 'x') { box(len + 0.3, 0.25, thickness + 0.1, woodDark, mid, TOP - 0.85, fixed); box(0.18, WALL_H, 0.18, woodDark, a, FLOOR + WALL_H / 2, fixed); box(0.18, WALL_H, 0.18, woodDark, b, FLOOR + WALL_H / 2, fixed); }
      else { box(thickness + 0.1, 0.25, len + 0.3, woodDark, fixed, TOP - 0.85, mid); box(0.18, WALL_H, 0.18, woodDark, fixed, FLOOR + WALL_H / 2, a); box(0.18, WALL_H, 0.18, woodDark, fixed, FLOOR + WALL_H / 2, b); }
    }
  }
  // posts every ~1.8 m along a wall run and a nageshi beam at door-head height
  function postsAlong(axis: 'x' | 'z', fixed: number, from: number, to: number, step = 1.8, offset = 0.1) {
    for (let v = from; v <= to + 0.01; v += step) { if (axis === 'x') box(0.16, WALL_H, 0.16, woodDark, v, FLOOR + WALL_H / 2, fixed + offset); else box(0.16, WALL_H, 0.16, woodDark, fixed + offset, FLOOR + WALL_H / 2, v); }
    if (axis === 'x') box(to - from, 0.14, 0.12, woodDark, (from + to) / 2, FLOOR + 1.95, fixed + offset); else box(0.12, 0.14, to - from, woodDark, fixed + offset, FLOOR + 1.95, (from + to) / 2);
  }
  function shojiPanels(axis: 'x' | 'z', fixed: number, from: number, to: number, panelW = 0.9) {
    const n = Math.max(1, Math.round((to - from) / panelW)); const w = (to - from) / n;
    for (let i = 0; i < n; i++) {
      const c = from + w * (i + 0.5);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.04, WALL_H - 0.3), shoji);
      if (axis === 'x') { m.position.set(c, FLOOR + WALL_H / 2 - 0.05, fixed); } else { m.position.set(fixed, FLOOR + WALL_H / 2 - 0.05, c); m.rotation.y = Math.PI / 2; }
      add(m);
    }
    // bottom rail and top rail
    if (axis === 'x') { box(to - from, 0.12, 0.2, woodDark, (from + to) / 2, FLOOR + 0.06, fixed); box(to - from, 0.2, 0.2, woodDark, (from + to) / 2, TOP - 0.1, fixed); }
    else { box(0.2, 0.12, to - from, woodDark, fixed, FLOOR + 0.06, (from + to) / 2); box(0.2, 0.2, to - from, woodDark, fixed, TOP - 0.1, (from + to) / 2); }
  }
  function ceiling(x0: number, x1: number, z0: number, z1: number) {
    const c = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), woodDark); c.rotation.x = Math.PI / 2; c.position.set((x0 + x1) / 2, TOP, (z0 + z1) / 2); add(c);
    for (let z = z0 + 0.9; z < z1; z += 1.8) box(x1 - x0, 0.22, 0.18, woodDark, (x0 + x1) / 2, TOP - 0.11, z, false);
  }
  function tatamiFloor(x0: number, x1: number, z0: number, z1: number) {
    // 0.9 × 1.8 mats laid alternately
    const mw = 0.9, ml = 1.8; let flip = false;
    for (let x = x0; x < x1 - 0.01; x += flip ? ml : mw) {
      const w = Math.min(flip ? ml : mw, x1 - x);
      for (let z = z0; z < z1 - 0.01; z += flip ? mw : ml) {
        const d = Math.min(flip ? mw : ml, z1 - z);
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), tatami); m.rotation.x = -Math.PI / 2; if (flip) m.rotation.z = Math.PI / 2;
        m.position.set(x + w / 2, FLOOR + 0.005, z + d / 2); m.receiveShadow = true; add(m);
      }
      flip = !flip;
    }
  }
  function woodFloor(x0: number, x1: number, z0: number, z1: number) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), floorWood); m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, FLOOR + 0.005, (z0 + z1) / 2); m.receiveShadow = true; add(m);
  }
  function lamp(x: number, y: number, z: number, kind: 'pendant' | 'andon' | 'lantern', intensity = 6) {
    const g = new THREE.Group(); g.position.set(x, y, z);
    if (kind === 'pendant') { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 16, 1, true), paper); g.add(s); const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, TOP - y, 6), black); cord.position.y = (TOP - y) / 2; g.add(cord); }
    if (kind === 'andon') { const s = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.5, 0.28), paper); g.add(s); for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.56, 0.02), black); p.position.set(dx * 0.14, 0, dz * 0.14); g.add(p); } }
    if (kind === 'lantern') { const s = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), paper); g.add(s); }
    const l = new THREE.PointLight('#ffc98a', intensity, 9, 1.6); l.position.y = -0.05; g.add(l);
    add(g); return g;
  }

  // ---------- interior layout ----------
  // corridor x -1.2..1.2, z -20..3 ; genkan x -3..3, z 3..8
  woodFloor(-1.2, 1.2, -20, 3); woodFloor(-3, 3, 3, 8);
  box(6, 0.12, 2, slate, 0, FLOOR - 0.2, 7, false); // genkan sunken stone step
  tatamiFloor(-11.9, -1.2, -6, 3); tatamiFloor(1.2, 11.9, -6, 3); woodFloor(1.2, 11.9, -14, -6); tatamiFloor(-11.9, -1.2, -14, -6);
  woodFloor(1.2, 10, -20, -14);
  const slateFloor = new THREE.Mesh(new THREE.PlaneGeometry(10.7, 6), slate); slateFloor.rotation.x = -Math.PI / 2; slateFloor.position.set(-6.55, FLOOR + 0.005, -17); slateFloor.receiveShadow = true; add(slateFloor);
  // storage bays either side of the genkan (closed rooms)
  tatamiFloor(-12, -3, 3, 8); tatamiFloor(3, 12, 3, 8);

  // outer walls (shoji on most of the perimeter, glazed doors on the living room east side)
  wallRun('x', 8, -12, 12, plaster, [[-1.4, 1.4], [-11, -3.4], [3.4, 11]]); shojiPanels('x', 8, -11, -3.4); shojiPanels('x', 8, 3.4, 11);
  box(2.8, 0.1, 0.1, woodDark, 0, TOP - 0.7, 8); // door head
  wallRun('x', -20, -12, 12, plaster, [[-1.2, 1.2], [-11, -2.4], [2.4, 11]]); shojiPanels('x', -20, -11, -2.4); shojiPanels('x', -20, 2.4, 11);
  wallRun('z', -12, -20, 8, plaster, [[-19, -15], [-13, -7], [-5, 2]]); shojiPanels('z', -12, -19, -15); shojiPanels('z', -12, -13, -7); shojiPanels('z', -12, -5, 2);
  wallRun('z', 12, -20, 8, plaster, [[-13, -7], [-5, 2]]); shojiPanels('z', 12, -13, -7);
  // glazed sliding doors, living room east
  for (let i = 0; i < 4; i++) { const z = -5 + 0.875 + i * 1.75; const gl = new THREE.Mesh(new THREE.PlaneGeometry(1.7, WALL_H - 0.3), glass); gl.position.set(12, FLOOR + WALL_H / 2 - 0.05, z); gl.rotation.y = Math.PI / 2; add(gl); box(0.1, WALL_H - 0.3, 0.06, woodDark, 12, FLOOR + WALL_H / 2 - 0.05, z - 0.85); }
  box(0.2, 0.12, 7, woodDark, 12, FLOOR + 0.06, -1.5); box(0.2, 0.2, 7, woodDark, 12, TOP - 0.1, -1.5);
  // corner posts + exterior posts under eaves
  for (const x of [-12, -6, 0, 6, 12]) for (const z of [8, -20]) box(0.24, WALL_H, 0.24, woodDark, x, FLOOR + WALL_H / 2, z);
  for (const z of [-14, -6, 3]) for (const x of [-12, 12]) box(0.24, WALL_H, 0.24, woodDark, x, FLOOR + WALL_H / 2, z);

  // interior partitions
  wallRun('z', -1.2, -20, 3, plaster, [[-17, -15], [-9, -7], [-1, 2]]); postsAlong('z', -1.2, -20, 3, 1.8, -0.1);
  wallRun('z', 1.2, -20, 3, plaster, [[-17, -15], [-9, -7], [-1, 2]]); postsAlong('z', 1.2, -20, 3, 1.8, 0.1);
  wallRun('x', 3, -12, -1.2, plaster); wallRun('x', 3, 1.2, 12, plaster);
  wallRun('z', -3, 3, 8, plaster); wallRun('z', 3, 3, 8, plaster); postsAlong('z', -3, 3, 8, 2.5, 0.1); postsAlong('z', 3, 3, 8, 2.5, -0.1);
  wallRun('x', -6, -12, -1.2, plaster); wallRun('x', -6, 1.2, 12, plaster);
  wallRun('x', -14, -12, -1.2, plaster); wallRun('x', -14, 1.2, 12, plaster);
  
  // fusuma sliding panels dressing the tea room / bedroom inner walls
  for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.75, WALL_H - 0.3), i % 2 ? fusuma : fusumaPlain); p.position.set(-10.6 + i * 1.8, FLOOR + WALL_H / 2 - 0.05, -5.9); add(p); }
  for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.75, WALL_H - 0.3), i % 2 ? fusumaPlain : fusuma); p.position.set(-3 - 1.8 * i - 0.9, FLOOR + WALL_H / 2 - 0.05, -13.9); add(p); }
  // ceilings
  ceiling(-12, 12, -20, 8);

  // ---------- room dressing ----------
  // GENKAN: tokonoma alcove on the west wall with scroll + vase
  box(0.2, 1.2, 1.6, woodDark, -2.85, FLOOR + 0.1, 4.6); // alcove plinth
  const scroll = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 1.25), new THREE.MeshStandardMaterial({ map: T.scrollTexture('静'), roughness: 0.9 })); scroll.position.set(-2.9, FLOOR + 1.75, 4.6); scroll.rotation.y = Math.PI / 2; add(scroll);
  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, 0.34, 14), ceramic); vase.position.set(-2.6, FLOOR + 0.37, 5.1); vase.castShadow = true; add(vase);
  branch(-2.6, FLOOR + 0.5, 5.1, 0.7);
  lamp(0, TOP - 0.6, 5.5, 'pendant', 5);
  // CORRIDOR lamps + bamboo in the far light
  lamp(0, TOP - 0.55, -3, 'pendant', 4); lamp(0, TOP - 0.55, -11, 'pendant', 4); lamp(0, TOP - 0.55, -18, 'pendant', 4);
  // TEA ROOM: low table, cushions, tokonoma with scroll, hearth
  box(1.6, 0.08, 0.9, black, -6, FLOOR + 0.34, -1.5); for (const [dx, dz] of [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]]) box(0.08, 0.3, 0.08, black, -6 + dx, FLOOR + 0.15, -1.5 + dz);
  for (const [dx, dz] of [[-1.3, 0], [1.3, 0], [0, -1.0], [0, 1.0]]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.06, 0.62), new THREE.MeshStandardMaterial({ color: '#6e3a30', roughness: 1 })); c.position.set(-6 + dx, FLOOR + 0.04, -1.5 + dz); add(c); }
  box(0.22, 1.1, 1.8, woodDark, -9.7, FLOOR + 0.1, -4.6);
  const scroll2 = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 1.2), new THREE.MeshStandardMaterial({ map: T.scrollTexture('寂'), roughness: 0.9 })); scroll2.position.set(-9.85, FLOOR + 1.7, -4.6); scroll2.rotation.y = Math.PI / 2; add(scroll2);
  const teaBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.08, 12), ceramic); teaBowl.position.set(-6.3, FLOOR + 0.42, -1.4); add(teaBowl);
  lamp(-6, TOP - 0.7, -1.5, 'pendant', 5);
  // LIVING: table, legless chairs, shelves, blossom branch
  box(1.8, 0.06, 0.9, black, 6, FLOOR + 0.36, -2); for (const dx of [-0.8, 0.8]) box(0.1, 0.34, 0.8, black, 6 + dx, FLOOR + 0.17, -2);
  for (const [dx, dz] of [[-1.3, 0], [1.3, 0]]) { box(0.6, 0.1, 0.6, linen, 6 + dx, FLOOR + 0.05, -2 + dz); box(0.6, 0.55, 0.08, hinoki, 6 + dx, FLOOR + 0.35, -2 + dz + (dx < 0 ? -0.3 : 0.3)); }
  box(2.2, 0.06, 0.4, woodDark, 5.5, FLOOR + 0.9, 2.7); box(2.2, 0.06, 0.4, woodDark, 5.5, FLOOR + 1.5, 2.7); box(1.2, 0.5, 0.45, woodDark, 8.5, FLOOR + 0.25, 2.6);
  const vase2 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.5, 14), ceramic); vase2.position.set(8.6, FLOOR + 0.75, 2.5); vase2.castShadow = true; add(vase2); blossomBranch(8.6, FLOOR + 1.0, 2.5, 1.5);
  lamp(6, TOP - 0.7, -2, 'pendant', 5);
  // KITCHEN: counter, slatted cabinets, tap, stoneware
  box(3.6, 0.9, 0.8, hinoki, 7, FLOOR + 0.45, -11.6); box(3.6, 0.06, 0.9, hinoki, 7, FLOOR + 0.93, -11.6);
  for (let i = 0; i < 12; i++) box(0.06, 0.8, 0.02, woodDark, 5.3 + i * 0.3, FLOOR + 0.45, -11.18, false);
  box(0.5, 0.12, 0.35, ceramic, 6.4, FLOOR + 0.97, -11.6);
  const tap = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 8, 20, Math.PI), brass); tap.position.set(6.4, FLOOR + 1.1, -11.8); add(tap); box(0.036, 0.3, 0.036, brass, 6.24, FLOOR + 1.05, -11.8);
  box(0.36, 2.0, 3.6, woodDark, 9.8, FLOOR + 1.0, -10); for (let i = 0; i < 14; i++) box(0.02, 1.9, 0.08, hinoki, 9.6, FLOOR + 1.0, -11.7 + i * 0.25, false);
  for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.12, 10), ceramic); b.position.set(7.6 + i * 0.22, FLOOR + 1.02, -11.5); add(b); }
  box(1.6, 0.06, 0.9, black, 4.5, FLOOR + 0.34, -8.5); lamp(6, TOP - 0.6, -10, 'pendant', 5);
  // BEDROOM: platform bed, indigo quilt, pillows, andon lamp, painted screen
  box(2.2, 0.28, 2.6, woodDark, -6.5, FLOOR + 0.14, -10.5);
  const quilt = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.22, 2.1), indigo); quilt.position.set(-6.5, FLOOR + 0.38, -10.2); quilt.castShadow = true; add(quilt);
  for (const dx of [-0.5, 0.5]) { const p = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.36, 4, 10), linen); p.rotation.z = Math.PI / 2; p.position.set(-6.5 + dx, FLOOR + 0.52, -11.35); add(p); }
  const screenMat = new THREE.MeshStandardMaterial({ map: T.fusumaTexture(true), roughness: 0.85, side: THREE.DoubleSide });
  for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.7), screenMat); s.position.set(-8.0 + i * 0.86, FLOOR + 0.9, -13.6 + (i % 2 ? 0.18 : 0)); s.rotation.y = i % 2 ? 0.35 : -0.35; add(s); }
  box(0.5, 0.45, 0.5, woodDark, -4.8, FLOOR + 0.22, -11.6); lamp(-4.8, FLOOR + 0.75, -11.6, 'andon', 4);
  // ONSEN: cypress tub, water, steam, bamboo screen, slate
  const tub = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.05, 0.8, 32, 1, true), hinoki); tub.position.set(-6.5, FLOOR + 0.4, -17.5); tub.material.side = THREE.DoubleSide; tub.castShadow = true; add(tub);
  const tubWater = new THREE.Mesh(new THREE.CircleGeometry(1.06, 32), new THREE.MeshPhysicalMaterial({ color: '#2f4a44', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.9 })); tubWater.rotation.x = -Math.PI / 2; tubWater.position.set(-6.5, FLOOR + 0.78, -17.5); add(tubWater);
  const tubBase = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.05, 32), hinoki); tubBase.position.set(-6.5, FLOOR + 0.03, -17.5); add(tubBase);
  for (let i = 0; i < 12; i++) box(0.1, 2.4, 0.1, new THREE.MeshStandardMaterial({ color: '#6f8a3a', roughness: 0.8 }), -11.6 + 0.35 + i * 0.6, FLOOR + 1.2, -19.5, false);
  lamp(-6.5, TOP - 0.7, -17.5, 'pendant', 4); box(0.8, 0.4, 0.4, hinoki, -4.2, FLOOR + 0.2, -16);
  // stone lanterns + point lights in garden
  const stoneLantern = (x: number, z: number) => { box(0.5, 0.1, 0.5, stone, x, 0.05, z); box(0.22, 1.0, 0.22, stone, x, 0.55, z); box(0.55, 0.12, 0.55, stone, x, 1.1, z); const lb = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.4, 0.42), paper); lb.position.set(x, 1.36, z); add(lb); const cap = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.35, 4), stone); cap.position.set(x, 1.72, z); cap.rotation.y = Math.PI / 4; add(cap); const l = new THREE.PointLight('#ffc98a', 3, 8, 1.8); l.position.set(x, 1.36, z); add(l); };
  stoneLantern(-3.2, 12.5); stoneLantern(3.4, 11.2); stoneLantern(-4.5, -24); stoneLantern(14.5, -2);

  // ---------- rear garden: pond, bridge, stones, moss mounds ----------
  const pondC = new THREE.Vector3(0, 0.03, -28.5);
  const { mesh: water, mat: waterMat } = makeWater(11, 7.6); water.position.copy(pondC); add(water);
  const pondBed = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshStandardMaterial({ color: '#2b3a2c', roughness: 1 })); pondBed.rotation.x = -Math.PI / 2; pondBed.scale.set(5.6, 3.9, 1); pondBed.position.set(0, 0.005, -28.5); add(pondBed);
  const koi = makeKoi(pondC, 4.6, 3.0, 7); for (const k of koi) { k.group.scale.setScalar(1.7); add(k.group); }
  const rockGeo = new THREE.DodecahedronGeometry(1, 1);
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; const r = new THREE.Mesh(rockGeo, stone); r.position.set(Math.cos(a) * 5.9 + (Math.random() - 0.5) * 0.6, 0.15, -28.5 + Math.sin(a) * 4.2 + (Math.random() - 0.5) * 0.6); r.scale.set(0.5 + Math.random() * 0.6, 0.3 + Math.random() * 0.35, 0.5 + Math.random() * 0.5); r.rotation.set(Math.random(), Math.random() * 3, Math.random()); r.castShadow = true; r.receiveShadow = true; add(r); }
  for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(rockGeo, stone); s.position.set(-8 + i * 2.6 + (Math.random() - 0.5), 0.2, -34.5 + (Math.random() - 0.5) * 2); s.scale.set(0.7 + Math.random() * 0.7, 0.5 + Math.random() * 0.8, 0.7 + Math.random() * 0.7); s.rotation.y = Math.random() * 3; s.castShadow = true; add(s); }
  // arched bridge across the pond (along z at x = 2.6)
  for (let i = 0; i < 14; i++) { const t = i / 13; const z = -25.2 - t * 6.6; const y = 0.35 + Math.sin(t * Math.PI) * 0.7; const seg = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.52), stone); seg.position.set(2.6, y, z); seg.rotation.x = -Math.cos(t * Math.PI) * 0.33; seg.castShadow = true; seg.receiveShadow = true; add(seg); if (i % 3 === 0) { box(0.1, 0.7, 0.1, woodDark, 1.85, y + 0.4, z); box(0.1, 0.7, 0.1, woodDark, 3.35, y + 0.4, z); } }
  for (let i = 0; i < 13; i++) { const t0 = i / 13, t1 = (i + 1) / 13; const z0 = -25.2 - t0 * 6.6, z1 = -25.2 - t1 * 6.6; const y0 = 0.35 + Math.sin(t0 * Math.PI) * 0.7 + 0.75, y1 = 0.35 + Math.sin(t1 * Math.PI) * 0.7 + 0.75; for (const x of [1.85, 3.35]) { const len = Math.hypot(z1 - z0, y1 - y0); const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, len + 0.02), woodDark); rail.position.set(x, (y0 + y1) / 2, (z0 + z1) / 2); rail.rotation.x = Math.atan2(y1 - y0, z0 - z1); add(rail); } }
  // moss mounds + shrubs
  const shrubGeo = new THREE.IcosahedronGeometry(1, 2);
  const shrubs: THREE.Mesh[] = [];
  const placeShrub = (x: number, z: number, s: number) => { const m = new THREE.Mesh(shrubGeo, shrubMat); m.position.set(x, s * 0.55, z); m.scale.set(s, s * 0.75, s); m.rotation.y = Math.random() * 3; m.castShadow = true; m.receiveShadow = true; add(m); shrubs.push(m); };
  for (const [x, z, s] of [[-6, 16, 1.1], [6.5, 14, 0.9], [-9, 11, 1.3], [10, 11.5, 1.0], [-14, 15, 1.5], [14.5, 17, 1.2], [-15, -6, 1.3], [15.5, -8, 1.1], [-7, -33, 1.0], [7.5, -32, 1.2], [-12, -30, 1.4], [12.5, -29, 1.1], [15, 5, 1.0], [-15.5, 4, 1.1]]) placeShrub(x, z, s);
  // moss mounds (flattened)
  for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(shrubGeo, grassMat); const s = 0.8 + Math.random() * 1.0; m.position.set(-16 + Math.random() * 32, s * 0.12, -36 + Math.random() * 12); m.scale.set(s, s * 0.22, s); add(m); }

  // ---------- trees ----------
  const leafGeo = new THREE.PlaneGeometry(0.9, 0.7);
  function tree(x: number, z: number, h: number, spread: number, matIdx: number) {
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16 * h / 4, 0.32 * h / 4, h, 9), trunkMat); trunk.position.y = h / 2; trunk.rotation.z = (Math.random() - 0.5) * 0.18; trunk.castShadow = true; g.add(trunk);
    const branches = 4 + Math.floor(Math.random() * 3);
    const anchors: THREE.Vector3[] = [];
    for (let b = 0; b < branches; b++) {
      const a = (b / branches) * Math.PI * 2 + Math.random(); const len = spread * (0.5 + Math.random() * 0.5);
      const br = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, len, 6), trunkMat);
      const y0 = h * (0.55 + Math.random() * 0.35);
      br.position.set(Math.cos(a) * len * 0.4, y0 + len * 0.3, Math.sin(a) * len * 0.4);
      br.rotation.z = -Math.cos(a) * 1.0; br.rotation.x = Math.sin(a) * 1.0; br.castShadow = true; g.add(br);
      anchors.push(new THREE.Vector3(Math.cos(a) * len * 0.8, y0 + len * 0.55, Math.sin(a) * len * 0.8));
    }
    anchors.push(new THREE.Vector3(0, h + spread * 0.3, 0));
    const count = 220;
    const inst = new THREE.InstancedMesh(leafGeo, foliageMats[matIdx], count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const an = anchors[Math.floor(Math.random() * anchors.length)];
      const r = spread * (0.35 + Math.random() * 0.5); const th = Math.random() * Math.PI * 2; const ph = Math.acos(2 * Math.random() - 1);
      dummy.position.set(an.x + r * Math.sin(ph) * Math.cos(th), an.y + r * Math.cos(ph) * 0.55, an.z + r * Math.sin(ph) * Math.sin(th));
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const s = 0.8 + Math.random() * 0.9; dummy.scale.set(s, s, s); dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
    }
    inst.castShadow = true; inst.receiveShadow = true; g.add(inst);
    // a soft core so the canopy reads solid from a distance
    for (const an of anchors) { const core = new THREE.Mesh(shrubGeo, foliageMats[matIdx]); core.position.copy(an); core.scale.setScalar(spread * 0.42); g.add(core); }
    add(g); return g;
  }
  tree(-9, 15.5, 5.5, 3.6, 0); tree(9.5, 16, 4.8, 3.2, 1); tree(-16.3, 2, 6.2, 3.4, 2); tree(15, 12.5, 5.0, 3.4, 0);
  tree(-16.4, -12, 5.8, 3.4, 1); tree(16.5, -16, 6.4, 3.4, 2); tree(-11, -33, 5.0, 3.2, 0); tree(10, -35, 6.0, 4.0, 1); tree(-11.5, 24.5, 4.6, 3.0, 2); tree(12, 25, 4.8, 3.0, 0);
  // bamboo grove seen at the end of the corridor / beyond the rear garden
  const bambooMat = new THREE.MeshStandardMaterial({ color: '#7f9a4a', roughness: 0.8 });
  for (let i = 0; i < 40; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 7 + Math.random() * 3, 6), bambooMat); b.position.set(-16 + Math.random() * 32, 4, -40 + Math.random() * 3 - 1.5); add(b); }

  // ---------- lights ----------
  const sun = new THREE.DirectionalLight('#ffb677', 2.6);
  sun.position.set(-16, 22, -60); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera as THREE.OrthographicCamera; sc.left = -40; sc.right = 40; sc.top = 40; sc.bottom = -40; sc.near = 1; sc.far = 160; sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.03; sun.shadow.radius = 4;
  sun.target.position.set(0, 0, -6); add(sun); add(sun.target);
  const hemi = new THREE.HemisphereLight('#ffe1b8', '#46552c', 1.05); add(hemi);
  const fill = new THREE.DirectionalLight('#ffd8b0', 1.7); fill.position.set(-30, 26, 60); fill.target.position.set(0, 2, 0); add(fill); add(fill.target);
  const ambient = new THREE.AmbientLight('#ffffff', 0.35); add(ambient);
  const sunDisc = new THREE.Object3D(); sunDisc.position.set(-30, 26, -150);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.softDotTexture(), color: '#ffd9a0', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, fog: false, depthWrite: false })); sunGlow.position.copy(sunDisc.position); sunGlow.scale.set(60, 60, 1); add(sunGlow);

  // ---------- god rays ----------
  const rays: THREE.Mesh[] = [];
  const rayMat = new THREE.MeshBasicMaterial({ color: '#ffd9a8', transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const rayDefs: [number, number, number, number, number, number][] = [[-7, 14, -6, 0.30, 80, 1.6], [-2.5, 13, -4, 0.20, 80, 1.0], [3, 15, -2, 0.10, 84, 2.0], [7.5, 12, 0, 0.0, 76, 1.2], [-12, 10, -8, 0.44, 70, 1.4], [11.6, 3, -10, -0.2, 40, 0.8]];
  for (const [x, y, z, rot, len, w] of rayDefs) { const r = new THREE.Mesh(new THREE.PlaneGeometry(w, len), rayMat.clone()); r.position.set(x, y, z); r.rotation.set(0.62, 0, rot); r.userData.base = 0.016 + Math.random() * 0.016; add(r); rays.push(r); }

  // ---------- particles ----------
  const N = 700; const pos = new Float32Array(N * 3); const vel = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = -22 + Math.random() * 44; pos[i * 3 + 1] = Math.random() * 12; pos[i * 3 + 2] = -40 + Math.random() * 75; vel[i * 3] = (Math.random() - 0.5) * 0.3; vel[i * 3 + 1] = -0.25 - Math.random() * 0.4; vel[i * 3 + 2] = (Math.random() - 0.5) * 0.3; }
  const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const particleMat = new THREE.PointsMaterial({ color: '#e8873c', size: 0.16, map: T.softDotTexture(), transparent: true, opacity: 0.85, depthWrite: false, sizeAttenuation: true });
  const particles = new THREE.Points(pGeo, particleMat); add(particles);
  // steam over the tub
  const SN = 60; const spos = new Float32Array(SN * 3); for (let i = 0; i < SN; i++) { spos[i * 3] = -6.5 + (Math.random() - 0.5) * 1.6; spos[i * 3 + 1] = FLOOR + 0.8 + Math.random() * 1.4; spos[i * 3 + 2] = -17.5 + (Math.random() - 0.5) * 1.6; }
  const sGeo = new THREE.BufferGeometry(); sGeo.setAttribute('position', new THREE.BufferAttribute(spos, 3));
  const steam = new THREE.Points(sGeo, new THREE.PointsMaterial({ color: '#ffffff', size: 0.5, map: T.softDotTexture(), transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending })); add(steam);

  // ---------- small helpers used above ----------
  function branch(x: number, y: number, z: number, len: number) {
    const m = new THREE.MeshStandardMaterial({ color: '#3a2a1c', roughness: 1 });
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.02, len, 5), m); b.position.set(x, y + len / 2, z); b.rotation.z = 0.25; add(b);
    for (let i = 0; i < 5; i++) { const bud = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), new THREE.MeshStandardMaterial({ color: i % 2 ? '#f7dfe4' : '#f0a9b8' })); bud.position.set(x + 0.15 * (i / 5) + (Math.random() - 0.5) * 0.08, y + len * (0.3 + i * 0.14), z + (Math.random() - 0.5) * 0.1); add(bud); }
  }
  function blossomBranch(x: number, y: number, z: number, len: number) {
    const m = new THREE.MeshStandardMaterial({ color: '#3a2a1c', roughness: 1 });
    const main = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.03, len, 6), m); main.position.set(x, y + len / 2, z); main.rotation.z = 0.2; add(main);
    for (let k = 0; k < 4; k++) { const l2 = len * (0.35 + Math.random() * 0.3); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.015, l2, 5), m); b.position.set(x + (Math.random() - 0.5) * 0.5, y + len * (0.4 + k * 0.15), z + (Math.random() - 0.5) * 0.4); b.rotation.set(Math.random() - 0.5, 0, (Math.random() - 0.5) * 1.6); add(b); }
    const pm = new THREE.MeshStandardMaterial({ color: '#f4b7c6', roughness: 1 }), pm2 = new THREE.MeshStandardMaterial({ color: '#fbe7ec', roughness: 1 });
    for (let i = 0; i < 70; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), i % 3 ? pm : pm2); p.position.set(x + (Math.random() - 0.5) * 1.2, y + len * (0.35 + Math.random() * 0.75), z + (Math.random() - 0.5) * 1.0); add(p); }
  }

  const tmp = new THREE.Vector3();
  const update = (t: number, dt: number) => {
    waterMat.uniforms.uTime.value = t;
    updateKoi(koi, t);
    const p = particles.geometry.attributes.position as THREE.BufferAttribute; const arr = p.array as Float32Array;
    for (let i = 0; i < N; i++) {
      arr[i * 3] += (vel[i * 3] + Math.sin(t * 0.8 + i) * 0.25) * dt; arr[i * 3 + 1] += vel[i * 3 + 1] * dt; arr[i * 3 + 2] += vel[i * 3 + 2] * dt;
      if (arr[i * 3 + 1] < 0) { arr[i * 3 + 1] = 12; arr[i * 3] = -22 + Math.random() * 44; arr[i * 3 + 2] = -40 + Math.random() * 75; }
    }
    p.needsUpdate = true;
    const sp = steam.geometry.attributes.position as THREE.BufferAttribute; const sa = sp.array as Float32Array;
    for (let i = 0; i < SN; i++) { sa[i * 3 + 1] += dt * 0.25; sa[i * 3] += Math.sin(t + i) * dt * 0.05; if (sa[i * 3 + 1] > FLOOR + 2.4) sa[i * 3 + 1] = FLOOR + 0.8; }
    sp.needsUpdate = true;
    for (let i = 0; i < rays.length; i++) { const m = rays[i].material as THREE.MeshBasicMaterial; m.opacity = rays[i].userData.base * (0.75 + 0.25 * Math.sin(t * 0.5 + i * 1.3)); }
    tmp.set(0, 0, 0);
  };

  return { group, sun, hemi, ambient, sky, skyMat, foliageMats, shrubMat, grassMat, snowMeshes, particles, particleMat, rays, water: waterMat, koi, steam, update };
}

// hipped roof: rectangular base (w × d) rising to a ridge of length `ridge` at height h, with tile UVs
export function hipRoof(w: number, d: number, h: number, ridge: number) {
  const hw = w / 2, hd = d / 2, hr = ridge / 2;
  const v = [
    // base corners (y=0)
    [-hw, 0, hd], [hw, 0, hd], [hw, 0, -hd], [-hw, 0, -hd],
    // ridge ends (y=h) — ridge runs along z
    [0, h, hr], [0, h, -hr],
  ];
  const faces = [
    [0, 1, 4], // front hip (toward +z)
    [1, 2, 5, 4], // right slope
    [2, 3, 5], // rear hip
    [3, 0, 4, 5], // left slope
  ];
  const positions: number[] = [], uvs: number[] = [];
  for (const f of faces) {
    const tri = f.length === 3 ? [f] : [[f[0], f[1], f[2]], [f[0], f[2], f[3]]];
    for (const t of tri) for (const i of t) { const p = v[i]; positions.push(p[0], p[1], p[2]); uvs.push((p[0] + hw) / w * 4 + (p[2] + hd) / d * 4, p[1] / h); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.computeVertexNormals();
  return g;
}
