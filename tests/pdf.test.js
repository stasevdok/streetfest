import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
import { events } from '../src/data.js';
import { createPlanPdf, downloadPlanPdf } from '../src/pdf.js';
import { typograph } from '../src/typography.js';
const fontBytes = {
  regular: await readFile(new URL('../public/fonts/Inter-Medium.ttf',import.meta.url)),
  semibold: await readFile(new URL('../public/fonts/Inter-SemiBold.ttf',import.meta.url)),
};
test('PDF с кириллицей группирует все события, создаёт страницы и встраивает Inter',async()=>{
  const bytes = await createPlanPdf(events.map(event=>event.id),fontBytes);
  assert.equal(Buffer.from(bytes).subarray(0,5).toString(),'%PDF-');
  const pdf = await PDFDocument.load(bytes);
  assert.ok(pdf.getPageCount() >= 3);
  assert.equal(pdf.getTitle(),'Мой план — УЛИЦА');
  for (const page of pdf.getPages()) assert.ok(page.node.Resources().lookupMaybe('Font') || page.node.Resources().toString().includes('/Font'));
  await mkdir(new URL('../verification',import.meta.url),{recursive:true});
  await writeFile(new URL('../verification/plan-all-events.pdf',import.meta.url),bytes);
});
test('кнопка PDF формирует файл с правильным именем и типом',async()=>{
  const previous = {document:globalThis.document,fetch:globalThis.fetch,create:URL.createObjectURL,revoke:URL.revokeObjectURL,setTimeout:globalThis.setTimeout};
  let blob,anchor,clicked=false;
  globalThis.document={createElement:()=>anchor={click:()=>clicked=true,remove:()=>{}},body:{append:()=>{}}};
  globalThis.fetch=async path=>({ok:true,arrayBuffer:async()=>path.includes('SemiBold')?fontBytes.semibold:fontBytes.regular});
  URL.createObjectURL=value=>{blob=value;return 'blob:test';};
  URL.revokeObjectURL=()=>{};
  globalThis.setTimeout=()=>0;
  try {
    await downloadPlanPdf([events[0].id]);
    assert.ok(clicked);
    assert.equal(anchor.download,'ulitsa-my-plan.pdf');
    assert.equal(blob.type,'application/pdf');
    const pdf=await PDFDocument.load(await blob.arrayBuffer());
    assert.equal(pdf.getPageCount(),3);
  }finally{globalThis.document=previous.document;globalThis.fetch=previous.fetch;URL.createObjectURL=previous.create;URL.revokeObjectURL=previous.revoke;globalThis.setTimeout=previous.setTimeout;}
});
test('типографика связывает предлоги, союз и единицы неразрывным пробелом',()=>{
 assert.equal(typograph('В городе и на улицах 3 июля'), 'В\u00a0городе и\u00a0на\u00a0улицах 3\u00a0июля');
 assert.equal(typograph('3 000 ₽'), '3\u00a0000\u00a0₽');
});
