import * as THREE from 'three';

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, g: c.getContext('2d')! };
}
function tex(c: HTMLCanvasElement, rx = 1, ry = 1, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 4;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
// small seeded rng so every load looks the same
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

export function plasterTexture(base = '#b99a72') {
  const { c, g } = canvas(512, 512);
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26000; i++) {
    const v = Math.floor(rnd() * 60) - 30;
    g.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 240 : 10},${v > 0 ? 220 : 0},${Math.abs(v) / 260})`;
    g.fillRect(rnd() * 512, rnd() * 512, 1 + rnd() * 2, 1 + rnd() * 2);
  }
  // soft trowel strokes
  for (let i = 0; i < 90; i++) {
    g.strokeStyle = `rgba(255,235,205,${0.04 + rnd() * 0.05})`;
    g.lineWidth = 6 + rnd() * 20;
    g.beginPath(); const x = rnd() * 512, y = rnd() * 512;
    g.moveTo(x, y); g.quadraticCurveTo(x + 60 - rnd() * 120, y + 30, x + 120 - rnd() * 240, y - 20 + rnd() * 40); g.stroke();
  }
  return tex(c, 2, 2);
}

export function woodTexture(base = '#9a6a3c', dark = '#5d3b1d') {
  const { c, g } = canvas(256, 1024);
  g.fillStyle = base; g.fillRect(0, 0, 256, 1024);
  for (let i = 0; i < 70; i++) {
    const x = rnd() * 256; const w = 1 + rnd() * 4;
    g.strokeStyle = i % 3 === 0 ? dark : `rgba(60,35,15,${0.15 + rnd() * 0.3})`;
    g.lineWidth = w; g.beginPath(); g.moveTo(x, 0);
    for (let y = 0; y <= 1024; y += 64) g.lineTo(x + Math.sin(y / 90 + i) * 6, y);
    g.stroke();
  }
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(0,0,0,${rnd() * 0.12})`; g.fillRect(rnd() * 256, rnd() * 1024, 1, 3); }
  return tex(c, 1, 1);
}

export function tatamiTexture() {
  // one mat: woven igusa field with dark cloth borders on the long edges
  const { c, g } = canvas(512, 1024);
  g.fillStyle = '#c9b877'; g.fillRect(0, 0, 512, 1024);
  for (let y = 0; y < 1024; y += 3) { g.fillStyle = y % 6 === 0 ? 'rgba(90,80,30,0.22)' : 'rgba(255,245,190,0.14)'; g.fillRect(0, y, 512, 1.5); }
  for (let x = 0; x < 512; x += 2) { g.fillStyle = `rgba(0,0,0,${rnd() * 0.05})`; g.fillRect(x, 0, 1, 1024); }
  g.fillStyle = '#2b2620'; g.fillRect(0, 0, 22, 1024); g.fillRect(490, 0, 22, 1024);
  g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(22, 0, 3, 1024); g.fillRect(487, 0, 3, 1024);
  return tex(c, 1, 1);
}

export function roofTileTexture() {
  const { c, g } = canvas(512, 512);
  g.fillStyle = '#4a4440'; g.fillRect(0, 0, 512, 512);
  const rows = 8, cols = 8, rh = 512 / rows, cw = 512 / cols;
  for (let r = 0; r < rows; r++) for (let cI = 0; cI < cols; cI++) {
    const x = cI * cw + (r % 2 ? cw / 2 : 0), y = r * rh;
    const grd = g.createLinearGradient(0, y, 0, y + rh);
    grd.addColorStop(0, '#a49b93'); grd.addColorStop(0.5, '#7a726b'); grd.addColorStop(1, '#4a4440');
    g.fillStyle = grd; g.beginPath(); g.moveTo(x, y + rh); g.quadraticCurveTo(x + cw / 2, y - rh * 0.4, x + cw, y + rh); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 2; g.stroke();
  }
  return tex(c, 1, 1);
}

export function gravelTexture() {
  const { c, g } = canvas(512, 512);
  g.fillStyle = '#d9d2c2'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 18000; i++) { const v = 150 + rnd() * 100; g.fillStyle = `rgba(${v},${v - 6},${v - 18},0.9)`; g.fillRect(rnd() * 512, rnd() * 512, 2 + rnd() * 2, 2 + rnd() * 2); }
  for (let x = 0; x < 512; x += 24) { g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(x, 0, 6, 512); g.fillStyle = 'rgba(255,255,255,0.1)'; g.fillRect(x + 12, 0, 6, 512); }
  return tex(c, 1, 1);
}

export function mossTexture() {
  const { c, g } = canvas(512, 512);
  g.fillStyle = '#5f7a3c'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 24000; i++) { const k = rnd(); g.fillStyle = k < 0.5 ? `rgba(30,60,20,${rnd() * 0.5})` : `rgba(160,190,90,${rnd() * 0.35})`; g.fillRect(rnd() * 512, rnd() * 512, 2 + rnd() * 3, 2 + rnd() * 3); }
  return tex(c, 1, 1);
}

export function stoneTexture() {
  const { c, g } = canvas(256, 256);
  g.fillStyle = '#7d766b'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 7000; i++) { const v = 90 + rnd() * 90; g.fillStyle = `rgba(${v},${v - 4},${v - 12},0.7)`; g.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 3, 1 + rnd() * 3); }
  return tex(c, 1, 1);
}

export function shojiTexture(cols = 4, rows = 6) {
  const { c, g } = canvas(512, 768);
  g.fillStyle = '#f2e6cf'; g.fillRect(0, 0, 512, 768);
  for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(200,170,120,${rnd() * 0.12})`; g.fillRect(rnd() * 512, rnd() * 768, 1, 4 + rnd() * 10); }
  g.fillStyle = '#2a2018';
  const cw = 512 / cols, rh = 768 / rows;
  for (let i = 0; i <= cols; i++) g.fillRect(i * cw - 5, 0, 10, 768);
  for (let j = 0; j <= rows; j++) g.fillRect(0, j * rh - 5, 512, 10);
  return tex(c, 1, 1);
}

export function fusumaTexture(withBranch = true) {
  const { c, g } = canvas(768, 1024);
  g.fillStyle = '#e9dcc3'; g.fillRect(0, 0, 768, 1024);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(190,160,110,${rnd() * 0.1})`; g.fillRect(rnd() * 768, rnd() * 1024, 2, 2); }
  // faint gold clouds
  for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(214,178,96,${0.08 + rnd() * 0.08})`; g.beginPath(); g.ellipse(rnd() * 768, 200 + rnd() * 700, 220 + rnd() * 160, 60 + rnd() * 50, 0, 0, Math.PI * 2); g.fill(); }
  if (withBranch) {
    g.strokeStyle = '#3a2a1c'; g.lineCap = 'round';
    const drawBranch = (x: number, y: number, ang: number, len: number, w: number, depth: number) => {
      if (depth === 0 || len < 12) return;
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
      if (depth < 4) for (let k = 0; k < 3; k++) { const px = x + (x2 - x) * rnd(), py = y + (y2 - y) * rnd(); g.fillStyle = k % 2 ? 'rgba(236,170,180,0.9)' : 'rgba(250,235,235,0.9)'; g.beginPath(); g.arc(px + rnd() * 16 - 8, py + rnd() * 16 - 8, 5 + rnd() * 5, 0, Math.PI * 2); g.fill(); }
      drawBranch(x2, y2, ang - 0.35 - rnd() * 0.4, len * 0.72, w * 0.7, depth - 1);
      drawBranch(x2, y2, ang + 0.25 + rnd() * 0.4, len * 0.66, w * 0.65, depth - 1);
    };
    drawBranch(80, 900, -1.05, 190, 11, 6);
  }
  // black lacquer frame + pull
  g.fillStyle = '#1d1712'; g.fillRect(0, 0, 768, 14); g.fillRect(0, 1010, 768, 14); g.fillRect(0, 0, 14, 1024); g.fillRect(754, 0, 14, 1024);
  g.fillStyle = '#2a2a2a'; g.beginPath(); g.ellipse(700, 560, 12, 22, 0, 0, Math.PI * 2); g.fill();
  return tex(c, 1, 1);
}

export function scrollTexture(glyph = '静') {
  const { c, g } = canvas(256, 768);
  g.fillStyle = '#5a4630'; g.fillRect(0, 0, 256, 768);
  g.fillStyle = '#efe4cc'; g.fillRect(28, 60, 200, 640);
  for (let i = 0; i < 2000; i++) { g.fillStyle = `rgba(180,150,100,${rnd() * 0.15})`; g.fillRect(28 + rnd() * 200, 60 + rnd() * 640, 2, 2); }
  g.fillStyle = '#2a2420'; g.font = '150px "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(glyph, 128, 330);
  g.fillStyle = '#b03a2e'; g.fillRect(150, 560, 26, 26);
  g.fillStyle = '#2a2420'; g.fillRect(0, 0, 256, 60); g.fillRect(0, 700, 256, 68);
  return tex(c, 1, 1);
}

export function indigoTexture() {
  const { c, g } = canvas(512, 512);
  g.fillStyle = '#2e3b5e'; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = 'rgba(230,230,240,0.55)'; g.lineWidth = 2;
  for (let y = 0; y < 512; y += 32) for (let x = 0; x < 512; x += 32) { g.beginPath(); g.arc(x + (y / 32 % 2 ? 16 : 0), y, 16, Math.PI, 2 * Math.PI); g.stroke(); }
  for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(0,0,20,${rnd() * 0.2})`; g.fillRect(rnd() * 512, rnd() * 512, 2, 2); }
  return tex(c, 2, 2);
}

export function leafTexture() {
  const { c, g } = canvas(128, 128);
  g.clearRect(0, 0, 128, 128);
  g.fillStyle = '#ffffff';
  for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(64 + (rnd() - 0.5) * 60, 64 + (rnd() - 0.5) * 60, 14 + rnd() * 14, 8 + rnd() * 8, rnd() * Math.PI, 0, Math.PI * 2); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function softDotTexture() {
  const { c, g } = canvas(64, 64);
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.5, 'rgba(255,255,255,0.5)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export function skyTexture(top: string, mid: string, horizon: string) {
  const { c, g } = canvas(4, 512);
  const grd = g.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, top); grd.addColorStop(0.55, mid); grd.addColorStop(1, horizon);
  g.fillStyle = grd; g.fillRect(0, 0, 4, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
