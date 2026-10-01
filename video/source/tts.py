# Synthesises narration for each film with the open Kokoro TTS model (British voice bm_george) and writes timing + captions.
import json, re, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
M = sys.argv[1] if len(sys.argv) > 1 else "."
k = Kokoro(f"{M}/kokoro-v1.0.onnx", f"{M}/voices-v1.0.bin")
films = json.load(open("films.json")); LEAD, GAP, TAIL, SR = 0.6, 0.5, 1.4, 24000
timing = {}
def ts(t): return "%02d:%02d:%06.3f" % (t // 3600, t % 3600 // 60, t % 60)
for f in films:
    audio = [np.zeros(int(LEAD * SR), dtype=np.float32)]; t = LEAD; starts, durs, caps = [], [], []
    for s in f["segs"]:
        a, sr = k.create(s["text"], voice="bm_george", speed=1.08, lang="en-gb"); assert sr == SR
        d = len(a) / sr; starts.append(t); durs.append(d)
        parts = [p.strip() for p in re.split(r"(?<=[.?!:])\s+", s["text"]) if p.strip()]
        # merge very short pieces with the next one
        merged = []
        for p in parts:
            if merged and len(merged[-1]) < 28: merged[-1] += " " + p
            else: merged.append(p)
        tot = sum(len(p) for p in merged); c = t
        for p in merged:
            e = c + d * len(p) / tot; caps.append({"s": round(c, 2), "e": round(e, 2), "text": p}); c = e
        audio += [a.astype(np.float32), np.zeros(int(GAP * SR), dtype=np.float32)]; t += d + GAP
    audio.append(np.zeros(int(TAIL * SR), dtype=np.float32)); total = t + TAIL
    sf.write(f"{f['slug']}.wav", np.concatenate(audio), SR)
    timing[f["slug"]] = {"starts": starts, "durs": durs, "total": total, "captions": caps}
    with open(f"../{f['slug']}.vtt", "w") as v:
        v.write("WEBVTT\n\n")
        for c in caps: v.write(f"{ts(c['s'])} --> {ts(c['e'])}\n{c['text']}\n\n")
    print(f["slug"], round(total, 1))
open("film-data.js", "w").write("window.FILMS=" + json.dumps(films) + ";window.TIMING=" + json.dumps(timing) + ";")
