USE agenda_clinica;
GO

-- Usuarios de prueba (médicos y pacientes)
-- Todos tienen la misma contraseña: Test123!
INSERT INTO USUARIO (nombre, apellido, email, password_hash, rol) VALUES
('Carlos',   'Mendoza',   'cmendoza@clinica.com',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'MEDICO'),
('Ana',      'Torres',    'atorres@clinica.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'MEDICO'),
('Luis',     'Quispe',    'lquispe@gmail.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'PACIENTE'),
('María',    'Flores',    'mflores@gmail.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'PACIENTE'),
('Roberto',  'Chavez',    'rchavez@gmail.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'PACIENTE');
GO

-- Perfiles de médico
INSERT INTO MEDICO (id_usuario, codigo_colegiatura, id_especialidad, telefono) VALUES
(2, 'CMP-045231', 1, '987654321'),  -- Carlos → Medicina General
(3, 'CMP-038912', 4, '976543210');  -- Ana    → Dermatología
GO

-- Horarios de los médicos
INSERT INTO HORARIO_CITAS (id_medico, dia_semana, hora_inicio, hora_fin) VALUES
(1, 1, '08:00', '13:00'),  -- Carlos: lunes
(1, 2, '08:00', '13:00'),  -- Carlos: martes
(1, 3, '08:00', '13:00'),  -- Carlos: miércoles
(2, 3, '14:00', '19:00'),  -- Ana: miércoles tarde
(2, 4, '14:00', '19:00'),  -- Ana: jueves
(2, 5, '14:00', '19:00');  -- Ana: viernes
GO

-- Perfiles de paciente
INSERT INTO PACIENTE (id_usuario, dni, fecha_nacimiento, telefono, sexo) VALUES
(4, '45231876', '1990-03-15', '912345678', 'M'),  -- Luis
(5, '52109843', '1985-07-22', '923456789', 'F'),  -- María
(6, '61234567', '2000-11-08', '934567890', 'M');  -- Roberto
GO

-- Citas de prueba
INSERT INTO CITA (id_paciente, id_medico, id_servicio, fecha_hora, duracion_min, estado) VALUES
(1, 1, 1, '2026-04-10 09:00', 30, 'CONFIRMADA'),
(2, 2, 7, '2026-04-10 15:00', 30, 'PENDIENTE'),
(3, 1, 2, '2026-04-11 10:00', 30, 'PENDIENTE');
GO