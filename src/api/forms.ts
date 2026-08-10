import { apiClient } from "./client";
import type { ContactFormInput, QabulFormInput, VirtualReceptionFormInput } from "../types/forms";

export async function submitContact(input: ContactFormInput) {
  await apiClient.post("forms/contact", input);
}

export async function submitQabul(input: QabulFormInput) {
  const { data } = await apiClient.post<{ submitted: boolean; id: number }>("forms/qabul", input);
  return data;
}

export async function submitVirtualReception(input: VirtualReceptionFormInput) {
  const formData = new FormData();
  formData.append("fish", input.fish);
  formData.append("provinceId", String(input.provinceId));
  formData.append("districtId", String(input.districtId));
  formData.append("address", input.address);
  formData.append("phone", input.phone);
  formData.append("email", input.email);
  formData.append("gender", input.gender);
  formData.append("facultyId", String(input.facultyId));
  formData.append("text", input.text);
  if (input.file) {
    formData.append("file", input.file);
  }
  const { data } = await apiClient.postForm<{ submitted: boolean; id: number }>("forms/virtual-reception", formData);
  return data;
}
