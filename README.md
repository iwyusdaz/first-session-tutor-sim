> **Evaluation status:** Automated functional, accessibility and performance testing plus agent-based design reviews are complete. No real learners have tested this yet. No physical phone testing has been done (mobile was checked with device emulation). See `evaluation/METHODS.md`.

# First Session: a Tutor Classroom Simulator

**Play:** https://immersive-learning-showcase.vercel.app/play/first-session-tutor-sim/ *(pending deployment)*

Run a 30-minute small-group math tutoring session with three simulated middle-school students. Read their body language, choose your tutoring moves, practice real wait time, and review a replay that shows how each student's understanding, engagement and confidence changed with your choices.

All three students are fictional, constructed for teaching purposes. Bridge Math Tutoring, the program in the story, is fictional.

## Trailer

[Trailer placeholder: not recorded yet. It needs a headed GPU capture, which is scheduled separately.]

## The problem

Tutoring quality depends on consistent, well-practiced moves: asking instead of telling, waiting after a question, noticing the student who has gone quiet. New tutors usually learn these on real students. Training courses explain the moves but give little rehearsal with feedback before the first live session.

## Audience

New tutors (college students, career changers, paraprofessionals), teacher candidates, and site coordinators who coach them. Designed for use after [`tutor-training-course`](https://github.com/iwyusdaz/tutor-training-course) Modules 2–3, before working with real students; 20–30 minutes per run. Subject: Grade 7–8 linear equations.

## Approach

This simulator is the practice layer of a three-repo training system:

- [`socratic-ai-tutor`](https://github.com/iwyusdaz/socratic-ai-tutor) defines the seven canonical tutoring moves: probing question; hint ladder (levels 0–5); wait time; specific feedback; worked example after repeated failure; confirm and ask why; offer a similar problem.
- [`tutor-training-course`](https://github.com/iwyusdaz/tutor-training-course) defines five competency domains (Relationships; Session structure; Questioning and errors; Feedback and motivation; Data use) and an observation rubric.
- This repo lets a tutor rehearse those moves on simulated students and see the consequences.

The session follows the five-part routine (warm-up → review → guided practice → independent try → exit ticket) through eight decision points: a greeting, a review, a student error, a question to the group, an interruption, a frustrated student, a correct answer and the time check. At each one the learner reads the cues, optionally marks what they noticed, picks a move and a phrasing, and (after a question) waits in real seconds. Students react through an authored rule model. The debrief replays the session as a timeline with state graphs, rubric-domain scores and coach notes. A second run with a different student mix acts as a transfer task.

| Student | Pattern |
|---|---|
| Jordan | Confident; answers fast; makes sign errors |
| Talia | Quiet; understands more than she shows |
| Sam | Discouraged by earlier failure; "I'm bad at math" |

## Key design decisions

Full list with alternatives in `DECISIONS.md`.

- **A transparent, authored student model, no AI.** 30 rules in `content/behavior-rules.json`, each with a rationale and a source. It is a simplified teaching model, not a validated psychological model. Reviewers can see exactly why a student reacted.
- **Body language over facial realism.** Posture, gaze and hand activity carry the cues. Faces stay subtle, with no lip sync, to avoid the uncanny valley (`design/realism-matrix.md`). The students are stylized procedural figures; MakeHuman was not used.
- **Real-time wait.** After a question the learner must actually wait. A 0.5×–2× scale and a manual-wait option keep it accessible; scoring uses whether they waited, not how fast they react.
- **Realistic wrong options.** The palette includes common failure modes ("tell the answer", "generic praise"), labeled as not canonical, so the replay has something to teach.
- **Replay tied to the observation rubric**, so a coach and tutor can discuss a run in the same terms as a real observation.

## Evidence & evaluation

See `evaluation/METHODS.md` for what was run and its limits.

- Rule validator (`scripts/validate-rules.mjs`, runs before every build): every option has a matching rule, phrasings, a score and a coach note; no state leaves 0–4; it walks all 51,840 complete paths across both mixes.
- Unit tests (vitest) on the student model, wait logic and scoring.
- Functional tests (Playwright) through the real UI: both mixes end to end, the mix-specific error moment, debrief explanations, text-mode parity, resume after reload, timed wait, reduced-motion cinematics.
- axe accessibility scan (zero critical/serious) and a sub-path build test.
- **What this can't show:** that rehearsal here transfers to real tutoring sessions, or that the behavior model reflects real students. No real tutors or students have used it.

## Accessibility

Full text mode with the same decisions, scoring and replay (state graphs as data tables). Captions with speaker labels for all dialogue. Keyboard operable throughout. Adjustable wait time or manual wait. Reduced-motion versions of all three cinematics, each skippable from the first frame. Text size, contrast and field-of-view settings. See `design/accessibility-plan.md`.

## Next steps

- Agent-based expert-style reviews (math teacher, tutoring coach, representation) and the revisions they drive.
- First real playtests with tutors using `evaluation/human-protocol/`.
- Optional MakeHuman CC0 characters in place of the procedural figures.
- More sessions (later weeks, other topics) using the same content format.

## Tools

three.js 0.186.1, Vite 8, pmndrs postprocessing 6.39.5 and N8AO 2.0.1, vitest, Playwright and axe-core. Poly Haven CC0 HDRI and textures (see `ATTRIBUTION.md`).

**AI-assisted authorship:** the code, content and documentation in this repo were written with AI assistance (agent-based builders) under human direction. Scenario content is constructed for teaching purposes; research claims are listed with their verification status in `research/sources.md`.

## License

Code MIT (`LICENSE`), content CC BY 4.0 (`LICENSE-CONTENT`), third-party assets CC0 or MIT (see `ATTRIBUTION.md`).
