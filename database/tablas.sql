
-- Crear la base de datos
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'agenda_clinica')
    CREATE DATABASE agenda_clinica;
GO

USE agenda_clinica;
GO

-- ============================================================
-- USUARIO
-- ============================================================
CREATE TABLE USUARIO (
    id_usuario     INT          NOT NULL IDENTITY(1,1),
    nombre         VARCHAR(100) NOT NULL,
    apellido       VARCHAR(100) NOT NULL,
    email          VARCHAR(150) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    rol            VARCHAR(20)  NOT NULL,
    activo         BIT          NOT NULL DEFAULT 1,
    fecha_creacion DATETIME     NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_USUARIO  PRIMARY KEY (id_usuario),
    CONSTRAINT UQ_EMAIL    UNIQUE      (email),
    CONSTRAINT CK_ROL      CHECK       (rol IN ('ADMIN','MEDICO','PACIENTE'))
);
GO

-- ============================================================
-- ESPECIALIDAD
-- ============================================================
CREATE TABLE ESPECIALIDAD (
    id_especialidad INT          NOT NULL IDENTITY(1,1),
    nombre          VARCHAR(100) NOT NULL,
    descripcion     VARCHAR(250) NULL,
    activo          BIT          NOT NULL DEFAULT 1,

    CONSTRAINT PK_ESPECIALIDAD PRIMARY KEY (id_especialidad)
);
GO

-- ============================================================
-- PACIENTE
-- ============================================================
CREATE TABLE PACIENTE (
    id_paciente      INT          NOT NULL IDENTITY(1,1),
    id_usuario       INT          NOT NULL,
    dni              VARCHAR(8)   NOT NULL,
    fecha_nacimiento DATE         NOT NULL,
    telefono         VARCHAR(9)   NULL,
    direccion        VARCHAR(250) NULL,
    sexo             CHAR(1)      NOT NULL,

    CONSTRAINT PK_PACIENTE       PRIMARY KEY (id_paciente),
    CONSTRAINT UQ_PACIENTE_USR   UNIQUE      (id_usuario),
    CONSTRAINT UQ_PACIENTE_DNI   UNIQUE      (dni),
    CONSTRAINT FK_PACIENTE_USR   FOREIGN KEY (id_usuario)
                                 REFERENCES  USUARIO(id_usuario),
    CONSTRAINT CK_PACIENTE_SEXO  CHECK       (sexo IN ('M','F','O'))
);
GO

-- ============================================================
-- MEDICO
-- ============================================================
CREATE TABLE MEDICO (
    id_medico          INT         NOT NULL IDENTITY(1,1),
    id_usuario         INT         NOT NULL,
    codigo_colegiatura VARCHAR(10) NOT NULL,
    id_especialidad    INT         NOT NULL,
    telefono           VARCHAR(9)  NULL,

    CONSTRAINT PK_MEDICO          PRIMARY KEY (id_medico),
    CONSTRAINT UQ_MEDICO_USR      UNIQUE      (id_usuario),
    CONSTRAINT UQ_COLEGIATURA     UNIQUE      (codigo_colegiatura),
    CONSTRAINT FK_MEDICO_USR      FOREIGN KEY (id_usuario)
                                  REFERENCES  USUARIO(id_usuario),
    CONSTRAINT FK_MEDICO_ESP      FOREIGN KEY (id_especialidad)
                                  REFERENCES  ESPECIALIDAD(id_especialidad)
);
GO

-- ============================================================
-- HORARIO_CITAS
-- ============================================================
CREATE TABLE HORARIO_CITAS (
    id_horario  INT     NOT NULL IDENTITY(1,1),
    id_medico   INT     NOT NULL,
    dia_semana  TINYINT NOT NULL,
    hora_inicio TIME    NOT NULL,
    hora_fin    TIME    NOT NULL,
    activo      BIT     NOT NULL DEFAULT 1,

    CONSTRAINT PK_HORARIO      PRIMARY KEY (id_horario),
    CONSTRAINT FK_HORARIO_MED  FOREIGN KEY (id_medico)
                               REFERENCES  MEDICO(id_medico),
    CONSTRAINT CK_DIA_SEMANA   CHECK       (dia_semana BETWEEN 1 AND 7),
    CONSTRAINT CK_HORAS        CHECK       (hora_fin > hora_inicio)
);
GO

-- ============================================================
-- SERVICIO
-- ============================================================
CREATE TABLE SERVICIO (
    id_servicio     INT           NOT NULL IDENTITY(1,1),
    nombre          VARCHAR(150)  NOT NULL,
    descripcion     VARCHAR(250)  NULL,
    precio          DECIMAL(10,2) NOT NULL,
    duracion_min    INT           NOT NULL,
    id_especialidad INT           NOT NULL,
    activo          BIT           NOT NULL DEFAULT 1,

    CONSTRAINT PK_SERVICIO      PRIMARY KEY (id_servicio),
    CONSTRAINT FK_SERVICIO_ESP  FOREIGN KEY (id_especialidad)
                                REFERENCES  ESPECIALIDAD(id_especialidad),
    CONSTRAINT CK_PRECIO        CHECK       (precio > 0),
    CONSTRAINT CK_DURACION      CHECK       (duracion_min > 0)
);
GO

-- ============================================================
-- CITA
-- ============================================================
CREATE TABLE CITA (
    id_cita        INT          NOT NULL IDENTITY(1,1),
    id_paciente    INT          NOT NULL,
    id_medico      INT          NOT NULL,
    id_servicio    INT          NOT NULL,
    fecha_hora     DATETIME     NOT NULL,
    duracion_min   INT          NOT NULL,
    estado         VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE',
    observaciones  VARCHAR(500) NULL,
    fecha_creacion DATETIME     NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_CITA         PRIMARY KEY (id_cita),
    CONSTRAINT FK_CITA_PAC     FOREIGN KEY (id_paciente)
                               REFERENCES  PACIENTE(id_paciente),
    CONSTRAINT FK_CITA_MED     FOREIGN KEY (id_medico)
                               REFERENCES  MEDICO(id_medico),
    CONSTRAINT FK_CITA_SRV     FOREIGN KEY (id_servicio)
                               REFERENCES  SERVICIO(id_servicio),
    CONSTRAINT CK_ESTADO_CITA  CHECK       (estado IN (
                                   'PENDIENTE','CONFIRMADA',
                                   'COMPLETADA','CANCELADA'))
);
GO

-- ============================================================
-- HISTORIAL_CLINICO
-- ============================================================
CREATE TABLE HISTORIAL_CLINICO (
    id_historial   INT      NOT NULL IDENTITY(1,1),
    id_cita        INT      NOT NULL,
    diagnostico    TEXT     NOT NULL,
    tratamiento    TEXT     NULL,
    notas          TEXT     NULL,
    fecha_registro DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_HISTORIAL      PRIMARY KEY (id_historial),
    CONSTRAINT UQ_HISTORIAL_CITA UNIQUE      (id_cita),
    CONSTRAINT FK_HISTORIAL_CITA FOREIGN KEY (id_cita)
                                 REFERENCES  CITA(id_cita)
);
GO

-- ============================================================
-- PAGO
-- ============================================================
CREATE TABLE PAGO (
    id_pago      INT           NOT NULL IDENTITY(1,1),
    id_cita      INT           NOT NULL,
    monto        DECIMAL(10,2) NOT NULL,
    metodo_pago  VARCHAR(20)   NOT NULL,
    estado_pago  VARCHAR(20)   NOT NULL DEFAULT 'PENDIENTE',
    fecha_pago   DATETIME      NULL,
    comprobante  VARCHAR(100)  NULL,

    CONSTRAINT PK_PAGO           PRIMARY KEY (id_pago),
    CONSTRAINT UQ_PAGO_CITA      UNIQUE      (id_cita),
    CONSTRAINT FK_PAGO_CITA      FOREIGN KEY (id_cita)
                                 REFERENCES  CITA(id_cita),
    CONSTRAINT CK_METODO_PAGO    CHECK       (metodo_pago IN (
                                     'EFECTIVO','TARJETA','TRANSFERENCIA')),
    CONSTRAINT CK_ESTADO_PAGO    CHECK       (estado_pago IN (
                                     'PENDIENTE','PAGADO','ANULADO')),
    CONSTRAINT CK_MONTO          CHECK       (monto > 0)
);
GO