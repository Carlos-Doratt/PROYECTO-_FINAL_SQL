CREATE DATABASE escuela1;
GO

USE escuela1;
GO

--  TABLAS 

CREATE TABLE Estudiantes (
    EstudianteID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(80) NOT NULL,
    Apellido NVARCHAR(80) NOT NULL,
    Genero NVARCHAR(10) NOT NULL,
    FechaNacimiento DATE NULL,
    Correo NVARCHAR(150) UNIQUE NOT NULL,
    FechaIngreso DATE NOT NULL DEFAULT GETDATE(),
    Grado NVARCHAR(10) NULL,
    UltimaActividad DATETIME NULL
);
GO

CREATE TABLE Profesores (
    ProfesorID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(80) NOT NULL,
    Apellido NVARCHAR(80) NOT NULL,
    Correo NVARCHAR(150) UNIQUE NOT NULL,
    FechaIngreso DATE,
    CreadoEn DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Asignaturas (
    AsignaturaID INT IDENTITY(1,1) PRIMARY KEY,
    Codigo NVARCHAR(20) NOT NULL UNIQUE,
    Nombre NVARCHAR(120) NOT NULL,
    HorasSemanales INT NOT NULL
);
GO

CREATE TABLE Secciones (
    SeccionID INT IDENTITY(1,1) PRIMARY KEY,
    AsignaturaID INT NOT NULL,
    ProfesorID INT NOT NULL,
    Periodo NVARCHAR(20) NOT NULL,
    Aula NVARCHAR(20),
    Capacidad INT DEFAULT 30,
    CreadoEn DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (AsignaturaID) REFERENCES Asignaturas(AsignaturaID),
    FOREIGN KEY (ProfesorID) REFERENCES Profesores(ProfesorID)
);
GO

CREATE TABLE Inscripciones (
    InscripcionID INT IDENTITY(1,1) PRIMARY KEY,
    EstudianteID INT NOT NULL,
    SeccionID INT NOT NULL,
    InscriptoEn DATETIME DEFAULT GETDATE(),
    CONSTRAINT UQ_Inscripcion UNIQUE (EstudianteID, SeccionID),
    FOREIGN KEY (EstudianteID) REFERENCES Estudiantes(EstudianteID),
    FOREIGN KEY (SeccionID) REFERENCES Secciones(SeccionID)
);
GO

CREATE TABLE Calificaciones (
    CalificacionID INT IDENTITY(1,1) PRIMARY KEY,
    InscripcionID INT NOT NULL,
    TipoEvaluacion NVARCHAR(50) NOT NULL,
    Puntaje DECIMAL(5,2) CHECK (Puntaje BETWEEN 0 AND 100),
    RegistradoEn DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (InscripcionID) REFERENCES Inscripciones(InscripcionID)
);
GO

CREATE TABLE Registros (
    RegistroID BIGINT IDENTITY(1,1) PRIMARY KEY,
    Entidad NVARCHAR(50),
    EntidadID INT,
    Accion NVARCHAR(20),
    Payload NVARCHAR(MAX),
    EjecutadoPor NVARCHAR(100),
    EjecutadoEn DATETIME DEFAULT GETDATE()
);
GO

--  ÍNDICES

CREATE INDEX IX_Estudiantes_Correo ON Estudiantes(Correo);
CREATE INDEX IX_Secciones_Periodo_Asignatura ON Secciones(Periodo, AsignaturaID);
CREATE INDEX IX_Calificaciones_Inscripcion_Tipo ON Calificaciones(InscripcionID, TipoEvaluacion);
GO

--  PROCEDIMIENTOS ALMACENADOS

-- Registro de cali
CREATE OR ALTER PROCEDURE sp_AgregarCalificacion
    @InscripcionID INT,
    @TipoEvaluacion NVARCHAR(50),
    @Puntaje DECIMAL(5,2),
    @Estado INT OUTPUT,
    @Mensaje NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Inscripciones WHERE InscripcionID = @InscripcionID)
    BEGIN
        SET @Estado = 1;
        SET @Mensaje = N'Inscripción no encontrada';
        RETURN;
    END

    IF @Puntaje < 0 OR @Puntaje > 100
    BEGIN
        SET @Estado = 2;
        SET @Mensaje = N'Puntaje fuera de rango (0–100)';
        RETURN;
    END

    INSERT INTO Calificaciones (InscripcionID, TipoEvaluacion, Puntaje)
    VALUES (@InscripcionID, @TipoEvaluacion, @Puntaje);

    SET @Estado = 0;
    SET @Mensaje = N'Calificación registrada correctamente';
END;
GO

-- Promedio por estudiante
CREATE OR ALTER PROCEDURE sp_PromedioEstudiantePeriodo
    @EstudianteID INT,
    @Periodo NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT e.EstudianteID, e.Nombre, e.Apellido,
           AVG(c.Puntaje) AS Promedio
    FROM Estudiantes e
    JOIN Inscripciones i ON e.EstudianteID = i.EstudianteID
    JOIN Secciones s ON s.SeccionID = i.SeccionID AND s.Periodo = @Periodo
    JOIN Calificaciones c ON c.InscripcionID = i.InscripcionID
    WHERE e.EstudianteID = @EstudianteID
    GROUP BY e.EstudianteID, e.Nombre, e.Apellido;
END;
GO

-- Profesores
CREATE OR ALTER PROCEDURE sp_AsignarProfesorSecciones
    @ProfesorID INT,
    @SeccionIDs NVARCHAR(MAX),
    @CargaMaxima INT = 15,
    @Estado INT OUTPUT,
    @Mensaje NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @Estado = 0;

    BEGIN TRANSACTION;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Profesores WHERE ProfesorID = @ProfesorID)
        BEGIN
            SET @Estado = 1;
            SET @Mensaje = N'Profesor no encontrado.';
            ROLLBACK TRANSACTION;
            RETURN;
        END

        CREATE TABLE #TempSecciones (SeccionID INT);
        INSERT INTO #TempSecciones (SeccionID)
        SELECT value FROM STRING_SPLIT(@SeccionIDs, ',');

        DECLARE @CargaActual INT = (
            SELECT COUNT(*) FROM Secciones WHERE ProfesorID = @ProfesorID
        );
        DECLARE @Nuevas INT = (SELECT COUNT(*) FROM #TempSecciones);

        IF (@CargaActual + @Nuevas) > @CargaMaxima
        BEGIN
            SET @Estado = 2;
            SET @Mensaje = N'La asignación excede la carga máxima permitida.';
            ROLLBACK TRANSACTION;
            RETURN;
        END

        UPDATE s
        SET s.ProfesorID = @ProfesorID
        FROM Secciones s
        JOIN #TempSecciones t ON s.SeccionID = t.SeccionID;

        COMMIT TRANSACTION;
        SET @Mensaje = N'Asignación completada correctamente.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SET @Estado = 99;
        SET @Mensaje = N'Error: ' + ERROR_MESSAGE();
    END CATCH
END;
GO

--  TRIGGERS

-- Au Calificaciones
CREATE OR ALTER TRIGGER trg_AuditoriaCalificacion
ON Calificaciones
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Registros (Entidad, EntidadID, Accion, Payload, EjecutadoPor)
    SELECT 'Calificaciones', i.CalificacionID, 'INSERT',
           CONCAT('Nuevo puntaje: ', i.Puntaje), SUSER_SNAME()
    FROM inserted i
    LEFT JOIN deleted d ON i.CalificacionID = d.CalificacionID
    WHERE d.CalificacionID IS NULL;

    INSERT INTO Registros (Entidad, EntidadID, Accion, Payload, EjecutadoPor)
    SELECT 'Calificaciones', i.CalificacionID, 'UPDATE',
           CONCAT('Cambio de ', d.Puntaje, ' a ', i.Puntaje), SUSER_SNAME()
    FROM inserted i
    JOIN deleted d ON i.CalificacionID = d.CalificacionID AND i.Puntaje <> d.Puntaje;
END;
GO

-- actividad del estudiante
CREATE OR ALTER TRIGGER trg_ActualizarUltimaActividad
ON Calificaciones
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE e
    SET e.UltimaActividad = i.RegistradoEn
    FROM Estudiantes e
    JOIN Inscripciones ins ON e.EstudianteID = ins.EstudianteID
    JOIN inserted i ON ins.InscripcionID = i.InscripcionID;
END;
GO

--  VALUES (?100)

INSERT INTO Profesores (Nombre, Apellido, Correo, FechaIngreso) VALUES
('Carlos', 'Doratt', 'c.doratt@escuela.edu', '2020-08-01'),
('Carlos', 'Funes', 'c.funes@escuela.edu', '2021-01-15'),
('Edwin', 'Escobar', 'e.escobar@escuela.edu', '2019-03-20'),
('Rene', 'Roque', 'r.roque@escuela.edu', '2022-06-10'),
('Emerson', 'Granadeño', 'e.granada@escuela.edu', '2018-02-28');

INSERT INTO Profesores (Nombre, Apellido, Correo, FechaIngreso) VALUES
('Luis', 'Martinez', 'l.martinez@escuela.edu', '2021-09-10'),
('Ana', 'Castro', 'a.castro@escuela.edu', '2020-05-22'),
('Jorge', 'Hernandez', 'j.hernandez@escuela.edu', '2019-11-30'),
('Marta', 'Gomez', 'm.gomez@escuela.edu', '2023-01-12'),
('Roberto', 'Diaz', 'r.diaz@escuela.edu', '2022-07-18');

INSERT INTO Asignaturas (Codigo, Nombre, HorasSemanales) VALUES
('LEN-9', 'Lenguaje y Literatura', 6),
('MAT-9', 'Matemática', 7),
('CS-9', 'Ciencias Sociales', 4),
('ING-9', 'Idioma Inglés', 5),
('EDU-FIS', 'Educación Física', 2),
('INF-9', 'Informática Aplicada', 4);


INSERT INTO Secciones (AsignaturaID, ProfesorID, Periodo, Aula) VALUES
(1, 3, '2025-02', 'L-201'),
(6, 3, '2025-02', 'L-201'),
(2, 1, '2025-02', 'M-301'),
(3, 2, '2025-02', 'L-105'),
(4, 4, '2025-02', 'A-102'),
(5, 5, '2025-02', 'A-101');
GO

INSERT INTO Estudiantes (Nombre, Apellido, Genero, FechaNacimiento, Correo, Grado) VALUES
('Sofia', 'Perez', 'Femenino', '2007-05-15', 's.perez@test.com', '9°'),
('Juan', 'Lopez', 'Masculino', '2007-08-20', 'j.lopez@test.com', '9°'),
('Maria', 'Garcia', 'Femenino', '2008-01-10', 'm.garcia@test.com', '9°'),
('Pedro', 'Rodriguez', 'Masculino', '2007-03-25', 'p.rodriguez@test.com', '9°');


INSERT INTO Estudiantes (Nombre, Apellido, Genero, FechaNacimiento, Correo, Grado) VALUES
('Andrea', 'Santos', 'Femenino', '2007-09-12', 'a.santos@test.com', '9°'),
('Daniel', 'Mejia', 'Masculino', '2008-02-05', 'd.mejia@test.com', '9°'),
('Carla', 'Ruiz', 'Femenino', '2007-11-23', 'c.ruiz@test.com', '9°'),
('Oscar', 'Flores', 'Masculino', '2008-03-14', 'o.flores@test.com', '9°'),
('Lucia', 'Torres', 'Femenino', '2007-06-30', 'l.torres@test.com', '9°');


INSERT INTO Inscripciones (EstudianteID, SeccionID)
VALUES (1,1),(1,3),(2,1),(2,3),(3,1),(3,3),(4,1),(4,3);


INSERT INTO Calificaciones (InscripcionID, TipoEvaluacion, Puntaje)VALUES
       (1,'Tarea 1',95.00),(1,'Examen Final',80.00),
       (2,'Tarea 1',78.00),(3,'Examen Final',85.00),
	   (3,'Tarea 2',60.00),(2,'Examen Final', 100.00)

	   
INSERT INTO Calificaciones (InscripcionID, TipoEvaluacion, Puntaje) VALUES
(4,'Tarea 2',88.00),(4,'Examen Final',90.00),
(5,'Tarea 1',75.00),(5,'Examen Final',82.00),
(6,'Tarea 2',80.00),(6,'Examen Final',85.00);


--  PRUEBAS DE TRANSACCIÓN

DECLARE @Estado INT, @Msg NVARCHAR(255);

EXEC sp_AsignarProfesorSecciones
    @ProfesorID = 1,
    @SeccionIDs = '1,2',
    @CargaMaxima = 10,
    @Estado = @Estado OUTPUT,
    @Mensaje = @Msg OUTPUT;

SELECT 'Resultado' = @Estado, 'Mensaje' = @Msg;

--  CONSULTAS 

--promedio
EXEC sp_PromedioEstudiantePeriodo @EstudianteID = 2, @Periodo = '2025-02';
GO

-- Consultar registros Au
SELECT TOP 5 * FROM Registros ORDER BY RegistroID DESC;
GO

--carga de profesor
SELECT 
    p.ProfesorID,
    p.Nombre + ' ' + p.Apellido AS Profesor,
    COUNT(s.SeccionID) AS SeccionesAsignadas,
    STRING_AGG(a.Nombre, ', ') AS Asignaturas
FROM Profesores p
LEFT JOIN Secciones s ON p.ProfesorID = s.ProfesorID
LEFT JOIN Asignaturas a ON s.AsignaturaID = a.AsignaturaID
WHERE s.Periodo = '2025-02'
GROUP BY p.ProfesorID, p.Nombre, p.Apellido
ORDER BY SeccionesAsignadas DESC;

--actividad reciente
SELECT Nombre + ' ' + Apellido AS Estudiante,
       UltimaActividad
FROM Estudiantes
WHERE UltimaActividad IS NOT NULL
ORDER BY UltimaActividad DESC;