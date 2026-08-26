import { getDb } from "@/lib/db";
import { articles, type Article } from "@/lib/db/schema";
import { count } from "drizzle-orm";

type SeedArticle = Omit<Article, "id" | "createdAt">;

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000);

const seeds: SeedArticle[] = [
  {
    title: "Large Language Models Show Emergent Reasoning Capabilities at Scale",
    source: "arXiv",
    sourceUrl: "https://arxiv.org",
    topic: "LLM",
    region: "World",
    excerpt:
      "A new preprint analyzing over 200 models finds that chain-of-thought reasoning emerges reliably once models pass roughly 70 billion parameters, without explicit reasoning training. The authors evaluate seven model families on 42 reasoning benchmarks spanning arithmetic, logic, planning, and theory-of-mind tasks. Below the threshold, performance is near chance; above it, accuracy climbs in a smooth S-curve. The paper also revisits scaling laws: across the measured range, a fourfold increase in compute yields approximately a doubling of performance on complex tasks, with no visible plateau. Researchers say the consistency of the emergence pattern across transformer, mixture-of-experts, and state-space architectures suggests reasoning is a property of scale rather than of any particular architecture. Critics note that benchmark contamination remains a live concern and call for held-out evaluations. The team has released the full evaluation harness and logs to allow independent replication.",
    bullets: [
      "Models above 70B parameters demonstrate chain-of-thought reasoning without explicit prompting",
      "Scaling laws predict 2x improvement on complex tasks with 4x compute budget increase",
      "Researchers confirm capability emergence is consistent across different architecture families",
    ],
    deepBullets: [
      "An analysis of 200+ models across seven families shows chain-of-thought reasoning emerges around the 70B parameter mark, turning on in a smooth S-curve rather than a cliff.",
      "The compute scaling law holds firmly: a fourfold increase in compute budget yields roughly a 2x gain on complex-task accuracy, and the researchers observe no plateau in the tested range.",
      "The emergence pattern repeats across transformers, mixture-of-experts models, and state-space architectures, implying reasoning is a property of scale, not architecture.",
      "Benchmark contamination remains the largest threat to the findings; the authors release a held-out evaluation harness to enable independent replication.",
      "If the trend holds, today's frontier models are still on the steep part of the learning curve, and incremental compute spending will keep paying off through 2026.",
    ],
    keyInsight:
      "The study validates that reasoning emerges predictably at scale, suggesting current frontier models are still on the steep part of the learning curve.",
    conclusion:
      "Scale, not architecture, appears to be the dominant driver of reasoning — and the scaling law shows no sign of exhaustion yet.",
    publishedAt: hoursAgo(2),
  },
  {
    title: "Open-Source Model Tops Private Frontier Labs in Multilingual Benchmarks",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com",
    topic: "AI",
    region: "World",
    excerpt:
      "A new open-weights model released under a permissive license has beaten the leading commercial systems on multilingual reasoning and low-resource language benchmarks. Evaluators at three independent institutions confirmed the results, which were strongest in Arabic, Swahili, and Turkish. The model was trained on a deliberately multilingual corpus with 40 percent non-English data, a departure from the English-heavy mixes used by most labs. Training efficiency also improved: the team reports reaching the same multilingual quality as the previous generation using 35 percent less compute, thanks to better data curation and a new tokenizer. The release includes full weights, data recipes, and an evaluation card. Enterprise adopters, especially in the Middle East, Africa, and Southeast Asia, say the model closes a gap that forced them to rely on translation layers on top of English-centric systems. Questions remain about long-term safety tooling for 90+ languages.",
    bullets: [
      "Open-weights model outperforms leading commercial systems on multilingual reasoning benchmarks",
      "Training with 40% non-English data delivered stronger results in Arabic, Swahili, and Turkish",
      "The release includes weights, data recipes, and an evaluation card for independent scrutiny",
    ],
    deepBullets: [
      "An open-weights model with a permissive license beats the top commercial systems on multilingual reasoning and low-resource language benchmarks, with results confirmed by three independent evaluators.",
      "The standout gains came in Arabic, Swahili, and Turkish — a direct result of training on a corpus with 40% non-English data instead of the English-heavy mixes industry standard.",
      "The team reports reaching the previous generation's multilingual quality with 35% less compute, citing improved data curation and a new tokenizer.",
      "Enterprises in MENA, Africa, and Southeast Asia say the model removes the need for brittle translation layers over English-centric systems.",
      "Open questions remain around safety and moderation tooling that performs consistently across 90+ languages.",
    ],
    keyInsight:
      "The multilingual gap is a data problem, not an architecture problem — and open weights are closing it fast.",
    conclusion:
      "Open models are becoming a serious alternative in regions the big labs have historically under-served.",
    publishedAt: hoursAgo(5),
  },
  {
    title: "Agents Move Into Production as Regulators Draft New Rules",
    source: "Reuters",
    sourceUrl: "https://reuters.com",
    topic: "AI",
    region: "North America",
    excerpt:
      "A survey of 1,400 enterprises finds that 38 percent now run at least one AI agent in a production workflow, up from 12 percent a year ago. The most common deployments are customer support triage, document review, and data-entry automation. Respondents report an average 41 percent reduction in routine task time, but also flag failure modes: agents occasionally take wrong actions when plans are ambiguous, and observability tooling remains immature. Meanwhile, regulators in the US and EU are drafting rules that would require businesses to log agent decisions and disclose automated interactions to customers. The draft rules distinguish high-risk deployments — credit, healthcare, hiring — which would need human approval before high-impact actions. Industry groups are pushing back on what they call premature constraints, arguing that requirements should scale with measured risk. Analysts expect a tiered framework modeled on cloud-compliance regimes within 18 months.",
    bullets: [
      "38% of enterprises now run AI agents in production, up from 12% a year ago",
      "Draft US and EU rules would require decision logs and disclosure of automated interactions",
      "Analysts expect a tiered, risk-based framework within 18 months",
    ],
    deepBullets: [
      "Enterprise adoption of AI agents more than tripled in a year, with 38% of surveyed companies running at least one agent in production.",
      "The most common workloads are support triage, document review, and data-entry automation, with respondents reporting a 41% cut in routine task time.",
      "Ambiguous planning and immature observability are the top failure modes, and agents still occasionally take wrong actions.",
      "Draft US and EU rules would require logging agent decisions and disclosing automated interactions; high-risk domains like credit and healthcare would need human approval for consequential actions.",
      "Industry groups push back on blanket constraints, and analysts expect a cloud-style tiered compliance framework within 18 months.",
    ],
    keyInsight:
      "Adoption has outpaced governance — the regulatory debate is now about scaling oversight with measured risk, not blocking deployment.",
    conclusion:
      "The agent era is here; the compliance scaffolding is arriving next year.",
    publishedAt: hoursAgo(8),
  },
  {
    title: "Long-Context Retrieval Gets Cheaper as RAG Pipelines Mature",
    source: "The Verge",
    sourceUrl: "https://theverge.com",
    topic: "LLM",
    region: "Europe",
    excerpt:
      "Engineering teams are rethinking retrieval-augmented generation as context windows grow. New hybrid pipelines that combine embeddings, keyword retrieval, and late-stage reranking are cutting retrieval costs by 60 percent while improving answer fidelity, according to case studies from three large-scale deployments. The core shift is retrieval quality over quantity: instead of stuffing 30,000 tokens of loosely related context, systems now retrieve fewer, denser passages and rerank them with small cross-encoders. Evaluators measured hallucination rates dropping from 9 percent to 2 percent on internal knowledge bases after the switch. The pattern mirrors a broader industry move away from 'bigger context is better' toward verified, cited retrieval. Teams also report that smaller models become competitive for retrieval-grounded tasks, since the quality of sources matters more than model size. Vendors are racing to package these pipelines as managed services with usage-based pricing.",
    bullets: [
      "Hybrid retrieval with reranking cuts costs by 60% while improving answer fidelity",
      "Hallucination rates dropped from 9% to 2% on internal knowledge bases",
      "Fewer, denser passages are beating bigger context windows",
    ],
    deepBullets: [
      "Hybrid pipelines combining embeddings, keyword search, and cross-encoder reranking cut retrieval costs by 60% in three large-scale deployments.",
      "The principle is retrieval quality over quantity: fewer, denser passages beat stuffing 30,000 tokens of loosely related context.",
      "Hallucination rates fell from 9% to 2% on internal knowledge bases after the switch to cited, verified retrieval.",
      "Smaller models become competitive for grounded tasks, because source quality matters more than parameter count.",
      "The broader industry narrative is shifting from 'bigger context is better' to verified, cited retrieval — and vendors are packaging these pipelines as managed services.",
    ],
    keyInsight:
      "Grounded retrieval is flipping the value equation: source quality now beats model size.",
    conclusion:
      "Cheaper, cited RAG is pulling accuracy and cost in the same direction for the first time.",
    publishedAt: hoursAgo(11),
  },
  {
    title: "Small Language Models Match GPT-Class Quality on Specialized Tasks",
    source: "IEEE Spectrum",
    sourceUrl: "https://spectrum.ieee.org",
    topic: "LLM",
    region: "Asia",
    excerpt:
      "A systematic evaluation of 60 small language models finds that models with one to three billion parameters now match or exceed large general-purpose systems on narrow, specialized tasks when fine-tuned on domain data. In legal-contract extraction, a 1.5B model matched a frontier system's F1 score while running on a single laptop GPU at 400 tokens per second. In medical-coding benchmarks, a 3B domain model outperformed the frontier baseline by 6 points. The results hold when evaluations are redone on held-out datasets, addressing prior concerns that domain benchmarks leak into training data. The economics are stark: inference on edge devices costs a fraction of API calls and keeps sensitive data local, which matters in regulated industries. Researchers caution that small models remain weaker at long-horizon planning and open-ended reasoning, and recommend hybrid architectures where a small specialist handles routine calls and escalates to a large generalist.",
    bullets: [
      "1–3B parameter models match frontier systems on narrow domain tasks after fine-tuning",
      "A 1.5B legal model runs at 400 tokens/second on a single laptop GPU",
      "Hybrid architectures with escalation to large models are the recommended pattern",
    ],
    deepBullets: [
      "A 60-model evaluation shows small language models (1–3B parameters) match or beat frontier systems on narrow, specialized tasks when fine-tuned on domain data.",
      "In legal-contract extraction a 1.5B model matched a frontier system's F1 while running at 400 tokens/second on a laptop GPU; a 3B medical coder beat the baseline by 6 points.",
      "Results held on held-out datasets, addressing leakage concerns that had tainted earlier domain benchmarks.",
      "Edge inference is dramatically cheaper and keeps sensitive data local — decisive in regulated industries like healthcare and law.",
      "Small models still struggle with long-horizon planning, so the recommended pattern is a specialist small model that escalates to a large generalist.",
    ],
    keyInsight:
      "Specialization, not scale, is becoming the cheapest path to production-grade quality.",
    conclusion:
      "The pragmatic stack of 2026 is small specialists up front, big generalists behind.",
    publishedAt: hoursAgo(14),
  },
  {
    title: "Chip Foundries Expand Capacity as Inference Hardware Demand Surges",
    source: "Bloomberg",
    sourceUrl: "https://bloomberg.com",
    topic: "Technology",
    region: "China",
    excerpt:
      "Leading foundries are adding capacity at the fastest pace in a decade, driven by demand for inference accelerators rather than training chips. Orders for inference-class silicon have grown 240 percent year over year as companies deploy mature models to production. Foundries report that inference chips are smaller, higher-margin, and faster to fabricate, letting them rebalance their wafer mix toward a steadier revenue stream. Two major fabs have broken ground on new plants, and one has converted a portion of a memory fab to logic to meet demand. Analysts say the shift reflects an industry maturing past the training-heavy phase: most new demand comes from companies running established models at scale, in edge devices, and in regional data centers. Supply remains tight for advanced packaging, which is now the bottleneck rather than lithography. Governments continue to subsidize domestic capacity, adding geopolitical complexity to the buildout.",
    bullets: [
      "Inference accelerator orders grew 240% year over year as models move to production",
      "Two major fabs broke ground on new plants to meet demand",
      "Advanced packaging, not lithography, is now the industry bottleneck",
    ],
    deepBullets: [
      "Foundry capacity is expanding at its fastest pace in a decade, driven by inference accelerators rather than training chips.",
      "Inference-class orders grew 240% year over year; the chips are smaller, higher-margin, and faster to fabricate, letting fabs rebalance toward steadier revenue.",
      "Two major fabs broke ground on new plants and one converted part of a memory fab to logic production.",
      "The mix shift signals an industry past its training-heavy phase: demand now comes from companies running established models at scale and on edge devices.",
      "Advanced packaging is the new bottleneck, and government subsidies keep adding geopolitical complexity to the buildout.",
    ],
    keyInsight:
      "The silicon cycle is shifting from training to inference — smaller, faster chips with steadier economics.",
    conclusion:
      "The AI buildout is entering its industrial phase, with packaging the next battleground.",
    publishedAt: hoursAgo(17),
  },
  {
    title: "Quantum Networking Demo Shatters Entanglement Distance Record",
    source: "Nature",
    sourceUrl: "https://nature.com",
    topic: "Technology",
    region: "Europe",
    excerpt:
      "Physicists have sustained entanglement between two nodes 124 kilometers apart over metropolitan fiber, tripling the previous record for a practical quantum network link. The demo used a repeaterless architecture with quantum memories at each end, holding entanglement for 1.8 milliseconds — long enough to perform a full round of quantum-key-distribution authentication. Crucially, the system operated through live city fiber carrying regular internet traffic, a first for distances above 100 kilometers. The team attributes the breakthrough to better single-photon sources and a new protocol for erasing timing jitter. Independent researchers call the result a major step toward intercity quantum networks, though they caution that memory lifetimes must improve roughly tenfold for practical quantum internet services. A three-node metro network is slated for demonstration next year, with secure government communications as the first use case.",
    bullets: [
      "Entanglement sustained over 124 km of live metro fiber, tripling the previous record",
      "Quantum memories held states for 1.8 ms — enough for full QKD authentication",
      "A three-node metro quantum network is planned for next year",
    ],
    deepBullets: [
      "Researchers tripled the practical entanglement distance record, sustaining a link between nodes 124 km apart over metropolitan fiber.",
      "The repeaterless architecture uses quantum memories at each end, holding entanglement for 1.8 milliseconds — long enough for full quantum-key-distribution authentication.",
      "For the first time, a 100km-plus link operated through live city fiber carrying ordinary internet traffic.",
      "Better single-photon sources and a new timing-jitter erasure protocol drove the improvement.",
      "Memory lifetimes must improve roughly tenfold for a practical quantum internet; a three-node metro demo with secure government links is planned for next year.",
    ],
    keyInsight:
      "Quantum networks just became viable over the fiber people actually use.",
    conclusion:
      "Intercity quantum communication moved from physics demo to engineering roadmap.",
    publishedAt: hoursAgo(20),
  },
  {
    title: "Lab-Grown Muscle Grafts Integrate With Host Tissue in Primate Trials",
    source: "Science Daily",
    sourceUrl: "https://sciencedaily.com",
    topic: "Science",
    region: "Japan",
    excerpt:
      "Bioengineered muscle grafts grown from a patient's own cells have successfully integrated with host tissue in a non-human primate model, restoring 85 percent of pre-injury contractile force in treated limbs. The grafts, seeded on a biodegradable scaffold and conditioned with mechanical stimulation, formed working neuromuscular junctions and were vascularized within six weeks. The trial marks the first time engineered muscle has achieved sustained functional recovery in a large animal model, a critical milestone before human studies. Researchers observed no tumor formation or immune rejection over the 12-month study period. The technique could eventually treat volumetric muscle loss — injuries where more than 20 percent of a muscle is destroyed and the body cannot regenerate on its own — which affects hundreds of thousands of people annually. Remaining hurdles include scaling production under GMP conditions and confirming durability beyond one year. A human phase I trial is planned for 2027.",
    bullets: [
      "Engineered grafts restored 85% of pre-injury contractile force in primate limbs",
      "Functional neuromuscular junctions formed within six weeks",
      "No immune rejection or tumors over a 12-month study period",
    ],
    deepBullets: [
      "Muscle grafts grown from a patient's own cells restored 85% of pre-injury contractile force in a non-human primate model.",
      "The grafts formed working neuromuscular junctions and were vascularized within six weeks on a biodegradable scaffold.",
      "This is the first sustained functional recovery from engineered muscle in a large animal model — the milestone before human trials.",
      "No tumor formation or immune rejection occurred over the 12-month study.",
      "The technique targets volumetric muscle loss, which affects hundreds of thousands of people annually; a human phase I trial is planned for 2027.",
    ],
    keyInsight:
      "Engineered tissue crossed from cosmetic repair to functional recovery in large animals.",
    conclusion:
      "Regenerative muscle therapy is now one human trial away from the clinic.",
    publishedAt: hoursAgo(23),
  },
  {
    title: "Astronomers Confirm Water Ice in the Moon's Shadowed Craters",
    source: "NASA",
    sourceUrl: "https://nasa.gov",
    topic: "Science",
    region: "World",
    excerpt:
      "New spectral observations have confirmed abundant water ice in permanently shadowed craters near the lunar south pole, resolving years of debate. Instruments aboard an orbital mission detected a distinct 3-micron absorption feature across multiple craters, consistent with ice mixed into the top meter of regolith at concentrations of 1 to 5 percent by weight. Mapping shows the ice is concentrated near crater floors and north-facing slopes, where temperatures never exceed minus 190 degrees Celsius. The finding matters for lunar exploration: ice can be split into oxygen and hydrogen for life support and propellant, and landing sites near water-rich craters are more economical. Mission planners are updating site-selection criteria for the next crewed landings accordingly. Some scientists caution that the ice distribution is patchy and that extraction remains unproven at scale, but most agree the resource question has moved from 'is there water?' to 'how much, and where exactly?'",
    bullets: [
      "Spectral data confirm ice at 1–5% concentration in the top meter of lunar regolith",
      "Ice concentrates in craters where temperatures never rise above −190°C",
      "Crewed landing site selection is being updated around water-rich craters",
    ],
    deepBullets: [
      "Orbital spectroscopy has confirmed abundant water ice in permanently shadowed craters near the lunar south pole, resolving years of debate.",
      "The ice is mixed into the top meter of regolith at concentrations of 1–5% by weight, concentrated on crater floors and north-facing slopes.",
      "Shadowed regions never exceed minus 190°C, keeping the ice stable for billions of years.",
      "Ice can be split into oxygen and hydrogen for life support and propellant, making water-rich sites dramatically more economical for crewed missions.",
      "Extraction remains unproven at scale, but the scientific question has shifted from whether water exists to how much and where exactly.",
    ],
    keyInsight:
      "The lunar resource question is settled: there is water — now it's an engineering problem.",
    conclusion:
      "The next crewed lunar landings will be sited for water access, not just science.",
    publishedAt: hoursAgo(26),
  },
  {
    title: "Cloud Providers Report Double-Digit Growth Driven by AI Workloads",
    source: "CNBC",
    sourceUrl: "https://cnbc.com",
    topic: "Business",
    region: "USA",
    excerpt:
      "The three largest cloud providers reported combined quarterly revenue growth of 19 percent, with AI workloads now accounting for an estimated 30 percent of new cloud spend. Executives on earnings calls emphasized that inference demand is growing faster than training, and that customers are consolidating around fewer, larger deployments. Capital expenditure guidance was raised again, with plans to spend a combined $300 billion next year on data centers, chips, and power infrastructure. One provider disclosed that AI-related revenue has an annualized run rate exceeding $90 billion. Analysts note that margins are holding up despite heavy investment, because AI services carry premium pricing and higher retention. The reports lifted cloud stocks broadly. Risks flagged include power availability in key regions, rising competition from on-premise inference for latency-sensitive workloads, and the possibility of a spending digestion period if enterprise adoption slows.",
    bullets: [
      "Big-three cloud revenue grew 19% combined, with AI at 30% of new spend",
      "Inference demand now outpaces training growth",
      "Capex guidance raised to a combined $300B next year",
    ],
    deepBullets: [
      "The big-three cloud providers grew combined revenue 19% year over year, with AI workloads estimated at 30% of new cloud spend.",
      "Executives say inference demand is growing faster than training and that customers are consolidating around fewer, larger deployments.",
      "Capital expenditure guidance was raised to a combined $300 billion next year for data centers, chips, and power.",
      "AI services carry premium pricing and higher retention, keeping margins intact despite the heavy investment.",
      "Key risks: power availability, on-premise inference for latency-sensitive workloads, and a potential digestion period if enterprise adoption slows.",
    ],
    keyInsight:
      "AI has moved from experiments to the core of cloud revenue — and the capex cycle is still accelerating.",
    conclusion:
      "The cloud AI buildout is the defining capital cycle of the decade.",
    publishedAt: hoursAgo(29),
  },
  {
    title: "Global Supply Chains Shift as Nearshoring Accelerates",
    source: "Financial Times",
    sourceUrl: "https://ft.com",
    topic: "Business",
    region: "Latin America",
    excerpt:
      "Nearshoring is reshaping global trade flows faster than expected, according to a new analysis of container-shipping data and corporate announcements. Manufacturing investment in Mexico, Vietnam, and Eastern Europe rose 34 percent last year, while new long-distance factory projects fell for the third straight year. The shift is driven by a mix of tariffs, shipping volatility, and corporate mandates for supply-chain resilience after years of disruption. Mexico has emerged as the largest beneficiary, with electronics and automotive plants clustering near the US border. Vietnam continues to gain in textiles and electronics assembly, while Poland and Romania are capturing European automotive and machinery investment. Economists caution that nearshoring raises costs in the short term and that labor shortages are emerging in the hottest corridors. Still, surveys show 71 percent of manufacturers now rank geographic diversification as a top-three strategic priority, up from 28 percent five years ago.",
    bullets: [
      "Manufacturing investment in Mexico, Vietnam, and Eastern Europe rose 34%",
      "New long-distance factory projects fell for the third straight year",
      "71% of manufacturers rank diversification as a top-three priority, up from 28%",
    ],
    deepBullets: [
      "Container-shipping data and corporate announcements show nearshoring reshaping trade faster than forecasters expected.",
      "Manufacturing investment in Mexico, Vietnam, and Eastern Europe rose 34% last year, while long-distance factory projects fell for a third consecutive year.",
      "Tariffs, shipping volatility, and resilience mandates after years of disruption are the drivers.",
      "Mexico is the largest beneficiary for electronics and automotive; Vietnam gains in textiles and electronics; Poland and Romania capture European automotive and machinery.",
      "Economists warn of short-term cost increases and labor shortages in the hottest corridors, but the strategic shift appears durable.",
    ],
    keyInsight:
      "Resilience has displaced pure cost as the organizing principle of global manufacturing.",
    conclusion:
      "The supply chain map is being redrawn, and the near winners are clear.",
    publishedAt: hoursAgo(31),
  },
  {
    title: "Central Banks Signal Cautious Easing as Inflation Cools",
    source: "The Economist",
    sourceUrl: "https://economist.com",
    topic: "Finance",
    region: "Europe",
    excerpt:
      "Major central banks are converging on a cautious easing path as inflation prints cool toward targets. Three of the largest institutions held rates steady this month while updating guidance to signal one or two cuts over the next year, down from the three priced in by markets earlier in the quarter. Officials cite sticky services inflation and rising housing costs as reasons for patience, even as goods prices fall outright. Bond markets reacted with modest curve steepening, and the dollar weakened against most majors. Economists are split on whether the pause is a healthy normalization or a prelude to another inflation wave, with some arguing that supply-side investment in energy and automation could keep prices structurally lower. Central bankers emphasized data dependence and warned against over-interpreting any single print. Forward guidance is becoming shorter and more conditional, a deliberate break from the era of fixed-rate paths.",
    bullets: [
      "Three major central banks held rates while signaling one or two cuts over the next year",
      "Sticky services inflation and housing costs are the reasons for patience",
      "Forward guidance is becoming shorter and more conditional",
    ],
    deepBullets: [
      "Major central banks are converging on a cautious easing path, signaling one or two cuts over the next year — fewer than markets had priced in.",
      "Sticky services inflation and rising housing costs justify patience even as goods prices fall outright.",
      "Bond markets responded with modest curve steepening, and the dollar weakened against most majors.",
      "Some economists see the pause as healthy normalization; others warn of a new inflation wave, with supply-side investment in energy and automation as the swing factor.",
      "Forward guidance is deliberately shorter and more conditional, ending the era of fixed-rate paths.",
    ],
    keyInsight:
      "Rate cuts are coming, but slower than markets hope — data dependence is back in charge.",
    conclusion:
      "The easing cycle is a staircase, not an escalator.",
    publishedAt: hoursAgo(34),
  },
  {
    title: "Tokenized Treasuries Surpass $10 Billion in Assets Under Management",
    source: "CoinDesk",
    sourceUrl: "https://coindesk.com",
    topic: "Finance",
    region: "MENA",
    excerpt:
      "Tokenized US Treasury products have passed $10 billion in assets under management, doubling in eight months, as institutional investors use blockchain rails for collateral mobility and around-the-clock settlement. The fastest growth is in money-market-style funds that offer on-chain redemptions, with several now integrated into major prime-brokerage platforms. Issuers report that average transaction sizes are institutional — $2 million and up — and that holders skew toward funds, trading desks, and corporate treasuries rather than retail. Regulators have blessed the format in several jurisdictions, provided products comply with existing fund rules and identity checks. Proponents argue tokenization cuts settlement times from two days to minutes and makes high-quality collateral portable across venues. Skeptics note the market is still a rounding error against the $27 trillion Treasury complex, and that liquidity remains thin in stress scenarios. Several banks plan tokenized deposit pilots this year, extending the trend from assets to money itself.",
    bullets: [
      "Tokenized Treasury AUM doubled in eight months to pass $10 billion",
      "Average transaction size is institutional at $2M+",
      "Banks plan tokenized deposit pilots, extending tokenization to money itself",
    ],
    deepBullets: [
      "Tokenized US Treasury products passed $10 billion in AUM, doubling in eight months, driven by institutional demand for collateral mobility and round-the-clock settlement.",
      "Money-market-style funds with on-chain redemptions are the fastest-growing format, now integrated into major prime-brokerage platforms.",
      "Average transaction sizes are $2 million and up; holders are funds, trading desks, and corporate treasuries rather than retail.",
      "Regulators in several jurisdictions have blessed the format under existing fund rules and identity checks.",
      "Liquidity in stress scenarios remains a concern, but several banks are launching tokenized deposit pilots — extending tokenization from assets to money itself.",
    ],
    keyInsight:
      "Tokenization is winning in the least glamorous, most institutional corner of finance: short-term collateral.",
    conclusion:
      "The $27 trillion Treasury complex is becoming programmable, one billion at a time.",
    publishedAt: hoursAgo(37),
  },
  {
    title: "Semiconductor Index Rallies as AI Capex Forecasts Climb",
    source: "MarketWatch",
    sourceUrl: "https://marketwatch.com",
    topic: "Stocks",
    region: "USA",
    excerpt:
      "The benchmark semiconductor index rose 4.2 percent this week after a string of analyst upgrades lifted 2027 AI capital expenditure forecasts. Two major investment banks now project AI infrastructure spending of $450 billion in 2027, up from earlier estimates of $350 billion, citing committed data-center pipelines and power agreements already signed. Chip-equipment makers led the rally, followed by memory suppliers and networking vendors. Valuation concerns linger: the sector trades at 29 times forward earnings, near the top of its historical range, and short interest has crept higher. Bulls counter that order backlogs are the longest on record and that most demand is contracted rather than speculative. Earnings season begins next week, and guidance will be scrutinized for any signs that hyperscaler spending is being pulled forward rather than grown. Options markets price a 6 percent move on the first big report.",
    bullets: [
      "Semiconductor index rose 4.2% as 2027 AI capex forecasts were raised to $450B",
      "Chip-equipment makers led the rally; memory and networking followed",
      "Sector trades at 29x forward earnings, near historical highs",
    ],
    deepBullets: [
      "The semiconductor index gained 4.2% this week after analysts raised 2027 AI capex forecasts from $350 billion to $450 billion.",
      "Upgrades cite committed data-center pipelines and already-signed power agreements rather than speculative demand.",
      "Chip-equipment makers led gains, followed by memory suppliers and networking vendors.",
      "Valuation concerns are real: 29x forward earnings is near the top of the historical range, and short interest has crept higher.",
      "Bulls argue order backlogs are the longest on record and most demand is contracted; earnings guidance next week will test whether spending is pulled forward or genuinely growing.",
    ],
    keyInsight:
      "The rally is built on contracted orders, not speculation — but valuations leave little room for guidance misses.",
    conclusion:
      "Earnings season will decide whether the chip rally extends or digests.",
    publishedAt: hoursAgo(40),
  },
  {
    title: "Electric Vehicle Makers Diverge as Price War Squeezes Margins",
    source: "Nikkei",
    sourceUrl: "https://asia.nikkei.com",
    topic: "Stocks",
    region: "China",
    excerpt:
      "The global electric-vehicle market is splitting into two camps: scale players that can survive an extended price war and premium makers that are retreating to high-margin niches. One major manufacturer reported a record number of deliveries but a 12 percent drop in average selling price, as discounts deepened across the industry. Smaller rivals are burning cash and several have delayed factory plans. Battery costs have fallen 18 percent year over year, providing some cushion, and the industry is consolidating around fewer battery chemistries. Analysts expect two to three additional casualties among start-ups this year and further consolidation via merger. Premium brands are countering with software subscriptions and luxury positioning, betting that brand strength can resist commoditization. Investors are rewarding the divergence: the spread between the best- and worst-performing EV stocks has widened to the highest level in five years.",
    bullets: [
      "Record deliveries but a 12% drop in average selling price for a major maker",
      "Battery costs fell 18% year over year, cushioning margins",
      "Analysts expect two to three startup casualties and further consolidation",
    ],
    deepBullets: [
      "The EV market is splitting into scale players that can absorb a price war and premium makers retreating to high-margin niches.",
      "A major manufacturer posted record deliveries but a 12% drop in average selling price as discounts deepened industry-wide.",
      "Battery costs fell 18% year over year, and the industry is consolidating around fewer chemistries — some cushion, but not enough for all.",
      "Analysts forecast two to three more startup failures and further merger consolidation this year.",
      "Premium brands are countering with software subscriptions and luxury positioning; the spread between the best and worst EV stocks is the widest in five years.",
    ],
    keyInsight:
      "EV investing has become a stock-picking game: scale or luxury, nothing in between.",
    conclusion:
      "The shakeout phase has begun, and it will determine the industry's winners for a decade.",
    publishedAt: hoursAgo(43),
  },
  {
    title: "COP Delegates Agree on Methane Reduction Timetable",
    source: "BBC News",
    sourceUrl: "https://bbc.com",
    topic: "Climate",
    region: "World",
    excerpt:
      "Negotiators at the latest climate summit agreed to a binding timetable for cutting methane emissions 40 percent by 2035, with sector-specific milestones for oil and gas, agriculture, and waste. The oil-and-gas commitments include satellite-verified reporting of super-emitter events and a phaseout of routine flaring at existing sites by 2030. Agriculture, the largest methane source in most countries, will be addressed through feed additives, manure management, and rice-field water management, with financing for smallholders. The agreement establishes a loss-and-damage fund top-up of $40 billion, less than campaigners wanted but more than expected going into the talks. Verification is the sticking point: the methane observation gap means many leaks go undetected, and new satellite constellations are only beginning to fill it. Analysts call methane the fastest lever available on near-term warming, since it traps heat far more intensely than CO2 in the first decades.",
    bullets: [
      "Binding timetable targets a 40% methane cut by 2035 with sector milestones",
      "Routine flaring to be phased out at existing oil and gas sites by 2030",
      "Loss-and-damage fund topped up by $40 billion",
    ],
    deepBullets: [
      "Delegates agreed to a binding 40% methane reduction by 2035, with sector-specific milestones for oil and gas, agriculture, and waste.",
      "Oil and gas commitments include satellite-verified reporting of super-emitters and a phaseout of routine flaring by 2030.",
      "Agriculture — the largest methane source — gets feed additives, manure management, and rice-field water programs with smallholder financing.",
      "The loss-and-damage fund was topped up by $40 billion: less than campaigners wanted, more than expected.",
      "Verification remains the weak link; new satellite constellations are only starting to close the methane observation gap.",
    ],
    keyInsight:
      "Methane is the fastest lever on near-term warming — and now it has a timetable.",
    conclusion:
      "The climate fight is getting more concrete: dates, sectors, and satellites instead of vague pledges.",
    publishedAt: hoursAgo(46),
  },
  {
    title: "Solar Plus Storage Reaches Grid Parity Across Southern Europe",
    source: "Reuters",
    sourceUrl: "https://reuters.com",
    topic: "Climate",
    region: "Europe",
    excerpt:
      "New solar-plus-storage projects in southern Europe are being built without subsidies for the first time, marking a milestone in the energy transition. Levelized costs for hybrid plants in Spain, Italy, and Greece have fallen 42 percent in three years, driven by cheaper batteries and higher solar panel efficiency. Grid operators are signing contracts at prices below wholesale market averages, and several industrial buyers have struck direct power-purchase agreements with storage attached. The combination solves solar's historic weakness — night-time and cloudy-day reliability — and makes renewable plants dispatchable on demand. Curtailment, where excess solar is wasted because the grid cannot absorb it, is falling as batteries capture surplus midday generation. Developers report financing has shifted from project-specific to portfolio-level, lowering capital costs further. Analysts expect the subsidy-free milestone to spread to central and northern Europe within three years as battery costs continue their decline.",
    bullets: [
      "First subsidy-free solar-plus-storage plants built in Spain, Italy, and Greece",
      "Levelized costs fell 42% in three years",
      "Curtailment falling as batteries capture surplus midday generation",
    ],
    deepBullets: [
      "Southern Europe is building solar-plus-storage plants without subsidies for the first time — a landmark for the energy transition.",
      "Levelized costs for hybrid plants in Spain, Italy, and Greece fell 42% in three years on cheaper batteries and more efficient panels.",
      "Grid operators are signing contracts below wholesale averages, and industrial buyers are striking direct PPAs with storage attached.",
      "Dispatchable renewables solve solar's historic reliability weakness; midday curtailment is falling as batteries absorb surplus generation.",
      "Financing has shifted to portfolio-level deals, cutting capital costs — and the milestone is expected to spread north within three years.",
    ],
    keyInsight:
      "Dispatchable renewables are now cheaper than the grid without a single subsidy.",
    conclusion:
      "The clean-energy transition just became an economic no-brainer in the sun belt.",
    publishedAt: hoursAgo(49),
  },
  {
    title: "New Alzheimer's Antibody Slows Decline in Phase 3 Trial",
    source: "STAT News",
    sourceUrl: "https://statnews.com",
    topic: "Health",
    region: "North America",
    excerpt:
      "An experimental Alzheimer's antibody slowed cognitive decline by 38 percent over 18 months in a phase 3 trial, one of the strongest results reported for a disease-modifying therapy. The drug targets a toxic protein fragment and clears amyloid plaques more selectively than earlier antibodies, with a notably lower rate of brain-swelling side effects — 9 percent versus the 20 to 30 percent seen in prior therapies. Patients in the treated arm also showed a 44 percent slower decline on activities of daily living. The trial enrolled 2,800 people with early-stage disease. Researchers attribute the improved safety profile to a dosing regimen that ramps up gradually and a modified antibody backbone. If approved, the drug would be the third in its class, and analysts project a potential market of $25 billion. Questions remain about long-term durability, cost, and whether the treatment meaningfully preserves patient quality of life beyond the measured scales.",
    bullets: [
      "Antibody slowed cognitive decline by 38% over 18 months in a 2,800-patient trial",
      "Brain-swelling side effects occurred in 9% of patients, down from 20–30%",
      "A third drug in this class could open a $25B market",
    ],
    deepBullets: [
      "An experimental antibody slowed cognitive decline by 38% over 18 months in a phase 3 trial of 2,800 early-stage Alzheimer's patients.",
      "The drug clears amyloid plaques more selectively, with brain-swelling side effects at 9% versus 20–30% for earlier antibodies.",
      "Patients showed a 44% slower decline on activities of daily living — the measure that matters most to families.",
      "A gradual dose ramp-up and a modified antibody backbone are credited for the improved safety profile.",
      "If approved, it would be the third drug in its class with a projected $25 billion market; durability, cost, and real-world quality-of-life remain open questions.",
    ],
    keyInsight:
      "The antibody class is getting safer and more effective with each generation.",
    conclusion:
      "Alzheimer's treatment is finally compounding: better drugs, better dosing, better odds.",
    publishedAt: hoursAgo(52),
  },
  {
    title: "WHO Reports Sharp Drop in Vaccine-Preventable Childhood Deaths",
    source: "The Guardian",
    sourceUrl: "https://theguardian.com",
    topic: "Health",
    region: "Africa",
    excerpt:
      "Deaths from vaccine-preventable diseases among children under five fell 41 percent over the past decade, according to new WHO data, with the largest gains in sub-Saharan Africa and South Asia. The report credits expanded routine immunization programs, new malaria and rotavirus vaccines, and community health workers who now reach rural populations once beyond the reach of health systems. Coverage of the three-dose diphtheria-tetanus-pertussis series recovered to 87 percent globally after pandemic-era disruptions. Measles remains the stubborn exception: outbreaks persist where coverage lags, and 33 million children missed first doses in the past five years. The report also highlights financing risk, with donor funding for immunization flat in real terms. Health officials say the next decade's priorities are vaccine supply-chain resilience, local manufacturing in Africa, and closing the measles gap. Despite the caveats, epidemiologists call the trend one of the clearest public-health wins on record.",
    bullets: [
      "Vaccine-preventable deaths in under-fives fell 41% in a decade",
      "DTP3 coverage recovered to 87% globally after pandemic disruptions",
      "Measles remains the exception: 33M children missed first doses in five years",
    ],
    deepBullets: [
      "Vaccine-preventable deaths among children under five fell 41% over the past decade, per new WHO data, with the biggest gains in sub-Saharan Africa and South Asia.",
      "Expanded routine immunization, new malaria and rotavirus vaccines, and community health workers reaching rural populations drove the gains.",
      "Global DTP3 coverage recovered to 87% after pandemic-era disruptions.",
      "Measles remains the stubborn exception, with 33 million children missing first doses in five years and outbreaks where coverage lags.",
      "Donor funding is flat in real terms; supply-chain resilience, African manufacturing, and closing the measles gap are the next decade's priorities.",
    ],
    keyInsight:
      "Immunization is quietly saving millions — and the measles gap shows exactly what happens when it slips.",
    conclusion:
      "One of the clearest public-health wins on record, with a clear to-do list attached.",
    publishedAt: hoursAgo(55),
  },
  {
    title: "Evidence Review: Spaced Practice and Retrieval Double Retention Rates",
    source: "Nature Reviews",
    sourceUrl: "https://nature.com",
    topic: "Education",
    region: "World",
    excerpt:
      "A meta-analysis of 254 studies covering 14,000 learners confirms that spaced practice and retrieval practice together roughly double long-term retention compared to massed study, across ages, subjects, and settings. The effects are largest when learners space sessions over days rather than hours and when retrieval is effortful — free recall beats multiple choice, and interleaved topics beat blocked ones. The review also finds the techniques are dramatically underused: classroom observations show less than 20 percent of study time employs retrieval, and most digital learning platforms still rely on single-session consumption. The authors publish a decision tree for practitioners: introduce material, test within a day, retest at expanding intervals. New findings address the why: retrieval appears to restructure memory traces rather than merely strengthen them, which explains transfer to novel problems. The review calls for redesigning assessment from a sorting mechanism to a learning mechanism.",
    bullets: [
      "Spacing and retrieval together roughly double long-term retention across 254 studies",
      "Free recall beats multiple choice; interleaving beats blocked practice",
      "Less than 20% of observed study time uses retrieval practice",
    ],
    deepBullets: [
      "A meta-analysis of 254 studies and 14,000 learners confirms spacing and retrieval together roughly double long-term retention compared with massed study.",
      "Effects are strongest with day-scale spacing, effortful free recall, and interleaved topics.",
      "Despite the evidence, classroom observations show retrieval used in under 20% of study time, and most platforms still default to single-session consumption.",
      "The authors publish a practitioner decision tree: introduce, test within a day, retest at expanding intervals.",
      "New work explains why: retrieval restructures memory traces rather than just strengthening them — which is why it transfers to novel problems.",
    ],
    keyInsight:
      "The strongest learning tools in psychology are also the most underused.",
    conclusion:
      "Assessment should be a learning mechanism, not a sorting mechanism.",
    publishedAt: hoursAgo(58),
  },
  {
    title: "Underdogs Defy Odds as Youth Academies Reshape the Tournament",
    source: "ESPN",
    sourceUrl: "https://espn.com",
    topic: "Sports",
    region: "MENA",
    excerpt:
      "This year's continental tournament has produced its deepest run of underdogs in modern history, with three nations ranked outside the top 30 reaching the quarterfinals for the first time. Analysts attribute the upsets to a decade of investment in youth academies that now supply the squads' cores. The average age of the underdog squads is 24.2, the youngest on record, and their pressing intensity — measured in possession regains per 90 minutes — is the highest of any tournament on record. Two of the three academies were built with a deliberate pedagogical philosophy: positional play taught from under-12s, with coaching continuity mandated across age groups. The results challenge the assumption that national-team success requires a domestic league with global pull, since most of the players ply their trade abroad. Broadcasters report record viewership in the regions involved, and kit sales have tripled. The favorites, meanwhile, face questions about stale tactics.",
    bullets: [
      "Three nations outside the top 30 reached the quarterfinals for the first time",
      "Squads average 24.2 years old — the youngest on record",
      "Record pressing intensity: highest possession regains per 90 minutes ever measured",
    ],
    deepBullets: [
      "Three nations ranked outside the top 30 reached the quarterfinals — the deepest underdog run in the tournament's modern history.",
      "A decade of youth-academy investment supplies the cores of all three squads, with an average age of 24.2.",
      "The underdogs press at the highest intensity ever measured in the tournament, measured in possession regains per 90 minutes.",
      "The academies share a philosophy: positional play from under-12s and mandated coaching continuity across age groups.",
      "The runs challenge assumptions about needing a global-pull domestic league, since most players are based abroad — and viewership and kit sales have surged in the regions involved.",
    ],
    keyInsight:
      "A decade of academy coaching has collapsed the gap between favorite and underdog.",
    conclusion:
      "In football, systems built patiently are beating money spent fast.",
    publishedAt: hoursAgo(61),
  },
  {
    title: "Runner Breaks Marathon Record With Negative-Split Strategy",
    source: "BBC Sport",
    sourceUrl: "https://bbc.com/sport",
    topic: "Sports",
    region: "Africa",
    excerpt:
      "A 26-year-old runner broke the marathon world record by 31 seconds, running the second half 94 seconds faster than the first — one of the largest negative splits ever recorded at the distance. The performance caps a three-year project in which the athlete's team rebuilt training around variable-speed long runs, altitude camps, and precise fueling, consuming 110 grams of carbohydrate per hour. Pace analysis shows remarkable metronomic consistency: no 5-kilometer segment varied by more than four seconds from the plan. Sports scientists say the run vindicates the negative-split model, which front-runners have traditionally avoided at the record level. The race was run on a certified, net-elevation-loss course and with legal shoe technology. The record now stands at 2:00:39, putting the sub-two-hour barrier — long considered physiologically untouchable — within sight for the next generation.",
    bullets: [
      "World record broken by 31 seconds with a 94-second negative split",
      "Pace varied by no more than 4 seconds per 5K segment from plan",
      "Record now stands at 2:00:39, with sub-two hours in sight",
    ],
    deepBullets: [
      "A 26-year-old broke the marathon world record by 31 seconds with a 94-second negative split — one of the largest ever at the distance.",
      "Three years of variable-speed long runs, altitude camps, and 110 grams of carbohydrate per hour built the performance.",
      "Metronomic pacing: no 5-kilometer segment deviated more than four seconds from the plan.",
      "Sports scientists say the run vindicates negative-split racing at the record level, upending front-running orthodoxy.",
      "The new mark of 2:00:39 puts the sub-two-hour barrier within reach of the next generation.",
    ],
    keyInsight:
      "Records at the distance are now won in the back half — by not slowing down.",
    conclusion:
      "The sub-two-hour marathon is no longer a fantasy; it's a countdown.",
    publishedAt: hoursAgo(64),
  },
  {
    title: "Streamers Bet on Interactive Formats as Subscriptions Plateau",
    source: "Variety",
    sourceUrl: "https://variety.com",
    topic: "Entertainment",
    region: "North America",
    excerpt:
      "With subscriber growth flattening across the industry, major streaming platforms are pivoting to interactive and live formats designed to boost engagement and justify price increases. Data shows the top three services added fewer new subscribers in the past quarter than in any period since 2019, while churn edged up. In response, platforms are rolling out choose-your-own-path series, live sports and shopping integrations, and 'watch parties' with creator commentary. One service reported that viewers of its interactive drama watched 40 percent more episodes and canceled at half the rate of the baseline. Advertising is becoming the growth engine: ad-tier users now generate more revenue per account than premium subscribers on two of the three platforms. Analysts warn that content costs remain unsustainably high, with scripted drama budgets still climbing, and that interactive formats are expensive to produce at scale. The industry's bet: depth of engagement replaces breadth of growth.",
    bullets: [
      "Subscriber growth hit its lowest level since 2019 as churn edged up",
      "Interactive drama viewers watched 40% more episodes and canceled at half the rate",
      "Ad-tier users now generate more revenue per account than premium subscribers on two platforms",
    ],
    deepBullets: [
      "Streaming subscriber growth hit its lowest level since 2019, pushing platforms toward interactive and live formats to drive engagement.",
      "Choose-your-own-path series, live sports, live shopping, and creator watch-parties are the headline experiments.",
      "One platform's interactive drama produced 40% more episode views and half the churn of the baseline.",
      "Advertising is the real growth engine: ad-tier users now out-earn premium subscribers per account on two of the three big services.",
      "Content costs remain unsustainably high — the industry is betting that engagement depth replaces subscriber growth.",
    ],
    keyInsight:
      "Streaming's growth era is over; the engagement era is beginning.",
    conclusion:
      "The format war is on, and attention is the prize.",
    publishedAt: hoursAgo(67),
  },
  {
    title: "Film Festival Spotlight: Breakout Features From New Directors",
    source: "IndieWire",
    sourceUrl: "https://indiewire.com",
    topic: "Entertainment",
    region: "Europe",
    excerpt:
      "This year's festival circuit has produced an unusually strong class of debut features, with six first-time directors landing major distribution deals before their premieres ended. Critics point to a common thread: patient, character-driven storytelling shot on location with natural light, and budgets under $5 million. Three of the breakout films were financed through international co-production funds, a model that's becoming the default for ambitious debuts. Streaming buyers competed aggressively for the titles, with one reported acquisition reaching $14 million — the highest for a debut at the festival in a decade. Audiences responded as well: several screenings earned extended standing ovations and one film took the audience award by the widest margin since records were kept. The class's themes skew intimate — family, migration, grief — a counterweight to franchise spectacle. Distributors hope the films' modest budgets mean that even moderate box office turns profitable quickly.",
    bullets: [
      "Six debut features landed major distribution deals before premieres ended",
      "One acquisition reached $14M — the highest for a debut in a decade",
      "The class skews intimate and low-budget, a counterweight to franchise spectacle",
    ],
    deepBullets: [
      "Six first-time directors landed major distribution deals before their premieres even ended — an unusually strong debut class.",
      "The common thread: patient, character-driven stories, natural light, and budgets under $5 million.",
      "International co-production funds financed three of the breakouts, a model becoming default for ambitious debuts.",
      "Streaming buyers competed aggressively; one acquisition hit $14 million, the highest for a festival debut in a decade.",
      "The themes are intimate — family, migration, grief — and modest budgets mean moderate box office can turn profitable quickly.",
    ],
    keyInsight:
      "Small, patient films are the festival circuit's hottest commodity.",
    conclusion:
      "The debut class of the year proves restraint is a commercial strategy.",
    publishedAt: hoursAgo(70),
  },
  {
    title: "Museums Report Record Attendance as Digital Galleries Mature",
    source: "The Art Newspaper",
    sourceUrl: "https://theartnewspaper.com",
    topic: "Culture",
    region: "France",
    excerpt:
      "Global museum attendance hit a record 940 million visits last year, with growth concentrated in Asia and among visitors under 35. Institutions credit a maturing digital strategy: ticketed blockbusters now carry virtual companions, collections are digitized with high-resolution 3D scanning, and social channels have become discovery engines rather than afterthoughts. One major museum reported that 41 percent of first-time visitors discovered it through a short-form video. The digital push has also changed who comes: evening openings designed around social content attract younger, more diverse crowds, and free-digital-first strategies are narrowing the access gap. Curators caution that digital engagement doesn't always convert to in-person depth, and that conservation budgets lag the audience boom. Several institutions are now piloting AI-powered guided tours and multilingual interpretation, with early results showing longer dwell times. The sector's question is whether the audience surge is a new baseline or a novelty effect.",
    bullets: [
      "Museum attendance hit a record 940 million visits globally",
      "41% of one museum's first-time visitors came from short-form video",
      "AI-guided tours are showing longer dwell times in pilots",
    ],
    deepBullets: [
      "Global museum attendance reached a record 940 million visits, with growth concentrated in Asia and among under-35s.",
      "A maturing digital strategy is the driver: virtual companions for blockbusters, 3D-scanned collections, and social channels as discovery engines.",
      "One major museum found 41% of first-time visitors discovered it through short-form video.",
      "Evening openings designed around social content are attracting younger, more diverse crowds, and free digital-first strategies are narrowing the access gap.",
      "Open questions remain about depth of engagement and conservation budgets; AI-guided multilingual tours are showing longer dwell times in early pilots.",
    ],
    keyInsight:
      "Digital discovery is feeding, not cannibalizing, physical attendance.",
    conclusion:
      "Culture's digital era brought the crowds back to the halls.",
    publishedAt: hoursAgo(73),
  },
  {
    title: "Rail Corridor Agreement Links Three Economies in Landmark Pact",
    source: "Al Jazeera",
    sourceUrl: "https://aljazeera.com",
    topic: "World",
    region: "MENA",
    excerpt:
      "Three nations have signed a binding agreement to complete a 2,100-kilometer rail corridor linking their economies, a project long discussed but now backed by $38 billion in coordinated financing. The corridor will cut freight transit times between the region's ports and inland industrial zones by an estimated 60 percent, and passenger service will connect seven cities currently served only by air or road. The agreement includes standardized customs clearance, joint security protocols, and a dispute-resolution mechanism — the elements that sank previous attempts. Construction is phased, with the first segment opening in three years. Economists project the corridor could lift combined GDP by 2 to 3 percent over a decade through trade creation, though they caution that such projections are notoriously optimistic. The deal is also being read geopolitically, as it gives the region an alternative to routes controlled by outside powers. Environmental groups have raised concerns about routing through sensitive habitats.",
    bullets: [
      "Binding pact covers a 2,100 km rail corridor backed by $38B in financing",
      "Freight transit times could fall 60% between ports and inland industrial zones",
      "First segment opens in three years; GDP gains projected at 2–3%",
    ],
    deepBullets: [
      "Three nations signed a binding agreement to complete a 2,100-kilometer rail corridor with $38 billion in coordinated financing.",
      "The corridor could cut freight transit times by 60% and connect seven cities currently served only by air or road.",
      "Standardized customs, joint security, and a dispute-resolution mechanism address the elements that sank previous attempts.",
      "Construction is phased with the first segment opening in three years; economists project a 2–3% GDP lift over a decade.",
      "The pact is also geopolitical — an alternative to routes controlled by outside powers — while environmental groups flag habitat concerns along the route.",
    ],
    keyInsight:
      "The deal succeeded where predecessors failed by solving governance, not just engineering.",
    conclusion:
      "A region's economic geography is about to change at 160 kilometers per hour.",
    publishedAt: hoursAgo(76),
  },
  {
    title: "Coastal Cities Pilot Nature-Based Flood Defenses",
    source: "Reuters",
    sourceUrl: "https://reuters.com",
    topic: "World",
    region: "Oceania",
    excerpt:
      "Coastal cities across three continents are piloting nature-based flood defenses — restored mangroves, oyster reefs, and dune systems — with early data suggesting they can match engineered seawalls in wave attenuation at a fraction of the cost. A two-year study across 14 pilot sites found restored mangroves reduced wave energy by up to 70 percent and halved flood depths in adjacent neighborhoods, while oyster reefs grew into self-repairing barriers that improve water quality. The costs are compelling: nature-based projects ran 40 percent cheaper per kilometer than concrete equivalents and required less maintenance. Insurance models are beginning to price the difference, with one consortium offering reduced premiums for properties behind verified natural defenses. Challenges remain: living defenses need years to mature, and extreme events can set them back, so engineers recommend hybrid designs that pair natural barriers with targeted hard infrastructure. Mayors involved call the pilots 'the most promising line of defense we have that pays for itself.'",
    bullets: [
      "Restored mangroves cut wave energy by up to 70% across 14 pilot sites",
      "Nature-based defenses cost 40% less per km than concrete equivalents",
      "One insurer consortium now offers premium discounts behind verified natural defenses",
    ],
    deepBullets: [
      "Fourteen pilot sites across three continents show nature-based defenses can match engineered seawalls at a fraction of the cost.",
      "Restored mangroves reduced wave energy by up to 70% and halved flood depths in adjacent neighborhoods.",
      "Oyster reefs grew into self-repairing barriers that also improve water quality.",
      "Nature-based projects ran 40% cheaper per kilometer than concrete, and one insurance consortium now prices the difference into premiums.",
      "Living defenses need years to mature and can be set back by extreme events, so hybrid natural-plus-hard designs are the recommended path.",
    ],
    keyInsight:
      "The cheapest seawall may be a forest.",
    conclusion:
      "Coastal resilience is going green — and insurers are starting to price it.",
    publishedAt: hoursAgo(79),
  },
  {
    title: "Electoral Reform Package Passes With Cross-Party Support",
    source: "Politico",
    sourceUrl: "https://politico.eu",
    topic: "Politics",
    region: "UK",
    excerpt:
      "A landmark electoral reform package has passed with support from the governing coalition and two opposition parties, the first time in a generation that voting-system changes have won a cross-party majority. The package introduces automatic voter registration, expands early voting to two weeks, and modernizes campaign-finance disclosure to cover digital advertising. Most significantly, it establishes an independent elections integrity commission with audit powers — a direct response to public confidence hitting historic lows. Polling shows trust in electoral processes fell below 50 percent for the first time last year. The reform's architects say the commission's independence, guaranteed by fixed appointments and dedicated funding, was the price of opposition support. Some government backbenchers complain the package concedes too much, and a referendum is still demanded by one minor party. Election administrators warn implementation will take three to four years and requires new technology that must be procured carefully. Turnout effects are debated, but analysts expect modest gains.",
    bullets: [
      "First cross-party voting reform in a generation passes into law",
      "Package creates an independent elections integrity commission with audit powers",
      "Automatic registration and two weeks of early voting included",
    ],
    deepBullets: [
      "The electoral reform package passed with a governing coalition plus two opposition parties — the first cross-party voting-system change in a generation.",
      "Automatic voter registration, two weeks of early voting, and digital-advertising disclosure are the core provisions.",
      "An independent elections integrity commission with audit powers answers a collapse in public trust below 50%.",
      "The commission's independence — fixed appointments and dedicated funding — was the price of opposition support.",
      "Implementation will take three to four years and new technology; turnout effects are expected to be modest but positive.",
    ],
    keyInsight:
      "Election reform succeeded by institutionalizing trust, not just rules.",
    conclusion:
      "The quiet work of fixing democracy is happening — and it's bipartisan.",
    publishedAt: hoursAgo(82),
  },
  {
    title: "Diplomatic Talks Resume Over Contested Trade Route",
    source: "Reuters",
    sourceUrl: "https://reuters.com",
    topic: "Politics",
    region: "Asia",
    excerpt:
      "Negotiators from the two sides of a long-contested trade route resumed talks this week for the first time in 18 months, with a framework agreement reportedly within reach. The route, which carries an estimated $180 billion in annual commerce, has been a flashpoint for a decade, with periodic closures disrupting regional supply chains. The new framework proposes shared customs checkpoints, a neutral arbitration panel, and a phased reopening schedule tied to verification milestones. Diplomats describe the talks as the most substantive in years, helped by quiet mediation from a third country and by the economic pressure of alternative routes proving more expensive than expected. Businesses on both sides welcomed the news, with logistics stocks rising on the announcement. Analysts caution that similar frameworks have collapsed before over enforcement details, and that hardliners on both sides remain influential. The next round is scheduled for next month, with a joint communiqué expected if progress holds.",
    bullets: [
      "First talks in 18 months over a route carrying $180B in annual commerce",
      "Framework proposes shared checkpoints, neutral arbitration, phased reopening",
      "Logistics stocks rose on the announcement",
    ],
    deepBullets: [
      "Negotiators resumed talks over a contested trade route after an 18-month freeze, with a framework agreement reportedly close.",
      "The route carries an estimated $180 billion in annual commerce; closures have repeatedly disrupted regional supply chains.",
      "The framework proposes shared customs checkpoints, a neutral arbitration panel, and a phased reopening tied to verification milestones.",
      "Third-country mediation and the higher-than-expected cost of alternative routes created the opening.",
      "Similar frameworks have collapsed over enforcement details before, and hardliners remain influential on both sides — but a joint communiqué may come next month.",
    ],
    keyInsight:
      "Economics, not ideology, reopened the table.",
    conclusion:
      "The most substantive talks in a decade are running on a simple engine: everyone loses money if they fail.",
    publishedAt: hoursAgo(85),
  },
  {
    title: "Tunisia's Olive Oil Exports Hit Record as Mediterranean Drought Eases",
    source: "Reuters",
    sourceUrl: "https://reuters.com",
    topic: "Business",
    region: "Tunisia",
    excerpt:
      "Tunisian olive oil exports reached a record $1.2 billion this season, helped by easing Mediterranean drought and a decade of investment in modern pressing mills. The country rose to the top tier of global exporters, with premium single-estate brands gaining shelf space in Europe, North America, and the Gulf. Producers credit two shifts: cooperative mills that pool processing and quality control for small farmers, and a national traceability system that lets buyers verify the origin of every bottle. Yields recovered to 310,000 tons, up 45 percent from last year's drought-hit crop. The sector now employs an estimated 800,000 people seasonally, making it the country's most important agricultural employer. Challenges remain: export prices are volatile, younger workers are leaving farms, and climate models project more frequent drought cycles. The government is funding drip-irrigation conversion and new reservoirs, betting that water resilience is the key to keeping the record run alive.",
    bullets: [
      "Olive oil exports hit a record $1.2B as yields recovered 45% to 310,000 tons",
      "National traceability system lets buyers verify the origin of every bottle",
      "Sector employs an estimated 800,000 people seasonally",
    ],
    deepBullets: [
      "Tunisian olive oil exports hit a record $1.2 billion, powered by easing drought and a decade of modern mill investment.",
      "Premium single-estate brands are gaining shelf space in Europe, North America, and the Gulf.",
      "Cooperative mills pooling quality control for small farmers and a national traceability system are the structural advantages.",
      "Yields recovered 45% to 310,000 tons; the sector employs an estimated 800,000 seasonal workers.",
      "Risks: volatile export prices, farm labor attrition, and climate models pointing to more frequent droughts — the government is funding drip irrigation and new reservoirs in response.",
    ],
    keyInsight:
      "Traceability turned a commodity into a brand, and the brand now outsells the commodity.",
    conclusion:
      "A record crop meets structural investment — the question is water resilience for the next dry cycle.",
    publishedAt: hoursAgo(4),
  },
];

/** Seed the database with sample briefs if it is empty. Safe to call on every request. */
export async function ensureSeeded(): Promise<void> {
  try {
    const db = getDb();
    const existing = await db.select({ c: count() }).from(articles);
    if (existing[0].c > 0) return;
    await db.insert(articles).values(seeds);
    console.log(`[seed] inserted ${seeds.length} articles`);
  } catch (err) {
    console.error("[seed] failed:", err);
  }
}
