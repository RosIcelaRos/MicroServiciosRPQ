const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'mysql-db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'usuarios_db',
  timezone: '+00:00',
  dateStrings: true
};

// Configuración de Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// Variable global para la conexión a la base de datos
let db;

// Función para conectar a la base de datos
async function connectDB() {
  try {
    // Esperar un poco antes de conectar (para que MySQL esté listo)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Primero conectar sin especificar la base de datos
    const tempDb = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    console.log('Conectado a MySQL');
    
    // Crear la base de datos si no existe (usar query en lugar de execute)
    await tempDb.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await tempDb.end();
    
    // Ahora conectar a la base de datos específica
    db = await mysql.createConnection(dbConfig);
    
    // Crear tabla de usuarios si no existe
    await db.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_fecha_registro (fecha_registro)
      )
    `);
    
    console.log('Base de datos y tabla usuarios configuradas correctamente');
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    // Reintentar conexión después de 5 segundos
    setTimeout(connectDB, 5000);
  }
}

// Rutas

// Página principal - Listar usuarios
app.get('/', async (req, res) => {
  try {
    if (!db) {
      return res.render('index', { usuarios: [], error: 'Conectando a la base de datos...' });
    }
    
    const [usuarios] = await db.execute('SELECT * FROM usuarios ORDER BY fecha_registro DESC');
    res.render('index', { usuarios, error: null });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.render('index', { usuarios: [], error: 'Error cargando usuarios' });
  }
});

// Mostrar formulario para agregar usuario
app.get('/agregar', (req, res) => {
  res.render('agregar', { error: null, nombre: '', email: '' });
});

// Procesar formulario para agregar usuario
app.post('/usuarios', async (req, res) => {
  const { nombre, email } = req.body;
  
  if (!db) {
    return res.render('agregar', { error: 'Base de datos no disponible', nombre, email });
  }
  
  // Validaciones básicas
  if (!nombre || !email) {
    return res.render('agregar', { error: 'Todos los campos son requeridos', nombre, email });
  }
  
  try {
    await db.execute('INSERT INTO usuarios (nombre, email) VALUES (?, ?)', [nombre, email]);
    res.redirect('/');
  } catch (error) {
    console.error('Error agregando usuario:', error);
    let errorMsg = 'Error agregando usuario';
    if (error.code === 'ER_DUP_ENTRY') {
      errorMsg = 'El email ya existe';
    }
    res.render('agregar', { error: errorMsg, nombre, email });
  }
});

// Eliminar usuario
app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!db) {
    return res.redirect('/');
  }
  
  try {
    await db.execute('DELETE FROM usuarios WHERE id = ?', [id]);
    res.redirect('/');
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.redirect('/');
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  connectDB();
});

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  if (db) {
    await db.end();
  }
  process.exit(0);
});