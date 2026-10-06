// === Init ===
document.addEventListener('DOMContentLoaded', () => {
  // Mobile toggle
  document.querySelector('.mobile-toggle').addEventListener('click', function () {
    document.querySelector('.nav-links').classList.toggle('open');
    this.classList.toggle('active');
  });

  // Close mobile nav on link click
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelector('.nav-links').classList.remove('open');
    });
  });

  // === Custom Cursor ===
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (cursor && ring && window.matchMedia('(hover: hover)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx - 6 + 'px';
      cursor.style.top = my - 6 + 'px';
    });

    function animateRing() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx - 20 + 'px';
      ring.style.top = ry - 20 + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('a, button, .btn, .service-card, .client-logo, .contact-card, .work-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovering');
        ring.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovering');
        ring.classList.remove('hovering');
      });
    });
  }

  // Scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.svc-item, .about-stat, .tool-pill, .contact-card, .work-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  // === Stat Counter Animation ===
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'));
        if (!target) return;
        let current = 0;
        const duration = 1500;
        const step = Math.max(1, Math.floor(target / (duration / 30)));
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = current;
        }, 30);
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    statObserver.observe(el);
  });

  // Smooth active nav highlighting
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          link.style.color = '#00d4ff';
        } else {
          link.style.color = '';
        }
      }
    });
  });

  // === Work Filters ===
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  workCards.forEach(card => {
    if (card.dataset.category !== 'ai-ad') card.style.display = 'none';
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      let verticalCount = 0;
      let totalVisible = 0;
      workCards.forEach(card => {
        if (card.dataset.category === filter) {
          card.style.display = '';
          totalVisible++;
          if (card.classList.contains('work-card--vertical') || card.classList.contains('work-card--square')) verticalCount++;
          requestAnimationFrame(() => {
            card.classList.add('visible');
          });
        } else {
          card.style.display = 'none';
          card.classList.remove('visible');
        }
      });
      const grid = document.getElementById('workGrid');
      const allVertical = verticalCount === totalVisible;
      grid.style.gridTemplateColumns = allVertical ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)';
    });
  });

  // === Video Modal ===
  const modal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');
  const modalOverlay = document.getElementById('modalOverlay');

  workCards.forEach(card => {
    card.addEventListener('click', () => {
      const videoSrc = card.dataset.video;
      if (!videoSrc) return;
      modalVideo.src = videoSrc;
      if (card.classList.contains('work-card--vertical')) {
        modalContent.classList.add('vertical');
      } else {
        modalContent.classList.remove('vertical');
      }
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      modalVideo.play();
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    modalVideo.pause();
    modalVideo.src = '';
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // === Download Prevention ===
  modalVideo.addEventListener('contextmenu', e => e.preventDefault());

  document.addEventListener('keydown', e => {
    if (modal.classList.contains('active')) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
      }
    }
  });
});
