export interface Appointment {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
  patientId: number;
  doctorId: number;
  serviceId: number;
  status: string;
  patientName?: string;
  doctorName?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAppointmentDTO {
  appointmentDate: string;
  appointmentTime: string;
  patientId: number;
  serviceId: number;
  status?: string;
}

export type UpdateAppointmentDTO = Partial<CreateAppointmentDTO>;
