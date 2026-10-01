# Teaching Portfolio · Rajan Kumar V K, D.Sc. (Tech.)

**Learning is insight, not accumulation.** An interactive teaching portfolio: my teaching philosophy, experience in Nepal and Finland, classroom demonstrations you can try, mentoring in the Lahti Venture Program, course design and sustainability in teaching.

[**▶ Open the live portfolio**](https://rajan56.github.io/Teaching-Portfolio_RajanVK/)

## What is on the page

| Section | Content |
|---|---|
| Teaching philosophy | Four principles: clarity, relevance, student-centred learning, and learning as insight rather than accumulation |
| Experience | Science and chemistry teaching in Nepal (2007 to 2012); Introduction to Industrial Engineering and Management and the Lahti Venture Program at LUT University (2022 to 2026); university pedagogy studies |
| Demonstration 1 | **The falling bottle.** Water streams from holes in a held bottle and stops in free fall. Predict, observe, explain. An introduction to free fall and Einstein's equivalence principle |
| Demonstration 2 | **Make a gas, then prove what it is.** Prepare hydrogen, carbon dioxide or oxygen, collect it over water and identify it by a test |
| Civil engineering | **One building, four lenses.** A renovation decision seen through technical, business, environmental and societal lenses and through the eyes of five stakeholders; plus design science research in a bachelor project |
| Mentoring | How I guide multidisciplinary student teams on company challenges, with the questions I ask instead of giving answers |
| Course design | A constructively aligned redesign of a first-year course: outcomes, activities and assessment mapped to each other |
| Sustainability | The triple bottom line in every case, with two teaching designs drawn from my research |
| Videos | Four short narrated videos (synthetic British voice, captions on screen) |

## How the simulations work

- **Falling bottle** (`js/bottle.js`): jet speed follows Torricelli's law, v = √(2·g_eff·h). While the bottle is held, g_eff = g. In free fall g_eff = 0, so the jets stop.
- **Gas preparation** (`js/gas.js`): three standard school preparations with their identifying tests.
- **One building, four lenses** (`js/lenses.js`): a small life-cycle model per m² (investment, energy, maintenance, embodied and operational carbon, disruption, usability). The values are illustrative teaching values, not design data. Students replace them with sourced figures as a course task.

## Videos

The videos are rendered frame by frame from `video/source/film.html` with Playwright and narrated with the open Kokoro text-to-speech model (voice `bm_george`). See `video/source/` for the scripts (`films.json`), the narration script (`tts.py`) and the renderer (`render-film.js`).

## Run locally

No build step. Open `index.html`, or serve the folder: `python -m http.server 8000`.

## References

- Biggs, J., & Tang, C. (2011). *Teaching for quality learning at university* (4th ed.). Open University Press.
- Nicol, D. J., & Macfarlane-Dick, D. (2006). Formative assessment and self-regulated learning: A model and seven principles of good feedback practice. *Studies in Higher Education, 31*(2), 199–218.
- Peffers, K., Tuunanen, T., Rothenberger, M. A., & Chatterjee, S. (2007). A design science research methodology for information systems research. *Journal of Management Information Systems, 24*(3), 45–77.
- Prince, M. (2004). Does active learning work? A review of the research. *Journal of Engineering Education, 93*(3), 223–231.
- van de Pol, J., Volman, M., & Beishuizen, J. (2010). Scaffolding in teacher–student interaction: A decade of research. *Educational Psychology Review, 22*(3), 271–296.

## Licence

MIT. See `LICENSE`.
