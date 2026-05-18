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

    @media (max-width: 720px) {
      .sidebar {
        width: 260px;
        max-width: 82vw;
      }

      .logo img {
        max-width: 150px;
      }
    }
  </style>

  <button class="floating-toggle" type="button" aria-label="Abrir menú">☰</button>

  <aside class="sidebar" role="complementary" aria-label="Sidebar de navegación">
    <div class="logo">
      <a class="logo-link" href="/">
        <img class="logo-img" src="" alt="Logo" />
      </a>
    </div>

    <div class="toggle-wrap">
      <button class="toggle" type="button" title="Alternar menú" aria-label="Alternar menú"><<</button>
    </div>

    <nav></nav>

    <div class="foot" part="footer">© 2025</div>
  </aside>
`;

const NAV_ITEMS = [
  { href: "search.html", label: "Search Makers" },
  { href: "https://forms.gle/6boFuotq8T9DGy4v6", label: "Add me", external: true },
  { href: "cleaning.html", label: "Fursuit Cleaning" },
  { href: "whatisafurry.html", label: "What is a Furry?" },
  { href: "fursonacreation.html", label: "Fursona Guide" },
  { href: "fursonanamecreation.html", label: "Fursona Name Tutorial" },
  { href: "about.html", label: "About the Website" },
];

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

    this._isCollapsed = false;
    this._collapsible = false;
    this._boundResize = this._syncResponsiveState.bind(this);
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
    this._nav.innerHTML = "";

    NAV_ITEMS.forEach((item) => {
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