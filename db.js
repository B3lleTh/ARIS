require('dotenv').config();
const mysql = require("mysql2/promise");

// Crear el pool de conexiones
const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Función para contar estudiantes
async function getActiveStudentsCount() {
    const sql = "SELECT COUNT(*) AS total FROM usuarios";

    try {
        const [rows] = await dbPool.query(sql);
        return rows[0].total;

    } catch (error) {
        console.error("Error en la base de datos al contar estudiantes:", error);
        return 0;
    }
}

module.exports = {
    db: dbPool,
    getActiveStudentsCount
};
