(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const themes = ['editorial', 'technical', 'warm'];
  const languages = ['en', 'zh'];
  const themeKey = 'northstar-theme-v1';
  const languageKey = 'northstar-language-v1';
  const inquiryKey = 'northstar-demo-inquiries-v1';
  const languageToggle = document.getElementById('languageToggle');
  const themeButtons = [...document.querySelectorAll('[data-theme-choice]')];
  const form = document.getElementById('inquiryForm');
  const formStatus = document.getElementById('formStatus');

  function readStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function setTheme(theme, persist = true) {
    if (!themes.includes(theme)) return;
    root.dataset.theme = theme;
    themeButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme));
    });
    if (persist) writeStorage(themeKey, theme);
  }

  function setLanguage(language, persist = true) {
    if (!languages.includes(language)) return;
    const isChinese = language === 'zh';
    root.lang = isChinese ? 'zh-CN' : 'en';
    body.classList.toggle('is-zh', isChinese);

    document.querySelectorAll('[data-zh]').forEach((element) => {
      if (!element.dataset.englishText) element.dataset.englishText = element.textContent.trim();
      element.textContent = isChinese ? element.dataset.zh : element.dataset.englishText;
    });
    document.querySelectorAll('[data-placeholder-zh]').forEach((element) => {
      if (!element.dataset.englishPlaceholder) element.dataset.englishPlaceholder = element.placeholder;
      element.placeholder = isChinese ? element.dataset.placeholderZh : element.dataset.englishPlaceholder;
    });
    document.querySelectorAll('[data-aria-zh]').forEach((element) => {
      if (!element.dataset.englishAria) element.dataset.englishAria = element.getAttribute('aria-label') || '';
      element.setAttribute('aria-label', isChinese ? element.dataset.ariaZh : element.dataset.englishAria);
    });

    if (languageToggle) {
      languageToggle.textContent = isChinese ? 'EN' : '中文';
      languageToggle.setAttribute('aria-label', isChinese ? 'Switch to English' : 'Switch to Chinese');
    }
    if (formStatus && !formStatus.hidden) {
      formStatus.textContent = formStatus.dataset.messageZh && formStatus.dataset.messageEn
        ? (isChinese ? formStatus.dataset.messageZh : formStatus.dataset.messageEn)
        : formStatus.textContent;
    }
    if (persist) writeStorage(languageKey, language);
  }

  setTheme(readStorage(themeKey) || 'editorial', false);
  setLanguage(readStorage(languageKey) || (navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'), false);

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => setTheme(button.dataset.themeChoice));
  });
  if (languageToggle) {
    languageToggle.addEventListener('click', () => setLanguage(root.lang.startsWith('zh') ? 'en' : 'zh'));
  }

  if (!form) return;
  const submitButton = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const entry = Object.fromEntries(new FormData(form).entries());
    entry.name = String(entry.name || '').trim();
    entry.email = String(entry.email || '').trim();
    entry.message = String(entry.message || '').trim();
    entry.id = globalThis.crypto?.randomUUID?.() || `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    entry.submittedAt = new Date().toISOString();
    entry.externalWrites = 0;

    let entries = [];
    try {
      const stored = JSON.parse(readStorage(inquiryKey) || '[]');
      if (Array.isArray(stored)) entries = stored;
    } catch {
      entries = [];
    }
    entries.push(entry);
    const saved = writeStorage(inquiryKey, JSON.stringify(entries.slice(-5)));

    form.reset();
    const isChinese = root.lang.startsWith('zh');
    const messageEn = saved
      ? 'Demo inquiry saved in this browser. Nothing was sent.'
      : 'This browser blocked local storage. Nothing was sent.';
    const messageZh = saved
      ? '演示咨询已保存在当前浏览器，未发送任何内容。'
      : '当前浏览器阻止了本地存储，未发送任何内容。';
    formStatus.dataset.messageEn = messageEn;
    formStatus.dataset.messageZh = messageZh;
    formStatus.textContent = isChinese ? messageZh : messageEn;
    formStatus.hidden = false;

    if (submitButton) submitButton.disabled = false;
  });
  if (submitButton) submitButton.disabled = false;
})();
