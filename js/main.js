/* Portfolio — Yann Zougouri : interactions */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Thème clair / sombre ---------- */
  var themeBtn = document.getElementById('theme-btn');
  var metaTheme = document.querySelector('meta[name="theme-color"]');
  function applyTheme(t) {
    doc.setAttribute('data-theme', t);
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre');
    if (metaTheme) metaTheme.setAttribute('content', t === 'dark' ? '#0A0E22' : '#F3F5F8');
  }
  applyTheme(doc.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  themeBtn.addEventListener('click', function () {
    var next = doc.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- Photo : affiche le monogramme tant qu'il n'y a pas de photo ---------- */
  var photo = document.getElementById('photo');
  var portrait = document.getElementById('portrait');
  function noPhoto() { portrait.classList.add('no-photo'); }
  if (photo) {
    photo.addEventListener('error', noPhoto);
    if (photo.complete && photo.naturalWidth === 0) noPhoto();
  }

  /* ---------- Texte qui s'écrit tout seul ---------- */
  var typed = document.getElementById('typed');
  var words = ['application mobile', 'site web', 'interface soignée', 'API fiable'];
  if (typed && !reduceMotion) {
    var wi = 0, ci = words[0].length, deleting = true;
    setTimeout(function tick() {
      var w = words[wi];
      if (deleting) {
        ci--;
        if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; }
      } else {
        ci++;
        if (ci >= words[wi].length) { deleting = true; typed.textContent = words[wi]; return setTimeout(tick, 2200); }
      }
      typed.textContent = words[wi].slice(0, Math.max(ci, 0)) || ' ';
      setTimeout(tick, deleting ? 45 : 85);
    }, 2600);
  }

  /* ---------- Apparition au scroll ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Lien actif dans la navigation ---------- */
  var navLinks = document.querySelectorAll('.nav-links a, .bottom-nav a');
  var spyIds = ['accueil', 'a-propos', 'competences', 'projets', 'processus', 'parcours', 'contact'];
  var bottomMap = { competences: 'a-propos', processus: 'projets' };
  function setActive(id) {
    navLinks.forEach(function (a) {
      var target = a.getAttribute('href').slice(1);
      var inBottom = a.parentElement.classList.contains('bottom-nav');
      var match = inBottom ? (target === (bottomMap[id] || id)) : (target === id);
      a.classList.toggle('active', match);
      if (match) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  function spy() {
    var y = window.innerHeight * 0.35, current = 'accueil';
    spyIds.forEach(function (id) {
      var s = document.getElementById(id);
      if (s && s.getBoundingClientRect().top <= y) current = id;
    });
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 4) current = 'contact';
    setActive(current);
  }

  /* ---------- Fil du processus qui se tisse au scroll ---------- */
  var processEl = document.getElementById('process');
  var railFill = document.getElementById('rail-fill');
  var steps = processEl ? processEl.querySelectorAll('.step') : [];
  function weaveProgress() {
    if (!processEl) return;
    var r = processEl.getBoundingClientRect();
    var mark = window.innerHeight * 0.6;
    var p = Math.min(Math.max((mark - r.top) / r.height, 0), 1);
    railFill.style.height = (p * 100) + '%';
    steps.forEach(function (s) {
      var sr = s.getBoundingClientRect();
      s.classList.toggle('lit', sr.top + 30 < mark);
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { spy(); weaveProgress(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Filtres des projets ---------- */
  var filters = document.querySelectorAll('.filter');
  var projects = document.querySelectorAll('.project');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      projects.forEach(function (p) {
        var cats = (p.getAttribute('data-cat') || '').split(' ');
        var show = f === 'all' || cats.indexOf(f) !== -1;
        p.classList.toggle('hidden', !show);
        if (show) p.classList.add('is-visible');
      });
    });
  });

  /* ---------- Fiches des projets ---------- */
  var fiche = document.getElementById('fiche');
  var ficheBody = document.getElementById('fiche-body');

  function openDialog(d) {
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  }
  function closeDialog(d) {
    if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null;
    if (!t) return;
    var ficheBtn = t.closest('[data-fiche]');
    if (ficheBtn) {
      var tpl = document.getElementById('tpl-' + ficheBtn.getAttribute('data-fiche'));
      ficheBody.innerHTML = '';
      ficheBody.appendChild(tpl.content.cloneNode(true));
      openDialog(fiche);
      ficheBody.scrollTop = 0;
      return;
    }
    var closer = t.closest('[data-close]');
    if (closer) { closeDialog(closer.closest('dialog')); return; }
  });
  fiche.addEventListener('click', function (e) { if (e.target === fiche) closeDialog(fiche); });

  /* ---------- Formulaire de contact : WhatsApp ou e-mail ---------- */
  var form = document.getElementById('msg-form');
  var note = document.getElementById('form-note');
  if (form) {
    var via = 'wa';
    form.querySelectorAll('[data-via]').forEach(function (b) {
      b.addEventListener('click', function () { via = b.getAttribute('data-via'); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nom = form.nom.value.trim();
      var msg = form.message.value.trim();
      var sujet = form.sujet.value;
      if (!nom || !msg) {
        note.textContent = 'Indique ton nom et ton message avant d’envoyer.';
        (nom ? form.message : form.nom).focus();
        return;
      }
      var text = 'Bonjour Yann, je suis ' + nom + '.\nBesoin : ' + sujet + '\n\n' + msg;
      if (via === 'mail') {
        window.location.href = 'mailto:yannzougouri225@gmail.com?subject=' + encodeURIComponent('Projet : ' + sujet + ' — ' + nom) + '&body=' + encodeURIComponent(text);
      } else {
        window.open('https://wa.me/2250788899729?text=' + encodeURIComponent(text), '_blank', 'noopener');
      }
      note.textContent = 'Ton message est prêt : il ne reste qu’à l’envoyer.';
    });
  }

  /* ---------- Année du pied de page ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
