/* =============================================
   DASHBOARD.JS — Role-based dashboard logic
   ============================================= */

/* ---- DATA MOCK ---- */
const MOCK_TRIPS_USER = [
  { id: 'T-1001', car: 'Mercedes E-Class', type: 'Sedan', from: 'Oxford Ave, Cary', to: 'Airport', start: '2026-05-10', end: '2026-05-15', amount: '$125', status: 'completed', img: 'images/car_mercedes_1779693961278.webp' },
  { id: 'T-1002', car: 'Mercedes GLE', type: 'SUV', from: 'Airport', to: 'Downtown', start: '2026-06-01', end: '2026-06-05', amount: '$225', status: 'active', img: 'images/car_suv_1779693998248.webp' },
  { id: 'T-1003', car: 'Mercedes Sport', type: 'Sport', from: 'Hotel', to: 'Oxford Ave', start: '2026-06-20', end: '2026-06-22', amount: '$100', status: 'pending', img: 'images/car_sport_1779693979415.webp' },
];

const MOCK_BOOKINGS_ADMIN = [
  { id: 'B-2001', user: 'James Wilson', car: 'Mercedes E-Class', dates: 'May 10–15, 2026', amount: '$125', status: 'completed' },
  { id: 'B-2002', user: 'Sarah Miller', car: 'Mercedes GLE', dates: 'Jun 1–5, 2026', amount: '$225', status: 'active' },
  { id: 'B-2003', user: 'Robert Taylor', car: 'Mercedes Sport', dates: 'Jun 20–22, 2026', amount: '$100', status: 'pending' },
  { id: 'B-2004', user: 'Emily Chen', car: 'Mercedes E-Class', dates: 'Jun 25–28, 2026', amount: '$75', status: 'pending' },
  { id: 'B-2005', user: 'Mark Johnson', car: 'Mercedes GLE', dates: 'Jul 1–7, 2026', amount: '$315', status: 'active' },
];

const MOCK_FLEET = [
  { name: 'Mercedes E-Class', type: 'Sedan', status: 'active', img: 'images/car_mercedes_1779693961278.webp', rate: '$25/day' },
  { name: 'Mercedes Sport', type: 'Sport', status: 'rented', img: 'images/car_sport_1779693979415.webp', rate: '$50/day' },
  { name: 'Mercedes GLE', type: 'SUV', status: 'maintenance', img: 'images/car_suv_1779693998248.webp', rate: '$45/day' },
];

/* ---- STATE ---- */
let currentView = 'overview';
let currentRole = 'user';

/* ---- UTILS ---- */
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function showToast(msg, type = 'success') {
  const wrap = document.getElementById('db-toast-wrap');
  if (!wrap) return;
  const icons = {
    success: '<svg viewBox="0 0 24 24" stroke="#16a34a" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg viewBox="0 0 24 24" stroke="#e11d48" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg viewBox="0 0 24 24" stroke="#3b82f6" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  };
  const el = document.createElement('div');
  el.className = 'db-toast';
  el.innerHTML = `${icons[type] || icons.info}<span class="db-toast-msg">${msg}</span>`;
  el.style.borderLeftColor = type === 'error' ? '#e11d48' : type === 'success' ? '#22c55e' : '#3b82f6';
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function formatStatus(s) {
  const map = { active: 'active', completed: 'completed', pending: 'pending', cancelled: 'cancelled', rented: 'active', maintenance: 'cancelled' };
  return `<span class="trip-status ${map[s] || ''}">${s.charAt(0).toUpperCase() + s.slice(1)}</span>`;
}

/* ---- NAVIGATION ---- */
function navigateTo(view) {
  currentView = view;
  $$('.db-view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${view}`);
  if (target) target.classList.add('active');

  $$('.db-nav-item, .db-bottom-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === view);
  });

  // Update page title
  const titles = { overview: 'Dashboard', trips: 'My Trips', bookings: 'Bookings', fleet: 'Fleet Management', users: 'User Management', analytics: 'Analytics', profile: 'Profile Settings', settings: 'Settings' };
  const titleEl = $('#db-page-title');
  if (titleEl) titleEl.textContent = titles[view] || 'Dashboard';

  // Animate bars when analytics shown
  if (view === 'analytics') animateBars();
  
  // Close sidebar on mobile
  closeSidebar();
}

/* ---- SIDEBAR ---- */
function openSidebar() {
  $('#db-sidebar').classList.add('open');
  $('#db-sidebar-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  const sb = $('#db-sidebar');
  const ov = $('#db-sidebar-overlay');
  if (sb) sb.classList.remove('open');
  if (ov) ov.classList.remove('open');
  document.body.style.overflow = '';
}

/* ---- RENDER HELPERS ---- */
function renderTripsTable(rows) {
  if (!rows.length) return '<div class="db-empty"><svg viewBox="0 0 24 24"><path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/></svg><h3>No trips yet</h3><p>Your upcoming and past trips will appear here.</p></div>';
  return `<div class="db-table-wrap"><table class="db-table">
    <thead><tr><th>Car</th><th>Route</th><th>Dates</th><th>Amount</th><th>Status</th></tr></thead>
    <tbody>${rows.map(t => `<tr>
      <td><div class="car-thumb-row"><img src="${t.img || ''}" alt="${t.car}" onerror="this.style.display='none'"><div class="car-thumb-info"><strong>${t.car}</strong><span>${t.type}</span></div></div></td>
      <td style="font-size:0.82rem;">${t.from || '–'} → ${t.to || '–'}</td>
      <td style="font-size:0.82rem;white-space:nowrap">${t.start} – ${t.end}</td>
      <td style="font-weight:700;color:#5B3FD9">${t.amount}</td>
      <td>${formatStatus(t.status)}</td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function renderAdminBookings(rows) {
  return `<div class="db-table-wrap"><table class="db-table">
    <thead><tr><th>ID</th><th>Customer</th><th>Car</th><th>Dates</th><th>Amount</th><th>Status</th></tr></thead>
    <tbody>${rows.map(b => `<tr>
      <td style="font-size:0.78rem;color:#777;font-weight:600">${b.id}</td>
      <td style="font-weight:600">${b.user}</td>
      <td>${b.car}</td>
      <td style="font-size:0.82rem">${b.dates}</td>
      <td style="font-weight:700;color:#5B3FD9">${b.amount}</td>
      <td>${formatStatus(b.status)}</td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function renderFleet() {
  return MOCK_FLEET.map(f => `
    <div class="db-fleet-card">
      <img src="${f.img}" alt="${f.name}" class="db-fleet-img" onerror="this.style.background='#f0f0f5'">
      <div class="db-fleet-info">
        <h4>${f.name}</h4>
        <span>${f.type} · ${f.rate}</span>
      </div>
      <div class="db-fleet-status">${formatStatus(f.status)}</div>
    </div>`).join('');
}

function animateBars() {
  $$('.db-bar-fill').forEach(bar => {
    const target = bar.dataset.width || '0%';
    setTimeout(() => { bar.style.width = target; }, 100);
  });
}

/* ---- ADMIN VIEWS ---- */
function buildAdminViews(user) {
  // Analytics
  const analyticsView = $('#view-analytics');
  if (analyticsView) {
    analyticsView.innerHTML = `
      <div class="db-card">
        <div class="db-card-header"><span class="db-card-title">Revenue by Car Type</span></div>
        ${['Sedan', 'SUV', 'Sport', 'Cabriolet', 'Pickup'].map((cat, i) => {
          const pcts = [72, 58, 45, 31, 18];
          const colors = ['#5B3FD9', '#F5A623', '#22c55e', '#3b82f6', '#e11d48'];
          return `<div class="db-analytics-bar">
            <div class="db-bar-header"><span>${cat}</span><span style="color:${colors[i]}">${pcts[i]}%</span></div>
            <div class="db-bar-track"><div class="db-bar-fill" data-width="${pcts[i]}%" style="width:0%;background:${colors[i]}"></div></div>
          </div>`;
        }).join('')}
      </div>
      <div class="db-card">
        <div class="db-card-header"><span class="db-card-title">Monthly Bookings</span></div>
        ${['Jan','Feb','Mar','Apr','May','Jun'].map((m, i) => {
          const vals = [12, 19, 15, 25, 31, 28];
          const max = 31;
          return `<div class="db-analytics-bar">
            <div class="db-bar-header"><span>${m} 2026</span><span>${vals[i]} bookings</span></div>
            <div class="db-bar-track"><div class="db-bar-fill" data-width="${Math.round(vals[i]/max*100)}%" style="width:0%;background:linear-gradient(90deg,#5B3FD9,#7B5EF0)"></div></div>
          </div>`;
        }).join('')}
      </div>`;
  }

  // Fleet
  const fleetView = $('#view-fleet');
  if (fleetView) {
    fleetView.innerHTML = `<div class="db-card">
      <div class="db-card-header">
        <span class="db-card-title">Vehicle Fleet</span>
        <button class="db-card-action" onclick="showToast('Fleet management coming soon!', 'info')">+ Add Vehicle</button>
      </div>
      <div class="db-fleet-grid">${renderFleet()}</div>
    </div>`;
  }

  // Users
  const usersView = $('#view-users');
  if (usersView) {
    usersView.innerHTML = `<div class="db-card">
      <div class="db-card-header"><span class="db-card-title">Registered Users</span><span class="db-card-action" onclick="showToast('Export coming soon!', 'info')">Export CSV</span></div>
      <div class="db-table-wrap"><table class="db-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Trips</th></tr></thead>
        <tbody>
          <tr><td><strong>James Wilson</strong></td><td>james@example.com</td><td><span class="trip-status completed">User</span></td><td>Jan 2026</td><td>8</td></tr>
          <tr><td><strong>Sarah Miller</strong></td><td>sarah@example.com</td><td><span class="trip-status completed">User</span></td><td>Feb 2026</td><td>5</td></tr>
          <tr><td><strong>${user.name}</strong></td><td>${user.email}</td><td><span class="trip-status active">Admin</span></td><td>May 2026</td><td>–</td></tr>
        </tbody>
      </table></div>
    </div>`;
  }
}

/* ---- MAIN INIT ---- */
document.addEventListener('DOMContentLoaded', () => {
  const user = authGetUser();

  // Redirect if not logged in
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  currentRole = user.role || 'user';

  // Populate user info
  const initial = user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase();
  $$('.db-user-initial').forEach(el => el.textContent = initial);
  $$('.db-user-name-text').forEach(el => el.textContent = user.name || user.email.split('@')[0]);
  $$('.db-user-email-text').forEach(el => el.textContent = user.email);
  $$('.db-role-badge').forEach(el => {
    el.textContent = user.role;
    if (user.role === 'admin') el.classList.add('admin');
  });
  $$('.db-welcome-name').forEach(el => el.textContent = user.name ? user.name.split(' ')[0] : 'there');

  // Show/hide role-based nav items
  if (currentRole === 'admin') {
    $$('.admin-only').forEach(el => el.style.display = 'flex');
    $$('.user-only').forEach(el => el.style.display = 'none');
    // Update welcome message
    const welcome = $('#welcome-subtitle');
    if (welcome) welcome.textContent = `You have ${MOCK_BOOKINGS_ADMIN.length} active bookings to review today.`;
    // Admin stats
    $$('.stat-admin-revenue').forEach(el => el.textContent = '$12,480');
    // Build admin-specific views
    buildAdminViews(user);
  } else {
    $$('.admin-only').forEach(el => el.style.display = 'none');
    $$('.user-only').forEach(el => el.style.display = 'flex');
    // Trips table
    const tripsContainer = $('#user-trips-content');
    if (tripsContainer) tripsContainer.innerHTML = renderTripsTable(MOCK_TRIPS_USER);
    // Admin bookings fallback hides
  }

  // Bookings table (admin shows all, user shows own)
  const bookingsContainer = $('#bookings-content');
  if (bookingsContainer) {
    if (currentRole === 'admin') {
      bookingsContainer.innerHTML = renderAdminBookings(MOCK_BOOKINGS_ADMIN);
    } else {
      bookingsContainer.innerHTML = renderTripsTable(MOCK_TRIPS_USER);
    }
  }

  // Profile form pre-fill
  const nameInput = $('#profile-name');
  const emailInput = $('#profile-email');
  const roleSelect = $('#profile-role');
  if (nameInput) nameInput.value = user.name || '';
  if (emailInput) emailInput.value = user.email || '';
  if (roleSelect) roleSelect.value = user.role || 'user';

  // Check hash for direct navigation
  const hash = window.location.hash.replace('#', '') || 'overview';
  navigateTo(hash);

  // Nav item clicks
  $$('.db-nav-item, .db-bottom-item').forEach(item => {
    item.addEventListener('click', () => {
      if (item.dataset.view) navigateTo(item.dataset.view);
    });
  });

  // Sidebar toggle
  const menuToggle = $('#db-menu-toggle');
  if (menuToggle) menuToggle.addEventListener('click', openSidebar);
  const overlay = $('#db-sidebar-overlay');
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // Logout buttons
  $$('.db-logout-btn, [data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', authLogout);
  });

  // Profile save
  const profileForm = $('#profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = authLogin(nameInput.value, emailInput.value, roleSelect.value, user.password);
      showToast('Profile updated successfully!', 'success');
      $$('.db-user-name-text').forEach(el => el.textContent = updated.name || updated.email.split('@')[0]);
      $$('.db-user-initial').forEach(el => el.textContent = updated.name ? updated.name[0].toUpperCase() : 'U');
    });
  }

  // Quick book form on overview
  const qbForm = $('#db-quick-book-form');
  if (qbForm) {
    qbForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Booking request submitted! We\'ll confirm shortly.', 'success');
    });
  }
});
