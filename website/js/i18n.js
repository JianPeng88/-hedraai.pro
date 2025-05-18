// website/js/i18n.js

// 配置支持的语言
const SUPPORTED_LANGUAGES = {
    en: { name: 'English', dir: 'ltr', isDefault: true },
    es: { name: 'Español', dir: 'ltr' },
    it: { name: 'Italiano', dir: 'ltr' },
    fr: { name: 'Français', dir: 'ltr' },
    zh: { name: '中文繁體', dir: 'ltr' }, //
    ja: { name: '日本語', dir: 'ltr' },
    ko: { name: '한국어', dir: 'ltr' },
    pt: { name: 'Português', dir: 'ltr' },
    de: { name: 'Deutsch', dir: 'ltr' },
    id: { name: 'Bahasa Indonesia', dir: 'ltr' },
    nl: { name: 'Nederlands', dir: 'ltr' }
};

// 默认语言
const DEFAULT_LANGUAGE = Object.keys(SUPPORTED_LANGUAGES).find(key => SUPPORTED_LANGUAGES[key].isDefault) || 'en';

class LanguageManager {
    constructor() {
        this.currentLanguage = this.detectLanguage();
        this.translations = {};
        this.init();
    }

    detectLanguage() {
        // 1. 从localStorage获取保存的语言偏好
        const savedLang = localStorage.getItem('userLanguage');
        if (savedLang && this.isValidLanguage(savedLang)) {
            return savedLang;
        }

        // 2. 从URL路径获取语言代码 (例如 /zh/index.html)
        // 路径的第二部分 (index 1) 应该是语言代码
        const pathParts = window.location.pathname.split('/');
        if (pathParts.length > 1 && this.isValidLanguage(pathParts[1])) {
            return pathParts[1];
        }
        
        // 3. 尝试从浏览器语言设置中获取
        const browserLang = navigator.language.split('-')[0];
        if (this.isValidLanguage(browserLang)) {
            return browserLang;
        }
        
        return DEFAULT_LANGUAGE;
    }

    isValidLanguage(langCode) {
        return Object.keys(SUPPORTED_LANGUAGES).includes(langCode);
    }

    async init() {
        await this.loadTranslations(this.currentLanguage);
        this.applyTranslationsAll();
        this.updateLanguageSwitcherDisplay();
        this.populateLanguageOptions(); // 必须在 setupEventListeners 之前或之后都可以，但显示内容应在事件绑定前准备好
        this.setupEventListeners(); // 确保 DOM 完全加载并初始化后再设置事件监听
         // 首次加载时，根据检测到的语言可能需要重定向
        this.redirectToCorrectLanguagePath();
    }
    
    redirectToCorrectLanguagePath() {
        const currentPath = window.location.pathname;
        const expectedLangPrefix = this.currentLanguage === DEFAULT_LANGUAGE ? '' : `/${this.currentLanguage}`;
        const currentFile = currentPath.substring(currentPath.lastIndexOf('/')); // e.g., /index.html

        let expectedPath;
        // Strip existing lang prefix if current path has one that's different from expected
        const pathSegments = currentPath.split('/');
        let basePath = '';
        if (pathSegments.length > 2 && this.isValidLanguage(pathSegments[1]) && pathSegments[1] !== this.currentLanguage) {
            basePath = currentPath.substring(pathSegments[1].length + 1); // Remove /old_lang
        } else if (pathSegments.length > 2 && this.isValidLanguage(pathSegments[1]) && pathSegments[1] === this.currentLanguage) {
            basePath = currentPath; // Already correct
        }
        else if (pathSegments.length <=2 && this.currentLanguage !== DEFAULT_LANGUAGE){ // from root to lang specific
             basePath = `/${this.currentLanguage}${currentPath}`;
        }
         else { // from lang specific to root or root to root
            basePath = currentPath;
        }
        basePath = basePath.replace(/\/\//g, '/');


        if (this.currentLanguage === DEFAULT_LANGUAGE) {
            // If current language is default, we want to be at the root path.
            // e.g. /index.html or /about.html
            // If currentPath is /zh/index.html, new path should be /index.html
            const langPrefixPattern = new RegExp(`^/(${Object.keys(SUPPORTED_LANGUAGES).join('|')})(?!${DEFAULT_LANGUAGE})`);
            if (langPrefixPattern.test(currentPath)){
                 expectedPath = currentPath.replace(langPrefixPattern, '');
                 if (expectedPath === '') expectedPath = '/';
            } else {
                expectedPath = currentPath; // Already at root or non-lang path
            }
        } else {
            // If current language is not default, we want to be at /lang/path
            // e.g. /zh/index.html or /zh/about.html
            if (!currentPath.startsWith(`/${this.currentLanguage}/`)) {
                const langPrefixPattern = new RegExp(`^/(${Object.keys(SUPPORTED_LANGUAGES).join('|')})`);
                 if (langPrefixPattern.test(currentPath)){ // currently on /en/ or /es/ but want /zh/
                    expectedPath = currentPath.replace(langPrefixPattern, `/${this.currentLanguage}`);
                 } else { // currently on / or /page.html
                    expectedPath = `/${this.currentLanguage}${currentPath === '/' ? '' : currentPath}`;
                 }
            } else {
                expectedPath = currentPath; // Already has correct lang prefix
            }
        }
        
        // Normalize index.html for root/lang root
        if (expectedPath === '/' || expectedPath === `/${this.currentLanguage}`) {
            expectedPath += 'index.html';
        }
         expectedPath = expectedPath.replace(/\/\//g, '/');


        if (window.location.pathname !== expectedPath && expectedPath) {
            // console.log(`Redirecting from ${window.location.pathname} to ${expectedPath}`);
            window.location.href = expectedPath;
        }
    }


    async loadTranslations(lang) {
        if (!this.isValidLanguage(lang)) {
            console.warn(`Attempted to load translations for unsupported language: ${lang}`);
            this.translations = {};
            return;
        }

        let basePath = '../locales/'; // Default for pages like /en/index.html
        const pathSegments = window.location.pathname.split('/');
        // If path is /index.html or just /, it's at root. locales/ is direct child.
        if (pathSegments.length <= 2 || (pathSegments.length === 3 && pathSegments[2] === '')) { // Handles / and /index.html
             basePath = './locales/';
        }
        
        const fetchPath = `${basePath}${lang}.json`;
        try {
            const response = await fetch(fetchPath);
            if (!response.ok) {
                throw new Error(`Could not load ${lang}.json: ${response.statusText} (path: ${fetchPath})`);
            }
            this.translations = await response.json();
        } catch (error) {
            console.error(`Error loading translation file for ${lang}:`, error);
            this.translations = {}; // Fallback to empty to prevent errors
        }
    }

    getTranslation(key) {
        // Helper to get nested values like "meta.title"
        return key.split('.').reduce((obj, k) => (obj && typeof obj[k] !== 'undefined') ? obj[k] : null, this.translations);
    }

    applyTranslationsAll() {
        document.documentElement.lang = this.currentLanguage;
        document.documentElement.dir = SUPPORTED_LANGUAGES[this.currentLanguage]?.dir || 'ltr';

        const titleTranslation = this.getTranslation("meta.title");
        if (titleTranslation) document.title = titleTranslation;
        
        const descriptionElement = document.querySelector('meta[name="description"][data-i18n="meta.description"]');
        if (descriptionElement) {
            const descTranslation = this.getTranslation("meta.description");
            if (descTranslation) descriptionElement.setAttribute('content', descTranslation);
        }
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            if (translation !== null) {
                // More robustly handle elements that might contain other HTML or need specific attributes updated.
                // For now, focusing on textContent.
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                     if(element.type === 'submit' || element.type === 'button'){
                         element.value = translation;
                     } else {
                        element.placeholder = translation; // Common use for inputs
                     }
                } else if (element.tagName === 'IMG') {
                    element.alt = translation; // Common use for images
                } else {
                    // For most elements, set textContent.
                    // If you need to inject HTML, use element.innerHTML = translation; but be wary of XSS.
                    element.textContent = translation;
                }
            } else {
                // console.warn(`Translation not found for key: ${key}`);
            }
        });
    }

    updateLanguageSwitcherDisplay() {
        const currentLangElement = document.getElementById('current-language');
        if (currentLangElement) {
            currentLangElement.textContent = SUPPORTED_LANGUAGES[this.currentLanguage]?.name || this.currentLanguage;
        }
    }
    
    populateLanguageOptions() {
        const optionsContainer = document.querySelector('.language-options');
        if (!optionsContainer) return;
        optionsContainer.innerHTML = ''; // Clear existing options

        for (const langCode in SUPPORTED_LANGUAGES) {
            if (SUPPORTED_LANGUAGES.hasOwnProperty(langCode)) {
                const langData = SUPPORTED_LANGUAGES[langCode];
                const link = document.createElement('a');
                link.href = '#'; // Navigation handled by JS
                // The text of the link itself should be the language's native name,
                // which is already in langData.name. No need for data-i18n here.
                link.textContent = langData.name; 
                link.setAttribute('data-lang', langCode); // Store lang code for the event listener
                
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.changeLanguage(langCode);
                    const dropdown = document.querySelector('.language-dropdown');
                    if (dropdown) dropdown.classList.remove('active'); // Hide dropdown
                });
                optionsContainer.appendChild(link);
            }
        }
    }

    setupEventListeners() {
        const langButton = document.querySelector('.language-btn');
        const dropdownContainer = document.querySelector('.language-dropdown'); // The whole container

        if (langButton && dropdownContainer) {
            langButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent click from immediately closing via document listener
                dropdownContainer.classList.toggle('active');
            });
        }
        // Close dropdown if clicked outside
        document.addEventListener('click', (event) => {
            if (dropdownContainer && dropdownContainer.classList.contains('active')) {
                if (!dropdownContainer.contains(event.target)) {
                    dropdownContainer.classList.remove('active');
                }
            }
        });
    }

    async changeLanguage(langCode) {
        if (!this.isValidLanguage(langCode)) {
            console.warn("Invalid language selected:", langCode);
            return;
        }

        this.currentLanguage = langCode;
        localStorage.setItem('userLanguage', langCode);
        
        // Determine the base of the current page (e.g., /index.html, /about.html)
        let currentPagePath = window.location.pathname;
        const currentPathSegments = currentPagePath.split('/');
        
        // If current path starts with a known language code, strip it to get base path
        // e.g. /zh/about.html -> /about.html
        if (currentPathSegments.length > 1 && this.isValidLanguage(currentPathSegments[1])) {
            currentPagePath = '/' + currentPathSegments.slice(2).join('/');
        }
        if (currentPagePath === '/' || currentPagePath === '') { // Ensure it's /index.html for root
            currentPagePath = '/index.html';
        }
        currentPagePath = currentPagePath.replace(/\/\//g, '/');


        let newPath;
        if (langCode === DEFAULT_LANGUAGE) {
            newPath = currentPagePath; // e.g., /index.html or /about.html
        } else {
            newPath = `/${langCode}${currentPagePath}`; // e.g., /zh/index.html or /zh/about.html
        }
        newPath = newPath.replace(/\/\//g, '/');

        if (window.location.pathname !== newPath) {
            window.location.href = newPath;
        } else {
            // Already on the correct page, just re-apply translations for the selected language
            await this.loadTranslations(this.currentLanguage);
            this.applyTranslationsAll();
            this.updateLanguageSwitcherDisplay();
            document.documentElement.lang = this.currentLanguage; // Ensure HTML lang attribute is updated
            document.documentElement.dir = SUPPORTED_LANGUAGES[this.currentLanguage]?.dir || 'ltr';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.languageManager = new LanguageManager();
});

// Helper to get current script path, might be useful if JS is moved
// function getCurrentScriptPath() {
//     if (document.currentScript) {
//         return document.currentScript.src;
//     } else {
//         // Fallback for older browsers
//         const scripts = document.getElementsByTagName('script');
//         return scripts[scripts.length - 1].src;
//     }
// }