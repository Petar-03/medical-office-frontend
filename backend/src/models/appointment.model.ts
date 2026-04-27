import { type Pool, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise';
import {
  type Appointment,
  type CreateAppointmentDTO,
  type UpdateAppointmentDTO,
} from '../types/Appointment';

export class AppointmentModel {
  constructor(private db: Pool) {}

  async findByDoctorId(doctorId: number, date?: string): Promise<Appointment[]> {
    const params: Array<number | string> = [doctorId];
    const dateFilter = date ? 'AND appointments.appointment_date = ?' : '';

    if (date) {
      params.push(date);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(
      `${this.baseSelect()}
       WHERE appointments.doctor_id = ? ${dateFilter}
       ORDER BY appointments.appointment_date, appointments.appointment_time`,
      params,
    );
    return rows as Appointment[];
  }

  async findByDoctorAndId(
    doctorId: number,
    appointmentId: number,
  ): Promise<Appointment | undefined> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `${this.baseSelect()}
       WHERE appointments.doctor_id = ? AND appointments.id = ?`,
      [doctorId, appointmentId],
    );
    return rows[0] as Appointment | undefined;
  }

  async createForDoctor(doctorId: number, data: CreateAppointmentDTO): Promise<Appointment> {
    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO appointments
        (appointment_date, appointment_time, patient_id, doctor_id, service_id, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.appointmentDate,
        data.appointmentTime,
        data.patientId,
        doctorId,
        data.serviceId,
        data.status || 'Предстоящ',
      ],
    );

    const appointment = await this.findByDoctorAndId(doctorId, result.insertId);
    if (!appointment) {
      throw new Error('Appointment was not created');
    }

    return appointment;
  }

  async updateForDoctor(
    doctorId: number,
    appointmentId: number,
    data: UpdateAppointmentDTO,
  ): Promise<Appointment | undefined> {
    const existing = await this.findByDoctorAndId(doctorId, appointmentId);
    if (!existing) {
      return undefined;
    }

    const updated = { ...existing, ...data };
    await this.db.query<ResultSetHeader>(
      `UPDATE appointments
       SET appointment_date = ?,
           appointment_time = ?,
           patient_id = ?,
           service_id = ?,
           status = ?
       WHERE doctor_id = ? AND id = ?`,
      [
        updated.appointmentDate,
        updated.appointmentTime,
        updated.patientId,
        updated.serviceId,
        updated.status,
        doctorId,
        appointmentId,
      ],
    );

    return this.findByDoctorAndId(doctorId, appointmentId);
  }

  async deleteForDoctor(doctorId: number, appointmentId: number): Promise<boolean> {
    const [result] = await this.db.query<ResultSetHeader>(
      'DELETE FROM appointments WHERE doctor_id = ? AND id = ?',
      [doctorId, appointmentId],
    );
    return result.affectedRows > 0;
  }

  private baseSelect(): string {
    return `SELECT
      appointments.id,
      appointments.appointment_date AS appointmentDate,
      TIME_FORMAT(appointments.appointment_time, '%H:%i') AS appointmentTime,
      appointments.patient_id AS patientId,
      appointments.doctor_id AS doctorId,
      appointments.service_id AS serviceId,
      appointments.status,
      CONCAT(patients.first_name, ' ', patients.last_name) AS patientName,
      CONCAT(doctors.first_name, ' ', doctors.last_name) AS doctorName,
      services.name AS type,
      appointments.created_at AS createdAt,
      appointments.updated_at AS updatedAt
    FROM appointments
    INNER JOIN patients ON patients.id = appointments.patient_id
    INNER JOIN doctors ON doctors.id = appointments.doctor_id
    INNER JOIN services ON services.id = appointments.service_id`;
  }
}
