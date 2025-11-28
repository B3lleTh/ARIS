// ========================================
// FUNCIÓN PARA MOSTRAR EL MODAL
// ========================================
function showModal(type, title, message) {
    const modal = document.getElementById("registration-modal");
    const modalContent = modal.querySelector(".modal-content");
    const modalTitle = modal.querySelector(".modal-title");
    const modalMessage = modal.querySelector(".modal-message");
    const modalIcon = modal.querySelector(".modal-icon");

    // Limpiar clases y establecer el tipo
    modalContent.className = 'modal-content ' + type; 
    
    // Contenido
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // Iconos (usaremos emojis simples por si no tienes librerías de iconos)
    modalIcon.textContent = type === 'success' ? '✅' : '🚫';

    modal.classList.add('active');
}

// ========================================
// FORMULARIO DE REGISTRO 
// ========================================
function initRegisterForm() {
    const form = document.getElementById("registro-form");
    const modal = document.getElementById("registration-modal");
    const closeBtn = document.getElementById("modal-close-btn");
    
    if (!form || !modal) return;

    // Lógica para cerrar el modal
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    // Cierra el modal al hacer clic en el fondo gris
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Bloquea el botón para evitar doble envío
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';

        const data = {
            nombre: document.getElementById("nombre").value,
            email: document.getElementById("email").value,
            carrera: document.getElementById("carrera_interes").value,
            recibir: true 
        };

        try {
            const res = await fetch("http://localhost:3000/api/registro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const json = await res.json();
            
            // 1. Manejo de la Respuesta del Backend
            if (res.ok) { // Status 200-299 (Éxito)
                showModal('success', '¡Registro Exitoso!', json.message);
                form.reset(); // Limpia el formulario solo en caso de éxito

            } else if (res.status === 409) { // Status 409 (Duplicado)
                // 2. ERROR POR CORREO DUPLICADO (ER_DUP_ENTRY)
                showModal('error', '¡Ya estás Registrado!', 'El correo electrónico que ingresaste ya se encuentra en nuestra base de datos.');
            
            } else { // Otros errores del servidor (400, 500, etc.)
                showModal('error', 'Error de Servidor', json.message || 'Ocurrió un error inesperado al registrarte.');
            }

        } catch (error) {
            // 3. ERROR DE RED/CONEXIÓN
            console.error(error);
            showModal('error', 'Error de Conexión', 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.');
            
        } finally {
             // Desbloquea el botón al finalizar, independientemente del resultado
             submitButton.disabled = false;
             submitButton.textContent = 'Registrarme';
        }
    });
}
// Asegúrate de llamar a esta función cuando el DOM esté listo
 initRegisterForm();