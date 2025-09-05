const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Cliente",
  tableName: "clientes",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    ci: {
      type: "varchar",
    },
    nombres: {
      type: "varchar",
    },
    apellidos: {
      type: "varchar",
    },
    sexo: {
      type: "varchar",
      length: 1,
    },
  },
});