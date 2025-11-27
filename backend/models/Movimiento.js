const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movimientoSchema = new Schema({
  id_usuario_adjunta: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  id_usuario_dispone: { // Será NULL si es un visitante
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  tipo_movimiento: {
    type: String,
    required: true,
    enum: ['Entrada Inicial', 'Salida Uso', 'Salida Renta', 'Devolución']
  },
  
  // --- CAMPOS NUEVOS PARA VISITANTES ---
  nombre_visitante: { 
    type: String,
    required: false // Opcional
  },
  apellidos_visitante: { 
    type: String,
    required: false // Opcional
  },
  // --- FIN DE CAMPOS NUEVOS ---

  observaciones: {
    type: String
  }
}, { timestamps: { createdAt: 'fecha_movimiento', updatedAt: false } });

const Movimiento = mongoose.model('Movimiento', movimientoSchema);
module.exports = Movimiento;