const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      --sidebar-w: 220px;
      --sidebar-collapsed-w: 64px;
      --sidebar-bg: #fff0f7;
      --color-normal: #ff2b8a;
      --bg-normal: #ffdfee;
      display: block;
      font-family: "Inter", Arial, sans-serif;
    }

    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--sidebar-w);
      background: var(--sidebar-bg);
      padding: 18px 12px;
      box-shadow: 4px 0 12px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      gap: 16px;
      z-index: 9998;
      transition: transform 0.22s ease, width 0.22s ease, padding 0.22s ease;
      box-sizing: border-box;
      transform: translateX(0);
      pointer-events: auto;
    }

    .sidebar.is-collapsed {
      transform: translateX(-100%);
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      width: 100%;
    }

    .logo a {
      display: block;
      border: none;
      width: 100%;
    }

    .logo img {
      width: 100%;
      max-width: 180px;
      height: auto;
      display: block;
    }

    .toggle-wrap {
      display: flex;
      justify-content: flex-end;
      width: 100%;
    }

    button.toggle,
    button.floating-toggle {
      background: linear-gradient(135deg, #ff3aa6 0%, #ff007f 100%);
      color: #fff;
      border: none;
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: bold;
      box-shadow: 0 4px 6px rgba(255, 0, 127, 0.3);
      transition: transform 0.2s ease, opacity 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
    }

    button.toggle:hover,
    button.floating-toggle:hover {
      transform: scale(1.05);
    }

    nav {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
    }

    .nav-link,
    .nav-link:visited {
      display: flex;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
      background-color: var(--bg-normal);
      color: var(--color-normal);
      padding: 12px 16px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      cursor: pointer;
      margin-bottom: 8px;
    }

    .nav-link:hover {
      filter: brightness(0.95);
    }

    .nav-link.active {
      background-color: var(--color-normal);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(255, 43, 138, 0.3);
      font-weight: 700;
    }

    /* Dropdown trigger button */
    .dropdown-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      box-sizing: border-box;
      background-color: var(--bg-normal);
      color: var(--color-normal);
      padding: 12px 16px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      cursor: pointer;
      margin-bottom: 8px;
      gap: 8px;
    }

    .dropdown-trigger:hover {
      filter: brightness(0.95);
    }

    .dropdown-trigger.active {
      background-color: var(--color-normal);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(255, 43, 138, 0.3);
      font-weight: 700;
    }

    .dropdown-trigger .chevron {
      font-size: 10px;
      transition: transform 0.2s ease;
      flex: 0 0 12px;
    }

    .dropdown-trigger.active .chevron {
      transform: rotate(180deg);
    }

    /* Popup overlay */
    .popup-overlay {
      display: none;
      position: fixed;
      left: calc(var(--sidebar-w, 220px) + 8px);
      top: 0;
      bottom: 0;
      width: 280px;
      background: #fff;
      border-left: 2px solid #ffdfee;
      border-radius: 14px 0 0 0;
      box-shadow: -6px 0 24px rgba(0, 0, 0, 0.08);
      z-index: 9997;
      flex-direction: column;
      padding: 24px 18px;
      gap: 12px;
    }

    .popup-overlay.open {
      display: flex;
    }

    .popup-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--color-normal);
      margin: 0 0 8px 0;
    }

    .popup-close {
      position: absolute;
      top: 14px;
      right: 14px;
      background: none;
      border: none;
      font-size: 18px;
      color: #999;
      cursor: pointer;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease;
    }

    .popup-close:hover {
      background: #ffdfee;
      color: var(--color-normal);
    }

    .popup-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      overflow-y: auto;
    }

    .popup-item {
      display: block;
      padding: 10px 14px;
      border-radius: 10px;
      text-decoration: none;
      font-size: 14px;
      color: #334155;
      font-weight: 500;
      transition: all 0.15s ease;
      background: #fff;
      border: 1px solid transparent;
    }

    .popup-item:hover {
      background: #ffdfee;
      color: var(--color-normal);
      border-color: #ff2b8a22;
    }

    .popup-item.active {
      color: var(--color-normal);
      background: #ffdfee;
      font-weight: 600;
    }

    .foot {
      margin-top: auto;
      font-size: 11px;
      color: rgba(0, 0, 0, 0.4);
      text-align: center;
      width: 100%;
    }

    button.floating-toggle {
      position: fixed;
      left: 12px;
      top: 12px;
      z-index: 10000;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: none;
    }

    button.floating-toggle.visible {
      display: flex;
    }

    .lang-selector-wrap {
      width: 100%;
      margin-bottom: 8px;
    }

    .lang-selector {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid rgba(255,43,138,0.15);
      border-radius: 10px;
      background: #fff;
      font-size: 14px;
      font-weight: 600;
      color: var(--color-normal);
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23ff2b8a' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      transition: border-color 0.2s ease;
    }

    .lang-selector:focus {
      outline: none;
      border-color: var(--color-normal);
      box-shadow: 0 0 0 3px rgba(255,43,138,0.15);
    }

    @media (max-width: 720px) {
      :host {
        --sidebar-w: 260px;
      }

      .popup-overlay {
        left: 0;
        bottom: auto;
        top: 56px;
        width: 260px;
        max-height: calc(100vh - 56px);
        border-left: none;
        border-radius: 0 0 14px 14px;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
        z-index: 9997;
      }

      .sidebar {
        width: 260px;
        max-width: 82vw;
      }

      .logo img {
        max-width: 150px;
      }
    }
  </style>

  <button class="floating-toggle" type="button" aria-label="Open menu">☰</button>

  <aside class="sidebar" role="complementary" aria-label="Sidebar navigation">
    <div class="logo">
      <a class="logo-link" href="/">
        <img class="logo-img" src="" alt="Logo" />
      </a>
    </div>

    <div class="toggle-wrap">
      <button class="toggle" type="button" title="Toggle menu" aria-label="Toggle menu"><<</button>
    </div>

    <nav></nav>

    <div class="lang-selector-wrap">
      <select class="lang-selector" aria-label="Language selector">
        <option value="en">🇺🇸 EN</option>
        <option value="es">🇪🇸 ES</option>
        <option value="ja">🇯🇵 JA</option>
      </select>
    </div>

    <div class="foot" part="footer">© 2025</div>

    <div class="popup-overlay" aria-hidden="true">
      <button class="popup-close" aria-label="Close">✕</button>
      <div class="popup-title"></div>
      <div class="popup-list"></div>
    </div>
  </aside>
`;

const LOCALE_NAV = {
  en: {
    nav: [
      { href: "/search.html", label: "Search Makers" },
      { href: "https://forms.gle/6boFuotq8T9DGy4v6", label: "Add me", external: true },
      { href: "/cleaning.html", label: "Fursuit Cleaning" },
      { href: "/whatisafurry.html", label: "What is a Furry?" },
      { href: "/fursonacreation.html", label: "Fursona Guide" },
      { href: "/fursonanamecreation.html", label: "Fursona Name Tutorial" },
      { href: "/about.html", label: "About the Website" },
    ],
    articles: [
      { href: "/en/howmuchdoesafursuitcost.html", label: "Fursuit Cost" },
      { href: "/en/partialvsfullfursuit.html", label: "Partial vs Full" },
      { href: "/en/howtogetafursuit.html", label: "How to Commission a Fursuit" },
      { href: "/en/howheavyisafursuit.html", label: "Fursuit Weight" },
      { href: "/highlight.html", label: "Highlight" },
    ],
    articleTitle: "Other Articles",
  },
  es: {
    nav: [
      { href: "/es/search.html", label: "Buscar Creadores" },
      { href: "https://forms.gle/6boFuotq8T9DGy4v6", label: "Añadirme", external: true },
      { href: "/es/cleaning.html", label: "Limpieza de Fursuit" },
      { href: "/es/whatisafurry.html", label: "¿Qué es un Furry?" },
      { href: "/es/fursonacreation.html", label: "Guía de Fursona" },
      { href: "/es/fursonanamecreation.html", label: "Tutorial de Nombre de Fursona" },
      { href: "/es/about.html", label: "Acerca del Sitio Web" },
    ],
    articles: [
      { href: "/es/howmuchdoesafursuitcost.html", label: "Guía de Precios" },
      { href: "/es/partialvsfullfursuit.html", label: "Parcial vs Completo" },
      { href: "/es/howtogetafursuit.html", label: "Cómo Encargar un Fursuit" },
      { href: "/es/howheavyisafursuit.html", label: "Peso del Fursuit" },
      { href: "/es/highlight.html", label: "Destacado" },
    ],
    articleTitle: "Otros Artículos",
  },
  ja: {
    nav: [
      { href: "/jp/search.html", label: "クリエーターを検索" },
      { href: "https://forms.gle/6boFuotq8T9DGy4v6", label: "追加する", external: true },
      { href: "/jp/cleaning.html", label: "ファーシートのクリーニング" },
      { href: "/jp/whatisafurry.html", label: "ファーリーとは？" },
      { href: "/jp/fursonacreation.html", label: "ファーソナ作成ガイド" },
      { href: "/jp/fursonanamecreation.html", label: "ファーソナの命名チュートリアル" },
      { href: "/jp/about.html", label: "このウェブサイトについて" },
    ],
    articles: [
      { href: "/jp/howmuchdoesafursuitcost.html", label: "ファーシートの価格ガイド" },
      { href: "/jp/partialvsfullfursuit.html", label: "パーシャル vs フル" },
      { href: "/jp/howtogetafursuit.html", label: "ファーシートの commissioned 方法" },
      { href: "/jp/howheavyisafursuit.html", label: "ファーシートの重量" },
      { href: "/jp/highlight.html", label: "ハイライト" },
    ],
    articleTitle: "その他の記事",
  },
};

function detectLocale() {
  const path = window.location.pathname;
  if (path.startsWith("/es/")) return "es";
  if (path.startsWith("/jp/")) return "ja";
  return "en";
}

class SiteSidebar extends HTMLElement {
  static get observedAttributes() {
    return ["collapsed", "collapsible", "logo-src", "bg"];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
    this._shadow.appendChild(template.content.cloneNode(true));

    this._aside = this._shadow.querySelector(".sidebar");
    this._toggle = this._shadow.querySelector("button.toggle");
    this._floatingToggle = this._shadow.querySelector("button.floating-toggle");
    this._logoImg = this._shadow.querySelector(".logo-img");
    this._nav = this._shadow.querySelector("nav");
    this._popupTitle = this._shadow.querySelector(".popup-title");
    this._popupList = this._shadow.querySelector(".popup-list");
    this._langSelect = this._shadow.querySelector(".lang-selector");

    this._isCollapsed = false;
    this._collapsible = false;
    this._boundResize = this._syncResponsiveState.bind(this);
    this._locale = detectLocale();
  }

  connectedCallback() {
    this._collapsible = this.hasAttribute("collapsible");
    this._applyAttributes();
    this._renderNav();

    const saved = this._getSavedCollapsedState();
    const isMobile = window.matchMedia("(max-width: 720px)").matches;

    if (saved !== null) {
      this._setCollapsed(saved, true);
    } else {
      this._setCollapsed(isMobile, true);
    }

    this._toggle.style.display = this._collapsible ? "flex" : "none";

    this._toggle.addEventListener("click", () => this.toggle());
    this._floatingToggle.addEventListener("click", () => this.open());

    this._syncResponsiveState();
    window.addEventListener("resize", this._boundResize);

    // Popup close button
    const popupClose = this._shadow.querySelector(".popup-close");
    popupClose.addEventListener("click", () => this._closePopup());

    // Language selector
    this._langSelect.addEventListener("change", (e) => {
      this._switchLanguage(e.target.value);
    });

    // Set initial selected value
    this._langSelect.value = this._locale;

    requestAnimationFrame(() => this._applyActiveLink());
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this._boundResize);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "collapsed" && oldVal !== newVal) {
      this._setCollapsed(newVal === "true", true);
      this._syncResponsiveState();
    }

    if (name === "collapsible") {
      this._collapsible = this.hasAttribute("collapsible");
      this._toggle.style.display = this._collapsible ? "flex" : "none";
    }

    if (name === "logo-src" || name === "bg") {
      this._applyAttributes();
    }
  }

  _getSavedCollapsedState() {
    try {
      const value = localStorage.getItem(SiteSidebar.STORAGE_KEY);
      if (value === null) return null;
      return value === "true";
    } catch (err) {
      return null;
    }
  }

  _applyAttributes() {
    const logo = this.getAttribute("logo-src");
    const bg = this.getAttribute("bg");

    if (bg) {
      this.style.setProperty("--sidebar-bg", bg);
    }

    if (logo) {
      this._logoImg.src = logo;
      this._logoImg.style.display = "block";
      this._logoImg.onerror = () => {
        this._logoImg.style.display = "none";
      };
    } else {
      this._logoImg.style.display = "none";
    }
  }

  _renderNav() {
    const localeData = LOCALE_NAV[this._locale] || LOCALE_NAV.en;

    this._nav.innerHTML = "";

    // Nav items
    localeData.nav.forEach((item) => {
      const a = document.createElement("a");
      a.className = "nav-link";
      a.href = item.href;
      a.textContent = item.label;

      if (item.external) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }

      this._nav.appendChild(a);
    });

    // Articles popup trigger
    if (localeData.articles && localeData.articles.length > 0) {
      const group = document.createElement("div");
      group.className = "dropdown-group";

      const trigger = document.createElement("button");
      trigger.className = "dropdown-trigger";
      trigger.innerHTML = localeData.articles.length > 1
        ? `${localeData.articleTitle} <span class="chevron">▼</span>`
        : `${localeData.articleTitle}`;

      const popup = this._shadow.querySelector(".popup-overlay");
      const popupList = this._shadow.querySelector(".popup-list");
      const popupTitle = this._shadow.querySelector(".popup-title");

      popupList.innerHTML = "";
      popupTitle.textContent = localeData.articleTitle;

      const localeDir = this._locale === "ja" ? "jp" : this._locale;
      localeData.articles.forEach((article) => {
        const a = document.createElement("a");
        a.className = "popup-item";
        const hasDir = article.href.startsWith("/" + localeDir + "/");
        a.href = hasDir ? article.href : `/${localeDir}${article.href}`;
        a.textContent = article.label;
        popupList.appendChild(a);
      });

      trigger.addEventListener("click", () => this._togglePopup());

      group.appendChild(trigger);
      this._nav.appendChild(group);
    }
  }

  _togglePopup() {
    const popup = this._shadow.querySelector(".popup-overlay");
    const isOpen = popup.classList.toggle("open");
    popup.setAttribute("aria-hidden", String(!isOpen));
    this._shadow.querySelector(".dropdown-trigger").classList.toggle("active", isOpen);
  }

  _closePopup() {
    const popup = this._shadow.querySelector(".popup-overlay");
    popup.classList.remove("open");
    popup.setAttribute("aria-hidden", "true");
    this._shadow.querySelector(".dropdown-trigger").classList.remove("active");
  }

  _switchLanguage(targetLocale) {
    if (targetLocale === this._locale) return;
    window.location.href = this._computeLocalePath(targetLocale);
  }

  _computeLocalePath(targetLocale) {
    const currentPath = window.location.pathname;
    const localePrefix = this._getPrefixForLocale(this._locale);
    const targetPrefix = this._getPrefixForLocale(targetLocale);

    let relativePath;
    if (currentPath.startsWith("/")) {
      relativePath = currentPath.startsWith("/" + localePrefix + "/")
        ? currentPath.slice(localePrefix.length + 1)
        : currentPath;
    } else {
      relativePath = currentPath;
    }

    if (relativePath === "/" || relativePath === "") return "/" + targetPrefix + "/";
    relativePath = relativePath.replace(/^\//, "");
    return (targetPrefix === "" ? "/" : "/" + targetPrefix + "/") + relativePath;
  }

  _getPrefixForLocale(locale) {
    if (locale === "ja") return "jp";
    return locale;
  }

  toggle() {
    if (!this._collapsible) return;
    this._setCollapsed(!this._isCollapsed);
    this._syncResponsiveState();
  }

  open() {
    if (!this._collapsible) return;
    this._setCollapsed(false);
    this._syncResponsiveState();
  }

  _setCollapsed(state, syncGlobal = true) {
    this._isCollapsed = !!state;

    if (this._isCollapsed) {
      this._aside.classList.add("is-collapsed");
      this._closePopup();
      this._toggle.textContent = ">>";
      this._floatingToggle.classList.add("visible");
      if (syncGlobal) document.documentElement.classList.add("site-sidebar-collapsed");
      this.setAttribute("collapsed", "true");
    } else {
      this._aside.classList.remove("is-collapsed");
      this._toggle.textContent = "<<";
      this._floatingToggle.classList.remove("visible");
      if (syncGlobal) document.documentElement.classList.remove("site-sidebar-collapsed");
      this.removeAttribute("collapsed");
    }

    try {
      localStorage.setItem(SiteSidebar.STORAGE_KEY, String(this._isCollapsed));
    } catch (err) {}
  }

  _syncResponsiveState() {
    const collapsed = this._isCollapsed;

    if (collapsed) {
      this._floatingToggle.classList.add("visible");
    } else {
      this._floatingToggle.classList.remove("visible");
    }
  }

  _applyActiveLink() {
    const links = Array.from(this._nav.querySelectorAll("a"));
    const currentPath = window.location.pathname.replace(/\/$/, "") || "/";

    links.forEach((el) => {
      el.classList.remove("active");

      const href = el.getAttribute("href");
      if (!href) return;

      let linkPath = href;

      try {
        linkPath = new URL(href, window.location.origin).pathname.replace(/\/$/, "") || "/";
      } catch (_) {
        linkPath = href.replace(/\/$/, "") || "/";
      }

      if (linkPath === currentPath || el.href === window.location.href) {
        el.classList.add("active");
      }
    });
  }
}

if (!customElements.get("site-sidebar")) {
  customElements.define("site-sidebar", SiteSidebar);
}
