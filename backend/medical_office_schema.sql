DROP DATABASE IF EXISTS medical_office_v2;

CREATE DATABASE medical_office_v2
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE medical_office_v2;

CREATE TABLE doctors (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  specialty VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  working_hours VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_doctors_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE doctor_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  doctor_id BIGINT UNSIGNED NOT NULL,
  token VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_doctor_sessions_token (token),
  KEY idx_doctor_sessions_doctor (doctor_id),
  CONSTRAINT fk_doctor_sessions_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE patients (
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

CREATE TABLE doctor_patients (
  doctor_id BIGINT UNSIGNED NOT NULL,
  patient_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (doctor_id, patient_id),
  KEY idx_doctor_patients_patient (patient_id),
  CONSTRAINT fk_doctor_patients_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_doctor_patients_patient
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE services (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  doctor_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_services_doctor_name (doctor_id, name),
  KEY idx_services_doctor (doctor_id),
  CONSTRAINT fk_services_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT chk_services_price_non_negative CHECK (price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE appointments (
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

INSERT INTO doctors (first_name, last_name, email, specialty, password, working_hours)
VALUES
  ('Анна', 'Иванова', 'anna.ivanova@example.com', 'Обща медицина', 'test1234', '09:00-17:00');

INSERT INTO patients (first_name, last_name, phone, email, address)
VALUES
  ('Мария', 'Петрова', '0888123456', 'maria@example.com', 'Варна'),
  ('Иван', 'Георгиев', '0877123456', 'ivan@example.com', 'Варна'),
  ('Елица', 'Николова', '0899123456', 'elitsa@example.com', 'Добрич');

INSERT INTO doctor_patients (doctor_id, patient_id)
SELECT doctors.id, patients.id
FROM doctors
INNER JOIN patients
WHERE doctors.email = 'anna.ivanova@example.com'
  AND patients.email IN ('maria@example.com', 'ivan@example.com', 'elitsa@example.com');

INSERT INTO services (doctor_id, name, description, price)
SELECT doctors.id, service_seed.name, service_seed.description, service_seed.price
FROM doctors
INNER JOIN (
  SELECT 'Първичен преглед' AS name, 'Първоначален медицински преглед на пациент' AS description, 50.00 AS price
  UNION ALL
  SELECT 'Контролен преглед', 'Повторен преглед след проведено лечение', 30.00
  UNION ALL
  SELECT 'Консултация', 'Медицинска консултация със специалист', 40.00
) AS service_seed
WHERE doctors.email = 'anna.ivanova@example.com';

INSERT INTO appointments (appointment_date, appointment_time, patient_id, doctor_id, service_id, status)
SELECT '2026-04-27', '09:00:00', patients.id, doctors.id, services.id, 'Предстоящ'
FROM patients
INNER JOIN doctors ON doctors.email = 'anna.ivanova@example.com'
INNER JOIN services
  ON services.doctor_id = doctors.id
  AND services.name = 'Контролен преглед'
WHERE patients.email = 'maria@example.com';

INSERT INTO appointments (appointment_date, appointment_time, patient_id, doctor_id, service_id, status)
SELECT '2026-04-27', '10:30:00', patients.id, doctors.id, services.id, 'Предстоящ'
FROM patients
INNER JOIN doctors ON doctors.email = 'anna.ivanova@example.com'
INNER JOIN services
  ON services.doctor_id = doctors.id
  AND services.name = 'Консултация'
WHERE patients.email = 'ivan@example.com';
