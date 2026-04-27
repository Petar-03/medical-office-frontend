import { HttpError } from '../middleware/error.middleware';
import { PatientModel } from '../models/patient.model';
import { type CreatePatientDTO, type Patient, type UpdatePatientDTO } from '../types/Patient';

export class PatientService {
  constructor(private patientModel: PatientModel) {}

  async getPatientsByDoctorId(doctorId: number): Promise<Patient[]> {
    this.assertPositiveId(doctorId, 'Invalid doctor id');
    return this.patientModel.findByDoctorId(doctorId);
  }

  async createPatientForDoctor(doctorId: number, data: CreatePatientDTO): Promise<Patient> {
    this.assertPositiveId(doctorId, 'Invalid doctor id');
    this.validateRequiredFields(data);
    return this.patientModel.createForDoctor(doctorId, data);
  }

  async updatePatientForDoctor(
    doctorId: number,
    patientId: number,
    data: UpdatePatientDTO,
  ): Promise<Patient | undefined> {
    this.assertPositiveId(doctorId, 'Invalid doctor id');
    this.assertPositiveId(patientId, 'Invalid patient id');
    return this.patientModel.updateForDoctor(doctorId, patientId, data);
  }

  async deletePatientForDoctor(doctorId: number, patientId: number): Promise<boolean> {
    this.assertPositiveId(doctorId, 'Invalid doctor id');
    this.assertPositiveId(patientId, 'Invalid patient id');
    return this.patientModel.deleteForDoctor(doctorId, patientId);
  }

  private validateRequiredFields(data: CreatePatientDTO | undefined): void {
    if (!data || !data.firstName || !data.lastName || !data.phone || !data.email || !data.address) {
      throw new HttpError(400, 'Missing required patient fields');
    }
  }

  private assertPositiveId(id: number, message: string): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, message);
    }
  }
}
