const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'martex_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(conn => {
    console.log('[MARTEX BD] Conexión a MySQL establecida correctamente.');
    conn.release();
  })
  .catch(err => {
    console.error('[MARTEX BD] Error conectando a MySQL:', err.message);
  });

module.exports = pool;
