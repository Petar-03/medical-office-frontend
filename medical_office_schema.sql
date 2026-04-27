CREATE DATABASE IF NOT EXISTS medical_office
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE medical_office;

CREATE TABLE IF NOT EXISTS doctors (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  specialty VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  working_hours VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_doctors_name_specialty (first_name, last_name, specialty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patients (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_patients_email (email),
  KEY idx_patients_name (last_name, first_name),
  KEY idx_patients_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS services (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_services_name (name),
  CONSTRAINT chk_services_price_non_negative CHECK (price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  patient_id BIGINT UNSIGNED NOT NULL,
  doctor_id BIGINT UNSIGNED NOT NULL,
  service_id BIGINT UNSIGNED NOT NULL,
  status ENUM('Предстоящ', 'Приключен', 'Отменен') NOT NULL DEFAULT 'Предстоящ',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_appointments_datetime (appointment_date, appointment_time),
  KEY idx_appointments_patient (patient_id),
  KEY idx_appointments_doctor (doctor_id),
  KEY idx_appointments_service (service_id),
  CONSTRAINT fk_appointments_patient
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_service
    FOREIGN KEY (service_id) REFERENCES services (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  UNIQUE KEY uq_appointments_doctor_slot (doctor_id, appointment_date, appointment_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE OR REPLACE VIEW appointment_details AS
SELECT
  appointments.id,
  appointments.appointment_date,
  appointments.appointment_time,
  CONCAT(patients.first_name, ' ', patients.last_name) AS patient,
  CONCAT(doctors.first_name, ' ', doctors.last_name) AS doctor,
  services.name AS exam_type,
  appointments.status
FROM appointments
INNER JOIN patients ON patients.id = appointments.patient_id
INNER JOIN doctors ON doctors.id = appointments.doctor_id
INNER JOIN services ON services.id = appointments.service_id;

INSERT INTO doctors (first_name, last_name, specialty, password_hash, working_hours)
VALUES
  ('Анна', 'Иванова', 'Обща медицина', '$2y$10$replace_with_real_hash_for_doctor_ivanova', '09:00-17:00')
ON DUPLICATE KEY UPDATE
  specialty = VALUES(specialty),
  working_hours = VALUES(working_hours);

INSERT INTO patients (first_name, last_name, phone, email, address)
VALUES
  ('Мария', 'Петрова', '0888123456', 'maria@example.com', 'Варна'),
  ('Иван', 'Георгиев', '0877123456', 'ivan@example.com', 'Варна'),
  ('Елица', 'Николова', '0899123456', 'elitsa@example.com', 'Добрич')
ON DUPLICATE KEY UPDATE
  first_name = VALUES(first_name),
  last_name = VALUES(last_name),
  phone = VALUES(phone),
  address = VALUES(address);

INSERT INTO services (name, description, price)
VALUES
  ('Първичен преглед', 'Първоначален медицински преглед на пациент', 50.00),
  ('Контролен преглед', 'Повторен преглед след проведено лечение', 30.00),
  ('Консултация', 'Медицинска консултация със специалист', 40.00)
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  price = VALUES(price);

INSERT INTO appointments (appointment_date, appointment_time, patient_id, doctor_id, service_id, status)
SELECT '2026-04-27', '09:00:00', patients.id, doctors.id, services.id, 'Предстоящ'
FROM patients
INNER JOIN doctors
  ON doctors.first_name = 'Анна'
  AND doctors.last_name = 'Иванова'
  AND doctors.specialty = 'Обща медицина'
INNER JOIN services ON services.name = 'Контролен преглед'
WHERE patients.email = 'maria@example.com'
ON DUPLICATE KEY UPDATE
  patient_id = VALUES(patient_id),
  service_id = VALUES(service_id),
  status = VALUES(status);

INSERT INTO appointments (appointment_date, appointment_time, patient_id, doctor_id, service_id, status)
SELECT '2026-04-27', '10:30:00', patients.id, doctors.id, services.id, 'Предстоящ'
FROM patients
INNER JOIN doctors
  ON doctors.first_name = 'Анна'
  AND doctors.last_name = 'Иванова'
  AND doctors.specialty = 'Обща медицина'
INNER JOIN services ON services.name = 'Консултация'
WHERE patients.email = 'ivan@example.com'
ON DUPLICATE KEY UPDATE
  patient_id = VALUES(patient_id),
  service_id = VALUES(service_id),
  status = VALUES(status);
