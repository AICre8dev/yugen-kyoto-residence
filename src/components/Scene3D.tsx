import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { buildWorld } from '../three/world';
import { walk } from '../data/chapters';
import { seasons, type SeasonKey } from '../three/season';
import * as T from '../three/textures';

export interface SceneHandle { setSeason: (s: SeasonKey) => void }

interface Props { season: SeasonKey; onProgress: (p: number) => void; onFail: () => void; spineRef: React.RefObject<HTMLDivElement> }

export default function Scene3D({ season, onProgress, onFail, spineRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seasonRef = useRef<SeasonKey>(season);
  seasonRef.current = season;

  useEffect(() => {
    const canvas = canvasRef.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    } catch (e) { onFail(); return; }
    const isMobile = matchMedia('(max-width: 720px)').matches;
    renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1 : 1.5));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#e9c9a3', 26, 100);
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 400);
    let world: ReturnType<typeof buildWorld>;
    try { world = buildWorld(); scene.add(world.group); } catch (e) { console.error(e); onFail(); renderer.dispose(); return; }

    // camera walk
    const pts = walk.map(w => new THREE.Vector3(...w.position));
    const looks = walk.map(w => new THREE.Vector3(...w.lookAt));
    const posCurve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
    const lookCurve = new THREE.CatmullRomCurve3(looks, false, 'centripetal', 0.5);
    // map arc-length progress → curve parameter by cumulative segment distance (same metric as chapterU)
    const cum: number[] = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
    const total = cum[cum.length - 1];
    const paramFor = (p: number) => { const d = p * total; let i = 0; while (i < cum.length - 2 && cum[i + 1] < d) i++; const f = (d - cum[i]) / Math.max(1e-6, cum[i + 1] - cum[i]); return (i + Math.min(1, Math.max(0, f))) / (pts.length - 1); };

    let target = 0, current = 0;
    const onScroll = () => {
      const spine = spineRef.current; if (!spine) return;
      const h = spine.offsetHeight - innerHeight; target = Math.min(1, Math.max(0, scrollY / Math.max(1, h)));
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    const resize = () => { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    addEventListener('resize', resize); resize();

    // season blending
    const cur = { ...seasons[season] } as any;
    const colorKeys = ['fog', 'sun', 'hemiSky', 'hemiGround', 'grass', 'shrub', 'particle', 'skyTop', 'skyMid', 'horizon'] as const;
    const colors: Record<string, THREE.Color> = {}; for (const k of colorKeys) colors[k] = new THREE.Color(cur[k]);
    const foliage = [0, 1, 2].map(i => new THREE.Color(cur.foliage[i]));
    const targetCols: Record<string, THREE.Color> = {}; const targetFol = [0, 1, 2].map(() => new THREE.Color());
    const nums = { sunI: cur.sunI, ambient: cur.ambient, snow: cur.snow, exposure: cur.exposure, fogNear: cur.fogNear, fogFar: cur.fogFar };
    const targetNums = { ...nums };
    let activeSeason: SeasonKey = season;
    const applyTargets = (s: SeasonKey) => { const p = seasons[s]; for (const k of colorKeys) targetCols[k] = new THREE.Color(p[k]); for (let i = 0; i < 3; i++) targetFol[i].set(p.foliage[i]); Object.assign(targetNums, { sunI: p.sunI, ambient: p.ambient, snow: p.snow, exposure: p.exposure, fogNear: p.fogNear, fogFar: p.fogFar }); world.particleMat.size = p.kind === 'snow' ? 0.14 : p.kind === 'mote' ? 0.08 : 0.16; world.particleMat.opacity = p.kind === 'mote' ? 0.5 : 0.85; };
    applyTargets(season);
    let skyKey = '';
    const pushSeason = () => {
      scene.fog!.color.copy(colors.fog); (scene.fog as THREE.Fog).near = nums.fogNear; (scene.fog as THREE.Fog).far = nums.fogFar;
      world.sun.color.copy(colors.sun); world.sun.intensity = nums.sunI; world.hemi.color.copy(colors.hemiSky); world.hemi.groundColor.copy(colors.hemiGround); world.ambient.intensity = nums.ambient;
      world.grassMat.color.copy(colors.grass); world.shrubMat.color.copy(colors.shrub); world.particleMat.color.copy(colors.particle);
      for (let i = 0; i < 3; i++) world.foliageMats[i].color.copy(foliage[i]);
      for (const m of world.snowMeshes) (m.material as THREE.MeshStandardMaterial).opacity = nums.snow;
      renderer.toneMappingExposure = nums.exposure;
      const key = colors.skyTop.getHexString() + colors.skyMid.getHexString() + colors.horizon.getHexString();
      if (key !== skyKey) { skyKey = key; world.skyMat.map?.dispose(); world.skyMat.map = T.skyTexture('#' + colors.skyTop.getHexString(), '#' + colors.skyMid.getHexString(), '#' + colors.horizon.getHexString()); world.skyMat.needsUpdate = true; world.water.uniforms.uSky.value.copy(colors.horizon); }
    };
    pushSeason();

    let raf = 0, last = performance.now(), t = 0, skyTick = 0, running = true;
    const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      if (seasonRef.current !== activeSeason) { activeSeason = seasonRef.current; applyTargets(activeSeason); }
      const k = 1 - Math.pow(0.001, dt / 1.2); // ~1.2 s to settle
      let dirty = false;
      for (const key of colorKeys) { if (!colors[key].equals(targetCols[key])) { colors[key].lerp(targetCols[key], k); dirty = true; } }
      for (let i = 0; i < 3; i++) if (!foliage[i].equals(targetFol[i])) { foliage[i].lerp(targetFol[i], k); dirty = true; }
      for (const key of Object.keys(nums) as (keyof typeof nums)[]) { if (Math.abs(nums[key] - targetNums[key]) > 1e-4) { nums[key] += (targetNums[key] - nums[key]) * k; dirty = true; } }
      if (dirty && (skyTick++ % 3 === 0)) pushSeason();

      current += (target - current) * (1 - Math.pow(0.001, dt / 0.9));
      const u = paramFor(current);
      posCurve.getPoint(u, camPos); lookCurve.getPoint(u, camLook);
      camPos.x += Math.sin(t * 1.9) * 0.02; camPos.y += Math.sin(t * 2.3) * 0.015;
      camera.position.copy(camPos); camera.lookAt(camLook);
      world.update(t, dt);
      renderer.render(scene, camera);
      onProgress(current);
    };
    raf = requestAnimationFrame(loop);
    const vis = () => { running = document.visibilityState === 'visible'; last = performance.now(); };
    document.addEventListener('visibilitychange', vis);
    return () => { cancelAnimationFrame(raf); removeEventListener('scroll', onScroll); removeEventListener('resize', resize); document.removeEventListener('visibilitychange', vis); renderer.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className="scene" aria-hidden="true" />;
}
