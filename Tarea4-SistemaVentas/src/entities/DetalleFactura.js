const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "DetalleFactura",
  tableName: "detalles_facturas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    cantidad: {
      type: "int",
    },
    precio: {
      type: "decimal",
      precision: 10,
      scale: 2,
    },
  },
  relations: {
    factura: {
      target: "Factura",
      type: "many-to-one",
      joinColumn: { name: "factura_id" },
    },
    producto: {
      target: "Producto",
      type: "many-to-one",
      joinColumn: { name: "producto_id" },
    },
  },
});