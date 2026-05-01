/* ============================
   THEME TOGGLE
============================ */
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

// Load saved preference or default to dark
const savedTheme = localStorage.getItem('gb-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('gb-theme', next);
});

/* ============================
   CUSTOM CURSOR
============================ */
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');

let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top = trailY + 'px';
  requestAnimationFrame(animateTrail);
}
animateTrail();

document.addEventListener('mouseover', (e) => {
  if (e.target.closest('a, button')) {
    cursor.style.transform = 'translate(-50%, -50%) scale(2)';
  } else {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
  }
});

/* ============================
   NAV SCROLL
============================ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

/* ============================
   SCROLL REVEAL
============================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

function observeReveal() {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* ============================
   HELPERS
============================ */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Very simple markdown-like parser for modal body (bold + code blocks)
function parseBody(lines) {
  return lines.map(line => {
    // Code block
    if (line.includes('```')) {
      // Multi-line code: treat whole item as pre if starts with ```
      const code = line.replace(/```[a-z]*/g, '').replace(/```/g, '').trim();
      if (code) return `<pre><code>${escapeHtml(code)}</code></pre>`;
      return '';
    }
    // Bold **text**
    let parsed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Inline code `text`
    parsed = parsed.replace(/`(.+?)`/g, '<code style="background:var(--code-bg);padding:2px 6px;border-radius:4px;font-size:0.85em;font-family:monospace">$1</code>');
    return parsed ? `<p>${parsed}</p>` : '';
  }).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ============================
   MODAL
============================ */
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');

function openModal(post) {
  document.getElementById('modalCategory').textContent = post.category;
  document.getElementById('modalCategory').className = `post-category cat-${post.category}`;
  document.getElementById('modalDate').textContent = formatDate(post.date);
  document.getElementById('modalTitle').textContent = post.title;
  document.getElementById('modalTags').innerHTML = (post.tags || []).map(t => `<span>${t}</span>`).join('');
  document.getElementById('modalBody').innerHTML = parseBody(post.body || []);
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

/* ============================
   KNOWLEDGE CENTER FILTERS
============================ */
let activeFilter = 'all';

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    filterPosts();
  });
});

function filterPosts() {
  document.querySelectorAll('.post-card').forEach(card => {
    const cat = card.dataset.category;
    if (activeFilter === 'all' || cat === activeFilter) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

/* ============================
   LOAD DATA FROM projects.json
============================ */
fetch('projects.json')
  .then(res => res.json())
  .then(data => {

    /* --- PROFILE --- */
    const p = data.profile;
    if (p) {
      document.getElementById('heroTag').textContent = p.tagline || '';
      if (p.hero_headline && p.hero_headline.length >= 3) {
        document.getElementById('heroTitle').innerHTML =
          `${p.hero_headline[0]}<br><em>${p.hero_headline[1]}</em><br>${p.hero_headline[2]}`;
      }
      if (p.hero_sub) document.getElementById('heroSub').innerHTML = p.hero_sub;
      if (p.name)  document.getElementById('profileName').textContent = p.name;
      if (p.title) document.getElementById('profileTitle').textContent = p.title;
      if (p.status) document.getElementById('statusText').textContent = p.status;
      if (p.name)  document.getElementById('footerName').textContent = `© ${new Date().getFullYear()} ${p.name.split(' ')[0]} ${p.name.split(' ').slice(-1)[0]}`;

      if (p.tech_tags) {
        document.getElementById('profileTags').innerHTML =
          p.tech_tags.map(t => `<span>${t}</span>`).join('');
      }
      if (p.stats) {
        document.getElementById('profileStats').innerHTML =
          p.stats.map(s => `<div class="profile-stat"><strong>${s.value}</strong><span>${s.label}</span></div>`).join('');
      }

      // Contact links
      const contactLinks = document.getElementById('contactLinks');
      if (contactLinks) {
        let linksHtml = '';
        if (p.email) {
          linksHtml += `
            <a href="mailto:${p.email}" class="contact-link">
              <span class="contact-link-icon">✉</span>
              ${p.email}
              <span class="contact-link-arrow">↗</span>
            </a>`;
        }
        if (p.github) {
          linksHtml += `
            <a href="${p.github}" target="_blank" rel="noopener" class="contact-link">
              <span class="contact-link-icon">⌥</span>
              ${p.github.replace('https://', '')}
              <span class="contact-link-arrow">↗</span>
            </a>`;
        }
        if (p.linkedin) {
          linksHtml += `
            <a href="${p.linkedin}" target="_blank" rel="noopener" class="contact-link">
              <span class="contact-link-icon">in</span>
              ${p.linkedin.replace('https://', '')}
              <span class="contact-link-arrow">↗</span>
            </a>`;
        }
        contactLinks.innerHTML = linksHtml;
      }
    }

    /* --- ABOUT --- */
    const a = data.about;
    if (a) {
      if (a.headline) {
        document.getElementById('aboutHeadline').innerHTML =
          `${a.headline[0]}<br><em>${a.headline[1]}</em>`;
      }
      if (a.paragraphs) {
        document.getElementById('aboutParagraphs').innerHTML =
          a.paragraphs.map(t => `<p>${t}</p>`).join('');
      }
      if (a.skills) {
        document.getElementById('skillsGrid').innerHTML =
          a.skills.map(s => `
            <div class="skill-item">
              <span class="skill-icon">${s.icon}</span>
              <strong>${s.title}</strong>
              <span>${s.detail}</span>
            </div>`).join('');
      }
    }

    /* --- PROJECTS --- */
    const projects = data.projects || [];
    const container = document.getElementById('projectsContainer');
    const countEl = document.getElementById('projectCount');
    countEl.textContent = `${projects.length} project${projects.length !== 1 ? 's' : ''}`;
    container.innerHTML = '';

    projects.forEach((proj, i) => {
      const tags = proj.tags || [];
      const card = document.createElement('div');
      card.className = 'project-card reveal';
      card.style.transitionDelay = `${i * 0.07}s`;
      card.innerHTML = `
        <div class="project-img-wrap">
          <img src="${proj.image}" alt="${proj.title}" loading="lazy">
          <div class="project-img-overlay"></div>
        </div>
        <div class="project-body">
          <h3 class="project-title">${proj.title}</h3>
          <p class="project-desc">${proj.description}</p>
          <div class="project-footer">
            <div class="project-tags">${tags.map(t => `<span>${t}</span>`).join('')}</div>
            <a href="${proj.link}" target="_blank" rel="noopener" class="project-link">View ↗</a>
          </div>
        </div>`;
      container.appendChild(card);
    });

    /* --- KNOWLEDGE CENTER --- */
    const posts = data.knowledge_center || [];
    const kContainer = document.getElementById('knowledgeContainer');
    kContainer.innerHTML = '';

    // Sort newest first
    const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach((post, i) => {
      const card = document.createElement('div');
      card.className = 'post-card reveal';
      card.dataset.category = post.category;
      card.style.transitionDelay = `${i * 0.07}s`;
      card.innerHTML = `
        <div class="post-card-top">
          <span class="post-category cat-${post.category}">${post.category}</span>
          <span class="post-date">${formatDate(post.date)}</span>
        </div>
        <h3 class="post-title">${post.title}</h3>
        <p class="post-summary">${post.summary}</p>
        <div class="post-footer">
          <div class="post-tags">${(post.tags || []).map(t => `<span>${t}</span>`).join('')}</div>
          <span class="post-read-more">Read →</span>
        </div>`;
      card.addEventListener('click', () => openModal(post));
      kContainer.appendChild(card);
    });

    // Also observe section elements
    document.querySelectorAll('.about-grid, .contact-inner, .knowledge-header').forEach(el => {
      el.classList.add('reveal');
    });

    // Kick off observers after all elements are inserted
    observeReveal();
  })
  .catch(err => {
    console.error('Failed to load projects.json:', err);
    document.getElementById('projectsContainer').innerHTML =
      `<p style="color:var(--muted);padding:20px">Could not load projects. Make sure projects.json is in the same folder.</p>`;
    document.getElementById('projectCount').textContent = '0 projects';
    document.getElementById('knowledgeContainer').innerHTML =
      `<p style="color:var(--muted);padding:20px">Could not load knowledge posts.</p>`;
    observeReveal();
  });
