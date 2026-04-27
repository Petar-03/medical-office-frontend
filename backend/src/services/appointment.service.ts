import { HttpError } from '../middleware/error.middleware';
import { AppointmentModel } from '../models/appointment.model';
import { PatientModel } from '../models/patient.model';
import { ServiceModel } from '../models/service.model';
import {
  type Appointment,
  type CreateAppointmentDTO,
  type UpdateAppointmentDTO,
} from '../types/Appointment';

export class AppointmentService {
  constructor(
    private appointmentModel: AppointmentModel,
    private patientModel: PatientModel,
    private serviceModel: ServiceModel,
  ) {}

  async getAppointmentsByDoctorId(doctorId: number, date?: string): Promise<Appointment[]> {
    this.assertPositiveId(doctorId, 'Invalid doctor id');
    return this.appointmentModel.findByDoctorId(doctorId, date);
  }

  async createAppointmentForDoctor(
    doctorId: number,
    data: CreateAppointmentDTO,
  ): Promise<Appointment> {
    this.assertPositiveId(doctorId, 'Invalid doctor id');
    this.validateRequiredFields(data);
    await this.assertPatientAndServiceBelongToDoctor(doctorId, data.patientId, data.serviceId);
    return this.appointmentModel.createForDoctor(doctorId, data);
  }

  async updateAppointmentForDoctor(
    doctorId: number,
    appointmentId: number,
    data: UpdateAppointmentDTO,
  ): Promise<Appointment | undefined> {
    this.assertPositiveId(doctorId, 'Invalid doctor id');
    this.assertPositiveId(appointmentId, 'Invalid appointment id');

    const existing = await this.appointmentModel.findByDoctorAndId(doctorId, appointmentId);
    if (!existing) {
      return undefined;
    }

    const patientId = data.patientId ?? existing.patientId;
    const serviceId = data.serviceId ?? existing.serviceId;
    await this.assertPatientAndServiceBelongToDoctor(doctorId, patientId, serviceId);

    return this.appointmentModel.updateForDoctor(doctorId, appointmentId, data);
  }

  async deleteAppointmentForDoctor(doctorId: number, appointmentId: number): Promise<boolean> {
    this.assertPositiveId(doctorId, 'Invalid doctor id');
    this.assertPositiveId(appointmentId, 'Invalid appointment id');
    return this.appointmentModel.deleteForDoctor(doctorId, appointmentId);
  }

  private async assertPatientAndServiceBelongToDoctor(
    doctorId: number,
    patientId: number,
    serviceId: number,
  ): Promise<void> {
    const patient = await this.patientModel.findByDoctorAndId(doctorId, patientId);
    if (!patient) {
      throw new HttpError(400, 'Patient does not belong to this doctor');
    }

    const service = await this.serviceModel.findByDoctorAndId(doctorId, serviceId);
    if (!service) {
      throw new HttpError(400, 'Service does not belong to this doctor');
    }
  }

  private validateRequiredFields(data: CreateAppointmentDTO | undefined): void {
    if (!data || !data.appointmentDate || !data.appointmentTime || !data.patientId || !data.serviceId) {
      throw new HttpError(400, 'Missing required appointment fields');
    }
  }

  private assertPositiveId(id: number, message: string): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, message);
    }
  }
}
