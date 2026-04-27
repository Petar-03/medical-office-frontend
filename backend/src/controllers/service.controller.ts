import { type Request, type Response } from 'express';
import { HttpError } from '../middleware/error.middleware';
import { ServiceService } from '../services/service.service';

interface DoctorParams {
  doctorId: string;
}

interface DoctorServiceParams extends DoctorParams {
  serviceId: string;
}

export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  getByDoctor = async (req: Request<DoctorParams>, res: Response): Promise<void> => {
    const doctorId = Number(req.params.doctorId);
    const services = await this.serviceService.getServicesByDoctorId(doctorId);
    res.json({ message: 'Services found', data: services });
  };

  createForDoctor = async (req: Request<DoctorParams>, res: Response): Promise<void> => {
    const doctorId = Number(req.params.doctorId);
    const service = await this.serviceService.createServiceForDoctor(doctorId, req.body);
    res.status(201).json({ message: 'Service created', data: service });
  };

  updateForDoctor = async (
    req: Request<DoctorServiceParams>,
    res: Response,
  ): Promise<void> => {
    const doctorId = Number(req.params.doctorId);
    const serviceId = Number(req.params.serviceId);
    const service = await this.serviceService.updateServiceForDoctor(doctorId, serviceId, req.body);

    if (!service) {
      throw new HttpError(404, 'Service not found for this doctor');
    }

    res.json({ message: 'Service updated', data: service });
  };

  deleteForDoctor = async (
    req: Request<DoctorServiceParams>,
    res: Response,
  ): Promise<void> => {
    const doctorId = Number(req.params.doctorId);
    const serviceId = Number(req.params.serviceId);
    const deleted = await this.serviceService.deleteServiceForDoctor(doctorId, serviceId);

    if (!deleted) {
      throw new HttpError(404, 'Service not found for this doctor');
    }

    res.json({ message: 'Service deleted' });
  };
}
