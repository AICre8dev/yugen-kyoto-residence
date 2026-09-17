export type SeasonKey = 'spring' | 'summer' | 'autumn' | 'winter';
export interface Palette {
  skyTop: string; skyMid: string; horizon: string; fog: string; fogNear: number; fogFar: number;
  sun: string; sunI: number; hemiSky: string; hemiGround: string; ambient: number;
  grass: string; foliage: [string, string, string]; shrub: string; particle: string; kind: 'petal' | 'leaf' | 'snow' | 'mote';
  snow: number; exposure: number;
}
export const seasons: Record<SeasonKey, Palette> = {
  spring: { skyTop: '#9cbde0', skyMid: '#e9d9c9', horizon: '#ffd9b3', fog: '#ecd7c2', fogNear: 30, fogFar: 110, sun: '#ffe2c0', sunI: 2.4, hemiSky: '#dbe6f2', hemiGround: '#5a6a3a', ambient: 0.35, grass: '#6f8f45', foliage: ['#f0b8c8', '#f7d3dc', '#e79bb2'], shrub: '#5f8a44', particle: '#ffd1dc', kind: 'petal', snow: 0, exposure: 1.05 },
  summer: { skyTop: '#6fa3d9', skyMid: '#cfe0ea', horizon: '#ffe6c2', fog: '#e4d9c6', fogNear: 34, fogFar: 120, sun: '#fff1d6', sunI: 2.8, hemiSky: '#cfe3f5', hemiGround: '#4a6a30', ambient: 0.32, grass: '#4f7f36', foliage: ['#2f6b33', '#3f8a3e', '#5aa14a'], shrub: '#3e7a39', particle: '#f7f2c8', kind: 'mote', snow: 0, exposure: 1.0 },
  autumn: { skyTop: '#c9a98a', skyMid: '#f0c9a0', horizon: '#ffb877', fog: '#e9c9a3', fogNear: 26, fogFar: 100, sun: '#ffb677', sunI: 2.6, hemiSky: '#ffe1b8', hemiGround: '#46552c', ambient: 0.35, grass: '#5c7238', foliage: ['#c8532a', '#e0803a', '#a83b25'], shrub: '#6e7b34', particle: '#e8873c', kind: 'leaf', snow: 0, exposure: 1.05 },
  winter: { skyTop: '#9aa6b8', skyMid: '#d6dbe2', horizon: '#ece7dc', fog: '#dcdde0', fogNear: 20, fogFar: 85, sun: '#e6ecf5', sunI: 1.6, hemiSky: '#e7ecf3', hemiGround: '#6a6f68', ambient: 0.4, grass: '#c9cdc9', foliage: ['#6d6a62', '#8a8780', '#59564f'], shrub: '#6b7160', particle: '#ffffff', kind: 'snow', snow: 1, exposure: 1.0 },
};
