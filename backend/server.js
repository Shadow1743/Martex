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

// Servir archivos estáticos
app.use('/imagenes', express.static(path.join(__dirname, '..', 'imagenes')));
app.use('/frontend', express.static(path.join(__dirname, '..', 'frontend')));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

// Rutas API
const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');
const medidasRoutes = require('./routes/medidas');

app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/medidas', medidasRoutes);

// Ruta raíz — redirigir al frontend
app.get('/', (req, res) => {
  res.redirect('/frontend/index.html');
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
  ==========================================
        MARTEX API REST Server
        Puerto: ${PORT}
        Frontend: http://localhost:${PORT}
        Admin: http://localhost:${PORT}/admin
  ==========================================
  `);
});
