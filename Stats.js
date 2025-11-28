/**
 * Módulo de Estadísticas del Frontend (stats.js)
 * Función: Obtener el conteo de estudiantes activos desde el backend y mostrarlo con una animación.
 */

// Espera a que todo el DOM (estructura HTML) esté completamente cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {
    // Intenta obtener el elemento HTML donde se mostrará el conteo (ej. un <h1> o <span>).
    const countElement = document.getElementById('active-students-count');
    
    // Si el elemento no existe en el HTML, detiene la ejecución de la función para evitar errores.
    if (!countElement) return;

    // --- Función para la Animación de Conteo ---
    
    /**
     * Anima visualmente el conteo de un número inicial a un número final.
     * @param {HTMLElement} targetElement - El elemento DOM donde se mostrará el número.
     * @param {number} finalCount - El número final que se debe alcanzar (obtenido del backend).
     */
    function animateCount(targetElement, finalCount) {
        let currentCount = 0; // Inicia el conteo desde cero.
        const duration = 1500; // Duración total de la animación en milisegundos (1.5 segundos).
        const stepTime = 10; // Frecuencia de actualización: se actualizará cada 10ms.

        // Calcula cuánto debe aumentar el número en cada paso para completar la animación 
        // en el tiempo especificado (duración / stepTime). Math.ceil asegura que siempre suba.
        const increment = Math.ceil(finalCount / (duration / stepTime));

        // Inicia un temporizador que ejecutará el código interno repetidamente.
        const timer = setInterval(() => {
            // Aumenta el conteo actual por el valor calculado (incremento).
            currentCount += increment;
            
            // Comprueba si el conteo actual ha alcanzado o superado el conteo final.
            if (currentCount >= finalCount) {
                currentCount = finalCount; // Establece el valor exacto para evitar excederse.
                clearInterval(timer); // Detiene la ejecución repetida del temporizador.
            }
            
            // Actualiza el contenido del elemento HTML con el número actual.
            // toLocaleString('es-ES') añade el separador de miles si el número es grande (ej. 1.234).
            targetElement.textContent = currentCount.toLocaleString('es-ES');
        }, stepTime); // Frecuencia de ejecución del temporizador (cada 10 milisegundos).
    }
    // ------------------------------------------

    // --- Llamada a la API ---
    
    // Inicia una petición (fetch) al endpoint del backend para obtener el conteo.
    fetch('http://localhost:3000/api/stats/students') 
        // Primer paso: Manejar la respuesta. Convierte la respuesta a un objeto Promise.
        .then(response => {
            // Verifica si la respuesta HTTP es exitosa (código 200-299).
            if (!response.ok) {
                // Si la respuesta no es exitosa, lanza un error para pasar al bloque .catch.
                throw new Error('La red falló al obtener los datos');
            }
            // Si es exitosa, parsea el cuerpo de la respuesta como JSON y lo pasa al siguiente .then.
            return response.json();
        })
        // Segundo paso: Manejar los datos JSON resultantes.
        .then(data => {
            // Extrae el conteo del objeto de datos (ej. { studentsCount: 1250 }) y lo convierte a entero.
            const finalCount = parseInt(data.studentsCount);
            
            // Verifica si el número es un número válido (no es NaN) y es mayor que cero.
            if (!isNaN(finalCount) && finalCount > 0) {
                // Si el número es válido, inicia la animación usando el elemento y el conteo final.
                animateCount(countElement, finalCount);
            } else {
                // Si hay un error de conversión o el conteo es 0, muestra '0' como valor de respaldo.
                countElement.textContent = '0';
            }
        })
        // Tercer paso: Captura cualquier error ocurrido durante el fetch o el procesamiento de datos.
        .catch(error => {
            // Muestra el error en la consola del navegador para depuración.
            console.error("Error al cargar el conteo de estudiantes:", error);
            // Muestra "No Disponible" en el elemento HTML para informar al usuario.
            countElement.textContent = 'N/A';
        });
});