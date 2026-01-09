(() => {
    const AFFILIATE_TAG = "iwantafursuit-20";

    const CTA_BY_LANG = {
        es: "¡Lo quiero!",
        en: "Buy now",
        jp: "今すぐ購入"
    };

    const LANG_LABEL = {
        es: "Lo que Recomendamos",
        en: "What We Recommend",
        jp: "おすすめの品"
    };

    
    function detectLang(el) {
        const forced = (el.dataset.lang || "").toLowerCase();
        if (["es", "en", "jp"].includes(forced)) return forced;
        const nav = (navigator.language || navigator.userLanguage || "en").toLowerCase();
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
        const image = el.dataset.image || "";
        const price = el.dataset.price || ""; 
        const link = buildAffiliateLink(el.dataset.url || "#");

        const priceHtml = price ? `<div class="amazon-price">${escapeHtml(price)}</div>` : "";
        const langBadge = `<div class="lang-badge" title="Idioma">${LANG_LABEL[lang] || lang}</div>`;
        const imgHtml = image
            ? `<img src="${image}" alt="${title}" loading="lazy">`
            : `<div style="width:96px;height:96px;border-radius:8px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#bbb">No image</div>`;

        return `
            <div class="card-wrap" role="group" aria-label="${title}">
                ${imgHtml}
                <div class="amazon-info">
                    ${langBadge}
                    <h3>${title}</h3>
                    ${priceHtml}
                    <a class="amazon-cta" href="${link}" target="_blank" rel="nofollow noopener noreferrer">
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