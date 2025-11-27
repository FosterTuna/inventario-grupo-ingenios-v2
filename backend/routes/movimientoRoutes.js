// backend/routes/movimientoRoutes.js

const express = require('express');
const router = express.Router();
const Movimiento = require('../models/Movimiento');
const DetalleMovimiento = require('../models/DetalleMovimiento');
const Activo = require('../models/Activo');
const auth = require('../middleware/auth');
const User = require('../models/User'); 

// --- REGISTRAR UNA SALIDA DE ACTIVO ---
router.post('/salida', auth, async (req, res) => {
  const { id_activo, cantidad, id_usuario_dispone, nombre_visitante, apellidos_visitante, observaciones } = req.body;
  const id_usuario_adjunta = req.user.id;

  if (!id_activo || cantidad <= 0) return res.status(400).json({ message: 'Faltan campos requeridos: activo y cantidad.' });
  const esVisitante = !id_usuario_dispone;
  if (esVisitante && (!nombre_visitante || !apellidos_visitante)) return res.status(400).json({ message: 'Faltan el nombre y el apellido del visitante.' });

  try {
    const activo = await Activo.findById(id_activo);
    if (!activo) return res.status(404).json({ message: 'Activo no encontrado.' });
    
    // Validación de mantenimiento
    if (activo.estado_actual === 'Mantenimiento') {
        return res.status(400).json({ message: 'No se puede realizar la salida ya que se encuentra en mantenimiento.' });
    }

    if (activo.stock_disponible < cantidad) return res.status(400).json({ message: 'Stock insuficiente.' });

    const nuevoMovimiento = new Movimiento({
      id_usuario_adjunta,
      id_usuario_dispone: id_usuario_dispone || undefined,
      nombre_visitante: nombre_visitante || undefined,
      apellidos_visitante: apellidos_visitante || undefined,
      tipo_movimiento: 'Salida Uso',
      observaciones
    });
    const movimientoGuardado = await nuevoMovimiento.save();

    const detalle = new DetalleMovimiento({ id_movimiento: movimientoGuardado._id, id_activo: id_activo, cantidad: cantidad });
    await detalle.save();

    activo.stock_disponible -= cantidad;
    if (activo.stock_disponible < activo.stock_total) {
      activo.estado_actual = 'En Uso';
    }
    await activo.save();
    res.status(201).json({ message: 'Salida registrada con éxito', movimiento: movimientoGuardado });

  } catch (error) {
    res.status(500).json({ message: 'Error al registrar salida: ' + error.message });
  }
});


// --- REGISTRAR UNA ENTRADA (Devolución) ---
router.post('/entrada', auth, async (req, res) => {
  const { id_activo, cantidad, estado_devolucion, observaciones } = req.body;
  const id_usuario_adjunta = req.user.id;
  
  if (!id_activo || !cantidad || cantidad <= 0 || !estado_devolucion) {
      return res.status(400).json({ message: 'Faltan campos requeridos: activo, cantidad y estado de devolución.' });
  }

  try {
    const activo = await Activo.findById(id_activo);
    if (!activo) return res.status(404).json({ message: 'Activo no encontrado.' });
    if (activo.stock_disponible + Number(cantidad) > activo.stock_total) {
      return res.status(400).json({ message: 'Error: El stock no puede superar el Stock Total.' });
    }

    const nuevoMovimiento = new Movimiento({
      id_usuario_adjunta,
      id_usuario_dispone: null,
      tipo_movimiento: 'Devolución',
      observaciones: `Estado de devolución: ${estado_devolucion}. Observaciones: ${observaciones || ''}`
    });
    const movimientoGuardado = await nuevoMovimiento.save();

    const detalle = new DetalleMovimiento({ id_movimiento: movimientoGuardado._id, id_activo: id_activo, cantidad: cantidad });
    await detalle.save();

    activo.stock_disponible += Number(cantidad);

    if (estado_devolucion === 'Mantenimiento') {
        activo.estado_actual = 'Mantenimiento';
    } else if (activo.stock_disponible === activo.stock_total) {
      activo.estado_actual = 'Disponible';
    } else {
      activo.estado_actual = 'En Uso';
    }
    
    await activo.save();
    res.status(201).json({ message: 'Devolución registrada con éxito', activo });

  } catch (error) {
    res.status(500).json({ message: 'Error al registrar entrada: ' + error.message });
  }
});


// --- RUTA: OBTENER EL HISTORIAL COMPLETO (CORREGIDA PARA VISITANTES) ---
router.get('/historial', auth, async (req, res) => {
    try {
        const historial = await DetalleMovimiento.aggregate([
            { $lookup: { from: 'movimientos', localField: 'id_movimiento', foreignField: '_id', as: 'movimiento' } },
            { $unwind: '$movimiento' },
            { $lookup: { from: 'activos', localField: 'id_activo', foreignField: '_id', as: 'activo_info' } },
            { $unwind: '$activo_info' },
            { $lookup: { from: 'users', localField: 'movimiento.id_usuario_adjunta', foreignField: '_id', as: 'usuario_adjunta' } },
            { $lookup: { from: 'users', localField: 'movimiento.id_usuario_dispone', foreignField: '_id', as: 'usuario_dispone' } },
            {
                $project: {
                    _id: 0,
                    fecha: '$movimiento.fecha_movimiento',
                    tipo: '$movimiento.tipo_movimiento',
                    cantidad: '$cantidad',
                    activo_sku: '$activo_info.sku',
                    activo_nombre: '$activo_info.nombre',
                    adjunta_nombre: { $arrayElemAt: ['$usuario_adjunta.nombre_completo', 0] },
                    adjunta_rol: { $arrayElemAt: ['$usuario_adjunta.rol', 0] },
                    
                    // --- CAMBIO AQUÍ: Lógica para nombre completo de visitante ---
                    dispone_nombre_completo: {
                        $cond: {
                            // Si hay un usuario interno (ID no es null)
                            if: { $ne: ['$movimiento.id_usuario_dispone', null] },
                            // Usamos su nombre completo
                            then: { $arrayElemAt: ['$usuario_dispone.nombre_completo', 0] },
                            // Si no (es visitante), concatenamos: Nombre + " " + Apellido + " (VISITANTE)"
                            else: { 
                                $concat: [
                                    { $ifNull: ["$movimiento.nombre_visitante", ""] }, 
                                    " ", 
                                    { $ifNull: ["$movimiento.apellidos_visitante", ""] },
                                    " (VISITANTE)"
                                ] 
                            } 
                        }
                    },
                    // --- FIN DEL CAMBIO ---

                    observaciones: '$movimiento.observaciones',
                }
            }
        ]);

        res.json(historial);

    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el historial: ' + error.message });
    }
});

module.exports = router;