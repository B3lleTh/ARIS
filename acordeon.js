// Espera a que el DOM esté completamente cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', function() {

    // Selecciona todos los elementos que tienen la clase 'accordion-header'
    const headers = document.querySelectorAll('.accordion-header');

    // Itera sobre cada header de acordeón
    headers.forEach(header => {
        header.addEventListener('click', function() {
            
            // El siguiente elemento hermano del header será el contenido del acordeón
            const content = this.nextElementSibling;

            // Verifica si el acordeón está actualmente abierto
            const isExpanded = this.getAttribute('aria-expanded') === 'true' || false;

            // Cierra todos los demás acordeones que estén abiertos
            document.querySelectorAll('.accordion-header[aria-expanded="true"]').forEach(openHeader => {
                if (openHeader !== this) { // Ignora el header que se está clicando
                    openHeader.setAttribute('aria-expanded', 'false'); // Marcar como cerrado
                    openHeader.nextElementSibling.style.maxHeight = null; // Ocultar contenido
                }
            });

            // Alterna el estado del acordeón actual
            this.setAttribute('aria-expanded', !isExpanded);

            if (!isExpanded) {
                // Si se está abriendo, ajusta el max-height para mostrar el contenido suavemente
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                // Si se está cerrando, establece max-height a 0 para ocultar
                content.style.maxHeight = null;
            }
        });
    });
});
