import { Children, useEffect, useRef, useState } from 'react';
import { artists, days, products } from './data.js';
import { homePath, planPath, publicAsset } from './paths.js';
import { links } from './config.js';
import { sortedEvents, copyPlan } from './plan.js';
import { typograph } from './typography.js';

export const asset = name => publicAsset('assets/' + name);
export function Text({ children }) { return Children.map(children, child => typeof child === 'string' ? typograph(child) : child); }
export function Icon({ name = 'external', className = '' }) {
  const files = { external: '3e161.svg', plus: '104a8.svg', minus: 'd8190.svg', close: 'dced3.svg', left: 'b88b0.svg', right: '1642b.svg' };
  const compact = { external: '664b8.svg', plus: '78697.svg', minus: '00f52.svg', left: 'cf6a7.svg', right: '7548a.svg' };
  return <picture className={'icon ' + (name === 'left' ? 'arrow-left ' : '') + className} aria-hidden="true">{compact[name] && <source media="(max-width: 1100px)" srcSet={asset(compact[name])}/>}<img src={asset(files[name])} alt=""/></picture>;
}
export function Button({ children, light = false, className = '', ...props }) {
  return <button className={'button ' + (light ? 'light ' : '') + className} {...props}><Text>{children}</Text></button>;
}
export function ExternalLink({ href, children, className = '', ...props }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...props}>{children}</a>;
}
const navigation = [['schedule', 'Программа'], ['map', 'Карта'], ['merch', 'Мерч'], ['contacts', 'Контакты']];
export function Header({ count, openPlan, goTo }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [solid, setSolid] = useState(() => window.scrollY > 76);
  const menu = useRef(null);
  const trigger = useRef(null);
  const close = () => { setMenuOpen(false); trigger.current?.focus({ preventScroll: true }); };
  const openMenu = event => { trigger.current = event.currentTarget; setMenuOpen(true); };
  useEffect(() => {
    const update = () => setSolid(window.scrollY > 76);
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    menu.current?.querySelector('button')?.focus();
    const key = event => {
      if (event.key === 'Escape') close();
      if (event.key === 'Tab') {
        const items = [...menu.current.querySelectorAll('button,a')];
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', key); };
  }, [menuOpen]);
  const badge = count > 0 && <span className="badge">{count}</span>;
  const select = id => { setMenuOpen(false); goTo(id); };
  return <>
    <header className="header" aria-hidden={solid} inert={solid ? '' : undefined}>
      <picture className="header-overlay" aria-hidden="true"><source media="(max-width:600px)" srcSet={asset('58c53.png')}/><source media="(max-width:1100px)" srcSet={asset('7e935.png')}/><img src={asset('5078d.png')} alt=""/></picture>
      <a href={homePath} className="logo" aria-label="УЛИЦА — к началу главной" onClick={event => { event.preventDefault(); goTo('top'); }}>
        <picture><source media="(max-width: 600px)" srcSet={asset('ef38d.svg')}/><img src={asset('a85ff.svg')} alt="УЛИЦА"/></picture>
      </a>
      <nav aria-label="Основная навигация">{navigation.map(([id, text]) => <a key={id} href={homePath + '#' + id} onClick={event => { event.preventDefault(); goTo(id); }}>{text}</a>)}<a href={planPath} className="plan-link" onClick={event => { event.preventDefault(); openPlan(); }}>Мой план {badge}</a></nav>
      <button className="menu-trigger icon-button" aria-label="Открыть меню" aria-expanded={menuOpen} onClick={openMenu}><span/><span/><span/></button>
    </header>
    <header className={'header sticky-header ' + (solid ? 'visible' : '')} aria-hidden={!solid} inert={!solid ? '' : undefined}>
      <a href={homePath} className="logo" aria-label="УЛИЦА — к началу главной" onClick={event => { event.preventDefault(); goTo('top'); }}>
        <picture><source media="(max-width:600px)" srcSet={asset('d3452.svg')}/><img src={asset('ca51f.svg')} alt="УЛИЦА"/></picture>
      </a>
      <nav aria-label="Навигация при прокрутке">{navigation.map(([id,text]) => <a key={id} href={homePath+'#'+id} onClick={event=>{event.preventDefault();goTo(id);}}>{text}</a>)}<a href={planPath} className="plan-link" onClick={event=>{event.preventDefault();openPlan();}}>Мой план {badge}</a></nav>
      <button className="menu-trigger icon-button" aria-label="Открыть меню" aria-expanded={menuOpen} onClick={openMenu}><span/><span/><span/></button>
    </header>
    <div ref={menu} className={'mobile-menu ' + (menuOpen ? 'open' : '')} role="dialog" aria-modal={menuOpen ? 'true' : undefined} aria-hidden={!menuOpen} inert={!menuOpen ? '' : undefined} aria-labelledby="menu-title">
      <div className="menu-heading"><h2 id="menu-title">Меню</h2><button className="icon-button" aria-label="Закрыть меню" onClick={close}><Icon name="close"/></button></div>
      <nav aria-label="Мобильная навигация">{navigation.map(([id, text]) => <a key={id} href={homePath + '#' + id} onClick={event => { event.preventDefault(); select(id); }}>{text}</a>)}<a href={planPath} className="plan-link" onClick={event => { event.preventDefault(); setMenuOpen(false); openPlan(); }}>Мой план {badge}</a></nav>
    </div>
  </>;
}
function Fact({ title, children }) { return <div className="fact"><h3><Text>{title}</Text></h3><p><Text>{children}</Text></p></div>; }
export function Hero({ goTo }) {
  return <section id="top" className="hero">
    <picture className="hero-photo"><source media="(max-width: 1100px)" srcSet={asset('74d8b.png')}/><img src={asset('4ceae.png')} alt="Художник расписывает стену под городским мостом"/></picture>
    <div className="hero-content"><h1>Фестиваль<br/>стрит-арта</h1><div className="hero-facts"><Fact title="3–5 июля">Три дня мастер-классов, экскурсий и лекций</Fact><Fact title="Больше 30">Новых арт-объектов<br/>на улицах города</Fact></div><Button light onClick={() => goTo('schedule')}>Программа фестиваля</Button></div>
  </section>;
}
export function About() {
  return <section id="about" className="section about"><h2><Text>О фестивале</Text></h2><div className="about-content"><p className="about-text"><Text>«Улица» — три дня уличного искусства в Нижнем Новгороде. Художники из разных городов создают новые работы на улицах города, а их сюжеты находят в местных историях и архитектуре. В программе — экскурсии, встречи с авторами и мастер-классы.</Text></p><div className="about-facts"><Fact title="3 площадки">Галерея 9Б, Terminal A,<br/>Студия Impulses</Fact><Fact title="9 художников">Из Нижнего Новгорода и других городов России</Fact><Fact title="18 событий">От уличных художников и стрит-арт хантеров</Fact></div></div></section>;
}
export function ArtistCard({ artist, index }) {
  const href = links.artists[artist.id];
  const title = <><Text>{artist.name}</Text>{href && <Icon/>}</>;
  return <article className={'artist-card artist-' + index}><div className="artist-image"><img src={asset(artist.image)} alt={artist.name} loading="lazy"/></div><h3>{href ? <ExternalLink href={href}>{title}</ExternalLink> : title}</h3><p><Text>{artist.city}</Text></p></article>;
}
export function Artists() {
  const track = useRef(null);
  const [edge, setEdge] = useState({ left: true, right: false });
  const updateEdges = () => { const el = track.current; if (el) setEdge({ left: el.scrollLeft <= 1, right: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 }); };
  useEffect(() => { const observer = new ResizeObserver(updateEdges); observer.observe(track.current); return () => observer.disconnect(); }, []);
  const move = direction => track.current.scrollBy({ left: direction * (track.current.querySelector('article').offsetWidth + parseFloat(getComputedStyle(track.current).gap)), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  return <section id="artists" className="section artists"><div className="section-heading"><h2>Художники</h2><div className="artist-controls"><button className="icon-button" disabled={edge.left} aria-label="Предыдущие художники" onClick={() => move(-1)}><Icon name="left"/></button><button className="icon-button" disabled={edge.right} aria-label="Следующие художники" onClick={() => move(1)}><Icon name="right"/></button></div></div><div ref={track} className="artist-track" onScroll={updateEdges} tabIndex="0" role="region" aria-label="Лента всех девяти художников">{artists.map((artist, index) => <ArtistCard key={artist.id} artist={artist} index={index}/>)}</div></section>;
}
export function EventRow({ event, selected, toggle, notify, planDay }) {
  const saved = selected.includes(event.id);
  const url = links.registration[event.id];
  const register = <><span>Регистрация</span><Icon/></>;
  return <article className="event-row" data-event-id={event.id}>
    <h3 className="event-title"><Text>{event.title}</Text></h3><p className="event-venue"><Text>{event.venue}</Text></p><p className="event-time"><Text>{planDay ? event.time : (event.days.length > 1 ? '3–5' : event.days[0]) + ' июля · ' + event.time}</Text></p>
    <div className="event-entry">{event.entry === 'Регистрация' ? url ? <ExternalLink href={url} className="text-action">{register}</ExternalLink> : <button className="text-action" onClick={() => notify('Ссылка на регистрацию появится позже')}>{register}</button> : <span className="free-entry">Вход свободный</span>}</div>
    <button className="text-action event-toggle" aria-pressed={saved} aria-label={(saved ? 'Убрать из плана: ' : 'Добавить в план: ') + event.title} onClick={() => toggle(event.id)}><span className="full-label"><Text>{saved ? 'Убрать из плана' : 'Добавить в план'}</Text></span><span className="short-label"><Text>{saved ? 'Убрать' : 'В план'}</Text></span><Icon name={saved ? 'minus' : 'plus'}/></button>
  </article>;
}
export function Schedule({ selected, toggle, notify }) {
  const [day, setDay] = useState(null);
  const list = sortedEvents(day);
  return <section id="schedule" className="section schedule"><h2>Программа</h2><div className="tabs" role="group" aria-label="Фильтр по дням">{[null, ...days].map(value => <button key={value ?? 'all'} aria-pressed={value === day} className={value === day ? 'selected' : ''} onClick={() => setDay(value)}><Text>{value ? value + ' июля' : 'Все дни'}</Text></button>)}</div><div className="event-list">{list.map(event => <EventRow key={event.id} {...{event,selected,toggle,notify}}/>)}</div></section>;
}
export function Map() {
  return <section id="map" className="section map"><h2>Карта</h2><div className="map-canvas"><iframe src={links.mapEmbed} title="Карта площадок фестиваля УЛИЦА" loading="lazy" allowFullScreen/></div></section>;
}
export function ProductCard({ product }) {
  return <article className={'product-card ' + product.id}><div className="product-image"><img src={asset(product.image)} alt={product.name} loading="lazy"/></div><h3><Text>{product.name}</Text></h3><p><Text>{product.price}</Text></p>{links.order && <ExternalLink href={links.order} className="text-action">Заказать <Icon/></ExternalLink>}</article>;
}
export function Merch() { return <section id="merch" className="section merch"><h2>Мерч</h2><div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product}/>)}</div></section>; }
export function Contacts() {
  return <section id="contacts" className="section contacts"><h2>Контакты</h2><div className="contact-list">{[['Чат для участников','Телеграм',links.telegram],['Сообщество в вк','ВК',links.vk],['Почта',links.email,'mailto:' + links.email]].map(([label,text,url]) => <div className="contact-row" key={label}><p><Text>{label}</Text></p>{url ? url.startsWith('mailto:') ? <a href={url}>{text}</a> : <ExternalLink href={url}>{text}<Icon/></ExternalLink> : <span className="missing-contact" title="Адрес пока не предоставлен">{text}<Icon/></span>}</div>)}</div></section>;
}
export function Plan({ selected, toggle, notify, close }) {
  const heading = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const download = async () => {
    setDownloading(true);
    try { const { downloadPlanPdf } = await import('./pdf.js'); await downloadPlanPdf(selected); }
    catch { notify({ title: 'Не удалось скачать план', detail: 'Попробуйте ещё раз' }); }
    finally { setDownloading(false); }
  };
  const copy = async () => {
    try { await copyPlan(selected); notify({ title: 'План скопирован', detail: 'Можно вставить его в сообщение' }); }
    catch { notify({ title: 'Не удалось скопировать', detail: 'Проверьте доступ к буферу обмена' }); }
  };
  useEffect(() => { heading.current?.focus(); }, []);
  return <main className={'plan-page ' + (!selected.length ? 'empty' : '')}><div className="plan-heading"><h2 ref={heading} tabIndex="-1">Мой план</h2><button className="icon-button" aria-label="Закрыть план и вернуться на главную" onClick={close}><Icon name="close"/></button></div>{selected.length ? <><div className="plan-days">{days.map(day => <section key={day} className="plan-day"><h3><Text>{day + ' июля'}</Text></h3><div className="event-list">{sortedEvents(day,selected).map(event => <EventRow key={event.id} {...{event,selected,toggle,notify}} planDay={day}/>)}</div>{sortedEvents(day,selected).length === 0 && <p className="no-events"><Text>На этот день событий пока нет</Text></p>}</section>)}</div><div className="plan-actions"><Button disabled={downloading} onClick={download}>{downloading ? 'Подготовка PDF…' : 'Скачать план'}</Button><Button className="outline" onClick={copy}>Скопировать текстом</Button></div></> : <div className="empty-plan"><h3>План пока что пустой</h3><p><Text>Пора добавить интересные события из программы</Text></p></div>}</main>;
}

export function Notice({ message, dismiss }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setLeaving(true), 4500); return () => clearTimeout(timer); }, []);
  return <div className={'notice ' + (leaving ? 'leaving' : '')} role="status" onAnimationEnd={() => { if (leaving) dismiss(); }}><button aria-label="Закрыть уведомление" onClick={() => setLeaving(true)}><strong><Text>{message.title}</Text></strong><span><Text>{message.detail}</Text></span></button></div>;
}
