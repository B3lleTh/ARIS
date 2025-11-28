function setupNavToggle() {
    const navToggle = document.getElementById('navToggle'); // Botón de menú hamburguesa
    const navLinks = document.getElementById('navLinks');   // Contenedor de los enlaces del nav

    if (!navToggle || !navLinks) return; // Si alguno no existe, salir

    // Guardamos la posición del scroll para evitar el “scroll jump”
    let scrollPos = 0;

    // Evento click sobre el toggle
    navToggle.addEventListener('click', () => {
        // Alterna la clase 'open' en navLinks y 'active' en el toggle
        const isOpen = navLinks.classList.toggle('open');
        navToggle.classList.toggle('active', isOpen);

        if (isOpen) {
            // Bloqueo real del scroll cuando el menú se abre (funciona en iPhone)
            scrollPos = window.scrollY;              // Guardamos la posición actual
            document.body.style.position = "fixed";  // Fija el body para bloquear scroll
            document.body.style.top = `-${scrollPos}px`; // Ajuste para mantener la posición visual
            document.body.style.width = "100%";      // Evita que el contenido se encoge
        } else {
            // Restaurar scroll cuando se cierra
            document.body.style.position = "";
            document.body.style.top = "";
            window.scrollTo(0, scrollPos);           // Vuelve a la posición original
        }
    });

    // Cerrar menú al hacer clic en un enlace
    const links = navLinks.querySelectorAll("a");
    links.forEach(link => {
        link.addEventListener("click", () => closeMenu());
    });

    // Función para cerrar el menú
    function closeMenu() {
        if (navLinks.classList.contains("open")) {
            navLinks.classList.remove("open");    // Quita la clase 'open'
            navToggle.classList.remove("active"); // Quita la clase 'active'

            // Restaurar scroll al cerrar
            document.body.style.position = "";
            document.body.style.top = "";
            window.scrollTo(0, scrollPos);        // Vuelve a la posición guardada
        }
    }
}

// Ejecuta la función cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", setupNavToggle);
