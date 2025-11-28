/**
 * Lógica para la página de detalle de Ingeniería en Software:
 * Carga de datos de ejercicios de práctica desde practice-data.json
 * y manejo de eventos de botones.
 */

// 1. URL de tu archivo JSON (Asegúrate de que la ruta sea correcta)
const JSON_URL = 'practice-data.json'; 

// Variable global para almacenar los datos de los ejercicios una vez cargados
let practiceData = { exercises: [] };


// --- 2. FUNCIÓN DE CARGA DE DATOS ---
async function fetchPracticeData() {
    try {
        const response = await fetch(JSON_URL);
        if (!response.ok) {
            // Lanza un error si la respuesta HTTP no fue exitosa (ej: 404, 500)
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Convierte la respuesta a objeto JavaScript (JSON)
        const data = await response.json();
        practiceData = data;
    } catch (error) {
        console.error("Could not fetch practice data:", error);
        
        // Actualiza el UI para informar al usuario sobre el error
        const titleElement = document.getElementById('exercise-title');
        const descElement = document.getElementById('exercise-description');

        if (titleElement) titleElement.textContent = 'ERROR: Exercises failed to load.';
        if (descElement) descElement.textContent = 'Please ensure the "practice-data.json" file exists and is accessible. Remember to use a local server (like Live Server) for development!';
        
        // Bloquea cualquier intento de cargar ejercicios
        practiceData = { exercises: [] }; 
    }
}


// --- 3. FUNCIÓN DE RENDERIZADO DEL EJERCICIO ---
function loadExercise(discipline) {
    
    // Verifica que los datos hayan sido cargados
    if (!practiceData || !practiceData.exercises || practiceData.exercises.length === 0) {
        console.warn("Practice data is not available.");
        document.getElementById('exercise-title').textContent = 'Loading or Error...';
        return;
    }
    
    // Encuentra el ejercicio correspondiente a la disciplina
    const exercise = practiceData.exercises.find(e => e.discipline === discipline);
    
    // Manejo de ejercicio no encontrado
    if (!exercise) {
        document.getElementById('exercise-title').textContent = `No ${discipline} exercise available yet.`;
        document.getElementById('exercise-description').textContent = 'We are working to add content for this path soon.';
        document.getElementById('exercise-output').textContent = 'N/A';
        document.getElementById('exercise-time').textContent = 'N/A';
        return;
    }

    // Rellenar la tarjeta del ejercicio con los datos
    document.getElementById('exercise-title').textContent = exercise.title;
    document.getElementById('exercise-description').textContent = exercise.description;
    document.getElementById('exercise-output').textContent = exercise.expected_output;
    document.getElementById('exercise-time').textContent = exercise.time_estimate;
}


// --- 4. FUNCIÓN DE INICIALIZACIÓN (Manejo de Eventos) ---
async function initializePracticeSection() {
    
    // Paso 1: Cargar los datos del JSON de forma asíncrona
    await fetchPracticeData();

    const buttons = document.querySelectorAll('.practice-btn');
    const defaultDiscipline = 'frontend'; 

    // Paso 2: Configurar los eventos de click para los botones
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const discipline = this.dataset.discipline;

            // Actualizar estado 'active' de los botones (estilos CSS)
            buttons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Cargar el ejercicio
            loadExercise(discipline);
        });
    });

    // Paso 3: Cargar el ejercicio por defecto al inicio
    loadExercise(defaultDiscipline);
}


// Ejecuta la inicialización cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initializePracticeSection);
