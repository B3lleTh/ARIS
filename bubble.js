// ==========================================================
// GESTIÓN DE VISIBILIDAD UNIFICADA
// ==========================================================

// 1. Obtención de elementos DOM
const upBubble = document.querySelector('.Up-Bubble');        // Burbuja que aparece al hacer scroll
const arisChatPanel = document.getElementById('aris-chat');   // Panel de chat ARIS
const arisCloseButton = document.getElementById('aris-close'); // Botón de cerrar chat
const body = document.body;                                   // Referencia al body
const scrollThreshold = 300;                                  // Scroll mínimo para mostrar burbuja

// --- FUNCIÓN PRINCIPAL: Determina si la burbuja debe mostrarse ---
function checkBubbleVisibility() {
    // A. Comprobar si el chat ARIS está activo
    const isChatActive = arisChatPanel.classList.contains('active');
    
    // B. Comprobar si el usuario ha hecho scroll suficiente
    const hasScrolledDown = window.scrollY > scrollThreshold;
    
    // Mostrar burbuja solo si el chat NO está activo y se hizo scroll suficiente
    if (!isChatActive && hasScrolledDown) {
        upBubble.classList.add('show');   // Añadir clase 'show' para que la burbuja aparezca
    } else {
        upBubble.classList.remove('show'); // Ocultar la burbuja
    }
    
    // Actualizar estado global del body para estilos CSS relacionados con chat abierto
    if (isChatActive) {
        body.classList.add('chat-open');
    } else {
        body.classList.remove('chat-open');
    }
}

// 2. CONEXIÓN DE EVENTOS

// 2a. Verificar visibilidad al hacer scroll
window.addEventListener('scroll', checkBubbleVisibility);
checkBubbleVisibility(); // Verificar estado inicial al cargar la página

// 2b. Escuchar clic en botón de cierre del chat
if (arisCloseButton) {
    arisCloseButton.addEventListener('click', () => {
        // Cierra el chat quitando la clase 'active'
        arisChatPanel.classList.remove('active');
        
        // Actualiza la visibilidad de la burbuja inmediatamente
        checkBubbleVisibility(); 
    });
}

// 2c. Nota: En caso de cambio de botón que abre el chat (ej: 'aris-open-btn'), debería ejecutar:
 /*
const arisOpenButton = document.getElementById('tu-boton-de-apertura');
if (arisOpenButton) {
    arisOpenButton.addEventListener('click', () => {
        arisChatPanel.classList.add('active'); 
        checkBubbleVisibility(); // Actualiza la burbuja al abrir
    });
}
*/
