import { type Request, type Response } from 'express';
import { HttpError } from '../middleware/error.middleware';
import { AppointmentService } from '../services/appointment.service';

interface DoctorParams {
  doctorId: string;
}

interface DoctorAppointmentParams extends DoctorParams {
  appointmentId: string;
}

interface AppointmentQuery {
  date?: string;
}

export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  getByDoctor = async (
    req: Request<DoctorParams, unknown, unknown, AppointmentQuery>,
    res: Response,
  ): Promise<void> => {
    const doctorId = Number(req.params.doctorId);
    const appointments = await this.appointmentService.getAppointmentsByDoctorId(
      doctorId,
      req.query.date,
    );
    res.json({ message: 'Appointments found', data: appointments });
  };

  createForDoctor = async (req: Request<DoctorParams>, res: Response): Promise<void> => {
    const doctorId = Number(req.params.doctorId);
    const appointment = await this.appointmentService.createAppointmentForDoctor(
      doctorId,
      req.body,
    );
    res.status(201).json({ message: 'Appointment created', data: appointment });
  };

  updateForDoctor = async (
    req: Request<DoctorAppointmentParams>,
    res: Response,
  ): Promise<void> => {
    const doctorId = Number(req.params.doctorId);
    const appointmentId = Number(req.params.appointmentId);
    const appointment = await this.appointmentService.updateAppointmentForDoctor(
      doctorId,
      appointmentId,
      req.body,
    );

    if (!appointment) {
      throw new HttpError(404, 'Appointment not found for this doctor');
    }

    res.json({ message: 'Appointment updated', data: appointment });
  };

  deleteForDoctor = async (
    req: Request<DoctorAppointmentParams>,
    res: Response,
  ): Promise<void> => {
    const doctorId = Number(req.params.doctorId);
    const appointmentId = Number(req.params.appointmentId);
    const deleted = await this.appointmentService.deleteAppointmentForDoctor(
      doctorId,
      appointmentId,
    );

    if (!deleted) {
      throw new HttpError(404, 'Appointment not found for this doctor');
    }

    res.json({ message: 'Appointment deleted' });
  };
}
