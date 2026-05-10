// ============================================
// BersihIn Collector App — collector.js
// ============================================

// --- Screen Navigation ---
const screenMap = {
  screenRoute:   'navRoute',
  screenMap:     'navMap',
  screenQR:      'navQR',
  screenSummary: 'navSummary',
};

function switchScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.add('active');
    const scroll = screen.querySelector('.app-scroll');
    if (scroll) scroll.scrollTop = 0;
  }

  const navId = screenMap[screenId];
  if (navId) {
    document.getElementById(navId).classList.add('active');
  }

  // Update status bar color
  const statusBar = document.getElementById('statusBar');
  if (screenId === 'screenRoute') {
    statusBar.style.color = 'white';
  } else if (screenId === 'screenQR') {
    statusBar.style.color = 'white';
  } else {
    statusBar.style.color = 'var(--neutral-800)';
  }

  // Init map if needed
  if (screenId === 'screenMap') {
    setTimeout(initCollectorMap, 100);
  }

  // Init chart if summary
  if (screenId === 'screenSummary') {
    setTimeout(initPerfChart, 200);
  }
}

// --- Status Time ---
function updateStatusTime() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  document.getElementById('statusTime').textContent = `${h}:${m}`;
}
updateStatusTime();
setInterval(updateStatusTime, 60000);

// --- QR Scanner Simulation ---
function simulateScan() {
  const btn = document.getElementById('scanBtn');
  btn.textContent = 'Scanning...';
  btn.style.opacity = '0.7';
  btn.disabled = true;

  // Simulate scan delay
  setTimeout(() => {
    btn.textContent = 'Tap to Scan';
    btn.style.opacity = '1';
    btn.disabled = false;

    // Show success modal
    document.getElementById('qrSuccessModal').classList.add('show');
  }, 1500);
}

function closeQRModal() {
  document.getElementById('qrSuccessModal').classList.remove('show');
  // Navigate to route list
  switchScreen('screenRoute');
}

// --- Leaflet Map (Collector Navigation) ---
let collectorMap = null;

function initCollectorMap() {
  if (collectorMap) {
    collectorMap.invalidateSize();
    return;
  }

  const mapContainer = document.getElementById('collectorMap');
  if (!mapContainer) return;

  collectorMap = L.map('collectorMap', {
    center: [-6.200, 106.816],
    zoom: 16,
    zoomControl: false,
    attributionControl: false,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(collectorMap);

  // Route coordinates (optimized path)
  const routeCoords = [
    [-6.196, 106.813],
    [-6.197, 106.814],
    [-6.198, 106.815],
    [-6.199, 106.816],
    [-6.200, 106.817],
    [-6.201, 106.818],
    [-6.202, 106.817],
    [-6.203, 106.816],
    [-6.204, 106.815],
  ];

  // Route polyline
  L.polyline(routeCoords, {
    color: '#22c55e',
    weight: 5,
    opacity: 0.9,
  }).addTo(collectorMap);

  // Add markers for completed stops
  for (let i = 0; i < 3; i++) {
    const doneIcon = L.divIcon({
      className: 'map-marker-clean',
      html: `<div style="
        width: 24px; height: 24px;
        background: #dcfce7;
        border: 2px solid #22c55e;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 12px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      ">✓</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    L.marker(routeCoords[i], { icon: doneIcon }).addTo(collectorMap);
  }

  // Current position marker
  const currentIcon = L.divIcon({
    className: 'map-marker-clean',
    html: `<div style="
      width: 44px; height: 44px;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
      box-shadow: 0 0 0 4px rgba(34,197,94,0.3), 0 4px 12px rgba(0,0,0,0.15);
    ">🚛</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

  const currentMarker = L.marker(routeCoords[3], { icon: currentIcon }).addTo(collectorMap);

  // Next stop markers
  for (let i = 4; i < routeCoords.length; i++) {
    const nextIcon = L.divIcon({
      className: 'map-marker-clean',
      html: `<div style="
        width: 28px; height: 28px;
        background: white;
        border: 2px solid #3b82f6;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 12px;
        font-weight: 700;
        color: #3b82f6;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      ">${i + 1}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    L.marker(routeCoords[i], { icon: nextIcon }).addTo(collectorMap);
  }

  // Animate current marker
  let step = 0;
  setInterval(() => {
    step += 0.003;
    if (step > 1) step = 0;
    const lat = routeCoords[3][0] + (routeCoords[4][0] - routeCoords[3][0]) * step;
    const lng = routeCoords[3][1] + (routeCoords[4][1] - routeCoords[3][1]) * step;
    currentMarker.setLatLng([lat, lng]);
  }, 100);

  // Add custom marker styles
  const style = document.createElement('style');
  style.textContent = `.map-marker-clean { background: transparent !important; border: none !important; }`;
  document.head.appendChild(style);

  setTimeout(() => collectorMap.invalidateSize(), 200);
}

// --- Performance Chart ---
let perfChartInstance = null;

function initPerfChart() {
  if (perfChartInstance) return;

  const ctx = document.getElementById('perfChart');
  if (!ctx) return;

  perfChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      datasets: [{
        label: 'Houses',
        data: [28, 30, 25, 18, 0, 0],
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return '#22c55e';
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
          gradient.addColorStop(1, 'rgba(34, 197, 94, 0.8)');
          return gradient;
        },
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#171717',
          titleFont: { family: 'Inter', size: 12 },
          bodyFont: { family: 'Inter', size: 12 },
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: (context) => `${context.parsed.y} houses collected`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: 'Inter', size: 11, weight: '500' },
            color: '#a3a3a3',
          },
          border: { display: false },
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.04)', drawTicks: false },
          ticks: {
            font: { family: 'Inter', size: 11 },
            color: '#a3a3a3',
            padding: 8,
          },
          border: { display: false },
          min: 0,
          max: 35,
        },
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart',
      },
    },
  });
}

// --- Route Progress Animation ---
function animateRouteProgress() {
  const fill = document.getElementById('routeProgressFill');
  if (!fill) return;
  let width = 0;
  const target = 60;
  const timer = setInterval(() => {
    width += 1;
    fill.style.width = width + '%';
    if (width >= target) clearInterval(timer);
  }, 15);
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  animateRouteProgress();
});
