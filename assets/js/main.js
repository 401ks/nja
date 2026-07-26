/* ============================================================
   NaijaAssets - Main JS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // === Mobile menu ===
  const toggle  = document.getElementById('menuToggle');
  const overlay = document.getElementById('mobileOverlay');
  const panel   = document.getElementById('mobilePanel');
  const close   = document.getElementById('mobileClose');

  if (toggle && overlay && panel) {
    const open = () => {
      overlay.classList.add('open');
      panel.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      panel.focus();
    };
    const closeMenu = () => {
      overlay.classList.remove('open');
      panel.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    };

    toggle.addEventListener('click', open);
    if (close) close.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('open')) closeMenu();
    });

    // Close on nav link click (mobile)
    panel.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // === FAQ accordion ===
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all others
      item.closest('.faq-list')?.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item) other.classList.remove('open');
      });

      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // === Smooth scroll for anchor links ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.scrollBy(0, -offset);
      }
    });
  });

  // === Lazy image loading ===
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete) img.classList.add('loaded');
    else img.addEventListener('load', () => img.classList.add('loaded'));
  });

  // === Set current year in footers ===
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

});
