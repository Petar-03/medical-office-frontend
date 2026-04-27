import { Router } from 'express';
import pool from '../config/db';
import { AppointmentController } from '../controllers/appointment.controller';
import { AuthController } from '../controllers/auth.controller';
import { DoctorController } from '../controllers/doctor.controller';
import { PatientController } from '../controllers/patient.controller';
import { ServiceController } from '../controllers/service.controller';
import { AppointmentModel } from '../models/appointment.model';
import { AuthModel } from '../models/auth.model';
import { DoctorModel } from '../models/doctor.model';
import { PatientModel } from '../models/patient.model';
import { ServiceModel } from '../models/service.model';
import { AppointmentService } from '../services/appointment.service';
import { AuthService } from '../services/auth.service';
import { DoctorService } from '../services/doctor.service';
import { PatientService } from '../services/patient.service';
import { ServiceService } from '../services/service.service';
import { createAuthRoutes } from './auth.routes';
import { createDoctorRoutes } from './doctor.routes';

const patientModel = new PatientModel(pool);
const doctorModel = new DoctorModel(pool);
const serviceModel = new ServiceModel(pool);
const appointmentModel = new AppointmentModel(pool);
const authModel = new AuthModel(pool);

const patientService = new PatientService(patientModel);
const doctorService = new DoctorService(doctorModel);
const serviceService = new ServiceService(serviceModel);
const appointmentService = new AppointmentService(appointmentModel, patientModel, serviceModel);
const authService = new AuthService(authModel, doctorModel);

const patientController = new PatientController(patientService);
const doctorController = new DoctorController(doctorService);
const serviceController = new ServiceController(serviceService);
const appointmentController = new AppointmentController(appointmentService);
const authController = new AuthController(authService);

const apiRouter = Router();

apiRouter.use('/auth', createAuthRoutes(authController));
apiRouter.use(
  '/doctors',
  createDoctorRoutes(
    doctorController,
    patientController,
    serviceController,
    appointmentController,
  ),
);

export default apiRouter;
