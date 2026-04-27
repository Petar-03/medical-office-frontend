import { type Request, type Response } from 'express';
import { HttpError } from '../middleware/error.middleware';
import { DoctorService } from '../services/doctor.service';

interface DoctorParams {
  doctorId: string;
}

export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  updateProfile = async (req: Request<DoctorParams>, res: Response): Promise<void> => {
    const doctorId = Number(req.params.doctorId);
    const doctor = await this.doctorService.updateProfile(doctorId, req.body);

    if (!doctor) {
      throw new HttpError(404, 'Doctor not found');
    }

    res.json({ message: 'Doctor profile updated', data: doctor });
  };

  changePassword = async (req: Request<DoctorParams>, res: Response): Promise<void> => {
    const doctorId = Number(req.params.doctorId);
    await this.doctorService.changePassword(doctorId, req.body);
    res.json({ message: 'Doctor password changed' });
  };
}
