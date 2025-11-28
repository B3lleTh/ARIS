/**
 * animations.js
 * Implementa animaciones de entrada (Scroll-Reveal) con variedad de efectos.
 */

document.addEventListener("DOMContentLoaded", function() {
    // Definimos selectores de los contenedores principales a animar
    // y les asignamos un tipo de animación o un patrón rotativo.
    const sectionsToAnimateConfig = [
        { selector: ".advertise-slider", type: "fade-up" },
        { selector: ".purpose-section", type: "slide-right" }, // Nueva
        { selector: ".who-section", type: "fade-up" },
        { selector: ".careers-promo", type: "slide-left" },   // Nueva
        { selector: ".promo-card-section .promo-card-container:nth-child(1)", type: "zoom-in" }, // Nueva
        { selector: ".promo-card-section .promo-card-container:nth-child(2)", type: "fade-up" },
        { selector: ".faq-section", type: "slide-up" },       // Nueva
        { selector: ".dynamic-cards-section .main-card", type: "slide-left" },
        { selector: ".dynamic-cards-section .secondary-card:nth-of-type(1)", type: "fade-up" },
        { selector: ".dynamic-cards-section .secondary-card:nth-of-type(2)", type: "slide-right" },
        { selector: ".dynamic-cards-section .recruitment-card", type: "zoom-in" }, // Tarjeta de feedback
        { selector: ".registro-super", type: "slide-up" },
        { selector: ".closure-section .team-section", type: "fade-up" },
        { selector: ".closure-section .visual-cta", type: "zoom-in" },
        { selector: "footer", type: "fade-up" }
    ];

    const elementsToAnimate = [];

    // Paso 1: Asignar el atributo data-animate a los elementos
    sectionsToAnimateConfig.forEach(item => {
        const elements = document.querySelectorAll(item.selector);
        elements.forEach(element => {
            element.setAttribute('data-animate', item.type);
            elementsToAnimate.push(element);
        });
    });

    // Paso 2: Configurar y ejecutar el Intersection Observer
    if ("IntersectionObserver" in window) {
        const observerOptions = {
            root: null,
            rootMargin: "0px 0px -150px 0px", 
            threshold: 0.1 // Un poco más de threshold para elementos pequeños
        };

        const animateObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    element.classList.add("is-visible");
                    observer.unobserve(element);
                }
            });
        }, observerOptions);

        elementsToAnimate.forEach(element => {
            animateObserver.observe(element);
        });
    } else {
        console.warn("IntersectionObserver not supported. Scroll-Reveal animations will not apply.");
        // Fallback: mostrar todos los elementos si no hay soporte para evitar contenido oculto
        elementsToAnimate.forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'none';
        });
    }
});