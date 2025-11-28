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
const cors = require("cors");       // Middleware para permitir CORS
const axios = require("axios");     // Cliente HTTP para llamadas externas

// 1. IMPORTACIÓN AJUSTADA: Importamos la conexión a DB y función utilitaria
const { db, getActiveStudentsCount } = require("./db");

// Crear instancia de Express
const app = express();

// Habilitar CORS y JSON parsing
app.use(cors());
app.use(express.json());

// ==========================
// RUTA PRINCIPAL (PARA RENDER)
// ==========================
app.get("/", (req, res) => {
  res.send("Servidor backend funcionando correctamente."); // Simple prueba de salud
});

// ==========================
// RUTA: Obtener Conteo de Estudiantes
// ==========================
app.get("/api/stats/students", async (req, res) => {
  try {
    // Obtener número de estudiantes activos usando función del módulo db
    const count = await getActiveStudentsCount();
    res.json({ studentsCount: count });
  } catch (error) {
    // Manejo de error
    console.error("❌ Error en la ruta /api/stats/students:", error);
    res
      .status(500)
      .json({ message: "Error al obtener estadísticas.", studentsCount: 0 });
  }
});

// ==========================
// RUTA: Registrar usuario
// ==========================
app.post("/api/registro", async (req, res) => {
  // Extraer datos enviados desde el body
  let { email, nombre, carrera, recibir } = req.body;

  // ================================
  // NORMALIZACIÓN DE DATOS
  // ================================
  email = email.trim().toLowerCase(); // Minusculas y sin espacios
  nombre = nombre.trim();
  carrera = carrera.trim();
  recibir = !!recibir; // Garantiza true/false

  // 1. Verificar si ya existe el usuario antes de insertar
  const checkSql = `SELECT email FROM usuarios WHERE email = ?`;

  try {
    const [existingUsers] = await db.query(checkSql, [email]);

    // Si la consulta devuelve resultados, el usuario ya existe
    if (existingUsers && existingUsers.length > 0) {
      console.warn(
        `⚠️ Registro denegado: Email duplicado detectado por SELECT: ${email}`
      );
      return res.status(409).json({
        success: false,
        message: "Este correo ya está registrado.",
      });
    }

    // 2. Inserción del nuevo usuario en la base de datos
    const insertSql = `
            INSERT INTO usuarios (email, nombre, carrera_interes, recibir_correos)
            VALUES (?, ?, ?, ?)
        `;

    const [result] = await db.query(insertSql, [
      email,
      nombre,
      carrera,
      recibir,
    ]);

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente.",
    });
  } catch (err) {
    // Manejo de errores inesperados o de duplicado no detectado
    if (err.code === "ER_DUP_ENTRY" || err.errno === 1062) {
      console.error(
        `❌ Error de duplicado: ${email}. El SELECT no lo detectó.`,
        err
      );
      return res.status(409).json({
        success: false,
        message: "Este correo ya está registrado.",
      });
    }

    // Otros errores graves del servidor
    console.error("❌ Error grave en el servidor durante el registro:", err);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor al intentar registrar.",
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

    conversationText += `Usuario: ${userMessage}\nARIS:`;

    // Llamada a la API de Gemini 
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: conversationText }] }],
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 600,
        },
      }
    );

    // Extraer respuesta del modelo
    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Volvemos pronto. Algo salió mal.";

    res.json({ reply: text });
  } catch (error) {
    // Manejo de errores de la API externa
    console.error("❌ ERROR GEMINI:", error);
    res.json({ reply: "Estamos 🛠️ en mantenimiento." });
  }
});

// ==========================
// INICIAR SERVIDOR
// ==========================
const PORT = process.env.PORT || 3000; // Puerto configurable vía .env
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
