import { type Pool, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise';
import {
  type CreateDoctorDTO,
  type Doctor,
  type DoctorWithPassword,
  type UpdateDoctorProfileDTO,
} from '../types/Doctor';

export class DoctorModel {
  constructor(private db: Pool) {}

  async findById(id: number): Promise<Doctor | undefined> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `${this.publicSelect()} WHERE doctors.id = ?`,
      [id],
    );
    return rows[0] as Doctor | undefined;
  }

  async findByEmailWithPassword(email: string): Promise<DoctorWithPassword | undefined> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `${this.internalSelect()} WHERE doctors.email = ?`,
      [email],
    );
    return rows[0] as DoctorWithPassword | undefined;
  }

  async create(data: CreateDoctorDTO): Promise<Doctor> {
    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO doctors
        (first_name, last_name, email, specialty, password, working_hours)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.firstName,
        data.lastName,
        data.email,
        data.specialty,
        data.password,
        data.workingHours,
      ],
    );

    const doctor = await this.findById(result.insertId);
    if (!doctor) {
      throw new Error('Doctor was not created');
    }

    return doctor;
  }

  async updateProfile(id: number, data: UpdateDoctorProfileDTO): Promise<Doctor | undefined> {
    const existing = await this.findById(id);
    if (!existing) {
      return undefined;
    }

    const updated = { ...existing, ...data };
    await this.db.query<ResultSetHeader>(
      `UPDATE doctors
       SET first_name = ?, last_name = ?, email = ?, specialty = ?, working_hours = ?
       WHERE id = ?`,
      [
        updated.firstName,
        updated.lastName,
        updated.email,
        updated.specialty,
        updated.workingHours,
        id,
      ],
    );

    return this.findById(id);
  }

  async updatePassword(id: number, password: string): Promise<boolean> {
    const [result] = await this.db.query<ResultSetHeader>(
      'UPDATE doctors SET password = ? WHERE id = ?',
      [password, id],
    );
    return result.affectedRows > 0;
  }

  async findInternalById(id: number): Promise<DoctorWithPassword | undefined> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `${this.internalSelect()} WHERE doctors.id = ?`,
      [id],
    );
    return rows[0] as DoctorWithPassword | undefined;
  }

  private publicSelect(): string {
    return `SELECT
      doctors.id,
      doctors.first_name AS firstName,
      doctors.last_name AS lastName,
      doctors.email,
      doctors.specialty,
      doctors.working_hours AS workingHours,
      doctors.created_at AS createdAt,
      doctors.updated_at AS updatedAt
    FROM doctors`;
  }

  private internalSelect(): string {
    return `SELECT
      doctors.id,
      doctors.first_name AS firstName,
      doctors.last_name AS lastName,
      doctors.email,
      doctors.specialty,
      doctors.password,
      doctors.working_hours AS workingHours,
      doctors.created_at AS createdAt,
      doctors.updated_at AS updatedAt
    FROM doctors`;
  }
}
