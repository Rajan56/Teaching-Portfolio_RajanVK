// School gas preparation: choose reagents, collect the gas over water, identify it with a test.
(function () {
  const cv = document.getElementById("gasCanvas"); if (!cv) return;
  const c = cv.getContext("2d"), W = cv.width, H = cv.height, el = id => document.getElementById(id);
  const G = {
    h2: { name: "hydrogen", liquid: "#e9eef0", solid: "#8d99a3", eq: "Zn + 2 HCl → ZnCl₂ + H₂", test: "A burning splint at the mouth of the jar gives a squeaky pop.", why: "Hydrogen burns rapidly with the oxygen in air. Zinc displaces hydrogen from the acid because it is more reactive." },
    co2: { name: "carbon dioxide", liquid: "#e9eef0", solid: "#f3f1ea", eq: "CaCO₃ + 2 HCl → CaCl₂ + H₂O + CO₂", test: "Limewater shaken with the gas turns milky.", why: "Carbon dioxide reacts with calcium hydroxide to form insoluble calcium carbonate. The gas also puts out a burning splint." },
    o2: { name: "oxygen", liquid: "#eef3f6", solid: "#2e2a2a", eq: "2 H₂O₂ → 2 H₂O + O₂  (MnO₂ catalyst)", test: "A glowing splint relights in the jar.", why: "Oxygen supports combustion. Manganese dioxide speeds up the decomposition and is not used up, which makes it a good first example of a catalyst." }
  };
  let gas = null, pred = null, vol = 0, t = 0, testT = -1, bubbles = [], last = performance.now();

  function draw() {
    c.clearRect(0, 0, W, H); c.fillStyle = "#f4f1e8"; c.fillRect(0, 0, W, H);
    c.fillStyle = "#b9a98f"; c.fillRect(0, H - 40, W, 40);
    // flask
    const fx = 110, fy = H - 40;
    c.fillStyle = gas ? G[gas].liquid : "#eef2f3";
    c.beginPath(); c.moveTo(fx - 58, fy - 6); c.lineTo(fx + 58, fy - 6); c.lineTo(fx + 30, fy - 70); c.lineTo(fx - 30, fy - 70); c.closePath(); c.fill();
    if (gas) { c.fillStyle = G[gas].solid; for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(fx - 36 + i * 12, fy - 12, 6, 0, 7); c.fill(); c.strokeStyle = "#667"; c.lineWidth = 1; c.stroke(); } }
    c.strokeStyle = "#35525e"; c.lineWidth = 3; c.lineJoin = "round";
    c.beginPath(); c.moveTo(fx - 14, fy - 190); c.lineTo(fx - 14, fy - 130); c.lineTo(fx - 62, fy - 4); c.lineTo(fx + 62, fy - 4); c.lineTo(fx + 14, fy - 130); c.lineTo(fx + 14, fy - 190); c.stroke();
    c.fillStyle = "#8a5a3b"; c.fillRect(fx - 17, fy - 200, 34, 14);
    // delivery tube
    c.strokeStyle = "#6c8793"; c.lineWidth = 5; c.beginPath(); c.moveTo(fx, fy - 196); c.lineTo(fx, fy - 250); c.lineTo(300, fy - 250); c.lineTo(300, fy - 36); c.lineTo(345, fy - 36); c.lineTo(345, fy - 62); c.stroke();
    // trough
    const tx = 255, tw = 180, ty = fy - 96;
    c.fillStyle = "rgba(84,160,205,.35)"; c.fillRect(tx, ty + 14, tw, 82);
    c.strokeStyle = "#35525e"; c.lineWidth = 3; c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx, fy); c.lineTo(tx + tw, fy); c.lineTo(tx + tw, ty); c.stroke();
    // inverted jar
    const jx = 318, jw = 56, jtop = ty - 120, jbot = fy - 40, jh = jbot - jtop;
    const gasH = jh * vol;
    c.fillStyle = "rgba(84,160,205,.45)"; c.fillRect(jx, jtop + gasH, jw, jh - gasH);
    let tint = "rgba(255,255,255,.5)";
    if (testT >= 0 && gas === "co2") tint = "rgba(255,255,255," + Math.min(0.95, 0.5 + testT * 0.5) + ")";
    c.fillStyle = tint; c.fillRect(jx, jtop, jw, gasH);
    c.strokeStyle = "#35525e"; c.beginPath(); c.moveTo(jx, jbot); c.lineTo(jx, jtop); c.lineTo(jx + jw, jtop); c.lineTo(jx + jw, jbot); c.stroke();
    // bubbles
    c.fillStyle = "rgba(255,255,255,.9)"; c.strokeStyle = "rgba(53,82,94,.5)"; c.lineWidth = 1;
    bubbles.forEach(b => { c.beginPath(); c.arc(b.x, b.y, b.r, 0, 7); c.fill(); c.stroke(); });
    // test visuals
    if (testT >= 0) {
      const sx = jx + jw / 2, sy = jtop - 26;
      c.strokeStyle = "#8a5a3b"; c.lineWidth = 4; c.beginPath(); c.moveTo(sx + 70, sy - 40); c.lineTo(sx, sy + 34); c.stroke();
      if (gas === "h2" && testT < 0.5) { c.fillStyle = "rgba(255,190,60," + (1 - testT * 2) + ")"; c.beginPath(); c.arc(sx, sy + 34, 20 + testT * 90, 0, 7); c.fill(); c.fillStyle = "#16242b"; c.font = "700 22px Georgia"; c.textAlign = "center"; c.fillText("pop!", sx, sy - 6); }
      if (gas === "o2") { const f = Math.min(1, testT * 1.5); c.fillStyle = "#e9a03b"; c.beginPath(); c.ellipse(sx, sy + 28 - 12 * f, 5 + 5 * f, 8 + 16 * f, 0, 0, 7); c.fill(); c.fillStyle = "#f6dc7a"; c.beginPath(); c.ellipse(sx, sy + 30 - 8 * f, 2 + 3 * f, 4 + 8 * f, 0, 0, 7); c.fill(); }
      if (gas === "co2") { c.fillStyle = "#16242b"; c.font = "600 13px -apple-system,Segoe UI,Arial"; c.textAlign = "center"; c.fillText("limewater turns milky", sx, jtop - 10); }
    }
    c.fillStyle = "#16242b"; c.font = "600 12px -apple-system,Segoe UI,Arial"; c.textAlign = "center";
    c.fillText("reaction flask", fx, fy + 22); c.fillText("gas collected over water", tx + tw / 2, fy + 22);
  }
  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000); last = now; t += dt;
    if (gas && vol < 1) {
      vol = Math.min(1, vol + dt / 5);
      if (Math.random() < 0.5) bubbles.push({ x: 110 - 30 + Math.random() * 60, y: H - 60, r: 2 + Math.random() * 3, k: 0 });
      if (Math.random() < 0.3) bubbles.push({ x: 345 + (Math.random() - 0.5) * 8, y: H - 104, r: 2 + Math.random() * 3, k: 1 });
    }
    bubbles.forEach(b => b.y -= (b.k ? 90 : 60) * dt);
    bubbles = bubbles.filter(b => b.k ? b.y > H - 40 - 56 - 120 * (1 - vol) - 60 && b.y > 120 : b.y > H - 112);
    if (testT >= 0) testT += dt;
    el("gVol").textContent = Math.round(vol * 100);
    el("gasTest").disabled = !(gas && pred && vol >= 1);
    if (gas) el("gNote").textContent = vol < 1 ? "Collecting " + (pred ? "" : "(make a prediction while you wait) ") + "…" : (pred ? "Jar is full. Run the test." : "Jar is full. Predict the gas, then test it.");
    draw(); requestAnimationFrame(loop);
  }
  const on = (sel, b) => document.querySelectorAll(sel + " button").forEach(x => x.classList.toggle("on", x === b));
  document.querySelectorAll("#gasChoose button").forEach(b => b.addEventListener("click", () => { gas = b.dataset.g; vol = 0; testT = -1; pred = null; bubbles = []; on("#gasChoose", b); on("#gasPredict", null); el("gasExplain").hidden = true; }));
  document.querySelectorAll("#gasPredict button").forEach(b => b.addEventListener("click", () => { pred = b.dataset.p; on("#gasPredict", b); }));
  el("gasTest").addEventListener("click", () => {
    testT = 0; const g = G[gas];
    el("gasVerdict").innerHTML = (pred === gas ? "<b>Correct.</b> " : "<b>Not quite.</b> ") + "The gas is " + g.name + ". " + g.test;
    el("gasEq").textContent = g.eq; el("gasWhy").textContent = g.why; el("gasExplain").hidden = false;
  });
  requestAnimationFrame(loop);
})();
