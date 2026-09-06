const fs = require("fs");
const createNeedle = require("/tmp/needle-engine/wasm/needle.js");

const schemas = [
  { name: "get_profile", description: "Get who Md Shagil Nizami is: current role, employer, location, years of experience, and summary. Use for 'who is', 'about', 'introduce' questions.", parameters: { type: "object", properties: {}, required: [] } },
  { name: "get_experience", description: "Get EMPLOYMENT HISTORY: job titles, employers, dates, responsibilities, achievements at work. Use for 'what did he do at Yahoo', 'where has he worked', 'his role at Finbox', 'work experience', 'career'. Pass company: Yahoo, Finbox, or Fincity. Omit company for all roles.", parameters: { type: "object", properties: { company: { type: "string", enum: ["Yahoo", "Finbox", "Fincity"] } }, required: [] } },
  { name: "get_projects", description: "Get software PROJECTS and apps he built, with problem and measured impact. Use for 'show me his projects', 'what has he built', 'portfolio demos'. Pass category: Finance, SaaS, CMS, or Lending. Omit category for all projects.", parameters: { type: "object", properties: { category: { type: "string", enum: ["Finance", "SaaS", "CMS", "Lending"] } }, required: [] } },
  { name: "get_skills", description: "Get the tech skills grouped by category: Languages, Frontend, Backend, Tools, Architecture. Use for 'skills', 'stack', 'what does he know'.", parameters: { type: "object", properties: {}, required: [] } },
  { name: "get_achievements", description: "Get measurable career achievements with numbers. Use for 'impact', 'metrics', 'results'.", parameters: { type: "object", properties: {}, required: [] } },
  { name: "get_education", description: "Get the university degree and dates. Use for 'education', 'college', 'degree'.", parameters: { type: "object", properties: {}, required: [] } },
  { name: "get_contact", description: "Get contact details: email, phone, LinkedIn, GitHub, resume. Use for 'contact', 'email', 'hire', 'reach', 'resume'.", parameters: { type: "object", properties: {}, required: [] } },
  { name: "set_theme", description: "Change the site's COLOR THEME. Values: green (Hacker Green, the default), purple (Cyber Purple), blue (Finance Blue). Use for 'change the color', 'make it purple', 'switch to blue theme'.", parameters: { type: "object", properties: { theme: { type: "string", enum: ["green", "purple", "blue"] } }, required: ["theme"] } },
  { name: "set_muted", description: "Turn the site's terminal SOUND EFFECTS on or off. Use for 'mute the sounds', 'turn the sound on', 'silence', 'unmute'.", parameters: { type: "object", properties: { sound: { type: "string", enum: ["on", "off"] } }, required: ["sound"] } },
  { name: "open_section", description: "Scroll the site to one of its sections. Use for 'open the projects section', 'show me the experience', 'go to contact'.", parameters: { type: "object", properties: { section: { type: "string", enum: ["identity", "experience", "skills", "projects", "achievements", "contact"] } }, required: ["section"] } },
  { name: "toggle_recruiter", description: "Switch the whole site into clean RECRUITER VIEW (plain scannable resume instead of the interactive command center), or back. Use for 'recruiter mode', 'simple resume view', 'back to the terminal'.", parameters: { type: "object", properties: {}, required: [] } },
];

const SYSTEM =
  "You are MSN AI, the assistant on the portfolio website of Md Shagil Nizami. Map each visitor question " +
  "to the matching tool and arguments. If no tool matches the question, respond without a function call. " +
  "Examples: 'what did he do at Finbox' -> get_experience(company=\"Finbox\"); 'show me his projects' -> get_projects(); " +
  "'how do I contact him' -> get_contact(); 'who is he' -> get_profile(); 'what tech does he know' -> get_skills(); " +
  "'where did he study' -> get_education(); 'what impact did he have' -> get_achievements(); " +
  "'make it purple' -> set_theme(theme=\"purple\"); 'mute the sounds' -> set_muted(sound=\"off\"); " +
  "'open the projects section' -> open_section(section=\"projects\"); 'recruiter mode' -> toggle_recruiter().";

const CASES = [
  ["mute the sounds", "set_muted", "off"],
  ["recruiter mode", "toggle_recruiter", null],
  ["turn sound on", "set_muted", "on"],
  ["change color to blue", "set_theme", "blue"],
  ["make it purple", "set_theme", "purple"],
  ["what did he do at finbox?", "get_experience", "Finbox"],
  ["how can I contact him?", "get_contact", null],
  ["what is his email?", "get_contact", null],
  ["does he know react?", "get_skills", null],
  ["what impact did he have?", "get_achievements", null],
];

const SAMPLES = 5;

async function runModel(weightsPath) {
  const Module = await createNeedle();
  const w = fs.readFileSync(weightsPath);
  const p = Module._malloc(w.length);
  new Uint8Array(Module.HEAPU8.buffer, p, w.length).set(w);
  if (Module._needle_load(p, BigInt(w.length)) < 0) throw new Error("load failed");
  Module._free(p);
  Module.ccall("needle_init", "number", ["string", "string", "string"], [SYSTEM, JSON.stringify(schemas), null]);

  const correct = new Array(CASES.length).fill(0);
  for (let s = 0; s < SAMPLES; s++) {
    for (let i = 0; i < CASES.length; i++) {
      const [q, tool, arg] = CASES[i];
      const out = Module._malloc(4096);
      Module.ccall("needle_complete", "number", ["string", "number", "number", "number"], [q, 256, out, 4096]);
      const bytes = new Uint8Array(Module.HEAPU8.buffer, out, 4096);
      const r = JSON.parse(new TextDecoder().decode(bytes.slice(0, bytes.indexOf(0))));
      Module._free(out);
      const first = (r.function_calls || [])[0];
      if (first && first.name === tool) {
        if (arg === null) correct[i]++;
        else if (first.arguments && Object.values(first.arguments).includes(arg)) correct[i]++;
      }
    }
  }
  return correct;
}

(async () => {
  const base = await runModel("public/needle/needle2.cact");
  const tuned = await runModel("public/needle/tuned.cact");
  console.log("query".padEnd(30), "base", "tuned");
  let tb = 0, tt = 0;
  for (let i = 0; i < CASES.length; i++) {
    const b = base[i], t = tuned[i];
    tb += b; tt += t;
    console.log(CASES[i][0].padEnd(30), `${b}/${SAMPLES}`.padEnd(6), `${t}/${SAMPLES}`);
  }
  console.log("\nTOTAL", `${tb}/${CASES.length * SAMPLES}`.padEnd(6), `${tt}/${CASES.length * SAMPLES}`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
