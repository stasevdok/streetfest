import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './styles.css';
import { homePath, planPath, isPlanPath } from './paths.js';
import { STORAGE_KEY, parseSavedPlan } from './plan.js';
import { Header, Hero, About, Artists, Schedule, Map, Merch, Contacts, Plan, Notice } from './components.jsx';

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [selected, setSelected] = useState(() => { try { return parseSavedPlan(localStorage.getItem(STORAGE_KEY)); } catch { return []; } });
  const [message, setMessage] = useState('');
  const noticeId = useRef(0);
  const scrollPosition = useRef(0);
  const nextSection = useRef(null);
  const isPlan = isPlanPath(path);
  const notify = useCallback(value => { setMessage({ ...(typeof value === 'string' ? { title: 'Ссылки пока что нет', detail: 'Добавим её чуть позже' } : value), id: ++noticeId.current }); }, []);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(selected)); } catch { /* Выбор продолжает работать без доступа к хранилищу. */ } }, [selected]);
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    const pop = () => { if (isPlanPath(window.location.pathname)) scrollPosition.current = window.scrollY; setPath(window.location.pathname); };
    const storage = event => { if (event.key === STORAGE_KEY) setSelected(parseSavedPlan(event.newValue)); };
    window.addEventListener('popstate', pop); window.addEventListener('storage', storage);
    return () => { window.removeEventListener('popstate', pop); window.removeEventListener('storage', storage); };
  }, []);
  useLayoutEffect(() => {
    document.title = isPlan ? 'Мой план — УЛИЦА' : 'УЛИЦА — фестиваль стрит-арта';
    if (isPlan) window.scrollTo(0,0);
    else if (nextSection.current || window.location.hash) {
      const id = nextSection.current || window.location.hash.slice(1); nextSection.current = null;
      document.getElementById(id)?.scrollIntoView();
    } else window.scrollTo(0,scrollPosition.current);
  }, [isPlan]);
  const toggle = id => setSelected(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous,id]);
  const openPlan = () => { scrollPosition.current = window.scrollY; window.history.pushState({}, '', planPath); setPath(planPath); };
  const close = () => { window.history.pushState({}, '', homePath); setPath(homePath); };
  const goTo = id => { if (isPlan) { nextSection.current = id; close(); } else document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };
  return <><div hidden={isPlan}><Header count={selected.length} {...{openPlan,goTo}}/><main><Hero goTo={goTo}/><About/><Artists/><Schedule {...{selected,toggle,notify}}/><Map/><Merch/><Contacts/></main></div>{isPlan && <Plan {...{selected,toggle,notify,close}}/>}{message && <Notice key={message.id} message={message} dismiss={() => setMessage(previous => previous?.id === message.id ? '' : previous)}/>}</>;
}
const root = import.meta.hot?.data.root ?? createRoot(document.getElementById('root'));
root.render(<App/>);
if (import.meta.hot) import.meta.hot.dispose(data => { data.root = root; });
