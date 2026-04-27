export interface MedicalService {
  id: number;
  doctorId: number;
  name: string;
  description: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServiceDTO {
  name: string;
  description: string;
  price: number;
}

export type UpdateServiceDTO = Partial<CreateServiceDTO>;
