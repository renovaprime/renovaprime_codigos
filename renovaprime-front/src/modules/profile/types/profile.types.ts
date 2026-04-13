export interface ProfileUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  created_at: string;
}

export interface UpdateProfileData {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileResponse {
  data: ProfileUser;
}

export interface PasswordUpdateResponse {
  data: {
    message: string;
  };
}
