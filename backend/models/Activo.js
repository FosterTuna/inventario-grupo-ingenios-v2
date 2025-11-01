const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activoSchema = new Schema({
  id_empresa: { type: Schema.Types.ObjectId, ref: 'Empresa' }, // Referencia a la empresa (opcional por ahora)
  tipo_activo: {
    type: String,
    required: true,
    enum: ['Herramienta', 'Material'] // Solo permite estos dos valores
  },
  nombre: {
    type: String,
    required: true // El nombre es obligatorio
  },
  sku: {
    type: String,
    required: true,
    unique: true // El SKU debe ser único
  },
  descripcion: {
    type: String
  },
  imagen_url: {
    type: String
  },
  stock_total: {
    type: Number,
    required: true,
    default: 0 // Si no se especifica, empieza en 0
  },
  stock_disponible: {
    type: Number,
    required: true,
    default: 0 // Si no se especifica, empieza en 0
  },
  estado_actual: {
    type: String,
    required: true,
    default: 'Disponible', // Valor por defecto
    enum: ['Disponible', 'En Uso', 'Mantenimiento'] // Valores permitidos
  },
  ubicacion: { // Objeto anidado
    bodega: String,
    estante: String
  },
  especificaciones: { // Objeto flexible para detalles variados
    type: Map,
    of: String // Permite pares clave-valor (ej. "marca": "DeWalt")
  },
  costo: { // Objeto anidado para precios
    compra: Number,
    renta_dia: Number
  }
}, { timestamps: true }); // Añade automáticamente createdAt y updatedAt

const Activo = mongoose.model('Activo', activoSchema); // Crea el modelo
module.exports = Activo; // Exporta el modelo para usarlo en otros archivos