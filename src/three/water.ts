import * as THREE from 'three';

export function makeWater(w: number, h: number) {
  const geo = new THREE.CircleGeometry(1, 72);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSky: { value: new THREE.Color('#f0c9a0') },
      uDeep: { value: new THREE.Color('#14332e') },
      uShallow: { value: new THREE.Color('#2f5a4a') },
      uSun: { value: new THREE.Vector3(0.2, 0.6, -0.8).normalize() },
    },
    transparent: true,
    vertexShader: `
      varying vec2 vUv; varying vec3 vWorld; varying vec3 vNormalW;
      void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position,1.0); vWorld = wp.xyz; vNormalW = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: `
      uniform float uTime; uniform vec3 uSky; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uSun;
      varying vec2 vUv; varying vec3 vWorld; varying vec3 vNormalW;
      float wave(vec2 p, vec2 d, float f, float s){ return sin(dot(p,d)*f + uTime*s); }
      void main(){
        vec2 p = vWorld.xz;
        float h = wave(p, vec2(1.0,0.3), 2.1, 0.9)*0.5 + wave(p, vec2(-0.4,1.0), 3.3, 1.3)*0.3 + wave(p, vec2(0.7,-0.8), 5.1, 1.9)*0.2;
        float hx = wave(p+vec2(0.05,0.0), vec2(1.0,0.3), 2.1, 0.9)*0.5 + wave(p+vec2(0.05,0.0), vec2(-0.4,1.0), 3.3, 1.3)*0.3 + wave(p+vec2(0.05,0.0), vec2(0.7,-0.8), 5.1, 1.9)*0.2;
        float hz = wave(p+vec2(0.0,0.05), vec2(1.0,0.3), 2.1, 0.9)*0.5 + wave(p+vec2(0.0,0.05), vec2(-0.4,1.0), 3.3, 1.3)*0.3 + wave(p+vec2(0.0,0.05), vec2(0.7,-0.8), 5.1, 1.9)*0.2;
        vec3 n = normalize(vec3(-(hx-h)*1.6, 1.0, -(hz-h)*1.6));
        vec3 v = normalize(cameraPosition - vWorld);
        float fres = pow(1.0 - max(dot(n, v), 0.0), 2.2);
        float r = length(vUv - 0.5) * 2.0;
        float depth = smoothstep(1.0, 0.25, r);
        vec3 base = mix(uShallow, uDeep, depth);
        vec3 col = mix(base, uSky * vec3(0.55, 0.72, 0.85), 0.10 + fres * 0.55);
        float spec = pow(max(dot(reflect(-uSun, n), v), 0.0), 90.0);
        col += vec3(1.0, 0.95, 0.85) * spec * 0.9;
        // caustic-ish shimmer
        col += 0.06 * (sin(p.x*7.0 + uTime*1.4) * sin(p.y*6.0 - uTime*1.1));
        float edge = smoothstep(1.0, 0.86, r);
        gl_FragColor = vec4(col, edge * (0.5 + fres * 0.45));
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.scale.set(w / 2, h / 2, 1);
  mesh.renderOrder = 2;
  return { mesh, mat };
}

export interface Koi { group: THREE.Group; curve: THREE.CatmullRomCurve3; speed: number; phase: number; tail: THREE.Mesh; body: THREE.Mesh }

export function makeKoi(center: THREE.Vector3, rx: number, rz: number, count = 7): Koi[] {
  const list: Koi[] = [];
  const colors = ['#e8622a', '#f3f0e6', '#e8622a', '#f0a04a', '#f3f0e6', '#d94f1e', '#f2c26b'];
  for (let i = 0; i < count; i++) {
    const g = new THREE.Group();
    const col = new THREE.Color(colors[i % colors.length]);
    const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.45, metalness: 0.05 });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.34, 6, 10), mat);
    body.rotation.x = Math.PI / 2; body.scale.set(1, 1, 0.8);
    g.add(body);
    // patches for the two-tone fish
    if (i % 3 === 1) { const patch = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), new THREE.MeshStandardMaterial({ color: '#e0522a', roughness: 0.5 })); patch.scale.set(1, 0.7, 1.4); patch.position.set(0.02, 0.03, 0.05); g.add(patch); }
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 3), new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
    tail.rotation.x = Math.PI / 2; tail.rotation.z = Math.PI / 2; tail.position.z = 0.3; tail.scale.set(1, 1, 0.15);
    g.add(tail);
    const fin = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.08), new THREE.MeshStandardMaterial({ color: col, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }));
    fin.position.set(0.09, -0.02, -0.02); fin.rotation.y = 0.6; g.add(fin);
    const fin2 = fin.clone(); fin2.position.x = -0.09; fin2.rotation.y = -0.6; g.add(fin2);
    const pts: THREE.Vector3[] = [];
    const n = 7, ang0 = Math.random() * Math.PI * 2, sx = rx * (0.35 + Math.random() * 0.45), sz = rz * (0.35 + Math.random() * 0.45), ox = (Math.random() - 0.5) * rx * 0.6, oz = (Math.random() - 0.5) * rz * 0.6;
    for (let k = 0; k < n; k++) { const a = ang0 + (k / n) * Math.PI * 2; pts.push(new THREE.Vector3(center.x + ox + Math.cos(a) * sx * (0.85 + Math.random() * 0.3), center.y - 0.09, center.z + oz + Math.sin(a) * sz * (0.85 + Math.random() * 0.3))); }
    const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal');
    list.push({ group: g, curve, speed: 0.012 + Math.random() * 0.012, phase: Math.random() * 10, tail, body });
  }
  return list;
}

export function updateKoi(koi: Koi[], t: number) {
  const p = new THREE.Vector3(), q = new THREE.Vector3();
  for (const k of koi) {
    const u = (t * k.speed + k.phase * 0.1) % 1;
    k.curve.getPointAt(u, p); k.curve.getPointAt((u + 0.01) % 1, q);
    k.group.position.copy(p);
    k.group.lookAt(q);
    const s = Math.sin(t * 6 + k.phase);
    k.group.rotation.y += s * 0.08;
    k.tail.rotation.y = s * 0.7;
    k.body.rotation.z = s * 0.12;
  }
}
