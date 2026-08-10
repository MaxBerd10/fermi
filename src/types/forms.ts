export interface ContactFormInput {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface QabulFormInput {
  categoryId: number;
  date: string;
  subject: string;
  fish: string;
  phone: string;
  email: string;
  regionId: number;
  districtId: number;
  quarterId: number;
}

export interface VirtualReceptionFormInput {
  fish: string;
  provinceId: number;
  districtId: number;
  address: string;
  phone: string;
  email: string;
  gender: string;
  facultyId: number;
  text: string;
  file?: File | null;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  username: string;
  password: string;
}
