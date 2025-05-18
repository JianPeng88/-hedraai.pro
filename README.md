# 项目名称：[待定 - 我们一起给它起个好听的名字吧！]

## 项目目标

创建一个美观、实用、支持多语言（包括英语、西班牙语、意大利语、法语、中文繁体、日语、韩语、葡萄牙语、德语、印尼语、荷兰语共11种语言）的静态介绍性网页。目标是让初中生用户也能轻松理解和参与开发过程。

## 核心技术栈

*   **HTML5**: 负责网页的结构和内容。
*   **CSS3**: 负责网页的样式和布局，采用 Flexbox 和 Grid 实现响应式设计。
*   **JavaScript**: 用于实现用户交互，如语言切换、动态加载内容等功能，核心通过 `LanguageManager` 类实现。

## 页面规划 (当前仅有首页)

1.  **首页 (index.html)**:
    *   用途：网站的入口页面，展示核心信息和导航。
    *   布局结构：
        *   导航栏 (Header)，包含 Logo、导航链接和语言下拉选择器。
        *   主要内容区 (Main Content / Hero Section)。
        *   页脚 (Footer)。
    *   样式说明：简洁、现代 (Clipto 风格)，色彩明快。
    *   多语言版本：
        *   默认语言 (英语) 位于根目录 `website/index.html`。
        *   其他10种语言分别位于 `website/[language-code]/index.html` (例如 `website/zh/index.html`, `website/es/index.html`)。
        *   所有页面的内容通过 JavaScript (`js/i18n.js` 中的 `LanguageManager`) 从对应语言的 JSON 文件动态加载。

## 文件/目录结构规划

```
website/
├── index.html          # 默认语言(英文)首页
├── css/
│   └── styles.css      # 主样式表
├── js/
│   └── i18n.js         # 包含 LanguageManager 类的脚本，负责语言切换和内容加载
├── locales/            # 语言文件目录
│   ├── en.json         # 英语翻译
│   ├── zh.json         # 中文繁体翻译
│   ├── es.json         # 西班牙语翻译
│   ├── fr.json         # 法语翻译
│   ├── ja.json         # 日语翻译
│   ├── it.json         # 意大利语翻译
│   ├── ko.json         # 韩语翻译
│   ├── pt.json         # 葡萄牙语翻译
│   ├── de.json         # 德语翻译
│   ├── id.json         # 印尼语翻译
│   └── nl.json         # 荷兰语翻译
└── [language-code]/    # 每种语言的子目录 (例如 en/, zh/, es/, fr/, ja/, it/, ko/, pt/, de/, id/, nl/)
    └── index.html      # 对应语言的页面入口 (HTML结构与根index.html类似，但通过URL区分语言)
```

## 多语言支持方案 (当前采用)

我们将支持英语 (en)、西班牙语 (es)、意大利语 (it)、法语 (fr)、中文繁体 (zh)、日语 (ja)、韩语 (ko)、葡萄牙语 (pt)、德语 (de)、印尼语 (id)、荷兰语 (nl) 共11种语言。

1.  **内容存储与管理**:
    *   所有可翻译的文本内容存储在 `locales/` 目录下的 JSON 文件中。
    *   每个 JSON 文件包含一组键值对，键用于在 HTML 中标识元素，值是该语言的对应文本。
    *   例如, `en.json` 可能有 `\"homepage.welcomeTitle\": \"Welcome!\"`，而 `zh.json` 有 `\"homepage.welcomeTitle\": \"歡迎!\"`。

2.  **HTML 结构中的标记**:
    *   在 HTML 元素中使用 `data-i18n=\"your.key.here\"` 属性来标记需要国际化的文本。
    *   `js/i18n.js` 中的 `LanguageManager` 脚本会查找这些带有 `data-i18n` 属性的元素，并根据当前选择的语言从对应的 JSON 文件中获取文本来替换其内容。这也包括 `<title>` 和 `<meta name=\"description\">` 等头部信息。
    *   所有 HTML 页面均包含指向其他所有语言版本的 `hreflang` SEO 标签。

3.  **语言切换机制与 URL 设计 (`LanguageManager`)**:
    *   网站根目录的 `website/index.html` 作为默认的入口点，默认加载英语内容。
    *   其他语言有其特定的入口页面，位于以语言代码命名的子目录下：`website/[language-code]/index.html`。
    *   页面头部提供一个语言下拉选择器，动态填充支持的语言。
    *   点击切换语言时：
        *   `LanguageManager` 脚本负责将用户导航到所选语言对应的路径（根目录或子目录）。
        *   脚本随后加载该语言的 JSON 文件并动态更新页面上的文本内容。
        *   确保在不同语言路径间切换时，正确处理相对路径问题。

4.  **默认语言与用户偏好 (`LanguageManager`)**:
    *   首次访问时，脚本会尝试从 URL 路径中识别语言。
    *   如果 URL 没有明确的语言路径 (例如访问根目录)，会检查 `localStorage` 中是否有用户上次选择的语言偏好。
    *   如果 `localStorage` 中没有偏好，会尝试检测浏览器 `navigator.language` 或 `navigator.languages`。
    *   如果以上都无法确定，则默认为英语 (`en`)。
    *   用户的语言偏好会通过 `localStorage` 存储在浏览器中。
    *   `LanguageManager` 包含逻辑以确保用户访问的 URL 与检测到的语言一致，如果不一致则进行重定向。

## 开发步骤规划

1.  **基础 HTML 结构搭建**: 完成 `website/index.html` 的 HTML 骨架（Clipto 风格）。为需要翻译的文本元素添加 `data-i18n` 属性，并包含所有支持语言的 `hreflang` 标签。
2.  **CSS 样式设计**: 在 `website/css/styles.css` 中实现 Clipto 风格的页面美化和响应式布局，包括语言下拉菜单的样式。
3.  **创建语言 JSON 文件**: 在 `website/locales/` 目录下为所有11种语言创建 JSON 文件并填充翻译文本（或占位符）。
4.  **实现 `LanguageManager` 脚本 (`js/i18n.js`)**:
    *   定义支持的语言列表及其属性。
    *   实现加载 JSON 文件的功能 (根据当前语言和路径)。
    *   实现根据 `data-i18n` 属性更新 HTML 元素内容的逻辑。
    *   实现语言切换（URL 跳转、内容刷新、下拉菜单更新）的逻辑。
    *   实现用户语言偏好的检测、存储与读取 (`localStorage`, 浏览器语言)。
    *   实现 URL 路径与语言状态同步的重定向逻辑。
    *   动态填充语言选择下拉菜单。
5.  **创建特定语言的 `index.html` 入口文件**: 在 `website/[language-code]/` 目录下为除默认英语外的其他10种语言创建 `index.html` 文件。这些文件结构与根 `index.html` 相同，主要作用是通过 URL 区分语言，并确保 `i18n.js` 和 `styles.css` 的路径正确引用 (通常是 `../js/i18n.js` 和 `../css/styles.css`)。所有这些文件也需要包含全套 `hreflang` 标签。
6.  **细节优化与测试**: 完善样式，测试不同设备和浏览器下的显示效果及语言切换功能。确保所有链接和路径在各种语言环境下均正确。

## 未来可能的优化方向

*   为 `about.html` 和 `contact.html` 等其他页面实现多语言支持。
*   优化图片和媒体资源的加载，考虑是否需要按语言提供不同资源。
*   进一步提升SEO，例如动态生成 Sitemap。
*   考虑使用 HTML5 的高级特性，如 Canvas、SVG 等，丰富页面内容（如果适用）。
*   优化页面加载性能，包括 CSS 压缩和图片优化。
*   确保网页在所有主流浏览器中都能完美显示。

---

*这个 README 文件会随着项目的进展不断更新。* 