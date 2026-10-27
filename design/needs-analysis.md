# Needs analysis

## The performance gap

New tutors usually learn the core moves of small-group tutoring (asking instead of telling, waiting after a question, noticing the student who has gone quiet) on real students. Training courses explain the moves, but a course alone gives little rehearsal with feedback before the first live session.

The companion course, [`tutor-training-course`](https://github.com/iwyusdaz/tutor-training-course), defines what good practice looks like (five competency domains and an observation rubric). The companion spec, [`socratic-ai-tutor`](https://github.com/iwyusdaz/socratic-ai-tutor), names the seven canonical tutoring moves. This simulator is the practice layer between the two: a safe place to try the moves on simulated students and see the consequences in a replay.

## Why a simulation (and not more reading)

- The skill is noticing and responding in the moment. Body-language cues (slumping, looking away, pencil down, hand up) are hard to rehearse from text alone, so the scene shows them.
- Wait time is a timing habit. A real-seconds wait mechanic lets the learner feel how long three seconds of silence is.
- A replay with state graphs makes cause and effect visible: which move changed which student.

The claim that rehearsal here transfers to real sessions is **not** established by this project. See `evaluation/METHODS.md`.

## Constraints

- Runs in a browser with no install, no account and no AI or API key.
- 20–30 minutes per run; usable right after `tutor-training-course` Modules 2–3.
- Desktop first; mobile supported on the Low preset.
- Full text-mode parity for learners who can't or don't want to use the 3D view.

## What is out of scope

Free-text or spoken tutor input, multi-week progress, other subjects, and AI-driven students (plan 07 §4).

## Context

All students, the session and the program framing (Bridge Math Tutoring) are fictional and constructed for teaching purposes.
