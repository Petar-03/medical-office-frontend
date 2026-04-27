import { type Doctor } from './Doctor';

export interface LoginDoctorDTO {
  email: string;
  password: string;
}

export interface AuthSession {
  token: string;
  doctor: Doctor;
}
