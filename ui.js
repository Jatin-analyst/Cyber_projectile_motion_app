/**
 * UI Layer — DOM rendering, event binding, Chart.js integration.
 * Depends on state.js.
 */

import { ProjectileList, addEntry, removeEntry, updateField, calculateAll } from './state.js';

/** @type {import('chart.js').Chart|null} */
let chartInstance = null;

/** Set to false if Chart.js CDN fails to load */
export let chartAvailable = typeof Chart !== 'undefined';

/** Cyberpunk neon colour palette — one colour per possible projectile */
export const PALETTE = [
  '#00f5ff', // neon cyan
  '#ff00ff', // neon magenta
  '#f5ff00', // neon yellow
  '#00ff88', // neon green
  '#ff6b35', // neon orange
  '#bf5fff', // neon purple
  '#ff2d55', // neon red
  '#00cfff', // electric blue
  '#ffdd00', // amber
  '#39ff14', // acid green
];

/**
 * Allow tests to override chartAvailable.
 * @param {boolean} value
 */
export function setChartAvailable(value) {
  chartAvailable = value;
}

/**
 * Allow tests to reset the chartInstance.
 */
export function resetChartInstance() {
  chartInstance = null;
}

/**
 * Statically render the T and R kinematic formulas in the Formulas section.
 * Called once on page load.
 */
export function renderFormulas() {
  const section = document.getElementById('formulas-section');
  if (!section) return;
  section.innerHTML = `
    <h2>Kinematic Formulas</h2>
    <p class="formula">T = (2 &times; v<sub>0</sub> &times; sin(&theta;)) / g</p>
    <p class="formula">R = (v<sub>0</sub><sup>2</sup> &times; sin(2&theta;)) / g</p>
  `;
}

/**
 * Re-render the entire projectile input panel from ProjectileList.entries.
 */
export function renderProjectileList() {
  const container = document.getElementById('projectile-list');
  if (!container) return;

  const isSingle = ProjectileList.entries.length === 1;

  container.innerHTML = ProjectileList.entries.map(entry => `
    <div class="projectile-entry" data-id="${entry.id}">
      <h3>${entry.label}</h3>

      <div class="field-group">
        <label for="v0-${entry.id}">Initial Velocity v<sub>0</sub> (m/s)</label>
        <input
          id="v0-${entry.id}"
          class="entry-input"
          type="number"
          data-id="${entry.id}"
          data-field="v0"
          value="${entry.v0}"
          placeholder="e.g. 20"
        />
        ${entry.errors.v0 ? `<span class="field-error">${entry.errors.v0}</span>` : ''}
      </div>

      <div class="field-group">
        <label for="theta-${entry.id}">Launch Angle &theta; (degrees)</label>
        <input
          id="theta-${entry.id}"
          class="entry-input"
          type="number"
          data-id="${entry.id}"
          data-field="theta"
          value="${entry.theta}"
          placeholder="e.g. 45"
        />
        ${entry.errors.theta ? `<span class="field-error">${entry.errors.theta}</span>` : ''}
      </div>

      <div class="field-group">
        <label for="g-${entry.id}">Gravity g (m/s&sup2;)</label>
        <input
          id="g-${entry.id}"
          class="entry-input"
          type="number"
          data-id="${entry.id}"
          data-field="g"
          value="${entry.g}"
          placeholder="e.g. 9.81"
        />
        ${entry.errors.g ? `<span class="field-error">${entry.errors.g}</span>` : ''}
      </div>

      <button
        class="remove-btn"
        type="button"
        data-id="${entry.id}"
        ${isSingle ? 'disabled' : ''}
      >Remove</button>
    </div>
  `).join('');
}

/**
 * Render the Comparison_Table with one row per entry.
 * Clears previous contents before rendering.
 */
export function renderComparisonTable() {
  const container = document.getElementById('comparison-table');
  if (!container) return;

  const rows = ProjectileList.entries.map(entry => {
    const T = entry.result ? `${entry.result.T} s` : '—';
    const R = entry.result ? `${entry.result.R} m` : '—';
    return `<tr>
      <td>${entry.label}</td>
      <td>${T}</td>
      <td>${R}</td>
    </tr>`;
  }).join('');

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Projectile</th>
          <th>Time of Flight (s)</th>
          <th>Horizontal Range (m)</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

/**
 * Create or update the Chart.js trajectory chart.
 * Hides the chart section if chartAvailable === false.
 */
export function renderChart() {
  const chartSection = document.getElementById('chart-section');

  if (!chartAvailable) {
    if (chartSection) chartSection.classList.add('hidden');
    return;
  }

  const canvas = document.getElementById('trajectoryChart');
  if (!canvas) return;

  const datasets = ProjectileList.entries
    .filter(entry => entry.result && entry.result.trajectory)
    .map((entry, index) => ({
      label: entry.label,
      data: entry.result.trajectory,
      borderColor: PALETTE[index % PALETTE.length],
      backgroundColor: 'transparent',
      tension: 0.4,
      pointRadius: 0,
      showLine: true,
    }));

  if (!chartInstance) {
    // First call — create the Chart instance
    chartInstance = new Chart(canvas, {
      type: 'scatter',
      data: { datasets },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Horizontal Distance (m)',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Height (m)',
            },
          },
        },
        plugins: {
          legend: { display: true },
        },
      },
    });
  } else {
    // Subsequent calls — update in place
    chartInstance.data.datasets = datasets;
    chartInstance.update();
  }
}

/**
 * Attach delegated event listeners to the container.
 * Handles: Add Projectile, Calculate, Remove, and input changes.
 */
export function bindEvents() {
  const addBtn = document.getElementById('add-projectile-btn');
  const calcBtn = document.getElementById('calculate-btn');
  const maxMsg = document.getElementById('max-reached-msg');
  const projectileList = document.getElementById('projectile-list');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      addEntry();
      renderProjectileList();
      if (ProjectileList.entries.length >= 10) {
        addBtn.disabled = true;
        if (maxMsg) maxMsg.hidden = false;
      }
    });
  }

  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      calculateAll();
      renderProjectileList();
      renderComparisonTable();
      renderChart();
    });
  }

  if (projectileList) {
    // Delegated listener for Remove buttons
    projectileList.addEventListener('click', (e) => {
      const btn = e.target.closest('.remove-btn');
      if (!btn) return;
      const id = parseInt(btn.dataset.id, 10);
      removeEntry(id);
      renderProjectileList();
      renderComparisonTable();
      renderChart();

      // Re-enable Add button if below max
      if (addBtn && ProjectileList.entries.length < 10) {
        addBtn.disabled = false;
        if (maxMsg) maxMsg.hidden = true;
      }
    });

    // Delegated listener for input changes
    projectileList.addEventListener('input', (e) => {
      const input = e.target.closest('.entry-input');
      if (!input) return;
      const id = parseInt(input.dataset.id, 10);
      const field = input.dataset.field;
      updateField(id, field, input.value);
    });
  }
}
