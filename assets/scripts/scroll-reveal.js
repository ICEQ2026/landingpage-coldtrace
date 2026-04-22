(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const steps = Array.from(document.querySelectorAll('.feature-step[data-reveal]'));
  const others = document.querySelectorAll('[data-reveal]:not(.feature-step)');
  const diagram = document.querySelector('.feature-diagram');

  if (!steps.length && !others.length) return;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    others.forEach((el) => el.classList.add('is-revealed'));
    steps.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  if (others.length) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-revealed');
          else if (entry.boundingClientRect.top > 0) entry.target.classList.remove('is-revealed');
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -80px 0px' }
    );
    others.forEach((el) => obs.observe(el));
  }

  if (!steps.length || !diagram) return;

  const isDesktop = () => window.matchMedia('(min-width: 1280px)').matches;
  const sentinels = [];
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const card = entry.target.__card || entry.target;
        if (entry.isIntersecting) card.classList.add('is-revealed');
        else if (entry.boundingClientRect.top > 0) card.classList.remove('is-revealed');
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -80px 0px' }
  );

  const teardown = () => {
    cardObserver.disconnect();
    sentinels.forEach((s) => s.remove());
    sentinels.length = 0;
  };

  const setup = () => {
    teardown();
    if (isDesktop()) {
      steps.forEach((step) => {
        const cs = getComputedStyle(step);
        const sentinel = document.createElement('span');
        sentinel.className = 'feature-step__sentinel';
        sentinel.style.cssText =
          'position:absolute;pointer-events:none;visibility:hidden;z-index:-1;' +
          `left:${cs.left};top:${cs.top};width:${cs.width};height:${step.offsetHeight}px;`;
        sentinel.__card = step;
        diagram.appendChild(sentinel);
        sentinels.push(sentinel);
        cardObserver.observe(sentinel);
      });
    } else {
      steps.forEach((step) => cardObserver.observe(step));
    }
  };

  setup();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setup, 150);
  });
})();
