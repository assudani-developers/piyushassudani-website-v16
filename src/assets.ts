// Preload fonts and the images seen first, so the page appears complete after the loader.
const FIRST = ['/media/photos/today.webp', '/media/photos/childhood.webp', '/media/apps/atteni-screen.webp', '/media/apps/pypocket-poster.webp', '/media/apps/bandhan-poster.webp'];

export async function loadAll(onProgress: (p: number) => void) {
  let done = 0;
  const total = FIRST.length + 1;
  const tick = () => onProgress(++done / total);
  const fonts = Promise.race([
    Promise.all([
      document.fonts.load('400 100px "Fraunces"'),
      document.fonts.load('italic 400 100px "Fraunces"'),
      document.fonts.load('500 20px "Manrope"'),
      document.fonts.load('400 40px "Tiro Devanagari Hindi"'),
    ]),
    new Promise((r) => setTimeout(r, 3500)),
  ]).then(tick);
  const imgs = FIRST.map((src) => new Promise<void>((res) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = img.onerror = () => { tick(); res(); };
    img.src = src;
  }));
  await Promise.all([fonts, ...imgs]);
}
