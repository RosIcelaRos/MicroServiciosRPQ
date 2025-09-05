require("dotenv").config();
const express = require("express");
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const connectDB = require("./ormconfig");
const productoRoutes = require("./routes/productoRoutes");
const clienteRoutes = require("./routes/clientesRoutes");
const facturaRoutes = require("./routes/facturaRoutes");
const detalleFacturaRoutes = require("./routes/detalleFacturaRoutes");

const app = express();

// Configuración de middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Definir rutas
app.use("/api/productos", productoRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/facturas", facturaRoutes);
app.use("/api/facturas", detalleFacturaRoutes); // Para rutas anidadas como /api/facturas/:facturaId/detalles

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Sistema de Ventas",
      version: "1.0.0",
      description: "Documentación de la API para gestionar productos, clientes, facturas y detalles de facturas",
    },
    servers: [{ url: "http://localhost:5000", description: "Servidor Local" }],
  },
  apis: [path.join(__dirname, "routes/*.js")],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Ruta principal
app.get("/", (req, res) => {
  res.send("Bienvenido a la API del Sistema de Ventas");
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📄 Swagger en http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("❌ Error al conectar con la base de datos:", err);
  });