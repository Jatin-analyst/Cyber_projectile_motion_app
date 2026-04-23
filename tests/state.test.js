// Feature: projectile-motion-simulator
// Tests for State Layer (state.js)
// Property 1: Invalid inputs are rejected by validation
// Property 2: Invalid entries block all calculations
// Property 10: Sequential re-labelling after removal
// Property 11: Projectile_List never exceeds 10 entries

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  ProjectileList,
  createEntry,
  resetState,
  addEntry,
  removeEntry,
  updateField,
  validateEntry,
  calculateAll,
} from '../state.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Build a valid entry object (not in ProjectileList) */
function makeValidEntry(id = 1) {
  return { id, label: `Projectile ${id}`, v0: '20', theta: '45', g: '9.81', errors: { v0: null, theta: null, g: null }, result: null };
}

// ─── 4.11 Unit tests for state initialisation and defaults ──────────────────

describe('State initialisation', () => {
  beforeEach(() => resetState());

  it('entries.length === 1 on init', () => {
    expect(ProjectileList.entries.length).toBe(1);
  });

  it('first entry has g === "9.81"', () => {
    expect(ProjectileList.entries[0].g).toBe('9.81');
  });

  it('first entry has empty v0 and theta', () => {
    expect(ProjectileList.entries[0].v0).toBe('');
    expect(ProjectileList.entries[0].theta).toBe('');
  });

  it('first entry has null errors', () => {
    const { errors } = ProjectileList.entries[0];
    expect(errors.v0).toBeNull();
    expect(errors.theta).toBeNull();
    expect(errors.g).toBeNull();
  });

  it('first entry has null result', () => {
    expect(ProjectileList.entries[0].result).toBeNull();
  });

  it('nextId starts at 2', () => {
    expect(ProjectileList.nextId).toBe(2);
  });
});

// ─── createEntry ────────────────────────────────────────────────────────────

describe('createEntry', () => {
  it('returns entry with correct label', () => {
    const e = createEntry(3);
    expect(e.label).toBe('Projectile 3');
  });

  it('returns entry with g defaulting to "9.81"', () => {
    expect(createEntry(1).g).toBe('9.81');
  });

  it('returns entry with empty v0 and theta', () => {
    const e = createEntry(1);
    expect(e.v0).toBe('');
    expect(e.theta).toBe('');
  });
});

// ─── addEntry ───────────────────────────────────────────────────────────────

describe('addEntry', () => {
  beforeEach(() => resetState());

  it('appends a new entry', () => {
    addEntry();
    expect(ProjectileList.entries.length).toBe(2);
  });

  it('new entry has label "Projectile 2"', () => {
    addEntry();
    expect(ProjectileList.entries[1].label).toBe('Projectile 2');
  });

  it('new entry has g === "9.81"', () => {
    addEntry();
    expect(ProjectileList.entries[1].g).toBe('9.81');
  });

  it('is a no-op when entries.length === 10', () => {
    for (let i = 0; i < 9; i++) addEntry();
    expect(ProjectileList.entries.length).toBe(10);
    addEntry(); // 11th call — should be no-op
    expect(ProjectileList.entries.length).toBe(10);
  });
});

// ─── removeEntry ────────────────────────────────────────────────────────────

describe('removeEntry', () => {
  beforeEach(() => resetState());

  it('removes the entry with the given id', () => {
    addEntry(); // id=2
    const idToRemove = ProjectileList.entries[0].id;
    removeEntry(idToRemove);
    expect(ProjectileList.entries.find(e => e.id === idToRemove)).toBeUndefined();
  });

  it('is a no-op when entries.length === 1', () => {
    const id = ProjectileList.entries[0].id;
    removeEntry(id);
    expect(ProjectileList.entries.length).toBe(1);
  });

  it('re-labels remaining entries sequentially', () => {
    addEntry(); addEntry(); // 3 entries
    removeEntry(ProjectileList.entries[0].id); // remove first
    expect(ProjectileList.entries[0].label).toBe('Projectile 1');
    expect(ProjectileList.entries[1].label).toBe('Projectile 2');
  });
});

// ─── updateField ────────────────────────────────────────────────────────────

describe('updateField', () => {
  beforeEach(() => resetState());

  it('updates the field value', () => {
    const id = ProjectileList.entries[0].id;
    updateField(id, 'v0', '15');
    expect(ProjectileList.entries[0].v0).toBe('15');
  });

  it('clears the error for the updated field', () => {
    const id = ProjectileList.entries[0].id;
    ProjectileList.entries[0].errors.v0 = 'This field is required.';
    updateField(id, 'v0', '10');
    expect(ProjectileList.entries[0].errors.v0).toBeNull();
  });

  it('does not affect other fields', () => {
    const id = ProjectileList.entries[0].id;
    updateField(id, 'v0', '10');
    expect(ProjectileList.entries[0].theta).toBe('');
    expect(ProjectileList.entries[0].g).toBe('9.81');
  });
});

// ─── validateEntry ──────────────────────────────────────────────────────────

describe('validateEntry', () => {
  it('returns valid: true for a valid entry', () => {
    const { valid } = validateEntry(makeValidEntry());
    expect(valid).toBe(true);
  });

  it('returns error for empty v0', () => {
    const e = makeValidEntry(); e.v0 = '';
    const { valid, errors } = validateEntry(e);
    expect(valid).toBe(false);
    expect(errors.v0).toBe('This field is required.');
  });

  it('returns error for v0 <= 0', () => {
    const e = makeValidEntry(); e.v0 = '-5';
    const { errors } = validateEntry(e);
    expect(errors.v0).toBe('Initial velocity must be a positive number.');
  });

  it('returns error for theta === 0', () => {
    const e = makeValidEntry(); e.theta = '0';
    const { errors } = validateEntry(e);
    expect(errors.theta).toBe('Angle must be between 0 and 90 degrees (exclusive).');
  });

  it('returns error for theta === 90', () => {
    const e = makeValidEntry(); e.theta = '90';
    const { errors } = validateEntry(e);
    expect(errors.theta).toBe('Angle must be between 0 and 90 degrees (exclusive).');
  });

  it('returns error for theta > 90', () => {
    const e = makeValidEntry(); e.theta = '91';
    const { errors } = validateEntry(e);
    expect(errors.theta).toBe('Angle must be between 0 and 90 degrees (exclusive).');
  });

  it('returns error for empty g', () => {
    const e = makeValidEntry(); e.g = '';
    const { errors } = validateEntry(e);
    expect(errors.g).toBe('This field is required.');
  });

  it('returns error for g <= 0', () => {
    const e = makeValidEntry(); e.g = '0';
    const { errors } = validateEntry(e);
    expect(errors.g).toBe('Gravitational acceleration must be a positive number.');
  });
});

// ─── calculateAll ───────────────────────────────────────────────────────────

describe('calculateAll', () => {
  beforeEach(() => resetState());

  it('sets result on valid entry', () => {
    const id = ProjectileList.entries[0].id;
    updateField(id, 'v0', '20');
    updateField(id, 'theta', '45');
    updateField(id, 'g', '9.81');
    calculateAll();
    expect(ProjectileList.entries[0].result).not.toBeNull();
    expect(ProjectileList.entries[0].result.T).toBeCloseTo(2.89, 1);
    expect(ProjectileList.entries[0].result.R).toBeCloseTo(40.77, 1);
  });

  it('keeps all results null when any entry is invalid', () => {
    addEntry();
    const id0 = ProjectileList.entries[0].id;
    const id1 = ProjectileList.entries[1].id;
    // First entry valid
    updateField(id0, 'v0', '20');
    updateField(id0, 'theta', '45');
    updateField(id0, 'g', '9.81');
    // Second entry invalid (empty v0)
    updateField(id1, 'theta', '45');
    updateField(id1, 'g', '9.81');
    calculateAll();
    expect(ProjectileList.entries[0].result).toBeNull();
    expect(ProjectileList.entries[1].result).toBeNull();
  });

  it('sets errors on invalid entries', () => {
    // entry has empty fields
    calculateAll();
    expect(ProjectileList.entries[0].errors.v0).not.toBeNull();
  });
});

// ─── 4.7 Property 1: Invalid inputs are rejected by validation ───────────────

describe('Property 1: Invalid inputs are rejected by validation', () => {
  // **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

  it('rejects entries with invalid v0 (empty or <= 0)', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.float({ max: Math.fround(0), noNaN: true }).map(String),
        ),
        fc.float({ min: Math.fround(0.01), max: Math.fround(89.99), noNaN: true }).map(String),
        fc.float({ min: Math.fround(0.01), max: Math.fround(100), noNaN: true }).map(String),
        (v0, theta, g) => {
          const entry = { v0, theta, g, errors: { v0: null, theta: null, g: null }, result: null };
          const { valid, errors } = validateEntry(entry);
          return valid === false && errors.v0 !== null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects entries with invalid theta (empty, <= 0, or >= 90)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true }).map(String),
        fc.oneof(
          fc.constant(''),
          fc.float({ max: Math.fround(0), noNaN: true }).map(String),
          fc.float({ min: Math.fround(90), max: Math.fround(1000), noNaN: true }).map(String),
        ),
        fc.float({ min: Math.fround(0.01), max: Math.fround(100), noNaN: true }).map(String),
        (v0, theta, g) => {
          const entry = { v0, theta, g, errors: { v0: null, theta: null, g: null }, result: null };
          const { valid, errors } = validateEntry(entry);
          return valid === false && errors.theta !== null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects entries with invalid g (empty or <= 0)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true }).map(String),
        fc.float({ min: Math.fround(0.01), max: Math.fround(89.99), noNaN: true }).map(String),
        fc.oneof(
          fc.constant(''),
          fc.float({ max: Math.fround(0), noNaN: true }).map(String),
        ),
        (v0, theta, g) => {
          const entry = { v0, theta, g, errors: { v0: null, theta: null, g: null }, result: null };
          const { valid, errors } = validateEntry(entry);
          return valid === false && errors.g !== null;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── 4.8 Property 2: Invalid entries block all calculations ──────────────────

describe('Property 2: Invalid entries block all calculations', () => {
  // **Validates: Requirements 2.5**

  beforeEach(() => resetState());

  it('all results remain null when at least one entry is invalid', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 9 }),
        (extraCount) => {
          resetState();
          // Add extra valid entries
          for (let i = 0; i < extraCount; i++) {
            addEntry();
          }
          // Set all entries to valid values
          ProjectileList.entries.forEach(e => {
            e.v0 = '20';
            e.theta = '45';
            e.g = '9.81';
          });
          // Corrupt the last entry to make it invalid
          const last = ProjectileList.entries[ProjectileList.entries.length - 1];
          last.v0 = '';

          calculateAll();

          return ProjectileList.entries.every(e => e.result === null);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── 4.9 Property 10: Sequential re-labelling after removal ──────────────────

describe('Property 10: Sequential re-labelling after removal', () => {
  // **Validates: Requirements 6.2**

  beforeEach(() => resetState());

  it('labels are sequential with no gaps after removeEntry', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }),
        fc.integer({ min: 0, max: 9 }),
        (listSize, removeIdx) => {
          resetState();
          for (let i = 1; i < listSize; i++) addEntry();
          const idx = removeIdx % ProjectileList.entries.length;
          const idToRemove = ProjectileList.entries[idx].id;
          removeEntry(idToRemove);
          return ProjectileList.entries.every(
            (e, i) => e.label === `Projectile ${i + 1}`
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── 4.10 Property 11: List never exceeds 10 entries ────────────────────────

describe('Property 11: Projectile_List never exceeds 10 entries', () => {
  // **Validates: Requirements 6.4, 6.5**

  beforeEach(() => resetState());

  it('entries.length never exceeds 10 regardless of addEntry call count', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 11, max: 50 }),
        (n) => {
          resetState();
          for (let i = 0; i < n; i++) addEntry();
          return ProjectileList.entries.length <= 10;
        }
      ),
      { numRuns: 100 }
    );
  });
});
