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

  // Scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.service-card, .client-logo, .tool-item, .contact-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
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
});
