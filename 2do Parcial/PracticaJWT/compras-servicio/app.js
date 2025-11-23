const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const amqp = require('amqplib');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const EVENTS_SERVICE_URL = process.env.EVENTS_SERVICE_URL;
const QUEUE_NAME = 'emails_queue';

async function getDBConnection() {
    return await mysql.createConnection(dbConfig);
}



// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('🔐 Token recibido:', token ? 'Sí' : 'No');
    
    if (!token) {
        return res.status(401).json({ error: 'Token de autorización requerido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('❌ Error verificando token:', err.message);
            return res.status(403).json({ 
                error: 'Token inválido o expirado',
                details: err.message 
            });
        }
        
        console.log('✅ Token decodificado:', decoded);
        
        req.user = {
            userId: decoded.userId || decoded.id || decoded.user_id,
            email: decoded.email,
            name: decoded.username,
        };
        
        console.log('👤 Usuario extraído:', req.user);
        next();
    });
};


// ... (el resto de tus endpoints permanecen igual)

// Crear orden
app.post('/envios', authenticateToken, async (req, res) => {
    try {
        const { vehiculo_id,origen,destino,estado } = req.body;
        const user_id = req.user.userId;

        if (!vehiculo_id ) {
            return res.status(400).json({ error: 'Evento y cantidad válida son requeridos' });
        }

        // Verificar disponibilidad del evento
        // const eventResponse = await fetch(`${EVENTS_SERVICE_URL}/vehiculos/${vehiculo_id}`);
        // if (!eventResponse.ok) {
        //     return res.status(404).json({ error: 'Vehiculo no encontrado' });
        // }

        const event = await eventResponse.json();


        const connection = await getDBConnection();
        const [result] = await connection.execute(
            'INSERT INTO envios (usuario_id, vehiculo_id, origen,destino, estado) VALUES (?, ?, ?, ?,?)',
            [user_id, vehiculo_id, origen,destino,estado ]
        );

        await connection.end();

        res.status(201).json({
            message: 'Orden creada exitosamente',
            orderId: result.insertId,
            total_amount,
            event: {
                id: event.id,
            }
        });
    } catch (error) {
        console.error('Error creando orden:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener órdenes del usuario
app.get('/envio', authenticateToken, async (req, res) => {
    try {
        const connection = await getDBConnection();
        const [orders] = await connection.execute(
            'SELECT * FROM envios WHERE id = ?',
            [req.user.userId]
        );
        await connection.end();

        res.json(orders);
    } catch (error) {
        console.error('Error obteniendo órdenes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
app.get('/envios', async (req, res) => {
    try {
        const connection = await getDBConnection();
        const [orders] = await connection.execute(
            'SELECT * FROM envios ',
        );
        await connection.end();

        res.json(orders);
    } catch (error) {
        console.error('Error obteniendo órdenes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`🛒 Orders Service running on port ${PORT}`);
});