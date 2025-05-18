// script.js - 用于 Hedra AI 风格网站的 JavaScript 代码

// 目前为空，将来可以添加交互效果，例如：
// 1. 更复杂的按钮动画
// 2. 首屏 AI 生成视频过程的简单动画
// 3. 平滑滚动到页面内锚点 (如果导航栏被添加)
// 4. 表单验证 (如果添加了试用申请表单等)

document.addEventListener('DOMContentLoaded', () => {
  // 控制台输出，确认脚本已加载
  console.log('Hedra AI 脚本已加载。');

  // 为"试用"按钮添加点击事件监听器 (如果需要)
  const tryButton = document.querySelector('.try-button');
  if (tryButton) {
    tryButton.addEventListener('click', (event) => {
      event.preventDefault(); // 阻止 <a> 标签的默认锚点跳转行为
      console.log('"试用 Hedra AI"按钮被点击！将跳转到 https://www.hedra.com/');
      window.location.href = 'https://www.hedra.com/'; // 跳转到目标网址
    });
  }

  // 导航栏汉堡菜单切换
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      // 切换汉堡菜单图标 (可选: 从三条线变为关闭X图标)
      const icon = navToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times'); // Font Awesome X icon
      }
    });
  }

  // 平滑滚动到页面内锚点 及 导航链接高亮
  const navLinks = document.querySelectorAll('.nav-menu .nav-link, .nav-logo'); // 包括logo以返回顶部
  const sections = document.querySelectorAll('.page-section, .hero'); // 包括hero区
  const navBar = document.querySelector('.navbar');
  const navBarHeight = navBar ? navBar.offsetHeight : 0;

  navLinks.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      let href = this.getAttribute('href');
      // 对于 logo (href="#")，我们希望滚动到页面顶部
      if (href === "#") {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        // 关闭移动端菜单（如果打开）
        if (navMenu && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          const icon = navToggle.querySelector('i');
          if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
          }
        }
      } else if (href.length > 1 && href.startsWith("#") && document.querySelector(href)) {
        e.preventDefault();
        const targetElement = document.querySelector(href);
        if (targetElement) {
            const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - navBarHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
        // 如果是移动端，点击导航链接后关闭展开的菜单
        if (navMenu && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          const icon = navToggle.querySelector('i');
          if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
          }
        }
      }
      // 对于外部链接或非锚点链接，不执行 preventDefault
    });
  });
  
  // 滚动时高亮当前导航链接
  if(sections.length > 0 && navLinks.length > 0) {
    const activateLink = (id) => {
        navLinks.forEach(link => {
            link.classList.remove('active');
            // 检查 href 是否存在并且是字符串
            const linkHref = link.getAttribute('href');
            if (typeof linkHref === 'string') {
                if ((id === 'hero' && linkHref === '#') || linkHref === '#' + id) {
                    link.classList.add('active');
                }
            }
        });
    };

    window.addEventListener('scroll', () => {
      let currentSectionId = '';
      // 确定当前主要可见的区域
      const scrollPosition = window.pageYOffset + navBarHeight + 50; // 50px 作为缓冲

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSectionId = section.classList.contains('hero') ? 'hero' : section.getAttribute('id');
        }
      });
      
      // 如果没有特定section匹配 (例如滚动到最底部且最后一个section不够高时)，
      // 或者滚动到最顶部时，需要特殊处理
      if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 50) { // 接近底部
          // 高亮最后一个 section 对应的链接
          const lastSection = sections[sections.length-1];
          if (lastSection) {
            currentSectionId = lastSection.classList.contains('hero') ? 'hero' : lastSection.getAttribute('id');
          }
      } else if (window.pageYOffset < navBarHeight + 50 ) { // 接近顶部
          currentSectionId = 'hero';
      }

      if (currentSectionId) {
          activateLink(currentSectionId);
      } else {
          // 如果没有匹配的，则默认高亮"主页"或清除所有高亮
          navLinks.forEach(link => link.classList.remove('active'));
          const homeLink = document.querySelector('.nav-link[href="#"]');
          if(homeLink) homeLink.classList.add('active');
      }
    });
  }

  // Navbar animation on scroll
  if (navBar) {
    const scrollThreshold = 50; // 滚动多少像素后触发导航栏样式变化
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > scrollThreshold) {
        navBar.classList.add('navbar-scrolled');
      } else {
        navBar.classList.remove('navbar-scrolled');
      }
    });
  }

  // FAQ Accordion
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const answer = question.nextElementSibling; // .faq-answer is the next sibling
      const isActive = question.classList.contains('active');

      // Optional: Close other open FAQs for a true accordion effect
      // faqQuestions.forEach(q => {
      //     if (q !== question && q.classList.contains('active')) {
      //         q.classList.remove('active');
      //         q.nextElementSibling.style.maxHeight = null;
      //         q.setAttribute('aria-expanded', 'false');
      //     }
      // });

      question.classList.toggle('active');
      question.setAttribute('aria-expanded', !isActive);

      if (question.classList.contains('active')) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.paddingTop = '20px'; // Match p padding
        answer.style.paddingBottom = '20px'; // Match p padding
      } else {
        answer.style.maxHeight = null;
        answer.style.paddingTop = '0';
        answer.style.paddingBottom = '0';
      }
    });
  });

  // Language Selector Logic
  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ru', name: 'Русский' },
    { code: 'de', name: 'Deutsch' }
  ];

  const langSelectorContainer = document.getElementById('languageSelectorContainer');
  const langSelectorButton = document.getElementById('languageSelectorButton');
  const selectedLangNameSpan = document.getElementById('selectedLanguageName');
  const langDropdown = document.getElementById('languageDropdown');

  let currentLanguage = 'zh'; // Default language
  let translations = {}; // To store loaded translation data

  async function fetchTranslations(langCode) {
    console.log(`Fetching translations for: ${langCode}`);
    try {
      const response = await fetch(`locales/${langCode}/main.json?v=${new Date().getTime()}`); // Add cache buster
      if (!response.ok) {
        console.error(`Failed to fetch locales/${langCode}/main.json. Status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      translations = await response.json();
      console.log(`Translations for ${langCode} loaded successfully:`, translations);
      return true;
    } catch (error) {
      console.error(`Could not load or parse translations for ${langCode}:`, error);
      translations = {}; // Reset translations on error
      return false;
    }
  }

  function applyPageTranslations() {
    if (Object.keys(translations).length === 0) {
      console.warn('applyPageTranslations called but no translations are loaded or translations are empty.');
      return;
    }
    console.log('Applying page translations...');

    // Update page title
    const siteTitleTranslation = getTranslationValue('siteTitle');
    if (siteTitleTranslation) {
      document.title = siteTitleTranslation;
    }

    document.querySelectorAll('[data-i18n-key]').forEach(element => {
      const key = element.getAttribute('data-i18n-key');
      const translation = getTranslationValue(key);
      if (translation !== null && typeof translation === 'string') {
        if (element.hasAttribute('data-i18n-dangerouslysetinnerhtml')) {
            element.innerHTML = translation;
        } else {
            element.textContent = translation;
        }
      } else if (translation !== null) {
        console.warn(`Translation for key '${key}' is not a string:`, translation);
      } else {
        console.warn(`Translation not found for key: ${key} (element: ${element.tagName})`);
      }
    });

    document.querySelectorAll('[data-i18n-attrs]').forEach(element => {
      const attrsString = element.getAttribute('data-i18n-attrs');
      try {
        attrsString.split(';').forEach(attrRule => {
            const [attrName, key] = attrRule.split(':');
            if (attrName && key) {
                const translation = getTranslationValue(key.trim());
                if (translation !== null && typeof translation === 'string') {
                    element.setAttribute(attrName.trim(), translation);
                } else if (translation === null) {
                    console.warn(`Translation not found for attribute key: ${key.trim()} (element: ${element.tagName})`);
                }
            }
        });
      } catch (e) {
        console.error(`Error processing data-i18n-attrs for element:`, element, e);
      }
    });
    console.log('Page translations applied.');
  }

  // Helper function to get nested translation values using dot notation
  function getTranslationValue(key) {
    if (!key) return null;
    return key.split('.').reduce((obj, k) => (obj && typeof obj[k] !== 'undefined') ? obj[k] : null, translations);
  }

  function populateLanguageOptions() {
    langDropdown.innerHTML = ''; // Clear existing options
    supportedLanguages.forEach(lang => {
      const option = document.createElement('li');
      option.classList.add('language-option');
      option.textContent = lang.name;
      option.setAttribute('role', 'option');
      option.setAttribute('data-lang-code', lang.code);
      if (lang.code === currentLanguage) {
        option.classList.add('selected');
        option.setAttribute('aria-selected', 'true');
      }
      option.addEventListener('click', () => selectLanguage(lang));
      langDropdown.appendChild(option);
    });
  }

  function toggleDropdown() {
    const isOpen = langDropdown.classList.toggle('open');
    langSelectorButton.setAttribute('aria-expanded', isOpen);
    langDropdown.setAttribute('aria-hidden', !isOpen);
  }

  async function selectLanguage(lang) {
    console.log(`Attempting to select language: ${lang.name} (${lang.code})`);
    currentLanguage = lang.code;
    selectedLangNameSpan.textContent = lang.name;
    document.documentElement.lang = lang.code;
    localStorage.setItem('preferredLanguage', lang.code);

    const loaded = await fetchTranslations(lang.code);
    if (loaded) {
      applyPageTranslations();
    }

    populateLanguageOptions(); // Re-populate to update 'selected' class in dropdown
    langDropdown.classList.remove('open');
    langSelectorButton.setAttribute('aria-expanded', 'false');
    langDropdown.setAttribute('aria-hidden', 'true');

    console.log(`Language successfully changed to: ${lang.name} (${lang.code})`);
  }

  if (langSelectorButton && langDropdown && selectedLangNameSpan) {
    let determinedInitialLangCode = localStorage.getItem('preferredLanguage');
    console.log('LocalStorage preferredLanguage:', determinedInitialLangCode);

    if (!determinedInitialLangCode || !supportedLanguages.find(l => l.code === determinedInitialLangCode)) {
        const browserLang = navigator.language.split('-')[0];
        console.log('Browser language (short code):', browserLang);
        if (supportedLanguages.find(l => l.code === browserLang)) {
            determinedInitialLangCode = browserLang;
            console.log('Using browser language:', determinedInitialLangCode);
        } else {
            determinedInitialLangCode = 'zh'; // Default to Chinese
            console.log('Browser language not supported or not found, defaulting to zh.');
        }
    }

    const initialLangObject = supportedLanguages.find(l => l.code === determinedInitialLangCode);

    if (initialLangObject) {
      currentLanguage = initialLangObject.code;
      selectedLangNameSpan.textContent = initialLangObject.name;
      document.documentElement.lang = initialLangObject.code;
      populateLanguageOptions();

      console.log(`Initial language determined: ${initialLangObject.name} (${initialLangObject.code})`);
      (async () => {
        const loaded = await fetchTranslations(initialLangObject.code);
        if (loaded) {
          applyPageTranslations();
        }
      })();
    } else {
        console.error("Critical error: Could not determine a valid initial language object even with default. Check supportedLanguages array.");
        // Fallback to absolute default if initialLangObject is somehow null
        currentLanguage = 'zh';
        const zhLang = supportedLanguages.find(l => l.code === 'zh');
        if (zhLang) selectedLangNameSpan.textContent = zhLang.name;
        document.documentElement.lang = 'zh';
        populateLanguageOptions();
        (async () => { await fetchTranslations('zh'); applyPageTranslations(); })();
    }

    langSelectorButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent click from immediately closing due to document listener
        toggleDropdown();
    });

    // Click outside to close
    document.addEventListener('click', (event) => {
      if (langDropdown.classList.contains('open') && !langSelectorContainer.contains(event.target)) {
        toggleDropdown();
      }
    });

    // Keyboard accessibility for dropdown items (basic)
    langDropdown.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            const selectedOption = supportedLanguages.find(l => l.name === event.target.textContent);
            if (selectedOption) {
                selectLanguage(selectedOption);
            }
        }
    });
  }
}); 