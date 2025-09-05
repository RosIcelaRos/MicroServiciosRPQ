require("reflect-metadata");
const { DataSource } = require("typeorm");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { gql } = require("apollo-server-express");
const Libro = require("./entity/Libro");
const Prestamo = require("./entity/Prestamo");

// Configuración de la fuente de datos
const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "biblioteca_db",
  synchronize: true,
  logging: false,
  entities: [Libro, Prestamo]
});

// Definición del esquema GraphQL
const typeDefs = gql`
  type Libro {
    id: ID!
    titulo: String!
    autor: String!
    isbn: String!
    anio_publicacion: Int!
    prestamos: [Prestamo!]
  }

  type Prestamo {
    id: ID!
    usuario: String!
    fecha_prestamo: String!
    fecha_devolucion: String!
    libro: Libro!
  }

  type Query {
    getLibros: [Libro!]
    getPrestamos: [Prestamo!]
    getPrestamoById(id: ID!): Prestamo
    getPrestamosPorUsuario(usuario: String!): [Prestamo!]
  }

  type Mutation {
    createLibro(
      titulo: String!,
      autor: String!,
      isbn: String!,
      anio_publicacion: Int!
    ): Libro
    
    createPrestamo(
      usuario: String!,
      fecha_prestamo: String!,
      fecha_devolucion: String!,
      libroId: ID!
    ): Prestamo
  }
`;

// Resolvers
const resolvers = {
  Query: {
    getLibros: async () => {
      return await AppDataSource.getRepository("Libro").find({ relations: ["prestamos"] });
    },
    getPrestamos: async () => {
      return await AppDataSource.getRepository("Prestamo").find({ relations: ["libro"] });
    },
    getPrestamoById: async (_, { id }) => {
      return await AppDataSource.getRepository("Prestamo").findOne({
        where: { id },
        relations: ["libro"]
      });
    },
    getPrestamosPorUsuario: async (_, { usuario }) => {
      return await AppDataSource.getRepository("Prestamo").find({
        where: { usuario },
        relations: ["libro"]
      });
    }
  },
  Mutation: {
    createLibro: async (_, { titulo, autor, isbn, anio_publicacion }) => {
      const repo = AppDataSource.getRepository("Libro");
      const libro = repo.create({ titulo, autor, isbn, anio_publicacion });
      return await repo.save(libro);
    },
    createPrestamo: async (_, { usuario, fecha_prestamo, fecha_devolucion, libroId }) => {
      const repoPrestamo = AppDataSource.getRepository("Prestamo");
      const repoLibro = AppDataSource.getRepository("Libro");

      const libro = await repoLibro.findOneBy({ id: libroId });
      if (!libro) throw new Error("Libro no encontrado");

      const prestamo = repoPrestamo.create({
        usuario,
        fecha_prestamo,
        fecha_devolucion,
        libro
      });
      
      return await repoPrestamo.save(prestamo);
    }
  }
};

async function startServer() {
  // Inicializar la fuente de datos primero
  try {
    await AppDataSource.initialize();
    console.log("✅ Conectado a la base de datos");
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error);
    return;
  }

  const app = express();
  const server = new ApolloServer({
    typeDefs,
    resolvers
  });
  
  await server.start();
  server.applyMiddleware({ app });
  
  app.listen(4000, () => {
    console.log(`🚀 Servidor listo en http://localhost:4000${server.graphqlPath}`);
  });
}

startServer();