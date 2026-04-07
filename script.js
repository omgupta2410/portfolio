// === Admin Mode (add ?edit=true to URL to show Add Work panel) ===
const isAdmin = new URLSearchParams(window.location.search).get('edit') === 'true';

// === Storage ===
const STORAGE_KEY = 'om_portfolio_works';

function getWorks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

function saveWorks(works) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
}

// === URL Parsing ===
function parseVideoUrl(url) {
  url = url.trim();

  // YouTube - various formats
  const ytPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of ytPatterns) {
    const match = url.match(pattern);
    if (match) {
      const isShort = url.includes('/shorts/');
      return {
        type: 'youtube',
        id: match[1],
        thumbnail: `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`,
        isVertical: isShort
      };
    }
  }

  // Instagram Reels/Posts
  const igPatterns = [
    /instagram\.com\/(?:reel|p|reels)\/([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of igPatterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        type: 'instagram',
        id: match[1],
        thumbnail: null,
        embedUrl: `https://www.instagram.com/reel/${match[1]}/embed/`,
        isVertical: true
      };
    }
  }

  return null;
}

// === Render Work Cards ===
function renderWorks(filter = 'all') {
  const grid = document.getElementById('workGrid');
  const works = getWorks();

  const filtered = filter === 'all' ? works : works.filter(w => w.category === filter);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
        <p>No work items yet. Paste a YouTube or Instagram link above to add your first one!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((work, i) => {
    const categoryLabels = {
      'short-form': 'Short Form',
      'long-form': 'Long Form',
      'motion-graphics': 'Motion Graphics',
      'podcast': 'Podcast',
      'vsl': 'VSL'
    };

    const sourceClass = work.videoData.type === 'youtube' ? 'source-youtube' : 'source-instagram';
    const sourceLabel = work.videoData.type === 'youtube' ? 'YouTube' : 'Instagram';

    if (work.videoData.type === 'instagram') {
      return `
        <div class="work-card" data-category="${work.category}" data-index="${i}">
          <span class="work-card-source ${sourceClass}">${sourceLabel}</span>
          ${isAdmin ? `<button class="work-card-delete" onclick="deleteWork(event, ${i})">&times;</button>` : ''}
          <div class="work-card-embed" onclick="openModal('${work.videoData.embedUrl}', true)">
            <iframe src="${work.videoData.embedUrl}" loading="lazy" allowfullscreen></iframe>
          </div>
          <div class="work-card-info">
            <div class="work-card-title">${work.title || 'Instagram Reel'}</div>
            <div class="work-card-category">${categoryLabels[work.category] || work.category}</div>
          </div>
        </div>
      `;
    }

    return `
      <div class="work-card" data-category="${work.category}" data-index="${i}" onclick="openModal('${work.videoData.embedUrl}', ${work.videoData.isVertical})">
        <span class="work-card-source ${sourceClass}">${sourceLabel}</span>
        ${isAdmin ? `<button class="work-card-delete" onclick="deleteWork(event, ${i})">&times;</button>` : ''}
        <div class="work-card-thumb">
          <img src="${work.videoData.thumbnail}" alt="${work.title || 'Video'}" loading="lazy"
               onerror="this.src='https://img.youtube.com/vi/${work.videoData.id}/hqdefault.jpg'">
          <div class="work-card-play"></div>
        </div>
        <div class="work-card-info">
          <div class="work-card-title">${work.title || 'Untitled'}</div>
          <div class="work-card-category">${categoryLabels[work.category] || work.category}</div>
        </div>
      </div>
    `;
  }).join('');
}

// === Add Work ===
function addWork() {
  const urlInput = document.getElementById('workUrl');
  const categoryInput = document.getElementById('workCategory');
  const titleInput = document.getElementById('workTitle');

  const url = urlInput.value.trim();
  if (!url) return;

  const videoData = parseVideoUrl(url);
  if (!videoData) {
    alert('Please paste a valid YouTube or Instagram link.');
    return;
  }

  const works = getWorks();
  works.unshift({
    url,
    title: titleInput.value.trim() || '',
    category: categoryInput.value,
    videoData,
    addedAt: Date.now()
  });

  saveWorks(works);
  renderWorks(currentFilter);

  urlInput.value = '';
  titleInput.value = '';
}

function deleteWork(event, index) {
  event.stopPropagation();
  if (!confirm('Remove this work item?')) return;
  const works = getWorks();
  works.splice(index, 1);
  saveWorks(works);
  renderWorks(currentFilter);
}

// === Modal ===
function openModal(embedUrl, isVertical) {
  const modal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');
  const modalContent = modal.querySelector('.modal-content');

  modalContent.classList.toggle('vertical', isVertical);
  modalVideo.innerHTML = `<iframe src="${embedUrl}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');
  modal.classList.remove('active');
  modalVideo.innerHTML = '';
  document.body.style.overflow = '';
}

// === Filters ===
let currentFilter = 'all';

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
  // Show admin panel if ?edit=true
  if (isAdmin) {
    document.getElementById('adminPanel').style.display = '';
  }

  // Render works
  renderWorks();

  // Add work button
  document.getElementById('addWorkBtn').addEventListener('click', addWork);

  // Enter key on URL input
  document.getElementById('workUrl').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addWork();
  });

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderWorks(currentFilter);
    });
  });

  // Modal close
  document.querySelector('.modal-close').addEventListener('click', closeModal);
  document.querySelector('.modal-overlay').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

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
