const express = require('express');
const router = express.Router();
const Activo = require('../models/Activo'); // Importamos el modelo Activo
const auth = require('../middleware/auth');   // Importamos el middleware de autenticación

// --- OBTENER TODOS LOS ACTIVOS (Ruta Protegida) ---
router.get('/', auth, async (req, res) => {
  try {
    const activos = await Activo.find();
    res.json(activos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener activos: ' + error.message });
  }
});

// --- CREAR UN NUEVO ACTIVO (Ruta Protegida) ---
router.post('/', auth, async (req, res) => {
  // Solo roles con permiso pueden crear
  if (req.user.rol !== 'Jefe' && req.user.rol !== 'Sub-jefe' && req.user.rol !== 'Encargado') {
    return res.status(403).json({ message: 'No tienes permiso para crear activos.' });
  }

  const { nombre, sku, tipo_activo, stock_total } = req.body;

  if (!nombre || !sku || !tipo_activo || stock_total == null) {
    return res.status(400).json({ message: 'Por favor, proporciona todos los campos requeridos (nombre, sku, tipo_activo, stock_total).' });
  }

  try {
    const nuevoActivo = new Activo({
      ...req.body,
      stock_disponible: stock_total
    });

    const savedActivo = await nuevoActivo.save();
    res.status(201).json(savedActivo);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear activo: ' + error.message });
  }
});

// --- OBTENER UN ACTIVO ESPECÍFICO POR ID (Ruta Protegida) ---
router.get('/:id', auth, async (req, res) => {
  try {
    const activo = await Activo.findById(req.params.id);
    
    if (!activo) {
      return res.status(404).json({ message: 'Activo no encontrado.' });
    }
    
    res.json(activo);
    
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el activo: ' + error.message });
  }
});

// --- RUTA: ACTUALIZAR UN ACTIVO (Ruta Protegida) ---
// ----- ¡ESTA ES LA RUTA NUEVA! -----
router.put('/:id', auth, async (req, res) => {
  // Verificamos permisos (solo roles autorizados pueden editar)
  if (req.user.rol !== 'Jefe' && req.user.rol !== 'Sub-jefe' && req.user.rol !== 'Encargado') {
    return res.status(403).json({ message: 'No tienes permiso para editar activos.' });
  }

  try {
    const activoId = req.params.id;
    const updates = req.body;

    // No permitimos que se actualice el stock directamente desde esta ruta
    // El stock solo debe cambiar con los movimientos de entrada/salida
    delete updates.stock_disponible;

    // Buscamos y actualizamos el activo
    const updatedActivo = await Activo.findByIdAndUpdate(
      activoId,
      updates,
      { new: true, runValidators: true } // {new: true} devuelve el documento actualizado
    );

    if (!updatedActivo) {
      return res.status(404).json({ message: 'Activo no encontrado.' });
    }

    res.json(updatedActivo); // Devuelve el activo actualizado

  } catch (error) {
    // Maneja errores (ej. SKU duplicado)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Ese SKU ya está en uso por otro activo.' });
    }
    res.status(500).json({ message: 'Error al actualizar el activo: ' + error.message });
  }
});
// ----- FIN DE LA RUTA NUEVA -----

module.exports = router;