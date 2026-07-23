const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

// GET /api/pedidos — Listar todos los pedidos con detalles (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { estado } = req.query;
    let query = 'SELECT * FROM pedidos';
    const params = [];

    if (estado && ['pendiente', 'completado'].includes(estado)) {
      query += ' WHERE estado = ?';
      params.push(estado);
    }

    query += ' ORDER BY fecha DESC';

    const [pedidos] = await pool.query(query, params);

    // Obtener detalles para cada pedido
    for (let pedido of pedidos) {
      const [detalles] = await pool.query(
        `SELECT dp.*, p.titulo, p.imagen_url 
         FROM detalle_pedidos dp 
         JOIN productos p ON dp.producto_id = p.id 
         WHERE dp.pedido_id = ?`,
        [pedido.id]
      );
      pedido.detalles = detalles;
    }

    res.json(pedidos);
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({ error: 'Error obteniendo pedidos.' });
  }
});

// GET /api/pedidos/stats — Métricas para dashboard (admin)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Total ingresos
    const [ingresos] = await pool.query(
      "SELECT COALESCE(SUM(total), 0) as total_ingresos FROM pedidos WHERE estado = 'completado'"
    );

    // Total pedidos
    const [totalPedidos] = await pool.query(
      'SELECT COUNT(*) as total FROM pedidos'
    );

    // Pedidos pendientes
    const [pendientes] = await pool.query(
      "SELECT COUNT(*) as total FROM pedidos WHERE estado = 'pendiente'"
    );

    // Total medidas tomadas
    const [totalMedidas] = await pool.query(
      'SELECT COUNT(*) as total FROM medidas'
    );

    // Productos activos
    const [productosActivos] = await pool.query(
      'SELECT COUNT(*) as total FROM productos WHERE activo = 1'
    );

    // Productos más vendidos (top 5)
    const [topProductos] = await pool.query(
      `SELECT p.titulo, SUM(dp.cantidad) as total_vendido 
       FROM detalle_pedidos dp 
       JOIN productos p ON dp.producto_id = p.id 
       GROUP BY dp.producto_id, p.titulo 
       ORDER BY total_vendido DESC 
       LIMIT 5`
    );

    // Pedidos recientes (últimos 5)
    const [recientes] = await pool.query(
      'SELECT * FROM pedidos ORDER BY fecha DESC LIMIT 5'
    );

    res.json({
      total_ingresos: ingresos[0].total_ingresos,
      total_pedidos: totalPedidos[0].total,
      pedidos_pendientes: pendientes[0].total,
      total_medidas: totalMedidas[0].total,
      productos_activos: productosActivos[0].total,
      top_productos: topProductos,
      pedidos_recientes: recientes
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas.' });
  }
});

// POST /api/pedidos — Crear pedido con detalles (público)
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { usuario_id, cliente_nombre, dui, direccion, telefono, metodo_pago, items } = req.body;

    // Validaciones
    if (!cliente_nombre || !dui || !direccion || !telefono || !metodo_pago || !items || items.length === 0) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios y debe incluir al menos un producto.' });
    }

    // Calcular total
    let total = 0;
    for (const item of items) {
      total += item.precio * item.cantidad;
    }

    // Insertar pedido
    const [pedidoResult] = await connection.query(
      'INSERT INTO pedidos (usuario_id, cliente_nombre, dui, direccion, telefono, metodo_pago, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [usuario_id || null, cliente_nombre, dui, direccion, telefono, metodo_pago, total]
    );

    const pedidoId = pedidoResult.insertId;

    // Insertar detalles
    for (const item of items) {
      await connection.query(
        'INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [pedidoId, item.producto_id, item.cantidad, item.precio]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Pedido registrado exitosamente.',
      pedido_id: pedidoId,
      total: total
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creando pedido:', error);
    res.status(500).json({ error: 'Error creando pedido.' });
  } finally {
    connection.release();
  }
});

// PUT /api/pedidos/:id/estado — Cambiar estado del pedido (admin)
router.put('/:id/estado', authMiddleware, async (req, res) => {
  try {
    const { estado } = req.body;

    if (!estado || !['pendiente', 'completado'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido. Use "pendiente" o "completado".' });
    }

    const [result] = await pool.query(
      'UPDATE pedidos SET estado = ? WHERE id = ?',
      [estado, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }

    res.json({ message: 'Estado actualizado exitosamente.' });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ error: 'Error actualizando estado.' });
  }
});

module.exports = router;
