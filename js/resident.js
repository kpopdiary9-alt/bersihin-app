// ============================================
// BersihIn Resident App — resident.js
// ============================================

// --- Screen Navigation ---
const screenMap = {
  screenHome:     'navHome',
  screenTracking: 'navTracking',
  screenPayment:  'navPayment',
  screenNotif:    'navNotif',
  screenProfile:  'navProfile',
};

function switchScreen(screenId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  // Deactivate all nav items
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Show target screen
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.add('active');
    // Reset scroll
    const scroll = screen.querySelector('.app-scroll');
    if (scroll) scroll.scrollTop = 0;
  }

  // Activate nav item
  const navId = screenMap[screenId];
  if (navId) {
    document.getElementById(navId).classList.add('active');
  }

  // Update status bar color
  const statusBar = document.getElementById('statusBar');
  if (screenId === 'screenHome') {
    statusBar.style.color = 'white';
  } else {
    statusBar.style.color = 'var(--neutral-800)';
  }

  // Init map if tracking screen
  if (screenId === 'screenTracking') {
    setTimeout(initResidentMap, 100);
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

// --- Auto-Pay Toggle ---
function toggleAutoPay() {
  const toggle = document.getElementById('autopayToggle');
  const badge = document.getElementById('autopayBadge');
  toggle.classList.toggle('active');
  if (toggle.classList.contains('active')) {
    badge.textContent = '✅ Auto-Pay On';
    badge.style.background = 'rgba(255,255,255,0.18)';
  } else {
    badge.textContent = '❌ Auto-Pay Off';
    badge.style.background = 'rgba(239,68,68,0.18)';
  }
}

// --- Payment Method Selection ---
function selectPayment(card) {
  document.querySelectorAll('.payment-method-card').forEach(c => {
    c.classList.remove('active');
    c.querySelector('.pm-check').textContent = '';
  });
  card.classList.add('active');
  card.querySelector('.pm-check').textContent = '✓';
}

// --- Notification Mark All Read ---
document.getElementById('markAllReadBtn')?.addEventListener('click', () => {
  document.querySelectorAll('.notif-item.unread').forEach(item => {
    item.classList.remove('unread');
  });
});

// --- Leaflet Map (Tracking) ---
let residentMap = null;
let collectorMarker = null;
let routePath = null;

function initResidentMap() {
  if (residentMap) {
    residentMap.invalidateSize();
    return;
  }

  const mapContainer = document.getElementById('residentMap');
  if (!mapContainer) return;

  // Center on a location in Jakarta
  residentMap = L.map('residentMap', {
    center: [-6.2, 106.816],
    zoom: 16,
    zoomControl: false,
    attributionControl: false,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(residentMap);

  // Add zoom control to bottom right
  L.control.zoom({ position: 'bottomright' }).addTo(residentMap);

  // Route coordinates
  const routeCoords = [
    [-6.198, 106.814],
    [-6.199, 106.815],
    [-6.200, 106.816],
    [-6.201, 106.817],
    [-6.202, 106.818],
    [-6.203, 106.817],
  ];

  // Draw route polyline
  routePath = L.polyline(routeCoords, {
    color: '#22c55e',
    weight: 4,
    opacity: 0.8,
    dashArray: '10, 6',
  }).addTo(residentMap);

  // Collector marker (animated)
  const collectorIcon = L.divIcon({
    className: 'collector-map-marker',
    html: `<div style="
      width: 40px; height: 40px;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      box-shadow: 0 0 0 4px rgba(34,197,94,0.3), 0 4px 12px rgba(0,0,0,0.15);
      animation: markerPulse 2s infinite;
    ">🚛</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  collectorMarker = L.marker(routeCoords[2], { icon: collectorIcon }).addTo(residentMap);

  // House marker (user)
  const houseIcon = L.divIcon({
    className: 'house-map-marker',
    html: `<div style="
      width: 36px; height: 36px;
      background: white;
      border: 3px solid #3b82f6;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    ">🏠</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  L.marker(routeCoords[3], { icon: houseIcon }).addTo(residentMap)
    .bindPopup('<b>Your House</b><br>Jl. Anggrek No. 14');

  // Done markers
  const doneIcon = L.divIcon({
    className: 'done-map-marker',
    html: `<div style="
      width: 24px; height: 24px;
      background: #dcfce7;
      border: 2px solid #22c55e;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px;
    ">✓</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  L.marker(routeCoords[0], { icon: doneIcon }).addTo(residentMap);
  L.marker(routeCoords[1], { icon: doneIcon }).addTo(residentMap);

  // Animate collector movement
  let step = 0;
  const moveCollector = () => {
    const currentCoord = routeCoords[2];
    const nextCoord = routeCoords[3];
    step += 0.005;
    if (step > 1) step = 0;

    const lat = currentCoord[0] + (nextCoord[0] - currentCoord[0]) * step;
    const lng = currentCoord[1] + (nextCoord[1] - currentCoord[1]) * step;
    collectorMarker.setLatLng([lat, lng]);

    // Update ETA
    const eta = Math.max(1, Math.round(5 - step * 4));
    const etaEl = document.getElementById('etaValue');
    if (etaEl) etaEl.textContent = eta;
  };

  setInterval(moveCollector, 200);

  setTimeout(() => residentMap.invalidateSize(), 200);
}

// --- Simulate Progress Animation ---
function animateProgress() {
  const fill = document.getElementById('pickupProgress');
  if (!fill) return;
  let width = 0;
  const target = 50;
  const timer = setInterval(() => {
    width += 1;
    fill.style.width = width + '%';
    if (width >= target) clearInterval(timer);
  }, 20);
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  animateProgress();

  // Add CSS for map marker animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes markerPulse {
      0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
      70%  { box-shadow: 0 0 0 15px rgba(34,197,94,0); }
      100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
    }
    .collector-map-marker, .house-map-marker, .done-map-marker {
      background: transparent !important;
      border: none !important;
    }
  `;
  document.head.appendChild(style);
});
