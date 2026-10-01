// Navigation, reveal animation, hero motif, steppers and the alignment map.
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // mobile menu
  const menu = $("#menu");
  $("#burger").addEventListener("click", () => menu.classList.toggle("open"));
  $$("#menu a").forEach(a => a.addEventListener("click", () => menu.classList.remove("open")));

  // reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.08 });
  $$(".card, .demo, .lens, .note, .tl, .stepper, .align, .vids figure, .casebox").forEach(el => { el.classList.add("reveal"); io.observe(el); });

  // active nav link
  const secs = $$("main section[id]"), links = $$("#menu a");
  const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(l => l.classList.toggle("on", l.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-40% 0px -55% 0px" });
  secs.forEach(s => so.observe(s));

  // hero motif: predict, observe, explain
  const hc = $("#heroCanvas");
  if (hc) {
    const c = hc.getContext("2d"), W = 420, cx = 210, cy = 210, R = 135;
    const labels = ["Predict", "Observe", "Explain"], cols = ["#c9791a", "#0f5c5a", "#b0527a"];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function draw(t) {
      c.clearRect(0, 0, W, W);
      c.strokeStyle = "#d8ddd9"; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
      const a = reduce ? 0.6 : t / 2600;
      const active = Math.floor(((a % (2 * Math.PI)) / (2 * Math.PI)) * 3 + 0.5) % 3;
      labels.forEach((l, i) => {
        const ang = -Math.PI / 2 + i * 2 * Math.PI / 3, x = cx + R * Math.cos(ang), y = cy + R * Math.sin(ang);
        const on = i === active;
        c.beginPath(); c.arc(x, y, on ? 50 : 44, 0, 7); c.fillStyle = on ? cols[i] : "#fff"; c.fill();
        c.lineWidth = 2.5; c.strokeStyle = cols[i]; c.stroke();
        c.fillStyle = on ? "#fff" : cols[i]; c.font = "600 15px -apple-system,Segoe UI,Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(l, x, y);
      });
      const da = -Math.PI / 2 + a; c.beginPath(); c.arc(cx + R * Math.cos(da), cy + R * Math.sin(da), 7, 0, 7); c.fillStyle = "#16242b"; c.fill();
      c.fillStyle = "#16242b"; c.font = "700 21px Georgia,serif"; c.fillText("Ask before", cx, cy - 13); c.fillText("telling", cx, cy + 14);
      if (!reduce) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  // generic stepper
  function stepper(el, steps, render) {
    const tabs = document.createElement("div"); tabs.className = "tabs";
    const pane = document.createElement("div"); pane.className = "pane";
    steps.forEach((s, i) => { const b = document.createElement("button"); b.textContent = (i + 1) + ". " + s.t; b.addEventListener("click", () => show(i)); tabs.appendChild(b); });
    el.append(tabs, pane);
    function show(i) { [...tabs.children].forEach((b, j) => b.classList.toggle("on", i === j)); pane.innerHTML = render(steps[i]); }
    show(0);
  }

  // design science research (Peffers et al., 2007), example: a material passport for a renovation site
  const dsr = [
    { t: "Problem", h: "Identify the problem and motivate it", s: "Visit or study a renovation site and document what happens to removed components. Students find that nobody knows what materials are in the building, so reusable parts go to waste.", d: "A one-page problem statement with evidence from the site and two literature sources.", m: "I ask whose problem it is and what it costs them. A problem without an owner is only a topic." },
    { t: "Objectives", h: "Define what a solution must achieve", s: "Turn the problem into requirements: which data a material passport must hold, who enters it, and who uses it at demolition or reuse.", d: "A short requirements list agreed with a practitioner.", m: "I help the team separate what is necessary from what is merely attractive." },
    { t: "Design", h: "Design and develop the artefact", s: "Build a simple passport: a data template for components (type, quantity, condition, location, reuse potential), in a spreadsheet or linked to a building model.", d: "A working template filled for one part of the building.", m: "I keep the scope small enough to finish. A modest artefact that works teaches more than an ambitious one that does not." },
    { t: "Demonstrate", h: "Show that it works in a real case", s: "Apply the passport to one floor or one component group and show how a contractor or owner would use it.", d: "A demonstration with real or realistic data.", m: "I arrange that someone from practice sees it, because an outside view changes how students judge their own work." },
    { t: "Evaluate", h: "Evaluate honestly against the objectives", s: "Check the artefact against the requirements, collect feedback from the practitioner, and state plainly what it does not solve.", d: "An evaluation table and a list of limitations.", m: "I treat limitations as a result, not a weakness. Students are graded on honesty of evaluation." },
    { t: "Communicate", h: "Communicate the result", s: "Present the problem, the artefact and its evaluation to the class and the practitioner, in language both can follow.", d: "A short report and a ten-minute presentation.", m: "I coach clear structure: what the problem was, what was built, what was learned." }
  ];
  const dEl = $("#dsr");
  if (dEl) stepper(dEl, dsr, s => `<h4>${s.h}</h4><dl><dt>Students do</dt><dd>${s.s}</dd><dt>Deliverable</dt><dd>${s.d}</dd><dt>My role</dt><dd>${s.m}</dd></dl><p class="fine">Process steps after Peffers, Tuunanen, Rothenberger and Chatterjee (2007), A design science research methodology for information systems research.</p>`);

  // mentoring questions
  const mentor = [
    { t: "Understand", q: "What do you already believe about this problem, and how do you know?", w: "I begin with the students' own view. In the Kempower challenge the team belonged to the generation the company wanted to reach, so their experience was the natural starting point." },
    { t: "Scope", q: "What exactly is the company asking, and what is outside it?", w: "Teams tend to take on too much. I help them state the problem in one sentence and agree it with the company representative." },
    { t: "Evidence", q: "What would convince a sceptical manager?", w: "Opinions become hypotheses. Students decide what data they need, from surveys, interviews or company figures, and plan how to collect it." },
    { t: "Ideas", q: "What else could be true? What would the opposite idea look like?", w: "In the first round no idea is ranked or criticised. Students from different disciplines see different things, and I make sure the quieter voices are heard before the team converges." },
    { t: "Communicate", q: "If the company remembers one sentence, which one should it be?", w: "I coach structure, clarity and professional conduct with company partners. The students present; I do not speak for them." }
  ];
  const mEl = $("#mentor");
  if (mEl) stepper(mEl, mentor, s => `<blockquote>"${s.q}"</blockquote><p style="margin:0;color:var(--ink2);font-size:.96rem">${s.w}</p>`);

  // constructive alignment map
  const al = $("#align");
  if (al) {
    const ilos = [
      ["ILO1", "Identify and use core academic study practices and explain how they support one's own learning."],
      ["ILO2", "Explain the fundamental concepts of industrial engineering and management and the role of the industrial engineer."],
      ["ILO3", "Apply basic process and systems thinking to a small real-world example and propose two justified improvements."],
      ["ILO4", "Use academic sources and digital tools responsibly, with a transparent statement of any generative AI assistance."],
      ["ILO5", "Reflect on study choices, career directions and the role of sustainability and ethics in the discipline."]
    ];
    const acts = [
      ["Welcome orientation lecture", [1]],
      ["Eight Moodle modules: pre-task, short reading or video, applied after-task", [1, 2, 4]],
      ["Workshop 1: process and systems thinking with mini-cases", [2, 3]],
      ["Workshop 2: personal study plan and CV with peer review", [1, 5]],
      ["Company visit with prepared questions and structured debrief", [2, 5]],
      ["Final mini-analysis of a real organisation", [2, 3, 4]],
      ["Integrative end-of-course reflection", [1, 4, 5]]
    ];
    const ass = [
      ["Information security and information search tasks · 10 %", [1, 4]],
      ["Personal study plan · 15 %", [1, 5]],
      ["CV draft and peer-review round · 10 %", [5]],
      ["Sustainability and company-visit reflection · 10 %", [2, 5]],
      ["Workshop diary entries · 10 %", [2, 3]],
      ["Final mini-analysis · 30 %", [2, 3, 4]],
      ["Integrative reflection with AI-use statement · 15 %", [1, 4, 5]]
    ];
    al.innerHTML = `<div class="col"><h4>Intended learning outcomes</h4>${ilos.map((x, i) => `<div class="item ilo" data-i="${i + 1}"><b>${x[0]}</b> ${x[1]}</div>`).join("")}</div>
      <div class="col"><h4>Teaching and learning activities</h4>${acts.map(x => `<div class="item act" data-l="${x[1].join(",")}">${x[0]}</div>`).join("")}</div>
      <div class="col"><h4>Assessment (pass/fail, short rubrics)</h4>${ass.map(x => `<div class="item act" data-l="${x[1].join(",")}">${x[0]}</div>`).join("")}</div>`;
    function pick(i) {
      $$(".ilo", al).forEach(e => e.classList.toggle("on", e.dataset.i == i));
      $$(".act", al).forEach(e => { const hit = e.dataset.l.split(",").includes(String(i)); e.classList.toggle("on", hit); e.classList.toggle("dim", !hit); });
    }
    $$(".ilo", al).forEach(e => e.addEventListener("click", () => pick(e.dataset.i)));
    pick(3);
  }
})();
