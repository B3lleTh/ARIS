// ============================
// CARGAR VARIABLES DE ENTORNO
// ============================
require("dotenv").config();
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
const express = require("express");
const cors = require("cors");
const axios = require("axios");

// 1. IMPORTACIÓN AJUSTADA: Importamos la conexión (db) y la función de conteo
const { db, getActiveStudentsCount } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// ==========================
// RUTA PRINCIPAL (PARA RENDER)
// ==========================
app.get("/", (req, res) => {
  res.send("Servidor backend funcionando correctamente.");
});

// ==========================
// RUTA: Obtener Conteo de Estudiantes
// ==========================
app.get("/api/stats/students", async (req, res) => {
  try {
    const count = await getActiveStudentsCount();
    res.json({ studentsCount: count });
  } catch (error) {
    console.error("❌ Error en la ruta /api/stats/students:", error);
    res
      .status(500)
      .json({ message: "Error al obtener estadísticas.", studentsCount: 0 });
  }
});

// ==========================
// Registrar usuario (SOLUCIÓN IMPLEMENTADA)
// ==========================
app.post("/api/registro", async (req, res) => {
  // Desestructuramos los datos del body
  let { email, nombre, carrera, recibir } = req.body;

  // ================================
  // NORMALIZACIÓN
  // ================================
  email = email.trim().toLowerCase();
  nombre = nombre.trim();
  carrera = carrera.trim();
  recibir = !!recibir; // Asegura que sea true/false

  // 1. PASO CLAVE: CONSULTA SELECT para verificar existencia (Ignora la restricción UNIQUE)
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

    // 2. Si no existe, procede a la INSERCIÓN
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

    res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente.",
    });
  } catch (err) {
    // En este punto, solo se llega si hay un error de conexión, sintaxis SQL, o un error inesperado.

    // Mantenemos la lógica de 409 por si acaso la restricción UNIQUE del email sigue activa
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

    // Otros errores del servidor
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
    let conversationText = systemPrompt + "\n\n";

    history.forEach((msg) => {
      conversationText += `${msg.role === "user" ? "Usuario" : "ARIS"}: ${
        msg.content
      }\n`;
    });

    conversationText += `Usuario: ${userMessage}\nARIS:`;

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

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Volvemos pronto. Algo salió mal.";

    res.json({ reply: text });
  } catch (error) {
    console.error("❌ ERROR GEMINI:", error);
    res.json({ reply: "Estas 🛠️ en mantenimiento." });
  }
});

// ==========================
// INICIAR SERVIDOR
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
