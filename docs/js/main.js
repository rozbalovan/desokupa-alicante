document.addEventListener('DOMContentLoaded', () => {

  /* ========== Language Dropdown ========== */
  const langBtn = document.getElementById('langSelectBtn');
  const langMenu = document.getElementById('langMenu');
  const langCurrent = document.getElementById('langCurrent');
  const langSelect = langBtn.closest('.lang-select');

  // Toggle dropdown
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langSelect.classList.toggle('open');
  });

  // Close on outside click
  document.addEventListener('click', () => langSelect.classList.remove('open'));
  langMenu.addEventListener('click', (e) => e.stopPropagation());

  /* ========== Language Switch ========== */
  const langBtns = document.querySelectorAll('.lang-btn');
  const html = document.documentElement;

  const langLabels = { es:'🇪🇸 ES', en:'🇬🇧 EN', de:'🇩🇪 DE', fr:'🇫🇷 FR', nl:'🇳🇱 NL', sv:'🇸🇪 SV', pl:'🇵🇱 PL', ru:'🇷🇺 RU' };

  function applyLanguage(lang) {
    const dict = i18n[lang];
    if (!dict) return;

    html.setAttribute('lang', lang);
    html.dataset.lang = lang;
    langCurrent.textContent = langLabels[lang] || lang.toUpperCase();

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key]) el.innerHTML = dict[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (dict[key]) el.placeholder = dict[key];
    });

    langBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
    localStorage.setItem('desokupa-lang', lang);
    langSelect.classList.remove('open');
  }

  applyLanguage(localStorage.getItem('desokupa-lang') || 'es');
  langBtns.forEach(btn => btn.addEventListener('click', () => applyLanguage(btn.dataset.lang)));

  /* ========== Mobile Menu ========== */
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    nav.classList.toggle('open');
  });

  document.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      nav.classList.remove('open');
    });
  });

  /* ========== FAQ Accordion ========== */
  document.querySelectorAll('.faq__question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq__item');
      const active = item.classList.contains('active');
      document.querySelectorAll('.faq__item').forEach(i => i.classList.remove('active'));
      if (!active) item.classList.add('active');
    });
  });

  /* ========== Contact Form → Telegram Bot ========== */
  const form = document.getElementById('contactForm');
  const BOT_TOKEN = '8866291567:AAH5iVI15gtppDlk96jv04V34R36sloG_sY';
  const CHAT_ID = '190716870';

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const name = form.querySelector('[name="name"]')?.value.trim();
      const phone = form.querySelector('[name="phone"]')?.value.trim();
      if (!name || !phone) { alert('Por favor, completa los campos obligatorios.'); return; }

      const email = form.querySelector('[name="email"]')?.value.trim();
      const city = form.querySelector('[name="city"]')?.value.trim() || '';
      const msg = form.querySelector('[name="message"]')?.value.trim();
      const lang = html.dataset.lang || 'es';

      const text = `🔔 <b>Nueva solicitud!</b>\n\n👤 <b>Nombre:</b> ${name}\n📞 <b>Teléfono:</b> ${phone}\n🌍 <b>Idioma:</b> ${lang.toUpperCase()}\n🏙️ <b>Ciudad:</b> ${city || '—'}${email ? `\n📧 <b>Email:</b> ${email}` : ''}${msg ? `\n💬 <b>Mensaje:</b> ${msg}` : ''}\n\n⏰ ${new Date().toLocaleString('es-ES')}`;

      // Send to Telegram bot
      btn.disabled = true;
      btn.innerHTML = '⏳ Enviando...';

      try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: text,
            parse_mode: 'HTML'
          })
        });

        const data = await res.json();
        if (data.ok) {
          btn.innerHTML = '✅ ¡Enviado!';
          form.reset();
        } else {
          btn.innerHTML = '❌ Error, intenta de nuevo';
        }
      } catch(err) {
        btn.innerHTML = '❌ Error de conexión';
      }

      setTimeout(() => {
        btn.disabled = false;
        const dict = i18n[lang];
        btn.innerHTML = dict?.form_submit ? `<i class="fas fa-paper-plane"></i> ${dict.form_submit}` : 'Send';
      }, 4000);
    });
  }

  /* ========== Smooth Scroll ========== */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 76, behavior: 'smooth' });
      }
    });
  });

  /* ========== Header Scroll ========== */
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => header.classList.toggle('header--scrolled', window.pageYOffset > 50));

  /* ========== Scroll Reveal ========== */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }
});
