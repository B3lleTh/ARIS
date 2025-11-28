// ============================
// CARGAR VARIABLES DE ENTORNO
// ============================
require('dotenv').config({ path: './.env' }); 

// !!! IMPORTANTE: USAMOS LA VERSIÓN DE PROMESAS
const mysql = require("mysql2/promise");

// Definimos el Pool de Conexiones
const dbPool = mysql.createPool({ 
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// ==========================
// FUNCIÓN DE CONTEO DE ESTUDIANTES
// ==========================
async function getActiveStudentsCount() {
    // Consulta SQL para contar TODOS los registros en la tabla 'usuarios'
    const sql = "SELECT COUNT(*) AS total FROM usuarios";
    
    try {
        // Ejecutar la consulta
        const [rows] = await dbPool.query(sql); 
        
        // Retorna el valor 'total'
        return rows[0].total; 
    } catch (error) {
        console.error("Error en la base de datos al contar estudiantes:", error);
        return 0; 
    }
}

// ==========================
// PRUEBA DE CONEXIÓN
// ==========================
dbPool.getConnection()
    .then(connection => {
        console.log("Conectado a MySQL correctamente.");
        connection.release(); 
    })
    .catch(err => {
        console.error("❌ Error conectando a MySQL:", err);
    });

// ==========================
// EXPORTACIÓN FINAL
// ==========================
module.exports = {
    db: dbPool, 
    getActiveStudentsCount // Exportamos la función para que 'index.js' la use
};