document.addEventListener('DOMContentLoaded', () => {
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealSyncHandlers = [];

  if (!reduceMotion) {
    document.body.classList.add('motion-enabled');
    window.setTimeout(() => {
      requestAnimationFrame(() => {
        document.body.classList.add('motion-in');
      });
    }, 110);
  }

  const setupScrollReveal = ({
    elements,
    motionClass,
    visibleClass,
    threshold = 0.24,
    rootMargin = '-8% 0px -8% 0px',
    topFactor = 0.92,
    bottomFactor = 0.08,
  }) => {
    const items = Array.from(elements).filter(Boolean);

    if (!items.length) {
      return;
    }

    items.forEach((item) => {
      item.classList.add(motionClass);
    });

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      items.forEach((item) => {
        item.classList.add(visibleClass);
      });
      return;
    }

    const syncVisibility = () => {
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const isInView = rect.top < viewportHeight * topFactor && rect.bottom > viewportHeight * bottomFactor;
        item.classList.toggle(visibleClass, isInView);
      });
    };

    syncVisibility();
    revealSyncHandlers.push(syncVisibility);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle(visibleClass, entry.isIntersecting);
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    items.forEach((item) => {
      observer.observe(item);
    });
  };

  const setupHeroMotion = () => {
    const heroVisual = document.querySelector('.hero__visual');
    const heroCenterpiece = document.querySelector('.hero__centerpiece');
    const heroCards = Array.from(document.querySelectorAll('.hero .dash-card'));

    if (!heroVisual || !heroCards.length) {
      return;
    }

    const syncHeroOffsets = () => {
      if (window.innerWidth < 1024) {
        heroCards.forEach((card) => {
          card.style.removeProperty('--hero-enter-x');
          card.style.removeProperty('--hero-enter-y');
          card.style.removeProperty('--hero-delay');
          card.style.removeProperty('--hero-float-duration');
          card.style.removeProperty('--hero-float-offset');
        });
        return;
      }

      const focalX = heroCenterpiece
        ? heroCenterpiece.offsetLeft + heroCenterpiece.offsetWidth / 2
        : heroVisual.clientWidth / 2;
      const focalY = heroCenterpiece
        ? heroCenterpiece.offsetTop + heroCenterpiece.offsetHeight / 2
        : heroVisual.clientHeight / 2;

      heroCards.forEach((card, index) => {
        const cardCenterX = card.offsetLeft + card.offsetWidth / 2;
        const cardCenterY = card.offsetTop + card.offsetHeight / 2;
        const offsetX = (focalX - cardCenterX) * 0.58;
        const offsetY = (focalY - cardCenterY) * 0.58;

        card.style.setProperty('--hero-enter-x', `${Math.round(offsetX)}px`);
        card.style.setProperty('--hero-enter-y', `${Math.round(offsetY)}px`);
        card.style.setProperty('--hero-delay', `${(0.16 + index * 0.045).toFixed(2)}s`);
        card.style.setProperty('--hero-float-duration', `${(6.3 + (index % 4) * 0.42).toFixed(2)}s`);
        card.style.setProperty('--hero-float-offset', `${(index * 0.11).toFixed(2)}s`);
      });
    };

    syncHeroOffsets();
    window.addEventListener('resize', syncHeroOffsets, { passive: true });
  };

  setupScrollReveal({
    elements: document.querySelectorAll('.showcase-panel'),
    motionClass: 'showcase-panel--motion',
    visibleClass: 'showcase-panel--visible',
    threshold: 0.24,
    rootMargin: '-8% 0px -8% 0px',
  });

  setupScrollReveal({
    elements: [document.querySelector('.why-section__header')],
    motionClass: 'why-section__header--motion',
    visibleClass: 'why-section__header--visible',
    threshold: 0.18,
    rootMargin: '-10% 0px -10% 0px',
  });

  setupScrollReveal({
    elements: document.querySelectorAll('.why-card'),
    motionClass: 'why-card--motion',
    visibleClass: 'why-card--visible',
    threshold: 0.2,
    rootMargin: '-8% 0px -8% 0px',
  });

  if (!reduceMotion) {
    setupHeroMotion();
  }

  if (revealSyncHandlers.length) {
    window.addEventListener(
      'resize',
      () => {
        revealSyncHandlers.forEach((syncVisibility) => {
          syncVisibility();
        });
      },
      { passive: true }
    );
  }
});
