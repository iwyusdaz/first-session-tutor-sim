# Sources — First Session, a Tutor Classroom Simulator

Every claim used in the simulator, with its source, access date and status.
Statuses: **VERIFIED** (opened and read here), **VIA COMPANION** (verified in a companion repo's research log, cited from there, not re-opened here), **UNVERIFIED** (could not be opened; not used as a factual claim).

Access date for all entries: 2026-10-27 unless noted.

## Canonical vocabulary (copied, not reworded)

| Item | Source | Status |
|---|---|---|
| The seven canonical tutoring move names: probing question; hint ladder (levels 0–5); wait time; specific feedback; worked example after repeated failure; confirm and ask why; offer a similar problem. Rules P1–P7 and the ladder mapping (L0 probing question … L5 full solution) | `socratic-ai-tutor/spec/pedagogy-rules.md` v1.0 (2026-10-25), https://github.com/iwyusdaz/socratic-ai-tutor | VERIFIED (file read) |
| Five competency domains: Relationships, Session structure, Questioning and errors, Feedback and motivation, Data use; behaviors R1–R4, S1–S4, Q1–Q6, F1–F5, D1–D4; the five-part routine warm-up 5′ → review 5′ → guided practice 12′ → independent try 5′ → exit ticket 3′ | `tutor-training-course/research/competency-model.md` v1.0 (locked), https://github.com/iwyusdaz/tutor-training-course | VERIFIED (file read) |
| Observation rubric: five domains × four levels with behavioral anchors; "exit ticket skipped caps Domain 2 at 1" | `tutor-training-course/docs/coaching/observation-rubric.md` | VERIFIED (file read) |
| Misconception taxonomy M1–M5 for Grade 7–8 linear equations (M3: distributing incorrectly, `2(x − 4) → 2x − 4`; M2 sign errors; M5 equals sign as "answer comes next", grounded in Knuth et al. 2006) | `tutor-training-course/research/evidence-notes.md` §5 | VIA COMPANION |

## Research claims

| Claim used | Source | Status |
|---|---|---|
| Teachers in the original studies waited about 1 second after a question; extending wait time to 3–5 seconds increased the length of student responses and the number of unsolicited appropriate responses, among other changes | Rowe, M. B. (1972). *Wait-Time and Rewards as Instructional Variables: Their Influence on Language, Logic, and Fate Control.* ERIC ED061103, https://eric.ed.gov/?id=ED061103 (abstract read via the ERIC API) | VERIFIED (abstract) |
| A literature review of wait-time effects and of training procedures to increase wait time | Rowe, M. B. (1986). Wait Times: Slowing Down May Be a Way of Speeding Up. *Journal of Teacher Education*. ERIC EJ333700 | VERIFIED (abstract only; full text 403) |
| Tutoring effects shrink at scale; implementation quality and consistent, trained tutors are what programs struggle to sustain | Stanford NSSA, *How is high-impact tutoring enduring after ESSER?* https://nssa.stanford.edu/briefs/how-is-high-impact-tutoring-enduring-after-esser | VIA COMPANION (`tutor-training-course/research/evidence-notes.md` §1, §4, verified 2026-10-25; page did not load here) |
| Self-generated repair beats received repair; process-level feedback beats person-level praise | Chi et al. (1989); Hattie & Timperley (2007), as cited in `socratic-ai-tutor/spec/pedagogy-rules.md` P3–P4 | VIA COMPANION |
| Worked examples after repeated failure consolidate learning for novices | Sweller et al. (2019); Kapur (2008), as cited in pedagogy-rules P7 | VIA COMPANION |
| Simulation-based practice in teacher education has positive average effects | Chernikova et al. (2020), *Review of Educational Research* | UNVERIFIED (publisher page returned 403). Not stated as a fact anywhere in the app or docs. |
| Practice-based training transfers better than lecture-based training | Devlin Peck, *The ROI of practice-based training* (practitioner source named in plan 07) | UNVERIFIED (not opened). Not used. |

## What is fictional or constructed

- **Students A, B, C and their names, appearance and dialogue** are fictional and constructed for teaching purposes. They are not based on real children.
- **The student-state model** (understanding, engagement, confidence, each 0–4) and every rule in `content/behavior-rules.json` are a **simplified teaching model, not a validated psychological model**. Each rule cites the move rationale it encodes (above); none claims to predict real students.
- **The school and program framing** (Bridge Math Tutoring) is fictional, shared with `tutor-training-course`.
