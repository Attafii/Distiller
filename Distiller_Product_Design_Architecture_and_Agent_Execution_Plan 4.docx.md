# **DISTILLER**

## *Product, Experience, Architecture & Agent Execution Blueprint*

**A practical plan to turn a personal news workflow into a modern, evidence-first news intelligence product.**

| PREPARED FOR | Ahmed Attafi (attafii) |
| :---- | :---- |
| **PRODUCT** | Distiller — News Intelligence |
| **PRIMARY STACK** | Next.js · TypeScript · Tailwind CSS · shadcn/ui · Neon Postgres · NVIDIA NIM |
| **DELIVERY WORKFLOW** | OpenCode Go · Oh My OpenAgent · Prometheus planning · Atlas execution · Zed for minor tasks |
| **VERSION** | 1.0 · 15 July 2026 |

## **North-star statement**

**Give each reader the fewest stories needed to understand what matters, with visible evidence for every meaningful claim.**

## *CONFIDENTIAL WORKING DOCUMENT  •  PRODUCT / ENGINEERING / DESIGN*

# **1\. Executive Summary**

Distiller should evolve from an AI article summarizer into an evidence-linked, personalized story-intelligence workspace. The product advantage is not “AI writes three bullets”; that pattern is easy to copy. The defensible experience is the full loop: source ingestion, de-duplication, story clustering, evidence extraction, transparent uncertainty, personal relevance, and delivery through feed, search, email, and RSS.

**The proposed delivery strategy keeps the architecture intentionally compact: one Next.js application, one Postgres database on Neon, one background-job path, and a small set of replaceable AI adapters. The system should remain a modular monolith until measured scale or team boundaries justify separation.**

## **Strategic priorities**

| Priority | Outcome | Why now |
| :---- | :---- | :---- |
| P0 · Trust | Every bullet opens its supporting passage; inference is labeled. | The product claims verification, so proof must be visible. |
| P0 · Consistency | One source of truth for plans, limits, trials, and billing copy. | Current public messaging contains conflicting entitlements. |
| P1 · Relevance | Following, muting, feedback, and personalized ranking. | The founder problem was filtering—not only summarization. |
| P1 · Story intelligence | Cluster duplicate articles and show “what changed.” | This removes repeated coverage, the largest remaining form of noise. |
| P2 · Retention | Digest, alerts, saved searches, bookmarks, history. | A paid product needs a recurring habit and remembered value. |
| P3 · Expansion | Teams and API only after individual retention is proven. | Avoid supporting speculative surfaces too early. |

## **Recommended 12-week outcome**

* A coherent visual system and redesigned marketing/app shell.  
* Evidence-backed story cards with clear fact/context/analysis labels.  
* A production ingestion and summarization pipeline with observability and evaluation.  
* Personalized onboarding, follows, mutes, feedback, bookmarks, and digest preferences.  
* A corrected pricing/trial experience and essential legal/trust pages.  
* Automated tests, AI quality gates, security controls, and staged rollout metrics.

# **2\. Product Definition & Positioning**

## **The job to be done**

“When news is scattered across many platforms, help me identify the few developments relevant to me, understand them quickly, and inspect the evidence without opening fifteen tabs.”

## **Positioning**

**Distiller is a personalized news intelligence workspace that groups fragmented coverage into concise, evidence-linked story briefs.**

### **Do not position it as**

* A paywall bypass tool.  
* A replacement for original journalism.  
* An omniscient AI that “reads everything.”  
* A generic chat-with-news wrapper.  
* A source-truth oracle with guaranteed correctness.

### **Position it around**

* Less repetition: one evolving story instead of many near-duplicate articles.  
* Visible evidence: every factual bullet traces to source text.  
* Personal relevance: follow, mute, rank, and deliver based on preferences.  
* Regional depth: credible Tunisia, MENA, Africa, and multilingual coverage.  
* Workflow fit: feed, search, email, bookmarks, and RSS.

## **Primary personas**

| Persona | Core need | Paid trigger |
| :---- | :---- | :---- |
| Technical professional | Track AI, software, security, and companies without constant browsing. | Saved monitoring, deep briefs, RSS, digest. |
| Regional analyst | Follow countries and cross-regional coverage with source diversity. | Advanced filters, story timelines, exports. |
| Research-heavy reader | Inspect evidence and compare multiple publications. | Evidence mode, history, collections. |
| Small research team | Share monitoring and collaborate on a common feed. | Seats, shared feeds, alerts—later phase. |

## **Core product principles**

1. Source before summary.  
2. Stories before articles.  
3. Facts and inference must look different.  
4. Personalization must include negative preferences.  
5. Progressive disclosure: fast scan first, evidence on demand.  
6. Original publishers receive prominent attribution and outbound links.  
7. Do not add a feature without a retention, trust, or revenue hypothesis.

# **3\. Scope, Roadmap & Acceptance Gates**

## **Now / Next / Later**

| Now · foundation | Next · differentiation | Later · expansion |
| :---- | :---- | :---- |
| Plan consistency; design tokens; app shell; legal/trust pages; evidence model; ingestion reliability; observability. | Story clustering; change detection; personalized ranking; saved searches; digest; Ask with multi-source citations. | Team workspace; private feeds; API; analytics; exports; publisher partnerships. |
| Ship quality and credibility. | Create habit and defensibility. | Monetize validated demand. |

## **Release gates**

| Gate | Minimum acceptance criteria |
| :---- | :---- |
| Design | Responsive at 360/768/1280/1536 px; keyboard navigable; contrast compliant; no generic template sections; loading/empty/error states defined. |
| Data | Idempotent ingestion; canonical URLs; source and article provenance; migrations tested; retention rules documented. |
| AI | Claim evidence coverage target met; unsupported claims blocked; prompt/model versions stored; regression set passes. |
| Security | AuthZ tests, rate limits, webhook signature checks, secret isolation, audit logging for privileged actions. |
| Performance | Core pages meet agreed Web Vitals budget; feed uses pagination; heavy AI work never blocks page requests. |
| Business | Plan entitlements match website, product, and billing provider; trial/cancellation language is exact. |

# **4\. Experience Architecture**

## **Information architecture**

| Public ├── Home ├── Explore / public sample feed ├── Story / shareable brief ├── Pricing ├── About ├── Methodology ├── Corrections ├── Privacy / Terms / Cookies / AI transparency └── Status / Contact Authenticated ├── For You ├── Following ├── Explore ├── Ask ├── Saved │   ├── Bookmarks │   ├── Saved searches │   └── Collections ├── Digests & alerts └── Settings     ├── Topics / regions / entities / languages     ├── Sources / muted terms     ├── Summary depth / delivery     ├── Account / privacy / export / delete     └── Plan / billing |
| :---- |

## **Critical journeys**

### **First visit → first value**

8. Hero states the outcome and shows a genuine live story.  
9. Visitor opens evidence on one bullet without creating an account.  
10. Visitor selects three interests and optional mutes.  
11. Distiller previews a personalized feed.  
12. Account creation saves the configuration; Pro is introduced only at a value boundary.

### **Daily reader loop**

13. Open “For You.”  
14. See new and updated story clusters—not repeated articles.  
15. Scan three facts and “what changed.”  
16. Inspect evidence or open the original source when needed.  
17. Give lightweight relevance feedback.  
18. Follow the story or continue; reading state persists.

### **Ask the news**

19. Enter question and time range.  
20. Retrieve relevant story clusters and source passages.  
21. Answer directly; cite claims inline.  
22. Expose agreement, disagreement, uncertainty, and last-checked time.  
23. Offer follow-up actions: follow story, save search, schedule alert.

# **5\. Visual Direction — Taste-Led, Not Template-Led**

Use the Taste skill as an art-direction and audit constraint, not as permission for unreviewed visual novelty. The current Taste v2 positioning emphasizes brief-driven direction, audit-first redesign, strict pre-flight checks, and interfaces that avoid generic templating. The plan should install and pin the skill version, then commit the generated design rules into the repository. \[Source 3\]

## **Design concept: Editorial intelligence**

A calm, information-dense editorial product: warm neutral canvas, near-black type, restrained cobalt/teal signals, precise metadata, subtle depth, and evidence interactions that feel analytical rather than flashy.

| Element | Direction | Avoid |
| :---- | :---- | :---- |
| Typography | Editorial display face for headlines; highly legible sans for UI/body; tabular numerals for scores/times. | All-text-same-size SaaS typography. |
| Color | Neutral surfaces \+ one cobalt action color \+ teal evidence signal \+ semantic amber/red. | Purple gradients, neon glows, rainbow badges. |
| Cards | Story clusters with hierarchy, fine borders, optional editorial thumbnail, clear evidence affordance. | Identical floating rounded cards everywhere. |
| Shape | 8–14 px radii; pills only for compact filters/status. | Every control as a capsule. |
| Motion | 120–220 ms; explain state change, evidence expansion, and filtering. | Decorative parallax and constant animation. |
| Density | Compact but breathable; user-selectable comfortable/compact feed. | Huge empty hero and tiny content viewport. |

## **Proposed tokens**

| :root {   \--canvas: \#F7F6F2;   \--surface: \#FFFFFF;   \--surface-subtle: \#F0F3F6;   \--ink: \#172033;   \--muted: \#667085;   \--line: \#D9E1E8;   \--brand: \#2563EB;   \--evidence: \#0F766E;   \--warning: \#B45309;   \--danger: \#B42318;   \--radius-sm: 8px;   \--radius-md: 12px;   \--shadow-1: 0 1px 2px rgb(16 24 40 / 0.06); } |
| :---- |

## **Page-by-page design brief**

| Surface | Design objective | Signature component |
| :---- | :---- | :---- |
| Homepage | Demonstrate the product instead of describing it repeatedly. | Live story brief with clickable per-bullet evidence. |
| Feed | Fast scanning with strong hierarchy and persistent context. | Story cluster card \+ “updated since last read.” |
| Story | Make provenance and change history first-class. | Evidence drawer \+ source timeline \+ disagreement panel. |
| Ask | Answer like a research tool, not a chat toy. | Inline cited answer \+ coverage agreement \+ time scope. |
| Onboarding | Create value quickly with minimal questions. | Interest composer with follow and mute chips. |
| Pricing | Eliminate ambiguity and tie features to outcomes. | Single entitlement matrix generated from shared config. |
| Methodology | Earn trust through operational clarity. | Pipeline diagram \+ score breakdown \+ correction policy. |

## **Accessibility and responsive behavior**

* Semantic landmarks and heading order; “skip to content.”  
* Visible focus rings and complete keyboard operation for dialogs, menus, filters, and evidence drawers.  
* Never encode source confidence by color alone; pair icon, label, and text.  
* Respect reduced-motion and font scaling.  
* On mobile, filters become a bottom sheet; story evidence remains reachable within two taps.  
* Text line length around 60–75 characters in deep reading mode.

# **6\. Technical Architecture**

## **Architecture decision**

**Start with a modular monolith deployed as a Next.js application plus an asynchronous worker. Keep boundaries in code and database schemas; do not create microservices until independent scaling, reliability, or ownership is measured.**

## **System context**

| Browser / RSS / Email         │         ▼ Next.js App Router ├── Public pages \+ authenticated UI ├── Server Actions / Route Handlers ├── AuthN/AuthZ \+ entitlement checks ├── Query layer \+ cache invalidation └── Job enqueue / webhook endpoints         │         ├──────────────► Neon Postgres (+ pgvector where justified)         │                  ├── product data         │                  ├── evidence \+ provenance         │                  ├── job/outbox state         │                  └── AI run/evaluation metadata         │         └──────────────► Worker / scheduled ingestion                            ├── fetch \+ parse \+ canonicalize                            ├── deduplicate \+ cluster                            ├── chunk \+ embed                            ├── NVIDIA NIM generation/embedding adapter                            ├── validation \+ evidence mapping                            └── publish \+ invalidate caches |
| :---- |

## **Recommended stack**

| Layer | Recommendation | Reason |
| :---- | :---- | :---- |
| Web | Next.js App Router \+ TypeScript strict mode | Server-first rendering, route handlers, streaming, and one full-stack codebase. |
| UI | Tailwind CSS \+ shadcn/ui primitives \+ Radix behavior | Accessible primitives with owned source code; official shadcn setup supports Next.js project scaffolding and component addition. \[Source 6\] |
| Validation | Zod at all trust boundaries | One runtime schema vocabulary for actions, APIs, jobs, and AI output. |
| Database | Neon Postgres; pooled runtime connection; migrations in CI | Relational integrity, search metadata, vector option, branching-friendly workflows. |
| ORM/query | Drizzle or existing proven query layer; choose one | Keep SQL visible and migrations predictable; do not stack ORMs. |
| AI | NVIDIA NIM behind provider interfaces | Model and endpoint portability; independent generation and embedding adapters. |
| Jobs | Database outbox initially; managed queue when throughput requires | Reliable async work without premature infrastructure. |
| Auth | Mature provider or audited auth library | Do not write authentication primitives. |
| Billing | Stripe or equivalent; webhook-derived entitlements | Server-authoritative billing state and standard lifecycle handling. |
| Testing | Vitest \+ Testing Library \+ Playwright \+ contract tests | Fast unit feedback plus user-journey and integration coverage. |
| Observability | Structured logs, traces, error tracking, product analytics | Debug ingestion/AI failures and measure user value. |

## **Next.js rules**

* Default to React Server Components; add client boundaries only for interaction.  
* Read from the database in server-only modules; never expose database credentials to the browser.  
* Use route handlers for external APIs, webhooks, RSS, and machine-readable outputs.  
* Centralize authorization in server-side policy functions; hiding UI is not authorization.  
* Use Suspense and route-level loading/error boundaries for slow feed/search regions.  
* Cache public immutable content; personalize authenticated feeds dynamically; invalidate by story/tag after publication.  
* Persist URL state for filters, search, sort, and time range so views are shareable.

# **7\. Domain Model & Data Design**

## **Core entities**

| Entity | Purpose | Important fields |
| :---- | :---- | :---- |
| sources | Publisher/feed identity and policy. | name, domain, language, region, source\_type, trust metadata, fetch policy |
| articles | One retrieved publication item. | canonical\_url, title, author, published\_at, raw\_hash, content\_status, license metadata |
| article\_chunks | Retrieval units with stable anchors. | article\_id, ordinal, text, token\_count, embedding, source offsets |
| stories | Cluster representing one evolving event. | title, status, first\_seen, last\_updated, topic, region, change\_summary |
| story\_articles | Article membership and role. | story\_id, article\_id, similarity, is\_primary, is\_independent |
| briefs | Versioned generated presentation. | story\_id, brief\_version, model, prompt\_version, status, generated\_at |
| claims | Atomic statements shown to users. | brief\_id, text, claim\_type, confidence, display\_order |
| claim\_evidence | Trace from claim to passage. | claim\_id, chunk\_id, quote span, support\_type, verifier result |
| users/preferences | Personal ranking and delivery settings. | topics, regions, entities, languages, density, digest schedule |
| interactions | Behavioral feedback. | user\_id, story\_id, action, created\_at, context |
| follows/mutes | Explicit positive and negative preferences. | subject\_type, subject\_id/value, weight |
| ai\_runs | Reproducibility and cost. | task, provider, model, prompt hash, latency, tokens, cost estimate, status |
| jobs/outbox | Reliable pipeline state. | type, payload, attempts, available\_at, locked\_at, last\_error |

## **Data invariants**

* A published factual claim must have at least one valid claim\_evidence row.  
* Every brief is immutable; corrections create a new version and retain history.  
* Canonical URL and normalized-content hash prevent duplicate article insertion.  
* Story merging is reversible and records the actor/model/reason.  
* User entitlements are computed server-side from normalized subscription state.  
* Deletion/export workflows include interactions, preferences, bookmarks, and account identifiers.

## **Indexes and query patterns**

* Unique index on canonical URL; secondary unique strategy on source \+ external ID.  
* Indexes on published\_at, story last\_updated, source, topic, region, and job availability.  
* Composite indexes matching feed filters and cursor pagination.  
* Vector index only after retrieval evaluation demonstrates benefit; combine lexical, metadata, and vector matching.  
* Use keyset/cursor pagination, not deep OFFSET scans.

# **8\. Ingestion, Story Clustering & AI Pipeline**

## **Pipeline stages**

| Stage | Action | Failure behavior |
| :---- | :---- | :---- |
| 1 · Discover | Read approved RSS/API/source lists; create fetch job. | Retry with backoff; quarantine repeatedly failing source. |
| 2 · Fetch | Respect source policy; retrieve metadata and permitted text. | Store status and reason; never silently fabricate content. |
| 3 · Normalize | Extract title, author, dates, canonical URL, clean text, language. | Mark incomplete and exclude from generation if critical fields fail. |
| 4 · Deduplicate | URL, content hash, and near-duplicate detection. | Link aliases; retain provenance. |
| 5 · Cluster | Match to existing story or create a new story. | Low-confidence items remain unclustered for later review. |
| 6 · Retrieve evidence | Chunk and identify passages for atomic claims. | No passage means no published factual claim. |
| 7 · Generate | Produce strict structured brief through NIM adapter. | Schema failure retries once with repair; then dead-letter. |
| 8 · Verify | Check entailment, dates, entities, quote spans, source independence. | Block or downgrade unsupported content. |
| 9 · Publish | Create immutable brief version and update story. | Transactional commit \+ outbox event. |
| 10 · Deliver | Invalidate cache, update feed, send eligible alerts/digests. | Idempotency key prevents duplicate delivery. |

## **AI output contract**

| type BriefOutput \= {   storyTitle: string;   facts: Array\<{     text: string;     evidenceChunkIds: string\[\];     confidence: number;   }\>;   context?: Array\<{ text: string; evidenceChunkIds: string\[\] }\>;   analysis?: { text: string; label: "AI analysis" };   uncertainty: string\[\];   conclusion?: string;   safetyFlags: string\[\]; }; |
| :---- |

## **Prompting principles for production AI**

* Supply only retrieved passages and explicit metadata; do not ask the model to rely on memory.  
* Require atomic claims and stable evidence IDs.  
* Forbid unsupported specificity, invented numbers, and causal interpretation unless directly supported.  
* Make “insufficient evidence” a valid successful output.  
* Store prompt template version, model ID, endpoint, parameters, and input hashes.  
* Separate summarization, claim verification, clustering, and ranking prompts; do not create one giant prompt.

## **Evaluation set**

| Metric | Definition | Initial target |
| :---- | :---- | :---- |
| Evidence coverage | Published factual claims with ≥1 valid supporting passage. | ≥ 99% |
| Faithfulness | Human/automated judgment that claim is entailed by evidence. | ≥ 95% on golden set |
| Citation precision | Linked passage directly supports the displayed claim. | ≥ 95% |
| Duplicate reduction | Articles consolidated without losing distinct events. | Measured by reviewed cluster set |
| Change accuracy | “What changed” contains only newly supported information. | ≥ 95% reviewed |
| Latency | Ingestion-to-published brief under normal load. | Set after baseline |
| Cost | AI and retrieval cost per published story. | Tracked by model/task |

# **9\. Security, Privacy, Content & Reliability**

## **Security baseline**

* Environment-specific secrets; no secrets in prompts, client bundles, logs, or preview deployments.  
* Server-side authorization on every mutation and private read.  
* Rate limits by user/IP/action, especially Ask, generation, exports, and auth endpoints.  
* Webhook signatures, idempotency keys, replay protection, and event storage.  
* Parameterized queries, runtime validation, safe URL fetching, and SSRF protections for ingestion.  
* Allowlist protocols; block private network ranges and oversized downloads.  
* Dependency and skill provenance review before installation; pin versions and hashes.  
* Audit log for admin corrections, source changes, story merges, and entitlement overrides.

## **Privacy and user control**

* Data inventory and retention schedule.  
* Clear purpose for reading history and personalization events.  
* Account export and deletion.  
* Marketing consent separated from service email.  
* Cookie controls appropriate to analytics usage.  
* Minimize raw prompt logging; redact personal identifiers.  
* Document AI providers/subprocessors and cross-border processing as applicable.

## **Publisher and content posture**

**Distiller should link prominently to original reporting, avoid reproducing substantial article text in the product surface, respect source/feed/API terms, retain provenance, support corrections/takedowns, and seek professional legal review before scaling publisher ingestion. This plan is product guidance, not legal advice.**

## **Reliability and observability**

| Signal | What to capture |
| :---- | :---- |
| Request | trace ID, route, user/tenant pseudonymous ID, latency, status |
| Ingestion | source, fetch result, parse result, bytes, content hash, retry count |
| AI run | task, model, prompt version, latency, token counts, response/schema status |
| Quality | unsupported claim rate, evidence coverage, cluster review outcomes |
| Business | activation, retained readers, trial conversion, cancellation reason |
| Alerts | queue depth, oldest job age, source failure spike, model error spike |

# **10\. Pricing, Entitlements & Product Metrics**

## **Recommended packaging**

| Free | Pro | Team · later |
| :---- | :---- | :---- |
| All taxonomy visible; follow 3 topics \+ 3 regions; 50 brief opens/month; standard summaries; source links; weekly digest. | Unlimited reading/follows; deep mode; evidence tools; saved searches; custom alerts/digests; RSS; full history and bookmarks. | 5 seats; shared feed/collections; team alerts; admin controls; analytics; exports; support. |

**Use a single typed entitlement registry shared by pricing UI, application gates, checkout metadata, and tests. The website must not hard-code a second version of plan truth.**

## **North-star and supporting metrics**

| Metric | Definition |
| :---- | :---- |
| Weekly informed readers | Users who read ≥3 distinct story briefs and inspect evidence or open a source in a week. |
| Time-to-first-value | Signup to first saved/followed story or first evidence inspection. |
| Noise removed | Duplicate articles clustered per story and muted items suppressed. |
| Trust engagement | Percent of active readers opening evidence/source/corrections. |
| Retention | Week 1, week 4, and paid subscriber retention by acquisition cohort. |
| Paid value | Trial-to-paid conversion, plan utilization, voluntary churn reason. |
| Quality guardrails | Correction rate, unsupported claim rate, user report rate. |

## **Experiments**

* Live evidence demo versus conventional marketing hero.  
* Interest-first onboarding versus account-first onboarding.  
* Three follows versus all-topics access with usage limit.  
* Daily digest default versus user-selected schedule.  
* Story-level paywall versus feature-level paywall.  
* Show Distiller Score breakdown versus single number.

# **11\. Agentic Delivery Operating System**

Oh My OpenAgent explicitly separates planning and execution: Prometheus plans and uses quality gates, while Atlas executes verified plans through delegation and independent verification. That matches your stated GLM 5.2 planning / MiMo v2.5 execution workflow, but model assignments should remain configuration rather than architecture. \[Sources 1–2\]

## **Role map**

| Actor | Primary responsibility | Must not do |
| :---- | :---- | :---- |
| Ahmed / product owner | Decisions, user truth, acceptance, source policy, rollout. | Delegate irreversible product judgment to agents. |
| Prometheus · GLM 5.2 | Interview, inspect repo, expose ambiguity, produce implementation plan and acceptance tests. | Write production code during planning. |
| Metis / Momus gates | Gap analysis and plan criticism. | Approve vague tasks or unverifiable outcomes. |
| Atlas · MiMo v2.5 | Execute approved plan; delegate; track progress; independently verify. | Change scope silently or accept subagent claims without evidence. |
| Taste skill | Design direction, redesign audit, anti-template constraints, pre-flight review. | Override accessibility, product requirements, or performance. |
| Ponytail skill | YAGNI gate; standard/native/existing dependency before custom code. | Remove validation, security, a11y, or useful smoke tests. |
| Zed agent | Small scoped edits, copy tweaks, local refactors, test fixes. | Perform cross-cutting architecture without a plan. |
| Human review | Visual judgment, legal/product policy, merge approval. | Rubber-stamp generated diffs. |

## **Skill governance**

AutoSkills detects the project stack and installs curated, hash-checked skill files; its published catalog includes Next.js, React, Tailwind, TypeScript, Zod, shadcn/ui, Playwright, Vercel AI SDK, Neon, and related skills. Run a dry-run, review every skill, pin versions/commits, and commit the selected files so agent behavior changes only through reviewed pull requests. \[Source 4\]

| \# Intended workflow — verify commands against current tool docs npx autoskills \--dry-run npx autoskills \# Add/pin project-specific skills \# \- design-taste-frontend (Taste v2, after review) \# \- ponytail (full for implementation; audit/review at gates) \# Commit skill files and a SKILLS\_LOCK.md containing: \# source URL, commit/version, hash, installed date, owner, review notes |
| :---- |

## **Repository instructions**

* AGENTS.md: product principles, architecture boundaries, commands, definition of done, forbidden shortcuts.  
* DESIGN.md: aesthetic direction, tokens, typography, component grammar, responsive behavior, accessibility.  
* ARCHITECTURE.md: modules, dependency rules, data lifecycle, ADR index.  
* AI.md: model adapters, prompt contracts, safety, evaluation, versioning.  
* SOURCE\_POLICY.md: ingestion permissions, attribution, corrections, takedowns.  
* docs/plans/: Prometheus plans; immutable after execution begins except logged amendments.  
* docs/adr/: decisions such as auth, queue, ORM, clustering, model provider.

## **Branch and task protocol**

24. Create one issue with measurable acceptance criteria and declared non-goals.  
25. Prometheus inspects current code and interviews only on consequential ambiguity.  
26. Metis/Momus critique the plan; revise until tasks, files, tests, and rollout are explicit.  
27. Atlas executes on a short-lived branch, using Taste only for UI tasks and Ponytail for every coding task.  
28. Run format, typecheck, lint, unit, integration, Playwright, accessibility, and production build.  
29. Inspect screenshots at all target widths and review database migrations/query plans.  
30. Human reviews the diff, user experience, AI evidence, and rollout switch.  
31. Merge behind a feature flag when risk warrants; monitor and record learnings.

# **12\. Prompt Library**

These prompts are templates. Replace bracketed fields, provide repository context, and keep tasks bounded. Never paste production secrets or private user data into agent prompts.

## **A. Prometheus — master planning prompt**

| You are planning the next Distiller milestone. Do not implement. PRODUCT NORTH STAR Give each reader the fewest stories needed to understand what matters, with visible evidence for every meaningful claim. CONTEXT \- Stack: Next.js App Router, TypeScript strict, Tailwind, shadcn/ui, Neon Postgres. \- AI: NVIDIA NIM through provider adapters. \- Architecture: modular monolith \+ async worker. \- Design: editorial intelligence; use Taste skill; no generic SaaS template. \- Code: use Ponytail; prefer native/existing/simple; preserve security/a11y/tests. MILESTONE \[describe business outcome\] REQUIRED PROCESS 1\. Inspect the repository, existing plans, migrations, tests, and design tokens. 2\. State current behavior with file evidence. 3\. Identify ambiguities; ask only decisions that materially affect product/architecture. 4\. Propose one recommended approach and alternatives with trade-offs. 5\. Produce tasks with exact files/modules, dependencies, migration strategy, tests,    observability, security/privacy, accessibility, and rollback. 6\. Include explicit non-goals and measurable acceptance criteria. 7\. Run gap analysis and critical plan review before finalizing. OUTPUT A plan Atlas can execute without inventing requirements. |
| :---- |

## **B. Taste — redesign brief**

| Use the installed Taste skill to audit and redesign \[surface\]. BRAND: Distiller, evidence-first news intelligence. DIRECTION: calm editorial intelligence; precise, modern, elegant, trustworthy. AVOID: purple gradients, glassmorphism, excessive pills, uniform card grids, oversized empty hero sections, decorative charts, and motion without meaning. REQUIRED \- Start with an audit of hierarchy, density, typography, color, spacing, and states. \- Reuse shadcn primitives where behavior fits; customize visual language through tokens. \- Distinguish reported fact, context, AI analysis, and uncertainty. \- Make evidence reachable from every factual bullet. \- Design loading, empty, error, offline/stale, restricted, and corrected states. \- Provide responsive behavior for 360, 768, 1280, and 1536 px. \- Meet keyboard, focus, contrast, reduced-motion, and semantic requirements. \- Produce/update DESIGN.md and screenshot-based acceptance checklist. Do not implement until the direction and component inventory are explicit. |
| :---- |

## **C. Atlas — execution prompt**

| Execute the approved plan at \[plan path\]. Do not change product scope silently. RULES \- Read AGENTS.md, DESIGN.md, ARCHITECTURE.md, AI.md, and relevant ADRs first. \- Delegate by specialization; use Taste for frontend design and Ponytail for code. \- Default to Server Components and existing dependencies/native features. \- Keep provider-specific AI code behind adapters. \- Validate every boundary with schemas and enforce authorization server-side. \- Add migrations, tests, telemetry, feature flags, and rollback described in the plan. \- After each task, verify independently; do not trust completion claims. \- Record deviations and learning in the plan log. FINAL REPORT Changed files, migrations, tests run/results, screenshots, performance impact, security/a11y checks, known limitations, rollout and rollback steps. |
| :---- |

## **D. Ponytail — optimization/review prompt**

| Review this diff using Ponytail in full mode. Apply the ladder: standard/runtime capability → existing dependency → simple local implementation → new dependency/abstraction only with demonstrated need. Find and rank: \- code or files to delete; \- needless wrappers, factories, generic repositories, adapters, or config layers; \- duplicated state and derived values stored unnecessarily; \- extra client components or network boundaries; \- dependencies replaceable by platform/project capabilities; \- speculative performance work. Do not simplify away validation, authorization, safe error handling, observability, accessibility, data integrity, or meaningful tests. Return a minimal safe patch plan. |
| :---- |

## **E. AI brief generation prompt**

| SYSTEM: Generate a source-grounded story brief from supplied evidence only. Every factual statement must cite one or more evidence IDs. If support is insufficient, omit the claim or place it under uncertainty. Never invent numbers, dates, quotations, causes, consensus, or source independence. Separate reported facts from AI analysis. Return only the required JSON schema. INPUT Story metadata: \[metadata\] Evidence passages: \[{id, publisher, publishedAt, text, sourceType}\] Previous brief: \[optional\] TASK Produce: title, up to 3 atomic facts, context, clearly labeled AI analysis, uncertainty, conclusion, and evidence IDs. Identify what changed from the previous brief only when new evidence directly supports it. |
| :---- |

## **F. Claim verifier prompt**

| For each claim, classify support using only its linked passages: ENTAILED, PARTIALLY\_ENTAILED, CONTRADICTED, or NOT\_SUPPORTED. Return the minimal supporting span, identify unsupported details, and flag whether the claim combines multiple facts that should be split. Do not repair the claim. |
| :---- |

## **G. Zed minor-task prompt**

| Make this small localized change: \[task\]. Constraints: touch only \[files/area\]; follow existing patterns and tokens; do not add dependencies or abstractions; preserve behavior outside scope; add/update focused tests. Run the narrowest relevant checks and summarize the diff. Stop and report if the task requires a migration, cross-module API change, new dependency, or architecture decision. |
| :---- |

# **13\. Twelve-Week Execution Plan**

| Sprint | Focus | Key deliverables | Exit evidence |
| :---- | :---- | :---- | :---- |
| 0 · Week 1 | Baseline & governance | Repo audit; analytics baseline; skill lock; AGENTS/DESIGN/ARCHITECTURE docs; plan consistency fix. | Build green; current screenshots; contradictions removed. |
| 1 · Weeks 2–3 | Design system & shell | Tokens, typography, navigation, story-card grammar, responsive states, public trust pages. | Visual review at 4 widths; a11y smoke test. |
| 2 · Weeks 4–5 | Evidence foundation | Claims/evidence schema, immutable brief versions, evidence drawer, source attribution, correction flow. | Golden-set faithfulness and evidence coverage report. |
| 3 · Weeks 6–7 | Pipeline reliability | Idempotent jobs, retries, outbox, AI run metadata, NIM adapters, dashboards/alerts. | Failure injection and retry tests; cost/latency telemetry. |
| 4 · Weeks 8–9 | Story intelligence | Duplicate detection, clustering review, story timeline, what-changed computation. | Reviewed cluster benchmark; reversible merge UI. |
| 5 · Weeks 10–11 | Personalization & retention | Onboarding, follows, mutes, feedback, saved searches, digest preferences. | Activation funnel and notification idempotency. |
| 6 · Week 12 | Commercial hardening | Entitlements, trial copy, billing lifecycle, privacy/export/delete, staged launch. | Checkout/webhook E2E; rollback drill; launch dashboard. |

## **Backlog after week 12**

* Multi-source Ask with inline evidence and disagreement.  
* Cross-region comparison and multilingual brief presentation.  
* Team discovery interviews and waitlist—not immediate implementation.  
* API design partner program with metering and licensing review.  
* Publisher dashboard and correction/takedown workflow.

# **14\. Definition of Done & Checklists**

## **Feature definition of done**

* Acceptance criteria demonstrated, not merely stated.  
* No plan-entitlement mismatch.  
* Authorization tested at server boundary.  
* Data migration reversible or recovery documented.  
* Loading, empty, error, stale, corrected, and restricted states covered.  
* Keyboard and responsive behavior inspected.  
* Telemetry answers: used, succeeded, failed, slow, expensive.  
* AI output traced to model/prompt/evidence version.  
* Tests pass in CI and production build succeeds.  
* Feature flag/rollback supplied for risky changes.  
* Documentation and ADR updated where behavior or architecture changed.

## **Pre-launch trust checklist**

* Methodology defines “verified.”  
* Distiller Score has visible components and disclaimer.  
* Every sample story is real and links to original sources.  
* Testimonials are permissioned and authentic.  
* AI analysis is labeled; uncertainty is preserved.  
* Correction history is visible.  
* Privacy, Terms, Cookies, AI transparency, and content policy are linked from footer.  
* Trial date, billing amount, cancellation effect, and currency are explicit.

## **Prompt quality checklist**

* Objective and non-goals are explicit.  
* Repository facts are requested before recommendations.  
* Output schema and acceptance criteria are unambiguous.  
* Agent is instructed to report uncertainty and stop conditions.  
* No secrets, production personal data, or copyrighted full text are included.  
* Verification is independent from generation.  
* The prompt is versioned and regression-tested if used in production.

# **15\. Key Decisions & Risks**

| Decision / risk | Recommendation | Trigger to revisit |
| :---- | :---- | :---- |
| Modular monolith | Keep one application \+ worker; enforce module boundaries. | Separate scaling/reliability need or independent team ownership. |
| Neon \+ vector search | Use Postgres for product data; add vectors only to measured retrieval needs. | Recall/latency benchmark shows a dedicated engine is required. |
| NVIDIA NIM lock-in | Provider adapters and versioned contracts from day one. | Quality, availability, policy, or unit economics fall below threshold. |
| Team plan too early | Waitlist and interviews first. | At least 5 design partners with repeated collaboration needs. |
| Over-automation | Human approval for source policy, corrections, merges, legal copy, launch. | Only automate after error modes and rollback are understood. |
| Skill drift/supply chain | Pin, hash, review, and commit skills. | Any upstream update requires PR and behavior review. |
| Paywall/content risk | Use permitted inputs, concise transformative briefs, attribution, legal review. | Publisher objection, takedown, or licensing change. |
| AI trust failure | Block unsupported claims; preserve versions; correction controls. | Quality metric breach triggers automatic feature degradation. |

# **16\. Source Notes & Assumptions**

External references were reviewed on 15 July 2026\. Product and model names change quickly; verify exact versions, commands, pricing, and compatibility before execution.

| \# | Reference | URL / relevance |
| :---- | :---- | :---- |
| Source 1 | Oh My OpenAgent overview | https://omo.dev/Describes the planning/execution separation, Prometheus, Atlas, specialist delegation, and verification workflow. |
| Source 2 | Oh My OpenAgent guide / GitHub | https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.mdExplains the OpenCode orchestration harness, Prometheus mode, /start-work, and specialized multi-model workflow. |
| Source 3 | Taste Skill | https://www.tasteskill.dev/Describes Taste v2 as brief-driven, audit-first, strict pre-flight, and compatible with OpenCode/SKILL.md agents. |
| Source 4 | AutoSkills | https://www.autoskills.sh/Documents stack detection, curated registry, hash verification, and relevant skill categories. |
| Source 5 | Ponytail Skill | https://ponytailskill.com/Documents the stdlib/native/existing-dependency ladder and warns against removing validation, security, accessibility, or useful tests. |
| Source 6 | shadcn/ui — Next.js installation | https://ui.shadcn.com/docs/installation/nextOfficial installation and component-addition guidance for Next.js. |
| Source 7 | Distiller public website | https://distiller.attafii.dev/Current public positioning, features, sample brief, and plan comparison used for product analysis. |
| Source 8 | Distiller About | https://distiller.attafii.dev/aboutFounder problem, RAG/embedding claims, product principles, and current scope. |
| Source 9 | Distiller Pricing | https://distiller.attafii.dev/pricingCurrent plan, trial, billing, Team, and API messaging used to identify consistency issues. |

## **Assumptions requiring confirmation in the repository**

* The application already uses or is migrating to Next.js App Router and TypeScript.  
* Authentication and billing providers were not specified; this blueprint deliberately avoids choosing them without codebase inspection.  
* “GLM 5.2” and “MiMo v2.5” are treated as your current routing choices, not permanent architectural dependencies.  
* NVIDIA NIM endpoints/models, embedding dimensions, context limits, data policies, and pricing must be selected and benchmarked.  
* The current public feed and authenticated flows could not be fully interactively audited; direct automated requests returned HTTP 403 during prior inspection.  
* Legal and publisher licensing requirements require qualified professional review.

# **17\. Immediate Next Actions**

32. Create a milestone issue titled “Distiller Trust & Design Foundation.”  
33. Install skills using dry-run; review, pin, hash, and commit only the selected skill files.  
34. Ask Prometheus to audit the repository against this blueprint using Prompt A.  
35. Fix pricing/trial/entitlement contradictions before beginning the visual redesign.  
36. Create DESIGN.md with Prompt B and approve the direction using real product screenshots.  
37. Implement the story/claim/evidence schema behind a feature flag.  
38. Build one production-quality live story card with per-bullet evidence as the vertical slice.  
39. Create a 50–100 story golden evaluation set before scaling generation changes.  
40. Run Atlas on one sprint plan at a time; require the final verification report and human review.  
41. Measure activation, evidence engagement, quality, latency, and cost from the first staged release.

**Success is not a larger feature list. Success is a product that a reader trusts, returns to, and pays for because it removes noise without hiding the evidence.**