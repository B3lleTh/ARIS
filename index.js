// ============================
// CARGAR VARIABLES DE ENTORNO
// ============================
require('dotenv').config();
console.log("ENV CARGADO:", process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASS, process.env.DB_NAME);

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
app.get('/api/stats/students', async (req, res) => {
    try {
        const count = await getActiveStudentsCount();
        res.json({ studentsCount: count });
    } catch (error) {
        console.error("❌ Error en la ruta /api/stats/students:", error);
        res.status(500).json({ message: "Error al obtener estadísticas.", studentsCount: 0 });
    }
});

// ==========================
// Registrar usuario
// ==========================
app.post('/api/registro', async (req, res) => {
    const { email, nombre, carrera, recibir } = req.body;

    const sql = `
        INSERT INTO usuarios (email, nombre, carrera_interes, recibir_correos)
        VALUES (?, ?, ?, ?)
    `;
    
    try {
        const [result] = await db.query(sql, [email, nombre, carrera, recibir]); 
        
        res.status(201).json({ 
            success: true,
            message: "Usuario registrado correctamente." 
        });

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
            console.warn(`⚠️ Intento de registro duplicado para: ${email}`);
            return res.status(409).json({ 
                success: false,
                message: "Este correo ya está registrado." 
            });
        }

        console.error("❌ Error desconocido guardando usuario:", err);

        return res.status(500).json({ 
            success: false,
            message: "Error en el servidor al intentar registrar." 
        });
    }
});

// ==========================
// Gemini
// ==========================
app.post('/api/gemini', async (req, res) => {
    const { systemPrompt, history, userMessage } = req.body;

    try {
        let conversationText = systemPrompt + "\n\n";

        history.forEach(msg => {
            conversationText += `${msg.role === "user" ? "Usuario" : "ARIS"}: ${msg.content}\n`;
        });

        conversationText += `Usuario: ${userMessage}\nARIS:`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: conversationText }] }],
                generationConfig: {
                    temperature: 0.65,
                    maxOutputTokens: 600
                }
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
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
