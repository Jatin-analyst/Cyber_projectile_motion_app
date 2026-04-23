# Implementation Plan: Projectile Motion Simulator

## Overview

Build a pure client-side educational web app using HTML, CSS, and JavaScript (ES modules). The implementation follows three layers: Physics_Engine (pure functions), State Layer (ProjectileList CRUD + validation), and UI Layer (DOM rendering + Chart.js integration). Property-based tests use fast-check with Vitest; unit tests cover concrete examples and structural checks.

## Tasks

- [x] 1. Set up project structure and testing framework
  - Create `index.html`, `style.css`, `physics.js`, `state.js`, `ui.js` files
  - Add `package.json` with Vitest and fast-check as dev dependencies
  - Add `vitest.config.js` (jsdom environment for DOM tests)
  - Create `tests/` directory with placeholder test files: `physics.test.js`, `state.test.js`, `ui.test.js`
  - _Requirements: 7.3_

- [x] 2. Implement Physics_Engine (`physics.js`)
  - [x] 2.1 Implement `computeT(v0, theta, g)`
    - Convert theta to radians internally: `theta * Math.PI / 180`
    - Return `Math.round((2 * v0 * Math.sin(rad)) / g * 100) / 100`
    - _Requirements: 3.1, 3.3, 3.4_

  - [x] 2.2 Implement `computeR(v0, theta, g)`
    - Convert theta to radians internally
    - Return `Math.round((v0 ** 2 * Math.sin(2 * rad)) / g * 100) / 100`
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 2.3 Implement `computeTrajectory(v0, theta, g, numPoints = 50)`
    - Sample `numPoints` (minimum 50) equal time steps from `t=0` to `t=T`
    - Compute `x = v0 * cos(rad) * t`, `y = Math.max(0, v0 * sin(rad) * t - 0.5 * g * t²)`
    - Return array of `{ x, y }` objects
    - _Requirements: 5.4, 5.5_

  - [ ]* 2.4 Write property test for `computeT` — Property 3
    - **Property 3: T formula correctness**
    - **Validates: Requirements 3.1, 3.3, 3.4**
    - Use `fc.float({ min: 0.01, max: 1000 })` for v0, `fc.float({ min: 0.01, max: 89.99 })` for theta, `fc.float({ min: 0.01, max: 100 })` for g
    - Assert result equals `round2((2 * v0 * sin(rad)) / g)`
    - Minimum 100 iterations

  - [ ]* 2.5 Write property test for `computeR` — Property 4
    - **Property 4: R formula correctness**
    - **Validates: Requirements 3.2, 3.3, 3.4**
    - Same arbitraries as P3
    - Assert result equals `round2((v0² * sin(2 * rad)) / g)`
    - Minimum 100 iterations

  - [ ]* 2.6 Write property test for trajectory kinematic equations — Property 8
    - **Property 8: Trajectory points satisfy kinematic equations**
    - **Validates: Requirements 5.4**
    - For each point at time `t`, assert `x ≈ v0 * cos(rad) * t` and `y ≈ v0 * sin(rad) * t - 0.5 * g * t²` (within floating-point tolerance, clamped at 0)
    - Minimum 100 iterations

  - [ ]* 2.7 Write property test for trajectory minimum length — Property 9
    - **Property 9: Trajectory has at least 50 data points**
    - **Validates: Requirements 5.5**
    - Assert `computeTrajectory(v0, theta, g).length >= 50` for all valid inputs
    - Minimum 100 iterations

  - [ ]* 2.8 Write unit test for reference values
    - Assert `computeT(20, 45, 9.81) === 2.89` and `computeR(20, 45, 9.81) === 40.77`
    - _Requirements: 3.5_

- [x] 3. Checkpoint — Ensure all Physics_Engine tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement State Layer (`state.js`)
  - [x] 4.1 Define `ProjectileEntry` factory and `ProjectileList` initial state
    - `createEntry(id)` returns entry with `label`, `v0: ""`, `theta: ""`, `g: "9.81"`, `errors: {v0:null, theta:null, g:null}`, `result: null`
    - `ProjectileList = { entries: [createEntry(1)], nextId: 2 }`
    - _Requirements: 1.3, 1.4, 1.7_

  - [x] 4.2 Implement `addEntry()`
    - No-op if `entries.length === 10`
    - Appends new entry with auto-incremented id and label "Projectile N"
    - _Requirements: 1.5, 6.4, 6.5_

  - [x] 4.3 Implement `removeEntry(id)`
    - No-op if `entries.length === 1`
    - Removes entry by id, then re-labels remaining entries "Projectile 1", "Projectile 2", …
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 4.4 Implement `updateField(id, field, value)`
    - Updates the raw string value of `v0`, `theta`, or `g` on the matching entry
    - Clears the error for that field on update
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 4.5 Implement `validateEntry(entry)`
    - Returns `{ valid: boolean, errors: { v0, theta, g } }`
    - Empty/NaN → "This field is required."
    - v0 ≤ 0 → "Initial velocity must be a positive number."
    - theta outside (0, 90) → "Angle must be between 0 and 90 degrees (exclusive)."
    - g ≤ 0 → "Gravitational acceleration must be a positive number."
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 4.6 Implement `calculateAll()`
    - Validate all entries first; if any invalid, set errors and return early (all results remain null)
    - If all valid, call `computeT`, `computeR`, `computeTrajectory` for each entry and store in `result`
    - _Requirements: 2.5, 3.1, 3.2_

  - [ ]* 4.7 Write property test for invalid input rejection — Property 1
    - **Property 1: Invalid inputs are rejected by validation**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
    - Generate entries with at least one invalid field (v0 ≤ 0, theta outside (0,90), g ≤ 0, or empty string)
    - Assert `validateEntry` returns `valid: false` with non-null error on every offending field
    - Minimum 100 iterations

  - [ ]* 4.8 Write property test for invalid entries blocking calculations — Property 2
    - **Property 2: Invalid entries block all calculations**
    - **Validates: Requirements 2.5**
    - Build a ProjectileList with at least one invalid entry; call `calculateAll()`
    - Assert every entry's `result` remains `null`
    - Minimum 100 iterations

  - [ ]* 4.9 Write property test for sequential re-labelling — Property 10
    - **Property 10: Sequential re-labelling after removal**
    - **Validates: Requirements 6.2**
    - Use `fc.integer({ min: 2, max: 10 })` for list size, `fc.integer` for removal index
    - After `removeEntry`, assert labels are "Projectile 1", "Projectile 2", … with no gaps
    - Minimum 100 iterations

  - [ ]* 4.10 Write property test for list never exceeding 10 entries — Property 11
    - **Property 11: Projectile_List never exceeds 10 entries**
    - **Validates: Requirements 6.4, 6.5**
    - Call `addEntry()` N times (N between 11 and 50); assert `entries.length <= 10`
    - Minimum 100 iterations

  - [ ]* 4.11 Write unit tests for state initialisation and defaults
    - Assert `entries.length === 1` on init
    - Assert new entry has `g === "9.81"`
    - Assert Remove button is disabled when `entries.length === 1` (via state flag or UI check)
    - _Requirements: 1.3, 1.4, 1.7_

- [x] 5. Checkpoint — Ensure all State Layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement UI Layer (`ui.js`)
  - [x] 6.1 Implement `renderFormulas()`
    - Statically render the T and R kinematic formulas in the Formulas section
    - Called once on page load
    - _Requirements: 7.1_

  - [x] 6.2 Implement `renderProjectileList()`
    - Re-render the entire input panel from `ProjectileList.entries`
    - Each entry renders: label, v0/theta/g inputs (with current values), inline error messages below each field, and a Remove button (disabled when `entries.length === 1`)
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 6.1, 6.3_

  - [x] 6.3 Implement `renderComparisonTable()`
    - Render table with headers: "Projectile", "Time of Flight (s)", "Horizontal Range (m)"
    - One row per entry showing label, T with "s" unit, R with "m" unit
    - Clear previous contents before rendering
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 6.4 Implement `renderChart()`
    - On first call, create a `Chart` instance on the canvas element; store in module-level variable
    - On subsequent calls, update `chart.data.datasets` and call `chart.update()` (no destroy/recreate)
    - Map each entry to a dataset using `PALETTE[index]` for `borderColor`
    - Set x-axis label "Horizontal Distance (m)" and y-axis label "Height (m)"
    - If `chartAvailable === false`, hide the chart section via CSS class toggle
    - _Requirements: 5.1, 5.2, 5.3, 5.6, 5.7_

  - [x] 6.5 Implement `bindEvents()`
    - Attach delegated event listeners to the container for: "Add Projectile" button, "Calculate" button, Remove buttons, and input field changes
    - On "Add Projectile": call `addEntry()`, then `renderProjectileList()`; disable button and show max-reached message if `entries.length === 10`
    - On "Calculate": call `calculateAll()`, then `renderProjectileList()`, `renderComparisonTable()`, `renderChart()`
    - On Remove: call `removeEntry(id)`, then `renderProjectileList()`, `renderComparisonTable()`, `renderChart()`
    - On input change: call `updateField(id, field, value)`
    - _Requirements: 1.5, 1.6, 6.1, 6.2, 6.5, 6.6_

  - [ ]* 6.6 Write property test for Comparison_Table row count — Property 5
    - **Property 5: Comparison_Table row count matches entry count**
    - **Validates: Requirements 4.1, 4.5**
    - Generate 1–10 valid entries; after `calculateAll()` and `renderComparisonTable()`, assert DOM row count equals entry count
    - Minimum 100 iterations

  - [ ]* 6.7 Write property test for result cells including units — Property 6
    - **Property 6: Result cells include units**
    - **Validates: Requirements 4.3**
    - For random T and R values, assert rendered T cell contains "s" and R cell contains "m"
    - Minimum 100 iterations

  - [ ]* 6.8 Write property test for Chart datasets mirroring entry list — Property 7
    - **Property 7: Chart datasets mirror the Projectile_List**
    - **Validates: Requirements 5.2, 5.3**
    - Generate 1–10 valid entries; after `calculateAll()` and `renderChart()`, assert `chart.data.datasets.length` equals entry count and each dataset label matches entry label
    - Minimum 100 iterations

  - [ ]* 6.9 Write property test for table and chart after removal — Property 12
    - **Property 12: Comparison_Table and Chart reflect only remaining entries after removal**
    - **Validates: Requirements 6.6**
    - After a calculation, remove one entry; assert table row count and chart dataset count each equal the new entry count
    - Minimum 100 iterations

  - [ ]* 6.10 Write unit tests for UI structural checks
    - Assert Comparison_Table has correct column headers
    - Assert chart canvas is visible after calculation when Chart.js is available
    - Assert chart x-axis label is "Horizontal Distance (m)" and y-axis label is "Height (m)"
    - Assert each rendered entry has a Remove button
    - Assert formulas section contains T and R formula text
    - _Requirements: 4.2, 5.1, 5.6, 6.1, 7.1_

- [x] 7. Implement `index.html` and `style.css`
  - [x] 7.1 Build `index.html` shell
    - Include Chart.js CDN `<script>` tag with `onerror` handler setting `chartAvailable = false`
    - Add `<canvas id="trajectoryChart">` inside a chart section div
    - Add container divs for: projectile list panel, calculate button, comparison table, formulas section
    - Load `physics.js`, `state.js`, `ui.js` as ES modules; call `renderFormulas()` and `bindEvents()` on `DOMContentLoaded`
    - _Requirements: 7.3_

  - [x] 7.2 Build `style.css` with cyberpunk theme
    - Dark background (`#0d0d0d`), neon cyan/magenta/yellow accents, monospace/Orbitron typography
    - Neon glowing `box-shadow` on input focus; neon magenta buttons with hover fill effect
    - Responsive grid/flexbox layout supporting 320 px to 1920 px viewport widths
    - Inline error message styles (neon red `#ff2d55`, below input fields)
    - Disabled-state styles for Remove button and Add Projectile button
    - _Requirements: 7.2, 7.4_

- [x] 8. Final checkpoint — Ensure all tests pass
  - Run full test suite with `npx vitest --run`
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at each layer boundary
- Property tests validate universal correctness properties using fast-check (minimum 100 iterations each)
- Unit tests validate concrete reference values and structural UI checks
- The chart section degrades gracefully when Chart.js CDN is unavailable
