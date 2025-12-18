// API Response 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// 인증 관련 타입
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  nickname: string;
  password: string;
}

// 게시글 관련 타입
export interface PostListDTO {
  id: number;
  title: string;
  username: string;
  view: number;
}

export interface PostDetailDTO {
  title: string;
  body: string;
  view: number;
  username: string;
}

export interface PostCreateDTO {
  title: string;
  body: string;
}

export interface PostUpdateDTO {
  title: string;
  body: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Redux 상태 타입
export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  username: string | null;
}

