const { createConnection } = require("typeorm");

const connectDB = async () => {
  try {
    await createConnection({
      type: "mysql",
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3307,
      username: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "ventas_db",
      entities: ["src/entities/*.js"],
      synchronize: true, // Solo para desarrollo
      logging: false,
    });
    console.log("Conexión a la base de datos establecida correctamente.");
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    process.exit(1);
  }
};

module.exports = connectDB;