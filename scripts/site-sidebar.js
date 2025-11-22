const template = document.createElement('template');
template.innerHTML = `
  <style>
    
    :host { 
      --sidebar-w: 220px; 
      --sidebar-collapsed-w: 64px; 
      --sidebar-bg: #fff0f7; 
      --color-normal: #ff2b8a;
      --bg-normal: #ffdfee;
      display: block; 
      font-family: 'Inter', Arial, sans-serif;
    }

    
    .sidebar { 
      position: fixed; 
      left: 0; 
      top: 0; 
      bottom: 0; 
      width: var(--sidebar-w); 
      background: var(--sidebar-bg); 
      padding: 18px 12px; 
      box-shadow: 4px 0 12px rgba(0,0,0,0.05); 
      display: flex; 
      flex-direction: column; 
      gap: 16px; 
      z-index: 999; 
      transition: width 0.3s ease, padding 0.3s ease; 
      box-sizing: border-box;
    }

    :host([hidden]) .sidebar { display: none }

    
    .sidebar.collapsed { 
      width: var(--sidebar-collapsed-w); 
      padding: 12px 8px;
      align-items: center;
    }

    
    .sidebar.collapsed nav, 
    .sidebar.collapsed .logo,
    .sidebar.collapsed .foot { 
        display: none !important; 
    }
    
    
    .sidebar.collapsed .toggle-wrap { 
        width: 100%; 
        justify-content: center; 
        margin-top: 10px;
    }

    
    .logo { display: flex; align-items: center; justify-content: center; min-height: 44px; }
    .logo a { display: block; border: none; }
    .logo img { width: 100%; max-width: 180px; height: auto; display: block; }

    
    .toggle-wrap { display: flex; justify-content: flex-end; }
    button.toggle { 
      background: linear-gradient(135deg, #ff3aa6 0%, #ff007f 100%); 
      color: #fff; 
      border: none; 
      cursor: pointer; 
      padding: 0;
      width: 32px;
      height: 32px;
      border-radius: 8px; 
      font-size: 12px; 
      font-weight: bold;
      box-shadow: 0 4px 6px rgba(255, 0, 127, 0.3);
      transition: transform 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    button.toggle:hover { transform: scale(1.05); }

    
    nav { 
      flex: 1; 
      overflow-y: auto; 
      display: flex;
      flex-direction: column;
      gap: 10px; 
      width: 100%;
    }

    
    
    
    ::slotted(a), ::slotted(a:visited) { 
      display: flex !important; 
      align-items: center;
      width: 100%; 
      box-sizing: border-box; 
      
      background-color: var(--bg-normal); 
      color: var(--color-normal) !important;
      
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

    
    ::slotted(a:hover) {
      filter: brightness(0.95); 
    }

    
    ::slotted(a.active) { 
      background-color: var(--color-normal) !important; 
      color: #ffffff !important; 
      box-shadow: 0 4px 12px rgba(255, 43, 138, 0.3);
      font-weight: 700;
    }
    
    
    .foot { margin-top: auto; font-size: 11px; color: rgba(0,0,0,0.4); text-align: center; }
    
    
    .logo-placeholder { width: 100%; height: 40px; background: rgba(0,0,0,0.05); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999; }

    
    @media (max-width: 720px) {
      :host { --sidebar-w: 70px; }
      .logo img, .logo { display: none; } 
      ::slotted(a) { 
        padding: 10px 4px; 
        justify-content: center; 
        font-size: 10px; 
        text-align: center;
      }
    }
  </style>

  <aside class="sidebar" role="complementary">
    <div class="logo">
      <a class="logo-link" href="/">
        <img class="logo-img" src="" alt="Logo" />
      </a>
    </div>

    <div class="toggle-wrap">
      <button class="toggle" title="Alternar menú"><<</button>
    </div>

    <nav>
      <slot></slot>
    </nav>

    <div class="foot" part="footer">© 2025</div>
  </aside>
`;

class SiteSidebar extends HTMLElement {
    static get observedAttributes() { return ['collapsed', 'collapsible', 'logo-src', 'bg']; }

    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'open' });
        this._shadow.appendChild(template.content.cloneNode(true));

        this._aside = this._shadow.querySelector('.sidebar');
        this._toggle = this._shadow.querySelector('button.toggle');
        this._logoImg = this._shadow.querySelector('.logo-img');

        this._isCollapsed = false;
    }

    connectedCallback() {
        this._collapsible = this.hasAttribute('collapsible');
        this._applyAttributes();

        if (this.hasAttribute('collapsed') || this.getAttribute('collapsed') === 'true') {
            this._setCollapsed(true, false);
        }
        this._toggle.style.display = this._collapsible ? 'flex' : 'none';
        this._toggle.addEventListener('click', () => this.toggle());

        const slot = this._shadow.querySelector('slot');
        slot.addEventListener('slotchange', () => this._applyActiveLink());

        
        requestAnimationFrame(() => this._applyActiveLink());
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (name === 'collapsed') this._setCollapsed(newVal === 'true');
        if (name === 'collapsible') {
            this._collapsible = this.hasAttribute('collapsible');
            this._toggle.style.display = this._collapsible ? 'flex' : 'none';
        }
        if (name === 'logo-src' || name === 'bg') this._applyAttributes();
    }

    _applyAttributes() {
        const logo = this.getAttribute('logo-src');
        const bg = this.getAttribute('bg');
        if (bg) this.style.setProperty('--sidebar-bg', bg);

        if (logo) {
            this._logoImg.src = logo;
            this._logoImg.style.display = 'block';
            this._logoImg.onerror = () => { this._logoImg.style.display = 'none'; };
        } else {
            this._logoImg.style.display = 'none';
        }
    }

    toggle() { if (this._collapsible) this._setCollapsed(!this._isCollapsed); }

    _setCollapsed(state, saveClass = true) {
        this._isCollapsed = !!state;
        if (this._isCollapsed) {
            this._aside.classList.add('collapsed');
            this._toggle.textContent = '>>';
            if (saveClass) document.documentElement.classList.add('site-sidebar-collapsed');
            this.setAttribute('collapsed', 'true');
        } else {
            this._aside.classList.remove('collapsed');
            this._toggle.textContent = '<<';
            if (saveClass) document.documentElement.classList.remove('site-sidebar-collapsed');
            this.removeAttribute('collapsed');
        }
    }

    _applyActiveLink() {
        const slot = this._shadow.querySelector('slot');
        const nodes = slot.assignedNodes().filter(n => n.nodeType === Node.ELEMENT_NODE);

        nodes.forEach(el => el.classList.remove('active'));

        const currentPath = window.location.pathname.replace(/\/$/, "") || "/";

        let found = false;

        
        for (const el of nodes) {
            if (el.tagName === 'A') {
                const linkPath = el.getAttribute('href');
                
                if (el.href === window.location.href || linkPath === currentPath || linkPath === window.location.pathname) {
                    el.classList.add('active');
                    found = true;
                    break;
                }
            }
        }

        
    }
}

if (!customElements.get('site-sidebar')) customElements.define('site-sidebar', SiteSidebar);