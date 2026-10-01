// Interactive tools from my first-year teaching: a bottleneck game, a team role reflection and a time management sorter.
(function () {
  const el = id => document.getElementById(id);

  /* 1. Find the bottleneck: four stations in a line. Throughput equals the slowest station; work piles up in front of it. */
  const cv = el("lineCanvas");
  if (cv) {
    const c = cv.getContext("2d"), W = cv.width, H = cv.height, names = ["Cutting", "Assembly", "Testing", "Packing"], ids = ["s0", "s1", "s2", "s3"];
    let q = [0, 0, 0, 0], done = 0, movers = [], last = performance.now(), acc = [0, 0, 0, 0];
    const cap = () => ids.map(i => +el(i).value);
    function reset() { q = [0, 0, 0, 0]; done = 0; movers = []; acc = [0, 0, 0, 0]; }
    ids.forEach((i, k) => el(i).addEventListener("input", () => { el(i + "v").textContent = el(i).value; reset(); info(); }));
    el("lineReset").addEventListener("click", () => { [12, 8, 10, 14].forEach((v, k) => { el(ids[k]).value = v; el(ids[k] + "v").textContent = v; }); reset(); info(); });
    function info() {
      const cp = cap(), th = Math.min(...cp), b = cp.indexOf(th);
      el("lineTh").textContent = th; el("lineB").textContent = names[b];
      el("lineMsg").textContent = cp.every(v => v === th) ? "The line is balanced: every station works at the same pace and nothing piles up." : "Adding capacity anywhere except " + names[b] + " changes nothing. Try it, then raise " + names[b] + " and watch the bottleneck move.";
    }
    const X = k => 70 + k * ((W - 140) / 3), Y = 120;
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; const cp = cap(), speed = 0.35; // one simulated hour takes about three seconds
      // raw material is always available at station 0
      for (let k = 0; k < 4; k++) {
        acc[k] += cp[k] * speed * dt;
        while (acc[k] >= 1) { acc[k] -= 1; if (k === 0 || q[k] > 0) { if (k > 0) q[k]--; movers.push({ k, p: 0 }); } }
      }
      movers.forEach(m => m.p += dt * 1.6);
      movers = movers.filter(m => { if (m.p >= 1) { if (m.k < 3) q[m.k + 1] = Math.min(60, q[m.k + 1] + 1); else done++; return false; } return true; });
      c.clearRect(0, 0, W, H); c.fillStyle = "#f6f4ec"; c.fillRect(0, 0, W, H);
      const th = Math.min(...cp);
      for (let k = 0; k < 4; k++) {
        const x = X(k), isB = cp[k] === th && !cp.every(v => v === th);
        if (k < 3) { c.strokeStyle = "#cfd6d3"; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 44, Y); c.lineTo(X(k + 1) - 44, Y); c.stroke(); }
        c.fillStyle = isB ? "#c9791a" : "#0f5c5a"; c.beginPath(); c.roundRect(x - 44, Y - 30, 88, 60, 12); c.fill();
        c.fillStyle = "#fff"; c.font = "600 14px -apple-system,Segoe UI,Arial"; c.textAlign = "center"; c.fillText(names[k], x, Y - 4); c.font = "500 12px -apple-system,Segoe UI,Arial"; c.fillText(cp[k] + " / h", x, Y + 14);
        // queue in front of the station
        const n = q[k]; for (let i = 0; i < Math.min(n, 40); i++) { c.fillStyle = "#b0527a"; c.beginPath(); c.arc(x - 34 + (i % 8) * 9.6, Y - 44 - Math.floor(i / 8) * 10, 4, 0, 7); c.fill(); }
        if (n > 0) { c.fillStyle = "#16242b"; c.font = "600 12px -apple-system,Segoe UI,Arial"; c.fillText(n + " waiting", x, Y + 52); }
        if (isB) { c.fillStyle = "#c9791a"; c.font = "700 12px -apple-system,Segoe UI,Arial"; c.fillText("BOTTLENECK", x, Y + 70); }
      }
      c.fillStyle = "#16242b"; movers.forEach(m => { const x0 = X(m.k) + 44, x1 = m.k < 3 ? X(m.k + 1) - 44 : W - 8; c.beginPath(); c.arc(x0 + (x1 - x0) * m.p, Y, 5, 0, 7); c.fill(); });
      c.textAlign = "right"; c.font = "600 13px -apple-system,Segoe UI,Arial"; c.fillText("finished: " + done, W - 10, 22);
      requestAnimationFrame(loop);
    }
    info(); requestAnimationFrame(loop);
  }

  /* 2. Team role reflection: an informal exercise inspired by Belbin's nine team roles (not the official Belbin assessment). */
  const tr = el("rolesQ");
  if (tr) {
    const R = [
      ["Plant", "I enjoy coming up with new and unusual ideas.", "Creative problem solving. Valued in R&D, product development and design."],
      ["Resource Investigator", "I like making contacts and finding out what others are doing.", "Exploring opportunities. Valued in sales, purchasing and business development."],
      ["Co-ordinator", "I help a group agree on goals and share out the work.", "Bringing people together. Valued in project and team leadership."],
      ["Shaper", "I push the team forward when progress slows down.", "Drive under pressure. Valued in production management and start-ups."],
      ["Monitor Evaluator", "I weigh the options calmly before I decide.", "Sound judgement. Valued in analysis, controlling and quality."],
      ["Teamworker", "I notice how people feel and help the team get along.", "Cooperation. Valued in HR, customer service and any cross-functional team."],
      ["Implementer", "I turn plans into practical steps and get them done.", "Turning ideas into action. Valued in operations, logistics and process improvement."],
      ["Completer Finisher", "I check details and make sure nothing is left unfinished.", "Accuracy and follow-through. Valued in quality assurance and commissioning."],
      ["Specialist", "I like going deep into one subject and becoming the expert.", "Deep knowledge. Valued in engineering, data and technical expert roles."]
    ];
    const vals = R.map(() => 2);
    el("rolesQ").innerHTML = R.map((r, i) => `<label><span>${r[1]}</span><input type="range" min="0" max="4" step="1" value="2" data-i="${i}"></label>`).join("");
    const rc = el("rolesCanvas"), c = rc.getContext("2d");
    function draw() {
      const W = rc.width, cx = W / 2, cy = W / 2, Rr = W / 2 - 80; c.clearRect(0, 0, W, W);
      for (let g = 1; g <= 4; g++) { c.strokeStyle = "#dfe5e3"; c.lineWidth = 1; c.beginPath(); for (let i = 0; i <= 9; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 9; c.lineTo(cx + Rr * g / 4 * Math.cos(a), cy + Rr * g / 4 * Math.sin(a)); } c.stroke(); }
      c.beginPath(); vals.forEach((v, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 9, r = Rr * (0.08 + v / 4 * 0.92); c.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); }); c.closePath(); c.fillStyle = "rgba(15,92,90,.25)"; c.fill(); c.strokeStyle = "#0f5c5a"; c.lineWidth = 2.5; c.stroke();
      c.fillStyle = "#16242b"; c.font = "600 11.5px -apple-system,Segoe UI,Arial"; c.textAlign = "center";
      R.forEach((r, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 9; const w = r[0].split(" "); w.forEach((t, j) => c.fillText(t, cx + (Rr + 34) * Math.cos(a), cy + (Rr + 30) * Math.sin(a) + j * 13 - (w.length - 1) * 5)); });
      const order = vals.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).slice(0, 2);
      el("rolesOut").innerHTML = order.map(o => `<div><b>${R[o[1]][0]}</b><span>${R[o[1]][2]}</span></div>`).join("");
    }
    el("rolesQ").addEventListener("input", e => { vals[+e.target.dataset.i] = +e.target.value; draw(); });
    draw();
  }

  /* 3. Urgent or important? Sort student tasks into the four quadrants of the Eisenhower matrix. */
  const tm = el("tmTask");
  if (tm) {
    const T = [
      ["An assignment is due tomorrow morning.", 0, "Urgent and important. This is where deadlines land when planning slips."],
      ["Begin the literature search for a thesis due in two months.", 1, "Important but not urgent. Scheduling this now is what prevents a crisis later."],
      ["A group chat wants an instant reply about where to have lunch.", 2, "Urgent for others, not important for your goals. Answer briefly and move on."],
      ["Scrolling social media between lectures.", 3, "Neither urgent nor important. Fine as rest, costly as a habit."],
      ["An exam takes place in three days.", 0, "Urgent and important. Do it first."],
      ["Keep a regular sleep and exercise routine.", 1, "Important and never urgent, which is why it is the first thing to be dropped."],
      ["A classmate asks you to proofread a CV within the hour.", 2, "Urgent for them. Help if you can, but set a limit."],
      ["Update your personal study plan for next year.", 1, "Important, not urgent. Put a date on it."]
    ];
    const Q = ["Do first", "Schedule", "Keep it short", "Let it go"]; let i = 0, score = 0;
    function show() { if (i >= T.length) { tm.textContent = "Finished: " + score + " of " + T.length + " placed as I would place them."; el("tmFb").innerHTML = "Most students find the <b>Schedule</b> quadrant hardest. It holds the work that decides a degree, and nothing in it ever shouts. <a href='#' id='tmAgain'>Play again</a>"; el("tmAgain").addEventListener("click", e => { e.preventDefault(); i = 0; score = 0; el("tmFb").textContent = ""; show(); }); return; } tm.textContent = T[i][0]; el("tmN").textContent = (i + 1) + " / " + T.length; }
    document.querySelectorAll("#tmGrid button").forEach(b => b.addEventListener("click", () => {
      if (i >= T.length) return; const pick = +b.dataset.q, ok = pick === T[i][1]; if (ok) score++;
      el("tmFb").innerHTML = (ok ? "<b>Agreed.</b> " : "<b>I would place it under “" + Q[T[i][1]] + "”.</b> ") + T[i][2];
      b.classList.add(ok ? "ok" : "no"); setTimeout(() => b.classList.remove("ok", "no"), 600); i++; show();
    }));
    show();
  }
})();
