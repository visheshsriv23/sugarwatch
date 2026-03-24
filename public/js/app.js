// ══════════════════════════════════════
//  SugarWatch — client app.js
// ══════════════════════════════════════

// ── SIDEBAR MOBILE ───────────────────
// Updated Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
    if (overlay) {
        overlay.classList.toggle('open');
    }
}
function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('open');
}

// ── PASSWORD VISIBILITY ──────────────
function togglePassword(id) {
  const input = document.getElementById(id);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

// ── TAB SWITCHING ────────────────────
function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('tab-' + tabId);
  if (panel) panel.classList.add('active');
  if (btn) btn.classList.add('active');
}

// ── AUTO-DISMISS ALERTS ──────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.alert').forEach(alert => {
    setTimeout(() => {
      alert.style.transition = 'opacity .5s, transform .5s';
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-8px)';
      setTimeout(() => alert.remove(), 500);
    }, 4500);
  });

  // Animate metric values on load
  document.querySelectorAll('.metric-value').forEach(el => {
    el.style.transition = 'opacity .4s, transform .4s';
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 100 + Math.random() * 300);
  });

  // Animate sugar fill bars
  document.querySelectorAll('.sugar-fill').forEach(el => {
    const target = el.style.width;
    el.style.width = '0';
    setTimeout(() => { el.style.width = target; }, 200);
  });

  // Toggle switches fix
  document.querySelectorAll('.tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

// ── CONFIRM DELETES ──────────────────
document.addEventListener('click', e => {
  if (e.target.matches('[data-confirm]')) {
    if (!confirm(e.target.dataset.confirm)) e.preventDefault();
  }
});
// --- SIDEBAR TOGGLE LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Select the elements
    const menuBtn = document.querySelector('.sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    // 2. Open Sidebar when Hamburger is clicked
    if (menuBtn && sidebar && overlay) {
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevents any default jumping
            sidebar.classList.add('open');
            overlay.classList.add('open');
            console.log("Sidebar opened successfully"); 
        });

        // 3. Close Sidebar when Overlay is clicked
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            console.log("Sidebar closed via overlay");
        });
    } else {
        console.error("Sidebar elements not found. Check your IDs and Classes!");
    }
});
