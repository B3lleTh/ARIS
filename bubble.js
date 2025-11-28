// ==========================================================
// JAVASCRIPT CORREGIDO: GESTIÓN DE VISIBILIDAD UNIFICADA
// ==========================================================

// 1. Obtención de Elementos DOM
const upBubble = document.querySelector('.Up-Bubble');
const arisChatPanel = document.getElementById('aris-chat'); 
const arisCloseButton = document.getElementById('aris-close');
const body = document.body;
const scrollThreshold = 300; 

// --- FUNCIÓN CLAVE: Determinar si la burbuja DEBE mostrarse ---
function checkBubbleVisibility() {
    // A. Verifica si el chat de ARIS está abierto (detectando la clase 'active')
    const isChatActive = arisChatPanel.classList.contains('active');
    
    // B. Verifica si el usuario ha hecho scroll suficiente
    const hasScrolledDown = window.scrollY > scrollThreshold;
    
    // La burbuja solo debe mostrarse si NO está activo el chat Y ha hecho scroll.
    if (!isChatActive && hasScrolledDown) {
        upBubble.classList.add('show');
    } else {
        upBubble.classList.remove('show');
    }
    
    // Además, aseguramos el estado 'chat-open' en el body para el CSS global
    if (isChatActive) {
        body.classList.add('chat-open');
    } else {
        body.classList.remove('chat-open');
    }
}

// 2. CONEXIÓN DE EVENTOS

// 2a. Escuchador de eventos de scroll (llama a la función principal)
window.addEventListener('scroll', checkBubbleVisibility);
checkBubbleVisibility(); // Verificar posición inicial

// 2b. Conexión del botón de cierre de ARIS (Asegura la actualización al cerrar)
if (arisCloseButton) {
    arisCloseButton.addEventListener('click', () => {
        // Tu lógica para cerrar el chat (ej. quitar la clase 'active' del panel)
        arisChatPanel.classList.remove('active');
        
        // Ejecuta la verificación inmediatamente después de cerrar
        checkBubbleVisibility(); 
    });
}

// 2c. *CRUCIAL* Modificación en la apertura del chat
// Si el panel de chat se abre con un botón (ej: 'aris-open-btn'), asegúrate de que hace esto:
/*
const arisOpenButton = document.getElementById('tu-boton-de-apertura');
if (arisOpenButton) {
    arisOpenButton.addEventListener('click', () => {
        arisChatPanel.classList.add('active'); 
        checkBubbleVisibility(); // Ejecuta la verificación inmediatamente al abrir
    });
}
*/