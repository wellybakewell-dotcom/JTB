/* =============================================================
   JTB Engine Landing — Interactions
   - Scroll-triggered reveals (IntersectionObserver)
   - Stat count-up on view
   - Active chapter rail tracking
   - Smooth-scroll buttons → #contact
   - Showreel custom play button
   - Form submission (placeholder handler)
   - Year stamp
   ============================================================= */

(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------------
     Year stamp
     ------------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------------------------------------------------
     Smooth-scroll for in-page anchors (with offset for topbar)
     ------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || href === '#top') {
        if (href === '#top') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
        }
        return;
      }
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - 16;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });

      // If scrolling to contact, focus first field after motion completes
      if (href === '#contact') {
        const firstField = document.getElementById('name');
        if (firstField) {
          setTimeout(() => firstField.focus({ preventScroll: true }), reduced ? 0 : 700);
        }
      }
    });
  });

  /* -------------------------------------------------------------
     Reveal on scroll (IntersectionObserver)
     ------------------------------------------------------------- */
  if ('IntersectionObserver' in window && !reduced) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: show everything
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'));
  }

  /* -------------------------------------------------------------
     Stat count-up animation
     ------------------------------------------------------------- */
  const statNumbers = document.querySelectorAll('.stat__number[data-count]');
  if (statNumbers.length && 'IntersectionObserver' in window) {
    const animateNumber = (el) => {
      // If still placeholder ([XX]), don't animate — leave as-is so it's visibly TODO
      const target = parseInt(el.dataset.count, 10);
      const placeholder = el.textContent.trim();
      if (Number.isNaN(target) || target <= 0 || placeholder.includes('[')) {
        return; // keep visible placeholder
      }

      const duration = 1400;
      const start = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const value = Math.round(target * ease(t));
        el.textContent = value.toLocaleString();
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateNumber(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    statNumbers.forEach((el) => statObserver.observe(el));
  }

  /* -------------------------------------------------------------
     Chapter rail — active section tracking
     ------------------------------------------------------------- */
  const railLinks = document.querySelectorAll('.chapter-rail a');
  if (railLinks.length && 'IntersectionObserver' in window) {
    const sectionMap = new Map();
    railLinks.forEach((link) => {
      const id = link.getAttribute('href').slice(1);
      const section = document.getElementById(id);
      if (section) sectionMap.set(section, link);
    });

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = sectionMap.get(entry.target);
          if (!link) return;
          if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
            railLinks.forEach((l) => l.classList.remove('is-active'));
            link.classList.add('is-active');
          }
        });
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: '-20% 0px -40% 0px' }
    );
    sectionMap.forEach((_, section) => sectionObserver.observe(section));
  }

  /* -------------------------------------------------------------
     Showreel — autoplay muted + click-to-unmute
     ------------------------------------------------------------- */
  const showreelVideo = document.querySelector('.showreel__video');
  const showreelUnmute = document.querySelector('.showreel__unmute');
  const showreelPlay = document.querySelector('.showreel__play');

  if (showreelVideo) {
    // Try kicking off autoplay (some browsers need an explicit nudge)
    const tryPlay = () => {
      const p = showreelVideo.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // Autoplay blocked — fall back to a manual play button
          if (showreelPlay) {
            showreelPlay.hidden = false;
            if (showreelUnmute) showreelUnmute.classList.add('is-hidden');
          }
        });
      }
    };
    if (showreelVideo.readyState >= 2) tryPlay();
    else showreelVideo.addEventListener('loadeddata', tryPlay, { once: true });

    // Manual play fallback
    if (showreelPlay) {
      showreelPlay.addEventListener('click', () => {
        showreelVideo.muted = false;
        showreelVideo.play().finally(() => {
          showreelPlay.hidden = true;
          showreelVideo.setAttribute('controls', 'controls');
          if (showreelUnmute) showreelUnmute.classList.add('is-hidden');
        });
      });
    }
  }

  if (showreelUnmute && showreelVideo) {
    showreelUnmute.addEventListener('click', () => {
      showreelVideo.muted = !showreelVideo.muted;
      if (!showreelVideo.muted) {
        showreelUnmute.classList.add('is-hidden');
        // Reveal native controls so users can re-mute or scrub
        showreelVideo.setAttribute('controls', 'controls');
        // Resume play in case it was stalled
        showreelVideo.play().catch(() => {});
      }
    });
  }

  /* -------------------------------------------------------------
     Contact form — placeholder submission
     Replace handleSubmit() with your real endpoint when wired.
     ------------------------------------------------------------- */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic validation
      const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
      let firstInvalid = null;
      fields.forEach((field) => {
        const wrapper = field.closest('.field');
        if (!field.value.trim() || (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value))) {
          if (wrapper) wrapper.classList.add('has-error');
          if (!firstInvalid) firstInvalid = field;
        } else if (wrapper) {
          wrapper.classList.remove('has-error');
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      // Collect payload
      const payload = Object.fromEntries(new FormData(form).entries());

      // TODO: wire to real endpoint
      // Example with fetch:
      //   await fetch('/api/contact', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
      // eslint-disable-next-line no-console
      console.log('[JTB] Form submission (placeholder):', payload);

      // Optimistic success state
      const success = form.querySelector('.form__success');
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.querySelector('span').textContent = 'Sent — thanks';
      }
      if (success) success.hidden = false;
    });

    // Clear error state on input
    form.querySelectorAll('input, select, textarea').forEach((field) => {
      field.addEventListener('input', () => {
        const wrapper = field.closest('.field');
        if (wrapper) wrapper.classList.remove('has-error');
      });
    });
  }
})();
