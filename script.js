(function(w, d, t, u, o) {
    w[u] = w[u] || [];
    o.ts = (new Date).getTime();

    var n = d.createElement(t);
    n.src = "https://bat.bing.net/bat.js?ti=" + o.ti + ("uetq" != u ? "&q=" + u : "");
    n.async = 1;
    n.onload = n.onreadystatechange = function() {
        var s = this.readyState;
        if (!s || "loaded" === s || "complete" === s) {
            o.q = w[u];
            w[u] = new UET(o);
            w[u].push("pageLoad");
            n.onload = n.onreadystatechange = null;
        }
    };

    var i = d.getElementsByTagName(t)[0];
    i.parentNode.insertBefore(n, i);
})(window, document, "script", "uetq", {
    ti: "187265698",
    enableAutoSpaTracking: true
});

let currentImageIndex = 0;
let currentGalleryImages = [];
/* let currentLang = 'pt'; */

function updateContent() {
    document.querySelectorAll('[data-pt]').forEach(el => {
        const text = el.getAttribute(`data-${currentLang}`);
        if (text) el.innerHTML = text;
    });

    document.querySelectorAll('[data-placeholder-pt]').forEach(el => {
        const text = el.getAttribute(`data-placeholder-${currentLang}`);
        if (text) el.placeholder = text;
    });

    updateImagesByLanguage(currentLang);
}

function changeLanguage(lang) {
    currentLang = lang;
    updateContent();

    document.querySelectorAll('.lang-pill').forEach(pill => {
        pill.classList.toggle('active', pill.getAttribute('data-lang') === lang);
    });
}

function updateImagesByLanguage(lang) {
    let targetSuffix = 'en';
    if (lang === 'pt') targetSuffix = 'pt';
    else if (lang === 'es') targetSuffix = 'es';

    document.querySelectorAll('.screenshot-grid img').forEach(img => {
        img.src = img.src.replace(
        /_(pt|en|es|fr|de)(\.(png|jpg|jpeg|webp))/i,
        `_${targetSuffix}$2`
        );
    });
}

function openModal(index, galleryId) {
    currentGalleryImages = Array.from(
    document.querySelectorAll(`#${galleryId} img:not(#gallery-dbmoney-youtube img)`)
    );
    currentImageIndex = index;

    const modal = document.getElementById('myModal');
    const modalImg = document.getElementById('img01');

    if (!modal || !modalImg || !currentGalleryImages[currentImageIndex]) return;

    modal.style.display = 'flex';
    modalImg.src = currentGalleryImages[currentImageIndex].src;
    updateCaption();
}

function closeModal() {
    const modal = document.getElementById('myModal');
    if (modal) modal.style.display = 'none';
}

function changeImage(step) {
    if (!currentGalleryImages.length) return;

    currentImageIndex = (currentImageIndex + step + currentGalleryImages.length) % currentGalleryImages.length;

    const modalImg = document.getElementById('img01');
    if (modalImg) modalImg.src = currentGalleryImages[currentImageIndex].src;
    updateCaption();
}

function updateCaption() {
    const caption = document.getElementById('caption');
    const currentImg = currentGalleryImages[currentImageIndex];

    if (!caption || !currentImg) return;

    caption.innerText =
    currentImg.getAttribute(`data-caption-${currentLang}`) ||
    currentImg.alt ||
    '';
}

function openContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) modal.style.display = 'flex';
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) modal.style.display = 'none';
}

function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function checkURLForLanguage() {
    const hash = window.location.hash.replace('#', '');
    const langParam = new URLSearchParams(window.location.search).get('lang');
    const validLangs = ['en', 'pt', 'es', 'fr', 'de'];

    if (validLangs.includes(hash)) currentLang = hash;
    else if (validLangs.includes(langParam)) currentLang = langParam;
}

function updateActiveMenu() {

    const sections = [
        'devbrazil',
        'dbmoney',
        'dbpdf',
        'dbradio',
        'dbnotes'
    ];

    const menuLinks = document.querySelectorAll('.product-nav-links a[href^="#"]');

    const observer = new IntersectionObserver(
        function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const currentId = entry.target.id;
                    menuLinks.forEach(function(link) {
                        link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
                    });
                }
            });
        },
        {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        }
    );

    sections.forEach(function(id) {
        const section = document.getElementById(id);
        if (section) {
            observer.observe(section);
        }
    });
}

window.addEventListener('click' , event => {
    const galleryModal = document.getElementById('myModal');
    if (event.target === galleryModal) closeModal();

    const contactModal = document.getElementById('contactModal');
    if (event.target === contactModal) closeContactModal();
});

document.addEventListener('keydown', event => {
    const modal = document.getElementById('myModal');
    if (!modal || modal.style.display !== 'flex') return;

    if (event.key === 'ArrowLeft') changeImage(-1);
    if (event.key === 'ArrowRight') changeImage(1);
    if (event.key === 'Escape') closeModal();
});

window.addEventListener('load', () => {
    currentLang = 'en';

    const browserLang = navigator.language || navigator.userLanguage || '';
    if (browserLang.startsWith('en')) currentLang = 'en';

    checkURLForLanguage();
    changeLanguage(currentLang);
    updateActiveMenu();
});
