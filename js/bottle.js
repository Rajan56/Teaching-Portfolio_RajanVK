// The falling bottle: water streams from holes while the bottle is held and stops in free fall.
// Jet speed follows Torricelli's law with the effective gravity inside the bottle: v = sqrt(2 * g_eff * h).
// drawBottleScene is shared with the video renderer.
window.drawBottleScene = function (c, W, H, s) {
  // s: { y: bottle offset in px (0 = held at top), falling: bool, g: m/s2, gEff: m/s2, t: seconds, landed: bool }
  const sky = c.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, "#dceef5"); sky.addColorStop(1, "#f8f6ee");
  c.fillStyle = sky; c.fillRect(0, 0, W, H);
  // ground
  c.fillStyle = "#cfd8c8"; c.fillRect(0, H - 34, W, 34); c.fillStyle = "#b9c4b0"; c.fillRect(0, H - 34, W, 3);
  // roof edge
  c.fillStyle = "#8c8478"; c.fillRect(0, 150, 70, 12); c.fillStyle = "#a59c8e"; c.fillRect(0, 162, 58, H - 196);
  c.fillStyle = "#16242b"; c.font = "600 12px -apple-system,Segoe UI,Arial"; c.textAlign = "left"; c.fillText("school roof", 6, 144);

  const bx = W * 0.56, by = 64 + s.y, bw = 74, bh = 150;
  const holes = [0.62, 0.78, 0.92].map(f => by + bh * f);
  const waterTop = by + bh * 0.2;
  // hand
  if (!s.falling && !s.landed) { c.strokeStyle = "#c58f6a"; c.lineWidth = 12; c.lineCap = "round"; c.beginPath(); c.moveTo(70, 120); c.lineTo(bx - bw / 2 - 2, by + 16); c.stroke(); c.lineCap = "butt"; }
  // jets
  const scale = 46; // px per metre for jet drawing
  holes.forEach((hy, i) => {
    const h = (hy - waterTop) / 520; // metres of water above the hole (bottle is about 0.29 m tall)
    const v = Math.sqrt(Math.max(0, 2 * s.gEff * h));
    if (v < 0.02) return;
    c.strokeStyle = "rgba(47,140,196,.85)"; c.lineWidth = 3.2; c.beginPath();
    const x0 = bx + bw / 2, floor = H - 34;
    c.moveTo(x0, hy);
    for (let tt = 0; tt < 1.2; tt += 0.02) {
      const x = x0 + v * tt * scale * 2.2, y = hy + 0.5 * s.g * tt * tt * scale * 2.2;
      if (y > floor) { c.lineTo(x, floor); break; }
      c.lineTo(x + Math.sin(s.t * 14 + tt * 20 + i) * 0.8, y);
    }
    c.stroke();
  });
  // floating droplets while falling
  if (s.falling) {
    c.fillStyle = "rgba(47,140,196,.8)";
    holes.forEach((hy, i) => { c.beginPath(); c.arc(bx + bw / 2 + 5 + i * 2, hy, 2.6, 0, 7); c.fill(); });
  }
  // bottle
  c.fillStyle = "rgba(47,140,196,.55)"; c.fillRect(bx - bw / 2 + 3, waterTop, bw - 6, by + bh - waterTop - 3);
  c.strokeStyle = "#35525e"; c.lineWidth = 3; c.lineJoin = "round";
  c.beginPath(); c.moveTo(bx - 13, by - 22); c.lineTo(bx - 13, by - 6); c.lineTo(bx - bw / 2, by + 22); c.lineTo(bx - bw / 2, by + bh); c.lineTo(bx + bw / 2, by + bh); c.lineTo(bx + bw / 2, by + 22); c.lineTo(bx + 13, by - 6); c.lineTo(bx + 13, by - 22); c.closePath(); c.stroke();
  c.fillStyle = "#c9791a"; c.fillRect(bx - 16, by - 32, 32, 11);
  c.fillStyle = "#16242b"; holes.forEach(hy => { c.beginPath(); c.arc(bx + bw / 2, hy, 3, 0, 7); c.fill(); });
  // motion lines
  if (s.falling) { c.strokeStyle = "rgba(22,36,43,.35)"; c.lineWidth = 2; for (let i = 0; i < 3; i++) { const x = bx - 26 + i * 26; c.beginPath(); c.moveTo(x, by - 44 - i * 5); c.lineTo(x, by - 74 - i * 5); c.stroke(); } }
  // gravity arrow legend
  c.fillStyle = "#16242b"; c.font = "600 13px -apple-system,Segoe UI,Arial"; c.textAlign = "right";
  c.fillText(s.falling ? "free fall: water and bottle fall together" : (s.landed ? "caught: the streams return" : "held: weight of water drives the jets"), W - 12, 24);
};

(function () {
  const cv = document.getElementById("bottleCanvas"); if (!cv) return;
  const c = cv.getContext("2d"), W = cv.width, H = cv.height;
  const st = { y: 0, vy: 0, falling: false, landed: false, g: 9.81, gEff: 9.81, t: 0 };
  let predicted = null, last = performance.now();
  const el = id => document.getElementById(id);
  const maxY = H - 34 - 150 - 64 - 6;

  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000); last = now; st.t += dt;
    if (st.falling) {
      // slowed for visibility: the on-screen drop is scaled so that the fall lasts roughly a second or two
      st.vy += st.g * 60 * dt; st.y += st.vy * dt;
      if (st.y >= maxY) { st.y = maxY; st.falling = false; st.landed = true; st.gEff = st.g; reveal(); }
    }
    window.drawBottleScene(c, W, H, st);
    el("bState").textContent = st.falling ? "free fall" : (st.landed ? "caught at the ground" : "held");
    el("bG").textContent = st.gEff.toFixed(2);
    el("bV").textContent = Math.sqrt(2 * st.gEff * 0.21).toFixed(2);
    requestAnimationFrame(loop);
  }
  function reveal() {
    const ok = predicted === "stops";
    el("bottleVerdict").innerHTML = ok ? "<b>Your prediction was right.</b> The streams stopped for the whole fall and returned when the bottle was caught." : "<b>The streams stopped</b> for the whole fall, then returned when the bottle was caught. Most students predict otherwise the first time, which is exactly why the experiment stays with them.";
    el("bottleExplain").hidden = false;
  }
  document.querySelectorAll("#bottlePredict button").forEach(b => b.addEventListener("click", () => {
    predicted = b.dataset.p; document.querySelectorAll("#bottlePredict button").forEach(x => x.classList.toggle("on", x === b)); el("bottleDrop").disabled = false;
  }));
  el("bottleDrop").addEventListener("click", () => { if (st.falling) return; st.y = 0; st.vy = 0; st.landed = false; st.falling = true; st.gEff = 0; });
  el("bottleReset").addEventListener("click", () => { st.y = 0; st.vy = 0; st.falling = false; st.landed = false; st.gEff = st.g; });
  el("bottleG").addEventListener("change", e => { st.g = +e.target.value; if (!st.falling) st.gEff = st.g; });
  requestAnimationFrame(loop);
})();
