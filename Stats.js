// stats.js (o dentro de un bloque <script> en tu HTML)

document.addEventListener('DOMContentLoaded', () => {
    const countElement = document.getElementById('active-students-count');
    if (!countElement) return;

    // --- Función para la Animación de Conteo ---
    function animateCount(targetElement, finalCount) {
        let currentCount = 0;
        const duration = 1500; // Duración de la animación en milisegundos (1.5 segundos)
        const stepTime = 10; // Frecuencia de actualización en milisegundos

        // Calcula cuánto debe aumentar el número en cada paso
        const increment = Math.ceil(finalCount / (duration / stepTime));

        const timer = setInterval(() => {
            currentCount += increment;
            
            if (currentCount >= finalCount) {
                currentCount = finalCount;
                clearInterval(timer); // Detener cuando alcanza el número final
            }
            
            // Usamos toLocaleString para añadir comas si el número es grande (ej: 1,234)
            targetElement.textContent = currentCount.toLocaleString('es-ES');
        }, stepTime);
    }
    // ------------------------------------------

    // --- Llamada a la API ---
    fetch('http://localhost:3000/api/stats/students') 
        .then(response => {
            if (!response.ok) {
                throw new Error('La red falló al obtener los datos');
            }
            return response.json();
        })
        .then(data => {
            const finalCount = parseInt(data.studentsCount);
            
            if (!isNaN(finalCount) && finalCount > 0) {
                // Si el número es válido, inicia la animación
                animateCount(countElement, finalCount);
            } else {
                // Si hay un error o el conteo es 0, muestra 0 o el valor de respaldo
                countElement.textContent = '0';
            }
        })
        .catch(error => {
            console.error("Error al cargar el conteo de estudiantes:", error);
            countElement.textContent = 'N/A'; // Muestra "No Disponible" en caso de error
        });
});