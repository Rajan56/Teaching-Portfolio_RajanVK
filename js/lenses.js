// One building, four lenses: a teaching model of a renovation decision.
// All values are illustrative and per m2 of floor area. They are not design data.
window.LensModel = (function () {
  const OPT = [
    { k: "A", n: "Repair the minimum", d: "Fix what is broken and keep using the building as it is.", capex: 300, energy: 180, maint: 35, emb: 40, life: 20, months: 2, use: 2, tech: 45 },
    { k: "B", n: "Deep energy renovation", d: "New services, envelope upgrade and modern indoor climate.", capex: 1400, energy: 80, maint: 18, emb: 180, life: 45, months: 10, use: 4, tech: 82 },
    { k: "C", n: "Adaptive reuse", d: "Renovate and convert to a new, shared and more intensive use.", capex: 1700, energy: 90, maint: 18, emb: 220, life: 45, months: 12, use: 5, tech: 80 },
    { k: "D", n: "Demolish and build new", d: "Replace the building with a new one on the same site.", capex: 3400, energy: 55, maint: 12, emb: 650, life: 60, months: 24, use: 5, tech: 96 }
  ];
  const WHO = {
    balanced: { w: [0.25, 0.25, 0.25, 0.25], note: "All four lenses count equally." },
    owner: { w: [0.2, 0.5, 0.15, 0.15], note: "The owner pays the bills, so life-cycle cost carries half the weight." },
    user: { w: [0.2, 0.1, 0.1, 0.6], note: "People who use the building care most about usability and about how long they are displaced." },
    city: { w: [0.15, 0.2, 0.4, 0.25], note: "The city has climate targets and answers to its residents, so carbon and social value lead." },
    contractor: { w: [0.4, 0.4, 0.1, 0.1], note: "For the contractor, the business lens is the size of the contract, so a larger and technically ambitious project scores well." }
  };
  function evaluate(h, price, ef) {
    const rows = OPT.map(o => {
      let cost = o.capex, carbon = o.emb, y1 = Math.min(h, o.life);
      cost += y1 * (o.energy * price + o.maint); carbon += y1 * o.energy * ef;
      if (h > o.life) {
        const rest = h - o.life;
        if (o.k === "A") { cost += 1400 + rest * (80 * price + 18); carbon += 180 + rest * 80 * ef; }   // the postponed deep renovation arrives anyway
        else { cost += 500 + rest * (o.energy * price + o.maint); carbon += 60 + rest * o.energy * ef; }  // mid-life refurbishment
      }
      const tech = o.tech * Math.sqrt(Math.min(1, o.life / h));
      const soc = 0.6 * o.use * 20 + 0.4 * (1 - o.months / 24) * 100;
      return { o, cost, carbon, tech, soc };
    });
    const minC = Math.min(...rows.map(r => r.cost)), minE = Math.min(...rows.map(r => r.carbon));
    rows.forEach(r => { r.bus = 100 * minC / r.cost; r.env = 100 * minE / r.carbon; });
    return rows;
  }
  function rank(rows, who) { const w = WHO[who].w, maxCap = Math.max(...rows.map(r => r.o.capex));
    // for the contractor, the business lens is the size of the contract, not the owner's life-cycle cost
    rows.forEach(r => { const bus = who === "contractor" ? 100 * r.o.capex / maxCap : r.bus; r.score = w[0] * r.tech + w[1] * bus + w[2] * r.env + w[3] * r.soc; }); return rows.reduce((a, b) => b.score > a.score ? b : a); }
  return { OPT, WHO, evaluate, rank };
})();

(function () {
  const tb = document.getElementById("lensTable"); if (!tb) return;
  const el = id => document.getElementById(id), M = window.LensModel; let who = "balanced";
  const fmt = n => Math.round(n).toLocaleString("en-GB");
  function render() {
    const h = +el("lh").value, p = +el("lp").value, e = +el("le").value;
    el("lhV").textContent = h; el("lpV").textContent = p.toFixed(2); el("leV").textContent = e.toFixed(2);
    const rows = M.evaluate(h, p, e), best = M.rank(rows, who);
    tb.innerHTML = rows.map(r => `<div class="opt ${r === best ? "best" : ""}">
      <div class="opt-h"><div><b>${r.o.k}. ${r.o.n}</b><br><span>${r.o.d}</span></div><em>${r === best ? "Preferred · " : ""}${Math.round(r.score)} / 100</em></div>
      <div class="bars">
        <div class="bar t"><small><span>Technical</span><span>${Math.round(r.tech)}</span></small><i><u style="width:${r.tech}%"></u></i></div>
        <div class="bar b"><small><span>Business</span><span>€${fmt(r.cost)}</span></small><i><u style="width:${r.bus}%"></u></i></div>
        <div class="bar e"><small><span>Environment</span><span>${fmt(r.carbon)} kg</span></small><i><u style="width:${r.env}%"></u></i></div>
        <div class="bar s"><small><span>Society</span><span>${Math.round(r.soc)}</span></small><i><u style="width:${r.soc}%"></u></i></div>
      </div></div>`).join("");
    el("lensWhoNote").textContent = M.WHO[who].note;
    const all = Object.keys(M.WHO).map(k => M.rank(M.evaluate(h, p, e), k).o.k), distinct = [...new Set(all)];
    el("lensVerdict").innerHTML = `From this seat, the preferred option is <b>${best.o.k}. ${best.o.n}</b>. ` + (distinct.length > 1 ? `Across the five viewpoints, ${distinct.length} different options come first (${distinct.join(", ")}). There is no single right answer, only a well-argued one.` : `With these settings every viewpoint agrees. Change the horizon or the prices and see whether the agreement holds.`);
  }
  ["lh", "lp", "le"].forEach(i => el(i).addEventListener("input", render));
  document.querySelectorAll("#lensWho button").forEach(b => b.addEventListener("click", () => { who = b.dataset.w; document.querySelectorAll("#lensWho button").forEach(x => x.classList.toggle("on", x === b)); render(); }));
  render();
})();
