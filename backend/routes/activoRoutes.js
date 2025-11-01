const express = require('express');
const router = express.Router();
const Activo = require('../models/Activo'); // Importamos el modelo Activo
const auth = require('../middleware/auth');   // Importamos el middleware de autenticación

// --- OBTENER TODOS LOS ACTIVOS (Ruta Protegida) ---
router.get('/', auth, async (req, res) => { // 'auth' protege la ruta
  try {
    const activos = await Activo.find(); // Busca todos los activos
    res.json(activos); // Devuelve la lista
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener activos: ' + error.message });
  }
});

// --- CREAR UN NUEVO ACTIVO (Ruta Protegida) ---
router.post('/', auth, async (req, res) => { // 'auth' protege la ruta
  const { nombre, sku, tipo_activo, stock_total } = req.body;

  // Validación básica
  if (!nombre || !sku || !tipo_activo || stock_total == null) { // Verifica campos obligatorios
    return res.status(400).json({ message: 'Por favor, proporciona todos los campos requeridos (nombre, sku, tipo_activo, stock_total).' });
  }

  try {
    // Crea una nueva instancia del modelo Activo
    const nuevoActivo = new Activo({
      ...req.body, // Incluye todos los datos enviados
      stock_disponible: stock_total // Al crear, el stock disponible es igual al total
    });

    // Guarda el nuevo activo en la base de datos
    const savedActivo = await nuevoActivo.save();
    res.status(201).json(savedActivo); // Responde con el activo creado y estado 201 (Creado)
  } catch (error) {
    // Maneja errores (como SKU duplicado)
    res.status(400).json({ message: 'Error al crear activo: ' + error.message });
  }
});

module.exports = router; // Exporta el router