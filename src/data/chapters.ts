export type Vec3 = [number, number, number];
export interface Chapter {
  roman: string; key: string; title: string; headline: string; copy: string; tags: string[]; side: 'left' | 'right';
}
// Camera ledger: chapters carry a caption; `via` points only steer the curve through doorways.
export interface WalkPoint { position: Vec3; lookAt: Vec3; chapter?: Chapter }

const IY = 1.95; // interior eye height (floor is at 0.6)

export const walk: WalkPoint[] = [
  { position: [0, 3.2, 31], lookAt: [0, 2.4, 0], chapter: { roman: 'I', key: 'ARRIVAL', title: 'THE ARRIVAL', headline: 'A gate, and the world grows quiet.', copy: 'Beyond the clay wall the house waits low against the hill, the last sun caught behind its tiled roof.', tags: ['CLAY WALL', 'STILLNESS', 'KYOTO'], side: 'left' } },
  { position: [0, 2.0, 22.4], lookAt: [0, 1.9, 6], chapter: { roman: 'II', key: 'GATE', title: 'THE GATE', headline: 'Passing beneath the tiled roof.', copy: 'A single step marks the threshold between the street and the garden — the old rule that nothing hurried enters here.', tags: ['THRESHOLD', 'TIMBER', 'ARRIVAL'], side: 'right' } },
  { position: [0, 1.5, 14.5], lookAt: [0, 0.8, 7.5], chapter: { roman: 'III', key: 'PATH', title: 'THE PATH', headline: 'Stone by stone, the pace slows.', copy: 'Nine stepping stones cross raked gravel, each placed so the eye — and the foot — must pause.', tags: ['GRAVEL', 'STEPPING STONES', 'RHYTHM'], side: 'left' } },
  { position: [0.4, IY, 6.6], lookAt: [-2.9, 1.6, 4.9], chapter: { roman: 'IV', key: 'GENKAN', title: 'THE GENKAN', headline: 'A single scroll, a single branch.', copy: 'The entry holds nothing but what matters: a hanging scroll, a vase, the smell of cedar.', tags: ['SCROLL', 'CEDAR', 'ARRIVAL'], side: 'right' } },
  { position: [0, IY, 2.2], lookAt: [0, 1.5, -19], chapter: { roman: 'V', key: 'CORRIDOR', title: 'THE CORRIDOR', headline: 'Light finds its way from the far room.', copy: 'Paper lanterns mark a wooden corridor that draws the eye toward the green glow of the garden beyond.', tags: ['WASHI', 'TIMBER', 'PASSAGE'], side: 'left' } },
  { position: [-2.6, IY - 0.1, 0.4], lookAt: [-7.5, 1.0, -4.8], chapter: { roman: 'VI', key: 'TEAROOM', title: 'THE TEA ROOM', headline: 'Twelve mats, and nowhere to rush.', copy: 'A low table, four cushions and a tokonoma alcove — the room is built entirely around the pause.', tags: ['TATAMI', 'TOKONOMA', 'CHA-NO-YU'], side: 'right' } },
  { position: [0, IY, -0.6], lookAt: [0.5, 1.5, -12] },
  { position: [3.2, IY - 0.1, 0.6], lookAt: [8.2, 1.1, -5.0], chapter: { roman: 'VII', key: 'LIVING', title: 'THE LIVING ROOM', headline: 'A branch of blossom, doors to the garden.', copy: 'Glazed doors slide wide onto moss and stone, so that inside and outside share the same season.', tags: ['HINOKI', 'GLASS', 'GARDEN VIEW'], side: 'left' } },
  { position: [0, IY, -3.5], lookAt: [0, 1.5, -14] },
  { position: [0, IY, -7.5], lookAt: [3, 1.5, -12] },
  { position: [2.5, IY, -8], lookAt: [8.5, 1.05, -11.5], chapter: { roman: 'VIII', key: 'KITCHEN', title: 'THE KITCHEN', headline: 'Cypress and brass, quietly at work.', copy: 'A hinoki counter, slatted timber cabinets, a single brass tap — nothing announces itself.', tags: ['CYPRESS', 'BRASS', 'CRAFT'], side: 'right' } },
  { position: [0, IY, -8.4], lookAt: [-3, 1.4, -12] },
  { position: [-2.5, IY - 0.2, -8], lookAt: [-7.5, 0.95, -11.5], chapter: { roman: 'IX', key: 'BEDROOM', title: 'THE BEDROOM', headline: 'An andon lamp, a painted screen.', copy: 'The quilt is indigo, the light is paper-soft, and the folding screen holds the room’s only colour.', tags: ['INDIGO', 'ANDON', 'REST'], side: 'left' } },
  { position: [0, IY, -11.5], lookAt: [0, 1.5, -20] },
  { position: [0, IY, -15.5], lookAt: [-3, 1.3, -18] },
  { position: [-2.5, IY, -16], lookAt: [-7.5, 0.7, -18.2], chapter: { roman: 'X', key: 'ONSEN', title: 'THE ONSEN', headline: 'Steam rises over cypress water.', copy: 'A private bath carved from a single cypress tub, filled to the brim, slate cool underfoot.', tags: ['CYPRESS TUB', 'STEAM', 'SLATE'], side: 'right' } },
  { position: [0, IY, -18.6], lookAt: [0, 1.2, -30] },
  { position: [0, IY, -21.2], lookAt: [0, 0.6, -30], chapter: { roman: 'XI', key: 'ENGAWA', title: 'THE ENGAWA', headline: 'The deck where the house exhales.', copy: 'A cedar deck under deep eaves — half room, half garden — where the evening is taken sitting down.', tags: ['CEDAR', 'EAVES', 'DUSK'], side: 'left' } },
  { position: [-4.6, 2.7, -23.9], lookAt: [1.4, -0.2, -29.2], chapter: { roman: 'XII', key: 'KOI', title: 'THE KOI GARDEN', headline: 'Seven fish, one unhurried pond.', copy: 'Beneath a small stone bridge, koi circle without purpose — the entire idea of the house, in water.', tags: ['KOI', 'STONE BRIDGE', 'WATER'], side: 'right' } },
];

export const chapters: Chapter[] = walk.filter(w => w.chapter).map(w => w.chapter!);

// parametric position of every chapter along the walk (by cumulative distance)
export const chapterU: number[] = (() => {
  const d: number[] = [0];
  for (let i = 1; i < walk.length; i++) {
    const a = walk[i - 1].position, b = walk[i].position;
    d.push(d[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
  }
  const total = d[d.length - 1];
  return walk.map((w, i) => d[i] / total).filter((_, i) => !!walk[i].chapter);
})();

// index of the chapter nearest to progress p, and how strongly its caption should show (0..1)
export function chapterAt(p: number) {
  let best = 0, bd = Infinity;
  for (let i = 0; i < chapterU.length; i++) { const dd = Math.abs(p - chapterU[i]); if (dd < bd) { bd = dd; best = i; } }
  const prev = best > 0 ? chapterU[best] - chapterU[best - 1] : 1, next = best < chapterU.length - 1 ? chapterU[best + 1] - chapterU[best] : 1;
  const half = Math.min(prev, next) * 0.5;
  const strength = Math.max(0, 1 - (bd / (half * 0.8)));
  return { index: best, strength };
}
