import axios, { AxiosError, CancelTokenSource } from 'axios';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  PostListDTO,
  PostDetailDTO,
  PostCreateDTO,
  PostUpdateDTO,
  PageResponse,
} from './types';
import { createRequestKey } from './requestTracker';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 중복 요청 방지를 위한 맵
const requestMap = new Map<string, CancelTokenSource>();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 추가 및 중복 요청 방지
apiClient.interceptors.request.use(
  config => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // GET 요청에 대해서만 중복 방지 적용
    if (config.method === 'get') {
      const requestKey = createRequestKey(
        config.method?.toUpperCase() || 'GET',
        config.url || '',
        config.params
      );

      // 이미 진행 중인 동일한 요청이 있으면 취소 (조용히)
      const existingSource = requestMap.get(requestKey);
      if (existingSource) {
        existingSource.cancel();
        requestMap.delete(requestKey);
      }

      // 새로운 CancelToken 생성
      const source = axios.CancelToken.source();
      config.cancelToken = source.token;
      requestMap.set(requestKey, source);
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리 및 요청 추적 정리
apiClient.interceptors.response.use(
  response => {
    // 성공한 요청은 추적 맵에서 제거
    if (response.config.method === 'get') {
      const requestKey = createRequestKey(
        response.config.method?.toUpperCase() || 'GET',
        response.config.url || '',
        response.config.params
      );
      requestMap.delete(requestKey);
    }
    return response;
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    // 취소된 요청은 조용히 무시 (에러 메시지 없이)
    if (axios.isCancel(error)) {
      // 취소된 요청은 특별한 에러 객체로 반환하여 호출자가 무시할 수 있도록 함
      const cancelError = new Error('Request cancelled') as Error & { isCancel: boolean };
      cancelError.isCancel = true;
      return Promise.reject(cancelError);
    }

    // 실패한 요청도 추적 맵에서 제거
    if (error.config?.method === 'get') {
      const requestKey = createRequestKey(
        error.config.method?.toUpperCase() || 'GET',
        error.config.url || '',
        error.config.params
      );
      requestMap.delete(requestKey);
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      // 게시글 조회 API는 공개적으로 접근 가능하므로 리다이렉트하지 않음
      const url = error.config?.url || '';
      const isPublicPostAPI = url.includes('/api/post') && error.config?.method === 'get';

      if (!isPublicPostAPI) {
        // 인증 실패 시 로그아웃 처리
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          // 현재 페이지가 로그인/회원가입 페이지가 아닐 때만 리다이렉트
          if (
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register')
          ) {
            window.location.href = '/login';
          }
        }
      }
    }

    // 백엔드에서 반환한 에러 메시지 추출
    const errorMessage =
      error.response?.data?.message || error.message || '요청 처리 중 오류가 발생했습니다.';
    const customError = new Error(errorMessage);
    return Promise.reject(customError);
  }
);

// 인증 API
export const authAPI = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/api/auth/register', data);
    return response.data;
  },
};

// 게시글 API
export const postAPI = {
  getPosts: async (
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<PageResponse<PostListDTO>>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<PostListDTO>>>('/api/post', {
      params: { page, size },
    });
    return response.data;
  },

  getPost: async (id: number): Promise<ApiResponse<PostDetailDTO>> => {
    const response = await apiClient.get<ApiResponse<PostDetailDTO>>(`/api/post/${id}`);
    return response.data;
  },

  createPost: async (data: PostCreateDTO): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/api/post', data);
    return response.data;
  },

  updatePost: async (id: number, data: PostUpdateDTO): Promise<ApiResponse<void>> => {
    const response = await apiClient.patch<ApiResponse<void>>(`/api/post/${id}`, data);
    return response.data;
  },

  deletePost: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/post/${id}`);
    return response.data;
  },
};
