// backend/models/User.js (CORREGIDO)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  id_empresa: {
    type: Schema.Types.ObjectId,
    ref: 'Empresa',
    // required: true
  },
  nombre_completo: {
    type: String,
    required: true
  },
  'nick-name': {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    required: true,
    // --- CORRECCIÓN CLAVE AQUÍ: Aseguramos que 'Sub-Jefe' (con mayúscula) sea un valor válido ---
    enum: ['Jefe', 'Sub-Jefe', 'Encargado', 'Practicante', 'Trabajador'] 
  },
  activo: {
    type: Boolean,
    default: true
  },
  firma: {
    type: String,
    // required: true
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;