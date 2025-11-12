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

// --- RUTA: CREAR UN NUEVO USUARIO ---
router.post('/', async (req, res) => {
  try {
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
    res.status(400).json({ message: 'Error al crear usuario: ' + error.message });
  }
});

// --- RUTA: INICIAR SESIÓN (LOGIN) --- (MODIFICADA)
router.post('/login', async (req, res) => {
  try {
    // 1. Obtenemos los 3 campos del formulario
    const { 'nick-name': nickname, password, rol } = req.body;

    // 2. Validamos que el usuario exista por su nick-name
    const user = await User.findOne({ 'nick-name': nickname });
    if (!user) {
      // Si el nick-name no existe, enviamos este error
      return res.status(400).json({ message: 'Nick-name o contraseña incorrectos' });
    }

    // 3. (NUEVO) Validamos que el rol sea el correcto
    if (user.rol !== rol) {
      // Si el nick-name es correcto pero el rol no, enviamos tu error personalizado
      return res.status(403).json({ message: `Este usuario no tiene permisos de ${rol}` });
    }

    // 4. Validamos la contraseña (solo si el usuario y el rol fueron correctos)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Si la contraseña es incorrecta, enviamos este error
      return res.status(400).json({ message: 'Nick-name o contraseña incorrectos' });
    }

    // 5. Si todo está bien, creamos y firmamos el Token
    const payload = {
      id: user._id,
      rol: user.rol
    };

    const token = jwt.sign(
      payload,
      'UNA_CLAVE_SECRETA_MUY_DIFICIL_DE_ADIVINAR',
      { expiresIn: '1h' }
    );

    res.json({
      message: '¡Login exitoso!',
      token: token
    });

  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor durante el login: ' + error.message });
  }
});

// --- RUTA: ELIMINAR UN USUARIO (Protegida) ---
router.delete('/:id', auth, async (req, res) => {
  // ... (El resto del código de eliminar se mantiene igual) ...
  if (req.user.rol !== 'Jefe' && req.user.rol !== 'Sub-jefe') {
    return res.status(403).json({ message: 'No tienes permiso para eliminar usuarios.' });
  }
  try {
    const userId = req.params.id;
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    if (userToDelete.rol === 'Jefe') {
      return res.status(400).json({ message: 'No se puede eliminar a un usuario con rol de Jefe.' });
    }
    await User.deleteOne({ _id: userId });
    res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario: ' + error.message });
  }
});

// --- RUTA: ACTUALIZAR UN USUARIO (Protegida) ---
router.put('/:id', auth, async (req, res) => {
  // ... (El resto del código de actualizar se mantiene igual) ...
  if (req.user.rol !== 'Jefe' && req.user.rol !== 'Sub-jefe') {
    return res.status(403).json({ message: 'No tienes permiso para editar usuarios.' });
  }
  try {
    const userId = req.params.id;
    const updates = req.body;
    const userToEdit = await User.findById(userId);
    if (!userToEdit) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    if (userToEdit.rol === 'Jefe' && updates.rol !== 'Jefe') {
      return res.status(400).json({ message: 'No se puede cambiar el rol de un Jefe.' });
    }
    if (userToEdit.rol === 'Jefe' && req.user.rol !== 'Jefe') {
        return res.status(403).json({ message: 'Un Sub-Jefe no puede editar a un Jefe.' });
    }
    delete updates.password; 
    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
    res.json(updatedUser);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Ese nick-name ya está en uso por otro usuario.' });
    }
    res.status(500).json({ message: 'Error al actualizar el usuario: ' + error.message });
  }
});

module.exports = router;