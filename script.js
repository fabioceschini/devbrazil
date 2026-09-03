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
    /* updateContactPlaceholders(language); */

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
    // O idioma correto já vem definido no <html lang="..."> de cada
    // página gerada (en, pt-BR, es, fr, de). Usamos isso como fonte
    // da verdade em vez de forçar 'en' ou depender do navegador,
    // para que o pill de idioma ativo bata com a página realmente
    // carregada (importante nas páginas /pt/, /es/, /fr/, /de/).
    const htmlLang = (document.documentElement.lang || 'en').toLowerCase();
    currentLang = htmlLang.startsWith('pt') ? 'pt' : htmlLang.slice(0, 2);

    checkURLForLanguage(); // permite forçar via #hash ou ?lang= ao testar
    changeLanguage(currentLang);
    updateActiveMenu();
});



/* =========================================
   CONTACT MODAL
========================================= */

const contactButton = document.getElementById('contactButton');
const contactModal = document.getElementById('contactModal');
const contactClose = document.getElementById('contactClose');
const contactForm = document.getElementById('contactForm');
const contactName = document.getElementById('contactName');
const contactEmail = document.getElementById('contactEmail');
const contactMessage = document.getElementById('contactMessage');
const contactSend = document.getElementById('contactSend');
const contactStatus = document.getElementById('contactStatus');
const contactLink = document.getElementById('contactLink');
const contactLink2 = document.getElementById('contactLink2');
/* URL DO CLOUDFLARE WORKER */
const CONTACT_WORKER_URL = 'https://devbrazil-contact.fabioceschini.workers.dev/';


function openContactModal() {
    if (!contactModal) { return; }

    contactModal.classList.add('show');
    document.body.style.overflow = 'hidden';

    setTimeout( () => { if (contactName) { contactName.focus(); } }, 100 );
}

function closeContactModal() {
    if (!contactModal) { return; }

    contactModal.classList.remove('show');
    document.body.style.overflow = '';
}

if (contactButton) {
    contactButton.addEventListener( 'click', openContactModal );
}

if (contactClose) {
    contactClose.addEventListener( 'click', closeContactModal );
}

if (contactModal) {
    contactModal.addEventListener( 'click', (event) => { if ( event.target === contactModal ) { closeContactModal(); } } );
}

document.addEventListener( 
    'keydown', (event) => { if ( event.key === 'Escape' && contactModal && contactModal.classList.contains('show') ) { closeContactModal(); } }
);

if (contactForm) {
    contactForm.addEventListener(
        'submit',
        async (event) => {

            event.preventDefault();

            const name = contactName .value .trim();
            const email = contactEmail .value .trim();
            const message = contactMessage .value .trim();
            const origin = 'Site';

            /* Validação adicional */
            if ( !name || !email || !message ) {
                contactStatus.textContent = 'Please complete all fields.';
                contactStatus.className = 'contact-status error';
                return;
            }

            /* Estado de envio */
            contactSend.disabled = true;
            contactStatus.textContent = 'Sending...';
            contactStatus.className = 'contact-status';

            try {
                const response =
                    await fetch(
                        CONTACT_WORKER_URL,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify( { name: name, email: email, message: message, origin: origin } )
                        }
                    );

                /* Tenta obter resposta JSON */
                let data;
                try { data = await response.json(); } catch { data = {}; }
                
                /* Erro retornado pelo Worker */
                if (!response.ok) { throw new Error( data.error || 'Unable to send the message.' ); }

                /* Sucesso */
                contactStatus.textContent = 'Message sent successfully!';
                contactStatus.className = 'contact-status success';
                contactForm.reset();

                /* Fecha após 2 segundos */
                setTimeout( () => { 
                    closeContactModal(); 
                    contactStatus.textContent = ''; },
                    2000
                );

            } catch (error) {
                console.error( 'CONTACT_ERROR:', error );
                contactStatus.textContent = error.message || 'Unable to send the message. Please try again later.';
                contactStatus.className = 'contact-status error';
            } finally { contactSend.disabled = false; }
        }
    );
}

if (contactLink) {
    contactLink.addEventListener( 'click', (event) => { event.preventDefault(); openContactModal(); } );
}

if (contactLink2) {
    contactLink2.addEventListener( 'click', (event) => { event.preventDefault(); openContactModal(); } );
}