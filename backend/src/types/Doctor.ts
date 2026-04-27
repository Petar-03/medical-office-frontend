export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  workingHours: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorWithPassword extends Doctor {
  password: string;
}

export interface CreateDoctorDTO {
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  password: string;
  workingHours: string;
}

export interface UpdateDoctorProfileDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  specialty?: string;
  workingHours?: string;
}

export interface ChangeDoctorPasswordDTO {
  currentPassword: string;
  newPassword: string;
}
