// Связываем короткие служебные слова со следующим словом, даты и цены — с единицами.
export function typograph(text) {
  if (typeof text !== 'string') return text;
  const shortWords = /(^|[\s(«])((?:и|а|в|с|к|у|о|на|по|из|за|не|от|до|во|со|об|но|для|при|без|под|над|или|через)) +(?=\S)/gi;
  let result = text;
  for (let pass = 0; pass < 3; pass++) result = result.replace(shortWords, '$1$2\u00a0');
  return result.replace(/(\d) +(?=\d{3}(?:\D|$))/g, '$1\u00a0').replace(/(\d) +(июля|₽)/g, '$1\u00a0$2');
}
