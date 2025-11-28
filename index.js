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
// RUTA: Obtener Conteo de Estudiantes
// ==========================
app.get('/api/stats/students', async (req, res) => {
    try {
        // Llama a la función asíncrona que consulta la base de datos
        const count = await getActiveStudentsCount();

        // Envía el número como una respuesta JSON
        res.json({ studentsCount: count });
        
    } catch (error) {
        console.error("❌ Error en la ruta /api/stats/students:", error);
        // Respuesta de error estándar en caso de fallo de DB
        res.status(500).json({ message: "Error al obtener estadísticas.", studentsCount: 0 });
    }
});


// ==========================
// Registrar usuario (MANEJO DE DUPLICADOS)
// ==========================
app.post('/api/registro', async (req, res) => { // <-- 1. Hacer la función asíncrona
    const { email, nombre, carrera, recibir } = req.body;

    const sql = `
        INSERT INTO usuarios (email, nombre, carrera_interes, recibir_correos)
        VALUES (?, ?, ?, ?)
    `;
    
    try {
        // 2. Usar await para esperar la promesa
        const [result] = await db.query(sql, [email, nombre, carrera, recibir]); 
        
        // Si la inserción es exitosa (código 201 Created)
        res.status(201).json({ 
            success: true,
            message: "Usuario registrado correctamente." 
        });

    } catch (err) { // <-- 3. Capturar la excepción
        
        // Checamos si el error es DUPLICADO (código 1062 de MySQL)
        if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
            console.warn(`⚠️ Intento de registro duplicado para: ${email}`);
            
            // Si es duplicado, enviamos el 409 (Conflict)
            return res.status(409).json({ 
                success: false,
                message: "Este correo ya está registrado." 
            });
        }

        // Si es cualquier otro error del servidor o DB
        console.error("❌ Error desconocido guardando usuario:", err);
        // Si es un error interno, enviamos 500
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
        res.json({ reply: "Estas ? en mantenimiento." });
    }
});


// ==========================
// INICIAR SERVIDOR
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});