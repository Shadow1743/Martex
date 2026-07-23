const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir carpetas estáticas principales
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));
app.use('/frontend', express.static(path.join(__dirname, '..', 'frontend')));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));
app.use('/imagenes', express.static(path.join(__dirname, '..', 'imagenes')));

// Intentar cargar la base de datos opcionalmente
let pool = null;
try {
  pool = require('./config/db');
} catch (e) {
  console.log('[MARTEX SERVER] Modo estático independiente activo (sin MySQL).');
}

// Rutas API REST opcionales si MySQL está activo
if (pool) {
  try {
    const authRoutes = require('./routes/auth');
    const productosRoutes = require('./routes/productos');
    const medidasRoutes = require('./routes/medidas');
    const pedidosRoutes = require('./routes/pedidos');

    app.use('/api/auth', authRoutes);
    app.use('/api/productos', productosRoutes);
    app.use('/api/medidas', medidasRoutes);
    app.use('/api/pedidos', pedidosRoutes);
  } catch (err) {
    console.log('[MARTEX SERVER] Rutas de API omitidas.');
  }
}

// Endpoint /api/dashboard/stats
app.get('/api/dashboard/stats', async (req, res) => {
  if (!pool) return res.json({ status: 'offline', message: 'Servidor en modo local sin BD' });
  try {
    const [ingresos] = await pool.query("SELECT COALESCE(SUM(total), 0) as total_ingresos FROM pedidos WHERE estado = 'completado'");
    const [totalPedidos] = await pool.query('SELECT COUNT(*) as total FROM pedidos');
    const [pendientes] = await pool.query("SELECT COUNT(*) as total FROM pedidos WHERE estado = 'pendiente'");
    const [totalMedidas] = await pool.query('SELECT COUNT(*) as total FROM medidas');

    res.json({
      total_ingresos: ingresos[0].total_ingresos,
      total_pedidos: totalPedidos[0].total,
      pedidos_pendientes: pendientes[0].total,
      total_medidas: totalMedidas[0].total
    });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo métricas' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
  =============================================================
        MARTEX — SERVIDOR WEB & API REST INICIADO
  =============================================================
   🛍️  Tienda Web:        http://localhost:${PORT}
   ⚙️  Panel Admin:       http://localhost:${PORT}/admin/admin.html
   📂  Carpeta Imágenes:  http://localhost:${PORT}/imagenes
  =============================================================
  `);
});
