# On the LOC Controversy

*Or: what happened when I mentioned how many lines of code I've been shipping, and what the numbers actually say.*

---

## The point, before you scroll

I am not saying engineers are going away. Nobody serious thinks that.

I am saying **engineers can fly now**. One engineer in 2026 has the output of a small team in 2013, working the same hours, at the same day job, with the same brain. The code-generation cost curve collapsed by two orders of magnitude. The metrics that measure engineering output all moved accordingly. LOC is one of them. It's a crude one. Every metric on earth is crude. That doesn't mean the shift isn't real.

This post is me doing the math honestly against my own 2013 baseline, naming what the critics are right about, putting the numbers I'd be least proud to put next to the numbers I'm most proud of, and showing the reproducibility script so you can audit me.

If you read one sentence: **the same person shipping 14 logical lines per day in 2013 is shipping 11,417 logical lines per day in 2026, and the number that matters isn't the line count, it's what those lines become.**

---

## The tidal wave

I posted that in the last 60 days I'd shipped 600,000 lines of production code.

The replies came in fast. Most of them some variation of:

- "That's just AI slop."
- "LOC is a meaningless metric. Dijkstra said so. Kernighan said so. Every senior engineer in the last 40 years said so."
- "Of course you produced 600K lines. You had an AI writing boilerplate."
- "More lines is bad, not good."
- "You're confusing volume with productivity. Classic PM brain."
- "Where are your error rates? Your DAUs? Your revert counts?"
- "This is embarrassing."

Some of those replies are right. Some miss the point. This post is me doing the math honestly so I can tell the difference, and so I can respond to the steelman instead of the strawman.

## Why LOC became the lightning rod

The AI coding critique has three branches. They get collapsed into one.

**Branch 1: LOC doesn't measure quality.** True. A 50-line well-factored library beats a 5,000-line bloated one. Dijkstra wrote that in 1988 ("programmers are a cost, not an asset") and it was right then and right now.

**Branch 2: AI inflates LOC.** True. LLMs generate verbose code by default. More boilerplate. More defensive checks. More comments. More tests. Raw line counts go up even when "real work done" didn't.

**Branch 3: Therefore bragging about LOC is embarrassing.** This is where the argument jumps the track.

Branch 1 has always been true, including before AI. It was never a killer argument. It was a reminder to think about what you're measuring.

Branch 2 is the interesting one. If raw LOC is inflated by some factor, the honest thing is to compute the deflation and report the deflated number. That's what this post does. Then it takes the next step and applies a second deflation for AI verbosity, because a neckbeard is correct that `cloc` was written to strip blanks, not to strip defensive null-checks.

## Logical SLOC, not raw LOC

The standard response to "raw LOC is garbage" is **logical SLOC**, sometimes called **source lines of code** (SLOC) or **non-comment non-blank** (NCLOC). Tools like `cloc` and `scc` have computed this for 20 years. Same code, fluff stripped:

- No blank lines
- No single-line comments
- No comment block bodies (best effort)
- No trailing whitespace

Logical SLOC doesn't eliminate AI inflation entirely. AI writes 2-3 defensive null checks where a senior engineer would write zero and rely on type guarantees. AI inlines try/catch around things that don't throw. AI spells out `const result = foo(); return result` instead of `return foo()`. NCLOC counts all of that.

**So let's apply a second deflation.** Assume AI-generated code is 2x more verbose than senior hand-crafted code at the logical level, on top of the blank-and-comment stripping. That's aggressive — most careful measurements I've seen put the multiplier at 1.3x to 1.8x — but it's the upper bound a skeptic would demand.

- My 2013 per-day rate: 14 logical lines
- My 2026 per-day rate, NCLOC: 11,417
- My 2026 per-day rate, NCLOC with 2x AI-verbosity deflation: **5,708 logical lines**

Multiple on daily pace, with both deflations: **408x**. Cut it in half again and call me a pathological liar: **204x**. At which point you should ask yourself whether 200x is a more defensible number than 810x, or whether the entire argument about "maybe the multiple is smaller" matters when the smaller number is still 200x.

## The method

To compare 2013 me vs 2026 me honestly, I wrote a script: `scripts/garry-output-comparison.ts` in this repo. It:

1. Enumerates every commit authored by me in 2013 and 2026, filtered by email (`garry@ycombinator.com` plus historical aliases).
2. For each commit, runs `git show --format= --unified=0 <commit>` and counts the added lines from the diff.
3. Classifies each added line as logical or not using regex filters per language (blank, single-line comment, docstring markers).
4. Aggregates per year. Normalizes by day.

I cloned all 41 repos owned by `garrytan/*` on GitHub — 15 public, 26 private — and ran the script against each. Bookface, the YC-internal social network I built in 2013 and 2014, is in the corpus. So are the three 2013-era projects (delicounter, tandong) and the upstream OSS contribution that year (zurb-foundation-wysihtml5).

One repo excluded from the 2026 numbers: **tax-app**. It's a demo app I built for an upcoming YC channel video, not production shipping work, so it shouldn't count. Baked into the script's `EXCLUDED_REPOS` constant.

## The numbers

### Year-to-date (raw volume comparison)

2013 was a full year. 2026 is day 108 as of this writing (April 18).

- **2013 full year:** 5,143 logical lines added
- **2026 through April 18:** 1,233,062 logical lines added
- **Multiple: 240x**

### Run rate (pro-rata, apples-to-apples)

Normalize to **logical SLOC per calendar day**:

- **2013:** 5,143 / 365 = **14 logical lines per day**
- **2026:** 1,233,062 / 108 = **11,417 logical lines per day**
- **Multiple: 810x** on daily pace

Apply the AI-verbosity deflation described above (generous 2x cut): **5,708 effective logical lines per day, 408x.**

### The distribution check (the one neckbeards will demand)

"Your per-day number assumes uniform output. Show the weekly distribution. If it's a single burst, your run-rate is bogus."

Fair. Per-week logical SLOC added across 2026 so far:

- Weeks 1-4: ~8,800 / day avg
- Weeks 5-8: ~12,100 / day avg
- Weeks 9-12: ~10,900 / day avg
- Weeks 13-15: ~13,200 / day avg

It's not a spike. The rate has been approximately consistent and slightly increasing. If you want the raw weekly breakdown, run the script yourself.

### Supporting numbers

| Metric | 2013 | 2026 YTD | To-date | 2026 run rate | Run-rate multiple |
|---|---:|---:|---:|---:|---:|
| Logical SLOC | 5,143 | 1,233,062 | **240x** | 11,417/day | **810x** |
| Logical SLOC (w/ 2x AI-verbosity deflation) | 5,143 | 616,531 | **120x** | 5,708/day | **408x** |
| Raw lines added | 6,794 | 1,677,973 | 247x | 15,537/day | 835x |
| Commits | 71 | 351 | 4.9x | 3.3/day | 16.7x |
| Files touched | 290 | 13,629 | 47x | 126/day | |
| Active repos | 4 | 15 | 3.75x | | |

Commits went up 16.7x. Files went up 47x. Logical SLOC went up 240x to-date, 810x on pace. The ratios aren't the same, but they all point the same direction, and the commits metric is hard to inflate — one commit is one commit.

## But is the code good?

The next layer of critique, channeled through the David Cramer voice: OK, so you're pushing more lines. Where are your error rates? Your post-merge reverts? Your bug density? If you're typing at 10x speed but shipping 20x more bugs, you're not leveraged, you're just making noise at scale.

This is the most legitimate critique and I'll answer it with specifics.

**Reverts on the 2026 corpus.** I ran `git log --grep="^revert" --grep="^Revert" -i` across the 15 active repos. Result: **7 reverts in 351 commits = 2.0% revert rate**. For context, the large open-source projects I have data for (Kubernetes, Rails, Django) run 1.5-3% historically. I'm in that band, not above it.

**Post-merge fix commits.** Commits matching `^fix:` that reference a prior commit on the same branch: **22 of 351 = 6.3%**. Healthy fix cycle. A zero-fix rate would mean I'm not catching my own mistakes.

**Tests.** 2026 commits include test coverage on every non-trivial branch, because gstack's own `/ship` skill won't let me merge without it. Test count across these repos grew from ~100 total in early 2026 to over 2,000 now. They run in CI. They catch regressions. Every gstack PR has a coverage audit in the PR body. I can show you the audits.

**Production signal.** gstack has tens of thousands of daily active users (telemetry-reported, community tier, opt-in). gbrain has hundreds of beta testers running it live. resend_robot processes email through a real API with paid credits. brain runs my personal assistant — I use it every day. These aren't scaffolds sitting in a drawer.

I am NOT going to claim every shipped repo has a million DAUs. Most of these are tools for me, or for small communities, or for internal YC use. The neckbeard is right that "I shipped it" is not "it's used." But the same was true of my 2013 output, and the 2013 baseline isn't "shipped AND adopted," it's "shipped." The comparison is fair.

**Review rigor.** Every gstack branch I merge goes through CEO review, Codex outside-voice review, DX review, and eng review. Often 2-3 passes of each. The `/plan-tune` skill I just shipped (v0.19.0.0) had a scope ROLLBACK from the CEO EXPANSION plan because Codex's outside-voice review surfaced 15+ findings my four Claude reviews missed. That's not a victory lap — that's a model for how this works. The review infrastructure catches the slop. It's visible in the repo. Anyone can read it.

**Adversarial checks.** Every diff gets a Claude adversarial subagent AND a Codex adversarial challenge at minimum. Large diffs get a third Codex structured review with a P1 gate. That's 3-4 AI reviewers looking at the code before merge. Not to replace human judgment. To catch what I miss because I'm typing at AI speed.

**Greptile.** Integrated into the /ship workflow. Every PR gets its comments triaged and addressed.

Is some of the 1.3M logical lines going to turn out to be wrong? Yes. Some of it has already been rewritten. Some of it will be rewritten again. That's normal shipping. 6.3% fix-commit rate, 2.0% revert rate, 2,000+ tests. These are numbers, not vibes.

## What the critics are actually right about

I'm going to steelman harder than the existing steelman section usually does. Here are the things I'll concede:

**Greenfield vs maintenance.** 2026 numbers are dominated by new-project code. Mature-codebase maintenance produces fewer logical lines per day because you're editing, deleting, refactoring, not adding. If you're asking "can Garry 100x the team that maintains 10 million lines of legacy Java at a bank," my number doesn't prove that. Someone else will have to run their own script on a different context. I bet the number is still up and to the right. But I don't have that data.

**Logical SLOC still includes AI verbosity.** Conceded above. Applied a 2x deflation factor as a reasonable upper bound. Still 408x. If you think the right deflation is 5x (which I'd argue is unfounded based on my own reading of the diffs), the multiple is 162x. At 10x (pathological), it's 81x. At 100x (impossible — one line per minute is not a human constant), it's 8x. **Pick your priors. The number is large regardless.**

**The 2013 baseline has survivorship bias.** My 2013 public activity was low because most of my work that year was private. This analysis includes Bookface (2013-2014, private, 22 active weeks) which was one of my biggest projects that year, so the bias is smaller than it looks. It's not zero. If the true 2013 per-day rate was 50 instead of 14 (3.5x higher), the multiple at current pace is 228x instead of 810x. Still high.

**Quality-adjusted productivity isn't fully proven.** I don't have a clean bug-density comparison between 2013-me and 2026-me. What I can say: my revert rate is in the normal band for large OSS projects, my fix rate is healthy, and the review rigor caught 15+ real issues on the most recent plan. That's evidence, not proof. A skeptic can discount it.

**"Shipped" means different things across eras.** The 2013 products that shipped ran for weeks or months and then stopped, usually because I abandoned them. Some of the 2026 products may share that fate. If two years from now 80% of what I shipped this year is dead, the critique "you built a bunch of unused stuff" will have teeth. I accept that reality check. But it also applies to every new product ever built by a well-funded team.

**Time to first user is the metric that matters, not LOC.** The 60-day cycle from "I wish this existed" to "it exists and at least one person is using it" is the real shift. LOC is downstream evidence of that cycle. The right metric is something like "shipped products per quarter" or "working features per week." Those go up by a similar multiple. I don't have 2013 baseline data for them. The LOC number is the best proxy I have.

Take those seriously. Some of the critique is right. The point is that "LOC is meaningless" doesn't engage with what the normalized, deflated, distribution-checked, revert-audited number actually shows.

## The real argument

The interesting part of the number isn't the volume. It's the rate. And the rate isn't a statement about me. It's a statement about the ground underneath all software engineering.

2013 me shipped about 14 logical lines per day. That was normal for me at the time. Cofounder at Posterous, then partner at YC, writing code nights and weekends mostly.

2026 me is shipping 11,417 logical lines per day. While still running YC full-time. Same day job. Same free time. Same person.

The delta isn't that I became a better programmer. If anything, my mental model of coding has atrophied — I can't remember the last time I wrote a regex from scratch. The delta is that AI let me actually ship the things I always wanted to build. Small tools. Personal products. Experiments that used to die in my notebook because the time cost to build them was too high relative to their value. The gap between "I want this tool" and "this tool exists and I'm using it" collapsed from 3 weeks to 3 hours.

This is what I mean by "engineers can fly now." The physics of what an individual engineer can ship, measured in whatever metric you want that isn't dumb, moved by two orders of magnitude. Pilots didn't replace walkers. Walkers are still useful. But if you're still walking to get across the country, you're making a choice. The pilot is not more valuable as a person. The pilot is using a tool you're choosing not to use.

The engineers who will do the best work of the next decade are the ones who absorb this. Not by copying AI suggestions uncritically — that makes you slower and worse. By building the review infrastructure, the test infrastructure, the taste infrastructure that lets you type at AI speed without dropping the quality floor. That's the actual skill now. It's harder than it was when you were writing one line at a time.

The LOC number is evidence of that. The critics are arguing about the shadow on the wall.

## The corrected hero line

My 2026 run rate on logical code change, not raw LOC which AI inflates, is about **810x my 2013 pace on NCLOC**, or **408x after applying a generous AI-verbosity deflation**. In less than a third of 2026, I've already produced **240x the entire 2013 year** on the strict NCLOC number. Measured across 40 of my public and private repos including Bookface, after excluding one repo (tax-app) that's a demo for an upcoming YC video.

Revert rate: 2.0%. Fix-commit rate: 6.3%. Test count: 100 → 2,000+. Review rigor: 4 reviewers per ship.

Adjusted for real code. Normalized by calendar day. Distribution-checked across weeks. Audited by a script anyone can re-run.

I have more leverage, not less. By a lot. And the reason isn't that AI types faster than me. It's that I can try more things, fail more cheaply, and ship more of what I want to ship. Engineers can fly now.

If that's embarrassing, fine. I'd rather be embarrassed and shipping than the opposite.

## Reproducibility

The script is in this repo at [`scripts/garry-output-comparison.ts`](../scripts/garry-output-comparison.ts). Run it yourself:

```bash
# Against a single repo
bun run scripts/garry-output-comparison.ts --repo-root <path>

# Output includes both calculations:
#   multiples.to_date.logical_lines_added  (raw volume ratio)
#   multiples.run_rate.logical_per_day     (per-day pace ratio)
```

If you want to run it against my full corpus, you'd need read access to my private repos. For the public 15, `gh repo list garrytan --visibility=public` gives you the list.

The script is under MIT. Fork it. Point it at your own email aliases. Run it against your own commits, 2013 vs 2026. If your number isn't 10x up, ask why. If it is, the argument about LOC was always about who's been doing the math and who hasn't.

The code keeps shipping.

---

*Methodology details, per-repo breakdowns, and caveats: see `~/throughput-analysis-$(date).md` after running the aggregation, or the `multiples` + `caveats_global` blocks in the per-repo JSON output.*
