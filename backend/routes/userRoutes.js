const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// --- RUTA: OBTENER TODOS LOS USUARIOS (Protegida) ---
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios: ' + error.message });
  }
});

// --- RUTA: CREAR UN NUEVO USUARIO (CON REGLAS DE JERARQUÍA) ---
router.post('/', auth, async (req, res) => {
  try {
    const rolSolicitante = req.user.rol; // Quién intenta crear
    const rolNuevoUsuario = req.body.rol; // Qué rol intenta crear

    // 1. REGLA: Encargados, Practicantes y Trabajadores NO pueden agregar usuarios
    if (rolSolicitante !== 'Jefe' && rolSolicitante !== 'Sub-Jefe') {
      return res.status(403).json({ 
        message: 'Acceso denegado. Solo Jefes y Sub-Jefes pueden crear usuarios.' 
      });
    }

    // 2. REGLA: El Sub-Jefe NO puede crear un usuario con rol de "Jefe"
    if (rolSolicitante === 'Sub-Jefe' && rolNuevoUsuario === 'Jefe') {
      return res.status(403).json({ 
        message: 'Permiso denegado. Un Sub-Jefe no puede crear un usuario con rol de Jefe.' 
      });
    }

    // Si pasa las validaciones, procedemos a crear
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      nombre_completo: req.body.nombre_completo,
      'nick-name': req.body['nick-name'],
      password: hashedPassword,
      rol: req.body.rol,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);

  } catch (error) {
    if (error.code === 11000) {
        return res.status(400).json({ message: 'Ese nick-name ya existe. Por favor elige otro.' });
    }
    res.status(400).json({ message: 'Error al crear usuario: ' + error.message });
  }
});

// --- RUTA: INICIAR SESIÓN (LOGIN) ---
router.post('/login', async (req, res) => {
  try {
    const { 'nick-name': nickname, password, rol } = req.body;

    // 1. Buscar usuario
    const user = await User.findOne({ 'nick-name': nickname });
    if (!user) return res.status(400).json({ message: 'Nick-name o contraseña incorrectos' });

    // 2. Validar que el rol seleccionado coincida con el de la BD
    if (user.rol !== rol) {
      return res.status(403).json({ message: `Este usuario no tiene permisos de ${rol}` });
    }

    // 3. Validar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Nick-name o contraseña incorrectos' });

    // 4. Generar Token
    const payload = { id: user._id, rol: user.rol };
    const token = jwt.sign(
      payload,
      'UNA_CLAVE_SECRETA_MUY_DIFICIL_DE_ADIVINAR',
      { expiresIn: '1h' }
    );

    // Enviamos también el rol al frontend para ayudar a ocultar botones
    res.json({ message: '¡Login exitoso!', token, rol: user.rol });

  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
});

// --- RUTA: ELIMINAR UN USUARIO (CON REGLAS DE JERARQUÍA) ---
router.delete('/:id', auth, async (req, res) => {
  const rolSolicitante = req.user.rol;

  // 1. REGLA: Solo Jefes y Sub-Jefes pueden eliminar
  if (rolSolicitante !== 'Jefe' && rolSolicitante !== 'Sub-Jefe') {
    return res.status(403).json({ message: 'No tienes permiso para eliminar usuarios.' });
  }

  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) return res.status(404).json({ message: 'Usuario no encontrado.' });

    // 2. REGLA: Nadie puede borrar a un Jefe (ni siquiera otro Jefe por seguridad básica, o el Sub-Jefe)
    // Si quieres que un Jefe sí pueda borrar a otro Jefe, quita la condición "rolSolicitante !== 'Jefe'"
    if (userToDelete.rol === 'Jefe' && rolSolicitante !== 'Jefe') {
      return res.status(403).json({ message: 'No tienes permisos para eliminar a un Jefe.' });
    }

    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'Usuario eliminado correctamente.' });

  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar: ' + error.message });
  }
});

// --- RUTA: ACTUALIZAR UN USUARIO (CON REGLAS DE JERARQUÍA) ---
router.put('/:id', auth, async (req, res) => {
  const rolSolicitante = req.user.rol;
  const updates = req.body;

  // 1. REGLA: Solo Jefes y Sub-Jefes pueden editar
  if (rolSolicitante !== 'Jefe' && rolSolicitante !== 'Sub-Jefe') {
    return res.status(403).json({ message: 'No tienes permiso para editar usuarios.' });
  }

  try {
    const userToEdit = await User.findById(req.params.id);
    if (!userToEdit) return res.status(404).json({ message: 'Usuario no encontrado.' });

    // 2. REGLA: Un Sub-Jefe no puede editar a un Jefe
    if (userToEdit.rol === 'Jefe' && rolSolicitante !== 'Jefe') {
        return res.status(403).json({ message: 'No tienes permisos para editar a un Jefe.' });
    }

    // 3. REGLA: No se puede "promover" a alguien a Jefe si no eres Jefe
    if (updates.rol === 'Jefe' && rolSolicitante !== 'Jefe') {
        return res.status(403).json({ message: 'Solo un Jefe puede asignar el rol de Jefe.' });
    }

    delete updates.password; // Seguridad: no editar contraseña por aquí
    
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updatedUser);

  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Ese nick-name ya está en uso.' });
    res.status(500).json({ message: 'Error al actualizar: ' + error.message });
  }
});

module.exports = router;