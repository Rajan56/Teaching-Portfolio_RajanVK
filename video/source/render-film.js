// Renders film.html frame by frame (1280x720, 25 fps). Serve the repository root on port 8765 first.
// Usage: node render-film.js <film index 0..3> <output dir> [single time in seconds for a still]
const { chromium } = require("playwright");
(async () => {
  const v = +process.argv[2], out = process.argv[3], still = process.argv[4], FPS = 25;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto("http://localhost:8765/video/source/film.html?v=" + v); await p.waitForFunction(() => window.filmReady);
  const total = await p.evaluate(() => window.filmTotal);
  if (still) { await p.evaluate(t => window.renderFrame(t), +still); await p.screenshot({ path: out, type: "jpeg", quality: 88 }); await b.close(); return; }
  const n = Math.ceil(total * FPS);
  for (let f = 0; f < n; f++) { await p.evaluate(t => window.renderFrame(t), f / FPS); await p.screenshot({ path: `${out}/f${String(f).padStart(5, "0")}.jpg`, type: "jpeg", quality: 90 }); }
  console.log(v, "frames", n); await b.close();
})();
