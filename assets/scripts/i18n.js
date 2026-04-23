/**
 * i18n — lightweight internationalization for ColdTrace landing page.
 * Supports en-US (default) and es-419. Persists choice in localStorage.
 */

const DEFAULT_LOCALE = 'en-US';
const SUPPORTED_LOCALES = ['en-US', 'es-419'];

async function loadLocale(locale) {
  const response = await fetch(`assets/locales/${locale}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load locale: ${locale}`);
  }
  return response.json();
}

function resolveKey(translations, key) {
  return key.split('.').reduce((obj, part) => (obj ? obj[part] : undefined), translations);
}

function applyTranslations(translations) {
  // Text content
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    const value = resolveKey(translations, key);
    if (typeof value === 'string') {
      element.textContent = value;
    }
  });

  // Placeholders (inputs, textareas)
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    const value = resolveKey(translations, key);
    if (typeof value === 'string') {
      element.setAttribute('placeholder', value);
    }
  });

  // aria-label (optional)
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    const key = element.getAttribute('data-i18n-aria-label');
    const value = resolveKey(translations, key);
    if (typeof value === 'string') {
      element.setAttribute('aria-label', value);
    }
  });
}

async function setLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    locale = DEFAULT_LOCALE;
  }
  try {
    const translations = await loadLocale(locale);
    applyTranslations(translations);
    document.documentElement.lang = locale;
    localStorage.setItem('locale', locale);
    updateLangSwitcher(locale);
  } catch (error) {
    console.error(error);
  }
}

function updateLangSwitcher(locale) {
  document.querySelectorAll('[data-lang-option]').forEach((button) => {
    const isActive = button.getAttribute('data-lang-option') === locale;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const savedLocale = localStorage.getItem('locale') || DEFAULT_LOCALE;
  setLocale(savedLocale);

  document.querySelectorAll('[data-lang-option]').forEach((button) => {
    button.addEventListener('click', () => {
      const locale = button.getAttribute('data-lang-option');
      setLocale(locale);
    });
  });
});
