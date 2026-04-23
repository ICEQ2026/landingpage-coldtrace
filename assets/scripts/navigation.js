/**
 * Smooth scroll for in-page anchors and active nav-pill highlight.
 */

document.addEventListener('DOMContentLoaded', () => {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  const HOME_HASH = '#home';
  const moreButton = document.querySelector('.navbar__more');
  const mobileMenu = document.querySelector('.navbar__mobile-menu');
  const getHeaderOffset = () => {
    const header = document.querySelector('.site-header');
    return header ? header.offsetHeight + 12 : 96;
  };

  const forceTop = (behavior = 'auto') => {
    window.scrollTo({ top: 0, left: 0, behavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const scrollToHome = (behavior = 'smooth') => {
    forceTop(behavior);

    // Sticky headers and native hash restoration can leave the page slightly below 0.
    window.setTimeout(() => {
      forceTop('auto');
    }, behavior === 'smooth' ? 440 : 0);
  };

  const scrollToTarget = (target, href, behavior = 'smooth') => {
    if (href === HOME_HASH) {
      scrollToHome(behavior);
      return;
    }

    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - getHeaderOffset());

    window.scrollTo({ top, behavior });
  };

  const closeMobileMenu = () => {
    if (!moreButton || !mobileMenu) return;

    moreButton.setAttribute('aria-expanded', 'false');
    mobileMenu.hidden = true;
    mobileMenu.classList.remove('is-open');
  };

  const openMobileMenu = () => {
    if (!moreButton || !mobileMenu) return;

    moreButton.setAttribute('aria-expanded', 'true');
    mobileMenu.hidden = false;
    mobileMenu.classList.add('is-open');
  };

  const toggleMobileMenu = () => {
    if (!moreButton || !mobileMenu) return;

    if (mobileMenu.classList.contains('is-open')) {
      closeMobileMenu();
      return;
    }

    openMobileMenu();
  };

  if (moreButton && mobileMenu) {
    moreButton.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleMobileMenu();
    });

    mobileMenu.addEventListener('click', (event) => {
      const trigger = event.target.closest('a[href^="#"], [data-lang-option]');
      if (trigger) {
        closeMobileMenu();
      }
    });

    document.addEventListener('click', (event) => {
      if (!mobileMenu.classList.contains('is-open')) return;
      if (mobileMenu.contains(event.target) || moreButton.contains(event.target)) return;
      closeMobileMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 767) {
        closeMobileMenu();
      }
    });
  }

  anchorLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        event.preventDefault();
        if (href === HOME_HASH) {
          history.replaceState(null, '', HOME_HASH);
          scrollToHome();
          setActivePill(HOME_HASH);
          closeMobileMenu();
          return;
        }

        scrollToTarget(target, href);
        history.replaceState(null, '', href);
        closeMobileMenu();
      }
    });
  });

  // Active nav-pill highlight based on scroll position
  const navPills = document.querySelectorAll('.nav-pill');
  const sections = Array.from(navPills)
    .map((pill) => document.querySelector(pill.getAttribute('href')))
    .filter(Boolean);

  if (sections.length === 0) return;

  const setActivePill = (id) => {
    navPills.forEach((pill) => {
      pill.classList.toggle('nav-pill--active', pill.getAttribute('href') === id);
    });
  };

  const updateActiveFromViewport = () => {
    const header = document.querySelector('.site-header');
    const headerOffset = header ? header.offsetHeight + 24 : 96;
    let activeSection = sections[0];

    sections.forEach((section) => {
      if (window.scrollY + headerOffset >= section.offsetTop) {
        activeSection = section;
      }
    });

    setActivePill(`#${activeSection.id}`);
  };

  if (window.location.hash === HOME_HASH) {
    const homeTarget = document.querySelector('#home');
    if (homeTarget) {
      scrollToHome('auto');
    }
    updateActiveFromViewport();
  } else if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      scrollToTarget(target, window.location.hash, 'auto');
      setActivePill(window.location.hash);
    } else {
      updateActiveFromViewport();
    }
  } else {
    updateActiveFromViewport();
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        updateActiveFromViewport();
      }
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
  window.addEventListener('scroll', updateActiveFromViewport, { passive: true });
  window.addEventListener('hashchange', () => {
    if (window.location.hash === HOME_HASH) {
      scrollToHome('auto');
      setActivePill(HOME_HASH);
      return;
    }

    updateActiveFromViewport();
  });
});
