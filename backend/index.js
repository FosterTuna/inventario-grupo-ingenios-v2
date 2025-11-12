const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Inicializar la aplicación
const app = express();
const PORT = 5000; // Puerto para el backend

// Middleware para leer JSON
app.use(express.json());

// Middleware para permitir peticiones de otros orígenes (CORS)
app.use(cors());

// --- Rutas ---
const userRoutes = require('./routes/userRoutes');
app.use('/api/usuarios', userRoutes); // Cualquier petición a /api/usuarios será manejada por userRoutes

const activoRoutes = require('./routes/activoRoutes'); // Asegúrate que esté esta
app.use('/api/activos', activoRoutes);                // y esta

const movimientoRoutes = require('./routes/movimientoRoutes'); // Asegúrate que esté esta
app.use('/api/movimientos', movimientoRoutes);           // y esta

// --- Conexión a la Base de Datos ---
// Usa 'mongodb_inventario_nuevo' si renombraste el servicio en docker-compose.yml
const dbURI = 'mongodb://localhost:27017/inventarioDB_nuevo'; // Usamos un nombre de DB nuevo

mongoose.connect(dbURI)
  .then(() => console.log('✅ Conexión exitosa a MongoDB (nuevo)'))
  .catch(err => console.error('❌ No se pudo conectar a MongoDB', err));

// --- Ruta Básica de Prueba ---
app.get('/', (req, res) => {
  res.send('¡El nuevo servidor backend está funcionando!');
});

// --- Iniciar el Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});