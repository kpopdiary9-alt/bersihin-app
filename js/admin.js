// ============================================
// BersihIn Admin Dashboard — admin.js
// ============================================

// --- Panel Navigation ---
const panelMap = {
  overview:   { title: 'Overview',    subtitle: 'Real-time waste pickup analytics',       nav: 'navOverview' },
  routes:     { title: 'Routes & Map', subtitle: 'Smart routing and collector deployment', nav: 'navRoutes' },
  payments:   { title: 'Payments',    subtitle: 'Financial tracking and billing management', nav: 'navPayments' },
  monitoring: { title: 'Monitoring',  subtitle: 'Live collector tracking and alert management', nav: 'navMonitoring' },
  residents:  { title: 'Residents',   subtitle: 'Household management and compliance tracking', nav: 'navResidents' },
};

function switchPanel(panelId) {
  // Hide all panels
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  // Deactivate all sidebar items
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));

  // Show target panel
  const panel = document.getElementById('panel' + panelId.charAt(0).toUpperCase() + panelId.slice(1));
  if (panel) panel.classList.add('active');

  // Activate sidebar item
  const info = panelMap[panelId];
  if (info) {
    const navItem = document.getElementById(info.nav);
    if (navItem) navItem.classList.add('active');
    document.getElementById('pageTitle').textContent = info.title;
    document.getElementById('pageSubtitle').textContent = info.subtitle;
  }

  // Init charts & maps for specific panels
  if (panelId === 'overview') {
    setTimeout(initOverviewCharts, 200);
  } else if (panelId === 'routes') {
    setTimeout(initAdminMap, 200);
  } else if (panelId === 'payments') {
    setTimeout(initPaymentCharts, 200);
  }
}

// --- Chart.js Defaults ---
Chart.defaults.font.family = "'Inter', sans-serif";

// --- Overview Charts ---
let trendChartInstance = null;
let compositionChartInstance = null;
let paymentStatusChartInstance = null;

function initOverviewCharts() {
  initTrendChart();
  initCompositionChart();
  initPaymentStatusChart();
}

function initTrendChart() {
  if (trendChartInstance) return;
  const ctx = document.getElementById('trendChart');
  if (!ctx) return;

  // Generate 30 days of data
  const labels = [];
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.getDate().toString());
    data.push(Math.floor(Math.random() * 40) + 170);
  }

  trendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Pickups',
        data,
        borderColor: '#22c55e',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(34,197,94,0.1)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
          gradient.addColorStop(1, 'rgba(34, 197, 94, 0.01)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#22c55e',
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#171717',
          titleFont: { size: 12, weight: '600' },
          bodyFont: { size: 12 },
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: (items) => `Day ${items[0].label}`,
            label: (context) => `${context.parsed.y} houses collected`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 10, weight: '500' }, color: '#a3a3a3', maxTicksLimit: 10 },
          border: { display: false },
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.04)', drawTicks: false },
          ticks: { font: { size: 10 }, color: '#a3a3a3', padding: 8 },
          border: { display: false },
          min: 100,
        },
      },
      animation: { duration: 1200, easing: 'easeOutQuart' },
    },
  });
}

function initCompositionChart() {
  if (compositionChartInstance) return;
  const ctx = document.getElementById('compositionChart');
  if (!ctx) return;

  compositionChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['General', 'Organic', 'Recyclable', 'Hazardous'],
      datasets: [{
        data: [45, 28, 22, 5],
        backgroundColor: ['#22c55e', '#86efac', '#3b82f6', '#f59e0b'],
        borderWidth: 0,
        spacing: 3,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 12, weight: '500' },
            color: '#737373',
          },
        },
        tooltip: {
          backgroundColor: '#171717',
          padding: 10,
          cornerRadius: 8,
          bodyFont: { size: 12 },
          callbacks: {
            label: (context) => ` ${context.label}: ${context.parsed}%`,
          },
        },
      },
      animation: { duration: 1200, easing: 'easeOutQuart' },
    },
  });
}

function initPaymentStatusChart() {
  if (paymentStatusChartInstance) return;
  const ctx = document.getElementById('paymentStatusChart');
  if (!ctx) return;

  paymentStatusChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Paid', 'Pending', 'Overdue'],
      datasets: [{
        data: [1156, 68, 24],
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        borderWidth: 0,
        spacing: 3,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#171717',
          padding: 10,
          cornerRadius: 8,
          bodyFont: { size: 12 },
          callbacks: {
            label: (context) => ` ${context.label}: ${context.parsed} households`,
          },
        },
      },
      animation: { duration: 1000, easing: 'easeOutQuart' },
    },
  });
}

// --- Payment Charts ---
let revenueChartInstance = null;
let methodChartInstance = null;

function initPaymentCharts() {
  initRevenueChart();
  initMethodChart();
}

function initRevenueChart() {
  if (revenueChartInstance) return;
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;

  revenueChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [{
        label: 'Revenue',
        data: [54.2, 56.8, 58.1, 59.4, 61.0, 62.4],
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return '#22c55e';
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
          gradient.addColorStop(1, 'rgba(34, 197, 94, 0.85)');
          return gradient;
        },
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#171717',
          padding: 10,
          cornerRadius: 8,
          bodyFont: { size: 12 },
          displayColors: false,
          callbacks: {
            label: (context) => `Rp ${context.parsed.y}M`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11, weight: '500' }, color: '#a3a3a3' },
          border: { display: false },
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.04)', drawTicks: false },
          ticks: {
            font: { size: 10 },
            color: '#a3a3a3',
            padding: 8,
            callback: (v) => `Rp ${v}M`,
          },
          border: { display: false },
          min: 40,
        },
      },
      animation: { duration: 1000, easing: 'easeOutQuart' },
    },
  });
}

function initMethodChart() {
  if (methodChartInstance) return;
  const ctx = document.getElementById('methodChart');
  if (!ctx) return;

  methodChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['GoPay', 'OVO', 'Bank Transfer', 'DANA', 'Other'],
      datasets: [{
        data: [42, 26, 18, 10, 4],
        backgroundColor: ['#00aed6', '#4C3494', '#003d79', '#108ee9', '#a3a3a3'],
        borderWidth: 0,
        spacing: 3,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 14,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 11, weight: '500' },
            color: '#737373',
          },
        },
        tooltip: {
          backgroundColor: '#171717',
          padding: 10,
          cornerRadius: 8,
          bodyFont: { size: 12 },
          callbacks: {
            label: (context) => ` ${context.label}: ${context.parsed}%`,
          },
        },
      },
      animation: { duration: 1000, easing: 'easeOutQuart' },
    },
  });
}

// --- Admin Map (Routes Panel) ---
let adminMapInstance = null;

function initAdminMap() {
  if (adminMapInstance) {
    adminMapInstance.invalidateSize();
    return;
  }

  const mapContainer = document.getElementById('adminMap');
  if (!mapContainer) return;

  adminMapInstance = L.map('adminMap', {
    center: [-6.200, 106.816],
    zoom: 15,
    attributionControl: false,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(adminMapInstance);

  // Define routes with colors
  const routes = [
    {
      name: 'Route A',
      color: '#22c55e',
      coords: [[-6.196, 106.810], [-6.197, 106.811], [-6.198, 106.812], [-6.199, 106.813], [-6.200, 106.814]],
      collector: 'Budi S.',
    },
    {
      name: 'Route B',
      color: '#3b82f6',
      coords: [[-6.198, 106.815], [-6.199, 106.816], [-6.200, 106.817], [-6.201, 106.818], [-6.202, 106.819]],
      collector: 'Dedi L.',
    },
    {
      name: 'Route C',
      color: '#f59e0b',
      coords: [[-6.202, 106.813], [-6.203, 106.814], [-6.204, 106.815], [-6.205, 106.816], [-6.206, 106.817]],
      collector: 'Muhammad R.',
    },
    {
      name: 'Route D',
      color: '#a855f7',
      coords: [[-6.194, 106.817], [-6.195, 106.818], [-6.196, 106.819], [-6.197, 106.820], [-6.198, 106.821]],
      collector: 'Eko K.',
    },
  ];

  routes.forEach(route => {
    // Draw polyline
    L.polyline(route.coords, {
      color: route.color,
      weight: 4,
      opacity: 0.8,
    }).addTo(adminMapInstance);

    // Add collector marker at midpoint
    const mid = route.coords[Math.floor(route.coords.length / 2)];
    const icon = L.divIcon({
      className: 'admin-map-marker',
      html: `<div style="
        width: 32px; height: 32px;
        background: ${route.color};
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 16px;
        color: white;
        box-shadow: 0 0 0 3px rgba(255,255,255,0.5), 0 3px 10px rgba(0,0,0,0.2);
      ">🚛</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker(mid, { icon }).addTo(adminMapInstance)
      .bindPopup(`<b>${route.name}</b><br>${route.collector}<br><em>Click to view details</em>`);

    // Add house markers
    route.coords.forEach((coord, i) => {
      if (i === Math.floor(route.coords.length / 2)) return;
      const houseIcon = L.divIcon({
        className: 'admin-map-marker',
        html: `<div style="
          width: 14px; height: 14px;
          background: ${route.color};
          opacity: 0.5;
          border-radius: 50%;
          border: 2px solid white;
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker(coord, { icon: houseIcon }).addTo(adminMapInstance);
    });
  });

  // Marker styles
  const style = document.createElement('style');
  style.textContent = `.admin-map-marker { background: transparent !important; border: none !important; }`;
  document.head.appendChild(style);

  setTimeout(() => adminMapInstance.invalidateSize(), 200);
}

// --- KPI Counter Animation ---
function animateKPI(elementId, target, prefix = '', suffix = '') {
  const el = document.getElementById(elementId);
  if (!el) return;

  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }

    if (target >= 1000) {
      el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
    } else if (target < 10) {
      el.textContent = prefix + current.toFixed(1) + suffix;
    } else {
      el.textContent = prefix + Math.floor(current) + suffix;
    }
  }, 30);
}

// --- Simulated Real-time Updates ---
function startRealtimeUpdates() {
  setInterval(() => {
    const monPickedEl = document.getElementById('monPickedUp');
    if (monPickedEl) {
      const currentVal = parseInt(monPickedEl.textContent) || 847;
      if (currentVal < 1000) {
        monPickedEl.textContent = currentVal + Math.floor(Math.random() * 3);
      }
    }
  }, 5000);
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  // Init overview charts immediately
  setTimeout(initOverviewCharts, 300);

  // Animate KPIs
  animateKPI('kpiHouses', 1248, '', '');
  animateKPI('kpiRate', 98.2, '', '%');
  animateKPI('kpiCollectors', 24, '', '');

  // Start real-time simulation
  startRealtimeUpdates();
});
