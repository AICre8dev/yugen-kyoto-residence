import { chapters, chapterAt } from '../data/chapters';
import type { SeasonKey } from '../three/season';

interface Props { progress: number; season: SeasonKey; setSeason: (s: SeasonKey) => void }

export default function Overlay({ progress, season, setSeason }: Props) {
  const { index, strength } = chapterAt(progress);
  const ch = chapters[index];
  return (
    <div className="overlay">
      <header className="top">
        <div className="brand"><span className="wordmark">YŪGEN</span><span className="sub">KYOTO · RESIDENCE</span></div>
        <div className="chapter-title" key={ch.key}>{ch.title}</div>
        <button className="menu" type="button">MENU</button>
      </header>

      {chapters.map((c, i) => {
        const on = i === index;
        const s = on ? strength : 0;
        return (
          <aside key={c.key} className={`caption ${c.side}`} data-chapter={c.key} data-visible={s > 0.05 ? 'true' : 'false'} style={{ opacity: s, transform: `translateY(${(1 - s) * 22}px)` }} aria-hidden={s <= 0.05}>
            <div className="num"><span className="roman">{c.roman}</span><span className="label">{c.key.replace('TEAROOM', 'TEA ROOM').replace('KOI', 'KOI GARDEN')}</span></div>
            <h2 className="headline">{c.headline}</h2>
            <p className="copy">{c.copy}</p>
            <div className="tags">{c.tags.map(t => <span key={t}>{t}</span>)}</div>
          </aside>
        );
      })}

      <nav className="rail" aria-label="Chapters">
        {chapters.map((c, i) => <div key={c.key} className={`rail-item ${i === index ? 'active' : ''}`}><span>{c.roman}</span><i /></div>)}
        <div className="track"><b style={{ top: `${Math.min(1, progress) * 100}%` }} /></div>
      </nav>

      <div className="hint" style={{ opacity: progress < 0.03 ? 1 : 0 }}><span>SCROLL TO ENTER</span><i /></div>

      <div className="seasons" role="group" aria-label="Seasons">
        {(['spring', 'summer', 'autumn', 'winter'] as SeasonKey[]).map(s => (
          <button key={s} type="button" className={s === season ? 'active' : ''} onClick={() => setSeason(s)} aria-pressed={s === season}>{s.toUpperCase()}</button>
        ))}
      </div>
    </div>
  );
}
