function setupNavToggle() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (!navToggle || !navLinks) return;

    // 👉 Guardamos la posición para evitar el “scroll jump”
    let scrollPos = 0;

    navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        navToggle.classList.toggle('active', isOpen);

        if (isOpen) {
            // Bloqueo real del scroll (funciona en iPhone)
            scrollPos = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollPos}px`;
            document.body.style.width = "100%";
        } else {
            // Restaurar scroll
            document.body.style.position = "";
            document.body.style.top = "";
            window.scrollTo(0, scrollPos);
        }
    });

    // 👉 Cerrar cuando seleccionas un enlace
    const links = navLinks.querySelectorAll("a");
    links.forEach(link => {
        link.addEventListener("click", () => closeMenu());
    });

    function closeMenu() {
        if (navLinks.classList.contains("open")) {
            navLinks.classList.remove("open");
            navToggle.classList.remove("active");
            
            // Restaurar scroll
            document.body.style.position = "";
            document.body.style.top = "";
            window.scrollTo(0, scrollPos);
        }
    }
}

document.addEventListener("DOMContentLoaded", setupNavToggle);
