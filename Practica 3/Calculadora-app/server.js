const express = require('express');
const path = require('path');
const app = express();
const PORT = 8081;

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para realizar cálculos
app.post('/calcular', (req, res) => {
    const { a, b, operacion } = req.body;
    
    // Validar que los campos no estén vacíos
    if (a === '' || b === '' || !operacion) {
        return res.json({ error: 'Todos los campos son requeridos' });
    }

    const numA = parseFloat(a);
    const numB = parseFloat(b);

    // Validar que sean números
    if (isNaN(numA) || isNaN(numB)) {
        return res.json({ error: 'Los valores deben ser números válidos' });
    }

    let resultado;
    let operacionTexto;

    try {
        switch (operacion) {
            case 'sumar':
                resultado = numA + numB;
                operacionTexto = 'Suma';
                break;
            case 'restar':
                resultado = numA - numB;
                operacionTexto = 'Resta';
                break;
            case 'multiplicar':
                resultado = numA * numB;
                operacionTexto = 'Multiplicación';
                break;
            case 'dividir':
                if (numB === 0) {
                    throw new Error('No se puede dividir por cero');
                }
                resultado = numA / numB;
                operacionTexto = 'División';
                break;
            default:
                throw new Error('Operación no válida');
        }

        res.json({
            success: true,
            resultado: resultado,
            operacion: operacionTexto,
            a: numA,
            b: numB
        });

    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});