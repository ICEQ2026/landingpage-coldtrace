document.addEventListener('DOMContentLoaded', () => {
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealSyncHandlers = [];

  if (!reduceMotion) {
    document.body.classList.add('motion-enabled');
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.body.classList.add('motion-in');
      });
    });
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

  const setupPlanCatalog = () => {
    const catalog = document.querySelector('[data-plan-catalog]');

    if (!catalog) {
      return;
    }

    const endpointUrl = catalog.getAttribute('data-plan-catalog-url');
    const signUpUrl = catalog.getAttribute('data-signup-url') || '/identity-access/sign-up';
    const loadingState = catalog.querySelector('[data-pricing-loading]');
    const plansGrid = catalog.querySelector('[data-pricing-plans]');
    const emptyState = catalog.querySelector('[data-pricing-empty]');
    const errorState = catalog.querySelector('[data-pricing-error]');
    const retryButton = catalog.querySelector('[data-pricing-retry]');
    let loadedPlans = [];
    let currentState = 'loading';

    const labels = {
      'en-US': {
        free: 'Free',
        perMonth: '/ month',
        choose: 'Choose plan',
        recommended: 'Recommended',
        limitsTitle: 'Limits',
        featuresTitle: 'Included features',
        capabilitiesTitle: 'Capabilities',
        included: 'Included',
        notIncluded: 'Not included',
        unlimited: 'Unlimited',
        limits: {
          maxLocations: ['site', 'sites'],
          maxAssets: ['asset', 'assets'],
          maxIotDevices: ['IoT device', 'IoT devices'],
          maxUsers: ['user', 'users'],
          historyRetentionDays: ['day history', 'days history'],
        },
        capabilities: {
          allowsExports: 'CSV exports',
          allowsMaintenance: 'Maintenance scheduling',
          allowsAiGuidance: 'AI incident guidance',
          allowsAiReportSummary: 'AI report summaries',
        },
      },
      'es-419': {
        free: 'Gratis',
        perMonth: '/ mes',
        choose: 'Elegir plan',
        recommended: 'Recomendado',
        limitsTitle: 'Límites',
        featuresTitle: 'Funciones incluidas',
        capabilitiesTitle: 'Capacidades',
        included: 'Incluido',
        notIncluded: 'No incluido',
        unlimited: 'Sin limite',
        limits: {
          maxLocations: ['sede', 'sedes'],
          maxAssets: ['activo', 'activos'],
          maxIotDevices: ['dispositivo IoT', 'dispositivos IoT'],
          maxUsers: ['usuario', 'usuarios'],
          historyRetentionDays: ['día de historial', 'días de historial'],
        },
        capabilities: {
          allowsExports: 'Exportaciones CSV',
          allowsMaintenance: 'Mantenimiento programado',
          allowsAiGuidance: 'Guía IA para incidencias',
          allowsAiReportSummary: 'Resúmenes IA de reportes',
        },
      },
    };

    const currentLocale = () => {
      const locale = document.documentElement.lang;
      return locale === 'es-419' ? 'es-419' : 'en-US';
    };

    const currentLabels = () => labels[currentLocale()];

    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }[character]));

    const setState = (state) => {
      currentState = state;
      if (loadingState) loadingState.hidden = state !== 'loading';
      if (plansGrid) plansGrid.hidden = state !== 'ready';
      if (emptyState) emptyState.hidden = state !== 'empty';
      if (errorState) errorState.hidden = state !== 'error';
    };

    const formatPrice = (plan) => {
      const text = currentLabels();

      if (!plan.monthlyPriceCents) {
        return text.free;
      }

      return `${new Intl.NumberFormat(currentLocale(), {
        currency: plan.currency || 'USD',
        style: 'currency',
      }).format(plan.monthlyPriceCents / 100)} ${text.perMonth}`;
    };

    const planUrl = (planCode) => {
      try {
        const url = new URL(signUpUrl, window.location.href);
        url.searchParams.set('plan', planCode);
        return url.toString();
      } catch {
        return `${signUpUrl}?plan=${encodeURIComponent(planCode)}`;
      }
    };

    const limitLabel = (value, singular, plural) => {
      const text = currentLabels();

      if (value === null || value === undefined) {
        return `${text.unlimited} ${plural}`;
      }

      return `${value} ${value === 1 ? singular : plural}`;
    };

    const planLimits = (plan) => {
      const text = currentLabels();
      const usageLimits = plan.usageLimits || {};

      return Object.entries(text.limits).map(([key, [singular, plural]]) =>
        limitLabel(usageLimits[key], singular, plural)
      );
    };

    const planCapabilities = (plan) => {
      const text = currentLabels();
      const featureFlags = plan.featureFlags || {};

      return Object.entries(text.capabilities).map(([key, label]) => ({
        enabled: Boolean(featureFlags[key]),
        label,
      }));
    };

    const renderPlan = (plan) => {
      const text = currentLabels();
      const recommendedLabel = plan.recommendedLabel || text.recommended;
      const includedFeatures = Array.isArray(plan.includedFeatures) ? plan.includedFeatures : [];
      const featuredClass = plan.recommended ? ' pricing-plan--featured' : '';
      const primaryCtaClass = plan.recommended ? ' pricing-plan__cta--primary' : '';

      return `
        <article class="pricing-plan${featuredClass}">
          ${plan.recommended ? `<span class="pricing-plan__badge">${escapeHtml(recommendedLabel)}</span>` : ''}
          <div class="pricing-plan__header">
            <h3>${escapeHtml(plan.displayName)}</h3>
            <p>${escapeHtml(plan.description)}</p>
          </div>
          <strong class="pricing-plan__price">${escapeHtml(formatPrice(plan))}</strong>

          <div class="pricing-plan__group">
            <span>${escapeHtml(text.featuresTitle)}</span>
            <ul class="pricing-plan__list">
              ${includedFeatures.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}
            </ul>
          </div>

          <div class="pricing-plan__group">
            <span>${escapeHtml(text.limitsTitle)}</span>
            <ul class="pricing-plan__list pricing-plan__list--muted">
              ${planLimits(plan).map((limit) => `<li>${escapeHtml(limit)}</li>`).join('')}
            </ul>
          </div>

          <div class="pricing-plan__group">
            <span>${escapeHtml(text.capabilitiesTitle)}</span>
            <ul class="pricing-plan__capabilities">
              ${planCapabilities(plan)
                .map(
                  (capability) => `
                    <li class="${capability.enabled ? 'is-included' : 'is-locked'}">
                      <span aria-hidden="true">${capability.enabled ? '✓' : '–'}</span>
                      ${escapeHtml(capability.label)}
                      <small>${escapeHtml(capability.enabled ? text.included : text.notIncluded)}</small>
                    </li>
                  `
                )
                .join('')}
            </ul>
          </div>

          <a href="${escapeHtml(planUrl(plan.code))}" class="btn pricing-plan__cta${primaryCtaClass}">
            ${escapeHtml(plan.monthlyPriceCents ? text.choose : text.free)}
          </a>
        </article>
      `;
    };

    const renderPlans = () => {
      if (!plansGrid || currentState !== 'ready') {
        return;
      }

      plansGrid.innerHTML = loadedPlans.map(renderPlan).join('');
    };

    const loadPlans = async () => {
      if (!endpointUrl) {
        setState('error');
        return;
      }

      setState('loading');

      try {
        const response = await fetch(endpointUrl, {
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Plan catalog request failed with ${response.status}`);
        }

        const plans = await response.json();
        loadedPlans = Array.isArray(plans)
          ? plans
              .filter((plan) => plan.visible !== false)
              .sort((first, second) => (first.monthlyPriceCents || 0) - (second.monthlyPriceCents || 0))
          : [];

        if (!loadedPlans.length) {
          setState('empty');
          return;
        }

        setState('ready');
        renderPlans();
      } catch (error) {
        console.error(error);
        setState('error');
      }
    };

    if (retryButton) {
      retryButton.addEventListener('click', loadPlans);
    }

    window.addEventListener('coldtrace:locale-changed', () => {
      if (currentState === 'ready') {
        renderPlans();
      }
    });

    loadPlans();
  };

  setupPlanCatalog();

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
