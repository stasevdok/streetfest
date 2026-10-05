import { days, events } from './data.js';
export const STORAGE_KEY = 'ulitsa-my-plan';
export function parseSavedPlan(raw) {
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? [...new Set(value.filter(id => events.some(event => event.id === id)))] : [];
  } catch { return []; }
}
export function sortedEvents(day = null, selected = null) {
  return events.filter(event => (!day || event.days.includes(day)) && (!selected || selected.includes(event.id)))
    .sort((a, b) => (day ? 0 : a.days[0] - b.days[0]) || a.time.localeCompare(b.time));
}
export function createPlanText(selected) {
  return ['УЛИЦА — фестиваль стрит-арта', 'Мой план · 3–5 июля', '',
    ...days.flatMap(day => {
      const list = sortedEvents(day, selected);
      return list.length ? [day + ' июля', ...list.map(event => event.time + ' — ' + event.title + '\nПлощадка: ' + event.venue + '\nУсловия входа: ' + event.entry), ''] : [];
    })].join('\n');
}
export async function copyPlan(selected, clipboard = navigator.clipboard) {
  await clipboard.writeText(createPlanText(selected));
}
