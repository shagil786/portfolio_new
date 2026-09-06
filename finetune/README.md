# Fine-tuning MSN AI's routing model (Needle 2)

The on-device chat runs the base Needle 2 weights (`public/needle/needle2.cact`).
Routing quality improves with a LoRA fine-tune on portfolio-specific Q&A. This
directory ships the dataset; training runs locally on your machine.

## Dataset

`data.jsonl` — 30 hand-written examples in Needle's training format, covering
both the read tools (profile, experience, projects, skills, achievements,
education, contact) and the action tools (set_theme, set_muted, open_section,
toggle_recruiter). Tool schemas here must stay in sync with
`src/lib/agentTools.ts` (single source of truth for the shipped registry).

To expand the dataset without an API key, add more lines by hand. To
synthesize more with an LLM:

```sh
export OPENROUTER_API_KEY=sk-or-...
needle generate-data --tools src/lib/agentTools.ts --num-samples 500 --output finetune/data.jsonl
needle generate-data --augment finetune/data.jsonl --num-samples 500
```

(`--tools` needs the schemas as JSON; export them from the site MCP server's
`tools/list` or paste `AGENT_TOOL_SCHEMAS`.)

## Train

```sh
pip install "cactus-needle[train]"
needle finetune finetune/data.jsonl --epochs 10
```

This produces a tuned `.cact` archive.

## Deploy

Drop the tuned archive at `public/needle/tuned.cact` and deploy. The worker
prefers `tuned.cact` and falls back to the base `needle2.cact` when absent.

## Caveat (important)

Fine-tuning does **not** update Needle's learned confidence head, so tuned
weights report uncalibrated confidence scores. The pipeline already handles
this: `interpretNeedleResponse` treats a missing/None confidence as
pass-through and still validates every tool call through governance before
execution. Expect somewhat more fallbacks until you re-balance
`BASE_POLICY.confidenceFloor` based on the outcome stats.

## Verification

After deploying a tuned model, exercise both tool families in the browser:

- data questions: "what did he do at finbox?" → `get_experience`
- action questions: "make it purple" → `set_theme(theme="purple")`
