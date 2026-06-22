# Codex Subagents Development Loop

This directory defines a small, decision-gated Codex Subagents setup for the Bara Developer Platform repository.

The goal is to make Codex useful across the full improvement loop while keeping human product judgment and final adoption decisions explicit.

## References and design influences

This configuration follows a minimal, project-specific interpretation of common practices seen in community agent and skill libraries such as VoltAgent's Codex/Claude subagent collections, Addy Osmani's engineering agent skills, and product-management skill libraries from Product on Purpose.

The main ideas borrowed are:

- clear responsibility boundaries per agent;
- explicit output formats;
- scope control before implementation;
- verification and quality gates;
- human decision checkpoints before broad changes;
- review packages that help a human evaluate real product behavior.

No external agent definition is copied wholesale. The instructions here are tailored to this Backstage-based IDP and its repository policy.

## Purpose

Use these agents to run an iterative development loop:

1. generate improvement options;
2. let a human decide what is adopted, rejected, or deferred;
3. implement only adopted items;
4. review implementation quality before product review;
5. package the change for human product review;
6. feed human review results back into the next proposal cycle.

## Human and Codex responsibilities

### Human responsibilities

The human is responsible for:

- deciding whether each proposed improvement is adopted, rejected, or deferred;
- reviewing the running product after implementation;
- judging product fit, usability, timing, and trade-offs;
- deciding whether follow-up work should enter the next loop.

### Codex responsibilities

Codex is responsible for:

- proposing improvements with impact, cost, risk, and decision points;
- translating accepted decisions into implementable work;
- implementing only accepted items;
- reviewing implementation quality, security, regressions, tests, unintended behavior, and maintainability;
- preparing a product-review package for the human reviewer;
- turning human product-review feedback into the next set of improvement options.

## Development flow

1. **Codex:** `improvement-proposer` proposes improvement options.
2. **Human:** decide adopt / reject / defer for each option.
3. **Codex:** `implementer` implements only adopted options.
4. **Codex:** `quality-reviewer` reviews the implementation before human product review.
5. **Codex:** `product-review-packager` prepares human review materials.
6. **Human:** review the actual product.
7. **Codex:** `improvement-proposer` uses the human review to propose next improvements.
8. Return to step 1.

## Agents

### `improvement-proposer`

Use when you want new improvement options from the current repository state, recent changes, known issues, or human review notes.

Responsibilities:

- propose A/B/C-style options plus a hold/defer option;
- include purpose, expected effect, implementation cost, risk, and decision points;
- separate evidence from assumptions;
- request a human decision before implementation;
- never implement changes.

### `implementer`

Use after the human explicitly accepts one or more options.

Responsibilities:

- implement accepted options only;
- avoid rejected, deferred, implied, or adjacent work;
- keep changes minimal and safe;
- respect this repository's Backstage extension policy;
- summarize changed files and validation commands.

### `quality-reviewer`

Use after implementation and before human product review.

Responsibilities:

- review for security, bugs, regressions, tests, maintainability, unintended behavior, and performance;
- assess architecture risk only when relevant;
- report findings by severity;
- avoid style-only comments;
- recommend fixes but never implement them.

### `product-review-packager`

Use after quality review to prepare the human product review.

Responsibilities:

- summarize what changed in product language;
- list routes, screens, URLs, commands, or files to inspect;
- provide review steps and a checklist;
- identify known issues, out-of-scope areas, and decision points;
- never implement or redesign anything.

## When to spawn which agent

- Spawn `improvement-proposer` at the start of a loop, after a human review, or when prioritization is unclear.
- Spawn `implementer` only after the human explicitly accepts specific options.
- Spawn `quality-reviewer` after implementation, before asking the human to review the product.
- Spawn `product-review-packager` after implementation and quality review, when the human needs a clear review guide.

Avoid spawning multiple agents for the same responsibility at the same time unless their inputs and scopes are clearly different.

## How to invoke agents

Codex does not spawn subagents automatically. Ask for the agent explicitly in the prompt. The custom agent name is the `name` value in each `.codex/agents/*.toml` file.

After adding or changing an agent definition, start a new Codex session so the project-scoped configuration is loaded.

During a CLI session, use `/agent` to inspect or switch to a spawned agent thread. The parent agent should wait for the requested agents and consolidate their results.

Example:

```text
Use the improvement-proposer subagent to inspect the current repository and propose improvements.
Do not implement anything. Wait for it to finish, save its final report using the repository output convention, and summarize the saved path.
```

## Persisting agent outputs

The parent agent persists each subagent's final Markdown report. This is required because read-only agents cannot write files themselves.

Output path:

```text
docs/ai/output/<agent-name>/NNN-<descriptive-kebab-case-name>.md
```

Rules:

- Use the custom agent `name`, not its display nickname, as the directory name.
- Number files independently for each agent, starting at `001`.
- Inspect existing files and use the next number; never overwrite an earlier report.
- Store the final decision-ready report, not raw exploration logs or full command output.
- Include a title, creation date, agent name, and request or scope at the top.
- Write headings, body text, and metadata in Japanese. Preserve code, commands, file paths, API names, and other identifiers in their original form.

Examples:

```text
docs/ai/output/improvement-proposer/001-catalog-improvement-options.md
docs/ai/output/implementer/001-adopted-catalog-changes.md
docs/ai/output/quality-reviewer/001-catalog-change-quality-review.md
docs/ai/output/product-review-packager/001-catalog-change-review-guide.md
```

## Prompt examples

### Example 1: propose improvements

```text
Spawn improvement-proposer.
Analyze the current repository state, recent changes, and known product direction.
Do not implement anything.
Return improvement proposals as A/B/C options with impact, cost, risk, and decision points.
Wait for my decision.
Save the final report according to the repository output convention.
```

### Example 2: implement accepted options only

```text
Spawn implementer.
Implement only the options I explicitly accepted:
- A: <採用内容>
- C: <採用内容>
Do not implement rejected or deferred options.
Keep changes minimal.
After implementation, summarize changed files and validation commands.
Save the final report according to the repository output convention.
```

### Example 3: quality review

```text
Spawn quality-reviewer.
Review the latest implementation before human product review.
Focus on security, bugs, regressions, tests, maintainability, unintended behavior, and performance.
Do not edit code.
Return findings by severity with evidence and recommended fixes.
Save the final report according to the repository output convention.
```

### Example 4: package for human review

```text
Spawn product-review-packager.
Prepare a review package for a human product reviewer.
Include what changed, where to look, how to verify, known issues, screenshots/URLs if available, and decision points.
Do not edit code.
Save the final report according to the repository output convention.
```

## Notes and guardrails

- Human adoption is required before implementation.
- Rejected or deferred ideas must not be implemented implicitly.
- Keep this repository's Backstage policy in mind: custom IDP behavior should generally live in `plugins/`, while `packages/app` and `packages/backend` should stay focused on wiring and registration.
- Prefer small, reversible changes over broad rewrites.
- Quality review is not a replacement for human product review.
- Product-review packaging should make the review easier, not decide the outcome.
- If the implementation scope becomes ambiguous, stop and ask for a decision instead of expanding the work.
