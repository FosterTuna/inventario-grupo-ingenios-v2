const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movimientoSchema = new Schema({
  id_usuario_adjunta: { // Quién registra/entrega
    type: Schema.Types.ObjectId,
    ref: 'User', // Referencia a la colección 'usuarios'
    required: true
  },
  id_usuario_dispone: { // Quién recibe (si aplica)
    type: Schema.Types.ObjectId,
    ref: 'User' // Referencia a la colección 'usuarios'
  },
  tipo_movimiento: {
    type: String,
    required: true,
    enum: ['Entrada Inicial', 'Salida Uso', 'Salida Renta', 'Devolución'] // Tipos permitidos
  },
  observaciones: {
    type: String
  }
  // La fecha se añadirá automáticamente con timestamps
}, { timestamps: { createdAt: 'fecha_movimiento', updatedAt: false } }); // Usa 'createdAt' como la fecha del movimiento

const Movimiento = mongoose.model('Movimiento', movimientoSchema);
module.exports = Movimiento;