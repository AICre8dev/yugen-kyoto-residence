import * as THREE from 'three';

// Procedural "paintings" for screens and scrolls. Canvas-drawn so the build
// stays image-free, but composed like the real things: gold-cloud grounds,
// ink brushwork, a calligraphy column and a red seal.
const CJK = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", "Noto Serif SC", "Songti SC", serif';
let seed = 11;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

function canvas(w: number, h: number) { const c = document.createElement('canvas'); c.width = w; c.height = h; return { c, g: c.getContext('2d')! }; }
function finish(c: HTMLCanvasElement) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

function paperGround(g: CanvasRenderingContext2D, w: number, h: number, base = '#e9dcc0') {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < w * h / 60; i++) { g.fillStyle = `rgba(150,120,70,${rnd() * 0.08})`; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
}
function goldClouds(g: CanvasRenderingContext2D, w: number, h: number, n = 7) {
  for (let i = 0; i < n; i++) {
    const cx = rnd() * w, cy = rnd() * h, rx = w * (0.18 + rnd() * 0.22), ry = h * (0.06 + rnd() * 0.08);
    const grd = g.createRadialGradient(cx, cy, 0, cx, cy, rx);
    grd.addColorStop(0, 'rgba(214,178,96,0.55)'); grd.addColorStop(0.7, 'rgba(214,178,96,0.28)'); grd.addColorStop(1, 'rgba(214,178,96,0)');
    g.fillStyle = grd; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(160,120,50,0.35)'; g.lineWidth = 2; g.beginPath();
    for (let k = 0; k <= 12; k++) { const a = (k / 12) * Math.PI * 2; const r = 1 + Math.sin(k * 2.3) * 0.12; const x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r; k ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.closePath(); g.stroke();
  }
}
// tapered ink stroke between two points, brush-like
function inkStroke(g: CanvasRenderingContext2D, pts: [number, number][], w0: number, w1: number, color = '#1d1a17') {
  g.strokeStyle = color; g.lineCap = 'round'; g.lineJoin = 'round';
  const n = pts.length - 1;
  for (let i = 0; i < n; i++) {
    g.lineWidth = w0 + (w1 - w0) * (i / n); g.beginPath(); g.moveTo(pts[i][0], pts[i][1]);
    const mx = (pts[i][0] + pts[i + 1][0]) / 2 + (rnd() - 0.5) * 4, my = (pts[i][1] + pts[i + 1][1]) / 2 + (rnd() - 0.5) * 4;
    g.quadraticCurveTo(mx, my, pts[i + 1][0], pts[i + 1][1]); g.stroke();
  }
}
function calligraphy(g: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color = '#1d1a17') {
  g.fillStyle = color; g.font = `${size}px ${CJK}`; g.textAlign = 'center'; g.textBaseline = 'top';
  [...text].forEach((ch, i) => g.fillText(ch, x, y + i * size * 1.12));
}
function seal(g: CanvasRenderingContext2D, x: number, y: number, s: number) {
  g.fillStyle = '#b8352a'; g.fillRect(x, y, s, s);
  g.fillStyle = '#e9dcc0'; g.font = `${s * 0.5}px ${CJK}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('幽', x + s / 2, y + s * 0.3); g.fillText('玄', x + s / 2, y + s * 0.72);
}

/** Six-panel byōbu: ink tiger crouching among bamboo, gold clouds, calligraphy + seal. */
export function tigerScreenTexture() {
  const W = 1536, H = 768; const { c, g } = canvas(W, H);
  paperGround(g, W, H, '#ead9b8'); goldClouds(g, W, H, 9);
  // rock wash
  const rock = g.createLinearGradient(0, H * 0.62, 0, H); rock.addColorStop(0, 'rgba(70,70,70,0.35)'); rock.addColorStop(1, 'rgba(40,40,40,0.55)');
  g.fillStyle = rock; g.beginPath(); g.moveTo(80, H); g.quadraticCurveTo(300, H * 0.6, 700, H * 0.72); g.quadraticCurveTo(1000, H * 0.8, 1250, H * 0.66); g.lineTo(1300, H); g.closePath(); g.fill();
  // bamboo behind
  for (let i = 0; i < 6; i++) { const x = 1150 + i * 55 + rnd() * 20; inkStroke(g, [[x, H * 0.7], [x + 6, H * 0.4], [x + 2, 60]], 9, 4, 'rgba(40,60,40,0.75)'); for (let k = 0; k < 5; k++) { const y = 100 + k * 90 + rnd() * 30; inkStroke(g, [[x, y], [x + 40 + rnd() * 30, y - 30 - rnd() * 30]], 6, 1, 'rgba(40,70,40,0.8)'); inkStroke(g, [[x, y + 10], [x - 40 - rnd() * 30, y - 20 - rnd() * 30]], 6, 1, 'rgba(40,70,40,0.8)'); } }
  // tiger body — fills, then ink outline, then stripes
  const orange = '#d4873a', cream = '#f4e6cf';
  g.fillStyle = orange;
  g.beginPath(); g.ellipse(640, 470, 330, 130, -0.08, 0, Math.PI * 2); g.fill(); // body
  g.beginPath(); g.ellipse(960, 400, 120, 105, 0.1, 0, Math.PI * 2); g.fill(); // head
  for (const [x, y, w, h, r] of [[420, 560, 60, 130, 0.25], [520, 585, 55, 120, 0.1], [780, 590, 60, 120, -0.05], [880, 570, 58, 125, -0.2]] as number[][]) { g.beginPath(); g.ellipse(x, y, w, h, r, 0, Math.PI * 2); g.fill(); }
  inkStroke(g, [[330, 440], [220, 380], [150, 300], [170, 220], [230, 200]], 26, 12, orange); // tail
  // chest + muzzle
  g.fillStyle = cream; g.beginPath(); g.ellipse(700, 540, 200, 70, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(985, 440, 70, 48, 0, 0, Math.PI * 2); g.fill();
  // ears
  g.fillStyle = orange; g.beginPath(); g.moveTo(880, 320); g.lineTo(905, 250); g.lineTo(945, 310); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(1010, 305); g.lineTo(1050, 245); g.lineTo(1070, 320); g.closePath(); g.fill();
  g.fillStyle = '#1d1a17'; g.beginPath(); g.moveTo(893, 300); g.lineTo(905, 262); g.lineTo(930, 300); g.closePath(); g.fill(); g.beginPath(); g.moveTo(1020, 300); g.lineTo(1049, 258); g.lineTo(1060, 305); g.closePath(); g.fill();
  // outline
  inkStroke(g, [[330, 440], [400, 360], [520, 330], [700, 340], [860, 330]], 6, 9);
  inkStroke(g, [[860, 330], [900, 300], [1000, 290], [1075, 340], [1085, 420], [1040, 500], [960, 505], [900, 470]], 7, 5);
  inkStroke(g, [[310, 470], [340, 560], [400, 600], [470, 690]], 8, 4); inkStroke(g, [[560, 600], [540, 700]], 6, 3); inkStroke(g, [[760, 610], [770, 705]], 6, 3); inkStroke(g, [[900, 560], [920, 690]], 6, 3);
  // stripes
  for (let i = 0; i < 11; i++) { const x = 380 + i * 48 + rnd() * 10; inkStroke(g, [[x, 360 + rnd() * 20], [x + 14, 420 + rnd() * 30], [x - 6, 500 + rnd() * 30]], 14, 3); }
  for (const [x0, y0, x1, y1] of [[930, 320, 960, 360], [1000, 315, 1010, 355], [1050, 350, 1075, 390], [1060, 430, 1080, 460], [880, 380, 905, 420]]) inkStroke(g, [[x0, y0], [x1, y1]], 10, 3);
  for (let i = 0; i < 5; i++) { const t = i / 4; inkStroke(g, [[330 - t * 110, 440 - t * 120], [345 - t * 110, 430 - t * 120]], 12, 8); }
  // face
  g.fillStyle = '#f2c94c'; g.beginPath(); g.ellipse(940, 395, 16, 12, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(1010, 392, 16, 12, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1d1a17'; g.beginPath(); g.ellipse(942, 396, 6, 9, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(1012, 393, 6, 9, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(970, 425); g.lineTo(1000, 425); g.lineTo(985, 442); g.closePath(); g.fill();
  inkStroke(g, [[985, 442], [985, 462]], 3, 3); inkStroke(g, [[985, 462], [955, 470]], 3, 2); inkStroke(g, [[985, 462], [1015, 470]], 3, 2);
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) inkStroke(g, [[985 + s * 40, 450 + k * 8], [985 + s * 130, 430 + k * 18]], 2, 1, 'rgba(30,30,30,0.7)');
  // calligraphy + seal
  calligraphy(g, '虎嘯風生', 120, 70, 82);
  seal(g, 96, 470, 48);
  // panel hinge lines
  g.fillStyle = 'rgba(40,30,20,0.35)'; for (let i = 1; i < 6; i++) g.fillRect((W / 6) * i - 1, 0, 2, H);
  return finish(c);
}

/** Cranes over pines on gold — tea room screen. */
export function craneScreenTexture() {
  const W = 1536, H = 768; const { c, g } = canvas(W, H);
  g.fillStyle = '#d9b970'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 12000; i++) { g.fillStyle = `rgba(255,240,180,${rnd() * 0.25})`; g.fillRect(rnd() * W, rnd() * H, 2, 2); }
  goldClouds(g, W, H, 6);
  // pine
  inkStroke(g, [[120, 740], [220, 600], [380, 520], [520, 470]], 30, 10, '#3a2a1c'); inkStroke(g, [[380, 520], [430, 420], [520, 380]], 12, 4, '#3a2a1c');
  for (const [x, y] of [[520, 470], [520, 380], [430, 420], [300, 560]]) for (let k = 0; k < 40; k++) { const a = rnd() * Math.PI * 2, r = 30 + rnd() * 70; inkStroke(g, [[x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3 - 10], [x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6 - 20]], 3, 1, 'rgba(40,80,50,0.85)'); }
  // cranes
  const crane = (x: number, y: number, s: number, flip = false) => {
    g.save(); g.translate(x, y); g.scale(flip ? -s : s, s);
    g.fillStyle = '#f6f1e6'; g.beginPath(); g.ellipse(0, 0, 70, 26, 0.15, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(-30, -10); g.quadraticCurveTo(-120, -110, -220, -60); g.quadraticCurveTo(-130, -60, -50, 8); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(10, -14); g.quadraticCurveTo(90, -120, 200, -90); g.quadraticCurveTo(110, -60, 40, 6); g.closePath(); g.fill();
    g.fillStyle = '#1d1a17'; g.beginPath(); g.moveTo(-220, -60); g.lineTo(-250, -40); g.lineTo(-180, -48); g.closePath(); g.fill(); g.beginPath(); g.moveTo(200, -90); g.lineTo(240, -70); g.lineTo(170, -74); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(60, -18, 10, 10, 0, 0, Math.PI * 2); g.fill();
    inkStroke(g, [[62, -30], [95, -60], [120, -62]], 8, 3); g.fillStyle = '#c8332a'; g.beginPath(); g.ellipse(118, -64, 8, 6, 0, 0, Math.PI * 2); g.fill();
    inkStroke(g, [[125, -60], [175, -66]], 4, 1); inkStroke(g, [[-10, 20], [-40, 70]], 3, 1); inkStroke(g, [[10, 22], [-15, 74]], 3, 1);
    g.restore();
  };
  crane(900, 300, 1.0); crane(1180, 200, 0.75, true); crane(1000, 520, 0.6);
  calligraphy(g, '鶴壽千歳', 1440, 60, 64); seal(g, 1416, 380, 44);
  g.fillStyle = 'rgba(40,30,20,0.3)'; for (let i = 1; i < 6; i++) g.fillRect((W / 6) * i - 1, 0, 2, H);
  return finish(c);
}

/** Sumi-e bamboo on paper — corridor panels. */
export function bambooInkTexture() {
  const W = 512, H = 1024; const { c, g } = canvas(W, H);
  paperGround(g, W, H, '#ede3cd');
  for (let i = 0; i < 3; i++) { const x = 120 + i * 130 + rnd() * 40; inkStroke(g, [[x, 980], [x + 8, 600], [x + 4, 260], [x + 12, 60]], 16, 7, 'rgba(30,30,30,0.85)'); for (let y = 200; y < 980; y += 150) { g.fillStyle = 'rgba(237,227,205,1)'; g.fillRect(x - 12, y, 30, 5); } for (let k = 0; k < 6; k++) { const y = 120 + k * 130 + rnd() * 40; for (let l = 0; l < 3; l++) inkStroke(g, [[x + 4, y], [x + 50 + rnd() * 60 - l * 20, y - 40 - rnd() * 40 + l * 25]], 9, 1, 'rgba(30,30,30,0.85)'); inkStroke(g, [[x + 4, y + 8], [x - 60 - rnd() * 40, y - 10 + rnd() * 30]], 8, 1, 'rgba(30,30,30,0.8)'); } }
  calligraphy(g, '清風', 440, 40, 54); seal(g, 420, 190, 36);
  return finish(c);
}

/** Misty mountains hanging scroll with calligraphy. */
export function mountainScrollTexture() {
  const W = 512, H = 1280; const { c, g } = canvas(W, H);
  g.fillStyle = '#4a3a2c'; g.fillRect(0, 0, W, H); // brocade mount
  g.fillStyle = '#6a5a44'; g.fillRect(40, 100, W - 80, H - 200);
  paperGround(g, W, H, '#ede4cf'); // draw paper over
  g.fillStyle = '#4a3a2c'; g.fillRect(0, 0, W, 90); g.fillRect(0, H - 110, W, 110); g.fillStyle = '#6a5a44'; g.fillRect(0, 90, W, 30); g.fillRect(0, H - 140, W, 30);
  const layers = [['rgba(60,70,80,0.9)', 900, 120], ['rgba(90,100,110,0.7)', 780, 160], ['rgba(130,140,150,0.5)', 660, 200], ['rgba(170,175,180,0.35)', 560, 240]] as [string, number, number][];
  for (const [col, base, amp] of layers) { g.fillStyle = col; g.beginPath(); g.moveTo(0, H); g.lineTo(0, base); for (let x = 0; x <= W; x += 16) g.lineTo(x, base - Math.abs(Math.sin(x / 70 + base) * amp) - Math.abs(Math.sin(x / 23) * 20)); g.lineTo(W, H); g.closePath(); g.fill(); }
  const mist = g.createLinearGradient(0, 700, 0, 1000); mist.addColorStop(0, 'rgba(237,228,207,0)'); mist.addColorStop(0.5, 'rgba(237,228,207,0.8)'); mist.addColorStop(1, 'rgba(237,228,207,0)'); g.fillStyle = mist; g.fillRect(0, 700, W, 300);
  inkStroke(g, [[60, 1080], [140, 1000], [260, 980], [420, 1010]], 6, 2, 'rgba(40,40,40,0.8)'); // shore
  calligraphy(g, '山静如太古', 420, 150, 52); seal(g, 396, 440, 40);
  return finish(c);
}

/** Big two-character calligraphy panel. */
export function calligraphyPanelTexture(text = '幽玄') {
  const W = 1024, H = 512; const { c, g } = canvas(W, H);
  paperGround(g, W, H, '#efe6d2');
  g.fillStyle = '#1d1a17'; g.font = `300px ${CJK}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, W / 2 + 40, H / 2 + 10);
  seal(g, 900, 380, 56);
  g.fillStyle = '#1d1a17'; g.fillRect(0, 0, W, 14); g.fillRect(0, H - 14, W, 14); g.fillRect(0, 0, 14, H); g.fillRect(W - 14, 0, 14, H);
  return finish(c);
}

/** Paper chōchin lantern wrap with a kanji. */
export function chochinTexture(text = '幽') {
  const W = 256, H = 256; const { c, g } = canvas(W, H);
  g.fillStyle = '#f4e3c2'; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(120,80,40,0.35)'; g.lineWidth = 3; for (let y = 12; y < H; y += 22) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.fillStyle = '#b8352a'; g.font = `150px ${CJK}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W / 2, H / 2 + 8);
  const t = finish(c); t.wrapS = THREE.RepeatWrapping; return t;
}

/** Woven rug for the sofa area. */
export function rugTexture() {
  const W = 512, H = 512; const { c, g } = canvas(W, H);
  g.fillStyle = '#c9bca4'; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 6) for (let x = 0; x < W; x += 6) { g.fillStyle = ((x + y) / 6) % 2 ? 'rgba(90,70,50,0.25)' : 'rgba(255,245,225,0.25)'; g.fillRect(x, y, 6, 6); }
  g.strokeStyle = '#2e3a5c'; g.lineWidth = 10; g.strokeRect(24, 24, W - 48, H - 48); g.lineWidth = 3; g.strokeRect(44, 44, W - 88, H - 88);
  const t = finish(c); return t;
}
