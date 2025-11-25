// backend/routes/movimientoRoutes.js

const express = require('express');
const router = express.Router();
const Movimiento = require('../models/Movimiento');
const DetalleMovimiento = require('../models/DetalleMovimiento');
const Activo = require('../models/Activo');
const auth = require('../middleware/auth');

// --- REGISTRAR UNA SALIDA DE ACTIVO (Corregido: Añadimos lógica de estado) ---
router.post('/salida', auth, async (req, res) => {
  const { id_activo, cantidad, id_usuario_dispone, observaciones } = req.body;
  const id_usuario_adjunta = req.user.id;

  if (!id_activo || !cantidad || cantidad <= 0 || !id_usuario_dispone) {
      return res.status(400).json({ message: 'Faltan campos requeridos: id_activo, cantidad, id_usuario_dispone.' });
  }

  try {
    const activo = await Activo.findById(id_activo);
    // ... (Validaciones de activo y stock se mantienen) ...
    if (!activo) return res.status(404).json({ message: 'Activo no encontrado.' });
    if (activo.stock_disponible < cantidad) return res.status(400).json({ message: 'Stock insuficiente.' });

    // 1. Crea el registro principal y detalle del movimiento
    const nuevoMovimiento = new Movimiento({ id_usuario_adjunta, id_usuario_dispone, tipo_movimiento: 'Salida Uso', observaciones });
    const movimientoGuardado = await nuevoMovimiento.save();
    const detalle = new DetalleMovimiento({ id_movimiento: movimientoGuardado._id, id_activo: id_activo, cantidad: cantidad });
    await detalle.save();

    // 2. Actualiza el stock
    activo.stock_disponible -= cantidad;
    
    // 3. Actualiza el estado a 'En Uso' si queda algo prestado
    if (activo.stock_disponible < activo.stock_total) {
      activo.estado_actual = 'En Uso';
    }
    
    await activo.save();
    res.status(201).json({ message: 'Salida registrada con éxito', movimiento: movimientoGuardado });

  } catch (error) {
    res.status(500).json({ message: 'Error al registrar salida: ' + error.message });
  }
});


// --- RUTA NUEVA: REGISTRAR UNA ENTRADA (Devolución) ---
router.post('/entrada', auth, async (req, res) => {
  const { id_activo, cantidad, estado_devolucion, observaciones } = req.body;
  const id_usuario_adjunta = req.user.id; // El encargado que registra la entrada (adjunta)
  
  if (!id_activo || !cantidad || cantidad <= 0 || !estado_devolucion) {
      return res.status(400).json({ message: 'Faltan campos requeridos: activo, cantidad y estado de devolución.' });
  }

  try {
    const activo = await Activo.findById(id_activo);
    if (!activo) return res.status(404).json({ message: 'Activo no encontrado.' });
    
    // Regla: No se puede devolver más de lo que la empresa posee
    if (activo.stock_disponible + Number(cantidad) > activo.stock_total) {
      return res.status(400).json({ message: 'Error: El stock no puede superar el Stock Total.' });
    }

    // 1. Crea el movimiento de "Devolución"
    const nuevoMovimiento = new Movimiento({
      id_usuario_adjunta,
      id_usuario_dispone: null, // No aplica un usuario que dispone al devolver, solo al entregar
      tipo_movimiento: 'Devolución',
      observaciones: `Estado de devolución: ${estado_devolucion}. Observaciones: ${observaciones || ''}`
    });
    const movimientoGuardado = await nuevoMovimiento.save();

    // 2. Crea el detalle del movimiento
    const detalle = new DetalleMovimiento({ id_movimiento: movimientoGuardado._id, id_activo: id_activo, cantidad: cantidad });
    await detalle.save();

    // 3. Actualiza el stock
    activo.stock_disponible += Number(cantidad);

    // 4. Actualiza el estado (Mantenimiento o Disponible/En Uso)
    if (estado_devolucion === 'Mantenimiento') {
        activo.estado_actual = 'Mantenimiento';
    } else if (activo.stock_disponible === activo.stock_total) {
      activo.estado_actual = 'Disponible'; // Todo regresó
    } else {
      activo.estado_actual = 'En Uso'; // Queda stock prestado
    }
    
    await activo.save();
    res.status(201).json({ message: 'Devolución registrada con éxito', activo });

  } catch (error) {
    res.status(500).json({ message: 'Error al registrar entrada: ' + error.message });
  }
});


module.exports = router;