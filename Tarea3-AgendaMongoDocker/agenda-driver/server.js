// Importar dependencias
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MongoDB
const url = 'mongodb://localhost:27017';
const dbName = 'agenda_db';
let db, collection;

MongoClient.connect(url)
  .then(client => {
    console.log('✅ Conectado a MongoDB');
    db = client.db(dbName);
    collection = db.collection('agenda');
  })
  .catch(err => console.error('❌ Error de conexión', err));

// 📌 Crear (POST)
app.post('/agenda', async (req, res) => {
  const result = await collection.insertOne(req.body);
  res.json(result);
});

// 📌 Leer todo (GET)
app.get('/agenda', async (req, res) => {
  const result = await collection.find().toArray();
  res.json(result);
});

// 📌 Leer uno (GET)
app.get('/agenda/:id', async (req, res) => {
  const result = await collection.findOne({ _id: new ObjectId(req.params.id) });
  res.json(result);
});

// 📌 Actualizar (PUT)
app.put('/agenda/:id', async (req, res) => {
  const result = await collection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: req.body }
  );
  res.json(result);
});

// 📌 Eliminar (DELETE)
app.delete('/agenda/:id', async (req, res) => {
  const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
  res.json(result);
});

// Servidor
app.listen(3000, () => console.log('🚀 Servidor en http://localhost:3000'));
