// Vite задаёт корень ресурсов: / локально и /streetfest/ на GitHub Pages.
export const basePath = import.meta.env?.BASE_URL || '/';
export const homePath = basePath;
export const planPath = basePath + 'plan';
export const publicAsset = path => basePath + path.replace(/^\/+/, '');
export const isPlanPath = path => [planPath, planPath + '/', planPath + '/index.html'].includes(path);
