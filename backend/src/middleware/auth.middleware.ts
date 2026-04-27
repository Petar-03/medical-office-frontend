import { type NextFunction, type Request, type Response } from 'express';
import { type RowDataPacket } from 'mysql2/promise';
import pool from '../config/db';
import { HttpError } from './error.middleware';

interface DoctorParams {
  doctorId: string;
}

export async function requireDoctorSession(
  req: Request<DoctorParams>,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const doctorId = Number(req.params.doctorId);
    const token = getBearerToken(req);

    if (!Number.isInteger(doctorId) || doctorId <= 0) {
      throw new HttpError(400, 'Invalid doctor id');
    }

    if (!token) {
      throw new HttpError(401, 'Missing authorization token');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id
       FROM doctor_sessions
       WHERE doctor_id = ? AND token = ?
       LIMIT 1`,
      [doctorId, token],
    );

    if (!rows[0]) {
      throw new HttpError(401, 'Invalid or expired authorization token');
    }

    next();
  } catch (error) {
    next(error);
  }
}

function getBearerToken(req: { headers: Request['headers'] }): string {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return '';
  }

  return authHeader.slice('Bearer '.length);
}
