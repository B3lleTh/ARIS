// ============================
// CARGAR VARIABLES DE ENTORNO
// ============================
// Carga las variables definidas en el archivo .env al process.env
require("dotenv").config();

// Verificación rápida en consola de las variables cargadas
console.log(
  "ENV CARGADO:",
  process.env.DB_HOST,
  process.env.DB_USER,
  process.env.DB_PASS,
  process.env.DB_NAME
);

// ============================
// IMPORTS
// ============================
const express = require("express"); // Framework web para Node.js
const cors = require("cors"); // Middleware para permitir CORS
const axios = require("axios"); // Cliente HTTP para llamadas externas
// 1. IMPORTACIÓN AJUSTADA: Importamos la conexión a DB y función utilitaria
const { db, getActiveStudentsCount } = require("./db");

// Crear instancia de Express
const app = express();

// Habilitar CORS y JSON parsing
app.use(cors());
app.use(express.json());

// ==========================
// PRINCIPAL (PARA RENDER)
// ==========================
app.get("/", (req, res) => {
  res.send("Servidor backend funcionando correctamente."); // Simple prueba de salud
});

// ==========================
// Obtener Conteo de Estudiantes
// ==========================
app.post("/api/registro", async (req, res) => {
  try {
    let { nombre, email, carrera, recibir } = req.body;

    // 1. NORMALIZACIÓN REAL DEL EMAIL
    email = email
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")       // elimina espacios normales e invisibles
      .normalize("NFKC");        // normaliza unicode

    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Email inválido" });
    }

    // 2. VALIDAR DUPLICADO CORRECTAMENTE
    const [existing] = await db.execute(
      "SELECT id FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Este correo ya está registrado."
      });
    }

    // 3. INSERTAR REGISTRO
    await db.execute(
      "INSERT INTO usuarios (nombre, email, carrera_interes, recibir) VALUES (?, ?, ?, ?)",
      [nombre, email, carrera, recibir]
    );

    return res.status(200).json({
      message: "Registro exitoso."
    });

  } catch (error) {
    console.error("ERROR REGISTRO:", error);

    // 4. Detectar duplicados por constraint del MySQL
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Este correo ya estaba registrado."
      });
    }

    return res.status(500).json({
      message: "Error interno del servidor."
    });
  }
});



// ==========================
// Gemini
// ==========================
app.post("/api/gemini", async (req, res) => {
  const { systemPrompt, history, userMessage } = req.body;

  try {
    // Construye la conversación para enviar al modelo
    let conversationText = systemPrompt + "\n\n";

    history.forEach((msg) => {
      conversationText += `${msg.role === "user" ? "Usuario" : "ARIS"}: ${
        msg.content
      }\n`;
    });

    conversationText += `Usuario: ${userMessage}\nARIS:`; // Llamada a la API de Gemini

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: conversationText }] }],
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 600,
        },
      }
    ); // Extraer respuesta del modelo

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Vuelve a Intentarlo, intenta volver a plantear la pregunta o duda";

    res.json({ reply: text });
  } catch (error) {
    // Manejo de errores de la API externa
    console.error("ERROR GEMINI:", error);
    res.json({ reply: "Estamos en mantenimiento." });
  }
});

// ==========================
// INICIAR SERVIDOR
// ==========================
const PORT = process.env.PORT || 3000; // Puerto configurable vía .env
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
