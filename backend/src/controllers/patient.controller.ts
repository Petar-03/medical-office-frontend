import { type Request, type Response } from 'express';
import { HttpError } from '../middleware/error.middleware';
import { PatientService } from '../services/patient.service';

interface DoctorParams {
  doctorId: string;
}

interface DoctorPatientParams extends DoctorParams {
  patientId: string;
}

export class PatientController {
  constructor(private patientService: PatientService) {}

  getByDoctor = async (req: Request<DoctorParams>, res: Response): Promise<void> => {
    const doctorId = Number(req.params.doctorId);
    const patients = await this.patientService.getPatientsByDoctorId(doctorId);
    res.json({ message: 'Patients found', data: patients });
  };

  createForDoctor = async (req: Request<DoctorParams>, res: Response): Promise<void> => {
    const doctorId = Number(req.params.doctorId);
    const patient = await this.patientService.createPatientForDoctor(doctorId, req.body);
    res.status(201).json({ message: 'Patient created', data: patient });
  };

  updateForDoctor = async (
    req: Request<DoctorPatientParams>,
    res: Response,
  ): Promise<void> => {
    const doctorId = Number(req.params.doctorId);
    const patientId = Number(req.params.patientId);
    const patient = await this.patientService.updatePatientForDoctor(doctorId, patientId, req.body);

    if (!patient) {
      throw new HttpError(404, 'Patient not found for this doctor');
    }

    res.json({ message: 'Patient updated', data: patient });
  };

  deleteForDoctor = async (
    req: Request<DoctorPatientParams>,
    res: Response,
  ): Promise<void> => {
    const doctorId = Number(req.params.doctorId);
    const patientId = Number(req.params.patientId);
    const deleted = await this.patientService.deletePatientForDoctor(doctorId, patientId);

    if (!deleted) {
      throw new HttpError(404, 'Patient not found for this doctor');
    }

    res.json({ message: 'Patient deleted' });
  };
}
