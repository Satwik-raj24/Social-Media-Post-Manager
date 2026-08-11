import { AuthUser } from '../types/auth';

export type { AuthUser };

export interface JwtPayload extends AuthUser {
  iat: number;
  exp: number;
}

const TOKEN_KEY = 'smms_jwt_token';

// UTF-8 / Base64 Encoding Helper
const base64Encode = (obj: object): string => {
  try {
    const jsonString = JSON.stringify(obj);
    return btoa(unescape(encodeURIComponent(jsonString)));
  } catch (err) {
    console.error('Failed to encode JWT component:', err);
    return '';
  }
};

// UTF-8 / Base64 Decoding Helper
const base64Decode = (str: string): any => {
  try {
    const jsonString = decodeURIComponent(escape(atob(str)));
    return JSON.parse(jsonString);
  } catch (err) {
    console.error('Failed to decode JWT payload:', err);
    return null;
  }
};

// Generate standard 3-part JWT token string with Role claim
export const generateMockJwt = (user: AuthUser, expiresInSeconds: number = 86400): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;

  const payload: JwtPayload = {
    ...user,
    iat,
    exp,
  };

  const encodedHeader = base64Encode(header);
  const encodedPayload = base64Encode(payload);
  const mockSignature = btoa(`mock_sig_${user.id}_${user.role}_${iat}`);

  return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
};

// Decode and validate JWT token
export const decodeJwt = (token: string): JwtPayload | null => {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const payload = base64Decode(parts[1]) as JwtPayload | null;
  if (!payload || !payload.exp) return null;

  // Check token expiration
  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (payload.exp < currentTimestamp) {
    console.warn('JWT token has expired.');
    return null;
  }

  return payload;
};

// LocalStorage Token Management
export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};
