import { chapters } from '../data/chapters';
export default function FallbackHero() {
  return (
    <div className="fallback">
      <header className="top"><div className="brand"><span className="wordmark">YŪGEN</span><span className="sub">KYOTO · RESIDENCE</span></div></header>
      <div className="fb-hero"><h1>A house designed to breathe.</h1><p>A private Kyoto residence shaped around light, landscape, material and silence.</p></div>
      {chapters.map(c => (
        <section key={c.key} className="fb-chapter"><div className="num"><span className="roman">{c.roman}</span><span className="label">{c.title}</span></div><h2 className="headline">{c.headline}</h2><p className="copy">{c.copy}</p><div className="tags">{c.tags.map(t => <span key={t}>{t}</span>)}</div></section>
      ))}
    </div>
  );
}
