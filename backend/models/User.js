const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  id_empresa: {
    type: Schema.Types.ObjectId,
    ref: 'Empresa', // Esto es opcional por ahora, pero bueno para el futuro
    // required: true // Puedes hacerlo requerido más adelante si necesitas vincular empresas
  },
  nombre_completo: {
    type: String,
    required: true
  },
  'nick-name': { // Se usan comillas porque el nombre contiene un guion
    type: String,
    required: true,
    unique: true // Asegura que no haya nicknames duplicados
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    required: true,
    enum: ['Jefe', 'Sub-jefe', 'Encargado', 'Practicante', 'Trabajador'] // Define los roles válidos
  },
  activo: {
    type: Boolean,
    default: true // Los usuarios empiezan activos por defecto
  },
  firma: {
    type: String,
    // required: true // Puedes hacerlo requerido más adelante
  }
}, { timestamps: true }); // timestamps añade createdAt y updatedAt automáticamente

const User = mongoose.model('User', userSchema);

module.exports = User;