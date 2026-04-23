# Requirements Document

## Introduction

A browser-based Projectile Motion Simulator designed as an educational tool for students learning physics. The simulator accepts initial velocity, launch angle, and gravitational acceleration as inputs, then computes and displays the time of flight and horizontal range using standard kinematic equations. An optional parabolic trajectory graph (via Chart.js) provides a visual representation of the projectile's path. Students can add multiple projectiles — each with independent v0, θ, and g values — and compare their trajectories, times of flight, and horizontal ranges side by side, both visually on the chart and in a tabular results display. The entire application runs as a pure HTML/CSS/JavaScript webpage — no backend required.

## Glossary

- **Simulator**: The browser-based projectile motion simulation application.
- **Physics_Engine**: The JavaScript module responsible for all kinematic calculations.
- **UI**: The HTML/CSS/JavaScript user interface layer.
- **Chart**: The Chart.js-powered parabolic trajectory graph rendered on a canvas element.
- **v0**: Initial velocity of the projectile, in metres per second (m/s).
- **θ (theta)**: Launch angle of elevation above the horizontal, in degrees.
- **g**: Acceleration due to gravity, in metres per second squared (m/s²). Default value is 9.81 m/s².
- **T**: Time of flight — total time the projectile is airborne, in seconds.
- **R**: Horizontal range — total horizontal distance travelled before landing, in metres.
- **Trajectory**: The parabolic path traced by the projectile from launch to landing.
- **Projectile_Entry**: A single set of user-supplied inputs (v0, θ, g) representing one projectile in the comparison.
- **Projectile_List**: The ordered collection of all Projectile_Entries currently active in the simulation.
- **Comparison_Table**: The tabular display showing T and R results for each Projectile_Entry side by side.

---

## Requirements

### Requirement 1: Input Collection

**User Story:** As a student, I want to enter the initial velocity, launch angle, and gravitational acceleration for one or more projectiles, so that I can simulate and compare multiple projectiles under conditions I choose.

#### Acceptance Criteria

1. THE UI SHALL provide a numeric input field for v0 (initial velocity in m/s) within each Projectile_Entry.
2. THE UI SHALL provide a numeric input field for θ (launch angle in degrees) within each Projectile_Entry.
3. THE UI SHALL provide a numeric input field for g (gravitational acceleration in m/s²) within each Projectile_Entry, with a default value of 9.81.
4. WHEN a new Projectile_Entry is created, THE UI SHALL pre-populate the g input field of that entry with the value 9.81.
5. THE UI SHALL display a clearly labelled "Add Projectile" button that appends a new Projectile_Entry to the Projectile_List.
6. THE UI SHALL display a clearly labelled "Calculate" button that triggers simulation for all Projectile_Entries in the Projectile_List.
7. WHEN the page loads, THE UI SHALL initialise the Projectile_List with exactly one default Projectile_Entry.

---

### Requirement 2: Input Validation

**User Story:** As a student, I want the simulator to catch invalid inputs before calculating, so that I receive meaningful feedback rather than nonsensical results.

#### Acceptance Criteria

1. IF a Projectile_Entry contains a v0 value that is less than or equal to zero, THEN THE UI SHALL display an error message on that entry stating that initial velocity must be a positive number.
2. IF a Projectile_Entry contains a θ value outside the range 0° < θ < 90°, THEN THE UI SHALL display an error message on that entry stating that the angle must be between 0 and 90 degrees (exclusive).
3. IF a Projectile_Entry contains a g value that is less than or equal to zero, THEN THE UI SHALL display an error message on that entry stating that gravitational acceleration must be a positive number.
4. IF any input field within a Projectile_Entry is empty when the user clicks "Calculate", THEN THE UI SHALL display an error message on that entry identifying the missing field.
5. WHEN an input error is detected in any Projectile_Entry, THE UI SHALL prevent the Physics_Engine from executing any calculation for the entire Projectile_List.

---

### Requirement 3: Physics Calculation

**User Story:** As a student, I want the simulator to compute the time of flight and horizontal range accurately, so that I can verify my manual calculations.

#### Acceptance Criteria

1. WHEN valid inputs are submitted, THE Physics_Engine SHALL compute T using the formula: T = (2 × v0 × sin(θ)) / g.
2. WHEN valid inputs are submitted, THE Physics_Engine SHALL compute R using the formula: R = (v0² × sin(2θ)) / g.
3. THE Physics_Engine SHALL convert θ from degrees to radians before applying trigonometric functions.
4. THE Physics_Engine SHALL return T and R as floating-point numbers rounded to two decimal places.
5. WHEN v0 = 20 m/s, θ = 45°, and g = 9.81 m/s², THE Physics_Engine SHALL return T = 2.89 s and R = 40.77 m (within ±0.01 of each value).

---

### Requirement 4: Results Display

**User Story:** As a student, I want to see the computed time of flight and horizontal range for each projectile clearly on screen, so that I can read, record, and compare results easily.

#### Acceptance Criteria

1. WHEN a calculation completes successfully, THE UI SHALL display a Comparison_Table with one row per Projectile_Entry.
2. THE Comparison_Table SHALL include a column for a projectile label (e.g. "Projectile 1", "Projectile 2"), a column for T in seconds labelled "Time of Flight (s)", and a column for R in metres labelled "Horizontal Range (m)".
3. THE UI SHALL display each result with its unit (s for seconds, m for metres) adjacent to the numeric value.
4. WHEN a new calculation is triggered, THE UI SHALL clear the previous Comparison_Table contents before displaying the new results.
5. WHEN the Projectile_List contains only one Projectile_Entry, THE UI SHALL display results in the same Comparison_Table format for consistency.

---

### Requirement 5: Trajectory Visualisation (Stretch Goal)

**User Story:** As a student, I want to see all projectile trajectories plotted together on one graph, so that I can visually compare how different inputs affect the path.

#### Acceptance Criteria

1. WHERE Chart.js is available, THE UI SHALL render a single line chart showing height (y-axis, in metres) against horizontal distance (x-axis, in metres) for all Projectile_Entries simultaneously.
2. WHERE Chart.js is available, WHEN a calculation completes, THE Chart SHALL update to display one dataset per Projectile_Entry, each rendered in a distinct colour.
3. WHERE Chart.js is available, THE Chart SHALL display a legend that labels each dataset with the same projectile label used in the Comparison_Table (e.g. "Projectile 1").
4. THE Physics_Engine SHALL compute trajectory data points for each Projectile_Entry using: x(t) = v0 × cos(θ) × t and y(t) = v0 × sin(θ) × t − 0.5 × g × t², sampled at equal time intervals from t = 0 to t = T.
5. THE Physics_Engine SHALL generate a minimum of 50 data points per trajectory to produce a smooth curve.
6. WHERE Chart.js is available, THE Chart SHALL label the x-axis "Horizontal Distance (m)" and the y-axis "Height (m)".
7. WHERE Chart.js is available, WHEN a new calculation is triggered, THE Chart SHALL replace all existing datasets with the newly computed datasets.

---

### Requirement 6: Projectile Management

**User Story:** As a student, I want to add and remove individual projectiles from the comparison, so that I can control which scenarios are included without starting over.

#### Acceptance Criteria

1. THE UI SHALL display a "Remove" button on each Projectile_Entry in the Projectile_List.
2. WHEN the user clicks the "Remove" button on a Projectile_Entry, THE UI SHALL remove that entry from the Projectile_List and re-label the remaining entries sequentially (e.g. "Projectile 1", "Projectile 2").
3. IF the Projectile_List contains only one Projectile_Entry, THEN THE UI SHALL disable the "Remove" button on that entry so that at least one entry is always present.
4. THE UI SHALL support a Projectile_List of up to 10 Projectile_Entries.
5. IF the user attempts to add a Projectile_Entry when the Projectile_List already contains 10 entries, THEN THE UI SHALL display a message stating that the maximum number of projectiles has been reached and disable the "Add Projectile" button.
6. WHEN a Projectile_Entry is removed after a calculation has been performed, THE UI SHALL update the Comparison_Table and the Chart to reflect only the remaining entries.

---

### Requirement 7: Educational Presentation

**User Story:** As a student, I want the interface to look like a professional science tool, so that I feel engaged and can focus on learning the physics.

#### Acceptance Criteria

1. THE UI SHALL display the two kinematic formulas (T and R) in a clearly visible "Formulas" section on the page.
2. THE UI SHALL use a clean, readable layout with labelled input fields, units, and section headings.
3. THE UI SHALL be fully functional in a modern browser (Chrome, Firefox, Safari, Edge) without requiring any installation or server.
4. THE UI SHALL be responsive, maintaining a usable layout on screen widths from 320 px to 1920 px.
