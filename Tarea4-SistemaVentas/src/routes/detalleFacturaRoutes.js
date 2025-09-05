const express = require("express");
const { getAll, getOne, create, update, remove } = require("../controllers/detalleFacturaController");

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /api/facturas/{facturaId}/detalles:
 *   get:
 *     summary: Obtener todos los detalles de una factura
 *     description: Retorna una lista de detalles asociados a una factura con paginación.
 *     parameters:
 *       - in: path
 *         name: facturaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
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
 *         description: Lista de detalles obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/DetalleFactura' } }
 *                 total: { type: integer }
 *                 page: { type: integer }
 *                 limit: { type: integer }
 */
router.get("/:facturaId/detalles", getAll);

/**
 * @swagger
 * /api/facturas/{facturaId}/detalles/{id}:
 *   get:
 *     summary: Obtener un detalle de factura por ID
 *     description: Retorna un detalle específico de una factura.
 *     parameters:
 *       - in: path
 *         name: facturaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del detalle
 *     responses:
 *       200:
 *         description: Detalle encontrado
 *       404:
 *         description: Detalle no encontrado
 */
router.get("/:facturaId/detalles/:id", getOne);

/**
 * @swagger
 * /api/facturas/{facturaId}/detalles:
 *   post:
 *     summary: Crear un detalle de factura
 *     description: Crea un nuevo detalle asociado a una factura.
 *     parameters:
 *       - in: path
 *         name: facturaId
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
 *               cantidad: { type: integer }
 *               precio: { type: number }
 *               producto_id: { type: integer }
 *             required: [cantidad, precio, producto_id]
 *     responses:
 *       201:
 *         description: Detalle creado correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Factura o producto no encontrado
 */
router.post("/:facturaId/detalles", create);

/**
 * @swagger
 * /api/facturas/{facturaId}/detalles/{id}:
 *   put:
 *     summary: Actualizar un detalle de factura
 *     description: Actualiza los datos de un detalle existente.
 *     parameters:
 *       - in: path
 *         name: facturaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del detalle
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cantidad: { type: integer }
 *               precio: { type: number }
 *               producto_id: { type: integer }
 *     responses:
 *       200:
 *         description: Detalle actualizado correctamente
 *       404:
 *         description: Detalle o producto no encontrado
 *       400:
 *         description: Datos inválidos
 */
router.put("/:facturaId/detalles/:id", update);

/**
 * @swagger
 * /api/facturas/{facturaId}/detalles/{id}:
 *   delete:
 *     summary: Eliminar un detalle de factura
 *     description: Elimina un detalle por su ID.
 *     parameters:
 *       - in: path
 *         name: facturaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del detalle
 *     responses:
 *       204:
 *         description: Detalle eliminado correctamente
 *       404:
 *         description: Detalle no encontrado
 */
router.delete("/:facturaId/detalles/:id", remove);

/**
 * @swagger
 * components:
 *   schemas:
 *     DetalleFactura:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         cantidad: { type: integer }
 *         precio: { type: number }
 *         factura: { $ref: '#/components/schemas/Factura' }
 *         producto: { $ref: '#/components/schemas/Producto' }
 *       required: [cantidad, precio, producto_id]
 */
module.exports = router;