import { type Pool, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise';
import { type CreatePatientDTO, type Patient, type UpdatePatientDTO } from '../types/Patient';

export class PatientModel {
  constructor(private db: Pool) {}

  async findByDoctorId(doctorId: number): Promise<Patient[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `${this.baseSelect()}
       INNER JOIN doctor_patients dp ON dp.patient_id = patients.id
       WHERE dp.doctor_id = ?
       ORDER BY patients.last_name, patients.first_name`,
      [doctorId],
    );
    return rows as Patient[];
  }

  async findByDoctorAndId(doctorId: number, patientId: number): Promise<Patient | undefined> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `${this.baseSelect()}
       INNER JOIN doctor_patients dp ON dp.patient_id = patients.id
       WHERE dp.doctor_id = ? AND patients.id = ?`,
      [doctorId, patientId],
    );
    return rows[0] as Patient | undefined;
  }

  async createForDoctor(doctorId: number, data: CreatePatientDTO): Promise<Patient> {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO patients (first_name, last_name, phone, email, address)
         VALUES (?, ?, ?, ?, ?)`,
        [data.firstName, data.lastName, data.phone, data.email, data.address],
      );

      await connection.query<ResultSetHeader>(
        `INSERT INTO doctor_patients (doctor_id, patient_id)
         VALUES (?, ?)`,
        [doctorId, result.insertId],
      );

      await connection.commit();
      const patient = await this.findByDoctorAndId(doctorId, result.insertId);

      if (!patient) {
        throw new Error('Patient was not created');
      }

      return patient;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateForDoctor(
    doctorId: number,
    patientId: number,
    data: UpdatePatientDTO,
  ): Promise<Patient | undefined> {
    const existing = await this.findByDoctorAndId(doctorId, patientId);
    if (!existing) {
      return undefined;
    }

    const updated = { ...existing, ...data };
    await this.db.query<ResultSetHeader>(
      `UPDATE patients
       SET first_name = ?, last_name = ?, phone = ?, email = ?, address = ?
       WHERE id = ?`,
      [updated.firstName, updated.lastName, updated.phone, updated.email, updated.address, patientId],
    );

    return this.findByDoctorAndId(doctorId, patientId);
  }

  async deleteForDoctor(doctorId: number, patientId: number): Promise<boolean> {
    const [result] = await this.db.query<ResultSetHeader>(
      `DELETE patients
       FROM patients
       INNER JOIN doctor_patients dp ON dp.patient_id = patients.id
       WHERE dp.doctor_id = ? AND patients.id = ?`,
      [doctorId, patientId],
    );
    return result.affectedRows > 0;
  }

  private baseSelect(): string {
    return `SELECT
      patients.id,
      patients.first_name AS firstName,
      patients.last_name AS lastName,
      patients.phone,
      patients.email,
      patients.address,
      patients.created_at AS createdAt,
      patients.updated_at AS updatedAt
    FROM patients`;
  }
}
