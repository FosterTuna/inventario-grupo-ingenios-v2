const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const detalleMovimientoSchema = new Schema({
  id_movimiento: { // Vínculo con el encabezado del movimiento
    type: Schema.Types.ObjectId,
    ref: 'Movimiento', // Referencia a la colección 'movimientos'
    required: true
  },
  id_activo: { // Vínculo con el activo específico que se movió
    type: Schema.Types.ObjectId,
    ref: 'Activo', // Referencia a la colección 'activos'
    required: true
  },
  cantidad: { // Cuántas unidades de ESE activo se movieron
    type: Number,
    required: true
  }
});
// No necesita timestamps propios, depende del movimiento principal

const DetalleMovimiento = mongoose.model('DetalleMovimiento', detalleMovimientoSchema);
module.exports = DetalleMovimiento;