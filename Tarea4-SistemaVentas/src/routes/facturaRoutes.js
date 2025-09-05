const express = require("express");
const { getAll, getOne, create, update, remove } = require("../controllers/facturaController");

const router = express.Router();

/**
 * @swagger
 * /api/facturas:
 *   get:
 *     summary: Obtener todas las facturas
 *     description: Retorna una lista de facturas con paginación.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Cantidad de elementos por página
 *     responses:
 *       200:
 *         description: Lista de facturas obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Factura' } }
 *                 total: { type: integer }
 *                 page: { type: integer }
 *                 limit: { type: integer }
 */
router.get("/", getAll);

/**
 * @swagger
 * /api/facturas/{id}:
 *   get:
 *     summary: Obtener una factura por ID
 *     description: Retorna una factura específica.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura encontrada
 *       404:
 *         description: Factura no encontrada
 */
router.get("/:id", getOne);

/**
 * @swagger
 * /api/facturas:
 *   post:
 *     summary: Crear una factura
 *     description: Crea una nueva factura asociada a un cliente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha: { type: string, format: date }
 *               cliente_id: { type: integer }
 *             required: [fecha, cliente_id]
 *     responses:
 *       201:
 *         description: Factura creada correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Cliente no encontrado
 */
router.post("/", create);

/**
 * @swagger
 * /api/facturas/{id}:
 *   put:
 *     summary: Actualizar una factura
 *     description: Actualiza los datos de una factura existente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha: { type: string, format: date }
 *               cliente_id: { type: integer }
 *     responses:
 *       200:
 *         description: Factura actualizada correctamente
 *       404:
 *         description: Factura o cliente no encontrado
 *       400:
 *         description: Datos inválidos
 */
router.put("/:id", update);

/**
 * @swagger
 * /api/facturas/{id}:
 *   delete:
 *     summary: Eliminar una factura
 *     description: Elimina una factura por su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *     responses:
 *       204:
 *         description: Factura eliminada correctamente
 *       404:
 *         description: Factura no encontrada
 */
router.delete("/:id", remove);

/**
 * @swagger
 * components:
 *   schemas:
 *     Factura:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         fecha: { type: string, format: date }
 *         cliente: { $ref: '#/components/schemas/Cliente' }
 *       required: [fecha, cliente_id]
 */
module.exports = router;