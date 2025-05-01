// script.js - Complete Script with External JSON

document.addEventListener('DOMContentLoaded', () => {
    const langSwitcher = document.querySelector('.lang-switcher');
    const langButtons = langSwitcher ? langSwitcher.querySelectorAll('.lang-button') : [];
    const htmlEl = document.documentElement;
    let translations = {}; // Untuk menyimpan data JSON yang dimuat

    // ---- Fungsi untuk memuat data terjemahan ----
    async function loadTranslations(lang) {
        try {
            const response = await fetch(`lang/${lang}.json?v=${Date.now()}`); // Tambahkan cache busting
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            translations = await response.json();
            console.log(`Translations loaded for: ${lang}`);
        } catch (error) {
            console.error(`Could not load translations for ${lang}:`, error);
            // Fallback atau tampilkan pesan error jika perlu
            translations = {}; // Kosongkan jika gagal load
        }
    }

     // ---- Helper untuk mendapatkan nilai dari key bersarang (opsional tapi berguna) ----
    function getValueFromKey(key, obj) {
         return key.split('.').reduce((o, i) => (o?.[i]), obj);
     }

    // ---- Fungsi untuk mengupdate UI berdasarkan terjemahan ----
    function applyTranslations(lang) {
        if (Object.keys(translations).length === 0) {
            console.warn("No translations loaded, cannot apply.");
            return;
        }

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = getValueFromKey(key, translations) || `[${key}]`; // Tampilkan key jika tidak ditemukan
            element.textContent = translation;
        });

        document.querySelectorAll('[data-i18n-attr]').forEach(element => {
            const attrs = element.getAttribute('data-i18n-attr').split(';'); // Format: "attr1:key1;attr2:key2"
            attrs.forEach(attrPair => {
                const [attrName, key] = attrPair.split(':');
                if (attrName && key) {
                    const translation = getValueFromKey(key.trim(), translations) || '';
                    element.setAttribute(attrName.trim(), translation);
                }
            });
        });
    }

    // ---- Fungsi utama untuk mengganti bahasa (Async) ----
    async function switchLanguage(lang) {
        if (!['id', 'en'].includes(lang)) return;

        // 1. Muat data JSON untuk bahasa yang dipilih
        await loadTranslations(lang);

        // 2. Set atribut lang di <html>
        htmlEl.setAttribute('lang', lang);

        // 3. Terapkan terjemahan ke UI
        applyTranslations(lang);

        // 4. Update tombol bahasa aktif
        langButtons.forEach(button => {
            button.classList.toggle('active', button.getAttribute('data-lang') === lang);
        });

        // 5. Simpan preferensi bahasa
        try {
            localStorage.setItem('preferredLanguage', lang);
        } catch (e) {
            console.warn("Could not save language preference to localStorage.");
        }
    }

    // ---- Event Listener untuk tombol bahasa ----
    if (langButtons.length > 0) {
        langButtons.forEach(button => {
            button.addEventListener('click', () => {
                const selectedLang = button.getAttribute('data-lang');
                if (!button.classList.contains('active')) { // Hanya switch jika belum aktif
                     switchLanguage(selectedLang);
                }
            });
        });
    }

    // ---- Inisialisasi: Cek bahasa tersimpan atau default & muat data awal ----
    async function initializeLanguage() {
        let preferredLanguage = 'id'; // Default
        try {
           const storedLang = localStorage.getItem('preferredLanguage');
           if (storedLang && ['id', 'en'].includes(storedLang)) {
               preferredLanguage = storedLang;
           }
        } catch (e) {
            console.warn("Could not read language preference from localStorage.");
        }
        await switchLanguage(preferredLanguage); // Muat dan terapkan bahasa awal
    }

    initializeLanguage(); // Panggil inisialisasi

    // ----- Mobile Navigation Toggle -----
     const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
     const navMenu = document.querySelector('nav .nav-menu');

     if (mobileNavToggle && navMenu) {
         mobileNavToggle.addEventListener('click', () => {
             navMenu.classList.toggle('mobile-active');
             mobileNavToggle.innerHTML = navMenu.classList.contains('mobile-active') ? '✕' : '☰';
         });
     }

     // ----- Tutup Menu Mobile Saat Link/Tombol Diklik -----
     if (navMenu) {
        const closeMobileMenu = () => {
             if (navMenu.classList.contains('mobile-active')) {
                navMenu.classList.remove('mobile-active');
                if (mobileNavToggle) mobileNavToggle.innerHTML = '☰';
            }
        };
        navMenu.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', closeMobileMenu));
        navMenu.querySelectorAll('.lang-button').forEach(button => button.addEventListener('click', closeMobileMenu));
     }

    // ----- Smooth Scrolling -----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
         anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId.length > 1 && targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            } else if (targetId === '#') {
                 e.preventDefault();
                 window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    // ----- Portfolio Filtering -----
    const filterButtons = document.querySelectorAll('.portfolio-filters .filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-grid .portfolio-item');
    if (filterButtons.length > 0 && portfolioItems.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (button.classList.contains('active')) return;
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const filterValue = button.getAttribute('data-filter');
                portfolioItems.forEach(item => {
                    const itemCategories = item.getAttribute('data-category').split(' ');
                    const matches = filterValue === 'all' || itemCategories.includes(filterValue);
                    item.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                    if (matches) {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            item.style.display = 'grid'; // Atau 'block'
                            requestAnimationFrame(() => {
                                item.style.opacity = '1';
                                item.style.transform = 'scale(1)';
                            });
                        }, 50);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                             if (!item.matches(':hover')) {
                                 item.style.display = 'none';
                             }
                        }, 300);
                    }
                });
            });
        });
         portfolioItems.forEach(item => {
             item.style.display = 'grid'; // Atau 'block'
             item.style.opacity = '1';
             item.style.transform = 'scale(1)';
         });
    }

    // ----- Update Footer Year -----
     const yearSpan = document.getElementById('year');
     if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
     }

}); // Akhir dari DOMContentLoaded