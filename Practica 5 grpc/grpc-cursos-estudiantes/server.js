// server.js
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, "proto", "universidad.proto");

// Cargar el proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const universidad = protoDescriptor.universidad;

// Base de datos en memoria
const estudiantes = new Map(); // ci -> Estudiante
const cursos = new Map(); // codigo -> Curso
const inscripciones = new Map(); // ci -> Set(codigos_curso)

// Implementación de los métodos
const serviceImpl = {
    // Servicios de Estudiantes
    AgregarEstudiante: (call, callback) => {
        try {
            const nuevoEstudiante = call.request;
            
            if (estudiantes.has(nuevoEstudiante.ci)) {
                return callback({
                    code: grpc.status.ALREADY_EXISTS,
                    message: `Ya existe un estudiante con CI: ${nuevoEstudiante.ci}`
                });
            }
            
            estudiantes.set(nuevoEstudiante.ci, nuevoEstudiante);
            inscripciones.set(nuevoEstudiante.ci, new Set());
            
            console.log(`Estudiante agregado: ${nuevoEstudiante.nombres} ${nuevoEstudiante.apellidos}`);
            callback(null, { estudiante: nuevoEstudiante });
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            });
        }
    },

    ObtenerEstudiante: (call, callback) => {
        try {
            const { ci } = call.request;
            const estudiante = estudiantes.get(ci);
            
            if (estudiante) {
                callback(null, { estudiante });
            } else {
                callback({
                    code: grpc.status.NOT_FOUND,
                    message: `Estudiante con CI ${ci} no encontrado`
                });
            }
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            });
        }
    },

    ListarEstudiantes: (call, callback) => {
        try {
            const estudiantesList = Array.from(estudiantes.values());
            callback(null, { estudiantes: estudiantesList });
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            });
        }
    },

    // Servicios de Cursos
    AgregarCurso: (call, callback) => {
        try {
            const nuevoCurso = call.request;
            
            if (cursos.has(nuevoCurso.codigo)) {
                return callback({
                    code: grpc.status.ALREADY_EXISTS,
                    message: `Ya existe un curso con código: ${nuevoCurso.codigo}`
                });
            }
            
            cursos.set(nuevoCurso.codigo, nuevoCurso);
            
            console.log(`Curso agregado: ${nuevoCurso.nombre} (${nuevoCurso.codigo})`);
            callback(null, { curso: nuevoCurso });
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            });
        }
    },

    ObtenerCurso: (call, callback) => {
        try {
            const { codigo } = call.request;
            const curso = cursos.get(codigo);
            
            if (curso) {
                callback(null, { curso });
            } else {
                callback({
                    code: grpc.status.NOT_FOUND,
                    message: `Curso con código ${codigo} no encontrado`
                });
            }
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            });
        }
    },

    ListarCursos: (call, callback) => {
        try {
            const cursosList = Array.from(cursos.values());
            callback(null, { cursos: cursosList });
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            });
        }
    },

    // Servicios de Inscripción
    InscribirEstudiante: (call, callback) => {
        try {
            const { ci_estudiante, codigo_curso } = call.request;
            
            // Verificar si el estudiante existe
            if (!estudiantes.has(ci_estudiante)) {
                return callback({
                    code: grpc.status.NOT_FOUND,
                    message: `Estudiante con CI ${ci_estudiante} no encontrado`
                });
            }
            
            // Verificar si el curso existe
            if (!cursos.has(codigo_curso)) {
                return callback({
                    code: grpc.status.NOT_FOUND,
                    message: `Curso con código ${codigo_curso} no encontrado`
                });
            }
            
            // Verificar si ya está inscrito
            const cursosDelEstudiante = inscripciones.get(ci_estudiante);
            if (cursosDelEstudiante.has(codigo_curso)) {
                return callback({
                    code: grpc.status.ALREADY_EXISTS,
                    message: `El estudiante ya está inscrito en este curso`
                });
            }
            
            // Realizar la inscripción
            cursosDelEstudiante.add(codigo_curso);
            
            const estudiante = estudiantes.get(ci_estudiante);
            const curso = cursos.get(codigo_curso);
            
            console.log(`Inscripción exitosa: ${estudiante.nombres} en ${curso.nombre}`);
            
            callback(null, { 
                success: true, 
                message: `Inscripción exitosa: ${estudiante.nombres} en ${curso.nombre}` 
            });
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            });
        }
    },

    ListarCursosDeEstudiante: (call, callback) => {
        try {
            const { ci } = call.request;
            
            if (!estudiantes.has(ci)) {
                return callback({
                    code: grpc.status.NOT_FOUND,
                    message: `Estudiante con CI ${ci} no encontrado`
                });
            }
            
            const cursosDelEstudiante = inscripciones.get(ci);
            const cursosList = Array.from(cursosDelEstudiante)
                .map(codigo => cursos.get(codigo))
                .filter(curso => curso !== undefined);
            
            callback(null, { cursos: cursosList });
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            });
        }
    },

    ListarEstudiantesDeCurso: (call, callback) => {
        try {
            const { codigo } = call.request;
            
            if (!cursos.has(codigo)) {
                return callback({
                    code: grpc.status.NOT_FOUND,
                    message: `Curso con código ${codigo} no encontrado`
                });
            }
            
            const estudiantesDelCurso = Array.from(inscripciones.entries())
                .filter(([ci, cursosSet]) => cursosSet.has(codigo))
                .map(([ci, cursosSet]) => estudiantes.get(ci))
                .filter(estudiante => estudiante !== undefined);
            
            callback(null, { estudiantes: estudiantesDelCurso });
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            });
        }
    }
};

// Crear y configurar el servidor
const server = new grpc.Server();
server.addService(universidad.UniversidadService.service, serviceImpl);

const PORT = "50051";
server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, bindPort) => {
        if (err) {
            console.error("Error al iniciar el servidor:", err);
            return;
        }
        console.log(` Servidor gRPC escuchando en el puerto ${bindPort}`);
        console.log(" Servicios disponibles:");
        console.log("  - AgregarEstudiante");
        console.log("  - ObtenerEstudiante");
        console.log("  - ListarEstudiantes");
        console.log("  - AgregarCurso");
        console.log("  - ObtenerCurso");
        console.log("  - ListarCursos");
        console.log("  - InscribirEstudiante");
        console.log("  - ListarCursosDeEstudiante");
        console.log("  - ListarEstudiantesDeCurso");
    }
);