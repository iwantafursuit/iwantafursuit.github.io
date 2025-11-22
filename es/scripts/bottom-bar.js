
(function () {
    const tpl = `
        <div class="bb-inner">
            <div class="bb-legal-wrap" aria-hidden="false">
                <div class="bb-legal" role="navigation" aria-label="Enlaces legales">
                    <a href="privacy.html">Política de privacidad (RGPD)</a>
                    <a href="cookies.html">Política de cookies</a>
                    <a href="terms.html">Términos y condiciones</a>
                    <a href="legal.html">Aviso legal</a>
                </div>
                <div class="bb-legal-fade bb-legal-fade-left" aria-hidden="true"></div>
                <div class="bb-legal-fade bb-legal-fade-right" aria-hidden="true"></div>
            </div>

            <div class="bb-donate">
                <a id="bbDonateLink" class="bb-donate-link" href="#" target="_blank" rel="noopener noreferrer" aria-label="Donar mediante PayPal">Apoyar web con PayPal</a>
            </div>
        </div>
    `;

    const css = `
        .donate-bar-bundle {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 60;
            box-shadow: 0 -6px 20px rgba(0,0,0,0.06);
            font-family: Inter, Arial, sans-serif;
            background: #ffdfee;
            color: #ff2b8a;
            padding: 10px 14px;
        }

        .donate-bar-bundle .bb-inner {
            display: flex;
            gap: 12px;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
        }

        .bb-legal-wrap {
            position: relative;
            flex: 1 1 auto;
            min-width: 0;
        }

        .bb-legal {
            display: flex;
            gap: 12px;
            overflow-x: auto;
            white-space: nowrap;
            padding-bottom: 4px;
            scrollbar-width: none; /* Firefox */
        }
        .bb-legal::-webkit-scrollbar { display: none; } /* Chrome/Safari */

        .bb-legal a {
            display: inline-block;
            padding: 6px 10px;
            font-weight: 600;
            font-size: 13px;
            color: #334155;
            text-decoration: none;
            border-radius: 8px;
            background: rgba(255,255,255,0.6);
        }

        
        .bb-legal-fade {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 44px;
            pointer-events: none;
            opacity: 0;
            transition: opacity .18s ease;
        }
        .bb-legal-fade-left {
            left: 0;
            background: linear-gradient(to right, rgba(255,223,238,1), rgba(255,223,238,0));
        }
        .bb-legal-fade-right {
            right: 0;
            background: linear-gradient(to left, rgba(255,223,238,1), rgba(255,223,238,0));
        }
        .bb-legal-wrap.fades .bb-legal-fade { opacity: 1; }
        .bb-legal-wrap.fades .bb-legal-fade-left.hidden,
        .bb-legal-wrap.fades .bb-legal-fade-right.hidden { opacity: 0; }

        
        .bb-donate { flex: 0 0 auto; margin-left: 12px; }
        .bb-donate-link {
            display: inline-block;
            padding: 9px 14px;
            font-weight: 800;
            font-size: 14px;
            border-radius: 12px;
            text-decoration: none;
            background: #ff2b8a;
            color: #ffffff;
            box-shadow: 0 6px 18px rgba(255,43,138,0.12);
            white-space: nowrap;
        }

        
        @media (max-width: 700px) {
            .donate-bar-bundle { padding: 10px 10px; }
            .bb-legal a { font-size: 13px; padding: 6px 8px; }
            .bb-donate-link { font-size: 16px; padding: 12px 16px; border-radius: 14px; }
            .bb-legal-fade { width: 56px; }
        }

        
        @media (max-width: 420px) {
            .bb-legal a { font-size: 12px; padding: 6px 8px; }
        }
    `;

    
    function injectCSS() {
        if (document.getElementById('bottom-bar-styles')) return;
        const s = document.createElement('style');
        s.id = 'bottom-bar-styles';
        s.textContent = css;
        document.head.appendChild(s);
    }

    
    function updateFades(wrapper) {
        if (!wrapper) return;
        const legal = wrapper.querySelector('.bb-legal');
        const leftFade = wrapper.querySelector('.bb-legal-fade-left');
        const rightFade = wrapper.querySelector('.bb-legal-fade-right');

        if (!legal || !leftFade || !rightFade) return;

        
        if (legal.scrollWidth <= legal.clientWidth + 1) {
            wrapper.classList.remove('fades');
            leftFade.classList.add('hidden');
            rightFade.classList.add('hidden');
            return;
        }

        wrapper.classList.add('fades');
        
        if (legal.scrollLeft > 2) leftFade.classList.remove('hidden'); else leftFade.classList.add('hidden');
        
        if (legal.scrollLeft + legal.clientWidth < legal.scrollWidth - 2) rightFade.classList.remove('hidden'); else rightFade.classList.add('hidden');
    }
    
    function createBar(options = {}) {
        injectCSS();
        const existing = document.getElementById('donate-bar-bundle');
        if (existing) {
            if (options.donateUrl) {
                const d = existing.querySelector('#bbDonateLink');
                if (d) d.href = options.donateUrl;
            }
            const wrap = existing.querySelector('.bb-legal-wrap');
            updateFades(wrap);
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.id = 'donate-bar-bundle';
        wrapper.className = 'donate-bar-bundle';
        wrapper.innerHTML = tpl;
        document.body.appendChild(wrapper);
        
        if (options.donateUrl) {
            const d = wrapper.querySelector('#bbDonateLink');
            if (d) d.href = options.donateUrl;
        }
        
        const legal = wrapper.querySelector('.bb-legal');
        const legalWrap = wrapper.querySelector('.bb-legal-wrap');

        // actualizar fades al hacer scroll
        if (legal) {
            legal.addEventListener('scroll', function () { updateFades(legalWrap); });
        }
        
        window.addEventListener('resize', function () { updateFades(legalWrap); });
        
        legal.addEventListener('focus', function () { updateFades(legalWrap); });
        
        setTimeout(function () { updateFades(legalWrap); }, 120);
    }

    
    window.bottomBar = {
        init: function (opts) {
            const options = opts || {};
            createBar(options);
        },
        setDonateUrl: function (url) {
            const el = document.getElementById('bbDonateLink');
            if (el) el.href = url || '#';
            if (!document.getElementById('donate-bar-bundle')) {
                createBar({ donateUrl: url });
            }
        }
    };
    
    function autoInit() {
        createBar({ donateUrl: 'https://paypal.me/DavidGarcia343881' });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }
})();
