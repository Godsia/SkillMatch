// services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://84.252.142.65';
const ACCESS_TOKEN_KEY = 'auth_access_token';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== Token storage (module memory + SecureStore) =====
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  // Сохраняем в SecureStore асинхронно (не блокируем вызывающий код)
  if (token) {
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token).catch((err) =>
      console.warn('Не удалось сохранить токен в SecureStore:', err)
    );
  } else {
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY).catch((err) =>
      console.warn('Не удалось удалить токен из SecureStore:', err)
    );
  }
};

export const getAccessToken = (): string | null => accessToken;

// ===== Auth failure handler (e.g. навигация на экран логина) =====
type AuthFailureHandler = (reason: { status?: number; message?: string; code?: string }) => void;
let onAuthFailureHandler: AuthFailureHandler | null = null;
// Защита от шквала параллельных 401/403, которые иначе вызвали бы обработчик многократно
let isHandlingAuthFailure = false;

/**
 * Регистрирует глобальный обработчик ошибок авторизации.
 * Вызывается, когда сервер отвечает 401/403 или 400 с признаком отсутствия пользователя,
 * чтобы сбросить токен и отправить пользователя на экран логина.
 */
export const setOnAuthFailure = (handler: AuthFailureHandler | null) => {
  onAuthFailureHandler = handler;
};

/**
 * Возвращает true, если ошибка axios относится к проблемам авторизации,
 * при которых нужно отправить пользователя на экран логина.
 */
export const isAuthFailureError = (error: any): boolean => {
  const status = error?.response?.status;
  if (status === 401 || status === 403) return true;
  if (status === 400) {
    const data = error?.response?.data;
    const message = typeof data?.message === 'string' ? data.message : '';
    const code = typeof data?.code === 'string' ? data.code : '';
    if (/user\s*not\s*found/i.test(message)) return true;
    if (code === 'USER_NOT_FOUND') return true;
  }
  return false;
};

/**
 * Загружает токен из SecureStore в память. Вызывать при старте приложения.
 * @returns сохранённый токен или null
 */
export const loadTokenFromStorage = async (): Promise<string | null> => {
  try {
    const stored = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (stored) {
      accessToken = stored;
      return stored;
    }
  } catch (err) {
    console.warn('Не удалось загрузить токен из SecureStore:', err);
  }
  return null;
};

// ===== Debug helpers =====
const maskToken = (t?: string | null) => (t ? `${t.slice(0, 16)}...${t.slice(-10)}` : 'null');

const safeBase64UrlDecode = (input: string) => {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

  // RN usually has Buffer polyfilled. If not, you'll see an error and we can swap decoder.
  // @ts-ignore
  if (typeof Buffer !== 'undefined') {
    // @ts-ignore
    return Buffer.from(padded, 'base64').toString('utf8');
  }

  // @ts-ignore
  if (typeof atob !== 'undefined') {
    // @ts-ignore
    return atob(padded);
  }

  throw new Error('No base64 decoder available (Buffer/atob)');
};

const decodeJwtPayload = (jwt?: string | null) => {
  try {
    if (!jwt) return null;
    const parts = jwt.split('.');
    if (parts.length < 2) return null;
    const json = safeBase64UrlDecode(parts[1]);
    return JSON.parse(json);
  } catch (e: any) {
    return { _decodeError: String(e?.message || e) };
  }
};

// ===== Interceptor: ALWAYS attach Authorization from accessToken =====
apiClient.interceptors.request.use(
    (config) => {
      config.headers = config.headers ?? {};

      if (accessToken) {
        // Axios supports string header names; keep it consistent:
        // @ts-ignore
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      // ---- REQUEST LOGS ----
      const url = `${config.baseURL || ''}${config.url || ''}`;
      const method = (config.method || 'GET').toUpperCase();

      // @ts-ignore
      const authHeader = config.headers.Authorization as string | undefined;

      console.log('➡️ [API REQUEST]', method, url);
      console.log('   Authorization:', maskToken(authHeader ? authHeader.replace('Bearer ', '') : null));
      console.log('   accessToken(module):', maskToken(accessToken));
      console.log('   jwt payload:', decodeJwtPayload(accessToken));

      // show request body (already stringified sometimes)
      if (config.data !== undefined) {
        try {
          const body =
              typeof config.data === 'string' ? config.data : JSON.stringify(config.data, null, 2);
          console.log('   body:', body);
        } catch {
          console.log('   body: <unserializable>');
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
);

// ===== Interceptor: response logs =====
apiClient.interceptors.response.use(
    (res) => {
      const url = `${res.config.baseURL || ''}${res.config.url || ''}`;
      const method = (res.config.method || 'GET').toUpperCase();

      console.log('✅ [API RESPONSE]', res.status, method, url);
      console.log('   allow:', res.headers?.allow);

      let body = '';
      try {
        body =
          res.data === undefined || res.data === null
            ? ''
            : typeof res.data === 'string'
              ? res.data
              : JSON.stringify(res.data, null, 2);
      } catch {
        body = '<не удалось сериализовать>';
      }
      console.log('   response body:', body);

      return res;
    },
    (error) => {
      const cfg = error.config || {};
      const url = `${cfg.baseURL || ''}${cfg.url || ''}`;
      const method = (cfg.method || 'GET').toUpperCase();
      const status = error.response?.status;
      let dataStr = '';
      try {
        const d = error.response?.data;
        dataStr = d === undefined ? String(error.message || error) : typeof d === 'string' ? d : JSON.stringify(d, null, 2);
      } catch {
        dataStr = String(error.message || error);
      }

      console.log('❌ [API ERROR]', error.response?.status, method, url);
      console.log('   allow:', error.response?.headers?.allow);
      console.log('   www-authenticate:', error.response?.headers?.['www-authenticate']);
      console.log('   response data:', error.response?.data);
      // Полный ответ сервера при 4xx/5xx — часто там есть message или reason
      if (error.response?.status === 403) {
        console.log('   [403] full response headers:', JSON.stringify(error.response?.headers || {}));
        console.log('   [403] full response data:', JSON.stringify(error.response?.data));
      }
      console.log('   accessToken(module):', maskToken(accessToken));
      console.log('   jwt payload:', decodeJwtPayload(accessToken));

      console.log('   error body:', dataStr);

      // Глобальная обработка ошибок авторизации:
      // 401/403 или 400 с "User not found" означают, что текущая сессия не валидна —
      // сбрасываем токен и просим UI отправить пользователя на экран логина.
      if (isAuthFailureError(error)) {
        if (!isHandlingAuthFailure) {
          isHandlingAuthFailure = true;
          try {
            setAccessToken(null);
            const data = error.response?.data;
            onAuthFailureHandler?.({
              status,
              message: typeof data?.message === 'string' ? data.message : undefined,
              code: typeof data?.code === 'string' ? data.code : undefined,
            });
          } catch (e) {
            console.warn('onAuthFailureHandler выбросил ошибку:', e);
          } finally {
            // Сбрасываем флаг через тик, чтобы параллельные запросы не дёргали обработчик повторно
            setTimeout(() => {
              isHandlingAuthFailure = false;
            }, 0);
          }
        }
      }

      return Promise.reject(error);
    }
);

// ===== Types =====
export interface RegisterInitRequest {
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  email: string;
}

export interface RegisterInitResponse {
  accessToken: string;
  userStatus: string;
  message: string;
}

export interface VerifyEmailRequest {
  code: string;
}

export interface VerifyEmailResponse {
  userStatus: string;
}

export interface SetPasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface SetPasswordResponse {
  userStatus: string;
}

export interface SkillItem {
  skillId?: number;
  customSkill: string;
}

export interface SetSkillsRequest {
  skills: SkillItem[];
}

export interface SetPreferencesRequest {
  workFormats: string;
  employmentTypes: string;
  experienceLevel: string;
  salaryFrom: number;
  salaryTo: number;
  salaryPeriod: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  userStatus: string;
}

export interface PasswordResetInitRequest {
  email: string;
}

export interface PasswordResetInitResponse {
  accessToken: string;
  userStatus: string;
  message: string;
}

export interface PasswordResetVerifyRequest {
  code: string;
}

export interface PasswordResetVerifyResponse {
  userStatus: string;
}

export interface PasswordResetSetPasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface PasswordResetSetPasswordResponse {
  userStatus: string;
}

export interface Vacancy {
  id: number;
  source: string;
  sourceVacancyId: string;
  title: string;
  descriptionPlain: string;
  url: string;
  employerName: string;
  employerLogoUrl: string;
  areaName: string;
  publishedAt: string;
  salaryFrom: number;
  salaryTo: number;
  salaryCurrency: string;
  salaryGross: boolean;
  skills: string[];
  matchPercent: number;
  liked: boolean;
}

export interface UserPreferences {
  workFormats: string;
  employmentTypes: string;
  experienceLevel: string;
  salaryFrom: number;
  salaryTo: number;
  salaryPeriod: string;
}

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  status: string;
  skills: string[];
  preferences: UserPreferences;
}

// ===== API =====
export const authApi = {
  registerInit: async (data: RegisterInitRequest): Promise<RegisterInitResponse> => {
    const normalizedData: RegisterInitRequest = {
      ...data,
      // Бекенд ожидает enum в UPPER_SNAKE_CASE, а не "Male"/"Female"
      gender: typeof data.gender === 'string' ? data.gender.toUpperCase() : (data.gender as string),
    };

    const response = await apiClient.post<RegisterInitResponse>('/auth/register/init', normalizedData);
    if (response.data.accessToken) setAccessToken(response.data.accessToken);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
    const response = await apiClient.post<VerifyEmailResponse>('/auth/register/verify-email', data);
    return response.data;
  },

  setPassword: async (data: SetPasswordRequest): Promise<SetPasswordResponse> => {
    const response = await apiClient.post<SetPasswordResponse>('/auth/register/set-password', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    if (response.data.accessToken) setAccessToken(response.data.accessToken);
    return response.data;
  },

  passwordResetInit: async (data: PasswordResetInitRequest): Promise<PasswordResetInitResponse> => {
    const response = await apiClient.post<PasswordResetInitResponse>('/auth/password-reset/init', data);
    if (response.data.accessToken) setAccessToken(response.data.accessToken);
    return response.data;
  },

  passwordResetVerify: async (
    data: PasswordResetVerifyRequest
  ): Promise<PasswordResetVerifyResponse> => {
    const response = await apiClient.post<PasswordResetVerifyResponse>(
      '/auth/password-reset/verify',
      data
    );
    return response.data;
  },

  passwordResetSetPassword: async (
    data: PasswordResetSetPasswordRequest
  ): Promise<PasswordResetSetPasswordResponse> => {
    const response = await apiClient.post<PasswordResetSetPasswordResponse>(
      '/auth/password-reset/set-password',
      data
    );
    return response.data;
  },

  setSkills: async (data: SetSkillsRequest): Promise<void> => {
    if (!accessToken) throw new Error('accessToken не установлен. Пожалуйста, авторизуйтесь.');
    await apiClient.put('/profile/skills', data);
  },

  setPreferences: async (data: SetPreferencesRequest): Promise<void> => {
    if (!accessToken) throw new Error('accessToken не установлен. Пожалуйста, авторизуйтесь.');
    await apiClient.put('/profile/preferences', data);
  },

  getProfile: async (): Promise<UserProfile> => {
    if (!accessToken) throw new Error('accessToken не установлен. Пожалуйста, авторизуйтесь.');
    const response = await apiClient.get<UserProfile>('/profile/me');
    return response.data;
  },
};

export const vacanciesApi = {
  getMatches: async (): Promise<Vacancy[]> => {
    if (!accessToken) throw new Error('accessToken не установлен. Пожалуйста, авторизуйтесь.');
    const response = await apiClient.get<Vacancy[]>('/vacancies/matches');
    return response.data;
  },

  likeVacancy: async (vacancyId: number, liked: boolean = true): Promise<void> => {
    if (!accessToken) throw new Error('accessToken не установлен. Пожалуйста, авторизуйтесь.');
    await apiClient.post(`/vacancies/${vacancyId}/like`, { liked });
  },

  getLiked: async (): Promise<Vacancy[]> => {
    if (!accessToken) throw new Error('accessToken не установлен. Пожалуйста, авторизуйтесь.');
    const response = await apiClient.get<Vacancy[]>('/vacancies/liked');
    return response.data;
  },

  getDisliked: async (): Promise<Vacancy[]> => {
    if (!accessToken) throw new Error('accessToken не установлен. Пожалуйста, авторизуйтесь.');
    const response = await apiClient.get<Vacancy[]>('/vacancies/disliked');
    return response.data;
  },

  sendFeedback: async (
    vacancyId: number,
    data: { likedMatching: boolean; rating: number }
  ): Promise<void> => {
    if (!accessToken) throw new Error('accessToken не установлен. Пожалуйста, авторизуйтесь.');
    await apiClient.post(`/vacancies/${vacancyId}/feedback`, data);
  },
};

export { apiClient };