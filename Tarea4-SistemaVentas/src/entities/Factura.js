const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Factura",
  tableName: "facturas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    fecha: {
      type: "date",
    },
  },
  relations: {
    cliente: {
      target: "Cliente",
      type: "many-to-one",
      joinColumn: { name: "id" },
    },
  },
});