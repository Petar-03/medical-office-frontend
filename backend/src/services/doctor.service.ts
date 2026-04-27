import { HttpError } from '../middleware/error.middleware';
import { DoctorModel } from '../models/doctor.model';
import {
  type ChangeDoctorPasswordDTO,
  type Doctor,
  type UpdateDoctorProfileDTO,
} from '../types/Doctor';

export class DoctorService {
  constructor(private doctorModel: DoctorModel) {}

  async updateProfile(doctorId: number, data: UpdateDoctorProfileDTO): Promise<Doctor | undefined> {
    this.assertPositiveId(doctorId, 'Invalid doctor id');
    return this.doctorModel.updateProfile(doctorId, data);
  }

  async changePassword(doctorId: number, data: ChangeDoctorPasswordDTO): Promise<void> {
    this.assertPositiveId(doctorId, 'Invalid doctor id');

    if (!data.currentPassword || !data.newPassword) {
      throw new HttpError(400, 'Current password and new password are required');
    }

    const doctor = await this.doctorModel.findInternalById(doctorId);
    if (!doctor) {
      throw new HttpError(404, 'Doctor not found');
    }

    if (data.currentPassword !== doctor.password) {
      throw new HttpError(401, 'Current password is incorrect');
    }

    await this.doctorModel.updatePassword(doctorId, data.newPassword);
  }

  private assertPositiveId(id: number, message: string): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, message);
    }
  }
}
