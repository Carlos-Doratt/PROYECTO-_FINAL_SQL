db.createCollection("reportes_desempenio", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["periodo", "metricas", "fechaGeneracion"],
      properties: {
        periodo: { bsonType: "string" },
        metricas: {
          bsonType: "object",
          required: ["promedioGeneral", "tasaAprobacion"],
          properties: {
            // Acepta INT o DOUBLE
            promedioGeneral: { bsonType: ["double", "int"], minimum: 0.0, maximum: 100.0 },
            tasaAprobacion: { bsonType: ["double", "int"], minimum: 0.0, maximum: 100.0 },
            estudiantesRiesgo: { bsonType: "int", minimum: 0 },
            tendenciaRendimiento: { bsonType: "string", enum: ["ascendente", "descendente", "estable"] }
          }
        },
        topEstudiantes: { 
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["estudianteId", "nombre", "promedio"],
            properties: {
              estudianteId: { bsonType: "int" },
              nombre: { bsonType: "string" },
              // Acepta INT o DOUBLE
              promedio: { bsonType: ["double", "int"] }
            }
          }
        },
        fechaGeneracion: { bsonType: "date" }
      }
    }
  }
})
{ ok: 1 }
db.createCollection("historico_actividad", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["estudianteId", "eventos"],
      properties: {
        estudianteId: { bsonType: "int" },
        eventos: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["tipo", "fecha"],
            properties: {
              tipo: { bsonType: "string", enum: ["calificacion_agregada", "acceso_sistema", "actualizacion_perfil"] },
              fecha: { bsonType: "date" },
              detalle: { bsonType: ["string", "null"] },
              dispositivo: { bsonType: ["string", "null"] }
            }
          }
        },
        ultimaActividad: { bsonType: "date" }
      }
    }
  }
})
{ ok: 1 }
db.createCollection("analitica_docente", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      // Cambio clave aquí: Se añade 'nombre' a los campos obligatorios
      required: ["profesorId", "nombre", "periodo", "estadisticas"],
      properties: {
        profesorId: { bsonType: "int" },
        nombre: { bsonType: "string" }, // Se asegura que sea string
        periodo: { bsonType: "string" },
        estadisticas: {
          bsonType: "object",
          required: ["promedioSecciones", "tasaAprobacion"],
          properties: {
            // Acepta INT o DOUBLE
            promedioSecciones: { bsonType: ["double", "int"], minimum: 0.0, maximum: 100.0 },
            tasaAprobacion: { bsonType: ["double", "int"], minimum: 0.0, maximum: 100.0 },
            // Acepta INT o DOUBLE
            desviacionCalificaciones: { bsonType: ["double", "int"] },
            // Se asegura que sea string, ya que contiene el signo '%'
            comparativaPeriodoAnterior: { bsonType: "string" }, 
            totalEstudiantes: { bsonType: "int" },
            seccionesImpartidas: { bsonType: "int" }
          }
        },
        asignaturas: { bsonType: "array", items: { bsonType: "string" } }
      }
    }
  }
})
{ ok: 1 }
db.createCollection("sincronizacion_fallos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["entidad", "operacion", "fechaIntento"],
      properties: {
        entidad: { bsonType: "string" },
        operacion: { bsonType: "string" },
        datos: { bsonType: "object" },
        error: { bsonType: "string" },
        fechaIntento: { bsonType: "date" },
        reintentos: { bsonType: "int", minimum: 0 },
        estado: { bsonType: "string", enum: ["pendiente", "procesado", "error"] }
      }
    }
  }
})
{ ok: 1 }
db.reportes_desempenio.insertMany([
  {
    periodo: "2025-02",
    metricas: { promedioGeneral: 78.5, tasaAprobacion: 85.2, estudiantesRiesgo: 12, tendenciaRendimiento: "ascendente" },
    topEstudiantes: [
      { estudianteId: 1, nombre: "Sofia Perez", promedio: 95.5 },
      { estudianteId: 3, nombre: "Maria Garcia", promedio: 88.0 },
      { estudianteId: 2, nombre: "Juan Lopez", promedio: 86.5 }
    ],
    fechaGeneracion: ISODate("2025-02-15T10:00:00Z")
  },
  {
    periodo: "2025-01",
    metricas: { promedioGeneral: 75.8, tasaAprobacion: 82.1, estudiantesRiesgo: 15, tendenciaRendimiento: "estable" },
    topEstudiantes: [
      { estudianteId: 1, nombre: "Sofia Perez", promedio: 92.0 },
      { estudianteId: 4, nombre: "Pedro Rodriguez", promedio: 87.5 }
    ],
    fechaGeneracion: ISODate("2025-01-20T09:30:00Z")
  },
  {
    periodo: "2024-02",
    metricas: { promedioGeneral: 76.2, tasaAprobacion: 80.5, estudiantesRiesgo: 18, tendenciaRendimiento: "descendente" },
    topEstudiantes: [
      { estudianteId: 5, nombre: "Lucia Martinez", promedio: 90.5 },
      { estudianteId: 1, nombre: "Sofia Perez", promedio: 89.0 }
    ],
    fechaGeneracion: ISODate("2024-02-18T11:15:00Z")
  },
  {
    periodo: "2024-01",
    metricas: { promedioGeneral: 74.9, tasaAprobacion: 78.3, estudiantesRiesgo: 22, tendenciaRendimiento: "descendente" },
    topEstudiantes: [
      { estudianteId: 3, nombre: "Maria Garcia", promedio: 91.2 },
      { estudianteId: 6, nombre: "David Sanchez", promedio: 86.8 }
    ],
    fechaGeneracion: ISODate("2024-01-25T14:20:00Z")
  },
  {
    periodo: "2023-02",
    metricas: { promedioGeneral: 77.1, tasaAprobacion: 83.6, estudiantesRiesgo: 14, tendenciaRendimiento: "ascendente" },
    topEstudiantes: [
      { estudianteId: 2, nombre: "Juan Lopez", promedio: 93.5 },
      { estudianteId: 1, nombre: "Sofia Perez", promedio: 90.8 }
    ],
    fechaGeneracion: ISODate("2023-02-20T08:45:00Z")
  },
  {
    periodo: "2023-01",
    metricas: { promedioGeneral: 73.5, tasaAprobacion: 76.9, estudiantesRiesgo: 25, tendenciaRendimiento: "estable" },
    topEstudiantes: [
      { estudianteId: 4, nombre: "Pedro Rodriguez", promedio: 88.9 },
      { estudianteId: 7, nombre: "Elena Torres", promedio: 85.4 }
    ],
    fechaGeneracion: ISODate("2023-01-22T10:30:00Z")
  },
  {
    periodo: "2022-02",
    metricas: { promedioGeneral: 75.3, tasaAprobacion: 79.8, estudiantesRiesgo: 19, tendenciaRendimiento: "ascendente" },
    topEstudiantes: [
      { estudianteId: 8, nombre: "Javier Ramirez", promedio: 92.1 },
      { estudianteId: 5, nombre: "Lucia Martinez", promedio: 87.6 }
    ],
    fechaGeneracion: ISODate("2022-02-17T13:15:00Z")
  },
  {
    periodo: "2022-01",
    metricas: { promedioGeneral: 72.8, tasaAprobacion: 75.2, estudiantesRiesgo: 28, tendenciaRendimiento: "descendente" },
    topEstudiantes: [
      { estudianteId: 9, nombre: "Carla Morales", promedio: 89.7 },
      { estudianteId: 3, nombre: "Maria Garcia", promedio: 86.3 }
    ],
    fechaGeneracion: ISODate("2022-01-19T16:40:00Z")
  },
  {
    periodo: "2021-02",
    metricas: { promedioGeneral: 76.7, tasaAprobacion: 81.4, estudiantesRiesgo: 16, tendenciaRendimiento: "ascendente" },
    topEstudiantes: [
      { estudianteId: 1, nombre: "Sofia Perez", promedio: 94.2 },
      { estudianteId: 10, nombre: "Mario Ruiz", promedio: 88.9 }
    ],
    fechaGeneracion: ISODate("2021-02-21T09:25:00Z")
  },
  {
    periodo: "2021-01",
    metricas: { promedioGeneral: 74.2, tasaAprobacion: 77.8, estudiantesRiesgo: 21, tendenciaRendimiento: "estable" },
    topEstudiantes: [
      { estudianteId: 6, nombre: "David Sanchez", promedio: 91.8 },
      { estudianteId: 2, nombre: "Juan Lopez", promedio: 87.2 }
    ],
    fechaGeneracion: ISODate("2021-01-24T11:50:00Z")
  },
  {
    periodo: "2020-02",
    metricas: { promedioGeneral: 73.9, tasaAprobacion: 76.5, estudiantesRiesgo: 24, tendenciaRendimiento: "descendente" },
    topEstudiantes: [
      { estudianteId: 7, nombre: "Elena Torres", promedio: 90.1 },
      { estudianteId: 4, nombre: "Pedro Rodriguez", promedio: 85.7 }
    ],
    fechaGeneracion: ISODate("2020-02-23T14:10:00Z")
  },
  {
    periodo: "2020-01",
    metricas: { promedioGeneral: 71.5, tasaAprobacion: 74.1, estudiantesRiesgo: 31, tendenciaRendimiento: "estable" },
    topEstudiantes: [
      { estudianteId: 8, nombre: "Javier Ramirez", promedio: 87.4 },
      { estudianteId: 5, nombre: "Lucia Martinez", promedio: 83.9 }
    ],
    fechaGeneracion: ISODate("2020-01-26T15:35:00Z")
  }
])
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId('68fe902bbd06d3e78dd4448a'),
    '1': ObjectId('68fe902bbd06d3e78dd4448b'),
    '2': ObjectId('68fe902bbd06d3e78dd4448c'),
    '3': ObjectId('68fe902bbd06d3e78dd4448d'),
    '4': ObjectId('68fe902bbd06d3e78dd4448e'),
    '5': ObjectId('68fe902bbd06d3e78dd4448f'),
    '6': ObjectId('68fe902bbd06d3e78dd44490'),
    '7': ObjectId('68fe902bbd06d3e78dd44491'),
    '8': ObjectId('68fe902bbd06d3e78dd44492'),
    '9': ObjectId('68fe902bbd06d3e78dd44493'),
    '10': ObjectId('68fe902bbd06d3e78dd44494'),
    '11': ObjectId('68fe902bbd06d3e78dd44495')
  }
}
db.historico_actividad.insertMany([
  {
    estudianteId: 1,
    eventos: [
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-10T08:30:00Z"), detalle: "Tarea 1 - 95pts - Lenguaje" },
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-12T14:20:00Z"), detalle: "Examen Final - 80pts - Matemática" },
      { tipo: "acceso_sistema", fecha: ISODate("2025-02-15T09:15:00Z"), dispositivo: "mobile" }
    ],
    ultimaActividad: ISODate("2025-02-15T09:15:00Z")
  },
  {
    estudianteId: 2,
    eventos: [
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-11T10:45:00Z"), detalle: "Tarea 1 - 78pts - Lenguaje" },
      { tipo: "acceso_sistema", fecha: ISODate("2025-02-14T16:30:00Z"), dispositivo: "desktop" }
    ],
    ultimaActividad: ISODate("2025-02-14T16:30:00Z")
  },
  {
    estudianteId: 3,
    eventos: [
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-09T11:20:00Z"), detalle: "Examen Final - 85pts - Lenguaje" },
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-13T15:45:00Z"), detalle: "Tarea 2 - 60pts - Matemática" },
      { tipo: "acceso_sistema", fecha: ISODate("2025-02-16T08:00:00Z"), dispositivo: "tablet" }
    ],
    ultimaActividad: ISODate("2025-02-16T08:00:00Z")
  },
  {
    estudianteId: 4,
    eventos: [
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-08T13:10:00Z"), detalle: "Tarea 2 - 88pts - Lenguaje" },
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-14T09:30:00Z"), detalle: "Examen Final - 90pts - Matemática" },
      { tipo: "acceso_sistema", fecha: ISODate("2025-02-17T11:45:00Z"), dispositivo: "desktop" }
    ],
    ultimaActividad: ISODate("2025-02-17T11:45:00Z")
  },
  {
    estudianteId: 5,
    eventos: [
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-07T14:25:00Z"), detalle: "Tarea 1 - 75pts - Lenguaje" },
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-15T10:15:00Z"), detalle: "Examen Final - 82pts - Matemática" },
      { tipo: "acceso_sistema", fecha: ISODate("2025-02-18T07:30:00Z"), dispositivo: "mobile" }
    ],
    ultimaActividad: ISODate("2025-02-18T07:30:00Z")
  },
  {
    estudianteId: 6,
    eventos: [
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-06T16:40:00Z"), detalle: "Tarea 2 - 80pts - Lenguaje" },
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-16T12:20:00Z"), detalle: "Examen Final - 85pts - Matemática" },
      { tipo: "acceso_sistema", fecha: ISODate("2025-02-19T14:50:00Z"), dispositivo: "desktop" }
    ],
    ultimaActividad: ISODate("2025-02-19T14:50:00Z")
  },
  {
    estudianteId: 7,
    eventos: [
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-05T09:55:00Z"), detalle: "Tarea 1 - 92pts - Lenguaje" },
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-17T08:40:00Z"), detalle: "Examen Final - 78pts - Matemática" },
      { tipo: "acceso_sistema", fecha: ISODate("2025-02-20T10:25:00Z"), dispositivo: "tablet" }
    ],
    ultimaActividad: ISODate("2025-02-20T10:25:00Z")
  },
  {
    estudianteId: 8,
    eventos: [
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-04T11:30:00Z"), detalle: "Tarea 2 - 84pts - Lenguaje" },
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-18T13:15:00Z"), detalle: "Examen Final - 91pts - Matemática" },
      { tipo: "acceso_sistema", fecha: ISODate("2025-02-21T16:05:00Z"), dispositivo: "mobile" }
    ],
    ultimaActividad: ISODate("2025-02-21T16:05:00Z")
  },
  {
    estudianteId: 9,
    eventos: [
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-03T15:20:00Z"), detalle: "Tarea 1 - 79pts - Lenguaje" },
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-19T14:50:00Z"), detalle: "Examen Final - 86pts - Matemática" },
      { tipo: "acceso_sistema", fecha: ISODate("2025-02-22T08:35:00Z"), dispositivo: "desktop" }
    ],
    ultimaActividad: ISODate("2025-02-22T08:35:00Z")
  },
  {
    estudianteId: 10,
    eventos: [
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-02T10:10:00Z"), detalle: "Tarea 2 - 87pts - Lenguaje" },
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-20T11:25:00Z"), detalle: "Examen Final - 83pts - Matemática" },
      { tipo: "acceso_sistema", fecha: ISODate("2025-02-23T12:40:00Z"), dispositivo: "mobile" }
    ],
    ultimaActividad: ISODate("2025-02-23T12:40:00Z")
  },
  {
    estudianteId: 11,
    eventos: [
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-01T12:45:00Z"), detalle: "Tarea 1 - 81pts - Lenguaje" },
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-21T15:30:00Z"), detalle: "Examen Final - 89pts - Matemática" },
      { tipo: "acceso_sistema", fecha: ISODate("2025-02-24T09:20:00Z"), dispositivo: "tablet" }
    ],
    ultimaActividad: ISODate("2025-02-24T09:20:00Z")
  },
  {
    estudianteId: 12,
    eventos: [
      { tipo: "calificacion_agregada", fecha: ISODate("2025-01-31T14:15:00Z"), detalle: "Tarea 2 - 76pts - Lenguaje" },
      { tipo: "calificacion_agregada", fecha: ISODate("2025-02-22T10:05:00Z"), detalle: "Examen Final - 94pts - Matemática" },
      { tipo: "acceso_sistema", fecha: ISODate("2025-02-25T13:55:00Z"), dispositivo: "desktop" }
    ],
    ultimaActividad: ISODate("2025-02-25T13:55:00Z")
  }
])
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId('68fe9036bd06d3e78dd44496'),
    '1': ObjectId('68fe9036bd06d3e78dd44497'),
    '2': ObjectId('68fe9036bd06d3e78dd44498'),
    '3': ObjectId('68fe9036bd06d3e78dd44499'),
    '4': ObjectId('68fe9036bd06d3e78dd4449a'),
    '5': ObjectId('68fe9036bd06d3e78dd4449b'),
    '6': ObjectId('68fe9036bd06d3e78dd4449c'),
    '7': ObjectId('68fe9036bd06d3e78dd4449d'),
    '8': ObjectId('68fe9036bd06d3e78dd4449e'),
    '9': ObjectId('68fe9036bd06d3e78dd4449f'),
    '10': ObjectId('68fe9036bd06d3e78dd444a0'),
    '11': ObjectId('68fe9036bd06d3e78dd444a1')
  }
}
db.analitica_docente.insertMany([
  {
    profesorId: 3,
    nombre: "Edwin Escobar",
    periodo: "2025-02",
    estadisticas: {
      promedioSecciones: 82.3,
      tasaAprobacion: 88.7,
      desviacionCalificaciones: 12.1,
      comparativaPeriodoAnterior: "+5.2%",
      totalEstudiantes: 45,
      seccionesImpartidas: 2
    },
    asignaturas: ["Lenguaje y Literatura", "Informática Aplicada"]
  },
  {
    profesorId: 1,
    nombre: "Carlos Doratt",
    periodo: "2025-02",
    estadisticas: {
      promedioSecciones: 79.8,
      tasaAprobacion: 84.2,
      desviacionCalificaciones: 10.5,
      comparativaPeriodoAnterior: "+2.1%",
      totalEstudiantes: 30,
      seccionesImpartidas: 1
    },
    asignaturas: ["Matemática"]
  },
  {
    profesorId: 2,
    nombre: "Carlos Funes",
    periodo: "2025-02",
    estadisticas: {
      promedioSecciones: 81.5,
      tasaAprobacion: 86.3,
      desviacionCalificaciones: 11.8,
      comparativaPeriodoAnterior: "+3.7%",
      totalEstudiantes: 35,
      seccionesImpartidas: 1
    },
    asignaturas: ["Ciencias Sociales"]
  },
  {
    profesorId: 4,
    nombre: "Rene Roque",
    periodo: "2025-02",
    estadisticas: {
      promedioSecciones: 83.7,
      tasaAprobacion: 90.1,
      desviacionCalificaciones: 9.8,
      comparativaPeriodoAnterior: "+4.5%",
      totalEstudiantes: 28,
      seccionesImpartidas: 1
    },
    asignaturas: ["Idioma Inglés"]
  },
  {
    profesorId: 5,
    nombre: "Emerson Granadeño",
    periodo: "2025-02",
    estadisticas: {
      promedioSecciones: 80.2,
      tasaAprobacion: 85.6,
      desviacionCalificaciones: 13.2,
      comparativaPeriodoAnterior: "+1.8%",
      totalEstudiantes: 32,
      seccionesImpartidas: 1
    },
    asignaturas: ["Educación Física"]
  },
  {
    profesorId: 6,
    nombre: "Luis Martinez",
    periodo: "2025-01",
    estadisticas: {
      promedioSecciones: 78.9,
      tasaAprobacion: 82.4,
      desviacionCalificaciones: 14.1,
      comparativaPeriodoAnterior: "+0.9%",
      totalEstudiantes: 40,
      seccionesImpartidas: 2
    },
    asignaturas: ["Física", "Química"]
  },
  {
    profesorId: 7,
    nombre: "Ana Castro",
    periodo: "2025-01",
    estadisticas: {
      promedioSecciones: 81.8,
      tasaAprobacion: 87.2,
      desviacionCalificaciones: 10.9,
      comparativaPeriodoAnterior: "+3.2%",
      totalEstudiantes: 38,
      seccionesImpartidas: 2
    },
    asignaturas: ["Biología", "Ciencias Naturales"]
  },
  {
    profesorId: 8,
    nombre: "Jorge Hernandez",
    periodo: "2025-01",
    estadisticas: {
      promedioSecciones: 76.4,
      tasaAprobacion: 79.8,
      desviacionCalificaciones: 15.3,
      comparativaPeriodoAnterior: "-1.2%",
      totalEstudiantes: 42,
      seccionesImpartidas: 2
    },
    asignaturas: ["Historia", "Geografía"]
  },
  {
    profesorId: 9,
    nombre: "Marta Gomez",
    periodo: "2024-02",
    estadisticas: {
      promedioSecciones: 84.1,
      tasaAprobacion: 89.5,
      desviacionCalificaciones: 8.7,
      comparativaPeriodoAnterior: "+6.1%",
      totalEstudiantes: 36,
      seccionesImpartidas: 2
    },
    asignaturas: ["Arte", "Música"]
  },
  {
    profesorId: 10,
    nombre: "Roberto Diaz",
    periodo: "2024-02",
    estadisticas: {
      promedioSecciones: 79.3,
      tasaAprobacion: 83.7,
      desviacionCalificaciones: 12.6,
      comparativaPeriodoAnterior: "+2.4%",
      totalEstudiantes: 44,
      seccionesImpartidas: 2
    },
    asignaturas: ["Filosofía", "Ética"]
  },
  {
    profesorId: 3,
    nombre: "Edwin Escobar",
    periodo: "2024-02",
    estadisticas: {
      promedioSecciones: 80.5,
      tasaAprobacion: 85.9,
      desviacionCalificaciones: 13.4,
      comparativaPeriodoAnterior: "+3.8%",
      totalEstudiantes: 48,
      seccionesImpartidas: 2
    },
    asignaturas: ["Lenguaje y Literatura", "Informática Aplicada"]
  },
  {
    profesorId: 1,
    nombre: "Carlos Doratt",
    periodo: "2024-02",
    estadisticas: {
      promedioSecciones: 77.2,
      tasaAprobacion: 81.3,
      desviacionCalificaciones: 14.8,
      comparativaPeriodoAnterior: "+1.5%",
      totalEstudiantes: 52,
      seccionesImpartidas: 2
    },
    asignaturas: ["Matemática", "Estadística"]
  }
])
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId('68fe9041bd06d3e78dd444a2'),
    '1': ObjectId('68fe9041bd06d3e78dd444a3'),
    '2': ObjectId('68fe9041bd06d3e78dd444a4'),
    '3': ObjectId('68fe9041bd06d3e78dd444a5'),
    '4': ObjectId('68fe9041bd06d3e78dd444a6'),
    '5': ObjectId('68fe9041bd06d3e78dd444a7'),
    '6': ObjectId('68fe9041bd06d3e78dd444a8'),
    '7': ObjectId('68fe9041bd06d3e78dd444a9'),
    '8': ObjectId('68fe9041bd06d3e78dd444aa'),
    '9': ObjectId('68fe9041bd06d3e78dd444ab'),
    '10': ObjectId('68fe9041bd06d3e78dd444ac'),
    '11': ObjectId('68fe9041bd06d3e78dd444ad')
  }
}
db.sincronizacion_fallos.insertOne({
  entidad: "historico_actividad",
  operacion: "insercion",
  datos: { 
    estudianteId: 99,
    evento: {
      tipo: "calificacion_agregada",
      fecha: new Date(),
      detalle: "Examen 1 - 70pts - Fallido"
    }
  },
  error: "Error de red en la inserción inicial",
  fechaIntento: ISODate("2025-02-25T14:00:00Z"),
  reintentos: 0,
  estado: "pendiente"
})
{
  acknowledged: true,
  insertedId: ObjectId('68fe904cbd06d3e78dd444ae')
}
db.reportes_desempenio.createIndex({ "periodo": 1 }, { name: "idx_periodo" })
idx_periodo
db.reportes_desempenio.createIndex({ "fechaGeneracion": -1 }, { name: "idx_fecha_generacion" })
idx_fecha_generacion
db.reportes_desempenio.createIndex({ "metricas.promedioGeneral": -1 }, { name: "idx_promedio_general" })
idx_promedio_general
db.reportes_desempenio.createIndex({ "metricas.tasaAprobacion": -1 }, { name: "idx_tasa_aprobacion" })
idx_tasa_aprobacion
db.historico_actividad.createIndex({ "estudianteId": 1 }, { name: "idx_estudiante_id" })
idx_estudiante_id
db.historico_actividad.createIndex({ "ultimaActividad": -1 }, { name: "idx_ultima_actividad" })
idx_ultima_actividad
db.historico_actividad.createIndex({ "eventos.fecha": -1 }, { name: "idx_fecha_eventos" })
idx_fecha_eventos
db.historico_actividad.createIndex({ "eventos.tipo": 1 }, { name: "idx_tipo_evento" })
idx_tipo_evento
db.analitica_docente.createIndex({ "profesorId": 1, "periodo": 1 }, { name: "idx_profesor_periodo" })
idx_profesor_periodo
db.analitica_docente.createIndex({ "estadisticas.tasaAprobacion": -1 }, { name: "idx_tasa_aprobacion" })
idx_tasa_aprobacion
db.analitica_docente.createIndex({ "estadisticas.promedioSecciones": -1 }, { name: "idx_promedio_secciones" })
idx_promedio_secciones
db.analitica_docente.createIndex({ "periodo": 1, "estadisticas.promedioSecciones": -1 }, { name: "idx_periodo_rendimiento" })
idx_periodo_rendimiento
db.reportes_desempenio.countDocuments()
12
db.historico_actividad.countDocuments()
12
db.analitica_docente.countDocuments()
12
db.sincronizacion_fallos.countDocuments()
1
db.reportes_desempenio.getIndexes()
[
  { v: 2, key: { _id: 1 }, name: '_id_' },
  { v: 2, key: { periodo: 1 }, name: 'idx_periodo' },
  { v: 2, key: { fechaGeneracion: -1 }, name: 'idx_fecha_generacion' },
  {
    v: 2,
    key: { 'metricas.promedioGeneral': -1 },
    name: 'idx_promedio_general'
  },
  {
    v: 2,
    key: { 'metricas.tasaAprobacion': -1 },
    name: 'idx_tasa_aprobacion'
  }
]
db.reportes_desempenio.find(
  { periodo: "2025-02" },
  { 
    periodo: 1, 
    "metricas.promedioGeneral": 1, 
    "metricas.tasaAprobacion": 1,
    "metricas.estudiantesRiesgo": 1,
    topEstudiantes: 1 // Asegúrate de incluir topEstudiantes
  }
).pretty()
{
  _id: ObjectId('68fe902bbd06d3e78dd4448a'),
  periodo: '2025-02',
  metricas: {
    promedioGeneral: 78.5,
    tasaAprobacion: 85.2,
    estudiantesRiesgo: 12
  },
  topEstudiantes: [
    {
      estudianteId: 1,
      nombre: 'Sofia Perez',
      promedio: 95.5
    },
    {
      estudianteId: 3,
      nombre: 'Maria Garcia',
      promedio: 88
    },
    {
      estudianteId: 2,
      nombre: 'Juan Lopez',
      promedio: 86.5
    }
  ]
}
db.sincronizacion_fallos.find().pretty()
{
  _id: ObjectId('68fe904cbd06d3e78dd444ae'),
  entidad: 'historico_actividad',
  operacion: 'insercion',
  datos: {
    estudianteId: 99,
    evento: {
      tipo: 'calificacion_agregada',
      fecha: 2025-10-26T21:19:08.490Z,
      detalle: 'Examen 1 - 70pts - Fallido'
    }
  },
  error: 'Error de red en la inserción inicial',
  fechaIntento: 2025-02-25T14:00:00.000Z,
  reintentos: 0,
  estado: 'pendiente'
}
db.analitica_docente.aggregate([
  {
    $group: {
      _id: { 
        profesorId: "$profesorId",
        nombre: "$nombre" 
      },
      promedioHistoricoSecciones: { $avg: "$estadisticas.promedioSecciones" },
      tasaAprobacionHistorica: { $avg: "$estadisticas.tasaAprobacion" },
      totalPeriodosRegistrados: { $sum: 1 },
      asignaturasImpartidas: { $addToSet: "$asignaturas" } // $addToSet para evitar duplicados
    }
  },
  {
    $project: {
      _id: 0,
      profesorId: "$_id.profesorId",
      nombre: "$_id.nombre",
      promedioHistorico: { $round: ["$promedioHistoricoSecciones", 2] },
      tasaAprobacionHistorica: { $round: ["$tasaAprobacionHistorica", 2] },
      totalPeriodos: "$totalPeriodosRegistrados",
      // Aplanamos el array de arrays de asignaturas
      asignaturas: {
        $reduce: {
          input: "$asignaturasImpartidas",
          initialValue: [],
          in: { $setUnion: ["$$value", "$$this"] }
        }
      }
    }
  },
  {
    $sort: { 
      promedioHistorico: -1 // Ordenar por el promedio más alto
    }
  }
])
{
  profesorId: 9,
  nombre: 'Marta Gomez',
  promedioHistorico: 84.1,
  tasaAprobacionHistorica: 89.5,
  totalPeriodos: 1,
  asignaturas: [
    'Arte',
    'Música'
  ]
}
{
  profesorId: 4,
  nombre: 'Rene Roque',
  promedioHistorico: 83.7,
  tasaAprobacionHistorica: 90.1,
  totalPeriodos: 1,
  asignaturas: [
    'Idioma Inglés'
  ]
}
{
  profesorId: 7,
  nombre: 'Ana Castro',
  promedioHistorico: 81.8,
  tasaAprobacionHistorica: 87.2,
  totalPeriodos: 1,
  asignaturas: [
    'Biología',
    'Ciencias Naturales'
  ]
}
{
  profesorId: 2,
  nombre: 'Carlos Funes',
  promedioHistorico: 81.5,
  tasaAprobacionHistorica: 86.3,
  totalPeriodos: 1,
  asignaturas: [
    'Ciencias Sociales'
  ]
}
{
  profesorId: 3,
  nombre: 'Edwin Escobar',
  promedioHistorico: 81.4,
  tasaAprobacionHistorica: 87.3,
  totalPeriodos: 2,
  asignaturas: [
    'Informática Aplicada',
    'Lenguaje y Literatura'
  ]
}
{
  profesorId: 5,
  nombre: 'Emerson Granadeño',
  promedioHistorico: 80.2,
  tasaAprobacionHistorica: 85.6,
  totalPeriodos: 1,
  asignaturas: [
    'Educación Física'
  ]
}
{
  profesorId: 10,
  nombre: 'Roberto Diaz',
  promedioHistorico: 79.3,
  tasaAprobacionHistorica: 83.7,
  totalPeriodos: 1,
  asignaturas: [
    'Filosofía',
    'Ética'
  ]
}
{
  profesorId: 6,
  nombre: 'Luis Martinez',
  promedioHistorico: 78.9,
  tasaAprobacionHistorica: 82.4,
  totalPeriodos: 1,
  asignaturas: [
    'Física',
    'Química'
  ]
}
{
  profesorId: 1,
  nombre: 'Carlos Doratt',
  promedioHistorico: 78.5,
  tasaAprobacionHistorica: 82.75,
  totalPeriodos: 2,
  asignaturas: [
    'Estadística',
    'Matemática'
  ]
}
{
  profesorId: 8,
  nombre: 'Jorge Hernandez',
  promedioHistorico: 76.4,
  tasaAprobacionHistorica: 79.8,
  totalPeriodos: 1,
  asignaturas: [
    'Geografía',
    'Historia'
  ]
}
db.reportes_desempenio.aggregate([
  {
    $match: {
      periodo: "2025-02" // Filtramos por el reporte más reciente
    }
  },
  {
    $unwind: "$topEstudiantes" // Descomponemos el array de topEstudiantes
  },
  {
    $lookup: {
      from: "historico_actividad",
      localField: "topEstudiantes.estudianteId",
      foreignField: "estudianteId",
      as: "historialEstudiante"
    }
  },
  {
    // $lookup devuelve un array, aunque sepamos que solo hay un estudiante.
    // Usamos $unwind o $arrayElemAt. $unwind es más simple si siempre hay un match.
    $unwind: "$historialEstudiante" 
  },
  {
    $project: {
      _id: 0,
      periodoReporte: "$periodo",
      nombreEstudiante: "$topEstudiantes.nombre",
      promedioReportado: "$topEstudiantes.promedio",
      ultimaActividadSistema: "$historialEstudiante.ultimaActividad",
      totalEventosRegistrados: { $size: "$historialEstudiante.eventos" }
    }
  },
  {
    $sort: {
      promedioReportado: -1 // Ordenar por promedio
    }
  }
])
{
  periodoReporte: '2025-02',
  nombreEstudiante: 'Sofia Perez',
  promedioReportado: 95.5,
  ultimaActividadSistema: 2025-02-15T09:15:00.000Z,
  totalEventosRegistrados: 3
}
{
  periodoReporte: '2025-02',
  nombreEstudiante: 'Maria Garcia',
  promedioReportado: 88,
  ultimaActividadSistema: 2025-02-16T08:00:00.000Z,
  totalEventosRegistrados: 3
}
{
  periodoReporte: '2025-02',
  nombreEstudiante: 'Juan Lopez',
  promedioReportado: 86.5,
  ultimaActividadSistema: 2025-02-14T16:30:00.000Z,
  totalEventosRegistrados: 2
}
db.historico_actividad.aggregate([
  {
    $unwind: "$eventos" 
  },
  {
    $group: {
      _id: "$eventos.tipo",
      conteoTotal: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      tipoDeEvento: "$_id",
      conteo: "$conteoTotal"
    }
  },
  {
    $sort: {
      conteo: -1 
    }
  }
])
