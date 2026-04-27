import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { DoctorController } from '../controllers/doctor.controller';
import { PatientController } from '../controllers/patient.controller';
import { ServiceController } from '../controllers/service.controller';
import { requireDoctorSession } from '../middleware/auth.middleware';

export function createDoctorRoutes(
  doctorController: DoctorController,
  patientController: PatientController,
  serviceController: ServiceController,
  appointmentController: AppointmentController,
): Router {
  const doctorRoutes = Router();

  doctorRoutes.use('/:doctorId', requireDoctorSession);

  doctorRoutes.put('/:doctorId/profile', doctorController.updateProfile);
  doctorRoutes.put('/:doctorId/password', doctorController.changePassword);

  doctorRoutes.get('/:doctorId/patients', patientController.getByDoctor);
  doctorRoutes.post('/:doctorId/patients', patientController.createForDoctor);
  doctorRoutes.put('/:doctorId/patients/:patientId', patientController.updateForDoctor);
  doctorRoutes.delete('/:doctorId/patients/:patientId', patientController.deleteForDoctor);

  doctorRoutes.get('/:doctorId/services', serviceController.getByDoctor);
  doctorRoutes.post('/:doctorId/services', serviceController.createForDoctor);
  doctorRoutes.put('/:doctorId/services/:serviceId', serviceController.updateForDoctor);
  doctorRoutes.delete('/:doctorId/services/:serviceId', serviceController.deleteForDoctor);

  doctorRoutes.get('/:doctorId/appointments', appointmentController.getByDoctor);
  doctorRoutes.post('/:doctorId/appointments', appointmentController.createForDoctor);
  doctorRoutes.put(
    '/:doctorId/appointments/:appointmentId',
    appointmentController.updateForDoctor,
  );
  doctorRoutes.delete(
    '/:doctorId/appointments/:appointmentId',
    appointmentController.deleteForDoctor,
  );

  return doctorRoutes;
}
