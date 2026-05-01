/* ============================
   THEME TOGGLE
============================ */
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('gb-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('gb-theme', next);
  initCanvas(); // re-init canvas on theme switch
});

/* ============================
   MOBILE MENU
============================ */
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ============================
   CUSTOM CURSOR
============================ */
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');
const cursorGlow = document.getElementById('cursorGlow');

let mouseX = 0, mouseY = 0, trailX = 0, trailY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
  cursorGlow.style.left = mouseX + 'px';
  cursorGlow.style.top = mouseY + 'px';
});

function animateTrail() {
  trailX += (mouseX - trailX) * 0.1;
  trailY += (mouseY - trailY) * 0.1;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top = trailY + 'px';
  requestAnimationFrame(animateTrail);
}
animateTrail();

document.addEventListener('mouseover', (e) => {
  if (e.target.closest('a, button, [data-magnetic], .project-card, .post-card, .skill-item')) {
    document.body.classList.add('cursor-hover');
  } else {
    document.body.classList.remove('cursor-hover');
  }
});

/* ============================
   NAV SCROLL + ACTIVE LINKS
============================ */
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');
const scrollProgress = document.getElementById('scrollProgress');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  nav.classList.toggle('scrolled', scrolled > 50);

  // Scroll progress bar
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrolled / docHeight) * 100;
  scrollProgress.style.width = progress + '%';

  // Active nav link
  let current = '';
  sections.forEach(section => {
    if (scrolled >= section.offsetTop - 160) current = section.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
});

/* ============================
   SCROLL REVEAL
============================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });

function observeReveal() {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* ============================
   HERO CANVAS PARTICLES
============================ */
function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const isDark = html.getAttribute('data-theme') === 'dark';
  const particleColor = isDark ? 'rgba(168,85,247,' : 'rgba(109,40,217,';
  const lineColor = isDark ? 'rgba(6,182,212,' : 'rgba(8,145,178,';

  const particles = [];
  const count = Math.min(60, Math.floor(canvas.width / 20));

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1
    });
  }

  let animId;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = particleColor + p.opacity + ')';
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = lineColor + (0.08 * (1 - dist / 120)) + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    animId = requestAnimationFrame(draw);
  }
  if (window._canvasAnimId) cancelAnimationFrame(window._canvasAnimId);
  draw();
  window._canvasAnimId = animId;

  // Resize handler
  window.addEventListener('resize', () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  });
}
initCanvas();

/* ============================
   TYPEWRITER / WORD CYCLE
============================ */
const words = ['Intelligent', 'Scalable', 'Automated', 'Efficient', 'Powerful'];
let wordIdx = 0, charIdx = 0, deleting = false;
let typeWriterRunning = false;

function typeWriter() {
  const typedEl = document.getElementById('typedWord'); // live lookup every tick
  if (!typedEl) return;
  const word = words[wordIdx];
  if (!deleting) {
    typedEl.textContent = word.substring(0, charIdx + 1);
    charIdx++;
    if (charIdx === word.length) {
      deleting = true;
      setTimeout(typeWriter, 2000);
      return;
    }
  } else {
    typedEl.textContent = word.substring(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      deleting = false;
      wordIdx = (wordIdx + 1) % words.length;
    }
  }
  setTimeout(typeWriter, deleting ? 55 : 90);
}

function startTypeWriter() {
  if (typeWriterRunning) return;
  typeWriterRunning = true;
  typeWriter();
}
// Start after hero animation
setTimeout(startTypeWriter, 2500);

/* ============================
   COUNTER ANIMATION
============================ */
function animateCounter(el, target, suffix = '+') {
  const duration = 1600;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('[data-count]').forEach(el => {
        animateCounter(el, parseInt(el.dataset.count));
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

/* ============================
   HELPERS
============================ */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function parseBody(lines) {
  return lines.map(line => {
    if (line.includes('```')) {
      const code = line.replace(/```[a-z]*/g, '').replace(/```/g, '').trim();
      return code ? `<pre><code>${escapeHtml(code)}</code></pre>` : '';
    }
    let parsed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    parsed = parsed.replace(/`(.+?)`/g, '<code style="background:var(--code-bg);padding:2px 6px;border-radius:4px;font-size:0.84em;font-family:monospace">$1</code>');
    return parsed ? `<p>${parsed}</p>` : '';
  }).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ============================
   MODAL
============================ */
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
let currentPost = null;

function openModal(post) {
  currentPost = post;
  document.getElementById('modalCategory').textContent = post.category;
  document.getElementById('modalCategory').className = `post-category cat-${post.category}`;
  document.getElementById('modalDate').textContent = formatDate(post.date);
  document.getElementById('modalTitle').textContent = post.title;
  document.getElementById('modalTags').innerHTML = (post.tags||[]).map(t=>`<span>${t}</span>`).join('');
  document.getElementById('modalBody').innerHTML = parseBody(post.body||[]);
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  currentPost = null;
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// Copy link
document.getElementById('copyLinkBtn')?.addEventListener('click', () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = document.getElementById('copyLinkBtn');
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '🔗 Copy Link'; btn.classList.remove('copied'); }, 2000);
  });
});

/* ============================
   KNOWLEDGE FILTERS + SEARCH
============================ */
let activeFilter = 'all';
let searchQuery = '';
let allPosts = [];

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    filterAndSearch();
  });
});

const searchInput = document.getElementById('knowledgeSearch');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    filterAndSearch();
  });
}

// Cmd+K shortcut
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
});

function filterAndSearch() {
  const cards = document.querySelectorAll('.post-card');
  let visible = 0;
  cards.forEach(card => {
    const cat = card.dataset.category;
    const title = card.querySelector('.post-title')?.textContent?.toLowerCase() || '';
    const summary = card.querySelector('.post-summary')?.textContent?.toLowerCase() || '';
    const tags = [...card.querySelectorAll('.post-tags span')].map(s => s.textContent.toLowerCase()).join(' ');

    const catMatch = activeFilter === 'all' || cat === activeFilter;
    const searchMatch = !searchQuery || title.includes(searchQuery) || summary.includes(searchQuery) || tags.includes(searchQuery);

    if (catMatch && searchMatch) {
      card.classList.remove('hidden'); visible++;
    } else {
      card.classList.add('hidden');
    }
  });

  // Show no-results
  const noResults = document.querySelector('.no-results');
  if (noResults) noResults.remove();
  if (visible === 0 && document.getElementById('knowledgeContainer')) {
    const el = document.createElement('div');
    el.className = 'no-results reveal';
    el.innerHTML = `<p>No posts found for "<strong>${searchQuery || activeFilter}</strong>"</p>`;
    document.getElementById('knowledgeContainer').appendChild(el);
    revealObserver.observe(el);
  }
}

/* ============================
   FOOTER CLOCK
============================ */
function updateClock() {
  const timeEl = document.getElementById('footerTime');
  if (!timeEl) return;
  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'Asia/Kolkata'
  }) + ' IST';
}
updateClock();
setInterval(updateClock, 1000);

/* ============================
   AI CHAT WIDGET
============================ */
const aiChatBubble = document.getElementById('aiChatBubble');
const aiChatPanel = document.getElementById('aiChatPanel');
const aiChatClose = document.getElementById('aiChatClose');
const aiChatInput = document.getElementById('aiChatInput');
const aiChatSend = document.getElementById('aiChatSend');
const aiChatMessages = document.getElementById('aiChatMessages');

let portfolioContext = '';
let chatHistory = [];

aiChatBubble.addEventListener('click', () => {
  aiChatPanel.classList.toggle('open');
  if (aiChatPanel.classList.contains('open')) aiChatInput.focus();
});

aiChatClose.addEventListener('click', () => aiChatPanel.classList.remove('open'));

aiChatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
});
aiChatSend.addEventListener('click', sendChat);

function addChatMsg(text, role) {
  const div = document.createElement('div');
  div.className = `ai-msg ${role}`;
  div.textContent = text;
  aiChatMessages.appendChild(div);
  aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
  return div;
}

function addTypingIndicator() {
  const div = document.createElement('div');
  div.className = 'ai-typing';
  div.id = 'typingIndicator';
  div.innerHTML = '<span></span><span></span><span></span>';
  aiChatMessages.appendChild(div);
  aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

async function sendChat() {
  const msg = aiChatInput.value.trim();
  if (!msg) return;

  addChatMsg(msg, 'user');
  chatHistory.push({ role: 'user', content: msg });
  aiChatInput.value = '';
  aiChatSend.disabled = true;
  addTypingIndicator();

  const systemPrompt = `You are a helpful AI assistant for Goutam Laxminarayan Bhat's portfolio website. Answer questions about him based on this context:

${portfolioContext}

Keep responses concise, friendly, and relevant. If asked something unrelated, steer the conversation back to Goutam's work and skills. Don't make up information not in the context.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: chatHistory.slice(-8) // last 8 messages for context
      })
    });

    const data = await response.json();
    removeTypingIndicator();

    const reply = data.content?.[0]?.text || "Sorry, I couldn't process that. Try asking about Goutam's skills or projects!";
    addChatMsg(reply, 'ai');
    chatHistory.push({ role: 'assistant', content: reply });
  } catch (err) {
    removeTypingIndicator();
    addChatMsg("Oops! Something went wrong. Please try again.", 'ai');
  } finally {
    aiChatSend.disabled = false;
    aiChatInput.focus();
  }
}

/* ============================
   LOAD DATA FROM projects.json
============================ */
fetch('projects.json')
  .then(res => res.json())
  .then(data => {

    // Build portfolio context for AI chat
    portfolioContext = JSON.stringify({
      profile: data.profile,
      about: { headline: data.about?.headline, paragraphs: data.about?.paragraphs, skills: data.about?.skills },
      projects: data.projects?.map(p => ({ title: p.title, description: p.description, tags: p.tags })),
      knowledgePosts: data.knowledge_center?.map(k => ({ title: k.title, category: k.category, summary: k.summary, tags: k.tags }))
    }, null, 2);

    /* --- PROFILE --- */
    const p = data.profile;
    if (p) {
      document.getElementById('heroTag').textContent = p.tagline || '';
      if (p.hero_headline?.length >= 3) {
        document.getElementById('heroTitle').innerHTML =
          `${p.hero_headline[0]}<br><em id="typedWord">${p.hero_headline[1]}</em><br>${p.hero_headline[2]}`;
        // restart typewriter on the fresh <em> element
        wordIdx = 0; charIdx = 0; deleting = false;
        typeWriterRunning = false;
        setTimeout(startTypeWriter, 100);
      }
      if (p.hero_sub) document.getElementById('heroSub').innerHTML = p.hero_sub.replace(/,?\s*<br>\s*/g, '<br>');
      if (p.name)  document.getElementById('profileName').textContent = p.name;
      if (p.title) document.getElementById('profileTitle').textContent = p.title;
      if (p.status) document.getElementById('statusText').textContent = p.status;
      if (p.name) {
        const parts = p.name.split(' ');
        document.getElementById('footerName').textContent =
          `© ${new Date().getFullYear()} ${parts[0]} ${parts[parts.length - 1]}`;
      }

      if (p.tech_tags) {
        document.getElementById('profileTags').innerHTML =
          p.tech_tags.map(t => `<span>${t}</span>`).join('');
        // Also populate tech orbit
        const orbit = document.getElementById('techOrbit');
        if (orbit) {
          orbit.innerHTML = p.tech_tags.map(t =>
            `<span class="orbit-tag">${t}</span>`
          ).join('');
        }
      }

      if (p.stats) {
        const statsEl = document.getElementById('profileStats');
        statsEl.innerHTML = p.stats.map(s => {
          const num = parseInt(s.value);
          return `<div class="profile-stat"><strong data-count="${num}">${num}</strong><span>${s.label}</span></div>`;
        }).join('');
        statsObserver.observe(statsEl);
      }

      // Contact links
      const contactLinks = document.getElementById('contactLinks');
      if (contactLinks) {
        let html = '';
        if (p.email) html += `
          <a href="mailto:${p.email}" class="contact-link">
            <span class="contact-link-icon">✉</span>
            ${p.email}
            <span class="contact-link-arrow">↗</span>
          </a>`;
        if (p.github) html += `
          <a href="${p.github}" target="_blank" rel="noopener" class="contact-link">
            <span class="contact-link-icon">⌥</span>
            ${p.github.replace('https://','')}
            <span class="contact-link-arrow">↗</span>
          </a>`;
        if (p.linkedin) html += `
          <a href="${p.linkedin}" target="_blank" rel="noopener" class="contact-link">
            <span class="contact-link-icon">in</span>
            ${p.linkedin.replace('https://','')}
            <span class="contact-link-arrow">↗</span>
          </a>`;
        contactLinks.innerHTML = html;
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
            <div class="skill-item reveal">
              <span class="skill-icon">${s.icon}</span>
              <strong>${s.title}</strong>
              <span>${s.detail}</span>
            </div>`).join('');
      }
    }

    /* --- PROJECTS --- */
    const projects = data.projects || [];
    const container = document.getElementById('projectsContainer');
    document.getElementById('projectCount').textContent =
      `${projects.length} project${projects.length !== 1 ? 's' : ''}`;
    container.innerHTML = '';

    projects.forEach((proj, i) => {
      const card = document.createElement('div');
      card.className = 'project-card reveal';
      card.style.transitionDelay = `${i * 0.08}s`;
      card.innerHTML = `
        <div class="project-img-wrap">
          <img src="${proj.image}" alt="${proj.title}" loading="lazy">
          <div class="project-img-overlay"></div>
        </div>
        <div class="project-body">
          <h3 class="project-title">${proj.title}</h3>
          <p class="project-desc">${proj.description}</p>
          <div class="project-footer">
            <div class="project-tags">${(proj.tags||[]).map(t=>`<span>${t}</span>`).join('')}</div>
            <a href="${proj.link}" target="_blank" rel="noopener" class="project-link">View ↗</a>
          </div>
        </div>`;
      container.appendChild(card);
    });

    /* --- KNOWLEDGE CENTER --- */
    allPosts = data.knowledge_center || [];
    const kContainer = document.getElementById('knowledgeContainer');
    kContainer.innerHTML = '';

    // Deduplicate by id
    const seen = new Set();
    const unique = allPosts.filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id); return true;
    });
    allPosts = unique;

    const sorted = [...allPosts].sort((a, b) => new Date(b.date) - new Date(a.date));

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
          <div class="post-tags">${(post.tags||[]).map(t=>`<span>${t}</span>`).join('')}</div>
          <span class="post-read-more">Read →</span>
        </div>`;
      card.addEventListener('click', () => openModal(post));
      kContainer.appendChild(card);
    });

    // Mark extra elements for reveal
    document.querySelectorAll('.about-grid, .contact-inner, .knowledge-header').forEach(el => {
      if (!el.classList.contains('reveal')) el.classList.add('reveal');
    });

    observeReveal();
  })
  .catch(err => {
    console.error('Failed to load projects.json:', err);
    document.getElementById('projectsContainer').innerHTML =
      `<p style="color:var(--muted);padding:20px">Could not load projects. Make sure projects.json is in the same folder.</p>`;
    document.getElementById('projectCount').textContent = '0 projects';
    document.getElementById('knowledgeContainer').innerHTML =
      `<p style="color:var(--muted);padding:20px">Could not load posts.</p>`;
    observeReveal();
  });
