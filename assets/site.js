const root = document.documentElement;
const toggle = document.getElementById('langToggle');
const stored = localStorage.getItem('xwh-lang');
const initial = stored || (navigator.language && navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en');
function setLang(lang) {
  root.classList.toggle('lang-zh', lang === 'zh');
  root.classList.toggle('lang-en', lang === 'en');
  root.lang = lang === 'zh' ? 'zh-CN' : 'en';
  toggle.textContent = lang === 'zh' ? 'EN' : '中文';
  localStorage.setItem('xwh-lang', lang);
}
setLang(initial);
toggle.addEventListener('click', () => setLang(root.classList.contains('lang-zh') ? 'en' : 'zh'));
