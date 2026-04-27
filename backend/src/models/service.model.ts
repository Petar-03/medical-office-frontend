import { type Pool, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise';
import {
  type CreateServiceDTO,
  type MedicalService,
  type UpdateServiceDTO,
} from '../types/Service';

export class ServiceModel {
  constructor(private db: Pool) {}

  async findByDoctorId(doctorId: number): Promise<MedicalService[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `${this.baseSelect()}
       WHERE services.doctor_id = ?
       ORDER BY services.name`,
      [doctorId],
    );
    return rows as MedicalService[];
  }

  async findByDoctorAndId(doctorId: number, serviceId: number): Promise<MedicalService | undefined> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `${this.baseSelect()} WHERE services.doctor_id = ? AND services.id = ?`,
      [doctorId, serviceId],
    );
    return rows[0] as MedicalService | undefined;
  }

  async createForDoctor(doctorId: number, data: CreateServiceDTO): Promise<MedicalService> {
    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO services (doctor_id, name, description, price)
       VALUES (?, ?, ?, ?)`,
      [doctorId, data.name, data.description, data.price],
    );

    const service = await this.findByDoctorAndId(doctorId, result.insertId);
    if (!service) {
      throw new Error('Service was not created');
    }

    return service;
  }

  async updateForDoctor(
    doctorId: number,
    serviceId: number,
    data: UpdateServiceDTO,
  ): Promise<MedicalService | undefined> {
    const existing = await this.findByDoctorAndId(doctorId, serviceId);
    if (!existing) {
      return undefined;
    }

    const updated = { ...existing, ...data };
    await this.db.query<ResultSetHeader>(
      `UPDATE services
       SET name = ?, description = ?, price = ?
       WHERE doctor_id = ? AND id = ?`,
      [updated.name, updated.description, updated.price, doctorId, serviceId],
    );

    return this.findByDoctorAndId(doctorId, serviceId);
  }

  async deleteForDoctor(doctorId: number, serviceId: number): Promise<boolean> {
    const [result] = await this.db.query<ResultSetHeader>(
      'DELETE FROM services WHERE doctor_id = ? AND id = ?',
      [doctorId, serviceId],
    );
    return result.affectedRows > 0;
  }

  private baseSelect(): string {
    return `SELECT
      services.id,
      services.doctor_id AS doctorId,
      services.name,
      services.description,
      services.price,
      services.created_at AS createdAt,
      services.updated_at AS updatedAt
    FROM services`;
  }
}
