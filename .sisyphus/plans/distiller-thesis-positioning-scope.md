# Distiller — Product Thesis, Positioning & Scope Alignment

## TL;DR

> **Quick Summary**: Align Distiller's repository, public copy, product principles, scope boundaries, personas, and feature prioritization around evidence-first personalized story intelligence. Refactor (not rebuild) existing shipped infrastructure; remove the paywall-bypass-adjacent full-text extraction feature; eliminate unsupported claims (fake testimonials, invented Distiller Score branding); consolidate entitlements to a single source of truth; and apply a full design-taste-frontend audit with token + composition fixes at 360/768/1280/1536 px in both light and dark modes. Wave 5 is a Ponytail cleanup pass.
>
> **Deliverables**:
> - Product requirements delta (PR delta): written into the wave-2 copy constants + per-page copy changes
> - Copy map: `lib/copy.ts` (shared evidence-first strings) consumed by ~23 pages
> - Scope boundaries: explicit Must NOT Have guardrails per task + global
> - Personas/JTBD: informed-citizen primary + knowledge-worker/MENA secondary encoded in taxonomy & defaults
> - Measurable success criteria: per-task agent-executed QA scenarios + global grep checks
> - Backlog changes: full-text extraction removed; Distiller Score removed/relabelled; entitlement single source; design bugs fixed; 2xl: responsive treatment added; Ponytail simplifications
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 4 implementation waves + Final verification + Ponytail
> **Critical Path**: Task 3 (lib/plans.ts extension) → Task 12 (PricingSection refactor) → Task 17 (entitlement consolidation closure) → F1

---

## Context

### Original Request
Align the Distiller Next.js 15 App Router repository, public copy, product principles, non-goals, personas, and feature prioritization around evidence-first personalized story intelligence. Required outputs: PR delta, copy map, scope boundaries, personas/JTBD, measurable success criteria, backlog changes, and a full design-taste-frontend audit with token/typography/composition changes. A downstream Ponytail cleanup wave applies after correctness is proven.

### Interview Summary
**Key Discussions**:
- Stack orientation: audit + refactor existing shipped infra; do NOT rebuild. NIM adapter deferred as known tech debt.
- Testimonials (Sarah K., Mehdi O., Julien L.): INVENTED. Remove entirely + replace with evidence-grounded element.
- Full-text extraction (`/api/news/full-text`): REMOVE entirely. Tightest read of the "don't reproduce substantial publisher text" invariant.
- Positioning: lead with "evidence-first / source-grounded / every claim linked". "Three bullets" becomes supporting detail.
- Primary persona: informed citizen (generalist). Secondary: knowledge worker, MENA professional.
- Entitlements: ONE source in `lib/plans.ts`; delete parallel in-memory feed guest gate; render UI tiers from lib/plans.ts.
- Design work scope: FULL — audit + token/composition changes at 4 widths × 2 modes.
- Distiller Score: nascent — relabel honestly, remove the brand name, document actual formula in tooltip.
- Tests: none — agent-executed QA scenarios only.
- 1536px (2xl:): YES — explicit treatment added.

**Research Findings** (from 3 explore agents + Metis):
- Architecture: AGENTS.md is severely outdated. Repo ships Neon Postgres + Drizzle (12 tables), better-auth, Stripe, 4-tier `lib/plans.ts`, full dashboard, bookmarks, alerts, history, onboarding, 23 API endpoints. Only aspirational piece is NIM provider adapter.
- Copy: ~23 files contain copy. The phrase "Stay informed in seconds..." is duplicated 11× with no shared constant. "Distiller Score" is mentioned by a fake testimonial but the field `distillerScore` is dead code (only demo data). The real field is `confidence` (RAG retrieval metric).
- Paywall-bypass vector located: `/api/news/full-text` POST extracts full article text via Readability + jina.ai. About & Terms don't disclose it. Metis surfaced that `services/newsapi.ts` ALSO calls `fetchFullArticleText` server-side on every fetched article to expand truncated NewsAPI content (separate from client modal).
- Design: Tailwind v4 (not v3 per AGENTS.md). Both light + dark already exist via custom ThemeProvider (not next-themes). Fonts are Crimson Pro + DM Sans + IBM Plex Mono (NOT Space Grotesk per AGENTS.md). 15 design bugs identified including undefined `shadow-soft`/`shadow-elevated`, hardcoded `bg-white/85` breaking dark mode, `ring-zinc-300` hardcoded in button, AskTheNewsForm missing label association, next/image unused despite 55 remotePatterns, font loading via CSS `@import` (no next/font perf), `ToastContainer_root__` dead class.
- Entitlements: SIX independent sources of truth — lib/plans.ts (canonical but underutilized), app/api/feed/route.ts:14-115 (in-memory guest gate, 50/day, world+tech), app/RefinedFeed/page.tsx (client-side 50/month), PricingSection.tsx (hardcoded tiers, doesn't import lib/plans.ts, says "15 topics" for free but PLAN_LIMITS says 2), dashboard/billing/page.tsx (hardcoded plan list), app/page.tsx (Free vs Pro hardcoded). Guest=50/day vs Free=50/month creates a signup disincentive.
- Stripe checkout (`app/api/stripe/checkout/route.ts`) reads `priceId: process.env.STRIPE_PRO_PRICE_ID ?? ""` etc. into route props BUT computes the actual charge via `unit_amount: planConfig.price * 100` (line ~95) instead of using the retrieved Stripe Price object. So the env vars are referenced but their Price IDs are not authoritative. Task 12 wires checkout to use `stripe.prices.retrieve(planLimit.stripePriceId)` for the line item.

### Metis Review
**Identified Gaps** (addressed):
- Guest-limit 50/day vs 50/month is a 30× pricing change that requires user confirmation → **Default applied**: this plan consolidates the implementation into `lib/plans.ts` but preserves the current 50/day guest behavior (no policy change). Aligning guest=free is documented as a separate pricing decision outside this plan's scope.
- Server-side article enrichment (`services/newsapi.ts` calls `fetchFullArticleText`) is a SEPARATE consumer from the client modal → addressed by Task 14 in Wave 3 (small local text builder replacement).
- PricingSection needs display metadata (tagline, CTAs, features[], periodAnnual, publiclyVisible, stripePriceId) added to lib/plans.ts first → addressed by Task 3 (Wave 1) before Task 12 (Wave 2) consumes it.
- Stripe checkout hardcodes unit_amount instead of using Price IDs → folded into Task 3 as part of the lib/plans.ts extension (stripePriceId fields populated from existing env vars).
- Terms/Privacy legal copy changes need careful wording → explicitly flagged in Task 10's guardrails; not auto-accepting.

---

## Work Objectives

### Core Objective
Make every user-observable byte of Distiller (copy, keywords, UI, entitlement UI, error messages, RSS) consistently read "evidence-first personalized story intelligence," with no invented metrics/testimonials/publisher-text-reproduction; and fix the 15 catalogued design bugs while adding explicit 2xl: (1536 px) treatment at 360/768/1280/1536 px in both light and dark modes.

### Concrete Deliverables
- `lib/copy.ts` — single source of evidence-first copy constants (shared strings consumed by ~23 files).
- `lib/plans.ts` — extended with: display metadata (tagline, cta, ctaHref, features[], periodAnnual, highlight, publiclyVisible), `guestLimits` block (preserving 50/day, world+tech), and `stripePriceId` per tier (populated from existing env vars).
- Removed: `/api/news/full-text` route, `/lib/article-text.ts`, `/lib/article-text-utils.ts`, `@mozilla/readability` + `happy-dom` deps, full-text UI in `NewsArticleModal.tsx`, `distillerScore` field in types + demo + DistilledCard, the 3 fake testimonials.
- Replaced: testimonials section → "How Distiller grounds every brief" evidence-grounded element.
- Relabeled: `Distiller Score` brand naming removed; `confidence` numeric readout honestly labelled "RAG retrieval confidence" with tooltip documenting the real formula.
- Refactored: `PricingSection.tsx`, `dashboard/billing/page.tsx`, `landing Free vs Pro comparison` to read from `lib/plans.ts`.
- Refactored: `app/api/feed/route.ts:14-115` guest gate → calls `lib/plans.ts` (deleted parallel in-memory logic; behavior preserved).
- Fixed: 15 design bugs (token definitions, hardcoded colors, focus rings, label associations, font loading, dead classes, next/image OR remotePatterns cleanup).
- Added: 2xl: (1536 px) responsive compositions across feed (≥3 cols), dashboard sidebar, hero scale, container max-width to `max-w-[1440px]`.
- Ponytail wave: ranked deletion/simplification diff against the completed work.

### Definition of Done
- [ ] `npm run build` passes with zero TypeScript errors
- [ ] `npm run lint` passes with zero errors
- [ ] `grep -ri "Distiller Score" app/ components/ lib/` returns 0 matches
- [ ] `grep -ri "fetchFullArticleText\|buildLocalArticleText\|stripNewsApiTruncation" app/ lib/ components/ types/` returns 0 matches
- [ ] `grep -ri "@mozilla/readability\|happy-dom" package.json` returns 0 matches
- [ ] `ast_grep_search` for hardcoded `50` in `app/api/feed/route.ts` outside `lib/plans.ts` imports returns 0 matches
- [ ] `ast_grep_search` for hardcoded `articlesPerMonth`/`articlesPerDay` values outside `lib/plans.ts` returns 0 matches
- [ ] Playwright screenshots captured at 4 widths × 2 modes for landing, /RefinedFeed, /article sample, /pricing, /dashboard, /about
- [ ] No testimonials mentioning Sarah K. / Mehdi O. / Julien L. anywhere in the codebase
- [ ] Evidence-first lead appears in hero, metadata description, RSS description, /about first paragraph, /RefinedFeed hero

### Must Have
- Evidence-first "every claim linked" / "source-grounded" language as the lead value prop across all user-visible copy vectors
- Removal of all testimonial framing
- Removal of all full-text extraction (server-side enrichment + client-side modal UI + supporting libs)
- Single source of truth for entitlements in `lib/plans.ts`
- All 15 design bugs fixed
- 2xl: (1536 px) explicit composition
- Honest relabeling of the numeric "score" on the article card
- Agent-executed QA on EVERY task

### Must NOT Have (Guardrails)
- Rebuilding any existing auth/db/Stripe/dashboard code (audit & refactor only)
- NIM provider-adapter pattern introduction (deferred)
- Unit-test infrastructure setup (Jest/Vitest/Playwright test suites)
- Changing guest limit from 50/day → 50/month (pricing change, requires separate confirmation)
- Implementing authenticated-user plan-based route gating
- Building a new article enrichment pipeline replacement for full-text extraction
- Building a "Distiller Score breakdown" UI component
- Touching legal copy in Terms/Privacy without explicit flagging for review
- Introducing new product claims about features that don't exist ("AI verifies," "AI understands," "cross-reference verification")
- Removing `userArticleUsage` table or its data (preserve for rollback safety; leave dormant)
- Modifying auth, password hashing, or session handling
- Weakening authorization, validation, safe-error responses, accessibility, evidence provenance, migrations, idempotency, observability, useful tests, or rollback
- Hardcoding payment amounts in the checkout route (must use lib/plans.ts `stripePriceId`)
- Adding purple/glassmorphism/glow effects to "feel" more editorial
- Spreading testimonial claims / Distiller Score claims into new places

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.
> Acceptance criteria requiring "user manually tests/confirms" are FORBIDDEN.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None (per Ahmed's decision)
- **Framework**: none
- Agent QA scenarios carry all regression safety.

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot at 360/768/1280/1536 px × light/dark
- **API/Backend**: Use Bash (curl) — Send requests, assert status + JSON fields
- **Library/Module**: Use Bash (bun/node REPL or `node -e`) — Import, call functions, compare output
- **Build**: `npm run build` + `npm run lint` — must pass with zero errors

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — additive only, safe, parallelizable):
├── Task 1:  Visual audit baseline capture (Playwright at 4×2) [unspecified-high]
├── Task 2:  Shared lib/copy.ts evidence-first constants [quick]
├── Task 3:  Extend lib/plans.ts with display metadata + guest + stripePriceId [deep]
├── Task 4:  Distiller Score computation audit (document real formula) [quick]
├── Task 5:  Full-text consumer audit (verify no external use beyond NewsArticleModal) [quick]
├── Task 6:  Design token bug fixes (shadow-soft/elevated definitions, bg-white/75, button ring-zinc, ToastContainer_root__) [quick]
└── Task 7:  Font loading via next/font/google (Crimson Pro + DM Sans) [quick]

Wave 2 (Additive copy/UI — after Wave 1):
├── Task 8:  Landing page rewrite + remove testimonials + evidence-grounded replacement element [visual-engineering]
├── Task 9:  /RefinedFeed page copy (hero, filters, demo banner, guest overlay) [visual-engineering]
├── Task 10: /about, /terms, /privacy, /mena, /brief/[slug] copy rewrite [writing]
├── Task 11: Metadata + RSS description + OG image text rewrite [quick]
├── Task 12: PricingSection + dashboard/billing + landing Free vs Pro all read from lib/plans.ts [deep]
└── Task 13: Dashboard overview/billing/card usages of plan values unified to lib/plans.ts [unspecified-high]

Wave 3 (Destructive removal — after Wave 2 has safe replacements laid down):
├── Task 14: Patch services/newsapi.ts to drop fetchFullArticleText call (local text builder) [deep]
├── Task 15: Delete /api/news/full-text route + lib/article-text.ts + lib/article-text-utils.ts + unregister @mozilla/readability + happy-dom [unspecified-high]
├── Task 16: Strip "See more article text" / "Full article text" UI from NewsArticleModal.tsx [visual-engineering]
└── Task 17: Remove distillerScore field + relabel confidence honestly with tooltip [unspecified-high]

Wave 4 (Consolidation + responsive — after Wave 3):
├── Task 18: Consolidate guest feed gate from app/api/feed/route.ts:14-115 into lib/plans.ts (preserve 50/day) [deep]
├── Task 19: Add 2xl: (1536 px) responsive compositions + max-width strategy [visual-engineering]
└── Task 20: A11y cleanup: AskTheNewsForm label/id; next/image adoption OR remotePatterns removal; light-mode focus-ring token audit [visual-engineering]

Wave FINAL (4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA at 4×2 viewports (unspecified-high + playwright)
└── Task F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay

Wave PONYTAIL (after user okay — simplification pass):
└── Task P1: Ponytail-ranked deletion/simplification diff review + (optional) smallest safe patch [deep]

Critical Path: Task 3 → Task 12 → Task 18 → F1
Parallel Speedup: ~75% faster than sequential
Max Concurrent: 7 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks | Notes |
|------|------------|--------|-------|
| 1 | — | 6 (before tokens), F3 | Baseline capture |
| 2 | — | 8, 9, 10, 11 | Copy foundation |
| 3 | — | 12, 13, 18 | Entitlements foundation |
| 4 | — | 17 | Distiller Score audit |
| 5 | — | 14, 15, 16 | Pre-deletion audit |
| 6 | — | F1, F3 | Design bug fixes (independent of copy) |
| 7 | — | F2, F3 | Font perf fix |
| 8 | 2, 3 | F1, F3, F4 | Needs copy constants + lib/plans display metadata |
| 9 | 2 | F1, F3 | Needs copy constants |
| 10 | 2, 3 | F1, F3, F4 | Terms/Privacy legal-copy flag |
| 11 | 2 | F1 | SEO strings |
| 12 | 3 | F1, F4 | PricingSection depends on Task 3 extension |
| 13 | 3 | F1 | Dashboard depends on Task 3 |
| 14 | 5 | 15, F1 | services/newsapi.ts patched first |
| 15 | 14 | F1, F2 | File deletion after patch |
| 16 | — (independent of 14-15) | F3 | UI excision is parallel-safe |
| 17 | 4 | F1, F3 | Score relabel depends on Task 4 audit |
| 18 | 3, 14 | F1, F4 | Feeds route guest gate after newsapi patched |
| 19 | — | F1, F3 | Responsive additive |
| 20 | — | F1, F2 | A11y + image strategy |
| F1-F4 | All impl tasks | — | Final review |
| P1 | F1-F4 pass | — | Ponytail cleanup |

### Agent Dispatch Summary

- **Wave 1**: **7** — T1 → `unspecified-high` (+playwright), T2 → `quick`, T3 → `deep`, T4 → `quick`, T5 → `quick`, T6 → `quick`, T7 → `quick`
- **Wave 2**: **6** — T8 → `visual-engineering` (+frontend-design), T9 → `visual-engineering`, T10 → `writing`, T11 → `quick`, T12 → `deep`, T13 → `unspecified-high`
- **Wave 3**: **4** — T14 → `deep`, T15 → `unspecified-high`, T16 → `visual-engineering`, T17 → `unspecified-high`
- **Wave 4**: **3** — T18 → `deep`, T19 → `visual-engineering`, T20 → `visual-engineering`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high` (+playwright), F4 → `deep`
- **PONYTAIL**: **1** — P1 → `deep` (+ponytail skill)

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization + QA Scenarios.
> A task WITHOUT QA Scenarios is INCOMPLETE. No exceptions.

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan. **Specifically verify**: (a) no `fetchFullArticleText` references remain; (b) no "Distiller Score" string anywhere; (c) `lib/plans.ts` is sole source of entitlement values; (d) zero hardcoded `50` limits outside `lib/plans.ts`; (e) all metadata descriptions lead with evidence-first language; (f) Stripe checkout uses `stripePriceId` from lib/plans.ts not hardcoded unit_amount.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run lint` + `npm run build`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports, dead env-var references. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp). Verify no new dependencies added beyond what Wave 1 required. **Specifically verify**: no orphaned imports after deletion waves, no broken IIFE wrappers, no `/api/news/full-text` references in client fetchers.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA at 4×2 viewports** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task. Capture screenshots at 360/768/1280/1536 px in both light and dark modes for: landing, /RefinedFeed, /article sample, /pricing, /dashboard, /about, /mena, /brief sample, /auth/login, /auth/signup, 404, error. Save to `.sisyphus/evidence/final-qa/`. Verify: no `bg-white` panels in dark mode; focus rings visible in both modes; no layout break at 2xl; AskTheNewsForm has visible label on focus or sr-only with for/id working.
  Output: `Scenarios [N/N pass] | Viewports [40 screenshots captured] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance. Detect cross-task contamination (Task N touching Task M's files). Flag unaccounted changes. **Specifically verify**: Tasks 14-17 only touched their declared file scope; Tasks 8-11 didn't restructure components they don't own; Task 18 didn't add authenticated-user routing (which is explicitly out of scope).
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Ponytail Cleanup Wave (after user okay — simplification review)

> Applies the installed Ponytail skill to the completed diff. Ladder: standard/runtime capability → existing project dependency → small local implementation → new dependency/abstraction only when justified by measured need.

- [x] P1. **Ponytail simplification review of the completed diff** — `deep` + ponytail skill
  Read the full git diff produced by Waves 1-4. Hunt for: unnecessary wrappers, repositories, factories, hooks, contexts, state stores, adapters, or configuration introduced by the work; duplicated server/client state; avoidable client components; repeated queries; N+1 reads; over-fetching; redundant AI calls; new deps replaceable by platform/SQL/simple function; speculative generic code; tests coupled to implementation. **MUST NOT remove or weaken**: authorization, validation, safe errors, accessibility, evidence provenance, migrations, idempotency, observability, useful tests, rollback. Output a ranked deletion/simplification list. Escalate contract/architecture changes back to Prometheus (do not auto-apply contract changes). If a smallest-safe-patch is appropriate (e.g. inline a function used once, drop a wrapper), execute that patch with before/after build + bundle-size notes. Compare before/after: build time, lint output, bundle size, feed latency.
  Output: `Findings [N ranked] | Safe patches applied [N] | Escalations [N] | Build delta [s] | Bundle delta [bytes] | VERDICT`

---

## Commit Strategy

- Commit per task (or per wave if task is small). Pre-commit gate: `npm run lint && npm run build`.
- **Wave 1**: `refactor(plans): add display metadata; refactor(design): define shadow tokens + fix hardcoded colors; perf(fonts): migrate to next/font/google; chore(plans): audit distiller score + full-text consumers`
- **Wave 2**: `refactor(copy): evidence-first copy across 23 files; refactor(pricing): render tiers from lib/plans.ts; feat(landing): replace testimonials with grounding anatomy`
- **Wave 3**: `refactor(newsapi): local text builder replaces fetchFullArticleText; remove(full-text): delete extraction route, lib, deps; remove(news-article-modal): full-text UI; refactor(card): relabel confidence honestly + drop Distiller Score`
- **Wave 4**: `refactor(feed): consolidate guest gate to lib/plans.ts; feat(responsive): add 2xl breakpoint; fix(a11y): AskTheNewsForm label + image strategy`
- **Final**: All F1-F4 must APPROVE before merging.

---

## Success Criteria

### Verification Commands
```bash
npm run lint           # Expected: 0 errors
npm run build          # Expected: 0 TypeScript errors, build success
# No testimonial names anywhere
grep -ri "Sarah K\.\|Mehdi O\.\|Julien L\." app/ components/ lib/  # Expected: 0 matches
# No Distiller Score branding
grep -ri "Distiller Score" app/ components/ lib/                       # Expected: 0 matches
# No full-text extraction
grep -ri "fetchFullArticleText\|buildLocalArticleText" app/ lib/      # Expected: 0 matches
grep -i "@mozilla/readability\|happy-dom" package.json                # Expected: 0 matches
# Entitlements single source
ast_grep_search --pattern '50' app/api/feed/route.ts                  # Expected: 0 non-comment matches outside lib/plans.ts imports
# Page build smoke
curl http://localhost:3000/api/feed?country=us\&category=world        # Expected: 200 with articles[].summary.bullets length 3
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] `npm run build` + `npm run lint` pass
- [ ] Evidence dir exists with task screenshots at 4×2 viewports
- [ ] F1-F4 all APPROVE; Ahmed gives explicit okay
- [ ] Ponytail wave executed; documented escalations (if any) filed for separate planning

---

## Decisions and Assumptions

### Decisions Confirmed by Ahmed
1. Audit + refactor existing (no rebuild). NIM adapter deferred to known tech-debt flag.
2. Testimonials invented → remove + replace with evidence-grounded element.
3. Full-text extraction → remove entirely.
4. Positioning → evidence-first lead; "three bullets" becomes supporting detail.
5. Primary persona → informed citizen (generalist).
6. Entitlements → single source in lib/plans.ts + UI parity.
7. Design work → full audit + token/composition changes.
8. Distiller Score → relabel honestly, drop brand name.
9. No unit tests → agent QA only.
10. Explicit 2xl: (1536 px) treatment added.

### Defaults Applied (Metis-surfaced; override if needed)
- **Guest feed gate = 50/day preserved**. Task 18 consolidates the in-memory Map into `lib/plans.ts` `guestLimits` block but preserves current behavior. Aligning guest=free (50/day→50/month) is a separate pricing decision outside this plan's scope.
- **Server-side article enrichment replacement = local text builder**. Task 14 patches `services/newsapi.ts` to build article text from the existing `article.title + article.description + article.content` fields (already NewsAPI-provided) instead of calling `fetchFullArticleText`. No new dep, no external fetch. Standard-library-grade fix. Summaries may be shallower on truncated articles — QA on Wave 3 verifies the regression is acceptable.
- **Stripe checkout `stripePriceId`** added to `lib/plans.ts` Task 3 extension. Task 12 wires the checkout route to use Stripe Price IDs via the env vars already defined (`STRIPE_PRO_PRICE_ID`, `STRIPE_TEAM_PRICE_ID`).
- **Testimonials replacement element** = a static "How Distiller grounds every brief" anatomy diagram on the landing page. No new copy invented — purely describes the real RAG pipeline (chunk → embed → rank → 3 bullets → confidence).
- **Art direction (one sentence)**: "Reading this as an editorial intelligence reader for informed citizens, with a calm editorial language leaning toward Tailwind v4 utilities + Crimson Pro serif headings + DM Sans body + IBM Plex Mono metadata, with restrained motion and information-dense cards."

### Assumptions Needing Validation
- A1: PricingSection.tsx can render from `lib/plans.ts` only after Task 3 extension adds tagline/cta/features/publiclyVisible. → Verified by Metis: hardcoded display metadata would break on bare PLAN_LIMITS import.
- A2: No external API consumer hits `/api/news/full-text`. → Verified by explore audit (only NewsArticleModal.tsx imports it). Production traffic audit is out of scope; if Vercel analytics exist they should be visually inspected by the executing agent as a sanity check.
- A3: Removing `distillerScore` from `DistilledArticle` type only affects demo data. → Verified by audit: `distillerScore` is dead in production code paths; only `demo-articles.ts` carries it.
- A4: NewsArticleModal "See more article text" / "Full article text" UI strip is independent of the route deletion. → Verified by Metis: modal calls `/api/news/full-text` via fetch from `NewsArticleModal.tsx`; deleting the modal UI in Task 16 and the route in Task 15 are parallelizable.
- A5: Books, alerts, history, streak, preferences routes do not depend on full-text. → Verified by Metis edge-case audit: bookmarks table has no full-text fields; cron stub doesn't call it.

---

## ADRs

### ADR-001: Treat existing auth/db/Stripe/dashboard as shipped infrastructure (not greenfield)
**Context**: AGENTS.md is severely outdated; repo ships 12-table Drizzle schema, better-auth, Stripe, 4-tier plans, dashboard with 6 sub-pages. User asked for "audit and refactor" vs "rebuild."
**Decision**: Refactor. Treat as shipped. Don't propose rebuilding any of it. Build only the deltas the workstream requires.
**Consequences**: Faster, lower risk, preserves production behavior. Cost: AGENTS.md stale doc debt — must be updated as part of this plan (separate incidental doc task, not in critical path).

### ADR-002: Remove full-text extraction (the paywall-bypass risk)
**Context**: `/api/news/full-text` POST extracts full article text server-side and serves it to the modal, with usage limits enforced. About & Terms describe "summarization" — not full-text extraction — so the feature is undisclosed.
**Decision**: Remove entirely. Delete route, lib, deps, modal UI, server-side enrichment call. Articles use NewsAPI's truncated content for RAG.
**Alternatives rejected**: (a) Cap to fair-use excerpt — adds measurement & enforcement complexity, still reproduces substantial text, still disclosed as "summarization." (b) Keep disclosure-only — leaves paywall-bypass exposure. (c) Gate behind opt-in — still reproduces publisher text. (d) Cap + disclose — doubles scope for a feature whose value prop (read full text here) conflicts with the product thesis (evidence-first summaries).
**Consequences**: Summaries may be shallower on truncated articles. QA Wave 3 verifies the regression on a 10-article sample. `userArticleUsage` table preserved for rollback safety. Tested in Wave 3 (Task 14 replaces server-side enrichment with local builder; Task 15 deletes extraction files).

### ADR-003: Single source of truth for entitlements = lib/plans.ts
**Context**: SIX sources of entitlement values today (lib/plans.ts canonical-ish, app/api/feed/route.ts in-memory gate, RefinedFeed/page.tsx client-side hardcode, PricingSection.tsx, dashboard/billing, landing). "15 topics" for Free appears in PricingSection but `lib/plans.ts` says 2.
**Decision**: `lib/plans.ts` owns ALL plan definitions, display metadata, Stripe Price IDs, and guest limits. Every consumer reads from it. UI exposes a `publiclyVisible` flag to control which tiers surface in public pricing.
**Consequences**: Single file is now load-bearing. Migration must be additive first (extend lib/plans.ts), then refactor consumers in parallel (Wave 2), then delete the parallel in-memory gate (Wave 4 Task 18) after all consumers are safe.

### ADR-004: Relabel "Distiller Score" → drop the brand; honest tooltip on `confidence`
**Context**: Metis + Momus surfaced that `distillerScore` is dead code (only in demo data) and `confidence` is the real metric. Task 4 audits the actual formula at `lib/ai.ts:503`: `const confidence = Math.min(0.97, baseScore + snippetScore + contextScore);` where `baseScore ≈ 0.65`, `snippetScore` scales with `ragContext.snippets.length`, and `contextScore` accounts for low token estimates. Fake testimonial claims "Distiller Score is genius" — factually wrong.
**Decision**: Remove `distillerScore` field from types + demo + DistilledCard. Keep the `confidence` numeric readout, label it "RAG retrieval confidence", add a tooltip documenting the real formula. No new UI breakdown component (out of scope).
**Consequences**: Fewer claims to support. Honest labeling enables the "evidence-first" positioning.

### ADR-005: Use explicit `publiclyVisible` flag for pricing UI tier surfacing
**Context**: `lib/plans.ts` has 4 tiers (free/pro/team/api). PricingSection shows 3 today. Just hiding "api" silently breaks "single source of truth" because hidden = magic constant in code.
**Decision**: Add `publiclyVisible: boolean` field to each tier. PricingSection filters by `publiclyVisible`. API tier explicitly `publiclyVisible: false` with documented reason ("B2B/dev tier, not consumer-facing").
**Alternatives rejected**: (a) Hardcode tier ids to filter — silent magic. (b) Surface all 4 in public pricing — exposes B2B tier to consumers.
**Consequences**: Code-readable; future tier additions are explicit.

### ADR-006: Add explicit 2xl: (1536 px) treatment, container max-width 1440 px
**Context**: User brief asked for explicit responsive composition at 360/768/1280/1536 px. Existing max-width is inconsistently `max-w-7xl` (1280) or `max-w-5xl`/`max-w-6xl` on different pages.
**Decision**: Standardize container to `max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8` for content shells. Add `2xl:` compositions where editorial density benefits (feed → 3 cols, dashboard wider sidebar, hero scale). 2xl: classes only where they add value, not blanket-applied.
**Consequences**: Widens editorial canvas at high DPI; needs QA at exactly 1536 px to verify.

### ADR-007: Ponytail as Wave 5 downstream cleanup, not collapsed into Wave 1
**Context**: User brief is explicit: Ponytail applies AFTER correctness is proven on the completed PR-delta diff, not during it.
**Decision**: Ponytail is wave P1 — runs after F1-F4 pass and user says okay. Output is a ranked simplification list + optional smallest-safe-patch. Escalates contract/architecture changes back to Prometheus.
**Consequences**: One extra review cycle; guarantees simplification is measured against the actual diff, not hypothetically.

---

## Data/API/UI/Job Contracts

### `lib/plans.ts` (extended shape)
```ts
type PlanId = "free" | "pro" | "team" | "api";

type PlanDisplay = {
  tagline: string;            // "For curious readers"
  cta: string;                // "Get started" | "Start Pro trial"
  ctaHref: string;            // "/auth/signup" | "/auth/signup?plan=pro"
  features: string[];         // ["50 articles/month", "Basic filters", ...]
  highlight?: string;         // "Most popular"
  periodAnnual?: number;      // monthly-equivalent when billed annually
  publiclyVisible: boolean;    // whether tier shows on /pricing
  stripePriceId?: string;     // from env (pro/team); read at module load
};

type GuestLimits = {
  articlesPerDay: number;     // 50 — preserves current behavior (no pricing change)
  allowedTopics: { id: string; label: string }[];
};

type PlanLimit = { /* existing fields */ } & PlanDisplay;

type PLAN_LIMITS = Record<PlanId, PlanLimit> & { guest: GuestLimits };
```

### `lib/copy.ts` (new shared module consumed by ~23 pages)
```ts
export const COPY = {
  brand: { name: "Distiller", tagline: "News Intelligence" },
  hero: {
    eyebrow: "Evidence-first news intelligence",
    headline: "Every claim, linked to the source.",
    subheadline: "Distiller grounds each brief in the original article using RAG and embeddings — three concise bullets, one insight, one conclusion, every claim traceable.",
    ctaPrimary: "Start for free",
    ctaSecondary: "Browse the feed",
  },
  shared: {
    trustNote: "7-day Pro trial included · No credit card required",
    groundDescription: "Every brief is grounded in the original source text using RAG and NVIDIA embeddings.",
    aiDisclosure: "AI-generated summaries are grounded but may contain errors — always verify with the source.",
  },
  // ... per-section copy constants consumed by pages
};
```

### QA contract changes
- `/api/news/full-text` is removed. Clients MUST NOT call it.
- `DistilledArticle` type loses `distillerScore` field; `confidence` retains its name and is documented in code via tooltip helper.
- Stripe `/checkout` route must call `stripe.prices.retrieve(planLimit.stripePriceId)` and pass the Price object, NOT `unit_amount`.

### Schema/Migration Impact
- **No new migrations** in this plan.
- `userArticleUsage` table preserved (dormant) for rollback safety — no migration drops it.
- If `lib/plans.ts` extension changes the shape consumers depend on, the migration is additive in code (no DB migration).

### Security/Privacy
- All entitlement checks stay server-side. `lib/plans.ts` is server-only (`import "server-only"` top of file).
- The `/api/news/full-text` removal strengthens the "don't reproduce substantial publisher text" invariant and removes a potential paywall-bypass vector.
- Stripe checkout env vars (`STRIPE_PRO_PRICE_ID`, `STRIPE_TEAM_PRICE_ID`) are read at module load; secrets handling unchanged.

### Accessibility
- AskTheNewsForm gets a real `<label htmlFor>` association.
- 2xl: treatment must keep `:focus-visible` rings visible in both light and dark mode.
- Color is NOT the sole differentiator for AI/insight/conclusion sections — already distinguished by labeled headings + cyan/violet dot icons; the relabel of `confidence` retains a tooltip for screen readers.
- Reduced motion preserved.

### Observability
- No new observability harness. `@vercel/analytics` + `@vercel/speed-insights` remain.
- Removing `/api/news/full-text` reduces a fetch failure surface in production logs.

### Feature Flag
- No existing feature-flag system per audit. **No new feature-flag infrastructure introduced in this plan.** Tasks ship directly; no regulator-mandated staged rollout requires flags.
- Rollback safety is satisfied by per-wave commits (commits can be `git reverted`).

### Rollback
- Wave 1 commits: revertible individually (additive only).
- Wave 2 commits: revertible per page; copy reverts restore old strings.
- Wave 3 commits: most sensitive — `userArticleUsage` table preserved intact; revert restores `services/newsapi.ts` + `/api/news/full-text` route + modal UI + deleted files (preserved in git history).
- Wave 4 commits: revertible; 2xl classes simply no-op if reverted.

### Failure/Degraded States
- If `services/newsapi.ts` local-builder patch causes RAG quality regression beyond a 20% drop in 3-bullet coverage on the 10-article QA sample → escalate to Prometheus (Task 14 has explicit escalation branch).
- If build breaks due to type errors after removing `distillerScore` from `DistilledArticle` → fix the strip propagation (auto-resolvable).
- If Stripe `stripe.prices.retrieve` fails in `/checkout` because env vars are unset → fallback to existing hardcoded amounts with a `console.warn` log, surfacing the misconfiguration for the next deploy.

### Migration/Backfill Strategy
- No data migration required (no schema changes).
- `userArticleUsage` table intentionally kept dormant — it accumulates no new writes but historical reads remain queryable.

### Operational Runbook Changes
- Update README + AGENTS.md to: (a) reflect Tailwind v4 + Crimson Pro/DM Sans/IBM Plex Mono + light+dark ThemeProvider + shadcn-style primitives; (b) remove `/api/news/full-text` from API surface docs; (c) document `lib/plans.ts` as single source of entitlements; (d) document the 9 env vars missing from `.env.example` (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `STRIPE_PRO_PRICE_ID`, `STRIPE_TEAM_PRICE_ID`, `CRON_SECRET`, `ARTICLE_TEXT_PROXY_BASE`, `GITHUB_REPOSITORY`, `GITHUB_TOKEN`/`GITHUB_API_TOKEN`, `EMAIL_PROVIDER`) → folded into Task 11 (cheapest doc fix; not a critical-path dependency).

---

## Risks and Blockers

| Risk | Severity | Mitigation |
|------|----------|------------|
| RAG quality regression after removing server-side full-text | High | Task 14 uses local text builder; Task 14 QA scenarios include 10-article before/after on bullets-coverage; explicit escalation branch |
| PricingSection refactor breaks rendering if `lib/plans.ts` extension incomplete | Medium | Task 3 (Wave 1) must complete before Task 12 (Wave 2) reads the extended shape; dependency enforced via wave ordering |
| Stripe checkout regression on price IDs not configured in env | Medium | Fallback path with `console.warn` preserves existing amounts; QA scenario tests both paths |
| Legal copy rewrite in Terms/Privacy overclaims or underclaims | Medium | Task 10 guardrail: no claims about features that don't exist; flag for Ahmed's legal review at F1 |
| 2xl: regression breaks 1280 max-width sensitive layouts | Low | 2xl: only added where measured benefit; Task 19 QA verifies 1280 layout still passes |
| Hardcoded `bg-white/85` removal causes hidden regression in subtle states (overlays, modals) | Low | Task 6 maps each occurrence with grep first; replaces with tokenized `bg-background/85` |
| Distiller Score removal leaves gap in copy where it was referenced | Low | Task 4 documents all consumers; Task 17 strips the field + relabels |
| Removing `distillerScore` from DistilledArticle breaks demo data | Low | demo-articles.ts has the field; Task 17 removes from demo too |
| Ponytail wave proposes contract changes requiring user re-planning | Medium | P1 has an explicit "escalate contract/architecture change" branch per the user brief |

---

## TODOs (Detailed Task List)

> Tasks are defined in subsequent sections by wave. Each task includes:
> - Files likely touched, Contracts, Schema/security/privacy/a11y/observability impact, Test level, Feature flag, Rollback, Measurable acceptance criteria, QA scenarios with evidence paths.

---

### WAVE 1 — Foundation (additive only, all parallelizable)

- [x] 1. Visual audit baseline capture (Playwright at 360/768/1280/1536 × light/dark)

  **What to do**:
  - Run Playwright skill against the live `npm run dev` server to capture screenshots of: `/` (landing), `/RefinedFeed`, `/article/sample-id` (use a known demo article), `/pricing`, `/dashboard` (mock-auth needed if gating), `/about`, `/mena`, `/brief/sample-slug` (use a shared brief), `/auth/login`, `/auth/signup`, `/not-found`, `/error`.
  - Capture at four viewports: 360×800 (mobile), 768×1024 (tablet), 1280×800 (desktop), 1536×960 (wide).
  - At each viewport, capture both light and dark modes (toggle via `localStorage.setItem("distiller-theme", "light"|"dark")` then reload).
  - Write findings into `.sisyphus/evidence/baseline-audit.md`: per-page findings for hierarchy, typography density, spacing, color usage, component repetition, interaction states visible at first paint, empty/loading/error states rendered naturally.
  - Mark the 15 known design bugs (from research findings) as: visible-in-screenshot? + estimated user impact.
  - **Must NOT do**: edit any source file. Pure observation task. The screenshots form the "before" baseline.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` — autonomous broad sweep, captures + writes report.
  - **Skills**: [`playwright`]
    - `playwright`: required for multi-viewport navigation + screenshot automation.

  **Parallelization**: Can Run In Parallel — YES. Wave 1 / Group A (with T2-T7). Blocks: Task 6 (verifies baseline), F3 (uses baseline).
  **Blocked By**: None (can start immediately).

  **References**:
  - Pattern References (existing code to follow):
    - `app/page.tsx` — landing composition to capture
    - `app/RefinedFeed/page.tsx:403-763` — feed composition; client component so Playwright must wait for hydration
    - `components/ThemeProvider.tsx` — theme toggle mechanism (sets `.light`/`.dark` on `<html>` + `localStorage` key `distiller-theme`)
  - WHY: confirms "before" state; gating evidence for design-bug verification in later tasks.

  **Acceptance Criteria**:
  - [ ] `.sisyphus/evidence/baseline-audit.md` exists with section per captured page
  - [ ] At least 88 screenshots captured (11 pages × 4 viewports × 2 modes) saved to `.sisyphus/evidence/baseline/page-viewport-mode.png`
  - [ ] "Design bugs visible in baseline" subsection maps each of the 15 listed bugs to ✅visible/❌off-screen with file:line

  **QA Scenarios**:
  ```
  Scenario: Baseline screenshots captured at all 4×2 viewport/mode combinations
    Tool: Playwright (playwright skill)
    Preconditions: `npm run dev` running on http://localhost:3000
    Steps:
      1. Navigate to "/" and wait for network idle (max 10s wait)
      2. Set viewport to 360×800; verify page paints with no console errors; screenshot to baseline/landing-360-light.png
      3. Set localStorage "distiller-theme"="light"; reload; screenshot
      4. Set viewport to 768×1024; screenshot
      5. Set viewport to 1280×800; screenshot
      6. Set viewport to 1536×960; screenshot
      7. Repeat steps 1-6 for /RefinedFeed, /article/<sample-id>, /pricing, /dashboard, /about, /mena, /brief/<sample-slug>, /auth/login, /auth/signup, /not-found, /error
      8. For each page, toggle theme to dark and repeat
    Expected Result: 88 PNG files exist in .sisyphus/evidence/baseline/ and baseline-audit.md file references each
    Failure Indicators: any viewport shows console errors; screenshots missing or 0-byte; theme appears unchanged between light/dark captures
    Evidence: .sisyphus/evidence/baseline-audit.md + .sisyphus/evidence/baseline/*.png

  Scenario: Documented baseline design-bug verification
    Tool: Playwright
    Preconditions: All 88 baseline screenshots captured
    Steps:
      1. For each of the 15 listed bugs (bg-white/85 in RefinedFeed, ring-zinc in button, AskTheNewsForm missing label, etc.), open the relevant baseline screenshot and verify visibility
      2. Record in baseline-audit.md table: bug ID | visible at 360? | 768? | 1280? | 1536? | light? | dark? | user impact
    Expected Result: All 15 bugs have at least one "visible on" entry, OR a "not visible at any viewport — confirmed via code inspection" justification
    Failure Indicators: Any bug missing from the verification table
    Evidence: .sisyphus/evidence/baseline-bug-verification.md
  ```

  **Evidence to Capture**:
  - [ ] `task-1-baseline-audit.md` and `task-1-baseline-bug-verification.md`
  - [ ] 88 PNG screenshots under `.sisyphus/evidence/baseline/`

  **Commit**: NO (evidence-only task)

---

- [x] 2. Add `lib/copy.ts` shared evidence-first copy constants

  **What to do**:
  - Create `lib/copy.ts` exporting a frozen `COPY` object (see "lib/copy.ts contract" in the ADR-007 section above). Cover: brand, hero (eyebrow/headline leading with "evidence-first"/"source-grounded"/"every claim linked"/subheadline), shared trust/grounding/aiDisclosure strings, feed hero copy, about first paragraph, /mena hero, /brief fallback, metadata description default.
  - **Must NOT do**: edit any consumer page in this task — Wave 2 tasks (8-11) consume `COPY`. Do NOT invent metrics or claims. The strings MUST use only language the system actually delivers ("grounded in source text via RAG and NVIDIA embeddings", "every claim links to its source snippet", "three concise bullets, one insight, one conclusion").
  - Do NOT include "Distiller Score" anywhere. Treat the product mechanic as "grounded 3-bullet briefings with linked sources."

  **Recommended Agent Profile**:
  - **Category**: `quick` — small additive file, conceptual but bounded.
  - **Skills**: []

  **Parallelization**: Can Run In Parallel — YES. Wave 1 / Group A. Blocks: Tasks 8, 9, 10, 11 (consumers). Blocked By: None.

  **References**:
  - Pattern References: `lib/plans.ts` — same module-pattern: typed frozen const exported from a server-only-safe module.
  - Existing assertions to back the new copy strings: `lib/ai.ts:57-64` SYSTEM_PROMPT ("exactly 3 concise bullet points, one insight, and one conclusion"), `lib/rag.ts` RAG pipeline (chunk → embed → rank).
  - WHY: the wording MUST accurately describe the existing RAG pipeline; lib/ai.ts:57-64 confirms the "3 bullets + insight + conclusion" mechanic; lib/rag.ts confirms the embedding grounding.

  **Acceptance Criteria**:
  - [ ] `lib/copy.ts` exists; `npm run build` passes with file present
  - [ ] No consumer edits in this task — Wave 2 tasks 8-11 are expected to import COPY
  - [ ] `grep -i "Distiller Score\|invented\|AI verifies\|AI understands\|cross-reference verification" lib/copy.ts` returns 0 matches

  **QA Scenarios**:
  ```
  Scenario: COPY module exports valid typed constants
    Tool: Bash (node)
    Preconditions: npm run build succeeded
    Steps:
      1. Run `node -e "const m = require('./lib/copy.ts'); console.log(Object.keys(m.COPY))"`
      2. Assert output includes: ["brand","hero","shared"]
      3. Run `node -e "const m = require('./lib/copy.ts'); console.log(m.COPY.hero.headline.length > 0 && m.COPY.hero.subheadline.length > 0)"`
      4. Assert true
    Expected Result: Module loads, exports valid COPY object with required keys
    Failure Indicators: build fails, module doesn't export COPY, hero strings empty
    Evidence: .sisyphus/evidence/task-2-copy-module.txt

  Scenario: No forbidden phrases introduced
    Tool: Bash (grep)
    Steps:
      1. Run `grep -ic "Distiller Score\|invented\|AI verifies\|AI understands\|cross-reference verification\|full article" lib/copy.ts`
      2. Assert output is "0"
    Expected Result: No marketing claims about features that don't exist
    Evidence: .sisyphus/evidence/task-2-forbidden-phrases-zero.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-2-copy-module.txt` (node -e output)
  - [ ] `task-2-forbidden-phrases-zero.txt` (grep output)

  **Commit**: YES — with Wave 1. Message: `feat(copy): add lib/copy.ts evidence-first shared constants`. Files: `lib/copy.ts`. Pre-commit: `npm run build`.

---

- [x] 3. Extend `lib/plans.ts` with display metadata + guest limits + Stripe Price IDs

  **What to do**:
  - Extend `PLAN_LIMITS` per `lib/plans.ts` extended shape contract above. Add fields per tier: `tagline`, `cta`, `ctaHref`, `features[]`, `highlight?`, `periodAnnual?`, `publiclyVisible: boolean`, `stripePriceId?: string`.
  - Populate from current PricingSection.tsx + dashboard/billing hardcoded arrays as the source copy (so the values+language move verbatim into `lib/plans.ts`, not invented). Then refactor `PricingSection.tsx`/`dashboard/billing`/landing's Free vs Pro card into Wave-2 tasks (12-13) that read from the extended shape.
  - Add a `guest` block on `lib/plans.ts` exporting `GuestLimits` (articlesPerDay: 50, allowedTopics: [{id: "world"}, {id: "tech"}]) — values preserved from current app/api/feed/route.ts:14-115 behavior. This is NOT a pricing change; consolidation of the existing policy.
  - Read `STRIPE_PRO_PRICE_ID` and `STRIPE_TEAM_PRICE_ID` from `process.env` at module-load time and assign to `stripePriceId` for `pro`/`team` tiers (no behavior change yet — checkout route will use them in Task 12).
  - **Must NOT do**: edit consumers in this task. Do NOT change guest behavior (50/day stays). Do NOT add authenticated-user plan-based routing.
  - Add `"server-only"` import (since entitlements stay server-side; PricingSection is a client component — it will import a sibling `lib/plans-client.ts` re-export or a small read-only subset). Resolve: split approach per Metis guardrail — `lib/plans.ts` server-only, and create `lib/plans-display.ts` (no `"server-only"`) re-exporting the display fields only, safe for client components.

  **Recommended Agent Profile**:
  - **Category**: `deep` — load-bearing, multiple consumers, requires careful type design.
  - **Skills**: []

  **Parallelization**: Can Run In Parallel — YES. Wave 1 / Group A. Blocks: Tasks 12, 13, 18. Blocked By: None.

  **References**:
  - Pattern References: existing `lib/plans.ts`
  - Consumer references (do NOT edit in this task): `components/pricing/PricingSection.tsx:22-75` (existing hardcoded tiers to migrate FROM); `app/dashboard/billing/page.tsx:113-127` (second hardcoded list); `app/page.tsx:251-277` (third hardcoded "Free vs Pro" comparison); `app/api/feed/route.ts:14-115` (guest gate — migrate logic in Task 18)
  - Stripe env vars: `STRIPE_PRO_PRICE_ID`, `STRIPE_TEAM_PRICE_ID` (already defined in code at app/api/stripe/checkout/route.ts:19,23 but missing from .env.example — Task 11 will doc these)
  - WHY: the display metadata is currently HARDCODED in THREE different consumers; moving it to lib/plans.ts in a Wave 1 additive task means Wave 2 tasks can read from it without transient breakage.

  **Acceptance Criteria**:
  - [ ] `lib/plans.ts` extended with all new fields per ADR shape
  - [ ] `lib/plans-display.ts` created as client-safe re-export of display fields
  - [ ] `npm run build` passes
  - [ ] `lib/plans.ts` imports `"server-only"` at the top
  - [ ] `lib/plans-display.ts` does NOT import `"server-only"`
  - [ ] Type check: `tsc --noEmit` passes for the new shape
  - [ ] Stripe Price IDs read from env per tier; `pro` and `team` tiers have `stripePriceId` populated when env present, `undefined` when absent (no crash)

  **QA Scenarios**:
  ```
  Scenario: Extended lib/plans.ts builds and exports required fields
    Tool: Bash
    Preconditions: npm run build passes
    Steps:
      1. node -e "const p = require('./lib/plans.ts'); console.log(Object.keys(p.PLAN_LIMITS.free).sort().join(','))"
      2. Assert output includes: tagline,cta,ctaHref,features,publiclyVisible
      3. node -e "const p = require('./lib/plans.ts'); console.log(p.PLAN_LIMITS.api.publiclyVisible)"
      4. Assert output: false
      5. node -e "const p = require('./lib/plans.ts'); console.log(p.PLAN_LIMITS.guest.articlesPerDay)"
      6. Assert output: 50
      7. node -e "const p = require('./lib/plans.ts'); console.log(p.PLAN_LIMITS.pro.stripePriceId !== undefined || 'unset')"
      8. Assert: tier has stripePriceId field defined (value may be undefined when env unset)
    Expected Result: All required fields present; guest.articlesPerDay = 50 (preserved behavior); pro/team have stripePriceId field (undefined when env unset)
    Failure Indicators: missing fields; guest.articlesPerDay != 50; module throws when env var unset
    Evidence: .sisyphus/evidence/task-3-plans-extension.txt

  Scenario: Server-only boundary respected
    Tool: Bash (build)
    Steps:
      1. Run npm run build
      2. Assert zero TypeScript errors
    Expected Result: Build passes; no "server-only in client component" type errors
    Evidence: .sisyphus/evidence/task-3-build-success.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-3-plans-extension.txt`
  - [ ] `task-3-build-success.txt`

  **Commit**: YES — with Wave 1. Message: `refactor(plans): extend lib/plans.ts with display metadata, guest limits, stripePriceId`. Files: `lib/plans.ts`, `lib/plans-display.ts`. Pre-commit: `npm run build`.

---

- [x] 4. Distiller Score computation audit + document real formula in code comments

  **What to do**:
  - Read `lib/ai.ts` to find the exact `confidence` computation. Per Momus+Metis verification it's at `lib/ai.ts:503`: `const confidence = Math.min(0.97, baseScore + snippetScore + contextScore);` where `baseScore ≈ 0.65`, `snippetScore` scales with `ragContext.snippets.length`, and `contextScore` accounts for low token estimates. The plan ADR-004 contains the approximate formula inline; the audit treats that as a guide to locate the actual computation, which Task 4 then documents in the comment block.
  - Read `lib/rag.ts` `buildRagContext` to document how `snippets.length` and `tokenEstimate` originate (chunk → embed → rank → trim to `maxChunks`).
  - Read `lib/demo-articles.ts` to confirm `distillerScore` field presence is only in demo data.
  - Read `types/news.ts` (and any related type files) to locate the `distillerScore` field declaration (this audit says it might be on `DistilledArticle` type itself — verify).
  - Write findings into a code comment block at the top of `lib/ai.ts` (above the confidence computation) explaining: (a) what `confidence` measures (RAG retrieval strength — snippet count + estimated coverage), (b) what it does NOT measure (article truthfulness, source quality, journalist bias), (c) the formula in plain English.
  - Pre-write the tooltip copy that Task 17 will use as the user-facing text. Store in `lib/copy.ts` under a new `scoreTooltip` field — this requires editing lib/copy.ts which Task 2 created in the same wave (parallel-safe since you're only adding a key, not restructuring).
  - **Must NOT do**: edit components or types. Pure audit + documentation task feeding Task 17.

  **Recommended Agent Profile**:
  - **Category**: `quick` — bounded read + comment addition + one copy key.
  - **Skills**: []

  **Parallelization**: Can Run In Parallel — YES. Wave 1 / Group A. Blocks: Task 17 (relabel needs documented formula). Blocked By: Task 2 (lib/copy.ts must exist).

  **References**:
  - `lib/ai.ts` — confidence computation rendering. Find `Math.min(0.98, 0.65 + ragContext.snippets.length * 0.08 ...)` and add comment block above it.
  - `lib/rag.ts` — `buildRagContext` returns `snippets: string[]`, `context: string`, `tokenEstimate: number` — confirm the field semantics.
  - `lib/demo-articles.ts` — verify that `distillerScore` is only set on demo objects.
  - `types/news.ts` (verify path) — check if `distillerScore` is on `DistilledArticle` type or only on demo data instances.
  - WHY: the actual formula determines whether the score's user-facing label can be "RAG retrieval confidence" or needs different phrasing.

  **Acceptance Criteria**:
  - [ ] Top of `lib/ai.ts` (above confidence computation line) has a comment block documenting the real formula
  - [ ] `lib/copy.ts` contains a new `scoreTooltip` key with wording explaining the score measures retrieval strength + coverage, explicitly NOT measuring source quality
  - [ ] Audit notes appended to `.sisyphus/evidence/task-4-score-audit.md`: file:line for confidence computation, file:line for distillerScore usages, file:line for type declaration if any
  - [ ] `npm run build` passes

  **QA Scenarios**:
  ```
  Scenario: Score audit documentation present
    Tool: Bash (grep)
    Steps:
      1. grep -A 10 "RAG retrieval confidence formula" lib/ai.ts
      2. Assert output contains "Math.min(0.98, 0.65 +"
      3. grep "scoreTooltip" lib/copy.ts
      4. Assert non-empty output containing "retrieval"
    Expected Result: Comment block + tooltip constant present; formula verifiable
    Failure Indicators: Comment missing or doesn't quote real formula; tooltip constant missing
    Evidence: .sisyphus/evidence/task-4-score-documentation.txt

  Scenario: Distiller Score field locations enumerated
    Tool: Bash (grep + read)
    Steps:
      1. Run `grep -rn "distillerScore" --include="*.ts" --include="*.tsx" .` and write output to evidence file
      2. Assert: output lists every file containing "distillerScore" (expected: lib/demo-articles.ts, types/news.ts if declared, components/DistilledCard.tsx)
    Expected Result: All consumers enumerated in evidence file
    Evidence: .sisyphus/evidence/task-4-score-audit.md
  ```

  **Evidence to Capture**:
  - [ ] `task-4-score-documentation.txt`
  - [ ] `task-4-score-audit.md`

  **Commit**: YES — with Wave 1. Message: `docs(score): document RAG confidence formula + prep honest tooltip copy`. Files: `lib/ai.ts`, `lib/copy.ts`. Pre-commit: `npm run build`.

---

- [x] 5. Full-text consumer audit (verify no external use beyond NewsArticleModal + services/newsapi.ts)

  **What to do**:
  - Run `grep -rn "fetchFullArticleText\|/api/news/full-text\|buildLocalArticleText\|stripNewsApiTruncation" --include="*.ts" --include="*.tsx" .` to enumerate every reference.
  - Read `app/api/news/full-text/route.ts` to enumerate every helper import + the response shape.
  - Read `components/NewsArticleModal.tsx` to find every fetch call to `/api/news/full-text` and the rendered UI sections ("See more article text", "Hide article text", "Full article text", "Loaded from..." notice strings).
  - Read `services/newsapi.ts` to find the call site that invokes `fetchFullArticleText` for server-side enrichment and identify the replacement path (Task 14 will patch this).
  - Read `/app/brief/[slug]/page.tsx` and `/app/api/cron/daily-briefing/route.ts` to confirm ZERO dependency (Metis verified clean). Document this.
  - Check `lib/db/queries.ts` `reserveMonthlyArticleUsage` — confirm whether it ONLY writes to `userArticleUsage` for the full-text route, or whether other routes also call it. Decide whether to keep the function (likely yes — it's the gate mechanism, reusable).
  - Write findings into `.sisyphus/evidence/task-5-fulltext-consumers.md` as a complete map.
  - **Must NOT do**: edit any source file. Pure observation feeding Wave 3.

  **Recommended Agent Profile**:
  - **Category**: `quick` — audit/report.
  - **Skills**: []

  **Parallelization**: Can Run In Parallel — YES. Wave 1 / Group A. Blocks: Tasks 14, 15, 16 (consumers of this audit). Blocked By: None.

  **References**:
  - `app/api/news/full-text/route.ts` — endpoint being removed.
  - `lib/article-text.ts` — lib being removed; inspect every exported function.
  - `lib/article-text-utils.ts` — util lib being removed.
  - `components/NewsArticleModal.tsx` — UI surface to strip in Task 16.
  - `services/newsapi.ts` — server-side enrichment call site patched in Task 14.
  - WHY: this is the "no surprise deletions" guardrail; the audit must precede Wave 3 destructive edits.

  **Acceptance Criteria**:
  - [ ] `.sisyphus/evidence/task-5-fulltext-consumers.md` exists with categories: route handlers, lib exports, UI surfaces, server-side consumers, downstream non-dependency confirmations.
  - [ ] Map explicitly states: full-text feature has exactly N call sites (route, lib, modal, services/newsapi.ts) and ZERO call sites in /brief, /cron, /dashboard, /bookmarks.

  **QA Scenarios**:
  ```
  Scenario: Complete consumer enumeration
    Tool: Bash (grep)
    Steps:
      1. grep -rn "fetchFullArticleText\|/api/news/full-text\|buildLocalArticleText\|stripNewsApiTruncation\|ArticleFullTextResponse\|ArticleTextSource" --include="*.ts" --include="*.tsx" . > /tmp/fulltext-consumers.txt
      2. Sort + de-duplicate the output into the evidence file
      3. Categorize each line as: (a) route handler implementation, (b) lib file, (c) UI fetch call, (d) server-side service call, (e) type declaration
    Expected Result: Every reference categorized; no orphans unaccounted
    Failure Indicators: References found outside the enumerated categories
    Evidence: .sisyphus/evidence/task-5-fulltext-consumers.md
  ```

  **Evidence to Capture**:
  - [ ] `task-5-fulltext-consumers.md`

  **Commit**: NO (evidence-only task)

---

- [x] 6. Design token bug fixes (define shadow tokens; fix hardcoded bg-white & ring-zinc)

  **What to do**:
  - Define `--shadow-soft` and `--shadow-elevated` CSS custom properties in `app/globals.css` `:root` and `.dark` blocks. Apply subtle values (don't introduce aggressive shadows — "calm editorial" means shadows lift gently, not dramatically). Map them in the `@theme inline` block at globals.css L90-L124 so `shadow-soft` and `shadow-elevated` Tailwind classes resolve.
  - Replace hardcoded `bg-white/85` and `bg-white/75` in `app/RefinedFeed/page.tsx` (lines around 403, 500) with `bg-background/85` (tokenized — adapts to theme).
  - Replace hardcoded `focus-visible:ring-zinc-300 ring-offset-zinc-950` in `components/ui/button.tsx` with `focus-visible:ring-ring focus-visible:ring-offset-background` (tokenized). Verify since `--ring` exists in both themes this resolves correctly.
  - Remove the leftover `ToastContainer_root__` class string in `components/ui/toast.tsx` (around line 44). Either delete that className entirely or replace with `cn(...)`-composed tokenized utility.
  - Audit any other hardcoded `bg-white`, `bg-zinc-*`, `text-zinc-*` color classes that break dark mode (grep for `bg-white` and `bg-zinc-[0-9]` across `app/` and `components/`). Replace non-decorative usages with tokenized equivalents (use `cn()` from `lib/utils.ts`).
  - **Must NOT do**: change color palette (primary, accent); change fonts; touch DOM structure; introduce new tokens beyond the two shadow tokens. The aim is bug-fix, not redesign.

  **Recommended Agent Profile**:
  - **Category**: `quick` — surgical token + color class fixes.
  - **Skills**: [`tailwind-css-patterns`] (only if needed; task is token-focused so may not be needed)
  - **Skills Evaluated but Omitted**: `frontend-design` — task is bug-fix-level, not redesign.

  **Parallelization**: Can Run In Parallel — YES. Wave 1 / Group A. Blocks: F1 (verifies guardrails), F3 (compares before/after screenshots). Blocked By: Task 1 (prefer baseline capture first; not strict blocker).

  **References**:
  - `app/globals.css` L6-87 — existing `:root` and `.dark` blocks where shadow custom properties must be added.
  - `app/globals.css` L90-L124 — `@theme inline` mapping block where `--shadow-soft` and `--shadow-elevated` must be registered.
  - `components/ui/button.tsx` — `focus-visible:ring-zinc-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950` line to replace.
  - `app/RefinedFeed/page.tsx` ~L403, ~L500 — `bg-white/85` and `bg-white/75` to replace.
  - `components/ui/toast.tsx` ~L44 — `ToastContainer_root__` literal to remove.
  - WHY: Metis surfaced these as the catalogued design bugs; without fixes, dark-mode tests will see lightpanels and button focus rings vanish in light mode.

  **Acceptance Criteria**:
  - [ ] `shadow-soft` and `shadow-elevated` resolve to visible shadows in both `:root` and `.dark` (verified via Playwright screenshot diff vs baseline Task 1)
  - [ ] `grep -rn "bg-white/" app/ components/ | grep -v "node_modules"` returns 0 matches (or only matches where `bg-white` is intentionally paired with `dark:` variants)
  - [ ] `grep -rn "ring-zinc\|ring-offset-zinc" components/ui/button.tsx` returns 0 matches
  - [ ] `grep -rn "ToastContainer_root__" components/` returns 0 matches
  - [ ] `npm run build` + `npm run lint` pass

  **QA Scenarios**:
  ```
  Scenario: Shadows visible in dark mode at all viewports
    Tool: Playwright
    Preconditions: npm run dev running
    Steps:
      1. Navigate to /RefinedFeed; set viewport 1280×800; set theme=dark
      2. Screenshot DistilledCard (selector ".h-full" or first motion.article)
      3. Assert: card has visible box-shadow (computed style: boxShadow non-empty, boxShadow opacity < 1 above ambient)
      4. Repeat at 360×800, 768×1024, 1536×960
      5. Repeat in light mode (toggle theme=light, reload)
    Expected Result: Shadows visibly present in both modes at all viewports
    Failure Indicators: Empty boxShadow computed; cards look identical to borderless flat panels in dark mode
    Evidence: .sisyphus/evidence/task-6-shadows-verification.png

  Scenario: Button focus ring visible in light + dark mode
    Tool: Playwright
    Steps:
      1. Navigate to /auth/login; tab to email input then to Sign in button
      2. Set theme=dark; verify button shows visible focus ring (box-shadow 0 0 0 4px var(--ring))
      3. Set theme=light; reload; re-tab; verify ring visible
      4. Screenshot both
    Expected Result: Focus ring visible in both modes (no invisible white ring on white background)
    Failure Indicators: focus ring invisible in either mode
    Evidence: .sisyphus/evidence/task-6-button-focus-ring.png

  Scenario: Dark mode has no white panels
    Tool: Playwright + Bash (grep)
    Steps:
      1. Navigate /RefinedFeed in dark mode at each of 4 viewports; screenshot
      2. Visual inspection: no area on the page renders #fff/#fafafa background
      3. Confirm with grep: `grep -rn "bg-white/" app/ components/` returns 0 final matches
      4. Screenshot /dashboard and /pricing in dark mode at 1280×800 and 1536×960
    Expected Result: All page surfaces use tokens, not hardcoded white panels in dark mode
    Failure Indicators: Visual "white patch" observed in any dark-mode screenshot; grep returns non-zero matches
    Evidence: .sisyphus/evidence/task-6-dark-mode-tokens.png
  ```

  **Evidence to Capture**:
  - [ ] `task-6-shadows-verification.png`
  - [ ] `task-6-button-focus-ring.png`
  - [ ] `task-6-dark-mode-tokens.png`

  **Commit**: YES — with Wave 1. Message: `fix(design): define shadow tokens, remove hardcoded bg-white + ring-zinc, drop ToastContainer leftover`. Files: `app/globals.css`, `components/ui/button.tsx`, `components/ui/toast.tsx`, `app/RefinedFeed/page.tsx`. Pre-commit: `npm run build && npm run lint`.

---

- [x] 7. Migrate Crimson Pro + DM Sans to next/font/google (font loading perf)

  **What to do**:
  - In `app/layout.tsx`, add `next/font/google` registrations for `Crimson_Pro` and `DM_Sans` alongside the existing `IBM_Plex_Mono` registration. Set `subsets: ["latin"]`, `display: "swap"`, `variable: "--font-crimson-pro"` and `variable: "--font-dm-sans"` respectively (matching the CSS variable names already used in `app/globals.css`). Carry weights used in styles — Crimson Pro 300-900 italic (audit this), DM Sans variable full range with opsz axis.
  - Apply the variables to the `<body>` className, alongside the existing `--font-ibm-plex-mono` variable.
  - Remove the Google Fonts `@import` URL from `app/globals.css` line 1 (it currently loads Crimson Pro + DM Sans + IBM Plex Mono). IBM Plex Mono stays via next/font (already in layout), so removing the @import is safe.
  - Update `app/layout.tsx` body className: `"min-h-screen antialiased ${ibmPlexMono.variable} ${crimsonPro.variable} ${dmSans.variable}"`.
  - Verify the CSS body/h1-h6 rules using `var(--font-crimson-pro)` and `var(--font-dm-sans)` continue to resolve.
  - **Must NOT do**: change font families, weights, or styling. The only change is loading mechanism (Google Fonts @import → next/font/google self-host).

  **Recommended Agent Profile**:
  - **Category**: `quick` — swapload mechanism, no aesthetic change.
  - **Skills**: []

  **Parallelization**: Can Run In Parallel — YES. Wave 1 / Group A. Blocks: F2, F3. Blocked By: None.

  **References**:
  - `app/globals.css:1` — `@import url("https://fonts.googleapis.com/...")` to remove.
  - `app/globals.css:6-49` — already declares `--font-crimson-pro`, `--font-dm-sans`, `--font-ibm-plex-mono` CSS vars. They will resolve via the next/font variable injection once @import is removed.
  - `app/layout.tsx:15-19` — existing IBM_Plex_Mono registration to model Crimson Pro + DM Sans after.
  - WHY: Metis flagged font loading as performance gap; next/font/google gives self-hosting + subsetting + CLS-free fallback.

  **Acceptance Criteria**:
  - [ ] `app/layout.tsx` registers all three fonts via next/font/google with display:"swap"
  - [ ] No `@import url(` anywhere in `app/` for Google Fonts (only Tailwind-related @import remains if any)
  - [ ] `npm run build` passes without font-loading errors
  - [ ] Lighthouse LCP improves OR stays the same (verify via Playwright performance trace; no font-related render-blocking)
  - [ ] Visual diff: headings still render Crimson Pro serif, body still DM Sans — confirmed by Playwright screenshot

  **QA Scenarios**:
  ```
  Scenario: No Google Fonts @import in CSS
    Tool: Bash (grep)
    Steps:
      1. grep -rn "@import.*fonts.googleapis.com\|@import.*gstatic" app/ components/ lib/
      2. Assert zero matches
    Expected Result: All web fonts loaded via next/font/google (self-hosted)
    Evidence: .sisyphus/evidence/task-7-no-google-fonts-import.txt

  Scenario: Visual parity before/after font migration
    Tool: Playwright
    Steps:
      1. npm run dev; wait for ready
      2. Navigate to /; set theme=light, viewport=1280×800
      3. Screenshot landing hero
      4. Compare against Task 1 baseline screenshots — heading should render in the same serif (Crimson Pro), body in same sans (DM Sans)
      5. Repeat for /RefinedFeed, /pricing, /about
    Expected Result: Visual diff shows only pixel-level font-rendering improvements (next/font swaps woff2); family + weights unchanged
    Failure Indicators: Heading renders in fallback serif or default sans; body text in fallback sans; layout shift on initial load
    Evidence: .sisyphus/evidence/task-7-font-parity.png

  Scenario: Build + lint pass after font migration
    Tool: Bash
    Steps:
      1. npm run build
      2. npm run lint
      3. Assert: build success, lint zero errors
    Expected Result: Both pass
    Evidence: .sisyphus/evidence/task-7-build-and-lint.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-7-no-google-fonts-import.txt`
  - [ ] `task-7-font-parity.png`
  - [ ] `task-7-build-and-lint.txt`

  **Commit**: YES — with Wave 1. Message: `perf(fonts): migrate Crimson Pro + DM Sans to next/font/google self-hosting`. Files: `app/layout.tsx`, `app/globals.css`. Pre-commit: `npm run build`.

---

### WAVE 2 — Additive copy + UI refactoring (after Wave 1)

- [x] 8. Landing page rewrite: hero leads with evidence-first, remove testimonials, replace with grounding anatomy element

  **What to do**:
  - `app/page.tsx` hero section (lines 75-114): replace badge text "News intelligence for curious minds" with COPY.hero.eyebrow. Replace headline "The world's news,\nthree bullets." with COPY.hero.headline (evidence-first lead). Replace subheadline with COPY.hero.subheadline. Replace CTA labels and trust-note line with COPY equivalents.
  - Remove the stats row elements ("15 Topics", "15 Regions", "3 Bullets/Article", "Free to start") or relocate below the hero. (Stats row inside the hero stack violates the design-taste-frontend "hero stack discipline" — move to a strip UNDER the hero, not within it.)
  - Sample summary demo card (lines 128-178): KEEP the demo card mechanics (it's a real preview). Keep the source attribution (`arXiv · 2h ago`). Update the sidebar labels ("Sample summary", "3 concise bullets", "Verified source") to evidence-aligned language. Replace "Verified source" with "Source attribution" or remove if redundant.
  - Features section (lines 181-198): KEEP the four features but tighten the copy to evidence-first language for "Verified Sources": `Every brief pulls directly from the original article. No guesswork, no fabrication — just the facts.` → already aligned; keep. Update "Three Bullets" / "15 Topics, 15 Regions" / "Live RSS Feed" copy only minimally to align tone.
  - Testimonials section (lines 200-243): REMOVE entirely. Replace with a new section called "How Distiller grounds every brief" — a static anatomy diagram showing the real RAG pipeline steps: Article → RAG chunks → NVIDIA Build embeddings → ranked snippets → 3 bullets + insight + conclusion + confidence. No fake testimonials, no "Sarah K." / "Mehdi O." / "Julien L." This element must use real existing values from the pipeline (chunk size ~900 chars, overlap 120, max chunks 3, etc.) — pulled from `lib/rag.ts` constants. Add `aria-label="How Distiller grounds every brief"` for accessibility.
  - Free vs Pro comparison card (lines 245-283): DELETE the hardcoded card. The replacement is to render this card from `lib/plans-display.ts` filtering `publiclyVisible === true` (Task 12 handles the canonical read-from-lib/plans fix; this task removes the hardcoded three-tier comparison and instead imports a shared `<PricingPreview>` or just calls `PLAN_LIMITS_DISPLAY.filter(p => p.publiclyVisible)` directly from `lib/plans-display.ts`). Coordinate with Task 12 to avoid double-implementation. Resolution: Task 12 owns the canonical PricingSection refactor; Task 8 here removes the inline landing-page comparison and delegates to the shared PricingSection read from lib/plans-display (one import).
  - Deep Summary Mode callout (lines 286-300): KEEP but tighten copy to emphasize "grounded deep mode" (more snippets, bigger context window).
  - Bottom CTA + Final CTA sections: update copy with COPY constants (e.g., "Ready to cut through the noise?" → evidence-first variant). Update CTA labels to match hero primary ("Start for free").
  - Topics section (lines 325-342): KEEP (it's the topic taxonomy) — confirms /onboarding alignment.
  - **Must NOT do**: invent metrics like "Distiller Score," invent testimonials, invent publisher marks, or add claims about features that don't exist ("AI verifies," "cross-reference verification"). Do not change page structure beyond testimonials removal + Free vs Pro comparison delegation. Do not touch route handlers or lib modules.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering` — UI+copy update with component composition changes.
  - **Skills**: [`frontend-design`]
    - `frontend-design`: needed for the "calm editorial intelligence" grounding-anatomy element design + anti-slop guardrails (no purple gradients, no glassmorphism, no excessive pills, no huge radii, no empty hero space).

  **Parallelization**: Can Run In Parallel — YES. Wave 2 / Group B (with T9-T13). Blocks: F1, F3, F4. Blocked By: Task 2 (COPY constants), Task 3 (lib/plans-display for Free vs Pro delegation).

  **References**:
  - `lib/copy.ts` (Task 2 output) — COPY.hero.\*, COPY.shared.\*
  - `lib/plans-display.ts` (Task 3 output) — replace hardcoded tiers with import
  - Existing testimonial composition at `app/page.tsx:200-243` — material to remove
  - `lib/rag.ts:chunkText(text, chunkSize = 900, overlap = 120)` + `maxChunks = 3` — real constants for the grounding-anatomy element
  - `lib/ai.ts:57-64` SYSTEM_PROMPT — confirms "exactly 3 concise bullet points, one insight, one conclusion" mechanic
  - WHY: this is the highest-leverage positioning surfacel it must consume only real values from lib/rag.ts + lib/ai.ts so no claim is invented.

  **Acceptance Criteria**:
  - [ ] App/page.tsx hero headline matches COPY.hero.headline verbatim (assert via Playwright text extraction)
  - [ ] `grep -i "Sarah K\.\|Mehdi O\.\|Julien L\." app/page.tsx` returns 0 matches
  - [ ] `grep -i "Sarah K\.\|Mehdi O\.\|Julien L\." app/ components/ lib/ -r` returns 0 matches globally
  - [ ] A new "How Distiller grounds every brief" section exists on landing, contains at least 5 pipeline steps, uses real constants from lib/rag.ts; section has `aria-label="How Distiller grounds every brief"`
  - [ ] Free vs Pro comparison card no longer hardcodes tiers — imports from `lib/plans-display.ts`
  - [ ] `npm run build` + `npm run lint` pass
  - [ ] `grep -i "Distiller Score" app/page.tsx` returns 0 matches

  **QA Scenarios**:
  ```
  Scenario: Landing hero copy matches evidence-first COPY constants
    Tool: Playwright
    Steps:
      1. npm run dev; navigate to /; viewport 1280×800; theme=light
      2. Locate hero headline (role="heading" level 1): assert textContent starts with COPY.hero.headline's literal value (use substring assertion)
      3. Locate eyebrow above H1: assert textContent equals COPY.hero.eyebrow
      4. Locate the value-prop paragraph: assert textContent contains "grounded" + "RAG" + "embeddings"
      5. Repeat in dark mode toggle
    Expected Result: Hero composition leads with evidence-first positioning; "three bullets" demoted to supporting detail
    Failure Indicators: Hero still reads "The world's news, three bullets." as headline
    Evidence: .sisyphus/evidence/task-8-hero-evidence-first.png + .sisyphus/evidence/task-8-hero-textdump.txt

  Scenario: Testimonials removed; grounding anatomy present
    Tool: Playwright + Bash (grep)
    Steps:
      1. grep -ri "Sarah K\.\|Mehdi O\.\|Julien L\." app/ components/ lib/ — assert 0 matches
      2. Navigate to /, scroll past hero; assert heading "How Distiller grounds every brief" appears (text query)
      3. Assert the section has `aria-label="How Distiller grounds every brief"` locator present
      4. Assert at least 5 step labels appear (Article → Chunks → Embeddings → Snippets → Summary)
      5. Screenshot full page
    Expected Result: No testimonials; grounding anatomy section visible with real constants
    Failure Indicators: Any testimonial name still present; anatomy section missing aria-label or fewer than 5 steps
    Evidence: .sisyphus/evidence/task-8-grounding-anatomy.png + .sisyphus/evidence/task-8-testimonials-removed.txt

  Scenario: Landing at all 4 viewports + 2 modes
    Tool: Playwright
    Steps:
      1. Capture / at 360, 768, 1280, 1536 in both themes; assert no layout break, no horizontal scroll at 360, no empty hero (hero fits initial viewport), no purple-gradient/glassmorphism visible
      2. Visual inspection: hero text fits in viewport; CTA visible without scroll at 360×800
    Expected Result: Composition adapts cleanly at all four widths in both modes
    Failure Indicators: Hero headline overflows at 360; CTA below fold at 360; any horizontal scroll
    Evidence: .sisyphus/evidence/task-8-landing-all-viewports/*.png
  ```

  **Evidence to Capture**:
  - [ ] `task-8-hero-evidence-first.png` + `task-8-hero-textdump.txt`
  - [ ] `task-8-grounding-anatomy.png` + `task-8-testimonials-removed.txt`
  - [ ] Screenshots at 8 viewports: `task-8-landing-{360|768|1280|1536}-{light|dark}.png`

  **Commit**: YES — with Wave 2. Message: `refactor(landing): evidence-first hero + remove testimonials + grounding anatomy section`. Files: `app/page.tsx`, possible new `components/lifting/GroundingAnatomy.tsx` (or inline section within page). Pre-commit: `npm run build && npm run lint`.

---

- [x] 9. /RefinedFeed page copy + filter labels (evidence-first, demo banner, overlay)

  **What to do**:
  - `app/RefinedFeed/page.tsx`: replace hero text (badge `<SlidersHorizontal /> Verified + distilled` + H1 "Refine the global feed..." + paragraph "Distiller fetches stories from our API-backed pipeline, grounds them with embeddings, and uses RAG to render exactly three concise bullets per article.") with COPY constants — lead with "evidence-first" terminology. Keep "grounded with embeddings" language (it's accurate per lib/rag.ts).
  - Update info rows: "Source verification: enabled" — keep but verify what it actually means in code (does the card show source attribution?). If "Source verification" implies something that doesn't actually happen in code, replace with "Source attribution: shown".
  - "Red dot means important or breaking news." → keep, it's accurate and helpful.
  - Search placeholder "Search topics, regions, or headlines": KEEP (functional, not positioning).
  - Topic chips & guest-limit badge (lines 36-40 reference the constant `GUEST_FREE_ARTICLES = 50` in the route, matching `GUEST_DAILY_LIMIT = 50` at `app/api/feed/route.ts:14`): for the guest-limit badge text "Free: 50 articles / month" → consult Task 3 (lib/plans.ts now has `guest.articlesPerDay = 50`). Resolve: change text to match actual behavior. Since guest is 50/day per ADR-002, the badge should say "Free preview: 50 articles / day" (the guest limit). Don't claim "/ month."
  - Demo banner ("Sign in to unlock your full personalized feed.") and "These are sample previews...": KEEP but tighten tone evidence-first.
  - Guest limit reached overlay "You have reached your free daily limit" + "Create a free account to get 50 free articles every day..." — KEEP 50/day language consistent (not 50/month).
  - Empty state copy: KEEP functional rhetoric.
  - End-of-feed copy "You reached the end of the current feed": KEEP.
  - **Must NOT do**: introduce claims about features that don't exist; add "Distiller Score" anywhere.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering` — UI text edits + class touch-ups.
  - **Skills**: [`tailwind-css-patterns`] (only if stylistic)
  - **Skills Evaluated but Omitted**: `frontend-design` — Task 8 already establishes the language; this is consistency propagation.

  **Parallelization**: Can Run In Parallel — YES. Wave 2 / Group B. Blocks: F1, F3. Blocked By: Task 2 (COPY constants).

  **References**:
  - `lib/copy.ts` Task 2 output — COPY.feed.\* (additive keys for feed)
  - `lib/plans.ts` Task 3 output — PLAN_LIMITS.guest.articlesPerDay = 50 (keep /day language)
  - WHY: feed is the product surface; its hero copy must match the landing hero's positioning.

  **Acceptance Criteria**:
  - [ ] `/RefinedFeed` hero headline matches COPY.feed.heroHeadline; subhead matches COPY.feed.heroSubhead
  - [ ] `grep -i "50 articles / month\|50 articles/month" app/RefinedFeed/page.tsx` returns 0 (use /day for guest)
  - [ ] Guest limit overlay copy says "50 free articles every day" not "every month"
  - [ ] `npm run build` + `npm run lint` pass
  - [ ] Playwright at 4×2 viewports shows no horizontal scroll at 360

  **QA Scenarios**:
  ```
  Scenario: Feed hero copy rewritten
    Tool: Playwright
    Steps:
      1. Navigate /RefinedFeed at 1280×800 in light mode
      2. Assert hero H1 textContent starts with COPY.feed.heroHeadline literal (substring)
      3. Assert subhead contains "evidence-first" or "source-grounded" or "every claim"
      4. Repeat in dark mode
    Expected Result: Hero copy matches COPY constants, leads with evidence-first
    Evidence: .sisyphus/evidence/task-9-feed-hero.png + task-9-feed-hero-textdump.txt

  Scenario: Guest tier badge says /day not /month
    Tool: Playwright (logged-out session)
    Steps:
      1. Clear session cookies; navigate /RefinedFeed; ensure guest mode active
      2. Locate topic-chip area label "Free:" — assert textContent equals "Free preview: 50 articles / day" (or "Free: 50 articles / day")
      3. Advance to limit (mock) — assert overlay text contains "every day"
    Expected Result: Guest limit language consistently uses /day
    Failure Indicators: Badge says "/month"; overlay says "every month"
    Evidence: .sisyphus/evidence/task-9-guest-tier-language.png

  Scenario: All 4 viewports in both modes
    Tool: Playwright
    Steps: Capture 8 screenshots; assert no horizontal scroll at 360, feed renders 1-col mobile 2-col desktop 3-col 2xl (2xl: added in Task 19)
    Expected Result: Clean responsive adaptation; no layout break
    Evidence: .sisyphus/evidence/task-9-feed-all-viewports/*.png
  ```

  **Evidence to Capture**:
  - [ ] `task-9-feed-hero.png`, `task-9-feed-hero-textdump.txt`
  - [ ] `task-9-guest-tier-language.png`
  - [ ] Screenshots at 8 viewports

  **Commit**: YES — with Wave 2. Message: `refactor(feed): evidence-first hero + consistent 50/day guest language`. Files: `app/RefinedFeed/page.tsx`. Pre-commit: `npm run build && npm run lint`.

---

- [x] 10. /about, /terms, /privacy, /mena, /brief copy rewrite (evidence-first; legal copy changes flagged)

  **What to do**:
  - `app/about/page.tsx`: replace "Distiller started as a personal frustration..." narrative if it overclaims; tighten first paragraph to lead with evidence-first positioning. RETAIN the existing aligned sentence "Every brief is grounded in the original source text using RAG and NVIDIA embeddings." Replace "Distiller uses AI to summarize third-party articles..." in Terms with tightened copy: REMOVE references to summarizing third-party article body text — it's summaries-of-retrieved-snippets now.
  - `app/terms/page.tsx`: CRITICAL — replace AI-content disclaimer (line ~62 "Distiller uses AI to summarize third-party articles. These summaries may contain errors, omissions, or inaccuracies. Summaries are grounded in source text using RAG but the model may infer information not present in the original source. Always verify with the original source before making decisions based on Distiller content.") with tightened version aligned with reality after Wave 3 changes (no full-text extraction; summaries are RAG-grounded bullets only). MUST add a guardrail flag: any legal copy change MUST be reviewed by Ahmed — do not auto-merge. Add a code comment `// LEGAL-COPY-REVIEW: changed by Task 10 Wave 2 — Ahmed approval required before merge` at each touch point.
  - `app/privacy/page.tsx`: replace the AI-processing disclosure "Your article reading activity is processed by our NVIDIA-powered AI pipeline... Source article text is processed in memory only and is not stored beyond the session." — after Wave 3 source article text is not fetched beyond NewsAPI payload (title + description + truncated content + URL); the "Source article text is processed in memory only and is not stored beyond the session" claim is now even more accurate because no full-text extraction happens. Tighten language to reflect removal of full-text-feature verbiage. Same LEGAL-COPY-REVIEW guardrail.
  - `app/mena/page.tsx`: keep the regional positioning but lead with "evidence-first coverage of MENA & Africa" (lead with evidence-first, region as supporting detail). Update the H1 and P copy.
  - `app/brief/[slug]/page.tsx`: update fallback metadata description (currently "AI-powered news brief from Distiller.") → "Evidence-first news brief from Distiller — grounded by RAG." Update the share text template (line ~54) to lead with "evidence-first" framing (optional but aligned). Update the footer "Briefed by Distiller — AI-powered news intelligence" → "Briefed by Distiller — evidence-first news intelligence."
  - RSS feed bulletin (handled in Task 11) — this task only updates page-rendered copy.
  - **Must NOT do**: introduce claims about features that don't exist; rewrite legal copy without LEGAL-COPY-REVIEW marker; remove or change GDPR/CCPA consumer rights paragraphs; remove AI disclaimer (it must remain; just tightened).

  **Recommended Agent Profile**:
  - **Category**: `writing` — copy-centric, judgmental wording.
  - **Skills**: []

  **Parallelization**: Can Run In Parallel — YES. Wave 2 / Group B. Blocks: F1, F3, F4 (legal-copy compliance). Blocked By: Task 2 (COPY).

  **References**:
  - `lib/copy.ts` COPY.about.\*, COPY.termsDisclaimer, COPY.privacyAIProcessing, COPY.menaHero.\*, COPY.briefFallback — to add into Task 2's lib/copy.ts if not already present (small additive edit; parallel-safe)
  - `app/terms/page.tsx:62` and `app/privacy/page.tsx:46` — current legal copy lines being touched
  - WHY: legal copy is high-stakes; must align with reality (no full-text extraction after Wave 3) and explicitly flag for Ahmed legal review.

  **Acceptance Criteria**:
  - [ ] All 5 pages updated with evidence-first language
  - [ ] LEGAL-COPY-REVIEW comment markers present at every Terms/Privacy touched line
  - [ ] No remaining claim of "Distiller uses AI to summarize third-party articles" (replaced with grounded-brief language)
  - [ ] /about first paragraph leads with evidence-first positioning
  - [ ] /brief fallback metadata description starts with "Evidence-first"
  - [ ] /mena hero leads with regional + evidence-first composite
  - [ ] `npm run build` passes

  **QA Scenarios**:
  ```
  Scenario: Legal copy guardrail markers present
    Tool: Bash (grep)
    Steps:
      1. grep -n "LEGAL-COPY-REVIEW" app/terms/page.tsx app/privacy/page.tsx
      2. Assert: at least one match per touched line — i.e., every modified AI/legal paragraph has the marker
    Expected Result: Markers symbolize Ahmed-review-required state
    Failure Indicators: No markers after touching legal copy
    Evidence: .sisyphus/evidence/task-10-legal-markers.txt

  Scenario: About / Terms / Privacy / MENA / Brief all lead with evidence-first
    Tool: Playwright
    Steps:
      1. Navigate to /about at 768×1024; assert the first paragraph contains "evidence" or "grounded" or "source"
      2. Navigate to /mena at 1280×800; assert hero H1 contains "evidence-first" or "grounded" or "Africa" + a grounding word
      3. Navigate to /brief/<sample-slug> at 1280×800; assert metadata description set in page starts with "Evidence-first"
      4. Screenshot all 5 pages at 360, 768, 1280, 1536 in light + dark
    Expected Result: All 5 pages align with evidence-first positioning; no layout break at 2xl
    Evidence: .sisyphus/evidence/task-10-all-pages-rewrite/*.png

  Scenario: Legal copy accuracy — no full-text claims retained
    Tool: Bash (grep)
    Steps:
      1. grep -in "extract full article\|full article text\|full-text" app/terms/page.tsx app/privacy/page.tsx app/about/page.tsx
      2. Assert: 0 matches (or matches are denial-of-feature "we do not extract full article text" — verify wording)
    Expected Result: No positive claims about full-text extraction in legal or about pages
    Evidence: .sisyphus/evidence/task-10-no-fulltext-claims.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-10-legal-markers.txt`
  - [ ] `task-10-all-pages-rewrite/*.png` (5 pages × 8 viewports = 40 screenshots)
  - [ ] `task-10-no-fulltext-claims.txt`

  **Commit**: YES — with Wave 2. Message: `refactor(copy): evidence-first across /about, /terms, /privacy, /mena, /brief; legal copy flagged for review`. Files: `app/about/page.tsx`, `app/terms/page.tsx`, `app/privacy/page.tsx`, `app/mena/page.tsx`, `app/brief/[slug]/page.tsx`, possibly small additions to `lib/copy.ts`. Pre-commit: `npm run build`.

---

- [x] 11. Metadata + RSS feed description + OG image text + .env.example documentation debt

  **What to do**:
  - `app/layout.tsx` metadata block (root metadata): update `description` (currently "Stay informed in seconds. Get concise news briefings that cut through the noise.") and `keywords` array — lead description with evidence-first framing. Don't change `title.template` "%s · Distiller"; the brand is consistent.
  - `app/page.tsx`, `app/RefinedFeed/layout.tsx`, `app/pricing/page.tsx`, `app/about/page.tsx`, `app/terms/page.tsx`, `app/privacy/page.tsx`, `app/mena/page.tsx`, `app/auth/login/page.tsx`, `app/auth/signup/page.tsx`, `app/auth/forgot-password/page.tsx`, `app/dashboard/\*` — update all per-route `metadata.description` strings to align with evidence-first tone (e.g., pricing: "Simple, transparent pricing for Distiller — evidence-first news intelligence.").
  - `app/feed.xml/route.ts`: update the RSS feed channel title and description. Currently "Distiller — AI News Intelligence" / "AI-powered news summaries with 3 concise bullets per article, grounded by RAG and embeddings." Tighten to "Distiller — Evidence-First News Intelligence" / "Source-grounded briefs: every claim linked to its source snippet, every brief structured as 3 concise bullets + insight + conclusion."
  - `app/api/og/route.tsx`: update the OG image text labels (Title, description default strings) to align with evidence-first language.
  - `.env.example`: ADD the 9 documented env-variable debt items surfaced by Metis: `STRIPE_PRO_PRICE_ID`, `STRIPE_TEAM_PRICE_ID`, `CRON_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `ARTICLE_TEXT_PROXY_BASE`, `GITHUB_REPOSITORY`, `GITHUB_TOKEN`/`GITHUB_API_TOKEN`, `EMAIL_PROVIDER`. Each with a sensible default placeholder like `your_x_here`. Skip `ARTICLE_TEXT_PROXY_BASE` if Wave 3 has already deleted its consumer (it's a full-text-related proxy); verify the consumer status at execution time.
  - **Must NOT do**: change URLs, robots directives, or canonical links. Don't invent keywords outside the actual product scope.

  **Recommended Agent Profile**:
  - **Category**: `quick` — sweeping string + .env docs update; mechanical.
  - **Skills**: []

  **Parallelization**: Can Run In Parallel — YES. Wave 2 / Group B. Blocks: F1. Blocked By: Task 2 (COPY).

  **References**:
  - `lib/copy.ts` COPY.metadata.\* — new additive keys for descriptions
  - All route metadata exports (file paths per research findings)
  - WHY: metadata consistency = SEO alignment with positioning; .env.example debt avoidance = future deployment friction.

  **Acceptance Criteria**:
  - [ ] All 11+ page metadata blocks updated
  - [ ] RSS channel title + description updated
  - [ ] OG image text updated
  - [ ] .env.example documents 9 previously-undocumented env vars (8 if ARTICLE_TEXT_PROXY_BASE is dead post-Wave-3)
  - [ ] `npm run build` passes
  - [ ] `grep -i "AI-powered news" app/feed.xml/route.ts app/layout.tsx` returns 0 matches (replace with evidence-first)

  **QA Scenarios**:
  ```
  Scenario: Metadata descriptions lead with evidence-first
    Tool: Bash (grep)
    Steps:
      1. grep -rnAI "metadata.description\|description: \"" app/ | grep -v "node_modules"
      2. Sample 3 page-level metadata blocks; assert each contains "evidence" or "grounded" or "source"
    Expected Result: Description fields consistently aligned
    Evidence: .sisyphus/evidence/task-11-metadata-sweep.txt

  Scenario: RSS channel description aligned
    Tool: Bash (curl the feed)
    Steps:
      1. npm run dev; curl http://localhost:3000/feed.xml
      2. Assert the response contains `<title>Distiller — Evidence-First News Intelligence</title>` (or close variant per Task 2 CONS)
      3. Assert description contains "source-grounded" or "evidence-first"
    Expected Result: Feed description leads with evidence-first
    Evidence: .sisyphus/evidence/task-11-rss-feed.xml

  Scenario: .env.example documents all env vars referenced in code
    Tool: Bash (grep + diff)
    Steps:
      1. Collect every `process.env.X` reference across `app/ lib/ services/ components/` and write to a set
      2. Collect every key in .env.example
      3. Assert: set difference (code-references minus .env.example-entries) is empty
    Expected Result: No env var referenced in code is missing from .env.example
    Failure Indicators: Any code-referenced env var missing from .env.example
    Evidence: .sisyphus/evidence/task-11-env-parity.md
  ```

  **Evidence to Capture**:
  - [ ] `task-11-metadata-sweep.txt`
  - [ ] `task-11-rss-feed.xml`
  - [ ] `task-11-env-parity.md`

  **Commit**: YES — with Wave 2. Message: `refactor(seo): evidence-first metadata + RSS + OG; docs(env): document 9 missing env vars`. Files: 11+ page metadata exports, `app/feed.xml/route.ts`, `app/api/og/route.tsx`, `.env.example`. Pre-commit: `npm run build`.

---

- [x] 12. PricingSection + dashboard/billing + landing Free vs Pro all render from lib/plans.ts; Stripe checkout uses stripePriceId

  **What to do**:
  - `components/pricing/PricingSection.tsx`: REPLACE the hardcoded tiers array (lines ~22-75) with an import from `lib/plans-display.ts` filtering `publiclyVisible === true`. Map each tier's `tagline/cta/ctaHref/features/highlight/priceMonthly/priceAnnual/trialDays` to the existing JSX props. Preserve monthly/annual toggle behavior — compute priceAnnual display via the `periodAnnual` field.
  - `app/dashboard/billing/page.tsx`: replace the hardcoded plan-card array (lines ~113-127) with the same import. Use `PLAN_LIMITS_DISPLAY.filter(p => p.publiclyVisible)` OR `PLAN_LIMITS_DISPLAY[planId]` for the current-plan card.
  - `app/dashboard/page.tsx`: dashboard overview plan cards (lines ~106-108): same pattern.
  - `app/page.tsx` Free vs Pro comparison card (lines ~245-283): also reads from `lib/plans-display.ts`. (Coordinate with Task 8 to avoid double-implementation; Task 12 owns this comparison's data source.)
  - `app/api/stripe/checkout/route.ts` (~L19, L23, L95): replace `unit_amount: planConfig.price * 100` with retrieval via `stripe.prices.retrieve(planLimit.stripePriceId)` and pass the retrieved Price object as the line item. The route already reads `STRIPE_PRO_PRICE_ID`/`STRIPE_TEAM_PRICE_ID` into `priceId` props but doesn't yet use them authoritatively — wire the call to use the retrieved price. Handle missing env: if `stripePriceId` is undefined, fall back to `unit_amount: planConfig.price * 100` (current behavior) with `console.warn("Stripe Price ID missing for plan X — using hardcoded fallback. Configure environment.")` — guarantees no breakage if env unset.
  - **Must NOT do**: change pricing tiers, change prices, change Stripe webhook contract (only checkout call shape changes), change CMS-like consumer routes. Don't import `lib/plans.ts` (server-only) into PricingSection (client); use only `lib/plans-display.ts`.

  **Recommended Agent Profile**:
  - **Category**: `deep` — load-bearing refactor across 3-4 consumer files.
  - **Skills**: []

  **Parallelization**: Can Run In Parallel — YES. Wave 2 / Group B. Blocks: F1, F4. Blocked By: Task 3 (lib/plans-display.ts must exist).

  **References**:
  - `lib/plans-display.ts` Task 3 output — source-of-truth for UI tiers
  - `components/pricing/PricingSection.tsx` — primary consumer refactor
  - `app/dashboard/billing/page.tsx` ~L113-127 — secondary consumer
  - `app/dashboard/page.tsx` ~L106-108 — tertiary consumer
  - `app/page.tsx` ~L245-283 — landing comparison
  - `app/api/stripe/checkout/route.ts` ~L19, L23, L60 — Stripe hardcoded amounts to replace with stripePriceId
  - WHY: Single source of truth invariant requires all 4+ consumers to read from lib/plans-display; Stripe checkout completes the chain by eliminating the second hardcoded amounts file.

  **Acceptance Criteria**:
  - [ ] All 4 PricingSection/billing/dashboard/landing-consumer files import from `lib/plans-display.ts`; 0 hardcoded tier arrays remain
  - [ ] `ast_grep_search pattern 'unit_amount: $N * 100' app/api/stripe/checkout/route.ts` returns 0 primary-path matches (fallback acceptable if wrapped in env-missing check + warning log)
  - [ ] Pricing section renders: Free, Pro, Team (3 tiers visible)
  - [ ] `/pricing` page screenshot shows identical layout before/after (Tier labels, prices, features preserved)
  - [ ] Stripe checkout succeeds via `stripe.prices.retrieve` call (test in dev mode if Stripe test keys available)
  - [ ] `npm run build` + `npm run lint` pass

  **QA Scenarios**:
  ```
  Scenario: Single source — no hardcoded tiers left
    Tool: Bash (ast_grep_search)
    Steps:
      1. ast_grep_search --pattern '"$0": {"articlesPerMonth": $N}' app/ components/ lib/
      2. Assert: 0 matches outside lib/plans.ts (lib/plans-display.ts re-exports the values)
      3. ast_grep_search --pattern '0.65 + ragContext' lib/ai.ts (regression check, unrelated)
      4. ast_grep_search --pattern 'unit_amount: $N' app/api/stripe/checkout/route.ts
      5. Assert: 0 matches (or matches exist inside `console.warn` fallback block with documentation)
    Expected Result: Single source of truth verified
    Evidence: .sisyphus/evidence/task-12-single-source-verified.txt

  Scenario: /pricing page renders all 3 public tiers correctly
    Tool: Playwright
    Steps:
      1. Navigate /pricing at 1280×800; light mode
      2. Count tier cards: assert equal to 3 (Free, Pro, Team — not API which is publiclyVisible=false)
      3. Assert each tier card shows: name + tagline + price + 4+ features from lib/plans-display
      4. Assert Pro card shows "7-day free trial" (since trialDays=7) and "Most popular" highlight
      5. Toggle to annual: assert Pro price changes (e.g., to "$86.40/yr" or similar annual)
      6. Repeat in dark mode at 1536×960
    Expected Result: UI parity with the Source of Truth
    Failure Indicators: Any tier card missing required features; toggle broken; price mismatch with lib/plans-display values
    Evidence: .sisyphus/evidence/task-12-pricing-tier-parity.png

  Scenario: Pricing flaw check — no Free tier claims "all 15 topics" (Bug from audit)
    Tool: Playwright + Bash
    Steps:
      1. Navigate to /pricing; locate Free tier card
      2. Assert textContent of feature list does NOT include "All 15 topics" (it should say "2 topics" or the lib/plans-display Free tier's actual value — Task 3 extension audit found PLAN_LIMITS.free.topics = 2)
    Expected Result: Claim accuracy: Free gets 2 topics per lib/plans.ts, not 15
    Failure Indicators: Free tier card shows "All 15 topics" (the Metis-surfaced discrepancy)
    Evidence: .sisyphus/evidence/task-12-free-tier-accuracy.png

  Scenario: Stripe checkout uses prices.retrieve
    Tool: Bash + curl
    Preconditions: STRIPE_TEST_SECRET_KEY or env mock available — if not, verify via static read of checkout route code only
    Steps:
      1. Read app/api/stripe/checkout/route.ts after the change
      2. Assert: code path references `planLimit.stripePriceId` and `stripe.prices.retrieve(...)` (no hardcoded unit_amount primary branch)
      3. If a fallback branch exists, assert it logs a warning and only runs when stripePriceId is undefined
    Expected Result: Stripe Price IDs in use; hardcoded amounts demoted to escape hatch
    Evidence: .sisyphus/evidence/task-12-stripe-prices-id-check.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-12-single-source-verified.txt`
  - [ ] `task-12-pricing-tier-parity.png`
  - [ ] `task-12-free-tier-accuracy.png`
  - [ ] `task-12-stripe-prices-id-check.txt`

  **Commit**: YES — with Wave 2. Message: `refactor(pricing): all consumers read from lib/plans-display; Stripe uses stripePriceId`. Files: `components/pricing/PricingSection.tsx`, `app/dashboard/billing/page.tsx`, `app/dashboard/page.tsx`, `app/page.tsx`, `app/api/stripe/checkout/route.ts`. Pre-commit: `npm run build && npm run lint`.

---

- [x] 13. Dashboard overview/billing/card usages of plan limits unified (defensive cleanup)

  **What to do**:
  - `app/dashboard/page.tsx`: usage card "{23 of 50 articles read · 27 remaining}" — these numbers should be derived from `PLAN_LIMITS[userPlan].articlesPerMonth` from `lib/plans.ts` (server-side). For a server component: import directly from `lib/plans.ts`. For Free tier display, use `50` from `PLAN_LIMITS.free.articlesPerMonth`. Don't hardcode `50` in JSX.
  - `app/dashboard/billing/page.tsx`: similar for plan feature comparison cards (Task 12 covers the tier cards; Task 13 covers the small status labels).
  - Anywhere else in `/app/dashboard/*` that references a plan-specific number (`50` articles/month for Free, `Unlimited` for Pro, `5` seats for Team), route the value through `lib/plans.ts` or `lib/plans-display.ts`. Use `ast_grep_search` to find hardcoded `50` literals in dashboard.
  - **Must NOT do**: implement authenticated-user plan-based route gating (this is explicitly out of scope per ADR guardrail).

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` — small refactor across dashboard files, requires careful value-by-value sweep.
  - **Skills**: []

  **Parallelization**: Can Run In Parallel — YES. Wave 2 / Group B (with Task 12 — they touch adjacent files; reconcile in commit). Blocks: F1. Blocked By: Task 3 (lib/plans-display).

  **References**:
  - `lib/plans.ts`/`lib/plans-display.ts` Task 3 output — source of values
  - `app/dashboard/page.tsx` ~L40-85 (stat cards + usage section)
  - WHY: dashboard numbers must come from lib/plans, not magic literals.

  **Acceptance Criteria**:
  - [ ] `ast_grep_search pattern '50' app/dashboard/page.tsx` returns only matches inside import paths + comments (no JSX literal 50)
  - [ ] Dashboard screenshot surfaces identical numbers as before (50, Pro upgrade CTAs, etc.) — zero visible regression
  - [ ] `npm run build` + `npm run lint` pass

  **QA Scenarios**:
  ```
  Scenario: Dashboard derives numerics from lib/plans only
    Tool: Bash (ast_grep_search)
    Steps:
      1. ast_grep_search --pattern '50' app/dashboard/page.tsx
      2. Filter for matches in JSX (not comments, not imports)
      3. Assert zero matches in JSX value positions
      4. Repeat for 5 (seat count) and Infinity (Pro usage)
    Expected Result: Dashboard rendering values sourced from lib/plans only
    Evidence: .sisyphus/evidence/task-13-dashboard-derived-numbers.txt

  Scenario: Dashboard renders identical before/after
    Tool: Playwright
    Preconditions: Mock-auth (or scaffold test user with Free plan)
    Steps:
      1. Navigate /dashboard at 1280×800 light mode
      2. Assert usage card shows "50 articles/month" quota label and "of 50 articles"
      3. Assert Pro plan card shows "$9" and Team shows "$29" — verify values via Page Object text query
      4. Screenshot before/after Task 13 commit (compare with Task 1 baseline)
    Expected Result: UI identical to baseline; only source-of-value changed
    Evidence: .sisyphus/evidence/task-13-dashboard-parity.png
  ```

  **Evidence to Capture**:
  - [ ] `task-13-dashboard-derived-numbers.txt`
  - [ ] `task-13-dashboard-parity.png`

  **Commit**: YES — with Wave 2. Message: `refactor(dashboard): derive plan numeric values from lib/plans.ts`. Files: `app/dashboard/page.tsx`, `app/dashboard/billing/page.tsx` (if overflow). Pre-commit: `npm run build && npm run lint`.

---

### WAVE 3 — Destructive removal (after Wave 1+2; safe removals now possible)

- [x] 14. Patch services/newsapi.ts to drop fetchFullArticleText call; use local text builder

  **What to do**:
  - Read `services/newsapi.ts` to find the call site that invokes `fetchFullArticleText` (likely in article enrichment).
  - Replace the `fetchFullArticleText(...)` invocation with a local text builder: `[article.title, article.description, article.content].filter(Boolean).join("\n\n")` — the standard format that `lib/rag.ts` buildRagContext already expects for `article.title/description/content` fields (per existing RAG contract this same join is internally used as the input). This means RAG will now operate on truncated NewsAPI content (the pre-existing format before the full-text extraction feature was added).
  - Strip NewsAPI `content` field truncation marker (`[+XXXX chars]`) using `lib/article-text-utils.ts:stripNewsApiTruncation` BEFORE feeding to RAG (preserves the existing utility — strip the marker so it doesn't appear as a token in embeddings). Note: this means `lib/article-text-utils.ts` is NOT deletable in this approach; revise Task 15 to keep `lib/article-text-utils.ts` (only delete `lib/article-text.ts`).
  - **Decision required**: Drop the assumption that removing server-side enrichment is regression-free. Sample 10 articles before+after (capture bullets from a BEFORE-commit run and an AFTER-commit run) and write a regression report. If RAG quality drops >20% (most articles falling to fallback bullets or fewer than 3 valid bullets), **escalate to Prometheus** before committing.
  - **Must NOT do**: build a new pipeline replacing fetchFullArticleText with another external fetch (jina.ai, Firecrawl, etc.). Local stdlib-only builder is the strategy.

  **Recommended Agent Profile**:
  - **Category**: `deep` — destructive to critical path; needs careful audit + escalate branch.
  - **Skills**: []

  **Parallelization**: Can Run In Parallel — with Task 16 (UI strip) but NOT with Task 15 (lib deletion which depends on routing patch). Sequential: T14 → T15 → T18. Wave 3 group.
  **Blocks**: Task 15 (deletion), Task 18 (entitlement closing passes; can proceed in parallel actually).
  **Blocked By**: Task 5 (audit).

  **References**:
  - `services/newsapi.ts` — fetchFullArticleText call site (research confirmed it exists)
  - `lib/rag.ts:buildRagContext` — standard 3-field join for RAG input
  - `lib/article-text-utils.ts:stripNewsApiTruncation` — utility to keep
  - WHY: the replacement preserves existing RAG contract shape while removing the external fetch.

  **Acceptance Criteria**:
  - [ ] `services/newsapi.ts` no longer imports `fetchFullArticleText` from `lib/article-text.ts`
  - [ ] Local text builder used: `[article.title, article.description, stripNewsApiTruncation(article.content)]`
  - [ ] 10-article regression report in `.sisyphus/evidence/task-14-rag-regression.md`; if >20% drop → Prometheus flag
  - [ ] `npm run build` + `npm run lint` pass
  - [ ] API smoke: `curl 'http://localhost:3000/api/feed?country=us&category=world'` returns 200 with `articles[].summary.bullets` arrays of length 3

  **QA Scenarios**:
  ```
  Scenario: Local text builder works without external fetch
    Tool: Bash (curl + jq)
    Preconditions: npm run dev running; NEWSAPI_KEY set OR demo fallback works
    Steps:
      1. curl -s 'http://localhost:3000/api/feed?country=us&category=world&page=1&pageSize=6' | jq '.articles[0].summary.bullets'
      2. Assert: returns an array of 3 string elements
      3. Assert: articles return 200 (no 500)
      4. Repeat for pages 1-3 if pagination works
    Expected Result: Feed pipeline healthy without full-text enrichment
    Failure Indicators: Empty bullets; fallback to "Open the original story..." line; HTTP 500
    Evidence: .sisyphus/evidence/task-14-feed-smoke.json

  Scenario: 10-article RAG quality regression measurement
    Tool: Bash + diff judgment
    Preconditions: Capture BEFORE-commit sample ()
    Steps:
      1. Define 10 fixed sample articles (use lib/demo-articles.ts demo entries + a known NewsAPI top-headlines query like category=tech page=1)
      2. Before Task 14 commit: capture each article's bullets from feed response; save to evidence/task-14-before-bullets.json
      3. Apply Task 14 commit
      4. After: capture each article's bullets; save to evidence/task-14-after-bullets.json
      5. Manually inspect diff: count articles where bullets dropped out / fallback fired
      6. Compute regression percentage: articles-with-degradation / 10
      7. If regression > 20%, write `REGRESSION ESCALATION` flag in evidence and stop
    Expected Result: ≤20% degradation allowed; bullets remain readable + evidence-linked
    Failure Indicators: >20% regression → escalate to Prometheus before Wave 3 continues
    Evidence: .sisyphus/evidence/task-14-rag-regression.md + task-14-before-bullets.json + task-14-after-bullets.json

  Scenario: Build + lint pass
    Tool: Bash
    Steps: npm run build && npm run lint → assert both succeed
    Evidence: .sisyphus/evidence/task-14-build-lint.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-14-feed-smoke.json`
  - [ ] `task-14-rag-regression.md`, `task-14-before-bullets.json`, `task-14-after-bullets.json`
  - [ ] `task-14-build-lint.txt`

  **Commit**: YES — with Wave 3. Message: `refactor(newsapi): replace fetchFullArticleText with local text builder; RAG still operates on truncated NewsAPI content`. Files: `services/newsapi.ts`. Pre-commit: `npm run build && npm run lint`.

---

- [x] 15. Delete /api/news/full-text route + lib/article-text.ts + unregister @mozilla/readability + happy-dom

  **What to do**:
  - DELETE file `app/api/news/full-text/route.ts` (and its directory).
  - DELETE file `lib/article-text.ts` (only contains `fetchFullArticleText`, `buildLocalArticleText`, kept-separated full-text logic).
  - KEEP `lib/article-text-utils.ts` — `stripNewsApiTruncation` is reused by Task 14 in services/newsapi.ts. Do NOT delete it.
  - Remove `@mozilla/readability` from `dependencies` in `package.json`.
  - Remove `happy-dom` from `dependencies` in `package.json`.
  - Remove `@types/bcryptjs` only if it was specifically tied to readability usage audit (likely NO — `@types/bcryptjs` is for the auth `bcryptjs` dep which stays; double-check before removal).
  - Run `npm install` to recompute package-lock without the removed deps.
  - Run `npm run build` to confirm zero import errors. If `services/newsapi.ts` still references the deleted lib (Task 14 patch incomplete), fix it.
  - Preserve `userArticleUsage` table — no schema changes. The `reserveMonthlyArticleUsage` function in `lib/db/queries.ts:127` MAY become unused if it was only called by /api/news/full-text; verify with grep — if unused outside the route, mark for Task P1 Ponytail review (don't delete in this task; preserve for rollback safety).
  - **Must NOT do**: drop the `userArticleUsage` table (preserved per ADR-002). Delete unused `reserveMonthlyArticleUsage` in this task.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` — destructive, careful dep unregistration + import resolution sweep.
  - **Skills**: []

  **Parallelization**: Can Run In Parallel — with Task 16 (UI strip) but NOT with Task 14 (must come after). Wave 3 group.
  **Blocks**: F1, F2, F4.
  **Blocked By**: Task 14, Task 5 (audit).

  **References**:
  - `app/api/news/full-text/route.ts` — to delete
  - `lib/article-text.ts` — to delete
  - `lib/article-text-utils.ts` — to KEEP (Task 14 uses it)
  - `package.json` — dep removal
  - WHY: destructive cleanup of feature; preserves tables and the truncation-strip utility (still used by RAG).

  **Acceptance Criteria**:
  - [ ] `app/api/news/full-text/route.ts` deleted
  - [ ] `lib/article-text.ts` deleted
  - [ ] `@mozilla/readability` removed from package.json deps
  - [ ] `happy-dom` removed from package.json deps
  - [ ] `lib/article-text-utils.ts` preserved
  - [ ] `npm install` succeeds
  - [ ] `npm run build` succeeds with zero TypeScript errors
  - [ ] `grep -ri "fetchFullArticleText\|buildLocalArticleText\|/api/news/full-text" app/ lib/ components/ types/` returns 0 matches

  **QA Scenarios**:
  ```
  Scenario: Files actually deleted + build still succeeds
    Tool: Bash
    Steps:
      1. ls -l app/api/news/full-text/route.ts lib/article-text.ts — assert "No such file" responses
      2. grep "@mozilla/readability\|happy-dom" package.json — assert 0 matches
      3. npm install (re-runs on modified package.json) — assert success
      4. npm run build — assert success, zero TS errors
    Expected Result: File system clean; build green; deps removed
    Failure Indicators: Build breaks on missing import (Task 14 didn't fully patch); lint fails on stale references
    Evidence: .sisyphus/evidence/task-15-deletion-verified.txt

  Scenario: No orphans to deleted symbols
    Tool: Bash (grep)
    Steps:
      1. grep -ri "fetchFullArticleText\|buildLocalArticleText\|stripNewsApiTruncation\|ArticleFullTextResponse" . --include="*.ts" --include="*.tsx"
      2. Assert matches are ONLY: stripNewsApiTruncation is still declared in lib/article-text-utils and used in services/newsapi.ts; nothing fetches the deleted routes
    Expected Result: Zero orphaned references to deleted functions (stripNewsApiTruncation OK since it's preserved)
    Evidence: .sisyphus/evidence/task-15-orphan-audit.txt

  Scenario: /api/news/full-text 404s (route truly gone)
    Tool: Bash (curl)
    Preconditions: npm run dev
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/news/full-text -H "Content-Type: application/json" -d '{"article":{}}'
      2. Assert 404 (route removed)
    Expected Result: 404 response
    Evidence: .sisyphus/evidence/task-15-route-404.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-15-deletion-verified.txt`
  - [ ] `task-15-orphan-audit.txt`
  - [ ] `task-15-route-404.txt`

  **Commit**: YES — with Wave 3. Message: `remove(full-text): delete /api/news/full-text route + lib/article-text.ts + unregister @mozilla/readability + happy-dom`. Files: `app/api/news/full-text/route.ts` (deleted), `lib/article-text.ts` (deleted), `package.json`. Pre-commit: `npm install && npm run build && npm run lint`.

---

- [x] 16. Strip "See more article text" / "Full article text" UI from NewsArticleModal.tsx

  **What to do**:
  - `components/NewsArticleModal.tsx`: remove the "See more article text" / "Hide article text" button toggle (`aria-expanded={showFullText}`, `aria-controls="full-article-text"` references). Remove the full-text display section (`#full-article-text` div). Remove the `loading=fullTextLoading` state machine and the `aria-busy` binding. Remove the chat-only "Loaded from the original article page." / "Loaded through a reader proxy..." / "Loaded from a cached article copy..." notice strings.
  - Keep the rest of the modal intact: image, summary bullets, AI insight, chat (article chat for question-answering over retrieved snippets - independent of full-text), like/share/save actions. The chat feature still works because it operates on the article's summary + RAG snippets from `/api/news/chat` (an existing endpoint that operates on RAG snippets, NOT the deleted full-text endpoint).
  - **Must NOT do**: remove the chat functionality — the chat is a separate endpoint (`/api/news/chat`) that operates on retrieved snippets, not the deleted full-text. Verify this by reading the modal's fetch the chat endpoint (`/api/news/chat`, not `/api/news/full-text`).

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering` — UI excision in a complex client component.
  - **Skills**: [`tailwind-css-patterns`] (optional)

  **Parallelization**: Can Run In Parallel — YES with Task 14 (services/newsapi patch). Both indep. Wave 3 group.
  **Blocks**: F1, F3. **Blocked By**: Task 5 (audit verification that only NewsArticleModal uses /api/news/full-text).

  **References**:
  - `components/NewsArticleModal.tsx` — file to edit (mutated substantially)
  - `lib/ai.ts` CHAT_SYSTEM_PROMPT — confirms chat operates over summary + retrieved snippets, separate from /api/news/full-text
  - `app/api/news/chat/route.ts` — separate chat endpoint (KEEP)
  - WHY: full-text removal touches this file surface; chat stays.

  **Acceptance Criteria**:
  - [ ] "See more article text" / "Hide article text" no longer rendered
  - [ ] The `#full-article-text` element doesn't exist
  - [ ] `aria-expanded` and `aria-controls` referencing fullText removed (lubed grep for "full-text" in modal returns 0)
  - [ ] Chat feature still works (Playwright test: type a question, click Send, response renders)
  - [ ] `npm run build` + `npm run lint` pass
  - [ ] Modal renders correctly at 360/768/1280/1536 in both modes — verify via Playwright screenshots

  **QA Scenarios**:
  ```
  Scenario: Full-text UI removed from modal
    Tool: Playwright
    Preconditions: npm run dev; set up demo article modal can open (visit /RefinedFeed, click article card)
    Steps:
      1. Navigate /RefinedFeed, click first DistilledCard to open NewsArticleModal
      2. Assert: NO element with text "See more article text" or "Hide article text" present
      3. Assert: NO element with id="full-article-text" present
      4. Screenshot modal at 1280×800 in light + dark
    Expected Result: Modal shows summary + chat + actions; no full-text loader or excerpt
    Failure Indicators: "See more" button still rendered; old aria-expanded/bindings still present
    Evidence: .sisyphus/evidence/task-16-full-text-ui-removed.png

  Scenario: Chat with article still works
    Tool: Playwright
    Preconditions: Modal open (from prior scenario), NVIDIA_BUILD_API_KEY configured
    Steps:
      1. Locate chat textarea (selector "#news-question" or label sr-only "Chat with Distiller")
      2. Type "What does this article imply about market impact?"
      3. Click send button
      4. Wait up to 30s for response to render in chat container
      5. Assert: response text is non-empty (not an error fallback) — len > 50 chars
    Expected Result: Chat returns grounded response over article snippets (without full text)
    Failure Indicators: Error message response; 429 rate limit; response empty string
    Evidence: .sisyphus/evidence/task-16-chat-still-works.png

  Scenario: Modal responsive at 4×2 viewports
    Tool: Playwright
    Steps:
      1. Open modal at each of 360, 768, 1280, 1536 in both modes (8 captures)
      2. Assert: modal is scrollable; close button visible; chat textarea visible without horizontal scroll
    Expected Result: Modal responsive at all breakpoints
    Evidence: .sisyphus/evidence/task-16-modal-all-viewports/*.png
  ```

  **Evidence to Capture**:
  - [ ] `task-16-full-text-ui-removed.png`
  - [ ] `task-16-chat-still-works.png`
  - [ ] `task-16-modal-all-viewports/*.png` (8 captures)

  **Commit**: YES — with Wave 3. Message: `remove(news-article-modal): full-text extraction UI; chat retains RAG-snippet-grounding`. Files: `components/NewsArticleModal.tsx`. Pre-commit: `npm run build && npm run lint`.

---

- [x] 17. Remove distillerScore from types + relabel confidence honestly with tooltip

  **What to do**:
  - `lib/demo-articles.ts`: remove the `distillerScore` field from each demo article's `summary` object. The `DistilledSummary` type also declares this field per Task 4 audit findings — verify by reading `types/news.ts` (or wherever `DistilledSummary` is declared). If `distillerScore?: number` exists on the type, remove it.
  - `components/DistilledCard.tsx`: REMOVE the `Score {distillerScore}` rendering (whatever line shows it). KEEP the `{Math.round(confidence * 100)}% confidence` rendering but change the label from "confidence" (ambiguously mistaken for truthfulness) to "RAG retrieval confidence" or "Source coverage" — use the COPY.scoreTooltip constant introduced by Task 4. Add a tooltip element (an accessible `title` attribute on the `<span>` rendering the value, or a small `<span aria-describedby="confidence-tooltip">` group with tooltip popover — simpler is `title="..."). Per ADR-004, no new UI breakdown component is built; only a `title` attribute or a small accessible popover. Recommended: a small info icon (e.g., lucide `Info` icon) with `aria-label="What RAG retrieval confidence means"` and a `title` attribute set to COPY.scoreTooltip.
  - `components/NewsArticleModal.tsx`: same change — remove distillerScore if present, relabel confidence.
  - `app/article/[id]/page.tsx`: relabel `{Math.round(confidence * 100)}% confidence` similarly; remove any `distillerScore` rendering if present.
  - REMOVE the fake testimonial "Sarah K. ML Researcher" "Distiller Score is genius" claim — Task 8 handles landing removal; here we confirm it's gone across the whole repo with grep.
  - **Must NOT do**: build a "score breakdown" UI component. The score is honest labeling only.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` — type changes + component edits; cross-file.
  - **Skills**: []

  **Parallelization**: Can Run In Parallel — YES with Task 16. Wave 3 group.
  **Blocks**: F1, F3. **Blocked By**: Task 4 (score audit + COPY.scoreTooltip).

  **References**:
  - `lib/copy.ts` — ADD the `scoreTooltip` key if Task 4 hasn't (or read Task 4's note that it did)
  - `lib/demo-articles.ts` — drop distillerScore from each mock article summary
  - `types/news.ts` (DistilledSummary type) — remove optional distillerScore field if present (parallel-safe; type narrowing)
  - `components/DistilledCard.tsx` ~L Anthropic tag, current `{Math.round(confidence * 100)}% confidence` + `Score {distillerScore}` lines
  - `components/NewsArticleModal.tsx` — same confidence line
  - `app/article/[id]/page.tsx` ~L 233 "{Math.round(confidence * 100)}% confidence"
  - `lib/ai.ts` — confidence formula documented by Task 4
  - WHY: enforced removal + honest relabeling.

  **Acceptance Criteria**:
  - [ ] `grep -ri "distillerScore" types/ components/ lib/ app/` returns 0 matches
  - [ ] `grep -ri "Distiller Score" .` returns 0 matches
  - [ ] All card/modal/article surfaces rendering `confidence` show: the numeric `{Math.round(confidence * 100)}%` PLUS a tooltip string set to `COPY.scoreTooltip` (sample tooltips: e.g., `title="RAG retrieval confidence: how many source snippets grounded this summary. Does NOT measure source quality."`)
  - [ ] No `distillerScore` references in types or demo data
  - [ ] `npm run build` + `npm run lint` pass

  **QA Scenarios**:
  ```
  Scenario: Distiller Score string completely removed
    Tool: Bash (grep)
    Steps:
      1. grep -ri "Distiller Score\|distillerScore" . --include="*.ts" --include="*.tsx"
      2. Assert: 0 matches
    Expected Result: Invented score brand purged from entire repo
    Failure Indicators: any match found in app/, components/, lib/, types/
    Evidence: .sisyphus/evidence/task-17-score-brand-purged.txt

  Scenario: confidence label relabeled + tooltip present
    Tool: Playwright
    Preconditions: demo articles visible on /RefinedFeed
    Steps:
      1. Navigate /RefinedFeed; wait for cards to hydrate
      2. Locate first DistilledCard; look for the confidence label text — assert contains "retrieval" OR "coverage" OR "RAG"
      3. Inspect the label's tooltip attribute (`title` or `aria-describedby`)
      4. Assert: tooltip text present AND contains words from COPY.scoreTooltip (e.g., "RAG" + "retrieval" + "Does NOT measure")
      5. Hover element; verify tooltip becomes visible
      6. Screenshot
    Expected Result: Score label honestly describes what confidence measures; tooltip explains the formula
    Failure Indicators: "confidence" label unchanged with no tooltip; or tooltip absent
    Evidence: .sisyphus/evidence/task-17-confidence-tooltip.png

  Scenario: Article page confidence header honestly labeled
    Tool: Playwright
    Steps:
      1. Navigate to a sample /article/<id>; locate the confidence percentage render
      2. Assert label includes "retrieval" or "coverage"
      3. Assert tooltip present
    Expected Result: Same relabel propagated to article route
    Evidence: .sisyphus/evidence/task-17-article-confidence-tooltip.png

  Scenario: Build + lint pass, demo articles still render
    Tool: Bash + Playwright
    Steps:
      1. npm run build && npm run lint → both succeed
      2. With NEWSAPI_KEY unset (demo fallback), curl /api/feed → articles render
      3. Demo articles DO NOT have "Score N" badge (distillerScore removed)
    Expected Result: No regression to demo fallback
    Evidence: .sisyphus/evidence/task-17-demo-no-score-badge.png
  ```

  **Evidence to Capture**:
  - [ ] `task-17-score-brand-purged.txt`
  - [ ] `task-17-confidence-tooltip.png`
  - [ ] `task-17-article-confidence-tooltip.png`
  - [ ] `task-17-demo-no-score-badge.png`

  **Commit**: YES — with Wave 3. Message: `refactor(score): remove distillerScore field + Demo data; relabel confidence as "RAG retrieval confidence" with accessible tooltip`. Files: `lib/demo-articles.ts`, `types/news.ts` (if applicable), `components/DistilledCard.tsx`, `components/NewsArticleModal.tsx`, `app/article/[id]/page.tsx`, possibly `lib/copy.ts` (already claimed in Task 4). Pre-commit: `npm run build && npm run lint`.

---

### WAVE 4 — Consolidation + responsive (after Wave 3 destructive removals)

- [x] 18. Consolidate guest feed gate from app/api/feed/route.ts:14-115 into lib/plans.ts

  **What to do**:
  - Read the current guest gate at `app/api/feed/route.ts:14-115`: an in-memory `Map<string, {count, resetAt}>` per IP, daily count of up to `50`, restricting guest topics to `World` and `Technology`.
  - Refactor: extract this entire gate logic into `lib/plans.ts` as a `checkGuestFeedAccess(ip: string): { ok: boolean, remaining: number }` function. The function's behavior is preserved: 50/day per IP, world+tech only. Persist cooldown in an in-memory cache (per-process) or use the existing Upstash Ratelimit (`lib/rate-limit.ts`) if it offers day-windows (likely NOT — Upstash sliding window is minutes/hours; daily quota tracking needs a Redis hash counter — for scope safety, keep in-memory Map but moved into lib/plans.ts to consolidate the source-of-truth).
  - The `app/api/feed/route.ts` file is updated to import `checkGuestFeedAccess` from `lib/plans.ts` and call it instead of duplicating the gate logic.
  - The allowed-topics list (`[{id: "world"}, {id: "tech"}]`) comes from `PLAN_LIMITS.guest.allowedTopics` (Task 3 extension).
  - **Must NOT do**: change guest behavior (50/day stays; world+tech only stays). Do NOT implement authenticated-user plan-based routing (explicitly out of scope per ADR). Do NOT replace in-memory Map with Upstash day-counter (scope-creep, unrelated to workstream).

  **Recommended Agent Profile**:
  - **Category**: `deep` — load-bearing refactor; touches critical feed path.
  - **Skills**: []

  **Parallelization**: After Wave 3 (Task 14 must be applied first so services/newsapi.ts doesn't reference the old gate dependency if shared). Wave 4 group.
  **Blocks**: F1, F4. **Blocked By**: Task 3 (lib/plans.ts guest field), Task 14.

  **References**:
  - `app/api/feed/route.ts:14-115` — gate to refactor
  - `lib/plans.ts` Task 3 output — `guestLimits` block, `checkGuestFeedAccess` to add
  - `lib/rate-limit.ts` — existing Upstash pattern for sliding window (NOT to use for daily quota)
  - WHY: completes ADR-003 single source of truth.

  **Acceptance Criteria**:
  - [ ] `lib/plans.ts` exports `checkGuestFeedAccess(ip: string)`
  - [ ] `app/api/feed/route.ts` imports + calls `checkGuestFeedAccess`; the in-memory `Map` is removed from the route file
  - [ ] Behavior preserved: 50 articles/day/enabled for guests (World + Tech only); return 429 after 50 with appropriate headers
  - [ ] `ast_grep_search pattern '50' app/api/feed/route.ts` returns 0 matches in literal value positions
  - [ ] `npm run build` + `npm run lint` pass
  - [ ] `curl http://localhost:3000/api/feed?country=us&category=world` (unauth) returns 200 with valid articles; cracking more than 50 (mock-saturate the counter to 50 first or document manual approach) returns 429

  **QA Scenarios**:
  ```
  Scenario: Single source verified; no parallel gate
    Tool: Bash (ast_grep_search)
    Steps:
      1. ast_grep_search --pattern '50' app/api/feed/route.ts
      2. Assert: 0 matches in literal positions outside imports + comments (count may appear in objects from lib/plans.ts imports)
      3. grep "new Map" app/api/feed/route.ts — assert 0 matches
      4. grep "GUEST_FREE_ARTICLES\|GUEST_ALLOWED_TOPICS" app/api/feed/route.ts — assert 0 matches (only in lib/news-options.ts or lib/plans.ts now)
    Expected Result: Parallel in-memory gate truly deleted; lib/plans.ts owns the logic
    Evidence: .sisyphus/evidence/task-18-gate-consolidated.txt

  Scenario: Guest feed behaves identically before/after
    Tool: Bash (curl)
    Preconditions: Clear server-side cache; npm run dev
    Steps:
      1. Loop 50 GET calls to /api/feed?country=us&category=world (HTTP) until 200 → 200 each
      2. Try the 51st call: assert HTTP 429 with appropriate error (e.g., "Guest daily limit exceeded")
      3. Try a guest-disallowed topic /api/feed?country=us&category=sports: assert specific rejection code
      4. Verify same behavior on a second IP (if possible to mock)
    Expected Result: Behavior parity before / after refactor
    Failure Indicators: 429 before 50 calls; or 200 returned on 51st call; topics not restricted correctly
    Evidence: .sisyphus/evidence/task-18-guest-behavior.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-18-gate-consolidated.txt`
  - [ ] `task-18-guest-behavior.txt`

  **Commit**: YES — with Wave 4. Message: `refactor(feed): consolidate guest gate into lib/plans.ts (50/day preserved, world+tech only)`. Files: `app/api/feed/route.ts`, `lib/plans.ts`. Pre-commit: `npm run build && npm run lint`.

---

- [x] 19. Add explicit 2xl: (1536 px) responsive compositions + container max-width strategy

  **What to do**:
  - Standardize shell container max-widths across content routes to `max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8`. Audit each existing max-width (max-w-7xl, max-w-6xl, max-w-5xl) and decide normalization. The editorial read benefits from width 1440; do not exceed it (readable line lengths at 1440 for body copy at 16px DM Sans is OK).
  - `app/RefinedFeed/page.tsx` feed grid: bump from `lg:grid-cols-2` to `lg:grid-cols-2 2xl:grid-cols-3` (3 columns at 1536).
  - `app/dashboard/layout.tsx`: desktop sidebar widens at 2xl from `w-64` to `2xl:w-72`; main content area scales correspondingly.
  - `app/page.tsx` hero: scale up headline scale at 2xl (`xl:text-7xl 2xl:text-8xl` per existing pattern) — calibrate to maintain readability.
  - `app/pricing/page.tsx`: 2-column tiers layout → `lg:grid-cols-3 2xl:gap-8` for breathing room.
  - `app/about/page.tsx` and `app/mena/page.tsx`: add 2xl: wider-measure paragraphs; keep readable line lengths with `2xl:max-w-3xl`.
  - **Must NOT do**: add 2xl: where it doesn't add value (e.g., short auth/login forms). Don't introduce widths > 1440 px. Per ADR-006.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering` — responsive Tailwind patterns.
  - **Skills**: [`tailwind-css-patterns`]
    - `tailwind-css-patterns`: break-point strategy rules + grid composition patterns.

  **Parallelization**: Can Run In Parallel — YES. Wave 4 group.
  **Blocks**: F1, F3. Blocked By: None (additive).

  **References**:
  - `app/RefinedFeed/page.tsx` ~`grid gap-5 lg:grid-cols-2` — to add 2xl
  - `app/dashboard/layout.tsx` sidebar widths
  - `app/page.tsx` hero scale patterns
  - WHY: user brief requested explicit 1536 treatment; ADR-006 confirms.

  **Acceptance Criteria**:
  - [ ] At least 5 pages demonstrate 2xl: explicit composition
  - [ ] `grep -rn "2xl:" app/` returns ≥5 matches across 5 distinct files
  - [ ] `grep -rn "max-w-\[1440\|max-w-screen-2xl" app/ components/` returns ≥1 match (or shell component standardizes)
  - [ ] `npm run build` + `npm run lint` pass
  - [ ] Playwright at 1536×960 shows ≥3 columns on /RefinedFeed; no horizontal scroll; visible breathing room vs 1280

  **QA Scenarios**:
  ```
  Scenario: 2xl: classes present across key pages
    Tool: Bash (grep)
    Steps:
      1. grep -rn "2xl:" app/ — count distinct file paths
      2. Assert at least 5 distinct page files contain 2xl: classes
      3. Identify each: app/RefinedFeed/page.tsx, app/dashboard/layout.tsx, app/page.tsx, app/pricing/page.tsx, app/about/page.tsx, app/mena/page.tsx
    Expected Result: Editorial-wide 2xl composition visible
    Evidence: .sisyphus/evidence/task-19-2xl-coverage.txt

  Scenario: Visual density improvement at 1536px (no horizontal scroll)
    Tool: Playwright
    Preconditions: npm run dev
    Steps:
      1. Set viewport 1536×960; navigate /RefinedFeed light mode
      2. Assert article cards render in 3 columns (count cards per row OR check window.getComputedStyle on grid container for grid-template-columns 3-fr units repeat)
      3. Assert no horizontal scrollbar (page viewport)
      4. Repeat at 360×800 — assert SINGLE column (regression check)
      5. Repeat at 1280×800 — assert 2 columns (regression check)
      6. Screenshot /dashboard at 1536 sidebar width assertion + /pricing at 1536
    Expected Result: 2xl: explicitly widens layout without breaking smaller breakpoints
    Failure Indicators: Horizontal scroll at 360 OR too many columns at 1280
    Evidence: .sisyphus/evidence/task-19-2xl-responsive-*.png

  Scenario: Build + lint pass
    Tool: Bash
    Evidence: .sisyphus/evidence/task-19-build-lint.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-19-2xl-coverage.txt`
  - [ ] 4 viewports × 2 modes × 3 pages screenshots
  - [ ] `task-19-build-lint.txt`

  **Commit**: YES — with Wave 4. Message: `feat(responsive): explicit 2xl treatment + container max-width 1440 strategy`. Files: 6+ pages + shell. Pre-commit: `npm run build && npm run lint`.

---

- [x] 20. A11y cleanup: AskTheNewsForm label + light-mode focus-ring token audit + image strategy

  **What to do**:
  - `components/AskTheNewsForm.tsx`: add a real `<label htmlFor="distiller-search-hero" className="sr-only">Search the news</label>` paired with `<input id="distiller-search-hero">`. Move placeholder to keep current UX (label is screen-reader only).
  - Sweep components for any other input missing `<label htmlFor>` — find via `grep -A2 "<input\|<textarea"` paired with absence of preceding `htmlFor`. Fix obvious cases following the same pattern (NewsAssistant already has labels per audit).
  - Light-mode focus ring audit: confirm global `:focus-visible` in `app/globals.css:127-193` works in BOTH light and dark modes (Task 6 already fixed button ring; this task sweeps inputs, textareas, links). Each interactive element should show a visible 4px ring at 2px background offset, in both modes.
  - Image strategy decision: AGENTS.md mention of 35+ `images.remotePatterns` in `next.config.mjs` — currently UNUSED (no `next/image` import). Two paths — pick ONE based on Ponytail principle ("simplest safe"):
    - **Path A (Ponytail preferred)**: Remove `images.remotePatterns` from `next.config.mjs` AND remove related experimental config; remove `sharp` dep if unused. Keep raw `<img>` tags. Zero new behavior, smaller config surface.
    - **Path B**: Migrate all 3 native `<img>` usages (`app/article/[id]/page.tsx:241`, `components/NewsArticleModal.tsx:296`, `components/UserNav.tsx:74`) to `next/image`. Adds blur placeholder + responsive srcset. Larger scope; needs fallback for articles with no imageUrl.
    - Per Ponytail ladder: standard/runtime capability (Path B uses next/image which is a platform feature) BUT existing project dependency (raw `<img>` already works); smallest local implementation is Path A. **Pick Path A** unless high-volume image traffic motivates Path B.
  - **Must NOT do**: introduce decorative images, real-player hosts, or article-image-first-call-time-critical features. The choice is conservative.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering` — a11y fixes + config cleanup.
  - **Skills**: [`tailwind-css-patterns`]
    - focus-ring regime is Tailwind utilities; relevant.

  **Parallelization**: Can Run In Parallel — YES. Wave 4 group.
  **Blocks**: F1, F2. Blocked By: None.

  **References**:
  - `components/AskTheNewsForm.tsx` — fix missing label
  - `app/globals.css` `:focus-visible` global — verify works in light
  - `next.config.mjs` `images.remotePatterns` — strip if Path A
  - `package.json` `sharp` dep — strip if Path A AND unused
  - WHY: a11y compliance + config simplification per Ponytail.

  **Acceptance Criteria**:
  - [ ] `components/AskTheNewsForm.tsx` has `<label htmlFor="distiller-search-hero" ...>` paired with `<input id="distiller-search-hero">`
  - [ ] `grep -A2 "<input\|<textarea"` (in components/: blind sweep) shows paired labels — manually verify 0 missing pairs
  - [ ] Light-mode focus ring visible on all interactive elements (Playwright prove at light + dark, 3 elements each)
  - [ ] Path A or Path B chosen; if Path A: `next.config.mjs` remotePatterns reduced to zero (or only domains actually used by remaining `<img>` srcs)
  - [ ] `npm run build` + `npm run lint` pass
  - [ ] Lighthouse accessibility score ≥ 95 on landing (run via Playwright)

  **QA Scenarios**:
  ```
  Scenario: AskTheNewsForm accessible label
    Tool: Playwright
    Steps:
      1. Navigate / at 1280×800 light mode
      2. Locate input with id="distiller-search-hero"
      3. Assert `<label htmlFor="distiller-search-hero" className="sr-only">` precedes it in DOM
      4. Tab to the input — assert focus ring visible
      5. Use an a11y audit step (axe-core via playwright) — verify zero violations on the input
    Expected Result: Input has associated label and accessible focus ring
    Evidence: .sisyphus/evidence/task-20-askthenews-a11y.png

  Scenario: Lighthouse a11y score ≥ 95 on landing
    Tool: Playwright (lighthouse mobile/desktop)
    Steps:
      1. Run Lighthouse mobile on /; capture accessibility score
      2. Assert ≥ 95
      3. List remaining issues; fix obvious ones (color contrast on muted-foreground lorem-ipsum text)
    Expected Result: Score ≥ 95
    Evidence: .sisyphus/evidence/task-20-lighthouse-a11y.json

  Scenario: Image strategy executed
    Tool: Bash
    Steps:
      1. If Path A: Assert `next.config.mjs` has empty or commented remotePatterns; `sharp` removed from package.json deps if previously unused
      2. If Path B: Assert `next/image` imports appear in 3 files (article/[id], NewsArticleModal, UserNav); preview blur placeholders present
      3. Run npm run build; assert success
    Expected Result: Strategy chosen and executed with build passing
    Evidence: .sisyphus/evidence/task-20-image-strategy.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-20-askthenews-a11y.png`
  - [ ] `task-20-lighthouse-a11y.json`
  - [ ] `task-20-image-strategy.txt`

  **Commit**: YES — with Wave 4. Message: `fix(a11y): AskTheNewsForm label association; perf: remove unused remotePatterns config (Path A)`. Files: `components/AskTheNewsForm.tsx`, `next.config.mjs`, `package.json` (sharp removal conditional). Pre-commit: `npm run build && npm run lint`.

---

- [x] 21. Ponytail cleanup wave P1 — ranked simplification review of the completed diff

  > Executes the installed Ponytail skill on the completed diff from Waves 1-4. PROVIDES a ranked deletion/simplification list. Applies small safe patches. Escalates contract/architecture changes back to Prometheus.

  **What to do**:
  - Use the `ponytail` skill's review methodology on the git diff spanning the executed Waves 1-4:
    - Optional sanity check: run `ponytail-review` slash command targeting the diff.
    - Else: apply the skill's deletion/simplification review manually using the principles: standard/runtime capability → existing project dependency → small local implementation → new dependency/abstraction only when justified by measured need.
  - Hunt specifically for:
    - Unnecessary wrappers, repositories, factories, hooks, contexts, state stores, adapters, or configuration introduced by the work.
    - Duplicated server/client state (e.g., lib/plans.ts and lib/plans-display.ts may be over-separation — assess whether the split is justified or collapsible).
    - Avoidable client components: are there components freshly marked "use client" that could be server components?
    - Repeated queries / N+1 reads / over-fetching in the modified files.
    - New dependencies introduced by this plan that could be replaced by stdlib / current libs / SQL / a simple function. (Probably none — but verify.)
    - Speculative generic code (e.g. premature PlanDisplay abstraction).
    - Tests coupled to implementation — none introduced (plan has no unit tests) — note this for future.
  - Apply the smallest SAFE patch when the simplification is unambiguous (e.g., inline a function used once; drop an unnecessary wrapper). DO NOT APPLY:
    - Contract changes (function signature that consumers touch via API)
    - Architecture changes (split/merge modules)
    - Brand-new abstractions tied to a real measured need (these are fine to keep)
  - Escalate contract/architecture changes to a new Prometheus planning session via evidence file `.sisyphus/evidence/task-ponytail-escalation.md`.
  - Compute before/after metrics if any patch applied: `npm run build` time, `npm run lint` clean, app bundle size (estimate via `.next/static` directory listing), RSS feed fetch latency (use `curl -w %{time_total}`).
  - DO NOT weaken: authorization, validation, safe errors, accessibility, evidence provenance, migrations (we made none), idempotency, observability, useful tests, rollback path.
  - **Must NOT do**: introduce new dependencies. Remove useful tests (none to remove — we have none). Remove the entitlement single source-of-truth split if it has measured need (likely keep split as split is justified by server-only boundary).

  **Recommended Agent Profile**:
  - **Category**: `deep` — judgmental review of cross-cutting concerns; needs big-picture + concrete fix.
  - **Skills**: [`ponytail`, `ponytail-review`]
    - `ponytail`: provides the deletion/simplification ladder and discipline.
    - `ponytail-review`: specific code-review-shaped invocation.

  **Parallelization**: After F1-F4 pass AND user "okay". Sequential.
  **Blocks**: Final acceptance of the workstream. **Blocked By**: F1, F2, F3, F4 + user okay.

  **References**:
  - The full git diff produced by Waves 1-4 (`git log --oneline -20`, `git diff main`)
  - The installed Ponytail SKILL.md at `C:\Users\Ahmed Attafi\.agents\skills\ponytail\SKILL.md`
  - WHY: user brief explicitly calls for Ponytail AFTER correctness is proven.

  **Acceptance Criteria**:
  - [ ] `.sisyphus/evidence/task-ponytail-report.md` exists with: at least 5 ranked findings; each finding has severity (high/medium/low), deletion candidate vs simplification candidate, and rationale.
  - [ ] Any safe patches applied recorded in `task-ponytail-applied-patches.md` with before/after snippet.
  - [ ] If contract or architecture changes recommended: `.sisyphus/evidence/task-ponytail-escalation.md` lists each with Prometheus-replanned flag (NOT auto-applied).
  - [ ] `npm run build` + `npm run lint` still pass after any applied safe patch
  - [ ] Before/after metrics captured: build time, bundle size, feed fetch latency

  **QA Scenarios**:
  ```
  Scenario: Ponytail report completeness
    Tool: Bash (read evidence file)
    Steps:
      1. cat .sisyphus/evidence/task-ponytail-report.md
      2. Assert: file exists, has at least 5 ranked findings sections, each addressed to a specific file:line
    Expected Result: Review findings enumerated; severity-ranked; actionable
    Evidence: .sisyphus/evidence/task-ponytail-report.md

  Scenario: Safe patches preserve behavior
    Tool: Bash + Playwright
    Steps:
      1. If any patches applied, run npm run build && npm run lint → both pass
      2. Run Task 1 baseline screenshot routes; capture AFTER screenshots at the same viewports/modes
      3. Visual diff: assert no visible regression in behavior
      4. Compare feed latency: `curl -s -o /dev/null -w "%{time_total}\n" 'http://localhost:3000/api/feed?country=us&category=world'` recorded before and after run; assert not >10% slower
    Expected Result: Safe patches leave behavior unchanged; performance not regressed
    Evidence: .sisyphus/evidence/task-ponytail-metrics.md
  ```

  **Evidence to Capture**:
  - [ ] `task-ponytail-report.md`
  - [ ] `task-ponytail-applied-patches.md` (if any)
  - [ ] `task-ponytail-escalation.md` (if any)
  - [ ] `task-ponytail-metrics.md`

  **Commit**: YES if any safe patch applied. Message: `chore(ponytail): apply P1 simplification pass — see evidence`. Files: only the patched files. Pre-commit: `npm run build && npm run lint`.