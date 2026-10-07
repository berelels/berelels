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

  // as letras sao inline-block, entao o navegador quebraria linha entre duas
  // quaisquer ("nós s / omos"). Agrupando por palavra, a quebra so cai no espaco.
  let i = 0, word = null;
  [...text].forEach(ch => {
    const span = document.createElement('span');
    span.className = ch === ' ' ? 'char space' : 'char';
    span.textContent = ch === ' ' ? '\u00a0' : ch;
    span.style.setProperty('--d', `${baseDelay + i * 0.032}s`);
    span.setAttribute('aria-hidden', 'true');
    i++;

    if (ch === ' ') {
      word = null;
      line.appendChild(span);
    } else {
      if (!word) {
        word = document.createElement('span');
        word.className = 'word';
        line.appendChild(word);
      }
      word.appendChild(span);
    }
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

const cards = document.querySelectorAll('.project-card');

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
    'nav.home': "Início", 'nav.about': "Sobre", 'nav.projects': "Projetos", 'nav.contact': "Contato",

    'hero.iam': ", nós somos",
    'hero.bio': "Estúdio independente de software. Construímos app, sistema de gestão e ferramenta sob medida — com carinho pelos detalhes e pela pessoa do outro lado, que vai usar aquilo todo dia.",
    'hero.location': "Brasil",
    'hero.status': "Aceitando projetos",
    'hero.btnProjects': "Ver o que fazemos",
    'hero.btnContact': "Falar com a gente",
    'hero.follow': "Segue a gente:",
    'hero.roles': ["Apps Android & desktop", "Sistemas de gestão", "Automação & Linux", "Software sob medida"],

    'about.label': "Sobre o estúdio",
    'about.title': "Estúdio pequeno,<br><em>software que aguenta o dia a dia.</em>",
    'about.lead': "A Catta Studios é um estúdio independente tocado por Gabriel Dias, em Divinópolis, MG. Começou em automação e administração de Linux e virou um lugar de construir app e sistema que gente de verdade usa no trabalho.",
    'about.p2': "Trabalhamos com <strong>arquitetura MVC</strong>, banco de dados local e <strong>em nuvem</strong>, relatórios em PDF, APIs RESTful e interfaces em Python/Flet, React e TypeScript. Também entregamos sistemas web completos com JavaScript, PHP e PostgreSQL.",
    'about.p3': "Por trás do estúdio tem um <strong>Técnico em Informática</strong> formado pelo <strong>Senac Minas</strong>, com a mania de só entregar o que ele mesmo usaria.",
    'about.fact1': "anos construindo software",
    'about.fact3': "idiomas",

    'toolkit.title': "Stack do estúdio",
    'toolkit.g1': "Linguagens", 'toolkit.g2': "Interfaces",
    'toolkit.g3': "Dados & back-end", 'toolkit.g4': "Ambiente",
    'toolkit.responsive': "Design responsivo",

    'projects.label': "Projetos",
    'projects.title': "O que a gente <em>constrói</em>",
    'projects.sub': "Quatro projetos que mostram o alcance do estúdio — do ERP que roda uma empresa ao script que resolve um problema de desktop no Linux.",
    'project.visit': "Visitar",

    'proj.hermes': "ERP completo com módulos de Estoque, Vendas, Financeiro e Nota Fiscal. SPA modular com regras de negócio robustas, controle de caixa, PostgreSQL e exportação de relatórios. É o maior sistema do estúdio.",
    'proj.boodice': "Companion de mesa para D&D 5e: ficha de personagem, rolagem de dados e glossário de regras, tudo offline. Monorepo em TypeScript que entrega a mesma base como app Android (Capacitor), desktop (Electron) e PWA, com SQLite local.",
    'proj.unbox': "Controle de estoque e inventário em arquitetura MVC, com gestão de empréstimos, comprovantes em PDF e níveis de acesso (Admin/User). Feito para inventário escolar.",
    'proj.wallpaper': "Wallpapers animados do Steam Workshop rodando nativamente no GNOME Shell com X11, sem depender do Windows. Compatível com Zorin OS, Ubuntu e derivadas — é o projeto do estúdio que mais chamou atenção de fora.",

    'contact.label': "Contato",
    'contact.title': "Tem um projeto?<br><em>Vamos conversar.</em>",
    'contact.sub': "Aberto a parcerias, projetos sob medida e colaborações. Manda uma mensagem e a gente constrói algo bom junto.",

    'footer.made': "Feito com carinho por",
    'footer.source': "Código fonte",

    'aria.theme': "Alternar tema claro e escuro",
    'aria.nav': "Navegação principal",
    'aria.hero': "Apresentação",
    'aria.menu': "Abrir menu",
    'aria.lang': "Escolher idioma",
    'aria.live': "Ver projeto ao vivo",
    'aria.gh': "Ver código no GitHub",
    'aria.cat': "Animação em pixel art de um gato que pisca e brinca com um novelo de lã",
  },

  en: {
    'nav.home': "Home", 'nav.about': "About", 'nav.projects': "Projects", 'nav.contact': "Contact",

    'hero.iam': ", we are",
    'hero.bio': "An independent software studio. We build apps, management systems and custom tools — with care for the details and for the person on the other side, who will use it every day.",
    'hero.location': "Brazil",
    'hero.status': "Taking on projects",
    'hero.btnProjects': "See our work",
    'hero.btnContact': "Talk to us",
    'hero.follow': "Follow us:",
    'hero.roles': ["Android & desktop apps", "Management systems", "Automation & Linux", "Custom software"],

    'about.label': "About the studio",
    'about.title': "A small studio,<br><em>software that holds up every day.</em>",
    'about.lead': "Catta Studios is an independent studio run by Gabriel Dias, in Divinópolis, MG, Brazil. It started in automation and Linux system administration and grew into a place for building apps and systems that real people use at work.",
    'about.p2': "We work with <strong>MVC architecture</strong>, local and <strong>cloud databases</strong>, PDF reports, RESTful APIs and interfaces in Python/Flet, React and TypeScript. We also deliver complete web systems with JavaScript, PHP and PostgreSQL.",
    'about.p3': "Behind the studio there is an <strong>IT Technician</strong> trained at <strong>Senac Minas</strong>, with a habit of only shipping what he would use himself.",
    'about.fact1': "years building software",
    'about.fact3': "languages",

    'toolkit.title': "Studio stack",
    'toolkit.g1': "Languages", 'toolkit.g2': "Interfaces",
    'toolkit.g3': "Data & back-end", 'toolkit.g4': "Environment",
    'toolkit.responsive': "Responsive design",

    'projects.label': "Projects",
    'projects.title': "What we <em>build</em>",
    'projects.sub': "Four projects that show the studio reach — from the ERP that runs a company to the script that fixes a Linux desktop problem.",
    'project.visit': "Visit",

    'proj.hermes': "A complete ERP with Inventory, Sales, Finance and Invoicing modules. Modular SPA with solid business rules, cash control, PostgreSQL and report exports. The biggest system the studio has built.",
    'proj.boodice': "A tabletop companion for D&D 5e: character sheet, dice rolling and a rules glossary, all offline. A TypeScript monorepo that ships the same codebase as an Android app (Capacitor), desktop (Electron) and PWA, with local SQLite.",
    'proj.unbox': "Stock and inventory control on an MVC architecture, with loan management, PDF receipts and access levels (Admin/User). Built for school inventory.",
    'proj.wallpaper': "Animated Steam Workshop wallpapers running natively on GNOME Shell with X11, no Windows needed. Compatible with Zorin OS, Ubuntu and derivatives — the studio project that drew the most outside attention.",

    'contact.label': "Contact",
    'contact.title': "Got a project?<br><em>Let us talk.</em>",
    'contact.sub': "Open to partnerships, custom projects and collaborations. Send a message and we build something good together.",

    'footer.made': "Made with care by",
    'footer.source': "Source code",

    'aria.theme': "Toggle light and dark theme",
    'aria.nav': "Main navigation",
    'aria.hero': "Introduction",
    'aria.menu': "Open menu",
    'aria.lang': "Choose language",
    'aria.live': "View live project",
    'aria.gh': "View code on GitHub",
    'aria.cat': "Pixel art animation of a cat that blinks and plays with a ball of yarn",
  },

  es: {
    'nav.home': "Inicio", 'nav.about': "Sobre", 'nav.projects': "Proyectos", 'nav.contact': "Contacto",

    'hero.iam': ", somos",
    'hero.bio': "Estudio independiente de software. Construimos apps, sistemas de gestión y herramientas a medida — con cariño por los detalles y por la persona del otro lado, que lo va a usar todos los días.",
    'hero.location': "Brasil",
    'hero.status': "Aceptando proyectos",
    'hero.btnProjects': "Ver lo que hacemos",
    'hero.btnContact': "Hablar con nosotros",
    'hero.follow': "Síguenos:",
    'hero.roles': ["Apps Android y escritorio", "Sistemas de gestión", "Automatización y Linux", "Software a medida"],

    'about.label': "Sobre el estudio",
    'about.title': "Estudio pequeño,<br><em>software que aguanta el día a día.</em>",
    'about.lead': "Catta Studios es un estudio independiente llevado por Gabriel Dias, en Divinópolis, MG, Brasil. Empezó en automatización y administración de Linux y se volvió un lugar para construir apps y sistemas que gente de verdad usa en el trabajo.",
    'about.p2': "Trabajamos con <strong>arquitectura MVC</strong>, bases de datos locales y <strong>en la nube</strong>, informes en PDF, APIs RESTful e interfaces en Python/Flet, React y TypeScript. También entregamos sistemas web completos con JavaScript, PHP y PostgreSQL.",
    'about.p3': "Detrás del estudio hay un <strong>Técnico en Informática</strong> formado en <strong>Senac Minas</strong>, con la manía de entregar solo lo que él mismo usaría.",
    'about.fact1': "años construyendo software",
    'about.fact3': "idiomas",

    'toolkit.title': "Stack del estudio",
    'toolkit.g1': "Lenguajes", 'toolkit.g2': "Interfaces",
    'toolkit.g3': "Datos y back-end", 'toolkit.g4': "Entorno",
    'toolkit.responsive': "Diseño responsivo",

    'projects.label': "Proyectos",
    'projects.title': "Lo que <em>construimos</em>",
    'projects.sub': "Cuatro proyectos que muestran el alcance del estudio — del ERP que mueve una empresa al script que resuelve un problema de escritorio en Linux.",
    'project.visit': "Visitar",

    'proj.hermes': "ERP completo con módulos de Inventario, Ventas, Finanzas y Facturación. SPA modular con reglas de negocio robustas, control de caja, PostgreSQL y exportación de informes. Es el sistema más grande del estudio.",
    'proj.boodice': "Companion de mesa para D&D 5e: hoja de personaje, tirada de dados y glosario de reglas, todo offline. Monorepo en TypeScript que entrega la misma base como app Android (Capacitor), escritorio (Electron) y PWA, con SQLite local.",
    'proj.unbox': "Control de stock e inventario en arquitectura MVC, con gestión de préstamos, comprobantes en PDF y niveles de acceso (Admin/User). Hecho para inventario escolar.",
    'proj.wallpaper': "Wallpapers animados de Steam Workshop corriendo de forma nativa en GNOME Shell con X11, sin depender de Windows. Compatible con Zorin OS, Ubuntu y derivadas — es el proyecto del estudio que más atención atrajo de afuera.",

    'contact.label': "Contacto",
    'contact.title': "¿Tienes un proyecto?<br><em>Hablemos.</em>",
    'contact.sub': "Abiertos a alianzas, proyectos a medida y colaboraciones. Mándanos un mensaje y construimos algo bueno juntos.",

    'footer.made': "Hecho con cariño por",
    'footer.source': "Código fuente",

    'aria.theme': "Alternar tema claro y oscuro",
    'aria.nav': "Navegación principal",
    'aria.hero': "Presentación",
    'aria.menu': "Abrir menú",
    'aria.lang': "Elegir idioma",
    'aria.live': "Ver proyecto en vivo",
    'aria.gh': "Ver código en GitHub",
    'aria.cat': "Animación en pixel art de un gato que parpadea y juega con un ovillo de lana",
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
