(() => {
    'use strict';

    const config = window.fursuitSiteConfig;
    const key = 'iwaf.analytics.v1';
    const route = location.pathname.replace(/\/index\.html$/, '/');
    const gaId = config.ga4Enabled === true && /^G-[A-Z0-9]+$/.test(config.ga4Id) ? config.ga4Id : '';
    const slotId = Object.hasOwn(config.reviewedAdSlots, route) ? config.reviewedAdSlots[route] : '';
    const adSlot = document.querySelector('article [data-editorial-ad]');
    const adEligible = config.adsEnabled === true && config.siteApproved === true &&
        config.autoAdsDisabled === true && location.hostname === 'iwantafursuit.github.io' &&
        /^ca-pub-\d{16}$/.test(config.publisher) && /^\d+$/.test(slotId) &&
        !document.querySelector('meta[name="robots"][content*="noindex"]') && adSlot;

    let cmpUrl;
    try {
        const candidate = new URL(config.cmpScript);
        if (candidate.protocol === 'https:' && !candidate.username && !candidate.password &&
            !/(^|\.)googlesyndication\.com$/.test(candidate.hostname)) cmpUrl = candidate.href;
    } catch {}

    const denied = {
        analytics_storage: 'denied', ad_storage: 'denied',
        ad_user_data: 'denied', ad_personalization: 'denied'
    };
    window.dataLayer = window.dataLayer || [];
    const gtag = window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('consent', 'default', denied);

    function loadScript(src, onLoad, onError, crossOrigin) {
        const script = document.createElement('script');
        script.async = true;
        script.src = src;
        script.referrerPolicy = 'no-referrer';
        if (crossOrigin) script.crossOrigin = crossOrigin;
        if (onLoad) script.addEventListener('load', onLoad, { once: true });
        if (onError) script.addEventListener('error', onError, { once: true });
        document.head.append(script);
    }

    let analyticsOn = false;
    let analyticsStarted = false;
    let adAllowed = false;
    let adStarted = false;
    let adReady = false;
    let adPaused = false;
    const page = new URL(document.querySelector('link[rel="canonical"]')?.href || route, location.origin);
    page.search = '';
    page.hash = '';
    // Snapshot the static title before a maker profile replaces it with a maker name.
    const pageTitle = document.querySelector('meta[property="og:title"]')?.content || document.title;
    function emit(event, fields = {}) {
        if (analyticsOn) gtag('event', event, {
            ...fields, send_to: gaId, page_location: page.href,
            page_title: pageTitle, page_referrer: ''
        });
    }

    function choice() {
        try { return localStorage.getItem(key); } catch { return null; }
    }

    function renderManualAd() {
        if (!adReady || !adAllowed || adPaused) return;
        if (adSlot.querySelector('ins')) {
            adSlot.hidden = false;
            return;
        }
        const unit = document.createElement('ins');
        unit.className = 'adsbygoogle';
        unit.dataset.adClient = config.publisher;
        unit.dataset.adSlot = slotId;
        unit.dataset.adFormat = 'auto';
        unit.dataset.fullWidthResponsive = 'true';
        adSlot.append(unit);
        adSlot.hidden = false;
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); }
        catch { adSlot.hidden = true; adSlot.replaceChildren(); }
    }

    function applyConsent(analyticsGranted, adsGranted) {
        if (gaId) window['ga-disable-' + gaId] = !analyticsGranted;
        // Stop tags already in memory as well as blocking new events and requests.
        const reload = (analyticsStarted && analyticsOn && !analyticsGranted) || (adStarted && !adsGranted);
        analyticsOn = Boolean(gaId && analyticsGranted);
        adAllowed = adsGranted;
        if (reload) {
            if (adSlot) { adSlot.hidden = true; adSlot.replaceChildren(); }
            location.reload();
            return;
        }

        gtag('consent', 'update', {
            analytics_storage: analyticsGranted ? 'granted' : 'denied',
            ad_storage: adsGranted ? 'granted' : 'denied',
            ad_user_data: adsGranted ? 'granted' : 'denied',
            ad_personalization: adsGranted ? 'granted' : 'denied'
        });

        if (analyticsOn && !analyticsStarted) {
            analyticsStarted = true;
            gtag('js', new Date());
            gtag('config', gaId, {
                send_page_view: false, allow_google_signals: false,
                allow_ad_personalization_signals: false,
                page_location: page.href, page_title: pageTitle, page_referrer: ''
            });
            emit('page_view');
            if (document.querySelector('#content[data-maker-loaded]')) emit('maker_view');
            loadScript('https://www.googletagmanager.com/gtag/js?id=' + gaId);
        }

        if (adEligible && adAllowed && !adPaused && !adStarted) {
            adStarted = true;
            loadScript(
                'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + config.publisher,
                () => { adReady = true; renderManualAd(); },
                undefined,
                'anonymous'
            );
        }
        renderManualAd();
    }

    if (adEligible && cmpUrl) {
        // IAB TCF Google Advertising Products vendor ID 755. Require explicit
        // consent and a completed decision, even where GDPR does not apply.
        let listening = false;
        function connectCmp() {
            if (listening || typeof window.__tcfapi !== 'function') return;
            listening = true;
            window.__tcfapi('addEventListener', 2, (data, ok) => {
                const decided = ok && data?.cmpStatus === 'loaded' && Boolean(data.tcString) &&
                    ['tcloaded', 'useractioncomplete'].includes(data.eventStatus);
                if (adStarted && ok && data?.eventStatus === 'cmpuishown') {
                    adPaused = true;
                    adSlot.hidden = true;
                    return;
                }
                const google = data?.vendor?.consents?.[755] === true;
                const purposes = data?.purpose?.consents;
                const allow = Boolean(decided && google && [1, 3, 4].every(id => purposes?.[id] === true));
                adPaused = false;
                applyConsent(choice() === 'allow', allow);
            });
        }
        const stop = Date.now() + 10000;
        const connect = () => {
            connectCmp();
            if (!listening && Date.now() < stop) setTimeout(connect, 200);
        };
        loadScript(cmpUrl, connect);
    }

    applyConsent(choice() === 'allow', false);
    window.addEventListener('storage', event => {
        if (event.key === key || event.key === null) applyConsent(choice() === 'allow', adAllowed);
    });
    window.addEventListener('pageshow', event => {
        if (event.persisted && adStarted) location.reload();
        else applyConsent(choice() === 'allow', adAllowed);
    });

    const locale = document.documentElement.lang;
    const messages = {
        en: ['Optional analytics', 'Allow analytics', 'Reject analytics', 'Analytics allowed.', 'Analytics off.', 'Advertising preferences'],
        es: ['Analítica opcional', 'Permitir analítica', 'Rechazar analítica', 'Analítica permitida.', 'Analítica desactivada.', 'Preferencias de publicidad'],
        ja: ['任意のアクセス解析', 'アクセス解析を許可', 'アクセス解析を拒否', 'アクセス解析を許可しました。', 'アクセス解析は無効です。', '広告の設定']
    };
    const message = messages[locale] || messages.en;
    const preferences = document.querySelector('[data-privacy-preferences]');
    if (preferences && gaId) {
        preferences.hidden = false;
        preferences.querySelector('legend').textContent = message[0];
        const status = preferences.querySelector('[role="status"]');
        status.textContent = choice() === 'allow' ? message[3] : message[4];
        preferences.querySelectorAll('button').forEach((button, index) => {
            button.textContent = message[index + 1];
            button.addEventListener('click', () => {
                const allowed = index === 0;
                try { localStorage.setItem(key, allowed ? 'allow' : 'deny'); } catch {}
                if (!allowed) {
                    for (const item of document.cookie.split(';')) {
                        const name = item.trim().split('=')[0];
                        if (/^_ga(?:_[A-Z0-9]+)?$/.test(name)) {
                            document.cookie = name + '=; Max-Age=0; Path=/';
                            document.cookie = name + '=; Max-Age=0; Path=/; Domain=' + location.hostname;
                        }
                    }
                }
                status.textContent = allowed ? message[3] : message[4];
                applyConsent(allowed, adAllowed);
            });
        });
    }

    const adPreferences = document.querySelector('[data-ad-preferences]');
    if (adEligible && cmpUrl && adPreferences) {
        adPreferences.textContent = message[5];
        adPreferences.hidden = false;
        adPreferences.addEventListener('click', () => {
            if (adStarted) { adPaused = true; adSlot.hidden = true; }
            if (typeof window.googlefc?.showRevocationMessage === 'function') {
                window.googlefc.showRevocationMessage();
            } else {
                window.dispatchEvent(new Event('iwaf:open-ad-preferences'));
            }
        });
    }

    document.addEventListener('click', event => {
        const link = event.composedPath().find(node => node instanceof HTMLAnchorElement);
        if (link?.hostname && link.hostname !== location.hostname && /^https?:$/.test(link.protocol)) {
            emit('external_link_click');
        }
        const control = event.target.closest?.('[data-site-event]');
        if (control && ['tool_interaction', 'external_form_open'].includes(control.dataset.siteEvent)) {
            emit(control.dataset.siteEvent);
        }
    });
    document.addEventListener('submit', event => {
        if (event.target.matches('[data-site-search]')) emit('directory_search');
    });
    window.addEventListener('iwaf:maker-view', () => emit('maker_view'));
    window.addEventListener('iwaf:filter', () => emit('directory_filter'));
    window.addEventListener('iwaf:search', () => emit('directory_search'));

    const article = document.querySelector('article');
    if (article && 'IntersectionObserver' in window && document.querySelector('[data-article-read]')) {
        const observer = new IntersectionObserver(entries => {
            if (analyticsOn && entries.some(entry => entry.isIntersecting)) {
                emit('article_read');
                observer.disconnect();
            }
        });
        observer.observe(document.querySelector('[data-article-read]'));
    }
})();
