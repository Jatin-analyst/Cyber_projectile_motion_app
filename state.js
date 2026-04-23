/**
 * State Layer — ProjectileList CRUD, validation orchestration.
 * Depends on physics.js for calculations.
 */

import { computeT, computeR, computeTrajectory } from './physics.js';

/**
 * Factory for creating a new ProjectileEntry with defaults.
 * @param {number} id
 * @returns {object}
 */
export function createEntry(id) {
  return {
    id,
    label: `Projectile ${id}`,
    v0: '',
    theta: '',
    g: '9.81',
    errors: { v0: null, theta: null, g: null },
    result: null,
  };
}

/**
 * ProjectileList — the ordered collection of all ProjectileEntry objects.
 * @type {{ entries: object[], nextId: number }}
 */
export const ProjectileList = {
  entries: [createEntry(1)],
  nextId: 2,
};

/**
 * Reset state to initial conditions (useful for tests).
 */
export function resetState() {
  ProjectileList.entries = [createEntry(1)];
  ProjectileList.nextId = 2;
}

/**
 * Append a new ProjectileEntry with defaults.
 * No-op if entries.length === 10.
 */
export function addEntry() {
  if (ProjectileList.entries.length >= 10) return;
  const id = ProjectileList.nextId;
  ProjectileList.nextId += 1;
  ProjectileList.entries.push(createEntry(id));
}

/**
 * Remove a ProjectileEntry by id and re-label remaining entries.
 * No-op if entries.length === 1.
 * @param {number} id
 */
export function removeEntry(id) {
  if (ProjectileList.entries.length === 1) return;
  ProjectileList.entries = ProjectileList.entries.filter(e => e.id !== id);
  // Re-label sequentially
  ProjectileList.entries.forEach((e, i) => {
    e.label = `Projectile ${i + 1}`;
  });
}

/**
 * Update a raw input field on a ProjectileEntry.
 * Clears the error for that field on update.
 * @param {number} id
 * @param {'v0'|'theta'|'g'} field
 * @param {string} value
 */
export function updateField(id, field, value) {
  const entry = ProjectileList.entries.find(e => e.id === id);
  if (!entry) return;
  entry[field] = value;
  entry.errors[field] = null;
}

/**
 * Validate a single ProjectileEntry.
 * @param {object} entry
 * @returns {{ valid: boolean, errors: { v0: string|null, theta: string|null, g: string|null } }}
 */
export function validateEntry(entry) {
  const errors = { v0: null, theta: null, g: null };

  // Validate v0
  const v0Val = parseFloat(entry.v0);
  if (entry.v0 === '' || entry.v0 === null || entry.v0 === undefined || isNaN(v0Val)) {
    errors.v0 = 'This field is required.';
  } else if (v0Val <= 0) {
    errors.v0 = 'Initial velocity must be a positive number.';
  }

  // Validate theta
  const thetaVal = parseFloat(entry.theta);
  if (entry.theta === '' || entry.theta === null || entry.theta === undefined || isNaN(thetaVal)) {
    errors.theta = 'This field is required.';
  } else if (thetaVal <= 0 || thetaVal >= 90) {
    errors.theta = 'Angle must be between 0 and 90 degrees (exclusive).';
  }

  // Validate g
  const gVal = parseFloat(entry.g);
  if (entry.g === '' || entry.g === null || entry.g === undefined || isNaN(gVal)) {
    errors.g = 'This field is required.';
  } else if (gVal <= 0) {
    errors.g = 'Gravitational acceleration must be a positive number.';
  }

  const valid = errors.v0 === null && errors.theta === null && errors.g === null;
  return { valid, errors };
}

/**
 * Validate all entries; if all valid, compute T/R/trajectory for each.
 * If any entry is invalid, all results remain null.
 */
export function calculateAll() {
  // Validate all entries first
  const validations = ProjectileList.entries.map(entry => ({
    entry,
    result: validateEntry(entry),
  }));

  const allValid = validations.every(v => v.result.valid);

  if (!allValid) {
    // Set errors on each entry, keep results null
    validations.forEach(({ entry, result }) => {
      entry.errors = result.errors;
      entry.result = null;
    });
    return;
  }

  // All valid — compute for each entry
  validations.forEach(({ entry }) => {
    const v0 = parseFloat(entry.v0);
    const theta = parseFloat(entry.theta);
    const g = parseFloat(entry.g);
    entry.errors = { v0: null, theta: null, g: null };
    entry.result = {
      T: computeT(v0, theta, g),
      R: computeR(v0, theta, g),
      trajectory: computeTrajectory(v0, theta, g),
    };
  });
}
