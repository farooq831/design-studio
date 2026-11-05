(function () {
  'use strict';

  var WHATSAPP = '923110722350';
  var projects = window.PROJECTS || [];
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var lenis = null;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Content that works with or without animation */

  function renderCards() {
    var wrap = $('[data-work-cards]');
    wrap.innerHTML = projects.map(function (p, i) {
      return '<button class="card" type="button" data-case="' + i + '" data-cursor="View" style="--ar:' + p.ratio + '">' +
        '<span class="card__media"><img src="' + p.image + '" alt="' + p.alt + '" loading="lazy"></span>' +
        '<span class="card__meta"><strong>' + p.title + '</strong><span>' + p.category + '</span></span>' +
        '</button>';
    }).join('');
  }

  function initDialog() {
    var dialog = $('.case');
    var body = $('[data-case-body]');
    var current = 0;

    function show(i) {
      current = (i + projects.length) % projects.length;
      var p = projects[current];
      body.innerHTML =
        '<figure class="case__cover"><img src="' + p.image + '" alt="' + p.alt + '"></figure>' +
        '<div class="case__text">' +
          '<p class="case__cat">' + p.category + '</p>' +
          '<h2>' + p.title + '</h2>' +
          '<p class="case__sum">' + p.summary + '</p>' +
          '<ul class="case__list">' + p.deliverables.map(function (d) { return '<li>' + d + '</li>'; }).join('') + '</ul>' +
          '<a class="case__link" href="' + p.link + '" target="_blank" rel="noopener">See it on the blog ↗</a>' +
          '<div class="case__nav"><button type="button" data-step="-1">← Previous</button><button type="button" data-step="1">Next →</button></div>' +
        '</div>';
      dialog.scrollTop = 0;
      if (window.gsap && !reduced) {
        gsap.from($$('.case__text > *', body), { y: 24, opacity: 0, duration: .6, stagger: .05, ease: 'power3.out' });
        gsap.from('.case__cover img', { scale: 1.12, duration: 1, ease: 'power3.out' });
      }
    }

    document.addEventListener('click', function (e) {
      var card = e.target.closest('[data-case]');
      if (!card) return;
      show(Number(card.dataset.case));
      dialog.showModal();
      if (lenis) lenis.stop();
    });

    dialog.addEventListener('click', function (e) {
      if (e.target === dialog || e.target.closest('.case__close')) dialog.close();
      var step = e.target.closest('[data-step]');
      if (step) show(current + Number(step.dataset.step));
    });

    dialog.addEventListener('close', function () {
      if (lenis) lenis.start();
    });
  }

  function initForm() {
    var form = $('.form');
    var status = $('[data-form-status]');

    function setError(name, msg) {
      var el = $('[data-err="' + name + '"]');
      el.textContent = msg;
      el.closest('.field').classList.toggle('is-bad', Boolean(msg));
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var company = form.elements.company.value.trim();
      var message = form.elements.message.value.trim();

      setError('name', name ? '' : 'Please add your name.');
      setError('message', message ? '' : 'Please add a line about your project.');
      if (!name) { form.elements.name.focus(); return; }
      if (!message) { form.elements.message.focus(); return; }

      var text = 'Hi Awais, I found you through your portfolio.\n\n' +
        'Name: ' + name + '\n' +
        (company ? 'Business: ' + company + '\n' : '') +
        'Looking for: ' + form.elements.type.value + '\n\n' +
        message;
      var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);

      window.open(url, '_blank', 'noopener');
      status.innerHTML = 'Your message is ready in WhatsApp. Press send to finish. <a href="' + url + '" target="_blank" rel="noopener">Open it again</a>';
    });

    $$('input, textarea', form).forEach(function (el) {
      el.addEventListener('input', function () {
        if (el.name === 'name' || el.name === 'message') setError(el.name, '');
      });
    });
  }

  function initClock() {
    var clocks = $$('[data-clock]');
    var fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' });
    function tick() {
      var t = fmt.format(new Date());
      clocks.forEach(function (c) { c.textContent = t; });
    }
    tick();
    setInterval(tick, 20000);
    $('[data-year]').textContent = new Date().getFullYear();
  }

  function initMenu() {
    var burger = $('.nav__burger');
    var menu = $('#menu');

    function toggle(open) {
      menu.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (lenis) { open ? lenis.stop() : lenis.start(); }
      if (open && window.gsap && !reduced) {
        gsap.from($$('a', menu), { y: 40, opacity: 0, duration: .6, stagger: .06, ease: 'power3.out' });
      }
    }

    burger.addEventListener('click', function () { toggle(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) toggle(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) toggle(false); });
  }

  function fitHeroName() {
    var name = $('.hero__name');
    var letters = $$('.ch', name);
    var measure = function () {
      name.style.fontSize = '100px';
      var w = letters.reduce(function (sum, l) { return sum + l.offsetWidth; }, 0);
      name.style.fontSize = (100 * (window.innerWidth * .975) / w) + 'px';
    };
    measure();
    window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () {
      measure();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }

  renderCards();
  initDialog();
  initForm();
  initClock();
  initMenu();
  fitHeroName();

  /* Without GSAP, or with reduced motion, the page stays complete and static */

  var preloader = $('.preloader');
  if (!window.gsap || !window.ScrollTrigger || reduced) {
    preloader.remove();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Smooth scrolling */

  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = $(a.getAttribute('href'));
      if (!target || !lenis) return;
      e.preventDefault();
      lenis.start();
      lenis.scrollTo(target, { duration: 1.5 });
    });
  });

  /* Text splitting */

  function splitWords(el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            var inner = document.createElement('span');
            w.className = 'w';
            inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
    return $$('.w > span', el);
  }

  /* Hero intro, played when the preloader lifts */

  var heroLetters = $$('.hero__name i');
  gsap.set(heroLetters, { yPercent: 115 });
  gsap.set('.hero__portrait', { clipPath: 'inset(100% 0 0 0)' });
  gsap.set('.hero__portrait img', { scale: 1.25 });
  gsap.set('.hero__meta, .nav', { opacity: 0 });

  function playIntro() {
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('.hero__portrait', { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut' }, 0)
      .to('.hero__portrait img', { scale: 1, duration: 2 }, .1)
      .to(heroLetters, { yPercent: 0, duration: 1.4, stagger: .07 }, .55)
      .to('.hero__meta, .nav', { opacity: 1, duration: 1 }, 1.1)
      .add(function () {
        $('.hero__name').style.overflow = 'visible';
        gsap.set('.hero__portrait', { clearProps: 'clipPath' });
        if (lenis) lenis.start();
      }, 1.3);
  }

  var count = { n: 0 };
  var countEl = $('.preloader__count');
  gsap.timeline({ onComplete: function () { preloader.remove(); ScrollTrigger.refresh(); } })
    .to(count, {
      n: 100,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: function () { countEl.textContent = Math.round(count.n); }
    })
    .to('.preloader__inner', { yPercent: -100, duration: .9, ease: 'expo.inOut' }, '+=.1')
    .to('.preloader__panel', { yPercent: -100, duration: .9, ease: 'expo.inOut' }, '<.1')
    .add(playIntro, '<.25');

  /* Hero scroll */

  gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  }).to('.hero__portrait img', { yPercent: -8, ease: 'none' }, 0);

  [-60, -120, -30, -150, -80].forEach(function (y, i) {
    gsap.to($$('.hero__name .ch')[i], {
      y: y,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
    });
  });

  /* Marquee that reacts to scroll speed */

  var row = $('.marquee__row');
  row.innerHTML = row.innerHTML.repeat(4);
  var loop = gsap.to(row, { xPercent: -25, duration: 22, ease: 'none', repeat: -1 });
  ScrollTrigger.create({
    onUpdate: function (self) {
      var v = self.getVelocity();
      var speed = gsap.utils.clamp(-5, 5, v / 260);
      if (Math.abs(speed) < 1) return;
      gsap.to(loop, { timeScale: speed, duration: .2, overwrite: true });
      gsap.to(loop, { timeScale: speed < 0 ? -1 : 1, duration: 1.2, delay: .2 });
    }
  });

  /* Reusable reveals */

  $$('[data-split]').forEach(function (el) {
    gsap.from(splitWords(el), {
      yPercent: 115,
      duration: 1.2,
      stagger: .06,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  $$('[data-fill]').forEach(function (el) {
    var words = splitWords(el);
    gsap.set(words, { opacity: .14 });
    gsap.to(words, {
      opacity: 1,
      stagger: .1,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 45%', scrub: true }
    });
  });

  $$('[data-fade]').forEach(function (el) {
    gsap.from(el, {
      y: 36,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });

  $$('[data-clip]').forEach(function (el) {
    gsap.from(el, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 1.5,
      ease: 'expo.inOut',
      scrollTrigger: { trigger: el, start: 'top 80%' }
    });
  });

  $$('[data-parallax]').forEach(function (el) {
    gsap.to(el, {
      yPercent: -14,
      ease: 'none',
      scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* Work: horizontal on desktop, stacked on phones */

  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    var track = $('.work__track');
    var distance = function () { return track.scrollWidth - window.innerWidth; };
    var slide = gsap.to(track, {
      x: function () { return -distance(); },
      ease: 'none',
      scrollTrigger: {
        trigger: '.work',
        start: 'top top',
        end: function () { return '+=' + distance(); },
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1
      }
    });

    $$('.card').forEach(function (card) {
      gsap.fromTo($('img', card), { xPercent: -2.5 }, {
        xPercent: 2.5,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          containerAnimation: slide,
          start: 'left right',
          end: 'right left',
          scrub: true
        }
      });
    });
  });

  mm.add('(max-width: 899px)', function () {
    $$('.card').forEach(function (card) {
      gsap.from(card, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 88%' }
      });
    });
  });

  /* Process line and statement image */

  gsap.to('.process__line i', {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: { trigger: '.process__steps', start: 'top 60%', end: 'bottom 60%', scrub: true }
  });

  gsap.timeline({
    scrollTrigger: { trigger: '.statement', start: 'top 85%', end: 'top top', scrub: true }
  })
    .fromTo('.statement__frame', { clipPath: 'inset(14% 16% 14% 16% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' }, 0)
    .fromTo('.statement__frame img', { scale: 1.2 }, { scale: 1, ease: 'none' }, 0);

  gsap.from('.statement blockquote', {
    y: 60,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.statement', start: 'top 20%' }
  });

  gsap.from('.footer__word', {
    yPercent: 40,
    ease: 'none',
    scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true }
  });

  /* Scroll chrome: progress bar, hiding nav, WhatsApp button */

  gsap.to('.progress', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: .3 }
  });

  var nav = $('.nav');
  var wa = $('.wa');
  ScrollTrigger.create({
    onUpdate: function (self) {
      var menuOpen = !$('#menu').hidden;
      nav.classList.toggle('is-hidden', !menuOpen && self.direction === 1 && self.scroll() > 200);
    }
  });
  var contact = $('#contact');
  var placeWa = function () {
    var inHero = window.scrollY < window.innerHeight * .7;
    var atContact = contact.getBoundingClientRect().top < window.innerHeight * .7;
    wa.classList.toggle('is-away', inHero || atContact);
  };
  placeWa();
  ScrollTrigger.create({ onUpdate: placeWa });

  /* Cursor and magnetic button */

  if (finePointer) {
    var cursor = $('.cursor');
    var label = $('.cursor__label');
    var cx = gsap.quickTo(cursor, 'x', { duration: .35, ease: 'power3' });
    var cy = gsap.quickTo(cursor, 'y', { duration: .35, ease: 'power3' });

    window.addEventListener('mousemove', function (e) {
      cursor.classList.add('is-on');
      cx(e.clientX);
      cy(e.clientY);
    });

    document.addEventListener('mouseover', function (e) {
      var tagged = e.target.closest('[data-cursor]');
      var link = e.target.closest('a, button, label, input, textarea');
      cursor.classList.toggle('is-label', Boolean(tagged));
      cursor.classList.toggle('is-link', Boolean(link) && !tagged);
      label.textContent = tagged ? tagged.dataset.cursor : '';
    });

    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - r.left - r.width / 2) * .25,
          y: (e.clientY - r.top - r.height / 2) * .35,
          duration: .4,
          ease: 'power3.out'
        });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1, .4)' });
      });
    });
  }
})();
