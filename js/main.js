// =============================================
// GABRIEL DIAS — PORTFOLIO
// Main Script v1.0
// =============================================

// ── NAVBAR SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── MOBILE MENU ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
hamburger?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── SKILL BARS ──
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
        bar.classList.add('animated');
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const skillSection = document.querySelector('#about');
if (skillSection) skillObserver.observe(skillSection);

// ── PROJECT FILTERS ──
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    cards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.style.opacity = show ? '1' : '0.2';
      card.style.transform = show ? '' : 'scale(0.97)';
      card.style.pointerEvents = show ? '' : 'none';
    });
  });
});

// ── TYPED EFFECT ──
const typedEl = document.getElementById('typed-role');
if (typedEl) {
  const roles = [
    'Desenvolvedor Python',
    'Full-Stack Developer',
    'Solucionador de Problemas',
    'Desenvolvedor Desktop',
  ];
  let roleIdx = 0, charIdx = 0, deleting = false;

  function typeLoop() {
    const current = roles[roleIdx];
    typedEl.textContent = deleting
      ? current.slice(0, charIdx--)
      : current.slice(0, charIdx++);

    let delay = deleting ? 45 : 80;
    if (!deleting && charIdx > current.length) {
      delay = 2200; deleting = true;
    } else if (deleting && charIdx < 0) {
      deleting = false; roleIdx = (roleIdx + 1) % roles.length; delay = 400;
    }
    setTimeout(typeLoop, delay);
  }
  typeLoop();
}

// ── SMOOTH ACTIVE NAV LINK ──
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navAnchors.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}`
      ? 'var(--text-primary)'
      : '';
  });
}, { passive: true });
