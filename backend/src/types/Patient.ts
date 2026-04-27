export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePatientDTO {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
}

export type UpdatePatientDTO = Partial<CreatePatientDTO>;
