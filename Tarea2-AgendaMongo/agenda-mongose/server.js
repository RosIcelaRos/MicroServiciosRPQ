const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Agenda = require('./models/Agenda');

const app = express();
app.use(cors());
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));


// Conectar a MongoDB con Mongoose
mongoose.connect('mongodb://localhost:27017/agenda_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB con Mongoose'))
.catch(err => console.error('❌ Error de conexión', err));

// 📌 Crear
app.post('/agenda', async (req, res) => {
  const nueva = new Agenda(req.body);
  const result = await nueva.save();
  res.json(result);
});

// 📌 Leer todo
app.get('/agenda', async (req, res) => {
  const result = await Agenda.find();
  res.json(result);
});

// 📌 Leer uno
app.get('/agenda/:id', async (req, res) => {
  const result = await Agenda.findById(req.params.id);
  res.json(result);
});

// 📌 Actualizar
app.put('/agenda/:id', async (req, res) => {
  const result = await Agenda.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(result);
});

// 📌 Eliminar
app.delete('/agenda/:id', async (req, res) => {
  const result = await Agenda.findByIdAndDelete(req.params.id);
  res.json(result);
});

app.listen(3000, () => console.log('🚀 Servidor en http://localhost:3000'));
