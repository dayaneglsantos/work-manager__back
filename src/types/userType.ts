export interface UserType {
  name: string;
  email: string;
  phone_number: string;
  address_id: number | null;
  emergency_contact: string | null;
  birthday: string | null;
  profile_img: string | null;
  password: string;
  profile_id: number | null;
  supervisor_id: number | null;
  department_id: number | null;
  current_salary: string | null;
  admission_date: string | null;
  current_position: string | null;
  employment_status: string | null;
  notes: string | null;
}
