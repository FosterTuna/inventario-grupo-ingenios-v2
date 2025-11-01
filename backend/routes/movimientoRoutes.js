const express = require('express');
const router = express.Router();
const Movimiento = require('../models/Movimiento');
const DetalleMovimiento = require('../models/DetalleMovimiento');
const Activo = require('../models/Activo');
const auth = require('../middleware/auth'); // Middleware de autenticación

// --- REGISTRAR UNA SALIDA DE ACTIVO (Ruta Protegida) ---
router.post('/salida', auth, async (req, res) => {
  // Obtiene datos del cuerpo de la petición y del token del usuario
  const { id_activo, cantidad, id_usuario_dispone, observaciones } = req.body;
  const id_usuario_adjunta = req.user.id; // Obtiene el ID del usuario logueado (quien entrega)

  // Valida la entrada
  if (!id_activo || !cantidad || cantidad <= 0 || !id_usuario_dispone) {
      return res.status(400).json({ message: 'Faltan campos requeridos: id_activo, cantidad, id_usuario_dispone.' });
  }

  try {
    // 1. Encuentra el activo y verifica el stock
    const activo = await Activo.findById(id_activo);
    if (!activo) {
        return res.status(404).json({ message: 'Activo no encontrado.' });
    }
    if (activo.stock_disponible < cantidad) {
      return res.status(400).json({ message: 'Stock insuficiente.' });
    }

    // 2. Crea el registro principal del movimiento
    const nuevoMovimiento = new Movimiento({
      id_usuario_adjunta,
      id_usuario_dispone,
      tipo_movimiento: 'Salida Uso', // O 'Salida Renta' según lógica/entrada
      observaciones
    });
    const movimientoGuardado = await nuevoMovimiento.save();

    // 3. Crea el registro del detalle del movimiento
    const detalle = new DetalleMovimiento({
      id_movimiento: movimientoGuardado._id,
      id_activo: id_activo,
      cantidad: cantidad
    });
    await detalle.save();

    // 4. Actualiza el stock disponible del activo
    activo.stock_disponible -= cantidad;
    await activo.save();

    res.status(201).json({ message: 'Salida registrada con éxito', movimiento: movimientoGuardado });

  } catch (error) {
    res.status(500).json({ message: 'Error al registrar salida: ' + error.message });
  }
});

// --- Añadir rutas para DEVOLUCIONES ('/entrada') e HISTORIAL ('/historial/:id_activo') más adelante ---

module.exports = router;