const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Importamos el modelo User.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // <-- Importamos jsonwebtoken
const auth = require('../middleware/auth'); // <-- Importamos el middleware de autenticación

// --- RUTA: OBTENER TODOS LOS USUARIOS (Protegida) ---
// Ahora sí la protegemos con 'auth'
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find(); // Busca todos los documentos en la colección User
    res.json(users); // Devuelve la lista de usuarios como JSON
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios: ' + error.message });
  }
});

// --- RUTA: CREAR UN NUEVO USUARIO ---
router.post('/', async (req, res) => {
  try {
    // Encriptamos la contraseña antes de guardarla
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Creamos una nueva instancia del modelo User con los datos recibidos
    const newUser = new User({
      nombre_completo: req.body.nombre_completo,
      'nick-name': req.body['nick-name'], // Usamos corchetes por el guion
      password: hashedPassword,
      rol: req.body.rol,
      // 'activo' y 'firma' usarán sus valores por defecto si no se envían
    });

    // Guardamos el nuevo usuario en la base de datos
    const savedUser = await newUser.save();
    res.status(201).json(savedUser); // Respondemos con el usuario creado y estado 201 (Created)
  } catch (error) {
     // Si hay un error (ej. nickname duplicado), respondemos con estado 400
    res.status(400).json({ message: 'Error al crear usuario: ' + error.message });
  }
});

// --- RUTA: INICIAR SESIÓN (LOGIN) --- (Añadida)
router.post('/login', async (req, res) => {
  try {
    // 1. Buscar si el usuario existe por su nick-name
    const user = await User.findOne({ 'nick-name': req.body['nick-name'] });
    if (!user) {
      // No decimos si fue el usuario o la contraseña para más seguridad
      return res.status(400).json({ message: 'Nick-name o contraseña incorrectos' });
    }

    // 2. Comparar la contraseña enviada con la guardada (hash) en la BD
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Nick-name o contraseña incorrectos' });
    }

    // 3. Si las credenciales son correctas, crear y firmar el Token JWT
    const payload = {
      id: user._id, // ID del usuario
      rol: user.rol  // Rol del usuario
    };

    // Creamos el token
    const token = jwt.sign(
      payload,
      'UNA_CLAVE_SECRETA_MUY_DIFICIL_DE_ADIVINAR', // ¡Esta clave debe ser secreta y segura en un proyecto real!
      { expiresIn: '1h' } // El token será válido por 1 hora
    );

    // 4. Enviamos el token al cliente
    res.json({
      message: '¡Login exitoso!',
      token: token // El frontend guardará este token
    });

  } catch (error) {
    // Error general del servidor
    res.status(500).json({ message: 'Error en el servidor durante el login: ' + error.message });
  }
});
// --- RUTA: ELIMINAR UN USUARIO (Protegida) ---
// Usamos :id para indicar que el ID del usuario vendrá en la URL
router.delete('/:id', auth, async (req, res) => {
  // Verificamos que el usuario que hace la petición sea un 'Jefe' (o 'Sub-jefe')
  // Esta es una capa extra de seguridad
  if (req.user.rol !== 'Jefe' && req.user.rol !== 'Sub-jefe') {
    return res.status(403).json({ message: 'No tienes permiso para eliminar usuarios.' });
  }

  try {
    const userId = req.params.id; // Obtenemos el ID de la URL
    const userToDelete = await User.findById(userId);

    if (!userToDelete) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // --- REGLA DE NEGOCIO ---
    // Evitamos que un Jefe sea borrado
    if (userToDelete.rol === 'Jefe') {
      return res.status(400).json({ message: 'No se puede eliminar a un usuario con rol de Jefe.' });
    }

    // Usamos deleteOne() para borrar el usuario
    await User.deleteOne({ _id: userId });

    res.json({ message: 'Usuario eliminado correctamente.' });

  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario: ' + error.message });
  }
});

module.exports = router; // Exportamos el router para usarlo en index.js