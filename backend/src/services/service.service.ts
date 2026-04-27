import { HttpError } from '../middleware/error.middleware';
import { ServiceModel } from '../models/service.model';
import {
  type CreateServiceDTO,
  type MedicalService,
  type UpdateServiceDTO,
} from '../types/Service';

export class ServiceService {
  constructor(private serviceModel: ServiceModel) {}

  async getServicesByDoctorId(doctorId: number): Promise<MedicalService[]> {
    this.assertPositiveId(doctorId, 'Invalid doctor id');
    return this.serviceModel.findByDoctorId(doctorId);
  }

  async createServiceForDoctor(doctorId: number, data: CreateServiceDTO): Promise<MedicalService> {
    this.assertPositiveId(doctorId, 'Invalid doctor id');
    this.validateRequiredFields(data);
    return this.serviceModel.createForDoctor(doctorId, data);
  }

  async updateServiceForDoctor(
    doctorId: number,
    serviceId: number,
    data: UpdateServiceDTO,
  ): Promise<MedicalService | undefined> {
    this.assertPositiveId(doctorId, 'Invalid doctor id');
    this.assertPositiveId(serviceId, 'Invalid service id');

    if (data.price !== undefined && Number(data.price) < 0) {
      throw new HttpError(400, 'Service price cannot be negative');
    }

    return this.serviceModel.updateForDoctor(doctorId, serviceId, data);
  }

  async deleteServiceForDoctor(doctorId: number, serviceId: number): Promise<boolean> {
    this.assertPositiveId(doctorId, 'Invalid doctor id');
    this.assertPositiveId(serviceId, 'Invalid service id');
    return this.serviceModel.deleteForDoctor(doctorId, serviceId);
  }

  private validateRequiredFields(data: CreateServiceDTO | undefined): void {
    if (!data || !data.name || !data.description || data.price === undefined || Number(data.price) < 0) {
      throw new HttpError(400, 'Missing or invalid service fields');
    }
  }

  private assertPositiveId(id: number, message: string): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, message);
    }
  }
}
