// =============================================
// GABRIEL DIAS — PORTFOLIO
// Main Script v2.0 — "warm & kinetic"
// =============================================

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── TEMA ──
const root = document.documentElement;
root.classList.add('js');
// claro por padrão (o clima da página é o creme); o escuro fica no toggle
const stored = localStorage.getItem('gd-theme');
root.setAttribute('data-theme', stored === 'dark' ? 'dark' : 'light');

document.getElementById('theme-toggle')?.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('gd-theme', next);
});

// ── NAVBAR ──
const navbar = document.getElementById('navbar');
const navLinks = document.getElementById('nav-links');
const hamburger = document.getElementById('hamburger');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

hamburger?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(open));
});
navLinks?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
  });
});

// ── TIPOGRAFIA CINÉTICA: letras entrando com máscara ──
function splitChars(line, baseDelay) {
  const text = line.textContent.trim();
  line.setAttribute('aria-label', text);
  line.textContent = '';

  [...text].forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = ch === ' ' ? 'char space' : 'char';
    span.textContent = ch === ' ' ? '\u00a0' : ch;
    span.style.setProperty('--d', `${baseDelay + i * 0.032}s`);
    span.setAttribute('aria-hidden', 'true');
    line.appendChild(span);
  });
}

function runKinetic() {
  document.querySelectorAll('[data-kinetic]').forEach((line, i) => splitChars(line, 0.15 + i * 0.16));
}
runKinetic();

// ── SAUDAÇÃO POLIGLOTA: não segue o idioma escolhido, fica trocando sozinha ──
const greeting = document.getElementById('greeting');
if (greeting) {
  const HELLOS = ['Olá', 'Hi', 'Hola', 'Ciao', 'Salut', 'Hallo', 'Привет', '你好', 'こんにちは', 'Γεια'];
  let gi = 0;

  splitChars(greeting, 0.15);
  if (!reduceMotion) {
    setInterval(() => {
      gi = (gi + 1) % HELLOS.length;
      greeting.textContent = HELLOS[gi];
      splitChars(greeting, 0);
    }, 1500);
  }
}

// ── MARQUEE: replica o conjunto até cobrir o dobro da tela ──
document.querySelectorAll('.marquee-track').forEach(track => {
  const sets = track.querySelectorAll('.marquee-set');
  const base = sets[0];
  if (!base) return;

  sets.forEach((s, i) => { if (i > 0) s.remove(); });

  const setWidth = base.getBoundingClientRect().width;
  const target = Math.max(window.innerWidth, window.screen.width || 0) * 2;
  const copies = Math.max(2, Math.ceil(target / Math.max(setWidth, 1)) + 1);

  for (let i = 1; i < copies; i++) {
    const clone = base.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  }
  track.style.setProperty('--sets', copies);
  // duração proporcional ao tamanho do conjunto: velocidade constante
  track.style.animationDuration = `${Math.max(14, setWidth / 42)}s`;
});

// ══════════════════════════════════
// GATO PIXEL ART
// grade lógica de 40x24 "pixels", desenhada em retângulos
// ══════════════════════════════════
const catCanvas = document.getElementById('cat-canvas');
if (catCanvas) {
  const ctx = catCanvas.getContext('2d');
  const W = 44, H = 24, S = 12;          // largura, altura, escala
  catCanvas.width = W * S;
  catCanvas.height = H * S;
  ctx.imageSmoothingEnabled = false;

  // paleta lida das variáveis CSS (acompanha o tema)
  let C = {};
  function readPalette() {
    const cs = getComputedStyle(root);
    const v = n => cs.getPropertyValue(n).trim();
    C = {
      body:   v('--cat-body'),
      belly:  v('--cat-belly'),
      dark:   v('--cat-dark'),
      eye:    v('--cat-eye'),
      nose:   v('--cat-nose'),
      yarn:   v('--cat-yarn'),
      yarnDk: v('--cat-yarn-dk'),
      shadow: v('--cat-shadow'),
      spark:  v('--accent-2'),
      shine:  'rgba(255,255,255,0.7)',
    };
  }
  readPalette();
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    setTimeout(readPalette, 60);
  });

  const px = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x) * S, Math.round(y) * S, w * S, h * S);
  };
  // "apaga" um pixel — usado para arredondar os cantos da silhueta
  const cut = (x, y) => ctx.clearRect(Math.round(x) * S, Math.round(y) * S, S, S);

  // ── o gato (coordenadas locais 24x21; espelho horizontal: mx = 21 - x) ──
  const CAT_X = 10;

  function drawTail(ox, oy, up) {
    const d = up ? 0 : 2;
    px(ox + 20, oy + 15 + d, 3, 2, C.dark);   // saindo do corpo
    px(ox + 22, oy + 11 + d, 2, 5, C.dark);   // subindo
  }

  function drawCat(ox, oy, opts) {
    const { blink, lookX, earTwitch, breathe } = opts;
    // as patas ficam plantadas no chão; só a cabeça sobe ao respirar
    const hy = oy - breathe;

    drawTail(ox, oy, opts.tailUp);

    // corpo, mais largo que a cabeça
    px(ox + 2, oy + 11, 18, 10, C.body);

    // barriga clarinha
    px(ox + 7, oy + 13, 8, 6, C.belly);
    cut(ox + 7, oy + 13); cut(ox + 14, oy + 13);
    cut(ox + 7, oy + 18); cut(ox + 14, oy + 18);

    // cantos arredondados do corpo
    cut(ox + 2, oy + 11); cut(ox + 19, oy + 11);
    cut(ox + 2, oy + 20); cut(ox + 19, oy + 20);

    // patinhas
    px(ox + 7, oy + 18, 1, 3, C.dark);
    px(ox + 14, oy + 18, 1, 3, C.dark);

    // orelhas (a esquerda treme de vez em quando)
    const t = earTwitch ? -1 : 0;
    px(ox + 5, hy + 0 + t, 2, 1, C.body);
    px(ox + 4, hy + 1 + t, 4, 3, C.body);
    px(ox + 15, hy + 0, 2, 1, C.body);
    px(ox + 14, hy + 1, 4, 3, C.body);
    px(ox + 5, hy + 2 + t, 2, 2, C.dark);
    px(ox + 15, hy + 2, 2, 2, C.dark);

    // cabeça
    px(ox + 4, hy + 3, 14, 9, C.body);

    // olhos
    const ex1 = ox + 7 + lookX, ex2 = ox + 13 + lookX, ey = hy + 6;
    if (blink) {
      px(ex1, ey + 1, 2, 1, C.eye);
      px(ex2, ey + 1, 2, 1, C.eye);
    } else {
      px(ex1, ey, 2, 3, C.eye);
      px(ex2, ey, 2, 3, C.eye);
      px(ex1, ey, 1, 1, C.shine);
      px(ex2, ey, 1, 1, C.shine);
    }

    // focinho e boca
    px(ox + 10, hy + 9, 2, 1, C.nose);
    px(ox + 9, hy + 10, 1, 1, C.dark);
    px(ox + 12, hy + 10, 1, 1, C.dark);
  }

  // ── novelo de lã (6x6) ──
  // o fio desenha um "\", depois "/", depois "—", depois "|": parece rolar
  const YARN_THREAD = [
    [[1, 1], [2, 2], [3, 3]],
    [[3, 1], [2, 2], [1, 3]],
    [[1, 2], [2, 2], [3, 2]],
    [[2, 1], [2, 2], [2, 3]],
  ];
  function drawYarn(ox, oy, frame) {
    px(ox + 1, oy, 4, 1, C.yarn);
    px(ox, oy + 1, 6, 4, C.yarn);
    px(ox + 1, oy + 5, 4, 1, C.yarn);
    // sombra embaixo e à direita: dá volume de bolinha
    px(ox + 1, oy + 5, 4, 1, C.yarnDk);
    px(ox + 5, oy + 2, 1, 3, C.yarnDk);
    YARN_THREAD[frame % 4].forEach(([x, y]) => px(ox + x, oy + y, 1, 1, C.yarnDk));
  }

  // ── brilhos em "\" ──
  const SPARKS = [[3, 4], [38, 5], [37, 16], [2, 15]];
  function drawSpark(x, y, alpha) {
    ctx.globalAlpha = alpha;
    for (let i = 0; i < 3; i++) px(x + i, y + i, 1, 1, C.spark);
    ctx.globalAlpha = 1;
  }

  const FLOOR = 21;

  function frame(t) {
    ctx.clearRect(0, 0, catCanvas.width, catCanvas.height);

    // novelo indo e voltando pelo chão, na frente do gato
    const cycle = (t % 6000) / 6000;
    const ease = 0.5 - 0.5 * Math.cos(cycle * Math.PI * 2);
    const ballX = 2 + ease * 34;
    const hop = Math.abs(Math.sin(t / 260)) * 2.4;
    const ballY = Math.round(FLOOR - 5 - hop);   // arredonda uma vez só
    const yarnFrame = Math.floor(t / 130);

    // o gato respira e acompanha o novelo com os olhos
    const breathe = Math.sin(t / 1100) > 0.5 ? 1 : 0;
    const lookX = Math.max(-1, Math.min(1, Math.round((ballX + 3 - (CAT_X + 11)) / 9)));

    // piscadas: uma dupla de vez em quando
    const bt = t % 3400;
    const blink = (bt > 2900 && bt < 3040) || (bt > 3120 && bt < 3240);
    const earTwitch = (t % 7000) > 6820;
    const tailUp = Math.floor(t / 620) % 2 === 0;

    // sombras no chão
    ctx.globalAlpha = 0.55;
    px(CAT_X + 3, FLOOR + 1, 16, 1, C.shadow);
    px(ballX, FLOOR + 1, 6, 1, C.shadow);
    ctx.globalAlpha = 1;

    SPARKS.forEach(([x, y], i) => {
      const a = 0.25 + 0.45 * Math.abs(Math.sin(t / 900 + i * 1.7));
      drawSpark(x, y, a);
    });

    drawCat(CAT_X, 1, { blink, lookX, earTwitch, tailUp, breathe });
    drawYarn(ballX, ballY, yarnFrame);   // o novelo rola na frente
  }

  let catRunning = true;
  let catVisible = true;
  function loop(now) {
    if (catRunning && catVisible) frame(now);
    requestAnimationFrame(loop);
  }

  frame(1000);   // primeiro quadro imediato: nada de canvas vazio piscando

  if (!reduceMotion) {
    requestAnimationFrame(loop);
    // economiza bateria quando o hero sai da tela
    new IntersectionObserver(([e]) => { catVisible = e.isIntersecting; }, { threshold: 0 })
      .observe(catCanvas);
    document.addEventListener('visibilitychange', () => {
      catRunning = document.visibilityState === 'visible';
    });
  }
}

// ── ROTATOR DE CARGOS ──
const rotator = document.getElementById('rotator');
let roles = [];
let roleIdx = 0;

function swapRole() {
  if (!rotator || !roles.length) return;
  const current = rotator.querySelector('.rotator-word.is-active');
  const next = document.createElement('span');
  next.className = 'rotator-word';
  next.textContent = roles[roleIdx];
  rotator.appendChild(next);

  // força reflow para a transição de entrada acontecer
  void next.offsetWidth;
  next.classList.add('is-active');

  if (current) {
    current.classList.remove('is-active');
    current.classList.add('is-out');
    setTimeout(() => current.remove(), 700);
  }
  roleIdx = (roleIdx + 1) % roles.length;
}

if (rotator && !reduceMotion) setInterval(swapRole, 2800);

// ── REVELAÇÃO PALAVRA-A-PALAVRA NO SCROLL ──
let wordBlocks = [];

function splitWords() {
  wordBlocks = [...document.querySelectorAll('[data-scroll-words]')].map(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    const spans = words.map((w, i) => {
      const s = document.createElement('span');
      s.className = 'word';
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      return s;
    });
    return { el, spans };
  });
}

function paintWords() {
  const vh = window.innerHeight;
  wordBlocks.forEach(({ el, spans }) => {
    const r = el.getBoundingClientRect();
    // progresso: começa quando o bloco entra a 85% da tela, termina a 35%
    const progress = (vh * 0.85 - r.top) / (vh * 0.5 + r.height * 0.5);
    const lit = Math.round(Math.max(0, Math.min(1, progress)) * spans.length);
    spans.forEach((s, i) => s.classList.toggle('lit', i < lit));
  });
}

// ── SCROLL REVEAL ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── FILTROS DE PROJETOS ──
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    cards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('dimmed', !show);
    });
  });
});

// ── BRILHO QUE SEGUE O MOUSE NOS CARDS ──
if (!reduceMotion) {
  cards.forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

// ── LINK ATIVO NA NAVBAR ──
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-item');

function markActiveSection() {
  let current = 'hero';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 160) current = sec.id;
  });
  navItems.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
}

// ── LOOP DE SCROLL (uma única passagem por frame) ──
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    markActiveSection();
    if (!reduceMotion) paintWords();
    ticking = false;
  });
}, { passive: true });

window.addEventListener('resize', paintWords, { passive: true });

markActiveSection();

// ══════════════════════════════════
// IDIOMAS — pt / en / es
// ══════════════════════════════════
const I18N = {
  pt: {
    'nav.home': 'Início', 'nav.about': 'Sobre', 'nav.projects': 'Projetos', 'nav.contact': 'Contato',

    'hero.tag': 'Disponível',
    'hero.iam': ', eu sou',
    'hero.bio': 'Construo software sob medida que resolve problema real — do desktop à nuvem. Python, Full-Stack Web e automação, com carinho pelos detalhes e pelo código que a pessoa do outro lado vai usar todo dia.',
    'hero.location': 'Brasil',
    'hero.status': 'Disponível agora',
    'hero.btnProjects': 'Ver projetos',
    'hero.btnContact': 'Falar comigo',
    'hero.follow': 'Me segue:',
    'hero.roles': ['Desenvolvedor Python', 'Full-Stack Web', 'Automação & Linux', 'Apps Desktop'],

    'about.label': 'Sobre mim',
    'about.title': 'Código com propósito,<br><em>soluções com impacto.</em>',
    'about.lead': 'Sou Gabriel Dias, nascido em Divinópolis, MG. Minha jornada começou com automação e administração de sistemas Linux, e evoluiu para aplicações desktop robustas e sistemas web completos.',
    'about.p2': 'Tenho experiência com <strong>arquitetura MVC</strong>, integração com <strong>banco de dados em nuvem (Supabase)</strong>, geração de relatórios em PDF, APIs RESTful e interfaces modernas com Python/Flet. Também desenvolvo landing pages e sistemas web com HTML, CSS, JavaScript e PHP.',
    'about.p3': 'Formado no <strong>Senac Minas</strong> em <strong>Técnico em Informática</strong>, buscando sempre entregar valor real através de software bem construído.',
    'about.fact1': 'anos escrevendo código',
    'about.fact3': 'idiomas',

    'toolkit.title': 'Caixa de ferramentas',
    'toolkit.g1': 'Linguagens', 'toolkit.g2': 'Interfaces',
    'toolkit.g3': 'Dados & back-end', 'toolkit.g4': 'Ambiente',
    'toolkit.responsive': 'Design responsivo',

    'projects.label': 'Projetos',
    'projects.title': 'O que eu <em>construí</em>',
    'projects.sub': 'Soluções reais para problemas reais — cada projeto tem uma história e um objetivo claro.',
    'filter.all': 'Todos', 'filter.tool': 'Ferramentas',
    'project.visit': 'Visitar',

    'proj.rodao': 'Sistema de gestão de fretes com precificação dinâmica por peso e estado de destino, cadastro de clientes e integração com API ViaCEP. Arquitetura frontend modular com persistência local.',
    'proj.unbox': 'Software comercial de controle de estoque e inventário com arquitetura MVC, gestão de empréstimos com comprovantes em PDF, níveis de acesso diferenciados (Admin/User) e persistência estruturada.',
    'proj.hermes': 'Sistema de gestão empresarial completo (ERP) com módulos de Estoque, Vendas, Financeiro e Nota Fiscal. SPA modular com regras de negócio robustas, controle de caixa e exportação de relatórios.',
    'proj.spoton': 'Preditor de resultados de partidas utilizando modelagem estatística com distribuição de Poisson e correção Dixon-Coles. Backend FastAPI com análise de dados esportivos em tempo real.',
    'proj.pulse': 'Plataforma de gestão de estúdio musical com controle de bandas, equipamentos, agendamentos e faturamento. Interface premium inspirada em Bento Pro, Glassmorphism e Dynamic Island.',
    'proj.carona': 'Aplicativo PWA offline-first para controle mensal de caronas e divisão de custos de gasolina. Interface mobile-friendly com persistência local e funcionamento offline completo.',
    'proj.wallpaper': 'Solução para executar wallpapers animados do Steam Workshop nativamente no GNOME Shell com X11 — compatível com Zorin OS, Ubuntu e distros baseadas em GNOME.',
    'proj.festa': 'Landing page moderna e de alta conversão para empresa de locação de kits de festa no Brasil. Alternância Dark/Light/System implementada puramente com HTML e CSS moderno.',

    'contact.label': 'Contato',
    'contact.title': 'Tem um projeto?<br><em>Vamos tomar um café.</em>',
    'contact.sub': 'Aberto a freelas, parcerias e oportunidades de trabalho. Me manda uma mensagem e a gente constrói algo bom juntos.',

    'footer.made': 'Feito com ☕ e carinho por',
    'footer.source': 'Código fonte',

    'aria.theme': 'Alternar tema claro e escuro',
    'aria.nav': 'Navegação principal',
    'aria.hero': 'Apresentação',
    'aria.menu': 'Abrir menu',
    'aria.lang': 'Escolher idioma',
    'aria.live': 'Ver projeto ao vivo',
    'aria.gh': 'Ver código no GitHub',
    'aria.cat': 'Animação em pixel art de um gato que pisca e brinca com um novelo de lã',
  },

  en: {
    'nav.home': 'Home', 'nav.about': 'About', 'nav.projects': 'Projects', 'nav.contact': 'Contact',

    'hero.tag': 'Available',
    'hero.iam': ", I'm",
    'hero.bio': 'I build custom software that solves real problems — from desktop to cloud. Python, full-stack web and automation, with care for the details and for the code someone on the other side will use every day.',
    'hero.location': 'Brazil',
    'hero.status': 'Available now',
    'hero.btnProjects': 'See projects',
    'hero.btnContact': 'Get in touch',
    'hero.follow': 'Follow me:',
    'hero.roles': ['Python Developer', 'Full-Stack Web', 'Automation & Linux', 'Desktop Apps'],

    'about.label': 'About me',
    'about.title': 'Code with purpose,<br><em>solutions with impact.</em>',
    'about.lead': "I'm Gabriel Dias, born in Divinópolis, MG, Brazil. My path started with automation and Linux system administration, and grew into robust desktop applications and complete web systems.",
    'about.p2': 'I have experience with <strong>MVC architecture</strong>, <strong>cloud database integration (Supabase)</strong>, PDF report generation, RESTful APIs and modern interfaces with Python/Flet. I also build landing pages and web systems with HTML, CSS, JavaScript and PHP.',
    'about.p3': 'Graduated from <strong>Senac Minas</strong> as an <strong>IT Technician</strong>, always aiming to deliver real value through well-built software.',
    'about.fact1': 'years writing code',
    'about.fact3': 'languages',

    'toolkit.title': 'Toolbox',
    'toolkit.g1': 'Languages', 'toolkit.g2': 'Interfaces',
    'toolkit.g3': 'Data & back-end', 'toolkit.g4': 'Environment',
    'toolkit.responsive': 'Responsive design',

    'projects.label': 'Projects',
    'projects.title': "What I've <em>built</em>",
    'projects.sub': 'Real solutions for real problems — every project has a story and a clear goal.',
    'filter.all': 'All', 'filter.tool': 'Tools',
    'project.visit': 'Visit',

    'proj.rodao': 'Freight management system with dynamic pricing by weight and destination state, customer registry and ViaCEP API integration. Modular frontend architecture with local persistence.',
    'proj.unbox': 'Commercial stock and inventory control software with MVC architecture, loan management with PDF receipts, role-based access levels (Admin/User) and structured persistence.',
    'proj.hermes': 'Complete business management system (ERP) with Inventory, Sales, Finance and Invoicing modules. Modular SPA with robust business rules, cash control and report export.',
    'proj.spoton': 'Match result predictor using statistical modeling with Poisson distribution and Dixon-Coles correction. FastAPI backend with real-time sports data analysis.',
    'proj.pulse': 'Music studio management platform with control of bands, equipment, bookings and billing. Premium interface inspired by Bento Pro, Glassmorphism and Dynamic Island.',
    'proj.carona': 'Offline-first PWA for monthly carpool tracking and fuel cost splitting. Mobile-friendly interface with local persistence and full offline operation.',
    'proj.wallpaper': 'A way to run animated Steam Workshop wallpapers natively on GNOME Shell with X11 — compatible with Zorin OS, Ubuntu and GNOME-based distros.',
    'proj.festa': 'Modern, high-conversion landing page for a party kit rental company in Brazil. Dark/Light/System switching implemented purely with HTML and modern CSS.',

    'contact.label': 'Contact',
    'contact.title': "Got a project?<br><em>Let's grab a coffee.</em>",
    'contact.sub': "Open to freelance work, partnerships and job opportunities. Send me a message and let's build something good together.",

    'footer.made': 'Made with ☕ and care by',
    'footer.source': 'Source code',

    'aria.theme': 'Toggle light and dark theme',
    'aria.nav': 'Main navigation',
    'aria.hero': 'Introduction',
    'aria.menu': 'Open menu',
    'aria.lang': 'Choose language',
    'aria.live': 'View live project',
    'aria.gh': 'View code on GitHub',
    'aria.cat': 'Pixel art animation of a cat blinking and playing with a ball of yarn',
  },

  es: {
    'nav.home': 'Inicio', 'nav.about': 'Sobre', 'nav.projects': 'Proyectos', 'nav.contact': 'Contacto',

    'hero.tag': 'Disponible',
    'hero.iam': ', soy',
    'hero.bio': 'Construyo software a medida que resuelve problemas reales — del escritorio a la nube. Python, Full-Stack Web y automatización, con cariño por los detalles y por el código que la persona del otro lado usará todos los días.',
    'hero.location': 'Brasil',
    'hero.status': 'Disponible ahora',
    'hero.btnProjects': 'Ver proyectos',
    'hero.btnContact': 'Hablar conmigo',
    'hero.follow': 'Sígueme:',
    'hero.roles': ['Desarrollador Python', 'Full-Stack Web', 'Automatización & Linux', 'Apps de Escritorio'],

    'about.label': 'Sobre mí',
    'about.title': 'Código con propósito,<br><em>soluciones con impacto.</em>',
    'about.lead': 'Soy Gabriel Dias, nacido en Divinópolis, MG, Brasil. Mi camino empezó con automatización y administración de sistemas Linux, y creció hacia aplicaciones de escritorio robustas y sistemas web completos.',
    'about.p2': 'Tengo experiencia con <strong>arquitectura MVC</strong>, integración con <strong>base de datos en la nube (Supabase)</strong>, generación de informes en PDF, APIs RESTful e interfaces modernas con Python/Flet. También desarrollo landing pages y sistemas web con HTML, CSS, JavaScript y PHP.',
    'about.p3': 'Graduado en <strong>Senac Minas</strong> como <strong>Técnico en Informática</strong>, buscando siempre entregar valor real a través de software bien construido.',
    'about.fact1': 'años escribiendo código',
    'about.fact3': 'idiomas',

    'toolkit.title': 'Caja de herramientas',
    'toolkit.g1': 'Lenguajes', 'toolkit.g2': 'Interfaces',
    'toolkit.g3': 'Datos & back-end', 'toolkit.g4': 'Entorno',
    'toolkit.responsive': 'Diseño responsivo',

    'projects.label': 'Proyectos',
    'projects.title': 'Lo que <em>construí</em>',
    'projects.sub': 'Soluciones reales para problemas reales — cada proyecto tiene una historia y un objetivo claro.',
    'filter.all': 'Todos', 'filter.tool': 'Herramientas',
    'project.visit': 'Visitar',

    'proj.rodao': 'Sistema de gestión de fletes con precios dinámicos por peso y estado de destino, registro de clientes e integración con la API ViaCEP. Arquitectura frontend modular con persistencia local.',
    'proj.unbox': 'Software comercial de control de stock e inventario con arquitectura MVC, gestión de préstamos con comprobantes en PDF, niveles de acceso diferenciados (Admin/User) y persistencia estructurada.',
    'proj.hermes': 'Sistema de gestión empresarial completo (ERP) con módulos de Stock, Ventas, Finanzas y Facturación. SPA modular con reglas de negocio robustas, control de caja y exportación de informes.',
    'proj.spoton': 'Predictor de resultados de partidos usando modelado estadístico con distribución de Poisson y corrección Dixon-Coles. Backend FastAPI con análisis de datos deportivos en tiempo real.',
    'proj.pulse': 'Plataforma de gestión de estudio musical con control de bandas, equipos, reservas y facturación. Interfaz premium inspirada en Bento Pro, Glassmorphism y Dynamic Island.',
    'proj.carona': 'Aplicación PWA offline-first para control mensual de viajes compartidos y división de costos de gasolina. Interfaz mobile-friendly con persistencia local y funcionamiento offline completo.',
    'proj.wallpaper': 'Solución para ejecutar wallpapers animados de Steam Workshop de forma nativa en GNOME Shell con X11 — compatible con Zorin OS, Ubuntu y distros basadas en GNOME.',
    'proj.festa': 'Landing page moderna y de alta conversión para una empresa de alquiler de kits de fiesta en Brasil. Alternancia Dark/Light/System implementada puramente con HTML y CSS moderno.',

    'contact.label': 'Contacto',
    'contact.title': '¿Tienes un proyecto?<br><em>Vamos por un café.</em>',
    'contact.sub': 'Abierto a freelances, alianzas y oportunidades de trabajo. Mándame un mensaje y construimos algo bueno juntos.',

    'footer.made': 'Hecho con ☕ y cariño por',
    'footer.source': 'Código fuente',

    'aria.theme': 'Alternar tema claro y oscuro',
    'aria.nav': 'Navegación principal',
    'aria.hero': 'Presentación',
    'aria.menu': 'Abrir menú',
    'aria.lang': 'Elegir idioma',
    'aria.live': 'Ver proyecto en vivo',
    'aria.gh': 'Ver código en GitHub',
    'aria.cat': 'Animación en pixel art de un gato que parpadea y juega con un ovillo de lana',
  },
};

const HTML_LANG = { pt: 'pt-BR', en: 'en', es: 'es' };

function applyLang(lang) {
  const dict = I18N[lang] || I18N.pt;
  root.lang = HTML_LANG[lang] || 'pt-BR';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = dict[el.dataset.i18n];
    if (v != null) el.innerHTML = v;
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const v = dict[el.dataset.i18nAria];
    if (v != null) el.setAttribute('aria-label', v);
  });

  document.querySelectorAll('.lang-btn').forEach(b => {
    const on = b.dataset.lang === lang;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', String(on));
  });

  // os cargos do rotator trocam junto
  roles = dict['hero.roles'];
  roleIdx = 0;
  if (rotator) {
    rotator.innerHTML = '';
    swapRole();
  }

  // o texto mudou: refaz letras e palavras
  runKinetic();
  splitWords();
  if (reduceMotion) {
    wordBlocks.forEach(({ spans }) => spans.forEach(s => s.classList.add('lit')));
  } else {
    paintWords();
  }
}

const savedLang = localStorage.getItem('gd-lang');
const browserLang = (navigator.language || 'pt').slice(0, 2);
applyLang(savedLang || (I18N[browserLang] ? browserLang : 'pt'));

document.getElementById('lang-switch')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.lang-btn');
  if (!btn) return;
  localStorage.setItem('gd-lang', btn.dataset.lang);
  applyLang(btn.dataset.lang);
});
