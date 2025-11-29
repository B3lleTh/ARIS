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
  modalContent.className = "modal-content " + type;

  // Establecer contenido del modal
  modalTitle.textContent = title;
  modalMessage.textContent = message;

  // Icono según tipo
  let icon = "❓";
  if (type === "success") icon = "✅";
  else if (type === "error") icon = "⚠️";

  modalIcon.textContent = icon;

  // Mostrar modal
  modal.classList.add("active");
}

// ========================================
// FORMULARIO DE REGISTRO
// ========================================
function initRegisterForm() {
  const form = document.getElementById("registro-form");
  const modal = document.getElementById("registration-modal");
  const closeBtn = document.getElementById("modal-close-btn");

  if (!form || !modal) return;

  // Evitar que se duplique el listener
  if (form.dataset.bound === "true") return;
  form.dataset.bound = "true";

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";

    let email = document.getElementById("email").value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
      .normalize("NFKC");

    const data = {
      nombre: document.getElementById("nombre").value.trim(),
      email: email,
      carrera: document.getElementById("carrera_interes").value.trim(),
      recibir: true
    };

    try {
      const res = await fetch("http://localhost:3000/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.ok) {
        showModal("success", "¡Registro Exitoso!", json.message);
        form.reset();
      } else if (res.status === 409) {
        showModal("error", "¡Ya estás Registrado!", json.message);
      } else {
        showModal("error", "Error de Servidor", json.message);
      }
    } catch (error) {
      console.error(error);
      showModal("error", "Error de Conexión", "No se pudo conectar con el servidor.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Registrarme";
    }
  });
}


// Inicializar
initRegisterForm();
