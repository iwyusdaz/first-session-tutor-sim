# Shot list

Source of truth: `content/cinematics.json`. Total runtime 35 s (budget 90 s; each shot ≤ 25 s). Every shot is captioned, skippable from the first frame (Skip button or Esc), and has a reduced-motion version. No cinematic plays while a decision is on screen. The replay is learner-controlled, not a cinematic.

| Shot | Purpose | Duration | Description | Reduced-motion version |
|---|---|---|---|---|
| S1 Walking in | Orient + motivate | 15 s | The camera follows the tutor's view from the doorway to the near side of the table. Three students sit across: one talking, one with a pencil ready, one leaning back with a hood up. Whiteboard behind them, wall clock to the right. | Still frame of the table from the tutor's seat, with both captions |
| S2 Time check | Orient | 5 s | The view turns to the wall clock, which shows three minutes left. Plays before the m8 choices appear. | Still frame of the wall clock with the caption |
| S3 Debrief open | Reveal | 15 s | The camera rises above the table to an overview of the three students while the debrief timeline appears. | Still overview of the table with both captions |

Camera paths are CatmullRom curves with easing, played by the template shot player (`src/cinematics/shot-player.js`). No depth of field or other post effects are used outside cinematics.
