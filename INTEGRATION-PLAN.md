# gstack Integration Plan for Brandon's Projects

## Overview

gstack contains 23+ skills organized around a full software development lifecycle. Not all are relevant to Brandon's workflow -- some overlap with existing systems, some target web-only workflows, and some fill genuine gaps. This plan maps each skill against three active Claude Code projects and recommends a phased adoption.

**Brandon's existing workflow:**
- Claude Cowork = architecture (sole authority on trading bot; shared with Computer on VesselWise/Field Ops)
- Claude Code = implementation
- Computer (Perplexity) = strategy research, spec writing, code review, oversight

**Key constraint:** gstack must complement this split, not override it. Cowork's architecture authority is non-negotiable.

---

## Skill-by-Project Matrix

### HIGH VALUE -- Adopt First

| Skill | ORB Trading Bot | VesselWise OS | WOSA Field Ops | Why |
|---|---|---|---|---|
| `/review` | HIGH | HIGH | HIGH | Pre-PR code review with specialist agents (security, performance, data migration). Catches issues Claude Code misses because it wrote the code. Works on any codebase. |
| `/investigate` | HIGH | MEDIUM | MEDIUM | Root-cause debugging with mandatory "no fix without root cause" rule. The stop-loss bug (0.1x vs 1x ATR) is exactly the kind of issue this catches systematically. Auto-freezes edits outside debug scope. |
| `/careful` | HIGH | LOW | LOW | Destructive command guardrails. Critical for the trading bot as you approach IB integration -- protects against accidental `git push --force`, `DROP TABLE`, `rm -rf` on trade logs. |
| `/cso` | HIGH | HIGH | HIGH | Security audit covering secrets in git history, dependency supply chain, CI/CD pipeline security. Your repos have API keys (Polygon, IB), Supabase credentials, and Asana tokens. Run monthly. |
| `/ship` | MEDIUM | HIGH | HIGH | Automated PR creation with tests, review, changelog. VesselWise and Field Ops have more frequent shipping cycles than the bot. |
| `/context-save` / `/context-restore` | HIGH | HIGH | HIGH | Session continuity. You work across multiple threads and often return to projects after days. This captures decisions and next steps so Claude Code doesn't start cold. |

### MEDIUM VALUE -- Adopt After First Batch

| Skill | ORB Trading Bot | VesselWise OS | WOSA Field Ops | Why |
|---|---|---|---|---|
| `/plan-eng-review` | MEDIUM | HIGH | HIGH | Engineering architecture review. For the trading bot, Cowork already fills this role. For VesselWise and Field Ops, this adds a structured adversarial review layer that Computer's spec-writing doesn't currently provide. |
| `/plan-ceo-review` | LOW | HIGH | MEDIUM | Product/scope challenge. Not relevant for a trading bot (scope is fixed by the ORB strategy). Very relevant for VesselWise where you're making product decisions about tenant models, feature scope, and dashboard design. |
| `/qa` + `/qa-only` | N/A | HIGH | HIGH | Browser-based QA testing on live app. Irrelevant for the bot (no web UI). Game-changing for VesselWise (Lovable frontend) and Field Ops (React web admin). `/qa` fixes bugs; `/qa-only` reports without touching code. |
| `/design-review` | N/A | HIGH | MEDIUM | Live design audit with letter grades and automatic fixes. VesselWise is a client-facing dashboard -- design quality matters. Field Ops is internal but still benefits from consistency checks. |
| `/retro` | MEDIUM | MEDIUM | MEDIUM | Weekly retrospective from git history. Useful for tracking velocity across all three projects. Less critical than the review/safety skills. |
| `/freeze` / `/guard` | HIGH | MEDIUM | MEDIUM | Edit-scope locking. On the trading bot, freeze Claude Code to only the module being worked on. Prevents accidental changes to the backtesting engine while fixing the execution engine, for example. |
| `/learn` | MEDIUM | MEDIUM | MEDIUM | Manages operational learnings across sessions. Builds institutional knowledge about each project's quirks. Value compounds over time. |

### LOW VALUE or N/A -- Skip or Defer

| Skill | Reason |
|---|---|
| `/office-hours` | Product discovery. Your projects are past the "what should I build?" phase. Useful if you start a new project from scratch. |
| `/plan-design-review` | AI mockup generation for UI planning. Only relevant if you start doing greenfield UI design in Claude Code (VesselWise uses Lovable). |
| `/design-consultation` | Builds DESIGN.md from scratch. Your projects already have established design systems (WOSA branding, VesselWise branding skills). |
| `/design-shotgun` | Visual brainstorming with AI variants. Same as above -- your design direction is established. |
| `/design-html` | HTML generation using Pretext engine. Not relevant to your React/React Native stack. |
| `/plan-devex-review` / `/devex-review` | Developer experience audit. Relevant only if you're building public APIs or SDKs. None of your current projects are developer-facing tools. |
| `/codex` | Requires OpenAI Codex CLI. You're not currently using OpenAI tools in your workflow. Nice-to-have for cross-model review but not essential. |
| `/autoplan` | Runs CEO + Design + Eng + DX reviews automatically. Overkill for your workflow where Cowork already owns architecture. |
| `/benchmark` | Web performance metrics. Only relevant for VesselWise once it's deployed and receiving traffic. |
| `/canary` | Post-deploy monitoring. Same -- relevant later when VesselWise is live. |
| `/land-and-deploy` | Merge + deploy + verify. Relevant when you have CI/CD pipelines set up. Defer until VesselWise moves to Vercel. |
| `/document-release` | Post-ship doc sync. Low priority -- your documentation is managed through skills and specs, not README-style docs. |
| `/setup-deploy` | One-time deploy config. Defer until CI/CD is set up. |
| `/setup-browser-cookies` | Cookie import for authenticated testing. Defer until `/qa` is actively used. |
| `/browse` | Standalone browser skill. The browser is a dependency of other skills, not something you'd invoke directly. |
| `/pair-agent` | Multi-agent browser sharing. Not relevant to your single-developer workflow. |
| `/plan-tune` | Preference profile. v1 doesn't actually modify behavior -- purely tracking. Wait for v2. |

---

## Recommended Adoption Phases

### Phase 1: Safety and Review (Install This Week)

**Install gstack into Claude Code** on all three project repos. Then immediately start using:

1. **`/careful`** -- Activate at session start on the trading bot. Zero effort, immediate protection.
2. **`/review`** -- Run on every branch before merging. This replaces ad-hoc "look at the diff" reviews.
3. **`/cso`** -- Run once on each repo (comprehensive mode) to establish a security baseline. Then monthly.
4. **`/context-save`** -- Run at the end of every Claude Code session. Run `/context-restore` at the start of the next one.

**Estimated time to integrate:** 30 minutes (install + first run of each).

### Phase 2: Debugging and Scope Control (Week 2)

5. **`/investigate`** -- Use next time you hit a bug in any project. The "Iron Law" methodology will change how Claude Code approaches debugging.
6. **`/freeze`** -- Use when working on isolated modules (e.g., freeze to `src/execution/` while fixing the execution engine on the trading bot).
7. **`/learn`** -- Start accumulating project learnings. Review after 2-3 weeks.

### Phase 3: Web Project Workflow (When VesselWise/Field Ops Have Running Apps)

8. **`/qa-only`** -- First QA run on VesselWise staging URL. Report-only to see what it catches.
9. **`/qa`** -- Once comfortable with the reports, let it fix issues too.
10. **`/design-review`** -- Run on VesselWise after `/qa` is working. Design quality matters for client-facing.
11. **`/ship`** -- Adopt for VesselWise and Field Ops when shipping cadence increases.

### Phase 4: Planning Layer (If/When Needed)

12. **`/plan-eng-review`** -- Run on VesselWise specs before Claude Code implements. Adds adversarial architecture review.
13. **`/plan-ceo-review`** -- Use when making major scope decisions on VesselWise (e.g., new tenant tier, new feature area).
14. **`/retro`** -- Weekly retrospective across all projects.

---

## Integration with Existing Workflow

### What Changes

| Current | With gstack |
|---|---|
| Claude Code reviews its own work | `/review` provides independent specialist review before PR |
| Debugging is ad-hoc | `/investigate` enforces root-cause-first methodology |
| No guardrails on destructive commands | `/careful` intercepts dangerous bash commands |
| Security reviewed manually (or not at all) | `/cso` runs systematic OWASP + STRIDE audits |
| Sessions start cold after breaks | `/context-save` + `/context-restore` provides continuity |
| No QA testing on web apps | `/qa` opens a real browser and tests VesselWise/Field Ops |

### What Does NOT Change

- **Cowork remains the sole architecture authority** on the trading bot. `/plan-eng-review` is optional and would only be used on VesselWise/Field Ops where Computer currently writes specs.
- **Computer remains the strategy/research layer.** gstack doesn't touch Perplexity Computer's role.
- **Your custom skills (WOSA branding, VesselWise formatting, report reviews) are unaffected.** gstack lives in Claude Code; your skills live in Perplexity Computer. No overlap.
- **The GitHub-based async workflow** (Computer pushes specs, Brandon approves, Claude Code implements) stays intact. gstack adds review/QA after implementation, not during.

---

## How to Install

In each Claude Code session for your projects, paste:

```
Install gstack: run git clone --single-branch --depth 1 https://github.com/MonacAI/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup
```

This clones from YOUR fork (not Garry's), so you control updates. To pull upstream changes later: `cd ~/.claude/skills/gstack && git pull origin main`.

For team mode (auto-updates at session start): run `./setup --team` from inside each repo.

---

## Risk Assessment

| Risk | Mitigation |
|---|---|
| gstack skills override Cowork's architecture authority | The plan explicitly excludes `/autoplan` and limits `/plan-eng-review` to VesselWise/Field Ops only. Trading bot architecture stays with Cowork. |
| gstack updates break something | You're running from YOUR fork. You control when to pull upstream changes. |
| Browser-based skills fail on headless VPS | Only relevant for `/qa`, `/design-review`, `/benchmark`, `/canary`. These run on your local machine, not the Hetzner VPS. The trading bot on VPS doesn't use browser skills. |
| Learning curve overwhelms | Phased adoption. Phase 1 is four skills, 30 minutes to set up. Don't try everything at once. |
| Skills conflict with existing CLAUDE.md instructions | gstack adds a "gstack" section to CLAUDE.md. Review it after setup to ensure it doesn't conflict with any existing Claude Code instructions you've set. |
