// client.js
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

// Crear cliente
const client = new universidad.UniversidadService(
    "localhost:50051",
    grpc.credentials.createInsecure()
);

// Función auxiliar para manejar callbacks
const promisify = (method, request) => {
    return new Promise((resolve, reject) => {
        method.call(client, request, (err, response) => {
            if (err) {
                reject(err);
            } else {
                resolve(response);
            }
        });
    });
};

// Demo del sistema
async function demostrarSistema() {
    console.log("Iniciando demostración del sistema universitario...\n");
    
    try {
        // 1. Registrar un estudiante
        console.log("1. Registrando un estudiante...");
        const estudiante = {
            ci: "12345",
            nombres: "Ros",
            apellidos: "Icela",
            carrera: "Ingeniería de Sistemas"
        };
        
        await promisify(client.AgregarEstudiante, estudiante);
        console.log(" Estudiante registrado:", estudiante.nombres, estudiante.apellidos);
        
        // 2. Registrar dos cursos
        console.log("\n2.  Registrando cursos...");
        
        const curso1 = {
            codigo: "SIS-103",
            nombre: "Fundamentos de Programación",
            docente: "Dr. Carlos Rodríguez"
        };
        
        const curso2 = {
            codigo: "MAT-20",
            nombre: "Cálculo Diferencial",
            docente: "Dra. Ana Martínez"
        };
        
        await promisify(client.AgregarCurso, curso1);
        console.log(" Curso registrado:", curso1.nombre);
        
        await promisify(client.AgregarCurso, curso2);
        console.log(" Curso registrado:", curso2.nombre);
        
        // 3. Inscribir al estudiante en ambos cursos
        console.log("\n3.  Inscribiendo estudiante en cursos...");
        
        await promisify(client.InscribirEstudiante, {
            ci_estudiante: estudiante.ci,
            codigo_curso: curso1.codigo
        });
        console.log("Inscrito en:", curso1.nombre);
        
        await promisify(client.InscribirEstudiante, {
            ci_estudiante: estudiante.ci,
            codigo_curso: curso2.codigo
        });
        console.log(" Inscrito en:", curso2.nombre);
        
        // Intentar inscripción duplicada (debe fallar)
        try {
            await promisify(client.InscribirEstudiante, {
                ci_estudiante: estudiante.ci,
                codigo_curso: curso1.codigo
            });
        } catch (err) {
            console.log(" Error esperado (inscripción duplicada):", err.message);
        }
        
        // 4. Consultar los cursos del estudiante
        console.log("\n4.  Consultando cursos del estudiante...");
        const cursosEstudiante = await promisify(client.ListarCursosDeEstudiante, { ci: estudiante.ci });
        console.log(" Cursos de", estudiante.nombres + ":");
        cursosEstudiante.cursos.forEach(curso => {
            console.log("   -", curso.nombre, `(${curso.codigo}) - ${curso.docente}`);
        });
        
        // 5. Consultar los estudiantes de un curso
        console.log("\n5.  Consultando estudiantes del curso de Fundamentos de Programación...");
        const estudiantesCurso = await promisify(client.ListarEstudiantesDeCurso, { codigo: curso1.codigo });
        console.log(" Estudiantes inscritos en", curso1.nombre + ":");
        estudiantesCurso.estudiantes.forEach(est => {
            console.log("   -", est.nombres, est.apellidos, `(${est.ci}) - ${est.carrera}`);
        });
        
        // 6. Listar todos los estudiantes y cursos (extra)
        console.log("\n6.  Resumen completo del sistema...");
        
        const todosEstudiantes = await promisify(client.ListarEstudiantes, {});
        console.log(" Todos los estudiantes registrados:");
        todosEstudiantes.estudiantes.forEach(est => {
            console.log("   -", est.nombres, est.apellidos, `(CI: ${est.ci})`);
        });
        
        const todosCursos = await promisify(client.ListarCursos, {});
        console.log("\n Todos los cursos registrados:");
        todosCursos.cursos.forEach(curso => {
            console.log("   -", curso.nombre, `(${curso.codigo}) - ${curso.docente}`);
        });
        
        console.log("\n ¡Demostración completada exitosamente!");
        
    } catch (error) {
        console.error(" Error durante la demostración:", error.message);
    }
}

// Ejecutar la demostración
demostrarSistema();