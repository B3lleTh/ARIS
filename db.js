/**
 * Módulo de Conexión y Funciones Básicas de la Base de Datos.
 * Gestiona un Pool de Conexiones MySQL usando mysql2/promise.
 */

// =============================================================
// CONFIGURACIÓN E IMPORTACIONES
// =============================================================

// Carga las variables de entorno desde el archivo .env
require('dotenv').config();

// Importa la librería 'mysql2' con soporte para promesas. 
// Es esencial para usar async/await con las consultas.
const mysql = require("mysql2/promise");

// =============================================================
// CREACIÓN DEL POOL DE CONEXIONES
// =============================================================

// Crea un Pool de Conexiones. Un Pool gestiona y reutiliza varias conexiones, 
// lo que mejora el rendimiento y la estabilidad bajo alta carga.
const dbPool = mysql.createPool({
    // Lee el host de la base de datos (ej. 'localhost') desde las variables de entorno.
    host: process.env.DB_HOST,
    // Lee el nombre de usuario para la conexión.
    user: process.env.DB_USER,
    // Lee la contraseña del usuario.
    password: process.env.DB_PASS,
    // Lee el nombre de la base de datos a utilizar.
    database: process.env.DB_NAME
});

// =============================================================
// FUNCIONES DE LA BASE DE DATOS
// =============================================================

/**
 * Función asíncrona para obtener el número total de usuarios/estudiantes activos.
 * @returns {Promise<number>} El número de usuarios o 0 en caso de error.
 */
async function getActiveStudentsCount() {
    // Define la consulta SQL para contar todas las filas en la tabla 'usuarios'.
    const sql = "SELECT COUNT(*) AS total FROM usuarios";

    try {
        // Ejecuta la consulta SQL usando el Pool. 'dbPool.query()' devuelve un array,
        // donde el primer elemento ([rows]) contiene los resultados.
        const [rows] = await dbPool.query(sql);
        
        // Retorna el valor de la columna 'total' de la primera fila.
        return rows[0].total;

    } catch (error) {
        // Captura cualquier error que ocurra durante la conexión o la consulta.
        console.error("Error en la base de datos al contar estudiantes:", error);
        
        // Retorna 0 si hay un error para evitar que la aplicación se detenga.
        return 0;
    }
}

// =============================================================
// EXPORTACIONES
// =============================================================

// Exporta los elementos que serán accesibles desde otros archivos (como server.js).
module.exports = {
    // Exporta el Pool de Conexiones (que se usa para ejecutar consultas como db.query).
    db: dbPool,
    // Exporta la función para contar estudiantes.
    getActiveStudentsCount
};