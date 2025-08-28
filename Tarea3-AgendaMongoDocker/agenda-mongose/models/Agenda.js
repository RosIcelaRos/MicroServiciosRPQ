const mongoose = require('mongoose');

const agendaSchema = new mongoose.Schema({
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  fecha_nacimiento: { type: Date, required: true },
  direccion: String,
  celular: String,
  correo: String
});

module.exports = mongoose.model('Agenda', agendaSchema);
