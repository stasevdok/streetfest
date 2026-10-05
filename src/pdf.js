import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { days } from './data.js';
import { sortedEvents } from './plan.js';
import { typograph } from './typography.js';
import { publicAsset } from './paths.js';
import { logo } from './logo.js';

// Отдельная функция принимает байты шрифтов, поэтому PDF можно проверить и без браузера.
export async function createPlanPdf(selected, fontBytes) {
  const document = await PDFDocument.create();
  document.registerFontkit(fontkit);
  document.setTitle('Мой план — УЛИЦА');
  document.setAuthor('Фестиваль УЛИЦА');
  document.setSubject('Выбранные события фестиваля 3–5 июля');
  const regular = await document.embedFont(fontBytes.regular);
  const semibold = await document.embedFont(fontBytes.semibold);
  const ink = rgb(25/255, 23/255, 22/255);
  const muted = rgb(.38,.37,.36);
  const pageWidth = 595.28, pageHeight = 841.89, margin = 40;
  const contentWidth = pageWidth - 2 * margin;
  let page, cursor;
  const draw = (text, size, font = regular, color = ink) => {
    page.drawText(text, { x: margin, y: cursor, size, font, color });
    cursor -= size * 1.35;
  };
  const wrap = (text, font, size) => {
    const words = typograph(text).split(' ');
    const lines = [];
    let line = '';
    for (const word of words) {
      const next = line ? line + ' ' + word : word;
      if (line && font.widthOfTextAtSize(next, size) > contentWidth) { lines.push(line); line = word; }
      else line = next;
    }
    if (line) lines.push(line);
    return lines;
  };
  const newPage = day => {
    page = document.addPage([pageWidth,pageHeight]);
    // SVG остаётся векторным и занимает прежнее место заголовка высотой 28 pt.
    for (const path of logo.paths) page.drawSvgPath(path, { x: margin, y: pageHeight - 40, scale: 28 / logo.height, color: ink });
    cursor = pageHeight - 60 - 28 * 1.35;
    draw('Фестиваль стрит-арта · Мой план', 12, regular, muted);
    cursor -= 20;
    draw(day ? day + ' июля' : 'План пока что пустой', 20, semibold);
    cursor -= 10;
  };
  for (const day of days) {
    const list = sortedEvents(day, selected);
    if (!list.length) continue;
    newPage(day);
    for (const event of list) {
      const title = wrap(event.title, semibold, 13);
      const venue = wrap('Площадка: ' + event.venue, regular, 11);
      const height = title.length * 17.55 + venue.length * 14.85 + 50;
      if (cursor - height < 60) newPage(day);
      page.drawLine({ start: { x: margin, y: cursor + 6 }, end: { x: pageWidth - margin, y: cursor + 6 }, thickness: 1, color: ink });
      cursor -= 10;
      title.forEach(line => draw(line, 13, semibold));
      draw(event.time, 11);
      venue.forEach(line => draw(line, 11, regular, muted));
      draw('Условия входа: ' + event.entry, 11, regular, muted);
      cursor -= 10;
    }
  }
  if (!document.getPageCount()) newPage(null);
  const pages = document.getPages();
  pages.forEach((item,index) => item.drawText((index + 1) + ' / ' + pages.length, { x: pageWidth - margin - 25, y: 28, size: 9, font: regular, color: muted }));
  return document.save();
}

export async function downloadPlanPdf(selected) {
  const loadFont = async path => {
    const response = await fetch(publicAsset(path));
    if (!response.ok) throw new Error('Не удалось загрузить шрифт PDF');
    return response.arrayBuffer();
  };
  const [regular,semibold] = await Promise.all([loadFont('/fonts/Inter-Medium.ttf'),loadFont('/fonts/Inter-SemiBold.ttf')]);
  const bytes = await createPlanPdf(selected,{regular,semibold});
  const url = URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'ulitsa-my-plan.pdf';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
