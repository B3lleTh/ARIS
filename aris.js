// ========================================
// VARIABLES GLOBALES
// ========================================

// Historial de conversación con ARIS
let conversationHistory = [];

// Instancia de reconocimiento de voz
let recognition = null;

// Estado de escucha de voz activo o no
let isListening = false;

// Estado de cooldown para enviar mensajes
let isOnCooldown = false;

// ========================================
// ELEMENTOS DEL DOM
// ========================================

// Botón que activa el chat de ARIS
const arisTrigger = document.getElementById('aris-trigger');

// Contenedor principal del chat
const arisChat = document.getElementById('aris-chat');

// Botón para cerrar el chat
const arisClose = document.getElementById('aris-close');

// Formulario de envío de mensajes
const arisForm = document.getElementById('aris-form');

// Input de texto para mensajes
const arisInput = document.getElementById('aris-input');

// Botón de enviar mensaje
const arisSendBtn = document.getElementById('aris-send-btn');

// Botón de voz para dictado
const arisVoiceBtn = document.getElementById('aris-voice-btn');

// Contenedor de los mensajes en el chat
const arisMessages = document.getElementById('aris-messages');

// Indicador de "escribiendo..."
const arisTyping = document.getElementById('aris-typing');

// Sección hero principal de la página
const heroSection = document.querySelector('.hero');

// ========================================
// INICIALIZACIÓN
// ========================================

// Ejecutar funciones al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();           // Scroll suave para anclas
    initNavbarActiveState();      // Resaltar sección activa en navbar
    initParallaxEffect();         // Efecto parallax del hero
    initIntersectionObserver();   // Animaciones al hacer scroll
    initRegisterForm();           // Activar formulario de registro
});

// ========================================
// FUNCIONES DE NAVEGACIÓN
// ========================================

// Inicializa scroll suave en enlaces de ancla
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Evita comportamiento por defecto
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',  // Scroll animado
                    block: 'start'       // Alinea al inicio del contenedor
                });
            }
        });
    });
}

// Resalta la sección activa en el navbar según scroll
function initNavbarActiveState() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 200) current = section.getAttribute('id');
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Efecto parallax en hero al mover el mouse
function initParallaxEffect() {
    document.addEventListener('mousemove', (e) => {
        const hero = document.querySelector('.hero-visual');
        if (hero && !arisChat.classList.contains('active')) {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            hero.style.transform = `translate(${x}px, ${y}px)`;
        }
    });
}

// Inicializa animaciones con IntersectionObserver
function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,                  // Umbral de visibilidad
        rootMargin: '0px 0px -100px 0px' // Ajuste para iniciar antes
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';         // Mostrar elemento
                entry.target.style.transform = 'translateY(0)'; // Animación entrada
            }
        });
    }, observerOptions);

    document.querySelectorAll('.purpose-card, .career-card, .slide-card').forEach(el => {
        el.style.opacity = '0';                    // Oculto por defecto
        el.style.transform = 'translateY(30px)';  // Posición inicial para animar
        el.style.transition = 'all 0.6s ease';    // Duración de animación
        observer.observe(el);                      // Observar elemento
    });
}

// ========================================
// ARIS CHAT
// ========================================

// Abrir chat al hacer click
arisTrigger.addEventListener('click', () => openChat());

// Cerrar chat al hacer click
arisClose.addEventListener('click', () => closeChat());

// Función para abrir chat
function openChat() {
    arisChat.classList.add('active');           // Mostrar chat
    heroSection.classList.add('chat-active');   // Ajustar hero
    arisInput.focus();                          // Poner foco en input

    initSpeechRecognition();                     // Activar reconocimiento de voz

    // Mensaje de bienvenida si es primera vez
    if (conversationHistory.length === 0) {
        addMessage('assistant', 'Hi!, I am ARIS, Your AI Assistent. How Can I help You?');
    }
}

// Función para cerrar chat
function closeChat() {
    arisChat.classList.remove('active');        // Ocultar chat
    heroSection.classList.remove('chat-active');// Ajustar hero

    if (recognition) {                          // Detener reconocimiento de voz
        recognition.stop();
        isListening = false;
        arisVoiceBtn.classList.remove('listening');
    }
}

// ========================================
// ENVIAR MENSAJE
// ========================================

// Escuchar submit del formulario
arisForm.addEventListener('submit', async (e) => {
    e.preventDefault();                          // Evita recarga
    const message = arisInput.value.trim();      // Obtener texto
    if (message) {
        await sendMessage(message);              // Enviar mensaje
        arisInput.value = '';                    // Limpiar input
    }
});

// Función principal para enviar mensaje
async function sendMessage(message) {

    if (isOnCooldown) {                          // Verificar cooldown
        addMessage('assistant', 'Debes esperar 2 segundos antes de enviar otro mensaje.');
        return;
    }

    startCooldown();                             // Activar cooldown

    addMessage('user', message);                 // Mostrar mensaje usuario
    conversationHistory.push({ role: 'user', content: message }); // Guardar historial

    showTypingIndicator();                        // Mostrar "escribiendo..."

    try {
        const response = await callGeminiAPI(message); // Llamar a API
        hideTypingIndicator();                    // Ocultar indicador

        addMessage('assistant', response);       // Mostrar respuesta
        conversationHistory.push({ role: 'assistant', content: response }); // Guardar historial

    } catch (error) {
        hideTypingIndicator();
        addMessage('assistant', 'Estais en mantenimiento.');
    }
}

// ========================================
// GEMINI API
// ========================================

// Llamada a backend con mensaje del usuario
async function callGeminiAPI(userMessage) {
    const recentHistory = conversationHistory.slice(-10); // Últimos 10 mensajes

    // ===============================================
    // PROMPT: Personalidad de ARIS
    // ===============================================
    const systemPrompt = `
Eres ARIS, una asistente virtual con personalidad de mentora y consejera educativa enfocada por el momento en ing en software, creada para ayudar a estudiantes y personas en búsqueda de carrera, aunque en este caso lo realcionado al area de la tecnologia o software en general y las cuestiones que lo engloban.

REGLAS CLAVE:
1. Rol y Tono: Eres una mentora experimentada, amigable, positiva y muy alentadora que busca lo mejor para el usuario.
2. Foco: Solo responde preguntas relacionadas con carreras universitarias, elección de universidades, planes de estudio, habilidades profesionales, y toma de decisiones educativas y laborales, tambien con lo realacionado al area de STEM principalmente todo lo que engloba la perte de desarrollo de software, informatica, computacion y redes debe ser tu enfoque principal.
3. Restricción: Si el usuario pregunta algo fuera de tu área de foco (ej. clima, historia general, chistes no relacionados), responde con una frase amigable que reafirme tu rol (ej. "Mi experiencia se centra en mentoría educativa. ¿En qué te puedo ayudar con tu futuro profesional?").
4. Formato: Utiliza negritas, listas y emojis (como 💡, ✨, 🎓) para organizar la información y hacerla fácil de leer.
`;

    // ===============================================
    const payload = {
        systemPrompt, // Prompt con personalidad definida
        history: recentHistory,
        userMessage
    };
    // ===============================================
    try {
        const response = await fetch("http://localhost:3000/api/gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return data.reply?.trim() || "Volvemos pronto. Algo salió mal en la respuesta de la IA.";

    } catch (e) {
        // Manejo de errores de red o backend
        console.error("Error al llamar a la API de Gemini:", e);
        return "Hemos ido a comprar leche. El sitio vuelve cuando regresemos con las galletas.";
    }
}

// ========================================
// UI CHAT
// ========================================

// Agrega mensaje al contenedor de chat
function addMessage(sender, text) {
    const div = document.createElement('div');
    div.classList.add('aris-message', sender); // Clase según remitente
    div.textContent = text;                    // Texto del mensaje
    arisMessages.appendChild(div);             // Insertar en chat
    arisMessages.scrollTop = arisMessages.scrollHeight; // Scroll al final
}

// Mostrar indicador de "escribiendo..."
function showTypingIndicator() {
    arisTyping.style.display = 'flex';
}

// Ocultar indicador de "escribiendo..."
function hideTypingIndicator() {
    arisTyping.style.display = 'none';
}

// ========================================
// VOZ
// ========================================

// Inicializa reconocimiento de voz
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        arisVoiceBtn.style.display = "none"; // Oculta botón si no hay soporte
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "es-ES";

    recognition.onresult = event => {
        arisInput.value = event.results[0][0].transcript; // Colocar texto reconocido
    };

    recognition.onerror = recognition.onend = () => {
        isListening = false;
        arisVoiceBtn.classList.remove("listening"); // Quitar clase visual
    };
}

// Botón de activación de voz
arisVoiceBtn.addEventListener('click', () => {
    if (!recognition) return alert("Tu navegador no soporta reconocimiento de voz.");

    if (isListening) {
        recognition.stop();                   // Detener escucha
    } else {
        recognition.start();                  // Iniciar escucha
        arisVoiceBtn.classList.add("listening");
        isListening = true;
    }
});

// ========================================
// ACCESIBILIDAD
// ========================================

// Enviar mensaje al presionar Enter sin Shift
arisInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        arisForm.dispatchEvent(new Event("submit")); // Disparar submit
    }
});

// Cerrar chat con Escape
document.addEventListener("keydown", e => {
    if (e.key === "Escape" && arisChat.classList.contains("active")) {
        closeChat();
    }
});

// ========================================
// COOLDOWN
// ========================================

// Activar cooldown para evitar spam
function startCooldown() {
    isOnCooldown = true;
    arisSendBtn.disabled = true;
    arisInput.disabled = true;

    setTimeout(() => {
        isOnCooldown = false;
        arisSendBtn.disabled = false;
        arisInput.disabled = false;
    }, 0);
}
