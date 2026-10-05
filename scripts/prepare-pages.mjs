import { mkdir, copyFile } from 'node:fs/promises';
// Отдельный HTML по адресу /plan/ позволяет открывать и обновлять план на Pages.
await mkdir('dist/plan', { recursive: true });
await copyFile('dist/index.html', 'dist/plan/index.html');
