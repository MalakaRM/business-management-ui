export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface CreateUserResponse {
  id: number;
  username: string;
  email: string;
}
