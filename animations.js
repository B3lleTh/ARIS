/**
 * animations.js
 * Implementa animaciones de entrada (Scroll-Reveal) con variedad de efectos.
 */

document.addEventListener("DOMContentLoaded", function() {
    // Configuración: define qué elementos se animarán y con qué tipo de animación
    const sectionsToAnimateConfig = [
        { selector: ".advertise-slider", type: "fade-up" },
        { selector: ".purpose-section", type: "slide-right" },
        { selector: ".who-section", type: "fade-up" },
        { selector: ".careers-promo", type: "slide-left" },
        { selector: ".promo-card-section .promo-card-container:nth-child(1)", type: "zoom-in" },
        { selector: ".promo-card-section .promo-card-container:nth-child(2)", type: "fade-up" },
        { selector: ".faq-section", type: "slide-up" },
        { selector: ".dynamic-cards-section .main-card", type: "slide-left" },
        { selector: ".dynamic-cards-section .secondary-card:nth-of-type(1)", type: "fade-up" },
        { selector: ".dynamic-cards-section .secondary-card:nth-of-type(2)", type: "slide-right" },
        { selector: ".dynamic-cards-section .recruitment-card", type: "zoom-in" },
        { selector: ".registro-super", type: "slide-up" },
        { selector: ".closure-section .team-section", type: "fade-up" },
        { selector: ".closure-section .visual-cta", type: "zoom-in" },
        { selector: "footer", type: "fade-up" }
    ];

    // Array donde guardaremos todos los elementos que vamos a animar
    const elementsToAnimate = [];

    // Paso 1: Asignar un atributo data-animate a cada elemento según la configuración
    sectionsToAnimateConfig.forEach(item => {
        const elements = document.querySelectorAll(item.selector);
        elements.forEach(element => {
            element.setAttribute('data-animate', item.type); // Guarda el tipo de animación
            elementsToAnimate.push(element); // Añade al array de elementos a observar
        });
    });

    // Paso 2: Configurar Intersection Observer para detectar cuando los elementos entran en viewport
    if ("IntersectionObserver" in window) {
        const observerOptions = {
            root: null, // viewport
            rootMargin: "0px 0px -150px 0px", // inicia un poco antes de que el elemento sea visible
            threshold: 0.1 // porcentaje de visibilidad para disparar la animación
        };

        const animateObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    element.classList.add("is-visible"); // Añade clase que dispara animación CSS
                    observer.unobserve(element); // Deja de observar para no repetir animación
                }
            });
        }, observerOptions);

        // Observa cada elemento
        elementsToAnimate.forEach(element => {
            animateObserver.observe(element);
        });
    } else {
        // Fallback: si IntersectionObserver no está soportado, muestra todos los elementos
        console.warn("IntersectionObserver not supported. Scroll-Reveal animations will not apply.");
        elementsToAnimate.forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'none';
        });
    }
});
