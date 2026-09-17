import { useCallback, useRef, useState } from 'react';
import Scene3D from './components/Scene3D';
import Overlay from './components/Overlay';
import PostSections from './components/PostSections';
import FallbackHero from './components/FallbackHero';
import type { SeasonKey } from './three/season';
import { chapterU } from './data/chapters';
(window as any).__chapterU = chapterU;

function webglOK() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } }

export default function App() {
  const [season, setSeason] = useState<SeasonKey>('autumn');
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(() => !webglOK());
  const spineRef = useRef<HTMLDivElement>(null);
  const lastP = useRef(0);
  const onProgress = useCallback((p: number) => { if (Math.abs(p - lastP.current) > 0.0015) { lastP.current = p; setProgress(p); } }, []);
  if (failed) return <><FallbackHero /><PostSections /></>;
  return (
    <>
      <Scene3D season={season} onProgress={onProgress} onFail={() => setFailed(true)} spineRef={spineRef} />
      <Overlay progress={progress} season={season} setSeason={setSeason} />
      <div className="spine" ref={spineRef} aria-hidden="true" />
      <PostSections />
    </>
  );
}
