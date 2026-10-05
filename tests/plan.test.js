import test from 'node:test';
import assert from 'node:assert/strict';
import { events, days } from '../src/data.js';
import { parseSavedPlan, sortedEvents, createPlanText, copyPlan } from '../src/plan.js';

test('повреждённый, неподходящий и устаревший localStorage не ломает план', () => {
  for (const input of [null, '', '{broken', '{}', '123', 'null']) assert.deepEqual(parseSavedPlan(input), []);
  const id = events[0].id;
  assert.deepEqual(parseSavedPlan(JSON.stringify([id, id, 'unknown', null, {}])), [id]);
});
test('полное расписание содержит 16 уникальных событий, фильтр учитывает все дни', () => {
  assert.equal(events.length, 16);
  assert.equal(new Set(events.map(event => event.id)).size, 16);
  const multi = events.find(event => event.days.length === 3);
  for (const day of days) {
    const list = sortedEvents(day);
    assert.ok(list.includes(multi));
    assert.ok(list.every(event => event.days.includes(day)));
    assert.deepEqual(list.map(event => event.time), list.map(event => event.time).sort());
  }
  assert.equal(sortedEvents(3).length, 4);
  assert.equal(sortedEvents(4).length, 7);
  assert.equal(sortedEvents(5).length, 7);
  assert.ok(days.every(day => sortedEvents(day, []).length === 0));
});
test('экспорт содержит только выбранные события и корректно группирует многодневные', () => {
  const selected = [events[0].id, events[1].id];
  const text = createPlanText(selected);
  assert.match(text, /УЛИЦА — фестиваль стрит-арта/);
  assert.equal(text.split('Создание работ').length - 1, 3);
  assert.equal(text.split('Экскурсия с Димой Четыре').length - 1, 1);
  assert.ok(!text.includes(events[2].title));
  assert.match(text, /11:00–18:00/);
  assert.match(text, /Площадка: Речной вокзал/);
  assert.match(text, /Условия входа: Регистрация/);
});
test('копирование передаёт выбранные события в буфер обмена', async () => {
  const selected=[events[0].id,events[1].id];
  let copied;
  await copyPlan(selected,{writeText:async text=>{copied=text;}});
  assert.equal(copied,createPlanText(selected));
  await assert.rejects(copyPlan(selected,{writeText:async()=>{throw new Error('denied');}}));
});
