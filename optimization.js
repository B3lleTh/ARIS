document.addEventListener("DOMContentLoaded", function() {
    
    // Selectores para las secciones que deben tener Lazy Loading 
    // (todo lo que está fuera de la vista inicial)
    const sectionsToLazyLoadSelectors = 
        ".advertise-slider, .purpose-section, .who-section, .careers-promo, " +
        ".promo-card-section, .faq-section, .dynamic-cards-section, " +
        ".registro-super, .closure-section, footer";

    // 1. Asignar el atributo nativo loading="lazy" a todas las imágenes fuera del hero
    const allLazyLoadableImages = document.querySelectorAll(sectionsToLazyLoadSelectors + " img");
    
    allLazyLoadableImages.forEach(image => {
        // Aseguramos que el navegador use lazy loading nativo si lo soporta.
        image.setAttribute('loading', 'lazy');
    });

    // 2. Implementación de IntersectionObserver para soporte universal y control preciso
    const imageObserverOptions = {
        root: null,
        rootMargin: "300px", // Aumentamos el margen a 300px para una precarga más temprana y fluida (UX mejor)
        threshold: 0
    };

    // Función que maneja la carga de la imagen
    const loadImage = (image) => {
        // Obtenemos el src original (ya sea del src o del data-src si fue movido)
        const srcToLoad = image.dataset.src || image.src;

        if (srcToLoad && srcToLoad.trim() !== "") {
            image.src = srcToLoad;
            
            // Opcional: cargar srcset si lo usas
            if (image.dataset.srcset) {
                image.srcset = image.dataset.srcset;
            }

            image.classList.remove("lazy");
            image.removeAttribute('data-src');
            image.removeAttribute('loading'); // Limpiamos el atributo nativo después de cargar
        }
    };

    if ("IntersectionObserver" in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    loadImage(image);
                    observer.unobserve(image); // Deja de observar una vez cargada
                }
            });
        }, imageObserverOptions);

        // Procesar y preparar todas las imágenes fuera del hero
        allLazyLoadableImages.forEach(image => {
            const originalSrc = image.src;
            
            if (originalSrc && originalSrc.trim() !== "") {
                // Mueve la ruta original a data-src y vacía el src para evitar la carga inicial
                image.setAttribute('data-src', originalSrc);
                image.removeAttribute('src'); 
                image.classList.add("lazy"); // Mantener la clase para targeting CSS/JS
                imageObserver.observe(image);
            }
        });

    } else {
        // Fallback: Si no hay soporte, cargamos todas las imágenes después del DOMContentLoaded
        console.warn("IntersectionObserver no soportado. Usando Fallback de carga total.");
        allLazyLoadableImages.forEach(loadImage);
    }
});
