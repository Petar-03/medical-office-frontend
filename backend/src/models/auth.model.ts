import { randomUUID } from 'node:crypto';
import { type Pool, type ResultSetHeader } from 'mysql2/promise';

export class AuthModel {
  constructor(private db: Pool) {}

  async createSession(doctorId: number): Promise<string> {
    const token = randomUUID();

    await this.db.query<ResultSetHeader>(
      'INSERT INTO doctor_sessions (doctor_id, token) VALUES (?, ?)',
      [doctorId, token],
    );

    return token;
  }

  async deleteSession(token: string): Promise<boolean> {
    const [result] = await this.db.query<ResultSetHeader>(
      'DELETE FROM doctor_sessions WHERE token = ?',
      [token],
    );
    return result.affectedRows > 0;
  }
}
