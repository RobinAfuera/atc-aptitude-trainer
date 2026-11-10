# Roadmap

What is planned, roughly in the order I intend to build it. Sizes are honest
guesses for one person: **S** is 1 to 2 hours, **M** is 3 to 5 hours, **L** is
6 to 10 hours. Taken together this is somewhere between 80 and 140 hours of
work.

Version 0.1 (done) has the session engine, scoring, the session log, and two
drills: mental arithmetic and heading turns.

## Rules for every new drill

- **Original content only.** A drill is either a general task (arithmetic,
  geometry) or an implementation of a paradigm from the published literature,
  with the source named here. Nothing is copied or reconstructed from an
  official selection test.
- **Generated, seeded items.** Items come from the seeded RNG, so sessions are
  reproducible and generators are testable.
- **Tests first for anything with a right answer.** Generators, geometry and
  scoring get unit tests that check answers independently.
- **Keyboard first.** Every drill can be run without the mouse.

## 0.2 Attention and memory

- [ ] **Vigilance clock** (M). A dot steps round a clock face once a second;
      press a key when it skips a position. Sustained attention over several
      minutes, scored on hits, misses and false alarms. Based on the Mackworth
      Clock Test (Mackworth, 1948). Needs a continuous-task mode in the
      session engine, which today only knows discrete items.
- [ ] **Digit span** (M). A string of digits is spoken once (Web Speech API,
      with an on-screen fallback); type it back, forwards or reversed. Span
      length grows after a correct answer. Classic digit span task.
- [ ] **Session review** (S). After a session, list each item with the answer
      given, the correct answer and the response time.
- [ ] **On-screen keypad** (S). Number pad for mental arithmetic on touch
      devices, where the system keyboard hides half the screen.

## 0.3 Statistics

- [ ] **Progress charts** (M). Score, accuracy and mean response time across
      sessions, per drill and level.
- [ ] **Weak spots** (M). Break results down by item kind (for example
      subtraction against division, left against right turns) and show where
      time and errors go. Needs item kinds stored with each response.
- [ ] **Export and import** (S). Download the session log as JSON, load it
      back on another device, and export CSV for a spreadsheet.
- [ ] **Practice totals** (S). Time on task, sessions per week, current
      streak.

## 0.4 Adaptive difficulty

- [ ] **Parametric difficulty** (M). Replace the three fixed levels with
      continuous parameters per drill (operand range, heading step, time
      limit) that levels are just presets of.
- [ ] **Staircase** (L). Adjust difficulty item by item with a transformed
      up-down rule (three correct to step up, one miss to step down, which
      settles near 79% correct; Levitt, 1971). Report the difficulty reached,
      not only the score.
- [ ] **Mixed circuit** (M). One session that chains several drills at the
      difficulty each one has reached, as a daily workout.

## 0.5 More spatial drills

- [ ] **Relative bearings** (M). "Traffic at your two o'clock, you are heading
      310: on what bearing is it?" Reuses the heading logic and compass.
- [ ] **Grid navigation** (M). Distance and heading between two points on a
      coordinate grid.
- [ ] **Mental rotation** (M). Are two figures the same shape rotated, or
      mirror images? After Shepard and Metzler (1971), with generated 2D
      figures.
- [ ] **Cube nets** (L). Which cube does this flat pattern fold into?
      Requires generating valid nets, marking faces, and rendering candidate
      cubes; the folding logic needs thorough tests.

## 0.6 Radar

- [ ] **Radar scope** (L). A simplified plan-view display: aircraft with
      heading, speed and flight level, moving in real time on a canvas, with
      data labels. Simulation logic separate from rendering.
- [ ] **Conflict detection** (L). Flag the pairs of aircraft that will lose
      separation. Built on closest-point-of-approach geometry, unit-tested
      against hand-worked cases.
- [ ] **Vectoring scenarios** (L). Give heading and level instructions to keep
      traffic separated through a generated scenario; scored on separation
      kept and instructions used.

## 0.7 Multitasking

- [ ] **Dual task** (L). Check whether sums are right while keeping a drifting
      marker inside a box with the arrow keys. Scored on both tasks and on the
      drop compared with doing each alone.
- [ ] **Rule switching** (M). Sort cards by a rule that changes without
      warning; work out the new rule from feedback. Task-switching paradigm.

## Throughout

- [ ] **Accessibility pass** (M). Announce time remaining to screen readers,
      audit contrast and focus order, add a high-contrast theme.
- [ ] **French interface** (M). Extract all text and add French.
- [ ] **End-to-end tests** (M). Playwright runs of a full session per drill,
      in CI.
- [ ] **Timing audit** (S). Measure how far `setTimeout` and the animation
      clock drift on slow machines, and document the accuracy of recorded
      response times.
- [ ] **Offline install** (S). Make the app installable and usable with no
      connection.
- [ ] **Dark theme** (S). For practising in the evening.

## Not planned

- Accounts, cloud sync or leaderboards. Results stay on the device.
- Copies of, or question banks from, any real selection test.
- Personality questionnaires or English-language tests.
