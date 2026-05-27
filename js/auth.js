/* =============================================
   AUTH.JS — Client-side auth with localStorage
   ============================================= */

const AUTH_KEY = 'cr_user';

/** Save a user session */
function authLogin(name, email, role, password) {
  const user = { name, email, role, password, loggedIn: true, ts: Date.now() };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

/** Register a new user (same shape as login) */
function authSignup(name, email, role, password) {
  const user = { name, email, role, password, loggedIn: false, ts: Date.now() };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

/** Get current logged-in user or null */
function authGetUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user && user.loggedIn ? user : null;
  } catch { return null; }
}

/** Check if logged in */
function authIsLoggedIn() {
  return !!authGetUser();
}

/** Log out */
function authLogout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = 'index.html';
}

/* --------------------------------------------------
   NAVBAR SYNC — Call on every page load
   Replaces the Login button with avatar if logged in
   -------------------------------------------------- */
function authSyncNavbar() {
  const user = authGetUser();
  const loginBtns = document.querySelectorAll('.nav-login-btn-wrap');
  loginBtns.forEach(wrap => {
    if (user) {
      wrap.innerHTML = `
        <div class="nav-user-chip" id="nav-user-chip">
          <div class="nav-user-avatar">${user.name ? user.name[0].toUpperCase() : 'U'}</div>
          <span class="nav-user-name">${user.name ? user.name.split(' ')[0] : user.email.split('@')[0]}</span>
          <div class="nav-user-dropdown" id="nav-user-dropdown">
            <a href="dashboard.html" id="nav-dash-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Dashboard
            </a>
            <a href="dashboard.html#trips" id="nav-trips-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M12 3l9 9-9 9"/></svg>
              My Trips
            </a>
            <button onclick="authLogout()" id="nav-logout-btn" class="nav-logout-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </div>
        </div>`;
      // Toggle dropdown
      const chip = wrap.querySelector('#nav-user-chip');
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const dd = wrap.querySelector('#nav-user-dropdown');
        dd.classList.toggle('open');
      });
      document.addEventListener('click', () => {
        const dd = wrap.querySelector('#nav-user-dropdown');
        if (dd) dd.classList.remove('open');
      });
    } else {
      wrap.innerHTML = `<a href="login.html" class="nav-login-btn" id="nav-login-link">Login</a>`;
    }
  });

  // Mobile menu sync
  const mobileLoginWraps = document.querySelectorAll('.mobile-login-wrap');
  mobileLoginWraps.forEach(wrap => {
    if (user) {
      wrap.innerHTML = `
        <div class="mobile-user-info">
          <div class="mobile-user-avatar">${user.name ? user.name[0].toUpperCase() : 'U'}</div>
          <div>
            <strong>${user.name || user.email}</strong>
            <span class="role-badge role-${user.role}">${user.role}</span>
          </div>
        </div>
        <a href="dashboard.html" style="display:block;padding:1rem 0;border-bottom:1px solid var(--gray-200);">Dashboard</a>
        <a href="dashboard.html#trips" style="display:block;padding:1rem 0;border-bottom:1px solid var(--gray-200);">My Trips</a>
        <button onclick="authLogout()" style="width:100%;text-align:left;background:none;cursor:pointer;padding:1rem 0;color:#e11d48;font-weight:600;">Logout</button>`;
    } else {
      wrap.innerHTML = `<a href="login.html" style="display:block;padding:1rem 0;background:var(--primary);color:white;text-align:center;border-radius:50px;font-weight:700;margin-top:1rem;">Login</a>`;
    }
  });
}

// Auto-sync on load
document.addEventListener('DOMContentLoaded', authSyncNavbar);
