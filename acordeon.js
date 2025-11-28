document.addEventListener('DOMContentLoaded', function() {
    const headers = document.querySelectorAll('.accordion-header');

    headers.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const isExpanded = this.getAttribute('aria-expanded') === 'true' || false;

            // Cierra todos los demás acordeones
            document.querySelectorAll('.accordion-header[aria-expanded="true"]').forEach(openHeader => {
                if (openHeader !== this) {
                    openHeader.setAttribute('aria-expanded', 'false');
                    openHeader.nextElementSibling.style.maxHeight = null;
                }
            });

            // Abre o cierra el acordeón actual
            this.setAttribute('aria-expanded', !isExpanded);
            if (!isExpanded) {
                // Si se está abriendo, establece el max-height para mostrar el contenido
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                // Si se está cerrando, establece max-height a 0
                content.style.maxHeight = null;
            }
        });
    });
});