/* =============================================
   CAR RENTAL — MAIN JAVASCRIPT v2
   Premium Animations + Interactions
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =============================================
     PAGE LOADER
     ============================================= */
  const loader = document.getElementById('page-loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('loaded');
        // Trigger hero entrance after loader
        triggerHeroEntrance();
      }, 1100);
    });
    // Fallback if load never fires
    setTimeout(() => {
      loader?.classList.add('loaded');
      triggerHeroEntrance();
    }, 2000);
  } else {
    triggerHeroEntrance();
  }

  /* =============================================
     HERO ENTRANCE ANIMATION
     ============================================= */
  function triggerHeroEntrance() {
    // Animate hero content
    const heroContent = document.querySelector('.hero-content');
    const heroCar = document.querySelector('.hero-car-float');
    const bookCard = document.querySelector('.book-card');

    if (heroContent) {
      heroContent.style.animation = 'heroSlideIn 0.9s cubic-bezier(0.16,1,0.3,1) forwards';
    }
    if (heroCar) {
      heroCar.style.animation = 'heroCarIn 1.1s 0.3s cubic-bezier(0.16,1,0.3,1) both';
    }
    if (bookCard) {
      bookCard.style.animation = 'heroCardIn 0.9s 0.5s cubic-bezier(0.16,1,0.3,1) both';
    }
  }

  /* CSS keyframes injected via JS for hero */
  const heroStyles = document.createElement('style');
  heroStyles.textContent = `
    @keyframes heroSlideIn {
      from { opacity:0; transform: translateY(36px); }
      to   { opacity:1; transform: translateY(0); }
    }
    @keyframes heroCarIn {
      from { opacity:0; transform: translateX(60px) scale(0.92); }
      to   { opacity:1; transform: translateX(0) scale(1); }
    }
    @keyframes heroCardIn {
      from { opacity:0; transform: translateY(48px) scale(0.94); }
      to   { opacity:1; transform: translateY(0) scale(1); }
    }
    .hero-content { opacity: 0; }
    .hero-car-float { opacity: 0; }
    .book-card { opacity: 0; }
  `;
  document.head.appendChild(heroStyles);

  /* =============================================
     SCROLL ANIMATION ENGINE (data-anim)
     ============================================= */
  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        animObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  document.querySelectorAll('[data-anim]').forEach(el => {
    animObserver.observe(el);
  });

  /* =============================================
     STAGGERED CHILDREN ANIMATION
     ============================================= */
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = entry.target.querySelectorAll(':scope > *');
        children.forEach((child, i) => {
          child.style.transitionDelay = `${i * 0.1}s`;
          child.style.opacity = '0';
          child.style.transform = 'translateY(24px)';
          child.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)';
          requestAnimationFrame(() => {
            setTimeout(() => {
              child.style.opacity = '1';
              child.style.transform = 'none';
            }, i * 100);
          });
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  // Legacy reveal support
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* =============================================
     COUNTER ANIMATION
     ============================================= */
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.fact-number[data-target]').forEach(el => {
    counterObserver.observe(el);
  });

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1600;
    const frameRate = 16;
    const totalFrames = duration / frameRate;
    let frame = 0;

    const easeOut = t => 1 - Math.pow(1 - t, 3);

    const timer = setInterval(() => {
      frame++;
      const progress = easeOut(frame / totalFrames);
      const current = Math.round(progress * target);
      el.textContent = current + suffix;

      if (frame >= totalFrames) {
        el.textContent = target + suffix;
        clearInterval(timer);
      }
    }, frameRate);
  }

  /* =============================================
     NAVBAR SCROLL EFFECT
     ============================================= */
  const navbar = document.querySelector('.navbar');
  let lastScrollY = 0;

  // Threshold: switch navbar once user has scrolled past the hero
  const heroEl = document.querySelector('.ace-hero');
  const getNavThreshold = () => heroEl
    ? heroEl.offsetHeight * 0.6
    : window.innerHeight * 0.6;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (navbar) {
      if (currentScrollY > getNavThreshold()) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    lastScrollY = currentScrollY;
  }, { passive: true });

  /* =============================================
     MOBILE MENU
     ============================================= */
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuClose = document.querySelector('.mobile-menu-close');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      navToggle.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
  }

  if (mobileMenu) {
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) closeMobileMenu();
    });
  }

  function closeMobileMenu() {
    navToggle?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    mobileMenu?.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.mobile-nav-links a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Escape key closes menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  /* =============================================
     ACTIVE NAV LINK
     ============================================= */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a, .mobile-nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });

  /* =============================================
     DATE DEFAULTS
     ============================================= */
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach((input, i) => {
    input.setAttribute('min', today);
    if (input.id && input.id.includes('rental')) input.value = today;
    if (input.id && input.id.includes('return')) input.value = tomorrow;
  });

  /* =============================================
     FORM SUBMISSION
     ============================================= */
  document.querySelectorAll('.book-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.textContent = '✓ Booking Sent!';
        btn.style.background = '#22c55e';
        setTimeout(() => {
          btn.textContent = 'Book now';
          btn.style.background = '';
        }, 3000);
      }
      showToast('Booking request sent! We\'ll contact you shortly.', 'success');
    });
  });

  /* =============================================
     CTA SEARCH
     ============================================= */
  document.querySelectorAll('.cta-search').forEach(form => {
    const btn = form.querySelector('button');
    const input = form.querySelector('input');
    if (btn && input) {
      btn.addEventListener('click', () => {
        if (input.value.trim()) {
          showToast(`Searching for cars in "${input.value}"…`, 'info');
        } else {
          showToast('Please enter a city name.', 'warning');
          input.focus();
        }
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') btn.click();
      });
    }
  });

  /* =============================================
     FILTER TABS (Vehicles Page)
     ============================================= */
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter');

      document.querySelectorAll('.car-card[data-type]').forEach(card => {
        const show = filter === 'all' || card.getAttribute('data-type') === filter;
        card.style.display = show ? '' : 'none';
        if (show) {
          card.style.animation = 'fadeInCard 0.4s ease both';
        }
      });
    });
  });

  /* =============================================
     CAR CARD HOVER TILT EFFECT
     ============================================= */
  document.querySelectorAll('.car-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotX = ((y - centerY) / centerY) * 3;
      const rotY = ((x - centerX) / centerX) * 3;
      card.style.transform = `translateY(-6px) rotateX(${-rotX}deg) rotateY(${rotY}deg)`;
      card.style.boxShadow = `${-rotY * 2}px ${rotX * 2 + 12}px 32px rgba(91,63,217,0.18)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
      card.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
    });
  });

  /* =============================================
     GALLERY THUMBNAIL SWITCHER (Details page)
     ============================================= */
  const thumbs = document.querySelectorAll('.thumb');
  const mainImg = document.getElementById('main-img-el');
  if (thumbs.length && mainImg) {
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        const src = thumb.querySelector('img').src;
        mainImg.style.opacity = '0';
        mainImg.style.transform = 'scale(0.97)';
        mainImg.style.transition = 'all 0.3s ease';
        setTimeout(() => {
          mainImg.src = src;
          mainImg.style.opacity = '1';
          mainImg.style.transform = 'scale(1)';
        }, 200);
      });
      thumb.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); thumb.click(); }
      });
    });
  }

  /* =============================================
     SORT FUNCTIONALITY (Vehicles page)
     ============================================= */
  const sortSelect = document.getElementById('sort-cars');
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      const grid = document.getElementById('vehicles-grid');
      if (!grid) return;
      const cards = Array.from(grid.querySelectorAll('.car-card:not([style*="display: none"])'));
      cards.sort((a, b) => {
        const priceA = parseInt(a.dataset.price || 0);
        const priceB = parseInt(b.dataset.price || 0);
        if (this.value === 'price-asc') return priceA - priceB;
        if (this.value === 'price-desc') return priceB - priceA;
        return 0;
      });
      cards.forEach(card => grid.appendChild(card));
    });
  }

  /* =============================================
     TOAST NOTIFICATION
     ============================================= */
  function showToast(message, type = 'info') {
    const existing = document.querySelector('.cr-toast');
    if (existing) existing.remove();

    const palette = {
      success: '#22c55e',
      error:   '#ef4444',
      warning: '#f59e0b',
      info:    '#5B3FD9'
    };

    const toast = document.createElement('div');
    toast.className = 'cr-toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;

    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%) translateY(20px)',
      background: palette[type] || palette.info,
      color: 'white',
      padding: '1rem 2rem',
      borderRadius: '50px',
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.9rem',
      fontWeight: '600',
      boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
      zIndex: '99998',
      opacity: '0',
      transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
      maxWidth: '90vw',
      textAlign: 'center',
      whiteSpace: 'nowrap'
    });

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(16px)';
      setTimeout(() => toast.remove(), 350);
    }, 4000);
  }

  window.showToast = showToast;

  /* =============================================
     INJECT ADDITIONAL KEYFRAMES
     ============================================= */
  const extraStyles = document.createElement('style');
  extraStyles.textContent = `
    @keyframes fadeInCard {
      from { opacity: 0; transform: translateY(20px) scale(0.97); }
      to   { opacity: 1; transform: none; }
    }

    /* Smooth step number hover ripple */
    .step-number::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
      transform: scale(0);
      transition: transform 0.4s ease;
    }
    .step-item:hover .step-number::after { transform: scale(1.5); opacity: 0; }

    /* Feature icon bounce */
    .feature-item:hover .feature-icon {
      animation: iconBounce 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both;
    }
    @keyframes iconBounce {
      0%   { transform: scale(1) rotate(0deg); }
      40%  { transform: scale(1.15) rotate(8deg); }
      80%  { transform: scale(1.07) rotate(-4deg); }
      100% { transform: scale(1.1) rotate(5deg); }
    }

    /* Fact card entrance */
    .fact-card { perspective: 600px; }

    /* Btn ripple */
    .btn { position: relative; overflow: hidden; }
    .btn::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0.25);
      border-radius: inherit;
      transform: scale(0);
      opacity: 0;
      transition: transform 0.5s ease, opacity 0.5s ease;
    }
    .btn:active::after { transform: scale(2.5); opacity: 0; transition: none; }

    /* Nav link entrance */
    .nav-menu a { display: inline-block; }
  `;
  document.head.appendChild(extraStyles);

  /* =============================================
     SMOOTH NUMBER FORMATTING
     ============================================= */
  // Format suffixes that contain "k" or "m"
  document.querySelectorAll('.fact-number[data-target]').forEach(el => {
    const suffix = el.getAttribute('data-suffix') || '';
    if (suffix.includes('k')) {
      el.setAttribute('data-suffix', 'k+');
    } else if (suffix.includes('m')) {
      el.setAttribute('data-suffix', 'm+');
    }
  });

});
