# Alignment matrix

Each decision point maps to an objective (`design/learning-objectives.md`), a competency domain from [`tutor-training-course`](https://github.com/iwyusdaz/tutor-training-course) (Relationships; Session structure; Questioning and errors; Feedback and motivation; Data use), the canonical move it practices from [`socratic-ai-tutor`](https://github.com/iwyusdaz/socratic-ai-tutor), and how it is assessed. Option scores (1–4) use the observation-rubric anchors and live in `content/session.json`.

| Moment | Clock | Routine block | Situation | Objective | Primary domain | Best option (canonical move or behavior) | Assessed by |
|---|---|---|---|---|---|---|---|
| m1 | 0:30 | Warm-up | Greeting | 3 | Relationships | Greet by name and reference last session (R1, R2) | Option score, Domain 1 |
| m2 | 5:00 | Review | Review of last exit ticket | 1, 6 | Session structure; Data use | Review from last exit ticket (S1, D3) | Option score, Domains 2 and 5 |
| m3 | 11:00 | Guided practice | A student error (follows the mix's misconception) | 2, 5 | Questioning and errors | **probing question** (P3) | Option score, Domain 3; understanding change |
| m4 | 14:00 | Guided practice | Question to the group | 2, 4 | Questioning and errors | **probing question** + **wait time** (Q4) | Option score; wait compliance |
| m5 | 16:30 | Guided practice | Interruption by the dominant student | 3 | Relationships | Redirect and invite another student (R4) | Option score, Domain 1; quiet student engagement |
| m6 | 20:00 | Independent try | Discouraged student stuck after repeated failure | 2 | Feedback and motivation; Questioning and errors | **worked example after repeated failure** (P7) | Option score, Domains 3 and 4 |
| m7 | 23:30 | Independent try | A correct answer | 2, 4 | Feedback and motivation | **confirm and ask why** (P4) + **wait time** | Option score; wait compliance |
| m8 | 27:00 | Exit ticket | Time check | 1, 6 | Session structure; Data use | Give the exit ticket (S3, D1) | Option score, Domains 2 and 5 |

Other canonical moves appear as alternatives: **hint ladder (levels 0–5)** at m3 and m6, **specific feedback** at m6, **offer a similar problem** at m7 and m8.

## Debrief

The debrief totals the option scores per rubric domain with evidence links to the moments, shows each student's understanding, engagement and confidence over time, and gives a coach note for every chosen option (`content/coach-notes.json`). Pre-check and post-check items (`content/items.json`) are parallel items on objectives 2–6.
