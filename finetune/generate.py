#!/usr/bin/env python3
"""Generate the MSN AI fine-tune dataset (Needle JSONL format).

Grounded in the resume PDFs (extracted facts) + the existing action tools.
Each example teaches the routing model which tool to call and with what
arguments for a real visitor/recruiter question. Schemas here mirror
src/lib/agentTools.ts (single source of truth for the shipped registry).
"""
import json

# --- Tool schemas (mirror src/lib/agentTools.ts) ----------------------------
TOOLS = {
    "get_profile": {"type": "object", "properties": {}, "required": []},
    "get_experience": {
        "type": "object",
        "properties": {"company": {"type": "string", "enum": ["Yahoo", "Finbox", "Fincity"]}},
        "required": [],
    },
    "get_projects": {
        "type": "object",
        "properties": {"category": {"type": "string", "enum": ["Finance", "SaaS", "CMS", "Lending"]}},
        "required": [],
    },
    "get_skills": {"type": "object", "properties": {}, "required": []},
    "get_achievements": {"type": "object", "properties": {}, "required": []},
    "get_education": {"type": "object", "properties": {}, "required": []},
    "get_contact": {"type": "object", "properties": {}, "required": []},
    "set_theme": {
        "type": "object",
        "properties": {"theme": {"type": "string", "enum": ["green", "purple", "blue"]}},
        "required": ["theme"],
    },
    "set_muted": {
        "type": "object",
        "properties": {"sound": {"type": "string", "enum": ["on", "off"]}},
        "required": ["sound"],
    },
    "open_section": {
        "type": "object",
        "properties": {"section": {"type": "string", "enum": ["identity", "experience", "skills", "projects", "achievements", "contact"]}},
        "required": ["section"],
    },
    "toggle_recruiter": {"type": "object", "properties": {}, "required": []},
}


def ex(query, name, args=None, reasoning=""):
    return {
        "query": query,
        "tools": [{"name": name, "parameters": TOOLS[name]}],
        "answers": [{"name": name, "arguments": args or {}}],
        "reasoning": reasoning,
    }


EXAMPLES = [
    # ---- identity / profile ------------------------------------------------
    ex("who is shagil?", "get_profile", reasoning="'who is' -> get_profile"),
    ex("tell me about him", "get_profile", reasoning="'tell me about' -> get_profile"),
    ex("introduce the developer", "get_profile", reasoning="'introduce' -> get_profile"),
    ex("what is his current role?", "get_profile", reasoning="'current role' -> get_profile"),
    ex("how many years of experience does he have?", "get_profile", reasoning="'years of experience' -> get_profile"),
    ex("is he a full stack developer?", "get_profile", reasoning="'full stack' -> get_profile"),
    # ---- experience --------------------------------------------------------
    ex("what did he do at finbox?", "get_experience", {"company": "Finbox"}, "'what did he do' + employer -> get_experience; finbox"),
    ex("his role at yahoo", "get_experience", {"company": "Yahoo"}, "'role' + employer -> get_experience; yahoo"),
    ex("what did he build at fincity?", "get_experience", {"company": "Fincity"}, "'what did he build' + employer -> get_experience; fincity"),
    ex("where has he worked?", "get_experience", reasoning="'where has he worked' -> get_experience; no company -> omit"),
    ex("show his work history", "get_experience", reasoning="'work history' -> get_experience; no company -> omit"),
    ex("what was his job at yahoo?", "get_experience", {"company": "Yahoo"}, "'job at' + employer -> get_experience; yahoo"),
    ex("tell me about his finbox work", "get_experience", {"company": "Finbox"}, "'finbox work' -> get_experience; finbox"),
    ex("did he work at fincity?", "get_experience", {"company": "Fincity"}, "'work at' + employer -> get_experience; fincity"),
    ex("what did he do before yahoo?", "get_experience", reasoning="'before yahoo' -> get_experience; no company -> omit (all roles)"),
    # ---- projects -----------------------------------------------------------
    ex("show me his projects", "get_projects", reasoning="'show me his projects' -> get_projects; no category -> omit"),
    ex("what has he built?", "get_projects", reasoning="'what has he built' -> get_projects"),
    ex("his finance projects", "get_projects", {"category": "Finance"}, "'finance' -> get_projects; category Finance"),
    ex("what saas products has he shipped?", "get_projects", {"category": "SaaS"}, "'saas' -> get_projects; category SaaS"),
    ex("cms modules he built", "get_projects", {"category": "CMS"}, "'cms' -> get_projects; category CMS"),
    ex("lending platform work", "get_projects", {"category": "Lending"}, "'lending' -> get_projects; category Lending"),
    ex("what did he build at yahoo?", "get_projects", {"category": "Finance"}, "'what did he build at yahoo' -> get_projects; yahoo finance -> category Finance"),
    ex("my money platform details", "get_projects", {"category": "Finance"}, "'my money' -> get_projects; finance"),
    # ---- skills -------------------------------------------------------------
    ex("what tech does he know?", "get_skills", reasoning="'what tech' -> get_skills"),
    ex("his tech stack", "get_skills", reasoning="'tech stack' -> get_skills"),
    ex("does he know react?", "get_skills", reasoning="'does he know' + language -> get_skills; tool data answers"),
    ex("is he good at frontend?", "get_skills", reasoning="'good at' + area -> get_skills"),
    ex("does he know java?", "get_skills", reasoning="'does he know' + language -> get_skills"),
    ex("what languages does he use?", "get_skills", reasoning="'languages' -> get_skills"),
    # ---- achievements -------------------------------------------------------
    ex("what impact did he have?", "get_achievements", reasoning="'impact' -> get_achievements"),
    ex("his achievements", "get_achievements", reasoning="'achievements' -> get_achievements"),
    ex("what results did he deliver?", "get_achievements", reasoning="'results' -> get_achievements"),
    ex("any numbers on his work?", "get_achievements", reasoning="'numbers' -> get_achievements"),
    ex("how many accounts supports the platform?", "get_achievements", reasoning="'accounts' -> get_achievements"),
    # ---- education ----------------------------------------------------------
    ex("where did he study?", "get_education", reasoning="'where did he study' -> get_education"),
    ex("his college", "get_education", reasoning="'college' -> get_education"),
    ex("what degree does he have?", "get_education", reasoning="'degree' -> get_education"),
    # ---- contact -------------------------------------------------------------
    ex("how can I contact him?", "get_contact", reasoning="'how can I contact' -> get_contact"),
    ex("his email", "get_contact", reasoning="'his email' -> get_contact"),
    ex("how do I reach him?", "get_contact", reasoning="'how do I reach' -> get_contact"),
    ex("linkedin profile", "get_contact", reasoning="'linkedin' -> get_contact"),
    ex("download his resume", "get_contact", reasoning="'resume' -> get_contact"),
    # ---- actions: theme ------------------------------------------------------
    ex("make it purple", "set_theme", {"theme": "purple"}, "'make it' -> set_theme; purple"),
    ex("change the color to blue", "set_theme", {"theme": "blue"}, "'change the color' -> set_theme; blue"),
    ex("switch to the green theme", "set_theme", {"theme": "green"}, "'switch to theme' -> set_theme; green"),
    ex("use the purple theme", "set_theme", {"theme": "purple"}, "'purple theme' -> set_theme; purple"),
    ex("can you make the site blue?", "set_theme", {"theme": "blue"}, "'make the site blue' -> set_theme; blue"),
    # ---- actions: sound ------------------------------------------------------
    ex("mute the sounds", "set_muted", {"sound": "off"}, "'mute' -> set_muted; off"),
    ex("turn the sound on", "set_muted", {"sound": "on"}, "'turn the sound on' -> set_muted; on"),
    ex("can you make the site silent?", "set_muted", {"sound": "off"}, "'silent' -> set_muted; off"),
    ex("unmute please", "set_muted", {"sound": "on"}, "'unmute' -> set_muted; on"),
    # ---- actions: navigation -------------------------------------------------
    ex("open the projects section", "open_section", {"section": "projects"}, "'open section' -> open_section; projects"),
    ex("go to the experience section", "open_section", {"section": "experience"}, "'go to' -> open_section; experience"),
    ex("take me to contact", "open_section", {"section": "contact"}, "'take me to' -> open_section; contact"),
    ex("jump to the skills section", "open_section", {"section": "skills"}, "'jump to' -> open_section; skills"),
    # ---- actions: recruiter --------------------------------------------------
    ex("recruiter mode", "toggle_recruiter", reasoning="'recruiter mode' -> toggle_recruiter"),
    ex("show me the simple resume view", "toggle_recruiter", reasoning="'simple resume view' -> toggle_recruiter"),
    ex("back to the terminal", "toggle_recruiter", reasoning="'back to the terminal' -> toggle_recruiter"),
]

with open("finetune/data.jsonl", "w") as f:
    for e in EXAMPLES:
        f.write(json.dumps(e) + "\n")

print(f"wrote {len(EXAMPLES)} examples to finetune/data.jsonl")
