import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createConnection } from 'typeorm';
import path from 'path';
import contactoRoutes from './routes/contactoRoutes';

const app = express();

// Configuración de middleware
app.use(cors());
app.use(bodyParser.json());


const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Rutas API
app.use('/api/contactos', contactoRoutes);

// Ruta de fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Conexión a la base de datos e inicio del servidor
createConnection().then(() => {
  console.log('Conexión a la base de datos establecida');
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    
  });
}).catch(error => {
  console.error('Error al conectar a la base de datos:', error);
});