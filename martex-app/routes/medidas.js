const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/medidas — Listar medidas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM medidas ORDER BY fecha DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo medidas:', error);
    res.status(500).json({ error: 'Error obteniendo medidas.' });
  }
});

// POST /api/medidas — Registrar ficha de medidas
router.post('/', async (req, res) => {
  try {
    const {
      cliente_nombre,
      telefono,
      tipo_prenda,
      hombro,
      busto,
      cintura_top,
      cadera_top,
      largo_cintura,
      manga_largo,
      grosor_brazo,
      largo_total_top,
      cintura_pant,
      cadera_pant,
      largo_rodilla,
      largo_total_pant,
      grosor_muslo,
      tiro,
      grosor_rodilla,
      notas
    } = req.body;

    if (!cliente_nombre || !tipo_prenda) {
      return res.status(400).json({ error: 'Nombre del cliente y tipo de prenda son obligatorios.' });
    }

    if (!['filipina', 'pantalon', 'ambos'].includes(tipo_prenda)) {
      return res.status(400).json({ error: 'Tipo de prenda inválido.' });
    }

    const [result] = await pool.query(
      `INSERT INTO medidas (
        cliente_nombre, telefono, tipo_prenda,
        hombro, busto, cintura_top, cadera_top, largo_cintura, manga_largo, grosor_brazo, largo_total_top,
        cintura_pant, cadera_pant, largo_rodilla, largo_total_pant, grosor_muslo, tiro, grosor_rodilla,
        notas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cliente_nombre,
        telefono || null,
        tipo_prenda,
        hombro || null,
        busto || null,
        cintura_top || null,
        cadera_top || null,
        largo_cintura || null,
        manga_largo || null,
        grosor_brazo || null,
        largo_total_top || null,
        cintura_pant || null,
        cadera_pant || null,
        largo_rodilla || null,
        largo_total_pant || null,
        grosor_muslo || null,
        tiro || null,
        grosor_rodilla || null,
        notas || ''
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Ficha de medidas registrada exitosamente.' });
  } catch (error) {
    console.error('Error registrando medidas:', error);
    res.status(500).json({ error: 'Error registrando medidas.' });
  }
});

// DELETE /api/medidas/:id — Eliminar ficha
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM medidas WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ficha no encontrada.' });
    }
    res.json({ message: 'Ficha eliminada exitosamente.' });
  } catch (error) {
    console.error('Error eliminando ficha:', error);
    res.status(500).json({ error: 'Error eliminando ficha.' });
  }
});

module.exports = router;
