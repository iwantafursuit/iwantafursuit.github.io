(() => {
    const AFFILIATE_TAG = "iwantafursuit-20";

    const CTA_BY_LANG = {
        es: "Ir a amazon",
        en: "Buy on amazon",
        jp: "今すぐ購入"
    };

    const LANG_LABEL = {
        es: "Enlace de afiliado",
        en: "Affiliate link",
        jp: "アフィリエイトリンク"
    };

    
    function detectLang(el) {
        const forced = (el.dataset.lang || "").toLowerCase();
        if (["es", "en", "jp"].includes(forced)) return forced;
        const nav = document.documentElement.lang.toLowerCase();
        if (nav.startsWith("es")) return "es";
        if (nav.startsWith("ja")) return "jp";
        return "en";
    }

    
    function buildAffiliateLink(originalUrl) {
        try {
            const url = new URL(originalUrl);
            url.searchParams.set("tag", AFFILIATE_TAG);
            return url.toString();
        } catch {
            return originalUrl;
        }
    }

    function escapeHtml(s) {
        return String(s || "").replace(/[&<>"']/g, m =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": "&#39;" }[m])
        );
    }

    
    function createCardHtml(el) {
        const lang = detectLang(el);
        const title = escapeHtml(el.dataset.title || "Ver producto");
        const link = buildAffiliateLink(el.dataset.url || "#");

        const langBadge = `<div class="lang-badge">${LANG_LABEL[lang] || lang}</div>`;

        return `
            <div class="card-wrap" role="group" aria-label="${title}">
                <div class="amazon-info">
                    ${langBadge}
                    <h3>${title}</h3>
                    <a class="amazon-cta" href="${escapeHtml(link)}" target="_blank" rel="sponsored nofollow noopener noreferrer">
                        ${CTA_BY_LANG[lang] || CTA_BY_LANG.en}
                    </a>
                </div>
            </div>
        `;
    }

    function init() {
        const nodes = document.querySelectorAll(".amazon-card");
        nodes.forEach(el => {
            el.innerHTML = createCardHtml(el);
            el.style.opacity = "1";
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
