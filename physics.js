/**
 * Physics_Engine — pure kinematic calculation functions.
 * No DOM access, no global state.
 */

/**
 * Compute time of flight.
 * @param {number} v0 - Initial velocity (m/s), must be > 0
 * @param {number} theta - Launch angle (degrees), must be 0 < theta < 90
 * @param {number} g - Gravitational acceleration (m/s²), must be > 0
 * @returns {number} T rounded to 2 decimal places
 */
export function computeT(v0, theta, g) {
  const rad = theta * Math.PI / 180;
  return Math.round((2 * v0 * Math.sin(rad)) / g * 100) / 100;
}

/**
 * Compute horizontal range.
 * @param {number} v0 - Initial velocity (m/s)
 * @param {number} theta - Launch angle (degrees)
 * @param {number} g - Gravitational acceleration (m/s²)
 * @returns {number} R rounded to 2 decimal places
 */
export function computeR(v0, theta, g) {
  const rad = theta * Math.PI / 180;
  return Math.round((v0 ** 2 * Math.sin(2 * rad)) / g * 100) / 100;
}

/**
 * Compute trajectory data points.
 * @param {number} v0 - Initial velocity (m/s)
 * @param {number} theta - Launch angle (degrees)
 * @param {number} g - Gravitational acceleration (m/s²)
 * @param {number} [numPoints=50] - Number of sample points (minimum 50)
 * @returns {{ x: number, y: number }[]} Array of {x, y} pairs
 */
export function computeTrajectory(v0, theta, g, numPoints = 50) {
  const rad = theta * Math.PI / 180;
  const T = (2 * v0 * Math.sin(rad)) / g;
  const n = Math.max(50, numPoints);
  const points = [];
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * T;
    const x = v0 * Math.cos(rad) * t;
    const y = Math.max(0, v0 * Math.sin(rad) * t - 0.5 * g * t * t);
    points.push({ x, y });
  }
  return points;
}
