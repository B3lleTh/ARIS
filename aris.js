// ========================================
// VARIABLES GLOBALES
// ========================================
let conversationHistory = [];
let recognition = null;
let isListening = false;
let isOnCooldown = false;

// ========================================
// ELEMENTOS DEL DOM
// ========================================
const arisTrigger = document.getElementById('aris-trigger');
const arisChat = document.getElementById('aris-chat');
const arisClose = document.getElementById('aris-close');
const arisForm = document.getElementById('aris-form');
const arisInput = document.getElementById('aris-input');
const arisSendBtn = document.getElementById('aris-send-btn');
const arisVoiceBtn = document.getElementById('aris-voice-btn');
const arisMessages = document.getElementById('aris-messages');
const arisTyping = document.getElementById('aris-typing');
const heroSection = document.querySelector('.hero');

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initNavbarActiveState();
    initParallaxEffect();
    initIntersectionObserver();
    initRegisterForm(); // <<< ACTIVAMOS FORMULARIO DE REGISTRO
});

// ========================================
// FUNCIONES DE NAVEGACIÓN
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

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

function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.purpose-card, .career-card, .slide-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// ========================================
// ARIS CHAT
// ========================================
arisTrigger.addEventListener('click', () => openChat());
arisClose.addEventListener('click', () => closeChat());

function openChat() {
    arisChat.classList.add('active');
    heroSection.classList.add('chat-active');
    arisInput.focus();

    initSpeechRecognition();

    if (conversationHistory.length === 0) {
        addMessage('assistant', 'Hi!, I am ARIS, Your AI Assistent. How Can I help You?');
    }
}

function closeChat() {
    arisChat.classList.remove('active');
    heroSection.classList.remove('chat-active');

    if (recognition) {
        recognition.stop();
        isListening = false;
        arisVoiceBtn.classList.remove('listening');
    }
}

// ========================================
// ENVIAR MENSAJE
// ========================================
arisForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = arisInput.value.trim();
    if (message) {
        await sendMessage(message);
        arisInput.value = '';
    }
});

async function sendMessage(message) {

    if (isOnCooldown) {
        addMessage('assistant', 'Debes esperar 2 segundos antes de enviar otro mensaje.');
        return;
    }

    startCooldown();

    addMessage('user', message);
    conversationHistory.push({ role: 'user', content: message });

    showTypingIndicator();

    try {
        const response = await callGeminiAPI(message);
        hideTypingIndicator();

        addMessage('assistant', response);
        conversationHistory.push({ role: 'assistant', content: response });

    } catch (error) {
        hideTypingIndicator();
        addMessage('assistant', 'Estais en mantenimiento.');
    }
}

// ========================================
// GEMINI API
// ========================================
async function callGeminiAPI(userMessage) {
    const recentHistory = conversationHistory.slice(-10);

    // ===============================================
    // PROMPT:Personalidad de ARIS 
    // ===============================================
    const systemPrompt = `
Eres ARIS, una asistente virtual con personalidad de mentora y consejera educativa enfocada por el momento en ing en software, creada para ayudar a estudiantes y personas en búsqueda de carrera, aunque en este caso lo realcionado al area de la tecnologia o software en general y las cuestiones que lo engloban.

REGLAS CLAVE:
1. **Rol y Tono:** Eres una mentora experimentada, amigable, positiva y muy alentadora.
2. **Foco:** Solo responde preguntas relacionadas con carreras universitarias, elección de universidades, planes de estudio, habilidades profesionales, y toma de decisiones educativas y laborales.
3. **Restricción:** Si el usuario pregunta algo fuera de tu área de foco (ej. clima, historia general, chistes no relacionados), responde con una frase amigable que reafirme tu rol (ej. "Mi experiencia se centra en mentoría educativa. ¿En qué te puedo ayudar con tu futuro profesional?").
4. **Formato:** Utiliza negritas, listas y emojis (como 💡, ✨, 🎓) para organizar la información y hacerla fácil de leer.
`;

    // ===============================================
    const payload = {
        systemPrompt, // Se pasa el prompt con la personalidad definida
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
        // Manejo de errores de red o del servidor backend (código 500, 404)
        console.error("Error al llamar a la API de Gemini:", e);
        return "Hemos ido a comprar leche. El sitio vuelve cuando regresemos con las galletas.";
    }
}

// ========================================
// UI CHAT
// ========================================
function addMessage(sender, text) {
    const div = document.createElement('div');
    div.classList.add('aris-message', sender);
    div.textContent = text;
    arisMessages.appendChild(div);
    arisMessages.scrollTop = arisMessages.scrollHeight;
}

function showTypingIndicator() {
    arisTyping.style.display = 'flex';
}

function hideTypingIndicator() {
    arisTyping.style.display = 'none';
}

// ========================================
// VOZ
// ========================================
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        arisVoiceBtn.style.display = "none";
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "es-ES";

    recognition.onresult = event => {
        arisInput.value = event.results[0][0].transcript;
    };

    recognition.onerror = recognition.onend = () => {
        isListening = false;
        arisVoiceBtn.classList.remove("listening");
    };
}

arisVoiceBtn.addEventListener('click', () => {
    if (!recognition) return alert("Tu navegador no soporta reconocimiento de voz.");

    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
        arisVoiceBtn.classList.add("listening");
        isListening = true;
    }
});

// ========================================
// ACCESIBILIDAD
// ========================================
arisInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        arisForm.dispatchEvent(new Event("submit"));
    }
});

document.addEventListener("keydown", e => {
    if (e.key === "Escape" && arisChat.classList.contains("active")) {
        closeChat();
    }
});

// ========================================
// COOLDOWN
// ========================================
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
