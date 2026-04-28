import { HttpError } from '../middleware/error.middleware';
import { AuthModel } from '../models/auth.model';
import { DoctorModel } from '../models/doctor.model';
import { type AuthSession, type LoginDoctorDTO } from '../types/Auth';
import { type CreateDoctorDTO } from '../types/Doctor';

export class AuthService {
  constructor(
    private authModel: AuthModel,
    private doctorModel: DoctorModel,
  ) {}

  async registerDoctor(data: CreateDoctorDTO): Promise<AuthSession> {
    this.validateRegistration(data);

    const existingDoctor = await this.doctorModel.findByEmailWithPassword(data.email);
    if (existingDoctor) {
      throw new HttpError(409, 'Doctor with this email already exists');
    }

    const doctor = await this.doctorModel.create(data);
    const token = await this.authModel.createSession(doctor.id);

    return { token, doctor };
  }

  async loginDoctor(data: LoginDoctorDTO): Promise<AuthSession> {
    if (!data || !data.email || !data.password) {
      throw new HttpError(400, 'Email and password are required');
    }

    const doctor = await this.doctorModel.findByEmailWithPassword(data.email);
    if (!doctor) {
      throw new HttpError(401, 'Invalid email or password');
    }

    if (data.password !== doctor.password) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const token = await this.authModel.createSession(doctor.id);
    const publicDoctor = {
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      specialty: doctor.specialty,
      workingHours: doctor.workingHours,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
    };

    return { token, doctor: publicDoctor };
  }

  async logout(token: string): Promise<boolean> {
    if (!token) {
      throw new HttpError(400, 'Token is required');
    }

    return this.authModel.deleteSession(token);
  }

  private validateRegistration(data: CreateDoctorDTO | undefined): void {
    if (
      !data ||
      !data.firstName ||
      !data.lastName ||
      !data.email ||
      !data.specialty ||
      !data.password ||
      !data.workingHours
    ) {
      throw new HttpError(400, 'Missing required doctor registration fields');
    }
  }
}
