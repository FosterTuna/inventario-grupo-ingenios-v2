const express = require('express');
const router = express.Router();
const Activo = require('../models/Activo');
const auth = require('../middleware/auth');

// --- OBTENER TODOS LOS ACTIVOS (Con Filtros) ---
router.get('/', auth, async (req, res) => {
  try {
    const { search, estado, tipo_activo, bodega, estante } = req.query;
    let query = {};

    if (search) query.nombre = new RegExp(search, 'i');
    if (estado) query.estado_actual = estado;
    if (tipo_activo) query.tipo_activo = tipo_activo;
    if (bodega) query['ubicacion.bodega'] = bodega;
    if (estante) query['ubicacion.estante'] = new RegExp(estante, 'i');

    const activos = await Activo.find(query);
    res.json(activos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener activos: ' + error.message });
  }
});

// --- CREAR UN NUEVO ACTIVO ---
router.post('/', auth, async (req, res) => {
  if (req.user.rol !== 'Jefe' && req.user.rol !== 'Sub-jefe' && req.user.rol !== 'Encargado') {
    return res.status(403).json({ message: 'No tienes permiso para crear activos.' });
  }
  const { nombre, sku, tipo_activo, stock_total } = req.body;
  if (!nombre || !sku || !tipo_activo || stock_total == null) {
    return res.status(400).json({ message: 'Faltan campos requeridos.' });
  }
  try {
    const nuevoActivo = new Activo({ ...req.body, stock_disponible: stock_total });
    const savedActivo = await nuevoActivo.save();
    res.status(201).json(savedActivo);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear activo: ' + error.message });
  }
});

// --- OBTENER UN ACTIVO POR ID ---
router.get('/:id', auth, async (req, res) => {
  try {
    const activo = await Activo.findById(req.params.id);
    if (!activo) return res.status(404).json({ message: 'Activo no encontrado.' });
    res.json(activo);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el activo: ' + error.message });
  }
});

// --- ACTUALIZAR UN ACTIVO ---
router.put('/:id', auth, async (req, res) => {
  if (req.user.rol !== 'Jefe' && req.user.rol !== 'Sub-jefe' && req.user.rol !== 'Encargado') {
    return res.status(403).json({ message: 'No tienes permiso para editar activos.' });
  }
  try {
    const updates = req.body;
    delete updates.stock_disponible;
    const updatedActivo = await Activo.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!updatedActivo) return res.status(404).json({ message: 'Activo no encontrado.' });
    res.json(updatedActivo);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Ese SKU ya existe.' });
    res.status(500).json({ message: 'Error al actualizar: ' + error.message });
  }
});

// --- ELIMINAR UN ACTIVO (Ruta Nueva) ---
router.delete('/:id', auth, async (req, res) => {
  // Solo Jefes pueden eliminar
  if (req.user.rol !== 'Jefe' && req.user.rol !== 'Sub-jefe') {
    return res.status(403).json({ message: 'No tienes permiso para eliminar activos.' });
  }

  try {
    const activo = await Activo.findById(req.params.id);
    if (!activo) {
      return res.status(404).json({ message: 'Activo no encontrado.' });
    }

    // REGLA DE NEGOCIO: No eliminar si hay piezas prestadas
    if (activo.stock_disponible !== activo.stock_total) {
      return res.status(400).json({ 
        message: 'No se puede eliminar: Hay piezas en uso o prestadas. Recupéralas antes de borrar.' 
      });
    }

    // Usamos deleteOne() para borrar el activo
    await Activo.deleteOne({ _id: req.params.id });
    res.json({ message: 'Activo eliminado correctamente.' });

  } catch (error) {
    // Maneja errores de ID mal formateado
    res.status(500).json({ message: 'Error al intentar eliminar el activo: ' + error.message });
  }
});

module.exports = router;