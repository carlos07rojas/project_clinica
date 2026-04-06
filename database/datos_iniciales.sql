USE agenda_clinica;
GO

-- Especialidades médicas
INSERT INTO ESPECIALIDAD (nombre, descripcion) VALUES
('Medicina General',    'Atención médica primaria y preventiva'),
('Pediatría',           'Atención médica para niños y adolescentes'),
('Cardiología',         'Diagnóstico y tratamiento del corazón'),
('Dermatología',        'Enfermedades de la piel'),
('Ginecología',         'Salud reproductiva femenina'),
('Traumatología',       'Lesiones y enfermedades del sistema musculoesquelético'),
('Oftalmología',        'Enfermedades de los ojos'),
('Psicología',          'Salud mental y bienestar emocional');
GO

-- Servicios por especialidad
INSERT INTO SERVICIO (nombre, precio, duracion_min, id_especialidad) VALUES
('Consulta general',          50.00, 30, 1),
('Control preventivo',        45.00, 30, 1),
('Consulta pediátrica',       55.00, 30, 2),
('Control de crecimiento',    45.00, 20, 2),
('Consulta cardiológica',     90.00, 45, 3),
('Electrocardiograma',        60.00, 20, 3),
('Consulta dermatológica',    70.00, 30, 4),
('Consulta ginecológica',     80.00, 40, 5),
('Consulta traumatológica',   75.00, 40, 6),
('Consulta oftalmológica',    70.00, 30, 7),
('Sesión de psicología',      80.00, 60, 8);
GO

-- Usuario administrador por defecto
-- Contraseña: Admin123! (en producción cambiar inmediatamente)
INSERT INTO USUARIO (nombre, apellido, email, password_hash, rol) VALUES
('Admin', 'Sistema', 'admin@clinica.com',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'ADMIN');
GO