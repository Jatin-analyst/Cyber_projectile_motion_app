// Feature: projectile-motion-simulator
// Tests for Physics_Engine (physics.js)

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { computeT, computeR, computeTrajectory } from '../physics.js';

const round2 = (v) => Math.round(v * 100) / 100;

const validArbitraries = {
  v0: fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true }),
  theta: fc.float({ min: Math.fround(0.01), max: Math.fround(89.99), noNaN: true }),
  g: fc.float({ min: Math.fround(0.01), max: Math.fround(100), noNaN: true }),
};

describe('Physics_Engine', () => {
  // 2.8 Unit test for reference values — Requirements 3.5
  // Requirement 3.5 specifies T = 2.89 s and R = 40.77 m within ±0.01
  it('computeT(20, 45, 9.81) and computeR(20, 45, 9.81) match reference values within ±0.01', () => {
    expect(computeT(20, 45, 9.81)).toBeCloseTo(2.89, 1);
    expect(computeR(20, 45, 9.81)).toBeCloseTo(40.77, 1);
  });

  // 2.4 Property 3: T formula correctness — Validates: Requirements 3.1, 3.3, 3.4
  it('Property 3: computeT returns round2((2 * v0 * sin(rad)) / g) for all valid inputs', () => {
    fc.assert(
      fc.property(validArbitraries.v0, validArbitraries.theta, validArbitraries.g, (v0, theta, g) => {
        const rad = theta * Math.PI / 180;
        const expected = round2((2 * v0 * Math.sin(rad)) / g);
        expect(computeT(v0, theta, g)).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  // 2.5 Property 4: R formula correctness — Validates: Requirements 3.2, 3.3, 3.4
  it('Property 4: computeR returns round2((v0² * sin(2 * rad)) / g) for all valid inputs', () => {
    fc.assert(
      fc.property(validArbitraries.v0, validArbitraries.theta, validArbitraries.g, (v0, theta, g) => {
        const rad = theta * Math.PI / 180;
        const expected = round2((v0 ** 2 * Math.sin(2 * rad)) / g);
        expect(computeR(v0, theta, g)).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  // 2.6 Property 8: Trajectory points satisfy kinematic equations — Validates: Requirements 5.4
  it('Property 8: each trajectory point satisfies kinematic equations within floating-point tolerance', () => {
    fc.assert(
      fc.property(validArbitraries.v0, validArbitraries.theta, validArbitraries.g, (v0, theta, g) => {
        const rad = theta * Math.PI / 180;
        const T = (2 * v0 * Math.sin(rad)) / g;
        const points = computeTrajectory(v0, theta, g);
        const n = points.length;
        for (let i = 0; i < n; i++) {
          const t = (i / (n - 1)) * T;
          const expectedX = v0 * Math.cos(rad) * t;
          const expectedY = Math.max(0, v0 * Math.sin(rad) * t - 0.5 * g * t * t);
          expect(points[i].x).toBeCloseTo(expectedX, 8);
          expect(points[i].y).toBeCloseTo(expectedY, 8);
        }
      }),
      { numRuns: 100 }
    );
  });

  // 2.7 Property 9: Trajectory has at least 50 data points — Validates: Requirements 5.5
  it('Property 9: computeTrajectory returns at least 50 points for all valid inputs', () => {
    fc.assert(
      fc.property(validArbitraries.v0, validArbitraries.theta, validArbitraries.g, (v0, theta, g) => {
        expect(computeTrajectory(v0, theta, g).length).toBeGreaterThanOrEqual(50);
      }),
      { numRuns: 100 }
    );
  });
});
